<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Apps {
    use Singleton;

    protected $table;
    protected $keys_table;

    protected function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'partnership_apps';
        $this->keys_table = $wpdb->prefix . 'partnership_app_keys';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $apps_sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            issued_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            description TEXT,
            active TINYINT(1) DEFAULT 1,
            void_reason TEXT,
            PRIMARY KEY (id)
        ) $charset_collate;";
        $keys_sql = "CREATE TABLE IF NOT EXISTS {$this->keys_table} (
            id INT NOT NULL AUTO_INCREMENT,
            app_id INT NOT NULL,
            key_type ENUM('public','secret') NOT NULL,
            api_key VARCHAR(255) NOT NULL,
            created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expired_on DATETIME NOT NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($apps_sql);
        dbDelta($keys_sql);
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->keys_table}");
    }

    public function rest_api_init() {
        // Users thing.
        register_rest_route('sitecore/v1', '/apps/users', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_users'],
            'permission_callback' => '__return_true'
        ]);
        // Apps thing.
        register_rest_route('sitecore/v1', '/apps', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_apps'],
            'permission_callback' => '__return_true',
            'args' => [
                'page' => [
                    'description'       => 'Current page of the collection.',
                    'type'              => 'integer',
                    'default'           => 1,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) { return $param > 0; }
                ],
                'per_page' => [
                    'description'       => 'Number of items per page.',
                    'type'              => 'integer',
                    'default'           => 20,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) { return $param > 0 && $param <= 100; }
                ],
                'search' => [
                    'description'       => 'A search term for app description or void_reason.',
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'required'          => false,
                ],
                'active' => [
                    'description'       => 'Set to 1 for active, 0 for inactive, leave blank for all.',
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) { return in_array($param, [0,1], true); },
                    'required'          => false,
                ],
                'orderby' => [
                    'description'       => 'Field to order by.',
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'default'           => 'issued_on',
                    'validate_callback' => function($param) {
                        return in_array($param, ['id', 'user_id', 'issued_on', 'description', 'active', 'void_reason']);
                    },
                ],
                'order' => [
                    'description'       => 'Order direction (ASC or DESC).',
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'default'           => 'desc',
                    'validate_callback' => function($param) {
                        return in_array(strtoupper($param), ['ASC', 'DESC']);
                    },
                ],
            ],
        ]);
        register_rest_route('sitecore/v1', '/apps/(?P<app_id>\d+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_update_app'],
            'permission_callback' => '__return_true',
            'args' => [
                'app_id' => [
                    'type' => 'integer',
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
                'user_id' => [
                    'type' => 'integer',
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
                'description' => [
                    'type' => 'string',
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'active' => [
                    'type' => 'integer',
                    'required' => false,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) { return in_array($param, [0,1], true); }
                ],
                'void_reason' => [
                    'type' => 'string',
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
        register_rest_route('sitecore/v1', '/apps/(?P<app_id>\d+)', [
            'methods'  => 'DELETE',
            'callback' => [$this, 'api_delete_app'],
            'permission_callback' => '__return_true'
        ]);
        // App keys thing.
        register_rest_route('sitecore/v1', '/apps/(?P<app_id>\d+)/keys', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_app_keys'],
            'permission_callback' => '__return_true',
            'args' => [
                'app_id' => [
                    'description'       => 'ID of the application.',
                    'type'              => 'integer',
                    'required'          => true,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function($param) {
                        return $param > 0;
                    },
                ],
            ]
        ]);
        register_rest_route('sitecore/v1', '/apps/(?P<app_id>\d+)/keys/(?P<key_id>\d+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_update_key'],
            'permission_callback' => '__return_true',
            'args' => [
                'key_id' => [
                    'type' => 'integer',
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
                'app_id' => [
                    'type' => 'integer',
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
                'key_type' => [
                    'type' => 'string',
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function($param) { return in_array($param, ['public','secret']); },
                ],
                'api_key' => [
                    'type' => 'string',
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'expired_on' => [
                    'type' => 'string',
                    'required' => true,
                    // You should implement a proper date validation as needed
                ],
            ],
        ]);
        register_rest_route('sitecore/v1', '/apps/(?P<app_id>\d+)/keys/(?P<key_id>\d+)', [
            'methods'  => 'DELETE',
            'callback' => [$this, 'api_delete_key'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function settings($args) {
		$args['apps']		= [
			'title'							=> __('Apps', 'site-core'),
			'description'					=> __('Automation apps job for wordpress that will automate some common work flows on wordpress with browser extension.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'apps-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the apps registration and rest api activity.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
                [
					'id' 					=> 'apps-api-keys',
					'label'					=> __('Api keys', 'site-core'),
					'description'			=> __('API keys interface will be apear here...', 'site-core'),
					'type'					=> 'text',
					'default'				=> '',
					'attr'					=> [
						'data-config'		=> esc_attr(
							json_encode([
								'_nonce'		=> wp_create_nonce('_apps_settings_security'),
								'keys'          => []
							])
						),
					]
				],
			]
		];
        return $args;
    }
    
    public function api_get_users(WP_REST_Request $request) {
        $user_ids = get_users([
            // 'role' => 'subscriber',
            'fields' => 'ID',
        ]);
        $response_data = [];
        foreach ($user_ids as $user_id) {
            $response_data[] = [
                'id' => $user_id,
                'full_name' => trim(implode(' ', [get_user_meta($user_id, 'first_name', true), get_user_meta($user_id, 'last_name', true)]))
            ];
        }
        $response = rest_ensure_response($response_data);
        // $response->header('X-WP-Total', (int) $total_items);
        // $response->header('X-WP-TotalPages', (int) $total_pages);
        return $response;
    }
    
    // App elements
    public function api_get_apps(WP_REST_Request $request) {
        global $wpdb;
        $current_page = (int) $request->get_param('page') ?: 1;
        $per_page = (int) $request->get_param('per_page') ?: 20;
        $search = trim((string) $request->get_param('search') ?: '');
        $active = $request->get_param('active');
        $orderby = (string) $request->get_param('orderby') ?: 'issued_on';
        $order = (string) $request->get_param('order') ?: 'desc';
        $offset = ($current_page - 1) * $per_page;

        // Valid columns for sorting - keep safe!
        $valid_orderby = ['id', 'user_id', 'issued_on', 'description', 'active', 'void_reason'];
        $orderby_field = in_array($orderby, $valid_orderby) ? $orderby : 'issued_on';
        $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';

        $where = 'WHERE 1=1';
        $params = [];

        // Search on description and void_reason if set
        if ($search !== '') {
            $where .= " AND (description LIKE %s OR void_reason LIKE %s)";
            $params[] = '%' . $wpdb->esc_like($search) . '%';
            $params[] = '%' . $wpdb->esc_like($search) . '%';
        }

        // Active filter (0 or 1) if explicitly passed
        if ($active !== null && $active !== '') {
            $where .= " AND active = %d";
            $params[] = (int)$active;
        }

        // Get total items for pagination
        $total_items = $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(id) FROM $this->table $where", ...$params)
        );
        $total_pages = ceil($total_items / $per_page);

        // Main SELECT with pagination and sorting
        $sql = "SELECT * FROM $this->table $where ORDER BY $orderby_field $order LIMIT %d OFFSET %d";
        $params[] = $per_page;
        $params[] = $offset;
        $response_data = $wpdb->get_results($wpdb->prepare($sql, ...$params), ARRAY_A);

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $total_pages);
        return $response;
    }
    public function api_update_app(WP_REST_Request $request) {
        global $wpdb;
        $app_id = (int) $request->get_param('app_id');
        $user_id = (int) $request->get_param('user_id');
        $description = $request->get_param('description');
        $active = $request->get_param('active');
        $void_reason = $request->get_param('void_reason');
        $now = current_time('mysql');

        $data = [
            'user_id' => $user_id,
            'description' => $description,
            'void_reason' => $void_reason,
        ];
        if ($active !== null) $data['active'] = $active;

        // Remove nulls (or keep keys as you prefer)
        $data = array_filter($data, function($v) { return !is_null($v); });

        if ($app_id > 0) {
            // Update
            $updated = $wpdb->update(
                $this->table,
                $data,
                ['id' => $app_id]
            );
            return $updated !== false ? rest_ensure_response(['updated' => true, 'id' => $app_id]) : new WP_Error('update_failed', 'Failed to update App', ['status' => 500]);
        } else {
            // Insert
            $data['issued_on'] = $now;
            $inserted = $wpdb->insert($this->table, $data);
            return $inserted ? rest_ensure_response(['created' => true, 'id' => $wpdb->insert_id]) : new WP_Error('insert_failed', 'Failed to create App', ['status' => 500]);
        }
    }
    public function api_delete_app(WP_REST_Request $request) {
        global $wpdb;
        $app_id = (int) $request->get_param('app_id');

        $deleted = $wpdb->delete(
            $this->keys_table,
            ['id' => $app_id],
            ['%d']
        );
        return $deleted !== false ? rest_ensure_response(['deleted' => true, 'app_id' => $app_id, 'error' => $wpdb->last_error]) : new WP_Error('deletion_failed', 'Failed to delete Key', ['status' => 500]);
    }

    // API keys elements
    public function api_get_app_keys(WP_REST_Request $request) {
        global $wpdb;
        $app_id = (int) $request->get_param('app_id');
        if ($app_id <= 0) {return new WP_Error('app_not_found', 'App not found', ['status' => 404]);}
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $this->keys_table WHERE app_id = %d ORDER BY created_on DESC", $app_id
        ), ARRAY_A);
        return rest_ensure_response($results);
    }
    public function api_update_key(WP_REST_Request $request) {
        global $wpdb;
        $key_id = (int) $request->get_param('key_id');
        $app_id = (int) $request->get_param('app_id');
        $key_type = $request->get_param('key_type');
        $api_key = $request->get_param('api_key');
        $expired_on = $request->get_param('expired_on');
        $now = current_time('mysql');

        $data = [
            'app_id' => $app_id,
            'key_type' => $key_type,
            'api_key' => $api_key,
            'expired_on' => $expired_on,
        ];

        if ($key_id > 0) {
            // Update
            $updated = $wpdb->update(
                $this->keys_table,
                $data,
                ['id' => $key_id]
            );
            return $updated !== false ? rest_ensure_response(['updated' => true, 'id' => $key_id, 'error' => $wpdb->last_error]) : new WP_Error('update_failed', 'Failed to update Key', ['status' => 500]);
        } else {
            // Insert
            $data['created_on'] = $now;
            $inserted = $wpdb->insert($this->keys_table, $data);
            return $inserted ? rest_ensure_response(['created' => true, 'id' => $wpdb->insert_id, 'error' => $wpdb->last_error]) : new WP_Error('insert_failed', 'Failed to create Key', ['status' => 500]);
        }
    }
    public function api_delete_key(WP_REST_Request $request) {
        global $wpdb;
        $key_id = (int) $request->get_param('key_id');
        $app_id = (int) $request->get_param('app_id');

        $deleted = $wpdb->delete(
            $this->keys_table,
            ['id' => $key_id, 'app_id' => $app_id],
            ['%d', '%d']
        );
        return $deleted !== false ? rest_ensure_response(['deleted' => true, 'id' => $key_id, 'error' => $wpdb->last_error]) : new WP_Error('deletion_failed', 'Failed to delete Key', ['status' => 500]);
    }
    
}
