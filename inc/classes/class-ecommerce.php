<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

use WP_REST_Response;
use WP_REST_Request;
use WP_Error;


class Ecommerce {
    use Singleton;

    public $tables;
    protected $session_key = 'sitecore_ecom_visitorid';

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) [
            'sessions'     => $wpdb->prefix . 'sitecore_ecommerce_sessions',
            'carts'        => $wpdb->prefix . 'sitecore_ecommerce_carts',
            'cart_items'   => $wpdb->prefix . 'sitecore_ecommerce_cart_items',
            'orders'       => $wpdb->prefix . 'sitecore_ecommerce_orders',
            'order_items'  => $wpdb->prefix . 'sitecore_ecommerce_order_items',
            'order_meta'   => $wpdb->prefix . 'sitecore_ecommerce_order_meta',
            'products_meta' => $wpdb->prefix . 'sitecore_ecommerce_products_meta',
            'reco_events' => $wpdb->prefix . 'sitecore_ecommerce_reco_events',
            'reco_item_meta' => $wpdb->prefix . 'sitecore_ecommerce_reco_item_meta',
            'reco_item_sim' => $wpdb->prefix . 'sitecore_ecommerce_reco_item_sim',
            'reco_user_topn' => $wpdb->prefix . 'sitecore_ecommerce_reco_user_topn',
            'reco_user_interest' => $wpdb->prefix . 'sitecore_ecommerce_reco_user_interest',
            'reviews' => $wpdb->prefix . 'sitecore_ecommerce_reviews',
            'wishlist' => $wpdb->prefix . 'sitecore_ecommerce_wishlist',
            'variations' => $wpdb->prefix . 'sitecore_ecommerce_product_variations',
            'attributes' => $wpdb->prefix . 'sitecore_ecommerce_product_attributes',
            'attribute_items' => $wpdb->prefix . 'sitecore_ecommerce_product_attribute_items',
            'vars_atts_relations' => $wpdb->prefix . 'sitecore_ecommerce_product_vars_atts_relations',
        ];
        $this->setup_hooks();
        $this->init_session();
		add_action('plugins_loaded', [$this, 'load_addons']);
    }

    protected function setup_hooks() {
        add_action('save_post', [$this, 'save_meta_boxes']);
        add_filter('body_class', [$this, 'body_class'], 10, 2);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('rest_api_init', [$this, 'register_routes']);
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

            'variations' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id VARCHAR(255) UNIQUE NOT NULL,
                title TEXT NOT NULL,
                sku VARCHAR(255) DEFAULT '',
                description LONGTEXT DEFAULT '',
                price float default 0.00,
                sale_price float default 0.00,
                gallery LONGTEXT DEFAULT '',
                specifications LONGTEXT DEFAULT '',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            
            'attributes' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                label VARCHAR(255) UNIQUE NOT NULL,
                type VARCHAR(255) DEFAULT 'select',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            
            'attribute_items' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                attribute_id BIGINT(20) UNSIGNED DEFAULT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) UNIQUE NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",

            'vars_atts_relations' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                variation_id BIGINT(20) UNSIGNED DEFAULT NULL,
                attribute_id BIGINT(20) UNSIGNED DEFAULT NULL",
            
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
            'reviews' => "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
                product_id BIGINT UNSIGNED NOT NULL,
                customer_id BIGINT UNSIGNED NOT NULL,
                message MEDIUMTEXT NOT NULL,
                attachments JSON,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            'wishlist' => "id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                product_id BIGINT UNSIGNED NOT NULL,
                customer_id BIGINT UNSIGNED NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
        ];

        foreach ($tableSchemas as $tableKey => $schema) {
            $tableName = $this->tables->$tableKey;
            dbDelta("CREATE TABLE IF NOT EXISTS {$tableName} ({$schema}) $charset_collate;");
        }
    }

    public function register_deactivation_hook() {
        global $wpdb;
        foreach ((array) $this->tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$table}");
        }
    }

    public function register_routes() {
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_product'],
			'permission_callback' => '__return_true',
            'args' => [
                'data'      => ['required'    => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_metabox'],
			'permission_callback' => '__return_true',
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_product_metabox'],
			'permission_callback' => '__return_true',
            'args' => [
                'meta' => ['required'    => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/variations', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_variations'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required'    => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/variations/(?P<variation_id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_product_variation'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'variation_id' => ['required' => true],
                'variation_data' => ['required' => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/variations/(?P<variation_id>\d+)', [
			'methods'  => 'DELETE',
			'callback' => [$this, 'api_delete_product_variation'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'variation_id' => ['required' => true],
            ]
		]);
        /**
         * Attribute section
         */
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_attributes'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required'    => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes/(?P<attribute_id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_product_attribute'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'attribute_id' => ['required' => true],
                'attribute_data' => ['required' => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes/(?P<attribute_id>\d+)', [
			'methods'  => 'DELETE',
			'callback' => [$this, 'api_delete_product_attribute'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'attribute_id' => ['required' => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes/(?P<attribute_id>\d+)/items', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_attribute_items'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'attribute_id' => ['required' => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes/(?P<attribute_id>\d+)/items/(?P<item_id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_product_attribute_item'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'attribute_id' => ['required' => true],
                'item_id' => ['required' => true],
                'item_data' => ['required' => true],
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_id>\d+)/metabox/attributes/(?P<attribute_id>\d+)/items/(?P<item_id>\d+)', [
			'methods'  => 'DELETE',
			'callback' => [$this, 'api_delete_product_attribute_item'],
			'permission_callback' => '__return_true',
            'args' => [
                'product_id' => ['required' => true],
                'attribute_id' => ['required' => true],
                'item_id' => ['required' => true],
            ]
		]);
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

    
    public function add_meta_boxes() {
        add_meta_box('product_data', __('Product data', 'site-core'), [$this, 'metabox_callback'], 'sc_product', 'normal', 'default');
    }
    public function metabox_callback($post) {
        wp_enqueue_style('site-core');
        wp_enqueue_script('site-core');
        ?>
        <div class="xpo_flex xpo_flex-col xpo_gap-3">
            <!-- <fieldset>
                <div class="xpo_flex xpo_items-center xpo_gap-2">
                    <h3><?php esc_html_e('Product data', 'site-core'); ?></h3>
                </div>
            </fieldset> -->

            <div id="sc_product-metabox" data-product_id="<?php echo esc_attr($post->ID); ?>">
                This text should be disappeared within a seconds. if you see this yet, please contact developer.
            </div>
        </div>
        <?php
    }

    public function save_meta_boxes($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;
        if (!empty($_POST['sc_product-data'])) {
            // update_post_meta($post_id, 'sc_product-data', maybe_serialize($_POST['sc_product-data']) ?? '');
        }
    }

    public function api_update_product(WP_REST_Request $request) {
        $product_id = (int) $request->get_param('product_id') ?: 0;
        $product_data = $request->get_param('data') ?: null;

        if (!$product_data || !is_array($product_data)) {
            return new WP_Error('invalid_data', 'Product data is missing or invalid.', ['status' => 400]);
        }

        $product_instance = Ecommerce\Addons\Product::get_instance();

        // Prepare post data for wp_insert_post
        $post_data = [
            'post_type'   => 'product', // Assuming your product post type is 'product'
            'post_title'  => sanitize_text_field($product_data['title'] ?? ''),
            'post_content'=> wp_kses_post($product_data['description'] ?? ''),
            'post_excerpt'=> wp_kses_post($product_data['short_description'] ?? ''),
            'post_status' => 'publish',
        ];

        if ($product_id > 0) {
            // Update existing product
            $post_data['ID'] = $product_id;
            $updated_id = wp_insert_post($post_data);
            if (is_wp_error($updated_id)) {
                return new WP_Error('update_failed', 'Failed to update product.', ['status' => 500]);
            }
            $product_id = $updated_id;
        } else {
            // Insert new product
            $inserted_id = wp_insert_post($post_data);
            if (is_wp_error($inserted_id)) {
                return new WP_Error('insert_failed', 'Failed to insert product.', ['status' => 500]);
            }
            $product_id = $inserted_id;
        }

        // Update product meta
        // Clear existing meta keys that might be updated
        $meta_keys_to_clear = [
            'sku', 'price', 'sale_price', 'product_type', 'keywords', 'og_title', 'og_description', 'og_image',
            'shipping_vendors', 'shipping_warehouses', 'categories', 'images'
        ];
        foreach ($meta_keys_to_clear as $meta_key) {
            $product_instance->delete_product_meta($product_id, $meta_key);
        }

        // Add/update meta fields
        if (!empty($product_data['sku'])) {
            $product_instance->update_product_meta($product_id, 'sku', sanitize_text_field($product_data['sku']));
        }
        if (!empty($product_data['price'])) {
            $product_instance->update_product_meta($product_id, 'price', sanitize_text_field($product_data['price']));
        }
        if (isset($product_data['sale_price'])) {
            $product_instance->update_product_meta($product_id, 'sale_price', sanitize_text_field($product_data['sale_price']));
        }
        if (!empty($product_data['product_type'])) {
            $product_instance->update_product_meta($product_id, 'product_type', sanitize_text_field($product_data['product_type']));
        }
        if (!empty($product_data['keywords']) && is_array($product_data['keywords'])) {
            $keywords = array_map('sanitize_text_field', $product_data['keywords']);
            $product_instance->update_product_meta($product_id, 'keywords', $keywords);
        }
        if (!empty($product_data['og_title'])) {
            $product_instance->update_product_meta($product_id, 'og_title', sanitize_text_field($product_data['og_title']));
        }
        if (!empty($product_data['og_description'])) {
            $product_instance->update_product_meta($product_id, 'og_description', sanitize_text_field($product_data['og_description']));
        }
        if (!empty($product_data['og_image'])) {
            $product_instance->update_product_meta($product_id, 'og_image', esc_url_raw($product_data['og_image']));
        }
        if (!empty($product_data['shipping_vendors']) && is_array($product_data['shipping_vendors'])) {
            // Sanitize each vendor
            $vendors = array_map(function($vendor) {
                return [
                    'title' => sanitize_text_field($vendor['title'] ?? ''),
                    'url'   => esc_url_raw($vendor['url'] ?? ''),
                ];
            }, $product_data['shipping_vendors']);
            $product_instance->update_product_meta($product_id, 'shipping_vendors', $vendors);
        }
        if (!empty($product_data['shipping_warehouses']) && is_array($product_data['shipping_warehouses'])) {
            // Assuming warehouses are simple strings or arrays, sanitize accordingly
            $warehouses = array_map('sanitize_text_field', $product_data['shipping_warehouses']);
            $product_instance->update_product_meta($product_id, 'shipping_warehouses', $warehouses);
        }
        if (!empty($product_data['categories']) && is_array($product_data['categories'])) {
            $categories = array_map('sanitize_text_field', $product_data['categories']);
            $product_instance->update_product_meta($product_id, 'categories', $categories);
        }
        if (!empty($product_data['images']) && is_array($product_data['images'])) {
            $images = array_map('esc_url_raw', $product_data['images']);
            $product_instance->update_product_meta($product_id, 'images', $images);
        }

        // Handle variations
        if (!empty($product_data['variations']) && is_array($product_data['variations'])) {
            // Get existing variations
            $existing_variations = $product_instance->get_product_variations($product_id);
            $existing_variation_map = [];
            foreach ($existing_variations as $variation_post) {
                $existing_variation_map[$variation_post->post_title] = $variation_post->ID;
            }

            // Track variations to keep
            $variations_to_keep = [];

            foreach ($product_data['variations'] as $variation) {
                $variation_title = sanitize_text_field($variation['title'] ?? '');
                if (!$variation_title) {
                    continue; // Skip invalid variation
                }

                $variation_data = [
                    'title' => $variation_title,
                    'meta'  => [],
                ];

                // Prepare meta for variation
                if (!empty($variation['key'])) {
                    $variation_data['meta']['key'] = sanitize_text_field($variation['key']);
                }
                if (!empty($variation['sku'])) {
                    $variation_data['meta']['sku'] = sanitize_text_field($variation['sku']);
                }
                if (!empty($variation['description'])) {
                    $variation_data['meta']['description'] = wp_kses_post($variation['description']);
                }
                if (isset($variation['price'])) {
                    $variation_data['meta']['price'] = floatval($variation['price']);
                }
                if (array_key_exists('onsale_price', $variation)) {
                    $variation_data['meta']['onsale_price'] = is_null($variation['onsale_price']) ? null : floatval($variation['onsale_price']);
                }
                if (!empty($variation['gallery']) && is_array($variation['gallery'])) {
                    $variation_data['meta']['gallery'] = array_map('esc_url_raw', $variation['gallery']);
                }

                if (isset($existing_variation_map[$variation_title])) {
                    // Update existing variation
                    $variation_id = $existing_variation_map[$variation_title];
                    wp_update_post([
                        'ID' => $variation_id,
                        'post_title' => $variation_title,
                    ]);
                    // Delete old meta and update new meta
                    $old_meta = get_post_meta($variation_id);
                    foreach ($old_meta as $meta_key => $values) {
                        foreach ($values as $value) {
                            delete_post_meta($variation_id, $meta_key, $value);
                        }
                    }
                    if (!empty($variation_data['meta'])) {
                        foreach ($variation_data['meta'] as $key => $value) {
                            update_post_meta($variation_id, $key, $value);
                        }
                    }
                    $variations_to_keep[] = $variation_id;
                } else {
                    // Create new variation
                    $variation_id = $product_instance->create_product_variation($product_id, $variation_data);
                    if ($variation_id) {
                        $variations_to_keep[] = $variation_id;
                    }
                }
            }

            // Delete variations that are not in the new list
            foreach ($existing_variations as $existing_variation) {
                if (!in_array($existing_variation->ID, $variations_to_keep)) {
                    wp_delete_post($existing_variation->ID, true);
                }
            }
        }

        return rest_ensure_response([
            'success' => true,
            'product_id' => $product_id,
        ]);
    }

    
    public function api_get_product_metabox(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        if ($product_id) {
            $meta = Ecommerce\Addons\Product::get_instance()->get_product_meta($product_id, null, null);
            if ($meta) {
                return rest_ensure_response($meta);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_update_product_metabox(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $product_meta = $request->get_param('meta') ?: null;
        if ($product_id) {
            foreach ($product_meta as $meta_key => $meta_value) {
                Ecommerce\Addons\Product::get_instance()->update_product_meta($product_id, $meta_key, $meta_value);
            }
            return rest_ensure_response(['success' => true]);
        }
        return new WP_Error('invalid_request', 'Invalid post request.', ['status' => 400]);
    }
    
    public function api_get_product_variations(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        if ($product_id) {
            $variations = Ecommerce\Addons\Product::get_instance()->get_product_variations($product_id);
            if ($variations) {
                return rest_ensure_response($variations);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_update_product_variation(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $variation_id = $request->get_param('variation_id') ?: 0;
        $variation_data = $request->get_param('variation_data') ?: 0;
        if ($product_id) {
            $success = Ecommerce\Addons\Product::get_instance()->update_product_variation($product_id, $variation_id, $variation_data);
            if ($success) {
                return rest_ensure_response(empty($variation_id) ? ['id' => $success] : ['success' => $success]);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_delete_product_variation(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $variation_id = $request->get_param('variation_id') ?: 0;
        if ($product_id && $variation_id) {
            $deleted = Ecommerce\Addons\Product::get_instance()->delete_product_variation($variation_id);
            if ($deleted) {
                return rest_ensure_response(['deleted' => $deleted]);
            }
        }
        return rest_ensure_response([]);
    }
    
    public function api_get_product_attributes(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        if ($product_id) {
            $attributes = Ecommerce\Addons\Product::get_instance()->get_product_attributes($product_id);
            if ($attributes) {
                return rest_ensure_response($attributes);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_update_product_attribute(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $attribute_id = $request->get_param('attribute_id') ?: 0;
        $attribute_data = $request->get_param('attribute_data') ?: 0;
        if ($product_id) {
            $success = Ecommerce\Addons\Product::get_instance()->update_product_attribute($product_id, $attribute_id, $attribute_data);
            if ($success) {
                return rest_ensure_response(empty($attribute_id) ? ['id' => $success] : ['success' => $success]);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_delete_product_attribute(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $attribute_id = $request->get_param('attribute_id') ?: 0;
        if ($product_id && $attribute_id) {
            $deleted = Ecommerce\Addons\Product::get_instance()->delete_product_attribute($attribute_id);
            if ($deleted) {
                return rest_ensure_response(['deleted' => $deleted]);
            }
        }
        return rest_ensure_response([]);
    }

    public function api_update_product_attribute_item(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $attribute_id = $request->get_param('attribute_id') ?: 0;
        $item_id = $request->get_param('item_id') ?: 0;
        $item_data = $request->get_param('item_data') ?: 0;
        if ($product_id) {
            $success = Ecommerce\Addons\Product::get_instance()->update_product_attribute_item($product_id, $attribute_id, $item_id, $item_data);
            if ($success) {
                return rest_ensure_response(empty($attribute_id) ? ['id' => $success] : ['success' => $success]);
            }
        }
        return rest_ensure_response([]);
    }
    public function api_delete_product_attribute_item(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ?: 0;
        $attribute_id = $request->get_param('attribute_id') ?: 0;
        $item_id = $request->get_param('item_id') ?: 0;
        if ($product_id && $attribute_id) {
            $deleted = Ecommerce\Addons\Product::get_instance()->delete_product_attribute_item($item_id);
            if ($deleted) {
                return rest_ensure_response(['deleted' => $deleted]);
            }
        }
        return rest_ensure_response([]);
    }


    public function body_class($classes, $css_class) {
        return array_merge($classes, ['sc_store-front']);
    }
    
}
