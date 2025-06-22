<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;
use WP_Query;

class Suite {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        // Elementor Forms Endpoints
        register_rest_route('sitecore/v1', '/elementor/forms', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_elementor_forms'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/elementor/(?P<form_id>[\d]+)/entries', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_elementor_form_entries'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // MetForm Endpoints
        register_rest_route('sitecore/v1', '/metform/forms', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_metforms'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/metform/(?P<form_id>[\d]+)/entries', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_metform_entries'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
		
		
		register_rest_route('sitecore/v1', '/woocommerce/orders', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_orders_list'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // Single Order Details Endpoint  
        register_rest_route('sitecore/v1', '/woocommerce/(?P<order_id>[\d]+)', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_order_details'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
		
		
		
		// Get all registered post types  
        register_rest_route('sitecore/v1', '/posts/types', [
            'methods' => 'GET',
            'callback' => [$this, 'get_post_types'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // Get posts of a specific type  
        register_rest_route('sitecore/v1', '/posts/(?P<post_type>[\w-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_posts_by_type'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // Get single post details  
        register_rest_route('sitecore/v1', '/posts/(?P<post_type>[\w-]+)/(?P<post_id>[\d]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_single_post_details'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // Update post  
        register_rest_route('sitecore/v1', '/posts/(?P<post_type>[\w-]+)/(?P<post_id>[\d]+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_post'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        // Get site details  
        register_rest_route('sitecore/v1', '/site/insights', [
            'methods' => 'GET',
            'callback' => [$this, 'get_site_insights'],
            'permission_callback' => function() {return true;} // [Security::get_instance(), 'permission_callback']
        ]);

		
    }

    // Get Elementor Forms
     public function get_elementor_forms(WP_REST_Request $request) {
        // Check if Elementor is active
        if (!defined('ELEMENTOR_VERSION')) {
            return new WP_Error('no_elementor', 'Elementor plugin is not active', ['status' => 404]);
        }

        // Get forms using Elementor's post type
        $args = [
            'post_type' => 'elementor_library',
            'posts_per_page' => $request->get_param('per_page') ?? 20,
            'paged' => $request->get_param('page') ?? 1,
            'meta_query' => [
                [
                    'key' => '_elementor_template_type',
                    'value' => 'form',
                ]
            ]
        ];

        // Add search parameter if provided
        $search = $request->get_param('search');
        if (!empty($search)) {
            $args['s'] = sanitize_text_field($search);
        }

        // Query posts
        $query = new WP_Query($args);

        // Prepare response data
        $forms = array_map(function($post) {
            // Get form settings
            $form_settings = get_post_meta($post->ID, '_elementor_page_settings', true);
            
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'date' => $post->post_date,
                'status' => $post->post_status,
                'form_fields' => $form_settings['form_fields'] ?? []
            ];
        }, $query->posts);

        // Prepare response
        $response = rest_ensure_response($forms);
        $response->header('X-WP-Total', (int) $query->found_posts);
        $response->header('X-WP-TotalPages', (int) $query->max_num_pages);
        
        return $response;
    }

    // Get Elementor Form Entries
    public function get_elementor_form_entries(WP_REST_Request $request) {
        global $wpdb;

        $form_id = (int) $request->get_param('form_id');
        $current_page = (int) $request->get_param('page') ?? 1;
        $per_page = (int) $request->get_param('per_page') ?? 20;
        $offset = ($current_page - 1) * $per_page;

        // Query to get Elementor form entries
        $table_name = $wpdb->prefix . 'elementor_form_submissions';
        
        $where = $wpdb->prepare('WHERE form_id = %d', $form_id);

        $total_items = $wpdb->get_var("SELECT COUNT(*) FROM {$table_name} {$where}");
        $total_pages = ceil($total_items / $per_page);

        $entries = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} {$where} 
                LIMIT %d OFFSET %d", 
                $per_page, 
                $offset
            ), 
            ARRAY_A
        );

        $response = rest_ensure_response($entries);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $total_pages);
        return $response;
    }

    // Get MetForms (Post Type)
    public function get_metforms(WP_REST_Request $request) {
        $current_page = (int) $request->get_param('page') ?? 1;
        $per_page = (int) $request->get_param('per_page') ?? 20;
        $search = (string) $request->get_param('search') ?? '';

        $args = [
            'post_type' => 'metform-form',
            'posts_per_page' => $per_page,
            'paged' => $current_page,
            'orderby' => 'date',
            'order' => 'DESC',
        ];

        // Add search parameter if provided
        if (!empty($search)) {
            $args['s'] = sanitize_text_field($search);
        }

        // Query posts
        $query = new WP_Query($args);

        // Prepare response data
        $forms = array_map(function($post) {
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'date' => $post->post_date,
                'status' => $post->post_status
            ];
        }, $query->posts);

        $response = rest_ensure_response($forms);
        $response->header('X-WP-Total', (int) $query->found_posts);
        $response->header('X-WP-TotalPages', (int) $query->max_num_pages);
        return $response;
    }

    // Get MetForm Entries
    public function get_metform_entries(WP_REST_Request $request) {
        $form_id = (int) $request->get_param('form_id');
        $current_page = (int) $request->get_param('page') ?? 1;
        $per_page = (int) $request->get_param('per_page') ?? 20;

        $args = [
            'post_type' => 'metform-entry',
            'posts_per_page' => $per_page,
            'paged' => $current_page,
            'meta_query' => [
                [
                    'key' => 'metform_form_id',
                    'value' => $form_id,
                    'compare' => '='
                ]
            ],
            'orderby' => 'date',
            'order' => 'DESC',
        ];

        // Query posts
        $query = new WP_Query($args);

        // Prepare response data
        $entries = array_map(function($post) {
            // You might want to extract more specific metadata here
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'date' => $post->post_date,
                'status' => $post->post_status
            ];
        }, $query->posts);

        $response = rest_ensure_response($entries);
        $response->header('X-WP-Total', (int) $query->found_posts);
        $response->header('X-WP-TotalPages', (int) $query->max_num_pages);
        return $response;
    }
	
	
    // Get Orders List
    public function get_orders_list(WP_REST_Request $request) {
        // Check if WooCommerce is active
        if (!function_exists('wc_get_order')) {
            return new WP_Error('no_woocommerce', 'WooCommerce is not active', ['status' => 404]);
        }

        // Pagination and filter parameters
        $page = $request->get_param('page') ?? 1;
        $per_page = $request->get_param('per_page') ?? 20;
        $status = $request->get_param('status') ?? 'any';
        $customer_id = $request->get_param('customer_id') ?? null;
        $search = $request->get_param('search') ?? '';

        // Prepare query arguments
        $args = [
            'limit' => $per_page,
            'page' => $page,
            'status' => $status,
            'return' => 'objects',
        ];

        // Add customer filter if provided
        if ($customer_id) {
            $args['customer_id'] = $customer_id;
        }

        // Add search parameter
        if (!empty($search)) {
            $args['search'] = sanitize_text_field($search);
        }

        // Fetch orders
        $query = wc_get_orders($args);

        // Prepare order data
        $orders = array_map(function($order) {
            return [
                'id' => $order->get_id(),
                'order_number' => $order->get_order_number(),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'status' => $order->get_status(),
                'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
                'billing_first_name' => $order->get_billing_first_name(),
                'billing_last_name' => $order->get_billing_last_name(),
                'billing_email' => $order->get_billing_email(),
            ];
        }, $query);

        // Get total number of orders
        $total_orders = wc_get_orders([
            'status' => $status,
            'return' => 'count',
        ]);

        // Prepare response
        $response = rest_ensure_response($orders);
        $response->header('X-WP-Total', (int) $total_orders);
        $response->header('X-WP-TotalPages', (int) ceil($total_orders / $per_page));

        return $response;
    }

    // Get Single Order Details
    public function get_order_details(WP_REST_Request $request) {
        // Check if WooCommerce is active
        if (!function_exists('wc_get_order')) {
            return new WP_Error('no_woocommerce', 'WooCommerce is not active', ['status' => 404]);
        }

        // Get order ID from request
        $order_id = $request->get_param('order_id');

        // Fetch order
        $order = wc_get_order($order_id);

        // Check if order exists
        if (!$order) {
            return new WP_Error('no_order', 'Order not found', ['status' => 404]);
        }

        // Prepare full order details
        $order_data = [
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            
            // Billing Details
            'billing' => [
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'email' => $order->get_billing_email(),
                'phone' => $order->get_billing_phone(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
            ],

            // Shipping Details
            'shipping' => [
                'first_name' => $order->get_shipping_first_name(),
                'last_name' => $order->get_shipping_last_name(),
                'company' => $order->get_shipping_company(),
                'address_1' => $order->get_shipping_address_1(),
                'address_2' => $order->get_shipping_address_2(),
                'city' => $order->get_shipping_city(),
                'state' => $order->get_shipping_state(),
                'postcode' => $order->get_shipping_postcode(),
                'country' => $order->get_shipping_country(),
            ],

            // Order Totals
            'totals' => [
                'subtotal' => $order->get_subtotal(),
                'total' => $order->get_total(),
                'total_tax' => $order->get_total_tax(),
                'shipping_total' => $order->get_shipping_total(),
                'shipping_tax' => $order->get_shipping_tax(),
                'discount_total' => $order->get_total_discount(),
                'currency' => $order->get_currency(),
            ],

            // Order Items
            'items' => array_map(function($item) {
                return [
                    'id' => $item->get_id(),
                    'name' => $item->get_name(),
                    'product_id' => $item->get_product_id(),
                    'variation_id' => $item->get_variation_id(),
                    'quantity' => $item->get_quantity(),
                    'price' => $item->get_total() / $item->get_quantity(),
                    'total' => $item->get_total(),
                    'subtotal' => $item->get_subtotal(),
                ];
            }, $order->get_items()),

            // Payment Details
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),

            // Shipping Method
            'shipping_method' => $order->get_shipping_method(),
        ];

        return rest_ensure_response($order_data);
    }

	
	
	
	
    // Get all registered post types
    public function get_post_types(WP_REST_Request $request) {
        $args = [
            'public'   => true,
            '_builtin' => false
        ];
        
        // Include built-in post types
        $builtin_types = ['post', 'page'];
        
        // Get custom post types
        $custom_types = get_post_types($args, 'objects');
        
        // Combine built-in and custom types
        $post_types = [];
        
        // Add built-in types
        foreach ($builtin_types as $type) {
            $type_obj = get_post_type_object($type);
            $post_types[] = [
                'name' => $type,
                'label' => $type_obj->label,
                'description' => $type_obj->description,
                'public' => $type_obj->public,
                'hierarchical' => $type_obj->hierarchical,
                'supports' => get_all_post_type_supports($type)
            ];
        }
        
        // Add custom types
        foreach ($custom_types as $type => $type_obj) {
            $post_types[] = [
                'name' => $type,
                'label' => $type_obj->label,
                'description' => $type_obj->description,
                'public' => $type_obj->public,
                'hierarchical' => $type_obj->hierarchical,
                'supports' => get_all_post_type_supports($type)
            ];
        }
        
        return rest_ensure_response($post_types);
    }

    // Get posts of a specific type
    public function get_posts_by_type(WP_REST_Request $request) {
        $post_type = $request->get_param('post_type');
        
        // Validate post type
        if (!post_type_exists($post_type)) {
            return new WP_Error('invalid_post_type', 'Invalid post type', ['status' => 400]);
        }

        // Pagination parameters
        $page = $request->get_param('page') ?? 1;
        $per_page = $request->get_param('per_page') ?? 20;
        $search = $request->get_param('search') ?? '';

        // Query arguments
        $args = [
            'post_type' => $post_type,
            'posts_per_page' => $per_page,
            'paged' => $page,
            's' => $search,
            'orderby' => $request->get_param('orderby') ?? 'date',
            'order' => $request->get_param('order') ?? 'DESC',
            'fields' => 'ids'
        ];

        // Allow filtering by additional parameters
        $tax_query = [];
        $meta_query = [];

        // Query posts
        $query = new WP_Query($args);

        // Prepare posts with metadata and terms
        $posts = array_map(function($post_id) {
            return [
                'ID' => $post_id,
                'slug' => get_post_field('post_name', $post_id),
                'title' => get_the_title($post_id),
                'last_updated' => get_post_modified_time('Y-m-d H:i:s', false, $post_id),
                'visited' => get_post_meta($post_id, '_visited', true)
            ];
        }, $query->posts);

        // Prepare response
        $response = rest_ensure_response($posts);
        $response->header('X-WP-Total', (int) $query->found_posts);
        $response->header('X-WP-TotalPages', (int) $query->max_num_pages);

        return $response;
    }

    // Get single post details
    public function get_single_post_details(WP_REST_Request $request) {
        $post_type = $request->get_param('post_type');
        $post_id = $request->get_param('post_id');

        // Get post
        $post = get_post($post_id);

        // Validate post
        if (!$post || $post->post_type !== $post_type) {
            return new WP_Error('no_post', 'Post not found', ['status' => 404]);
        }

        // Get full post details
        $post->metadata = get_post_meta($post->ID);
        $post->terms = get_the_terms($post->ID, get_taxonomies(['public' => true])) ?: [];
        $post->thumbnail = get_the_post_thumbnail_url($post->ID, 'full');
        $post->taxonomies = $this->get_post_taxonomies($post->ID);
        // 
        return rest_ensure_response($post);
    }

    // Update post
    public function update_post(WP_REST_Request $request) {
        $post_type = $request->get_param('post_type');
        $post_id = $request->get_param('post_id');

        // Validate post
        $post = get_post($post_id);
        if (!$post || $post->post_type !== $post_type) {
            return new WP_Error('no_post', 'Post not found', ['status' => 404]);
        }

        // Prepare update data
        $update_data = [
            'ID' => $post_id
        ];

        // Allowed post fields to update
        $allowed_fields = [
            'post_title', 'post_content', 'post_excerpt', 
            'post_status', 'post_author', 'menu_order'
        ];

        // Add fields to update
        foreach ($allowed_fields as $field) {
            if ($request->has_param($field)) {
                $update_data[$field] = $request->get_param($field);
            }
        }

        // Update post
        $updated_post_id = wp_update_post($update_data);

        // Handle errors
        if (is_wp_error($updated_post_id)) {
            return $updated_post_id;
        }

        // Update metadata if provided
        if ($request->has_param('metadata')) {
            $metadata = $request->get_param('metadata');
            
            // Delete existing metadata first (optional)
            // delete_post_meta($post_id, $key);
            
            // Add new metadata
            foreach ($metadata as $key => $value) {
                update_post_meta($post_id, $key, $value);
            }
        }

        // Return updated post details
        return $this->get_single_post_details($request);
    }

    // Helper method to get taxonomies
    private function get_post_taxonomies($post_id) {
        $taxonomies = get_taxonomies(['public' => true], 'objects');
        $post_taxonomies = [];

        foreach ($taxonomies as $taxonomy) {
            $terms = get_the_terms($post_id, $taxonomy->name);
            if ($terms) {
                $post_taxonomies[$taxonomy->name] = $terms;
            }
        }

        return $post_taxonomies;
    }
    
    // Site insights
    public function get_site_insights(WP_REST_Request $request) {
        $transient_key = '_site_insights';global $wpdb;
        // delete_transient($transient_key);
        $_cached_data = get_transient($transient_key);
        if ($_cached_data !== false) {
            // return rest_ensure_response($_cached_data);
        }
        // Initialize the insights array
        $insights = [];

        // Check for WooCommerce-related insights
        if (function_exists('wc_get_orders')) {
            // WooCommerce Insights
            $pending_orders_count = wc_get_orders(['status' => 'pending', 'return' => 'count']);
            $insights['pending_orders'] = $pending_orders_count;
            // Total Revenue for Current Month
            $current_month_start = strtotime('first day of this month');
            $current_month_end = strtotime('last day of this month');
            $revenue = 0;
            $orders = wc_get_orders([
                'status' => 'completed',
                'date_created' => $current_month_start . '...' . $current_month_end,
                'return' => 'ids', // Get order IDs
            ]);
            foreach ($orders as $order_id) {
                $order = wc_get_order($order_id);
                $revenue += $order->get_total();
            }
            $insights['total_revenue'] = $revenue;
        }

        // Count Published Pages
        $post_types = get_post_types([], 'object');
        $insights['post_types'] = [];
        foreach ($post_types as $_key => $post_type) {
            $insights['post_types'][] = [
                'name'                  => $post_type->name,
                'label'                 => $post_type->label,
                'public'                => $post_type->public,
                'menu_icon'             => $post_type->menu_icon,
                'taxonomies'            => $post_type->taxonomies,
                'has_archive'           => $post_type->has_archive,
                'description'           => $post_type->description,
                'counts'                => wp_count_posts($post_type->name)
            ];
        }
        
        // Count Comments
        $insights['comments'] = wp_count_comments();

        // Total Users
        $insights['users'] = count_users();

        // Count Form Entries from Elementor, MetForms, and Gravity Forms
        $form_entries_count = 0;

        // Elementor Entries
        if (function_exists('elementor_forms_get_entries')) {
            // Assuming there is a function for getting Elementor form entries
            $elementor_form_entries_count = elementor_forms_get_entries(); // Replace with actual function to count
            $form_entries_count += $elementor_form_entries_count;
        }

        // MetForm Entries
        if (function_exists('metform_get_entries')) {
            // Assuming there is a function for getting MetForm entries
            $metform_entries_count = metform_get_entries(); // Replace with actual function to count
            $form_entries_count += $metform_entries_count;
        }

        // Gravity Forms Entries
        if (function_exists('GFAPI::get_entries')) {
            // Assuming there's a method to count Gravity Forms entries
            $gravity_forms_entries_count = 0; // Add logic here to count GF entries
            // Count entries by using GFAPI::get_entries() method, and logic according to your needs
            $gravity_forms_entries = GFAPI::get_entries(); // Get entries
            $gravity_forms_entries_count = count($gravity_forms_entries); // Count entries
            $form_entries_count += $gravity_forms_entries_count;
        }
        $insights['form_entries'] = $form_entries_count;

        // Ai Task insights
        $insights['tasks'] = Task::get_instance()->get_total_rows();

        // Store the result in the transient for 12 hours (43200 seconds)
        set_transient($transient_key, $insights, 3600 * 12);

        // Prepare the final response
        return rest_ensure_response($insights);
    }
    
}
