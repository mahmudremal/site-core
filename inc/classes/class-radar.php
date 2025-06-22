<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Radar {
    use Singleton;

    protected $table;

    protected function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'partnership_radars';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'radars/')) {
            $abilities[] = 'radars';
        }
        return $abilities;
    }

    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/radars', [
            'methods' => 'GET', 'callback' => [$this, 'radars_list'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT NOT NULL AUTO_INCREMENT,
            radar_type VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            radar_object LONGTEXT NOT NULL,
            radar_submission LONGTEXT NOT NULL,
            radar_desc TEXT,
            PRIMARY KEY (id)
        ) $charset_collate;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->table}");
    }

    
    public function settings($args) {
		$args['radar']		= [
			'title'							=> __('Radar', 'site-core'),
			'description'					=> __('Automation radar headless server from wordpress.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'radar-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the radar functionality and activity.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
                [
					'id' 					=> 'radar-interface',
					'label'					=> __('Interface', 'site-core'),
					'description'			=> __('A radar interface will be apear here shortly.', 'site-core'),
					'type'					=> 'text',
					'default'				=> '',
					'attr'					=> [
                        'data-config'		=> esc_attr(json_encode([])),
					]
				],
			]
		];
        return $args;
    }

    public function radars_list(WP_REST_Request $request) {
        global $wpdb;
        $current_page = (int) $request->get_param('page')??1;
        $per_page = (int) $request->get_param('per_page')??20;
        $search = (string) $request->get_param('search')??''; // also implement this seach if not empty use this keyword to search.
        $status = (string) $request->get_param('status')??'pending';
        $radar_type = (string) $request->get_param('radar_type')??'all';
        $orderby = (string) $request->get_param('orderby')??'id';
        $order = (string) $request->get_param('order')??'desc';
        $offset = ($current_page - 1) * $per_page;

        $where = 'WHERE 1=1';
        $order_by = 'ORDER BY created_at DESC';

        if ($status !== 'all') {
            $status = sanitize_text_field($status);
            $where .= $wpdb->prepare(' AND status = %s', $status);
        }

        if (isset($radar_type) && $radar_type !== 'all') {
            $radar_type = sanitize_text_field($radar_type);
            $where .= $wpdb->prepare(' AND radar_type = %s', $radar_type);
        }

        if (isset($orderby) && in_array($orderby, ['id', 'radar_type', 'status', 'created_at', 'updated_at'])) {
            $order_by_field = sanitize_text_field($orderby);
            $order = isset($order) && in_array(strtoupper($order), ['ASC', 'DESC']) ? strtoupper($order) : 'DESC';
            $order_by = "ORDER BY {$order_by_field} {$order}";
        }

        $total_items = $wpdb->get_var("SELECT COUNT(id) FROM {$this->table} {$where}");
        $total_pages = ceil($total_items / $per_page);

        $response_data = $wpdb->get_results("SELECT * FROM {$this->table} {$where} {$order_by} LIMIT {$per_page} OFFSET {$offset}", ARRAY_A);

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $total_pages);
        return $response;
    }

}



