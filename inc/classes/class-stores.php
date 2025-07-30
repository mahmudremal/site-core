<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Stores {
    use Singleton;

    protected $table;
    protected $meta_table;

    protected function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'sitecore_stores';
        $this->meta_table = $wpdb->prefix . 'sitecore_store_meta';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('sitecore/security/api/abilities', [$this, 'api_abilities'], 10, 3);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }
	public function register_routes() {
		register_rest_route('sitecore/v1', '/stores', [
			'methods' => 'GET',
			'callback' => [$this, 'api_list_store'],
            'args'     => [
                'page'     => [
                    'default'           => 1,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ($v) {return is_numeric($v);},
                    'description'       => __('Page number.', 'site-core')
                ],
                's'        => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                    'description'       => __('Search keyword.', 'site-core')
                ],
                'status'   => [
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                    'description'       => __('User status (e.g., pending, approved).', 'site-core')
                ],
                'per_page' => [
                    'default'           => 10,
                    'sanitize_callback' => 'absint',
                    'validate_callback' => function ($v) {return is_numeric($v);},
                    'description'       => __('Number of users per page.', 'site-core')
                ]
            ],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/store/create', [
			'methods' => 'POST',
			'callback' => [$this, 'api_create_store'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/store/(?P<store_id>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_store'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/store/(?P<store_id>[^/]+)', [
			'methods' => 'DELETE',
			'callback' => [$this, 'api_delete_store'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'store/')) {
            $abilities[] = 'stores';
        }
        return $abilities;
    }
    
    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql_store = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            store_type ENUM('live', 'dev') NOT NULL DEFAULT 'live',
            store_email TEXT DEFAULT NULL,
            store_title TEXT DEFAULT NULL,
            store_url TEXT DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_id (id)
        ) $charset_collate;";

        $sql_metas = "CREATE TABLE IF NOT EXISTS {$this->meta_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            store_id BIGINT(20) NOT NULL,
            meta_key VARCHAR(255) NOT NULL,
            meta_value TEXT NOT NULL DEFAULT '',
            PRIMARY KEY (id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_store);
        dbDelta($sql_metas);

    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->meta_table}");
    }

    public function api_list_store(WP_REST_Request $request) {
        global $wpdb;
        $page     = absint($request->get_param('page')) ?: 1;
        $search   = sanitize_text_field($request->get_param('s'));
        $status   = sanitize_text_field($request->get_param('status'));
        $per_page = absint($request->get_param('per_page')) ?: 10;
        $offset   = ($page - 1) * $per_page;
    
        $table_name = $this->table;
        $where      = 'WHERE 1=1';
        $search_query = '';
    
        if (!empty($search)) {
            $search_term   = '%' . $wpdb->esc_like($search) . '%';
            $search_query  .= $wpdb->prepare(' AND (store_title LIKE %s OR client_email LIKE %s)', $search_term, $search_term);
        }
    
        if (!empty($status) && $status !== 'any') {
            $where .= $wpdb->prepare(' AND status = %s', $status);
        }
    
        $query = $wpdb->prepare("
            SELECT *
            FROM {$table_name}
            {$where}
            {$search_query}
            ORDER BY created_at DESC
            LIMIT %d OFFSET %d
        ", $per_page, $offset);
    
        $stores = $wpdb->get_results($query);
    
        $total_query = "
            SELECT COUNT(id)
            FROM {$table_name}
            {$where}
            {$search_query}
        ";
        $total_stores = $wpdb->get_var($total_query);
        $max_pages      = ceil($total_stores / $per_page);
    
        foreach ($stores as $index => $store) {
            // $stores[$index]->created_at = strtotime($stores[$index]->created_at);
            // $stores[$index]->updated_at = strtotime($stores[$index]->updated_at);
        }
        
        $response_data = $stores;
    
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_stores);
        $response->header('X-WP-TotalPages', (int) $max_pages);
    
        return $response;
    }
	public function api_create_store(WP_REST_Request $request) {
        $payload = [
            'id' => $request->get_param('id'),
            'store_title' => $request->get_param('store_title'),
            'store_url' => $request->get_param('store_url'),
            'store_type' => $request->get_param('store_type'),
            'store_email' => $request->get_param('store_email'),
            
            'metadata' => (array) $request->get_param('metadata')
        ];
        
        $store_id = $this->create_store($payload);
        $response = is_wp_error($store_id) ? $store_id : $this->get_store($store_id);
		return rest_ensure_response($response);
	}
	public function api_get_store(WP_REST_Request $request) {
		$store_id = $request->get_param('store_id');
        // 
        $response = $this->get_store($store_id, true);
        // 
		return rest_ensure_response($response);
	}
	public function api_delete_store(WP_REST_Request $request) {
        global $wpdb;
		$store_id = $request->get_param('store_id');
        // 
        $_deleted = $wpdb->delete(
            $this->table,
            ['id' => (int) $store_id],
            ['%d']
        );
        // 
		return rest_ensure_response(['status' => $_deleted]);
	}

    public function create_store($payload) {
        global $wpdb;

        $id          = isset($payload['id']) ? intval($payload['id']) : 0;
        $store_title = sanitize_text_field($payload['store_title'] ?? '');
        $store_url   = esc_url_raw($payload['store_url'] ?? '');
        $store_type  = in_array($payload['store_type'], ['live', 'dev']) ? $payload['store_type'] : 'live';
        $store_email = sanitize_email($payload['store_email'] ?? '');
        $metadata    = isset($payload['metadata']) && is_array($payload['metadata']) ? $payload['metadata'] : [];

        $data = [
            'store_title' => $store_title,
            'store_url'   => $store_url,
            'store_type'  => $store_type,
            'store_email' => $store_email,
            'updated_at'  => current_time('mysql', 1),
        ];

        if ($id <= 0) {
            // Create new store
            $data['created_at'] = current_time('mysql', 1);
            $result = $wpdb->insert($this->table, $data);
            if ($result === false) {
                return new WP_Error('db_insert_error', 'Failed to insert store.', $wpdb->last_error);
            }
            $store_id = $wpdb->insert_id;
        } else {
            // Update existing store
            $result = $wpdb->update(
                $this->table,
                $data,
                ['id' => $id],
                null,
                ['%d']
            );
            if ($result === false) {
                return new WP_Error('db_update_error', 'Failed to update store.', $wpdb->last_error);
            }
            $store_id = $id;
        }

        // Handle metadata
        foreach ($metadata as $key => $value) {
            $existing = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$this->meta_table} WHERE store_id = %d AND meta_key = %s",
                $store_id,
                $key
            ));

            if ($existing) {
                // Update existing meta
                $wpdb->update(
                    $this->meta_table,
                    ['meta_value' => maybe_serialize($value)],
                    ['id' => $existing]
                );
            } else {
                // Insert new meta
                $wpdb->insert(
                    $this->meta_table,
                    [
                        'store_id'   => $store_id,
                        'meta_key'   => $key,
                        'meta_value' => maybe_serialize($value),
                    ]
                );
            }
        }

        return $store_id;
    }

    public function get_store($store_id, $withMeta = false) {
        global $wpdb;

        $store_id = intval($store_id);
        if ($store_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid store ID.');
        }

        $store = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->table} WHERE id = %d", $store_id),
            ARRAY_A
        );

        if (!$store) {
            return new WP_Error('store_not_found', 'Store not found.');
        }

        if ($withMeta) {
            $store['metadata'] = $this->get_store_meta($store_id);
        }

        return $store;
    }


    public function update_store_meta($store_id, $meta_key, $meta_value) {
        global $wpdb;
        $store_id = (int) $store_id;
        $meta_key = sanitize_key($meta_key);
        $meta_value = wp_kses_post($meta_value);
    
        $existing_meta = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$this->meta_table} WHERE store_id = %d AND meta_key = %s",
            $store_id, $meta_key
        ));
    
        if ($existing_meta !== null) {
            $result = $wpdb->update(
                $this->meta_table,
                ['meta_value' => $meta_value],
                ['store_id' => $store_id, 'meta_key' => $meta_key]
            );
        } else {
            $result = $wpdb->insert(
                $this->meta_table,
                [
                    'store_id' => $store_id,
                    'meta_key'   => $meta_key,
                    'meta_value' => $meta_value,
                ]
            );
        }
    
        return $result !== false;
    }

    public function get_store_meta($store_id, $meta_key = null) {
        global $wpdb;
        $store_id = (int) $store_id;
    
        if ($meta_key === null) {
            $metas = $wpdb->get_results($wpdb->prepare(
                "SELECT meta_key, meta_value FROM {$this->meta_table} WHERE store_id = %d",
                $store_id
            ), ARRAY_A);

            return array_reduce($metas, function($carry, $meta) {$carry[$meta['meta_key']] = $meta['meta_value'];return $carry;}, []);
            
            return $metas;
        } else {
            $meta_key = sanitize_key($meta_key);
            $meta_value = $wpdb->get_var($wpdb->prepare(
                "SELECT meta_value FROM {$this->meta_table} WHERE store_id = %d AND meta_key = %s",
                $store_id, $meta_key
            ));
            return $meta_value !== null ? $meta_value : null;
        }
    }


}
