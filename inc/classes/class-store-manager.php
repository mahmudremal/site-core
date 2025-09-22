<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;
use WP_Query;

class Store_Manager {
    use Singleton;

    protected $tables;

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) [
			'vendors'  => $wpdb->prefix . 'sitecore_store_vendors',
			'warehouse' => $wpdb->prefix . 'sitecore_store_vendor_warehouse',
			'productat' => $wpdb->prefix . 'sitecore_store_productat',
			'notifications' => $wpdb->prefix . 'sitecore_store_notifications',
		];
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 10, 1);
		register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
        add_action('woocommerce_order_status_processing', [$this, 'handle_order_processing'], 10, 1);
    }

    public function register_activation_hook() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset_collate = $wpdb->get_charset_collate();
        $tables = [
            'vendors' => "
                id BIGINT NOT NULL AUTO_INCREMENT,
                business_name VARCHAR(255) NOT NULL,
                business_website TEXT DEFAULT NULL,
                business_socials JSON NOT NULL DEFAULT (JSON_OBJECT()),
                business_number VARCHAR(50) DEFAULT NULL,
                business_email VARCHAR(50) DEFAULT NULL,
                whatsapp_number VARCHAR(50) DEFAULT NULL,
                penalty_score INT NOT NULL DEFAULT 0,
                issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ",
            'warehouse' => "
                id BIGINT NOT NULL AUTO_INCREMENT,
                vendor_id BIGINT NOT NULL,
                warehouse_title TEXT DEFAULT NULL,
                address TEXT DEFAULT NULL,
                latlon VARCHAR(100) DEFAULT NULL,
                district VARCHAR(100) DEFAULT NULL,
                contact_number VARCHAR(50) DEFAULT NULL,
                whatsapp_number VARCHAR(50) DEFAULT NULL,
                penalty_score INT NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            ",
            'productat' => "
                id BIGINT NOT NULL AUTO_INCREMENT,
                product_id BIGINT NOT NULL,
                warehouse_id BIGINT NOT NULL,
                quantity FLOAT NOT NULL,
                penalty_score INT NOT NULL DEFAULT 0,
                PRIMARY KEY (id)
            ",
            'notifications' => "
                id BIGINT NOT NULL AUTO_INCREMENT,
                subject TEXT NOT NULL,
                receiver TEXT NOT NULL,
                platform ENUM('email', 'sms', 'print', 'appnoti', 'webnoti', 'call', 'whatsapp', 'messenger') NOT NULL DEFAULT 'email',
                message LONGTEXT NOT NULL DEFAULT '',
                seen BOOLEAN DEFAULT 0,
                issued_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                seen_at TIMESTAMP NULL DEFAULT NULL,
                PRIMARY KEY (id)
            ",
        ];
        foreach ((array) $this->tables as $_tableKey => $_tableName) {
            dbDelta("CREATE TABLE IF NOT EXISTS {$_tableName} ({$tables[$_tableKey]}) $charset_collate;");
        }
    }

    public function register_deactivation_hook() {
        global $wpdb;
        foreach ((array) $this->tables as $_tableKey => $_tableName) {
            $wpdb->query("DROP TABLE IF EXISTS {$_tableName}");
        }
    }
    
    public function register_routes() {
        // Activities REST API Routes
        register_rest_route('sitecore/v1', '/storemanager/vendors', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_list_vendors'],
            'permission_callback' => '__return_true',
            'args'                => [],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_vendor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID for fetching details.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_update_vendor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID for updating details. If vendor ID is 0, create a new vendor.', 'site-core'),
                    'required'          => true,
                ],
                'business_name' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Business name of the vendor.', 'site-core'),
                    'required'          => true,
                ],
                'business_website' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Business website URL.', 'site-core'),
                    'required'          => false,
                ],
                'business_socials' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Business social media links in JSON format.', 'site-core'),
                    'required'          => false,
                ],
                'business_number' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Primary contact number.', 'site-core'),
                    'required'          => false,
                ],
                'business_email' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Primary contact email.', 'site-core'),
                    'required'          => false,
                ],
                'whatsapp_number' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('WhatsApp contact number.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_delete_vendor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID for deletion.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/warehouses', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_list_vendor_warehouses'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/warehouses/(?P<warehouse_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_vendor_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/warehouses/(?P<warehouse_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_update_vendor_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID. If warehouse ID is 0, create a new warehouse.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_title' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Warehouse title.', 'site-core'),
                    'required'          => true,
                ],
                'address' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Address of the warehouse.', 'site-core'),
                    'required'          => true,
                ],
                'latlon' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Latitude and longitude of the warehouse.', 'site-core'),
                    'required'          => false,
                ],
                'district' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('District of the warehouse.', 'site-core'),
                    'required'          => false,
                ],
                'contact_number' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Contact number for the warehouse.', 'site-core'),
                    'required'          => false,
                ],
                'whatsapp_number' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('WhatsApp contact number for the warehouse.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);
        
        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/warehouses/(?P<warehouse_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_delete_vendor_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/products', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_list_warehouse_products'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
                'search' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Search string.', 'site-core'),
                    'required'          => false,
                ],
                'per_page' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Show result per page.', 'site-core'),
                    'required'          => true,
                ],
                'page' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Current page number.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/vendors/(?P<vendor_id>\d+)/warehouses/(?P<warehouse_id>\d+)/products', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_list_warehouse_products'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID.', 'site-core'),
                    'required'          => true,
                ],
                'search' => [
                    'validate_callback' => function($param) { return is_string($param); },
                    'description'       => __('Search string.', 'site-core'),
                    'required'          => false,
                ],
                'per_page' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Show result per page.', 'site-core'),
                    'required'          => true,
                ],
                'page' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Current page number.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/product/warehouse/(?P<product_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_product_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'product_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Product ID for fetching warehouses.', 'site-core'),
                    'required'          => true,
                ],
                'exclude__ids' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Product IDs to exclude.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/product/warehouse/(?P<warehouse_id>\d+)/(?P<product_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_update_product_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID for adding a product.', 'site-core'),
                    'required'          => true,
                ],
                'product_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Product ID for adding to warehouse.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/product/warehouse/(?P<warehouse_id>\d+)/(?P<product_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_remove_product_warehouse'],
            'permission_callback' => '__return_true',
            'args'                => [
                'warehouse_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID removing a product.', 'site-core'),
                    'required'          => true,
                ],
                'product_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Product ID for removing from warehouse.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/product/vendor/(?P<vendor_id>\d+)/(?P<product_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_remove_product_vendor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Warehouse ID for adding a product.', 'site-core'),
                    'required'          => true,
                ],
                'product_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Product ID for removing from vendor.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/autocomplete/(?P<autocomplete>products|warehouses)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_storemanager_autocomplete'],
            'permission_callback' => '__return_true',
            'args'                => [
                'autocomplete' => [
                    'validate_callback' => function($param) { 
                        return in_array($param, ['products', 'warehouses'], true);
                    },
                    'description'       => __('Search on the table name.', 'site-core'),
                    'required'          => true,
                ],
                'vendor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Vendor ID to search for.', 'site-core'),
                    'required'          => true,
                ],
                'warehouse_id' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Warehouse id if search for.', 'site-core'),
                    'required'          => false,
                ],
                'search' => [
                    'validate_callback' => function($param) { return true; },
                    'description'       => __('Search term for.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/storemanager/notification', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_send_notification'],
            'permission_callback' => '__return_true',
            'args'                => [
                'subject' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Subject of the notification.', 'site-core'),
                    'required'          => true,
                ],
                'receiver' => [
                    'validate_callback' => function($param) { return is_email($param); },
                    'description'       => __('Email address of the receiver.', 'site-core'),
                    'required'          => true,
                ],
                'platform' => [
                    'validate_callback' => function($param) { return in_array($param, ['email', 'sms', 'print', 'appnoti', 'webnoti', 'call', 'whatsapp', 'messenger']); },
                    'description'       => __('Platform for sending the notification.', 'site-core'),
                    'required'          => true,
                ],
                'message' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Message content of the notification.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);



    }
    
    public function add_menu_page() {
        add_menu_page(
            __('Shop Manager', 'site-core'),
            __('Shop Manager', 'site-core'),
            'manage_options',
            'store-manager',
            [$this, 'shop_manager_admin_menu_page'],
            'dashicons-pets'
        );
    }

    public function shop_manager_admin_menu_page() {
        ?>
        <div class="wrap" id="automated_store-manager" data-config="{}"></div>
        <?php
    }

    public function admin_enqueue_scripts($curr_page) {
        if ($curr_page !== 'toplevel_page_store-manager') {return;}
        wp_enqueue_script('site-core');
        wp_enqueue_style('site-core');
    }

    
    public function settings($args) {
        $args['storemanager'] = [
            'title' => __('Store Manager', 'site-core'),
			'description'					=> __('Store manager configuration file.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'storemanager-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Mark to disable storemanager on the site or make it pause.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
        ];
        return $args;
    }

    public function api_list_vendors(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $page = max(1, (int) $request->get_param('page'));
        $perPage = max(1, (int) $request->get_param('perPage'));
        $search = trim((string) $request->get_param('q'));
        $include_ids = array_filter(array_map('intval', (array) $request->get_param('include_ids')));

        $offset = ($page - 1) * $perPage;

        $where_clauses = ['1=1'];
        $params = [];

        if (!empty($search)) {
            $where_clauses[] = "(business_name LIKE %s OR business_website LIKE %s)";
            $search_like = '%' . $wpdb->esc_like($search) . '%';
            $params[] = $search_like;
            $params[] = $search_like;
        }

        $where_sql = implode(' AND ', $where_clauses);

        $include_sql = '';
        if (!empty($include_ids)) {
            $placeholders = implode(',', array_fill(0, count($include_ids), '%d'));
            $include_sql = " OR id IN ($placeholders)";
        }

        $sql = "SELECT * FROM {$this->tables->vendors} WHERE ($where_sql $include_sql)";

        $all_params = $params;
        if (!empty($include_ids)) {
            $all_params = array_merge($all_params, $include_ids);
        }

        $sql = $wpdb->prepare($sql, ...$all_params);

        $sql .= " ORDER BY id ASC LIMIT %d OFFSET %d";
        $sql = $wpdb->prepare($sql, $perPage, $offset);

        $vendors = $wpdb->get_results($sql, ARRAY_A);
        $count_sql = "SELECT COUNT(*) FROM {$this->tables->vendors} WHERE ($where_sql $include_sql)";
        $count_sql = $wpdb->prepare($count_sql, ...$all_params);
        $total_items = (int) $wpdb->get_var($count_sql);

        $total_pages = (int) ceil($total_items / $perPage);

        $response_data = ['success' => true, 'data' => $vendors];

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }


    public function api_get_vendor(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        global $wpdb;

        $vendor = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->tables->vendors} WHERE id = %d", $vendor_id),
            ARRAY_A
        );

        if (empty($vendor)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Vendor not found.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true, 'data' => $vendor
        ]);
    }

    public function api_update_vendor(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        global $wpdb;

        $data = [
            'business_name' => sanitize_text_field($request->get_param('business_name')),
            'business_website' => esc_url_raw($request->get_param('business_website')),
            'business_socials' => json_encode($request->get_param('business_socials')),
            'business_number' => sanitize_text_field($request->get_param('business_number')),
            'business_email' => sanitize_text_field($request->get_param('business_email')),
            'whatsapp_number' => sanitize_text_field($request->get_param('whatsapp_number')),
        ];

        if ($vendor_id === 0) {
            // Create new vendor
            $result = $wpdb->insert($this->tables->vendors, $data);

            if (!$result) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Failed to create vendor.', 'site-core'),
                ], 400);
            }

            return new WP_REST_Response([
                'success' => true,
                'message' => __('Vendor created successfully.', 'site-core'),
                'data' => ['id' => $wpdb->insert_id],
            ], 201);
        } else {
            // Update existing vendor
            $result = $wpdb->update($this->tables->vendors, $data, ['id' => $vendor_id], ['%s', '%s', '%s', '%s', '%s', '%s'], ['%d']);

            if ($result === false) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Failed to update vendor.', 'site-core'),
                    'error' => $wpdb->last_error
                ], 400);
            }

            return new WP_REST_Response([
                'success' => true,
                'message' => __('Vendor updated successfully.', 'site-core'),
            ]);
        }
    }

    public function api_delete_vendor(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        global $wpdb;

        $result = $wpdb->delete($this->tables->vendors, ['id' => $vendor_id]);

        if ($result === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Failed to delete vendor.', 'site-core'),
            ], 400);
        }

        if ($result === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Vendor not found.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Vendor deleted successfully.', 'site-core'),
        ]);
    }

    public function api_list_vendor_warehouses(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $vendor_id = (int) $request->get_param('vendor_id');
        $page = max(1, (int) $request->get_param('page'));
        $perPage = max(1, (int) $request->get_param('perPage'));
        $search = trim((string) $request->get_param('q'));
        $include_ids = array_filter(array_map('intval', (array) $request->get_param('include_ids')));

        $offset = ($page - 1) * $perPage;

        $where_clauses = ['vendor_id = %d'];
        $params = [$vendor_id];

        if ($search !== '') {
            $where_clauses[] = "(warehouse_name LIKE %s OR warehouse_address LIKE %s)";
            $search_like = '%' . $wpdb->esc_like($search) . '%';
            $params[] = $search_like;
            $params[] = $search_like;
        }

        $where_sql = implode(' AND ', $where_clauses);

        $include_sql = '';
        if (!empty($include_ids)) {
            $placeholders = implode(',', array_fill(0, count($include_ids), '%d'));
            $include_sql = " OR id IN ($placeholders)";
        }

        $sql = "SELECT * FROM {$this->tables->warehouse} WHERE ($where_sql $include_sql)";

        $all_params = $params;
        if (!empty($include_ids)) {
            $all_params = array_merge($all_params, $include_ids);
        }

        $sql = $wpdb->prepare($sql, ...$all_params);

        $sql .= " ORDER BY id ASC LIMIT %d OFFSET %d";
        $sql = $wpdb->prepare($sql, $perPage, $offset);

        $warehouses = $wpdb->get_results($sql, ARRAY_A);

        if (empty($warehouses)) {
            return new WP_REST_Response([
                'success' => true,
                'data' => [],
                'message' => __('No warehouses found for this vendor.', 'site-core'),
            ]);
        }

        $count_sql = "SELECT COUNT(*) FROM {$this->tables->warehouse} WHERE ($where_sql $include_sql)";
        $count_sql = $wpdb->prepare($count_sql, ...$all_params);
        $total_items = (int) $wpdb->get_var($count_sql);

        $total_pages = (int) ceil($total_items / $perPage);

        $response_data = ['success' => true, 'data' => $warehouses];

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    public function api_get_vendor_warehouse(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        $warehouse_id = (int) $request->get_param('warehouse_id');
        global $wpdb;

        $warehouse = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->tables->warehouse} WHERE id = %d AND vendor_id = %d", $warehouse_id, $vendor_id),
            ARRAY_A
        );

        if (empty($warehouse)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Warehouse not found for this vendor.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => $warehouse,
        ]);
    }

    public function api_update_vendor_warehouse(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        $warehouse_id = (int) $request->get_param('warehouse_id');
        global $wpdb;

        $data = [
            'vendor_id' => $vendor_id,
            'warehouse_title' => sanitize_text_field($request->get_param('warehouse_title')),
            'address' => sanitize_textarea_field($request->get_param('address')),
            'latlon' => sanitize_text_field($request->get_param('latlon')),
            'district' => sanitize_text_field($request->get_param('district')),
            'contact_number' => sanitize_text_field($request->get_param('contact_number')),
            'whatsapp_number' => sanitize_text_field($request->get_param('whatsapp_number')),
        ];

        if ($warehouse_id === 0) {
            // Create new warehouse
            $result = $wpdb->insert($this->tables->warehouse, $data);

            if (!$result) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Failed to create warehouse.', 'site-core'),
                ], 400);
            }

            return new WP_REST_Response([
                'success' => true,
                'message' => __('Warehouse created successfully.', 'site-core'),
                'data' => ['id' => $wpdb->insert_id],
            ], 201);
        } else {
            // Update existing warehouse
            $result = $wpdb->update($this->tables->warehouse, $data, ['id' => $warehouse_id, 'vendor_id' => $vendor_id]);

            if ($result === false) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Failed to update warehouse.', 'site-core'),
                ], 400);
            }

            return new WP_REST_Response([
                'success' => true,
                'message' => __('Warehouse updated successfully.', 'site-core'),
            ]);
        }
    }

    public function api_delete_vendor_warehouse(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        $warehouse_id = (int) $request->get_param('warehouse_id');
        global $wpdb;

        $result = $wpdb->delete(
            $this->tables->warehouse,
            ['id' => $warehouse_id, 'vendor_id' => $vendor_id]
        );

        if ($result === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Failed to delete warehouse.', 'site-core'),
            ], 400);
        }

        if ($result === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Warehouse not found.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Warehouse deleted successfully.', 'site-core'),
        ]);
    }

    public function api_list_warehouse_products(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;

        $per_page = min(24, max(1, (int) $request->get_param('per_page')));
        $page = max(1, (int) $request->get_param('page'));
        $offset = ($page - 1) * $per_page;

        $warehouse_id = (int) $request->get_param('warehouse_id');
        $vendor_id = (int) $request->get_param('vendor_id');
        $search = trim((string) $request->get_param('search'));
        $search_like = '%' . $wpdb->esc_like($search) . '%';

        $base_sql = "
            FROM {$this->tables->productat} p
            JOIN {$wpdb->posts} post ON post.ID = p.product_id
            JOIN {$this->tables->warehouse} w ON w.id = p.warehouse_id
            JOIN {$this->tables->vendors} v ON w.vendor_id = v.id
            WHERE v.id = %d
            -- AND post.post_type = 'sc_product'
        ";

        $params = [$vendor_id];

        if ($warehouse_id > 0) {
            $base_sql .= " AND p.warehouse_id = %d";
            $params[] = $warehouse_id;
        }

        if ($search !== '') {
            $base_sql .= " AND post.post_title LIKE %s";
            $params[] = $search_like;
        }

        $count_sql = "SELECT COUNT(*) " . $base_sql;
        $total_items = (int) $wpdb->get_var($wpdb->prepare($count_sql, ...$params));

        $select_sql = "
            SELECT p.*, v.business_name, w.warehouse_title, w.address AS warehouse_address, post.post_title
            " . $base_sql . "
            ORDER BY p.id ASC
            LIMIT %d OFFSET %d
        ";

        $params_with_limit = array_merge($params, [$per_page, $offset]);
        // wp_die($wpdb->prepare($select_sql, ...$params_with_limit));
        $products = $wpdb->get_results($wpdb->prepare($select_sql, ...$params_with_limit), ARRAY_A);

        if (empty($products)) {
            return new WP_REST_Response([
                'data' => [],
                'success' => true,
                'message' => __('No products found for this product.', 'site-core'),
                'error' => $wpdb->last_error,
            ]);
        }

        if (function_exists('wc_get_product') && false) {
            foreach ($products as $key => $row) {
                $wc_product = wc_get_product((int) $row['product_id']);
                if (!$wc_product) continue;
                $products[$key]['product'] = [
                    'id' => $wc_product->get_id(),
                    'name' => $wc_product->get_name(),
                    'price' => $wc_product->get_price(),
                    'sku' => $wc_product->get_sku(),
                    'permalink' => $wc_product->get_permalink(),
                    'image_url' => wp_get_attachment_image_url($wc_product->get_image_id(), 'thumbnail'),
                    'stock_status' => $wc_product->get_stock_status(),
                    'stock_quantity' => $wc_product->get_stock_quantity(),
                ];
            }
        } else {
            $product_instance = Ecommerce\Addons\Product::get_instance();
            foreach ($products as $key => $row) {
                $products[$key]['product'] = $product_instance->get_product((int) $row['product_id']);
            }
        }

        $total_pages = (int) ceil($total_items / $per_page);

        $response = rest_ensure_response(['success' => true, 'data' => $products]);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    
    public function api_get_product_warehouse(WP_REST_Request $request): WP_REST_Response {
        global $wpdb;
        $product_id = (int) $request->get_param('product_id');
        $exclude__ids = array_filter(array_map('intval', explode(',', (string) $request->get_param('exclude__ids'))));
        $page = max(1, (int) $request->get_param('page'));
        $perPage = max(1, (int) $request->get_param('perPage'));
        $search = trim((string) $request->get_param('q'));
        $include_ids = array_filter(array_map('intval', (array) $request->get_param('include_ids')));

        $offset = ($page - 1) * $perPage;

        $where_clauses = ['p.product_id = %d'];
        $params = [$product_id];

        if (!empty($exclude__ids)) {
            $placeholders_exclude = implode(',', array_fill(0, count($exclude__ids), '%d'));
            $where_clauses[] = "w.id NOT IN ($placeholders_exclude)";
            $params = array_merge($params, $exclude__ids);
        }

        if ($search !== '') {
            $where_clauses[] = "(w.warehouse_name LIKE %s OR w.warehouse_address LIKE %s OR v.business_name LIKE %s)";
            $search_like = '%' . $wpdb->esc_like($search) . '%';
            $params[] = $search_like;
            $params[] = $search_like;
            $params[] = $search_like;
        }

        $where_sql = implode(' AND ', $where_clauses);

        $include_sql = '';
        if (!empty($include_ids)) {
            $placeholders_include = implode(',', array_fill(0, count($include_ids), '%d'));
            $include_sql = " OR w.id IN ($placeholders_include)";
        }

        $all_params = $params;
        if (!empty($include_ids)) {
            $all_params = array_merge($all_params, $include_ids);
        }

        $sql = "SELECT w.*, v.business_name, v.business_website, v.business_number
                FROM {$this->tables->warehouse} AS w
                JOIN {$this->tables->productat} AS p ON w.id = p.warehouse_id
                JOIN {$this->tables->vendors} AS v ON w.vendor_id = v.id
                WHERE ($where_sql $include_sql)
                ORDER BY w.id ASC
                LIMIT %d OFFSET %d";

        $all_params[] = $perPage;
        $all_params[] = $offset;

        $sql = $wpdb->prepare($sql, ...$all_params);

        $warehouses = $wpdb->get_results($sql, ARRAY_A);

        if (empty($warehouses)) {
            return new WP_REST_Response([
                'success' => true,
                'data' => [],
                'message' => __('No warehouses found for this product.', 'site-core'),
            ]);
        }

        $count_sql = "SELECT COUNT(*) 
                    FROM {$this->tables->warehouse} AS w
                    JOIN {$this->tables->productat} AS p ON w.id = p.warehouse_id
                    JOIN {$this->tables->vendors} AS v ON w.vendor_id = v.id
                    WHERE ($where_sql $include_sql)";
        $count_sql = $wpdb->prepare($count_sql, ...$all_params);
        $total_items = (int) $wpdb->get_var($count_sql);

        $total_pages = (int) ceil($total_items / $perPage);

        $response_data = ['success' => true, 'data' => $warehouses];

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    public function api_update_product_warehouse(WP_REST_Request $request): WP_REST_Response {
        $warehouse_id = (int) $request->get_param('warehouse_id');
        $product_id = (int) $request->get_param('product_id');
        global $wpdb;

        // Check if the product already exists in the warehouse
        $existing_entry = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->tables->productat} WHERE warehouse_id = %d AND product_id = %d", $warehouse_id, $product_id),
            ARRAY_A
        );

        if ($existing_entry) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Product already exists in this warehouse.', 'site-core'),
            ], 400);
        }

        // Insert the new product-warehouse relationship
        $data = [
            'warehouse_id' => $warehouse_id,
            'product_id' => $product_id,
            'quantity' => 0, // Default quantity, can be modified later
        ];

        $result = $wpdb->insert($this->tables->productat, $data);

        if (!$result) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Failed to add product to warehouse.', 'site-core'),
            ], 400);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Product added to warehouse successfully.', 'site-core'),
            'data' => ['id' => $wpdb->insert_id],
        ], 201);
    }

    public function api_remove_product_warehouse(WP_REST_Request $request): WP_REST_Response {
        $warehouse_id = (int) $request->get_param('warehouse_id');
        $product_id = (int) $request->get_param('product_id');
        global $wpdb;

        // Delete the product-warehouse relationship
        $rows_deleted = $wpdb->delete($this->tables->productat, [
            'warehouse_id' => $warehouse_id,
            'product_id' => $product_id,
        ], ['%d', '%d']);

        if ($rows_deleted === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Failed to remove product from warehouse.', 'site-core'),
            ], 400);
        }

        if ($rows_deleted === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Product not found in this warehouse.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => __('Product removed from warehouse successfully.', 'site-core'),
        ]);
    }

    public function api_remove_product_vendor(WP_REST_Request $request): WP_REST_Response {
        $vendor_id = (int) $request->get_param('vendor_id');
        $product_id = (int) $request->get_param('product_id');
        global $wpdb;

        // Delete the product-warehouse relationship
        $result = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT p.id
                FROM {$this->tables->productat} p
                LEFT JOIN {$this->tables->warehouse} w ON p.warehouse_id = w.id
                LEFT JOIN {$this->tables->vendors} v ON w.vendor_id = v.id
                WHERE p.product_id = %d AND w.vendor_id = %d", $product_id, $vendor_id
            ),
            ARRAY_A
        );

        foreach ($result as $i => $row) {
            $result[$i]['removed'] = $wpdb->delete($this->tables->productat, ['id' => $row['id']]);
        }
        
        if (empty($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Failed to remove product from warehouse.', 'site-core'),
            ], 400);
        }

        if (!count($result)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => __('Product not found in this warehouse.', 'site-core'),
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'result' => $result,
            'message' => __('Product removed from warehouse successfully.', 'site-core')
        ]);
    }

    public function api_storemanager_autocomplete(WP_REST_Request $request): WP_REST_Response {
        $search = (string) $request->get_param('search');
        $vendor_id = (int) $request->get_param('vendor_id');
        $warehouse_id = (int) $request->get_param('warehouse_id');
        $autocomplete = (string) $request->get_param('autocomplete');
        global $wpdb;

        // Delete the product-warehouse relationship
        switch ($autocomplete) {
            case 'products':
                $results = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT p.ID AS id, p.post_title AS product_title FROM {$wpdb->posts} p WHERE p.post_type = %s AND p.post_title LIKE %s OR p.ID = %d;",
                        function_exists('wc_get_product') ? 'product' : 'sc_product',
                        '%'.$wpdb->esc_like($search).'%', (int) $search
                    ),
                    ARRAY_A
                );
                break;
            case 'warehouses':
                $results = $wpdb->get_results(
                    $wpdb->prepare(
                        "SELECT w.id, w.warehouse_title FROM {$this->tables->warehouse} w WHERE w.warehouse_title LIKE %s OR w.id = %d;",
                        '%'.$wpdb->esc_like($search).'%', (int) $search
                    ),
                    ARRAY_A
                );
                break;
            default:
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Your request is invalid.', 'site-core'),
                ], 400);
                break;
        }

        return new WP_REST_Response([
            'success' => true,
            'data' => $results,
        ]);
    }

    public function api_send_notification(WP_REST_Request $request): WP_REST_Response {
        $subject = sanitize_text_field($request->get_param('subject'));
        $receiver = sanitize_email($request->get_param('receiver'));
        $platform = sanitize_text_field($request->get_param('platform'));
        $message = sanitize_textarea_field($request->get_param('message'));
        global $wpdb;

        switch ($platform) {
            case 'email':
                // Send email notification
                $headers = ['Content-Type: text/html; charset=UTF-8'];
                $sent = wp_mail($receiver, $subject, $message, $headers);

                if (!$sent) {
                    return new WP_REST_Response([
                        'success' => false,
                        'message' => __('Failed to send email notification.', 'site-core'),
                    ], 500);
                }

                // Log the notification in the database
                $wpdb->insert($this->tables->notifications, [
                    'subject' => $subject,
                    'receiver' => $receiver,
                    'platform' => $platform,
                    'message' => $message,
                    'seen' => 0,
                    'issued_on' => current_time('mysql'),
                    'seen_at' => null,
                ]);

                return new WP_REST_Response([
                    'success' => true,
                    'message' => __('Email notification sent successfully.', 'site-core'),
                ], 201);

            // Additional cases for other platforms can be added here
            default:
                return new WP_REST_Response([
                    'success' => false,
                    'message' => __('Unsupported notification platform.', 'site-core'),
                ], 400);
        }
    }

    public function get_vendor_id_by_product($product_id) {
        return false;
    }
    
    
    public function handle_order_processing($order_id) {
        // Get the order object
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        // Prepare data for email
        $vendor_items = [];
        $admin_email_content = "Order ID: $order_id\n\nItems sent to vendors:\n";

        // Loop through order items
        foreach ($order->get_items() as $item_id => $item) {
            $product_id = $item->get_product_id();
            $product = $item->get_product();
            $sku = $product->get_sku();
            $quantity = $item->get_quantity();
            $product_title = $product->get_name();

            // Get vendor information (assuming you have a way to get vendor by product ID)
            $vendor_id = $this->get_vendor_id_by_product($product_id); // Implement this method as needed
            if ($vendor_id) {
                // Add item to vendor's list
                if (!isset($vendor_items[$vendor_id])) {
                    $vendor_items[$vendor_id] = [];
                }
                $vendor_items[$vendor_id][] = [
                    'sku' => $sku,
                    'product_id' => $product_id,
                    'product_title' => $product_title,
                    'quantity' => $quantity,
                ];

                // Prepare admin email content
                $admin_email_content .= "Vendor ID: $vendor_id - $product_title (SKU: $sku) x $quantity\n";
            }
        }

        // Send emails to vendors
        foreach ($vendor_items as $vendor_id => $items) {
            $vendor_email = $this->get_vendor_email($vendor_id);
            if ($vendor_email) {
                $items_list = implode("\n", array_map(function($item) {
                    return "{$item['product_title']} (SKU: {$item['sku']}) x {$item['quantity']}";
                }, $items));

                $subject = "New Order Notification - Order ID: $order_id";
                $message = "You have received a new order with the following items:\n\n" . $items_list;

                wp_mail($vendor_email, $subject, $message);
            }
        }

        // Send email to admin
        $admin_email = get_option('admin_email');
        wp_mail($admin_email, "Order Processed - Order ID: $order_id", $admin_email_content);
    }

}

