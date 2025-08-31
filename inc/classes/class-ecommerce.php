<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Ecommerce {
    use Singleton;

    public $tables;
    protected $session_key = 'sitecore_ecom_visitorid';

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) [
            'sessions'     => $wpdb->prefix . 'sitecore_sessions',
            'carts'        => $wpdb->prefix . 'sitecore_carts',
            'cart_items'   => $wpdb->prefix . 'sitecore_cart_items',
            'orders'       => $wpdb->prefix . 'sitecore_orders',
            'order_items'  => $wpdb->prefix . 'sitecore_order_items',
            'order_meta'   => $wpdb->prefix . 'sitecore_order_meta',
            'products_meta' => $wpdb->prefix . 'sitecore_products_meta',
            'reco_events' => $wpdb->prefix . 'reco_events',
            'reco_item_meta' => $wpdb->prefix . 'reco_item_meta',
            'reco_item_sim' => $wpdb->prefix . 'reco_item_sim',
            'reco_user_topn' => $wpdb->prefix . 'reco_user_topn',
            'reco_user_interest' => $wpdb->prefix . 'reco_user_interest',
        ];
        $this->setup_hooks();
        $this->init_session();
		add_action('plugins_loaded', [$this, 'load_addons']);
    }

    protected function setup_hooks() {
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

	public function load_addons() {
        $addon_loader_file = WP_SITECORE_DIR_PATH . '/inc/widgets/ecommerce/index.php';
        if (file_exists($addon_loader_file)) {
            require_once $addon_loader_file;
			Ecommerce\Addons::get_instance();
        }
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $tableSchemas = [
            'sessions' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                session_key VARCHAR(255) UNIQUE NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                location VARCHAR(255) DEFAULT '',
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            
            'carts' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                session_id BIGINT(20) UNSIGNED NOT NULL,
                user_id BIGINT(20) UNSIGNED DEFAULT NULL,
                status ENUM('active', 'abandoned', 'converted') DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX session_idx (session_id),
                INDEX user_idx (user_id)",
            
            'cart_items' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                cart_id BIGINT(20) UNSIGNED NOT NULL,
                product_id BIGINT(20) UNSIGNED NOT NULL,
                variation_id BIGINT(20) UNSIGNED DEFAULT NULL,
                quantity INT(11) NOT NULL DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                meta_data LONGTEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX cart_idx (cart_id),
                INDEX product_idx (product_id)",
            
            'orders' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                user_id BIGINT(20) UNSIGNED DEFAULT NULL,
                session_id BIGINT(20) UNSIGNED DEFAULT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
                payment_method VARCHAR(50),
                subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                currency VARCHAR(3) DEFAULT 'USD',
                billing_data LONGTEXT,
                shipping_data LONGTEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX order_number_idx (order_number),
                INDEX user_idx (user_id),
                INDEX status_idx (status)",
            
            'order_items' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT(20) UNSIGNED NOT NULL,
                product_id BIGINT(20) UNSIGNED NOT NULL,
                variation_id BIGINT(20) UNSIGNED DEFAULT NULL,
                product_name VARCHAR(255) NOT NULL,
                product_sku VARCHAR(100),
                quantity INT(11) NOT NULL DEFAULT 1,
                price DECIMAL(10,2) NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                meta_data LONGTEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX order_idx (order_id),
                INDEX product_idx (product_id)",
            
            'order_meta' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                order_id BIGINT(20) UNSIGNED NOT NULL,
                meta_key VARCHAR(255) NOT NULL,
                meta_value LONGTEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX order_idx (order_id),
                INDEX meta_key_idx (meta_key)",
            
            'products_meta' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id BIGINT(20) UNSIGNED NOT NULL,
                meta_key VARCHAR(255) NOT NULL,
                meta_value LONGTEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX product_idx (product_id),
                INDEX meta_key_idx (meta_key)",
            
            'reco_events' => "id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                occurred_at DATETIME NOT NULL,
                session_id CHAR(36) NOT NULL,
                user_key VARCHAR(36) NOT NULL,
                user_id BIGINT UNSIGNED NULL,
                event_type VARCHAR(32) NOT NULL,
                item_id BIGINT UNSIGNED NULL,
                category_id BIGINT UNSIGNED NULL,
                meta JSON NULL,
                ip VARCHAR(100) NULL,
                ua VARCHAR(255) NULL,
                KEY k_user_time (user_key, occurred_at),
                KEY k_item_time (item_id, occurred_at),
                KEY k_type_time (event_type, occurred_at),
                KEY k_session (session_id)",

            'reco_item_meta' => "item_id BIGINT UNSIGNED PRIMARY KEY,
                title VARCHAR(255), brand VARCHAR(128),
                categories JSON, tags JSON, price DECIMAL(10,2),
                availability TINYINT, created_at DATETIME,
                updated_at DATETIME",

            'reco_item_sim' => "item_id BIGINT UNSIGNED NOT NULL,
                sim_item_id BIGINT UNSIGNED NOT NULL,
                score FLOAT NOT NULL,
                PRIMARY KEY (item_id, sim_item_id),
                KEY k_simitem (sim_item_id)",

            'reco_user_topn' => "user_key VARCHAR(36) NOT NULL,
                item_id BIGINT UNSIGNED NOT NULL,
                score FLOAT NOT NULL,
                PRIMARY KEY (user_key, item_id)",

            'reco_user_interest' => "user_key VARCHAR(36) NOT NULL,
                taxonomy VARCHAR(32) NOT NULL,
                term_id BIGINT UNSIGNED NOT NULL,
                weight FLOAT NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (user_key, taxonomy, term_id),
                KEY k_user (user_key)",
        ];

        foreach ($tableSchemas as $tableKey => $schema) {
            $tableName = $this->tables->$tableKey;
            dbDelta("CREATE TABLE IF NOT EXISTS {$tableName} ({$schema}) $charset_collate;");
        }
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $tables_to_drop = [
            $this->tables->sessions,
            $this->tables->carts,
            $this->tables->cart_items,
            $this->tables->orders,
            $this->tables->order_items,
            $this->tables->order_meta,
            $this->tables->products_meta,
            $this->tables->reco_events,
            $this->tables->reco_item_meta,
            $this->tables->reco_item_sim,
            $this->tables->reco_user_topn,
            $this->tables->reco_user_interest,
        ];
        foreach ($tables_to_drop as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$table}");
        }
    }

    protected function init_session() {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            session_start();
        }
        
        if (!isset($_SESSION[$this->session_key])) {
            $_SESSION[$this->session_key] = $this->generate_session_id();
            $this->create_session_record();
        }
    }

    protected function generate_session_id() {
        return 'sc_' . uniqid() . '_' . time();
    }

    protected function create_session_record() {
        global $wpdb;
        $wpdb->insert($this->tables->sessions, [
            'session_key' => $_SESSION[$this->session_key],
            'ip_address' => $this->get_client_ip(),
            'location' => $this->get_location(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        ]);
    }

    public function get_client_ip() {
        $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        return isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    }

    protected function get_location() {
        return 'Bangladesh';
    }

    public function get_session_id() {
        global $wpdb;
        if(!isset($_SESSION[$this->session_key])) {
            return null;
        }
        return $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$this->tables->sessions} WHERE session_key = %s",
            $_SESSION[$this->session_key]
        ));
    }

    public function get_tables() {
        return $this->tables;
    }
}
