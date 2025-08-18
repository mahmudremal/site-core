<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Task {
    use Singleton;

    protected $table;

    protected function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'sitecore_tasks';
        $this->setup_hooks();
        $this->allow_remote_request();
        $this->setup_job_seeking_hooks();
    }

    protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_filter('set-screen-option', [$this, 'set_screen'], 10, 3);
		add_action('sitecore/create_task', [$this, 'create_task'], 10, 3);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
        add_filter('sitecore/security/api/abilities', [$this, 'api_abilities'], 10, 3);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'tasks/')) {
            $abilities[] = 'tasks';
        }
        return $abilities;
    }

    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/tasks', [
            'methods' => 'GET', 'callback' => [$this, 'tasks_list'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/insights', [
            'methods' => 'GET', 'callback' => [$this, 'tasks_insights'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/search', [
            'methods' => 'GET', 'callback' => [$this, 'tasks_search'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/attachments/schemas/(?P<file_name>[^/]+)', [
            'methods' => 'GET', 'callback' => [$this, 'get_attachment_schema'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/(?P<task_id>\d+)', [
            'methods' => 'POST', 'callback' => [$this, 'task_update'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/(?P<task_id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'task_delete'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/tasks/(?P<task_id>\d+)/submit', [
            'methods' => 'POST', 'callback' => [$this, 'task_submit'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/post-table/(?P<post_type>[a-zA-Z0-9_-]+)/(?P<post_id>\d+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'get_post_data'],
            'args'     => [
                'post_type' => [
                    'required'          => true,
                    // 'validate_callback' => function ($param, $request, $key) {return post_type_exists( $param );},
                    'description'       => __('The post type of the requested item.', 'site-core')
                ],
                'post_id'   => [
                    'required'          => true,
                    // 'validate_callback' => function ($param, $request, $key) {return is_numeric( $param );},
                    'description'       => __('The ID of the requested item.', 'site-core')
                ]
            ],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/post-table/(?P<post_type>[a-zA-Z0-9_-]+)/(?P<post_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'update_post_data'],
            'args'                => [
                'post_type' => [
                    'required'          => true,
                    'description'       => __('The post type of the requested item.', 'site-core'),
                    // 'validate_callback' => function ($param, $request, $key) {return post_type_exists( $param );}
                ],
                'post_id'   => [
                    'required'          => true,
                    'description'       => __('The ID of the requested item.', 'site-core'),
                    // 'validate_callback' => function ($param, $request, $key) {return is_numeric( $param );}
                ],
            ],
            'permission_callback' => '__return_true'
        ]);
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id INT NOT NULL AUTO_INCREMENT,
            task_type VARCHAR(255) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            task_object LONGTEXT NOT NULL,
            task_submission LONGTEXT NOT NULL,
            task_desc TEXT,
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
		$args['task']		= [
			'title'							=> __('Task', 'site-core'),
			'description'					=> __('Automation task for wordpress that will automate some common work flows on wordpress with browser extension.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'task-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the task registration and rest api activity.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
                [
					'id' 					=> 'task-config-interface',
					'label'					=> __('Api keys', 'site-core'),
					'description'			=> __('API keys interface will be appear here...', 'site-core'),
					'type'					=> 'text',
					'default'				=> '',
					'attr'					=> [
						'data-config'		=> esc_attr(
							json_encode([
								'_nonce'		=> wp_create_nonce('_task_settings_security'),
								'keys'          => []
							])
                        ),
					]
				],
			]
		];
        return $args;
    }

    public function allow_remote_request() {
		add_action('rest_api_init', function () {
			remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
		
			add_filter('rest_pre_serve_request', function ($value) {
				header("Access-Control-Allow-Origin: *");
				header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
				header("Access-Control-Allow-Headers: Content-Type, Authorization");
				return $value;
			});
		}, 15);
		
		add_action('init', function () {
			header("Access-Control-Allow-Origin: *");
			header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
			header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");
		});
    }

	public function admin_enqueue_scripts($curr_page) {
        if ($curr_page != 'settings_page_site-core') {return;}
        wp_enqueue_script('site-core-setting', WP_SITECORE_BUILD_JS_URI . '/setting.js', [], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/setting.js'), true);
    }

    public function tasks_list(WP_REST_Request $request) {
        global $wpdb;
        $current_page = (int) $request->get_param('page')??1;
        $per_page = (int) $request->get_param('per_page')??20;
        $search = (string) $request->get_param('search')??'';
        $status = (string) $request->get_param('status')??'pending';
        $task_type = (string) $request->get_param('task_type')??'all';
        $orderby = (string) $request->get_param('orderby')??'id';
        $order = (string) $request->get_param('order')??'desc';
        $offset = ($current_page - 1) * $per_page;

        $where = 'WHERE 1=1';
        $order_by = 'ORDER BY created_at DESC';

        if (!in_array($status, ['all', 'any'])) {
            $status = sanitize_text_field($status);
            $where .= $wpdb->prepare(' AND status = %s', $status);
        }

        if (!in_array($task_type, ['all', 'any'])) {
            $task_type = sanitize_text_field($task_type);
            $where .= $wpdb->prepare(' AND task_type = %s', $task_type);
        }

        if (isset($orderby) && in_array($orderby, ['id', 'task_type', 'status', 'created_at', 'updated_at'])) {
            $order_by_field = sanitize_text_field($orderby);
            $order = isset($order) && in_array(strtoupper($order), ['ASC', 'DESC']) ? strtoupper($order) : 'DESC';
            $order_by = "ORDER BY {$order_by_field} {$order}";
        }

        $total_items = $wpdb->get_var("SELECT COUNT(id) FROM {$this->table} {$where}");
        $total_pages = ceil($total_items / $per_page);

        $response_data = $wpdb->get_results("SELECT * FROM {$this->table} {$where} {$order_by} LIMIT {$per_page} OFFSET {$offset}", ARRAY_A);

        foreach ($response_data as $index => $row) {
            $row['task_object'] = maybe_unserialize($row['task_object']);
            $response_data[$index] = $row;
        }
        
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $total_pages);
        return $response;
    }

    public function tasks_insights(WP_REST_Request $request) {
        $response = [];global $wpdb;
        $search = (string) $request->get_param('search')??'';
        $status = (string) $request->get_param('status')??'all';

        $where = '1 = 1';
        
        if (!empty($search)) {
            $searchLike = '%' . $wpdb->esc_like($search) . '%';
            $where .= $wpdb->prepare("(task_object LIKE %s OR task_desc LIKE %s OR task_submission LIKE %s)", $searchLike, $searchLike, $searchLike);
        }
        
        if (!in_array($status, ['all', 'any'])) {
            $status = sanitize_text_field($status);
            $where .= $wpdb->prepare(' AND status = %s', $status);
        }
        
        $response = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT task_type, COUNT(*) AS total FROM {$this->table} WHERE {$where} GROUP BY task_type;"
            )
        );
        return rest_ensure_response($response);
    }

    public function tasks_search(WP_REST_Request $request) {
        global $wpdb;

        $search = $request->get_param('search');
        $status = $request->get_param('status') ?? 'any';
        $task_type = $request->get_param('task_type') ?? 'any';
        $excluded_ids = $request->get_param('excluded_ids') ? implode(',', array_map('intval', $request->get_param('excluded_ids'))) : null;

        // Build the query dynamically
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $query_conditions = [];

        if (!empty($search)) {
            $searchLike = '%' . $wpdb->esc_like($search) . '%';
            $query_conditions[] = $wpdb->prepare("(task_object LIKE %s OR task_desc LIKE %s OR task_submission LIKE %s)", $searchLike, $searchLike, $searchLike);
        }

        if ($status !== 'any') {
            $query_conditions[] = $wpdb->prepare("status = %s", $status);
        }

        if ($task_type !== 'any') {
            $query_conditions[] = $wpdb->prepare("task_type = %s", $task_type);
        }

        if ($excluded_ids) {
            $query_conditions[] = "id NOT IN ($excluded_ids)";
        }

        if (!empty($query_conditions)) {
            $query .= ' AND ' . implode(' AND ', $query_conditions);
        }

        $query .= " ORDER BY created_at ASC LIMIT 1";

        $latest_task = $wpdb->get_row($query, ARRAY_A);

		// return new WP_REST_Response(['message' => $query], 200);

        if ($wpdb->last_error) {
			return new WP_REST_Response(['message' => $wpdb->last_error], 200);
        }

        if (!$latest_task) {
            return new WP_REST_Response(['message' => 'No tasks available'], 200);
        }
        if (isset($latest_task['task_object']) && !empty($latest_task['task_object'])) {
            $latest_task['task_object'] = maybe_unserialize($latest_task['task_object']);
            if (isset($latest_task['task_object']['post_id']) && !isset($latest_task['task_object']['post_type'])) {
                $latest_task['task_object']['post_type'] = get_post_type($latest_task['task_object']['post_id']);
            }
        }
        return new WP_REST_Response($latest_task, 200);
    }

    public function task_update(WP_REST_Request $request) {
        global $wpdb;
    
        $task_id = $request->get_param('task_id');
        $params = $request->get_params();
    
        if (!$task_id || ! isset($params['task_key'], $params['update_value'])) {
            return new WP_Error('invalid_request', 'Missing task_id, task_key, or update_value', ['status' => 400]);
        }
    
        $task_key = sanitize_key($params['task_key']);
        $update_value = sanitize_text_field($params['update_value']);
    
        $updated = $wpdb->update(
            $this->table,
            [ $task_key => $update_value ],
            [ 'id' => (int) $task_id ],
            [ '%s' ],
            [ '%d' ]
        );
    
        if ( $updated !== false ) {
            return rest_ensure_response(['message' => 'Updated!'])->set_status(201);
        }
    
        return new WP_Error( 'rest_post_processing_failed', 'Failed to update query', [ 'status' => 500 ] );
    }

    public function task_delete( WP_REST_Request $request ) {
        global $wpdb;
        $task_id = $request->get_param( 'task_id' );
        $deleted = $wpdb->delete(
            $this->table,
            ['id' => (int) $task_id],
            ['%d']
        );
        return rest_ensure_response(['success' => $deleted, 'message' => $deleted ? __('Task deleted successfully!', 'site-core') : __('Failed to delete task', 'site-core')]);
    }

    public function task_submit( WP_REST_Request $request ) {
        global $wpdb;$params = $request->get_params();
        $task_id = $request->get_param('task_id');
        $data = $request->get_param('data');

        $_performed = $this->perform_task($task_id, $data);
        if ($_performed && !is_wp_error($_performed)) {
            $updated = $wpdb->update(
                $this->table,
                [
                    'status' => 'completed',
                    'task_submission' => $data
                ],
                [ 'id' => (int) $task_id ],
                [ '%s', '%s' ],
                [ '%d' ]
            );
            return rest_ensure_response([...$params, 'updated' => $updated]);
        } else {
            return rest_ensure_response($_performed);
        }
    }

    public function get_post_data( WP_REST_Request $request ) {
        $post_type = $request->get_param( 'post_type' );
        $post_id   = $request->get_param( 'post_id' );
    
        $post = get_post( $post_id );
    
        if ( ! $post || $post->post_type !== $post_type ) {
            return new WP_Error( 'rest_invalid_id', __('Invalid post ID or post type.', 'site-core'), array( 'status' => 404 ) );
        }
    
        $post_data = get_post($post_id);
        $post_meta = get_post_meta( $post_id );
    
        $response_data = (array) $post_data;
        $response_data['meta'] = $post_meta;
    
        // Handle attachments (media library items)
        if ( 'attachment' === $post_type ) {
            $attachment_metadata = wp_get_attachment_metadata( $post_id );
            if ( $attachment_metadata ) {
                $response_data['attachment_metadata'] = $attachment_metadata;
    
                // Get additional image sizes data
                $attachment_sizes = wp_get_attachment_image_sizes( $post_id );
                if ( $attachment_sizes ) {
                    $response_data['attachment_sizes'] = $attachment_sizes;
                }
    
                // Get attachment image src URLs for different sizes
                $attachment_image_src = array();
                $sizes = get_intermediate_image_sizes();
                foreach ( $sizes as $size ) {
                    $attachment_image_src[$size] = wp_get_attachment_image_src( $post_id, $size );
                }
                $full_image_src = wp_get_attachment_image_src( $post_id, 'full' );
                if ($full_image_src) {
                    $attachment_image_src['full'] = $full_image_src;
                }
                if (!empty($attachment_image_src)) {
                    $response_data['attachment_image_src'] = $attachment_image_src;
                }
            }
        }
    
        return rest_ensure_response( $response_data );
    }

    public function update_post_data( WP_REST_Request $request ) {
        $post_type = $request->get_param( 'post_type' );
	    $post_id   = $request->get_param( 'post_id' );
        $params    = $request->get_params();
        $post_data = wp_slash( array_map( 'sanitize_post_field', $params ) );
        $post_data['post_type'] = $post_type;
    
        if ( $post_id > 0 ) {
            $post_data['ID'] = $post_id;
            $updated_id    = wp_update_post( $post_data );
            if ( ! $updated_id ) {
                return new WP_Error( 'rest_post_update_failed', 'Failed to update post', array( 'status' => 500 ) );
            }
            $post    = get_post( $updated_id );
            $status  = 200;
            $message = 'Post updated';
        } elseif ( '0' === $post_id ) {
            $inserted_id = wp_insert_post( $post_data );
            if ( ! $inserted_id ) {
                return new WP_Error( 'rest_post_insert_failed', 'Failed to insert post', array( 'status' => 500 ) );
            }
            $post    = get_post( $inserted_id );
            $status  = 201;
            $message = 'Post created';
        } else {
            return new WP_Error( 'rest_invalid_id', 'Invalid post ID', array( 'status' => 400 ) );
        }
    
        if ( $post ) {
            $response_data          = (array) $post;
            $response_data['meta'] = get_post_meta( $post->ID );
            if ( 'attachment' === $post_type && $metadata = wp_get_attachment_metadata( $post->ID ) ) {
                $response_data['attachment_metadata'] = $metadata;
                $response_data['attachment_sizes']    = wp_get_attachment_image_sizes( $post->ID );
                $image_src                           = [];
                foreach ( get_intermediate_image_sizes() as $size ) {
                    $src = wp_get_attachment_image_src( $post->ID, $size );
                    if ( $src ) {
                        $image_src[$size] = $src;
                    }
                }
                $full_src = wp_get_attachment_image_src( $post->ID, 'full' );
                if ( $full_src ) {
                    $image_src['full'] = $full_src;
                }
                if ( $image_src ) {
                    $response_data['attachment_image_src'] = $image_src;
                }
            }
            return rest_ensure_response( [ 'message' => $message, 'post' => $response_data ] )->set_status( $status );
        }
    
        return new WP_Error( 'rest_post_processing_failed', 'Failed to retrieve post after update/insert', array( 'status' => 500 ) );
    }

	public function create_task($task_type, $task_object, $task_desc = '') {
        global $wpdb;

        $task_type = sanitize_text_field($task_type);
        $task_desc = sanitize_text_field($task_desc);
        $task_object_serialized = maybe_serialize($task_object);

        $wpdb->insert(
            $this->table,
            [
                'task_type' => $task_type,
                'task_object' => $task_object_serialized,
                'task_desc' => $task_desc,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            ],
            ['%s', '%s', '%s', '%s', '%s']
        );

        if ($wpdb->last_error) {
            $this->add_wp_error_transient('Error identified while inserting new job: '. $wpdb->last_error);
			return new WP_Error('task_creation_failed', $wpdb->last_error);
        }

		return $wpdb->insert_id;
    }
    
    protected function setup_job_seeking_hooks() {
        add_action('post_inserted',function($a,$b,$c,$d){if(!$c){do_action('sitecore/create_task','post_seo',['post_id'=>$a,'type'=>$b->post_type],sprintf('Review the SEO for the new %s titled "%s". Analyze the title, meta description, URL slug, headings (H1-H6), image alt text, and internal/external linking. Ensure they are optimized for relevant keywords, readability, and align with SEO best practices to improve search engine visibility and organic traffic potential for this content type.',$b->post_type,$b->post_title));}},10,4);
        add_action('wp_insert_post', function($a,$b,$c){if(!$c){do_action('sitecore/create_task','seo_improvements',['post_id'=>$a],sprintf('Analyze the newly created post titled "%s" for SEO. Content, etc., will be fetched via API. Review title, metadata (date, cats, tags). Suggest title improvements, relevant keywords, categories, tags.',esc_html($b->post_title)));}},10,3);
        add_action('add_attachment',function($a){$b=get_post_mime_type($a);$c=basename(get_attached_file($a));$d=wp_get_attachment_metadata($a);do_action('sitecore/create_task','media_seo',['post_id'=>$a,'mime'=>$b,'metadata'=>$d,'file'=>$c],sprintf('Review the SEO details for the newly uploaded media file "%s" (MIME type: %s). Ensure a descriptive title, relevant caption, appropriate alt text, and a comprehensive description are set. Optimize these elements with relevant keywords to enhance search engine indexing and accessibility. Consider the visual content and its context within the site.',$c,$b));},10,1);
        add_action('comment_post',function($a,$b,$c){do_action('sitecore/create_task','comment_moderation',['post_id'=>$a,'content'=>$c['comment'],'email'=>$c['comment_author_email'],'author'=>$c['comment_author'],'ip'=>$c['comment_author_IP']],sprintf('Review the newly posted comment (ID: %d) by "%s" (%s) with IP address %s. Analyze the content for spam, hate speech, profanity, irrelevant links, or any violation of community guidelines. Determine if the comment should be approved, held for moderation, or marked as spam. Content: "%s"',$a,$c['comment_author'],$c['comment_author_email'],$c['comment_author_IP'],$c['comment']));},10,3);
        add_action('user_register',function($a){$b=get_userdata($a);if($b){do_action('sitecore/create_task','new_user_onboarding',['post_id'=>$a,'login'=>$b->user_login,'email'=>$b->user_email,'name'=>$b->display_name],sprintf('Initiate the onboarding process for the new user "%s" (username: %s, email: %s). This may involve sending a welcome email with essential information, guiding them to complete their profile details, explaining key website features, and assigning any necessary initial roles or permissions based on their registration context.',$b->display_name,$b->user_login,$b->user_email));}},10,1);
        // WooCommerece
        add_action('woocommerce_new_order',function($a){$b=wc_get_order($a);if($b){$c=$b->get_order_number();$d=$b->get_billing_email();$e=$b->get_formatted_order_total();$f=$b->get_shipping_address();$g=$b->get_billing_address();$h=$b->get_items();do_action('sitecore/create_task','order_processing',['post_id'=>$a,'number'=>$c,'email'=>$d,'total'=>$e,'shipping'=>$f,'billing'=>$g,'items'=>$h],sprintf('Process new WooCommerce order #%s (Total: %s) placed by %s. Verify order details, check inventory for all items, and initiate the fulfillment process according to the shipping address: %s. If any items are out of stock or there are any issues, flag the order for manual review. Also, consider sending an initial order confirmation to the customer (%s).',$c,$e,$d,$f,$d));}},10,1);
        add_action('woocommerce_payment_complete',function($a){$b=wc_get_order($a);if($b){$c=$b->get_order_number();$d=$b->get_shipping_method();$e=$b->get_billing_email();do_action('sitecore/create_task','payment_completed',['post_id'=>$a,'number'=>$c,'shipping'=>$d,'email'=>$e],sprintf('Payment has been completed for WooCommerce order #%s. Update the order status to "processing" and prepare for shipment using the selected method: %s. Notify the customer (%s) about the successful payment and provide an estimated shipping timeframe or tracking information if available.',$c,$d,$e));}},10,1);
        add_action('woocommerce_order_status_changed',function($a,$b,$c){$d=wc_get_order($a);if($d){$e=$d->get_order_number();$f=$d->get_billing_email();do_action('sitecore/create_task','order_status_update',['post_id'=>$a,'number'=>$e,'old'=>$b,'new'=>$c,'email'=>$f],sprintf('The status of WooCommerce order #%s for customer %s has changed from "%s" to "%s". Based on this new status, take the appropriate next steps. For example, if the status is "processing", initiate shipping; if "completed", send a shipment confirmation and potential follow-up; if "cancelled" or "refunded", process accordingly and notify the customer.',$e,$f,$b,$c));}},10,3);
        // necessery hooks
        // add_action('switch_theme',function($a,$b){do_action('sitecore/create_task','theme_switch_review',['name'=>$a,'version'=>$b->get('Version')],sprintf('The active WordPress theme has been switched to "%s" (version: %s). Review the website\'s front-end and back-end for any potential layout issues, broken functionalities, widget misplacements, or compatibility problems introduced by the new theme. Check if any theme-specific configurations or settings need to be adjusted. Ensure the site remains visually consistent and fully functional after the theme switch.',$a,$b->get('Version')));},10,2);
        // add_action('activated_plugin',function($a){$b=get_plugin_data(WP_PLUGIN_DIR.'/'.$a);do_action('sitecore/create_task','plugin_activation_review',['name'=>$b['Name'],'version'=>$b['Version'],'author'=>$b['Author'],'description'=>$b['Description']],sprintf('The plugin "%s" (version: %s) by %s has been activated. Review the plugin\'s description: "%s". Ensure it integrates correctly with the website and other active plugins without causing any conflicts. Check its settings for optimal configuration and determine if any immediate actions or setup steps are required for its proper functioning. Consider its impact on site performance and security.',esc_html($b['Name']),esc_html($b['Version']),esc_html($b['Author']),esc_html($b['Description'])));},10,1);
        // Form submission
        add_action('elementor_pro/forms/new_record',function($r){$n=$r->get_form_settings('form_name');$d=array_column($r->get_field_data(),'value','id');do_action('sitecore/create_task','elem_form',['name'=>$n,'data'=>$d],sprintf('Process Elementor form "%s" submission: %s. Determine next action based on form purpose (e.g., contact->notify, newsletter->subscribe).',$n,json_encode($d)));},10,1);
        add_action('metform/form/submission_success',function($fid,$eid){$f=\MetForm\Core\Forms\Manager::get_instance()->get_form($fid);$fn=$f->form_name??'Unnamed Metform';$ed=metform_get_entry_data($eid);$pd=wp_list_pluck($ed,'value','label');do_action('sitecore/create_task','metform_submit',['post_id'=>$fid,'name'=>$fn,'entry'=>$eid,'data'=>$pd],sprintf('Process Metform "%s" (ID:%d, Entry:%d) submission: %s. Determine next action based on form purpose (e.g., contact->notify, newsletter->subscribe, payment->verify).',$fn,$fid,$eid,json_encode($pd)));},10,2);

    }

    public function add_menu_page() {
        add_menu_page(
            __('Jobs', 'site-core'),
            __('Jobs', 'site-core'),
            'manage_options',
            'automated-jobs',
            [$this, 'job_listing_admin_menu_page'],
            'dashicons-pets'
        );
    }

    public static function set_screen($status, $option, $value) {
        return ($option === 'jobs_per_page') ? $value : $status;
    }

    public function job_listing_admin_menu_page() {
        global $wpdb;
        $statuses = $wpdb->get_col("SELECT DISTINCT status FROM {$this->table}");
        $task_types = $wpdb->get_col("SELECT DISTINCT task_type FROM {$this->table}");
        $config = json_encode([
            'statuses' => $statuses,
            'task_types' => $task_types,
            // 'errors' => $this->list_wp_error_transients()
        ]);
        ?>
        <div class="wrap" id="automated_task_table" data-config="<?php echo esc_attr($config); ?>">
            <h2><?php echo esc_html(__('Jobs', 'site-core')); ?></h2>
        </div>
        <?php
        wp_enqueue_script('task-onboarding', WP_SITECORE_BUILD_JS_URI . '/task.js', [], Assets::filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/task.js'), true);
        wp_enqueue_style('site-core');
    }

    public function screen_option() {
        $option = 'per_page';
        $args   = [
            'default' => 20,
            'option'  => 'jobs_per_page',
            'label'   => __('Jobs', 'site-core')
        ];
        add_screen_option($option, $args);
    }

    public function add_wp_error_transient(mixed $error_data, string $prefix = 'prt_ed_', int $expiration = 3600): bool {
        $transient_name = $prefix . time() . '_' . wp_generate_password(8, false);
        return set_transient($transient_name, $error_data, $expiration);
    }

    public function list_wp_error_transients(string $prefix = 'prt_ed_'): void {
        global $wpdb;
    
        $like_prefix = esc_sql($prefix) . '%';
        $transient_keys = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
                '_transient_' . $like_prefix
            )
        );
    
        if (empty($transient_keys)) {
            echo '<p>No errors found in transients with the prefix "' . esc_html($prefix) . '".</p>';
            return;
        }
    
        echo '<h3>Error Logs Found in Transients (Prefix: ' . esc_html($prefix) . ')</h3>';
        echo '<ul>';
    
        foreach ($transient_keys as $transient_key) {
            $error_data = get_transient(str_replace('_transient_', '', $transient_key));
            if (!empty($error_data)) {
                echo '<li><strong>Transient Key:</strong> ' . esc_html(str_replace('_transient_', '', $transient_key)) . '<br>';
                echo '<pre>';
                print_r($error_data);
                echo '</pre></li>';
            }
        }
    
        echo '</ul>';
    }

    public function get_attachment_schema(WP_REST_Request $request) {
        $file_name = $request->get_param('file_name') ?? null;
        $file_path = WP_SITECORE_DIR_PATH . '/templates/schemas/'. $file_name .'.json';
        if ($file_name && file_exists($file_path) && ! is_dir($file_path)) {
            $file_content = file_get_contents($file_path);
            $file_content = json_decode($file_content);
            return new WP_REST_Response($file_content, 200);
        }
        return new WP_REST_Response(new WP_Error('not_found', 'File not found'), 404);
    }

    public function perform_task($task_id, $submitted_data) {
        global $wpdb;

        $table = $this->table;

        // Fetch the task
        $task = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $task_id));
        if (!$task) {
            return new WP_Error('task_not_found', 'No task found with the given ID.', ['status' => 404]);
        }

        $task_type = $task->task_type;
        $task->task_object = maybe_unserialize($task->task_object);
        $submitted_data = is_array($submitted_data) ? $submitted_data : json_decode($submitted_data, true);

        // Load schema file
        $schema_path = WP_SITECORE_DIR_PATH . '/templates/schemas/' . sanitize_file_name($task_type) . '.json';
        if (!file_exists($schema_path)) {
            return new WP_Error('schema_not_found', 'Schema file not found for task type: ' . esc_html($task_type));
        }

        $schema = json_decode(file_get_contents($schema_path), true);
        if (!$schema || json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('invalid_schema', 'Failed to parse schema for task type: ' . esc_html($task_type));
        }

        try {
            switch ($task_type) {
                case 'seo_improvements':
                    $post = $submitted_data['post'] ?? null;
                    $meta = $submitted_data['postmeta'] ?? [];

                    if (!$post || empty($post['post_id'])) {
                        return new WP_Error('missing_post_id', 'Post ID is required for seo_improvements task.');
                    }

                    $post_id = (int) $post['post_id'];

                    // Prepare post data for update
                    $post_update = ['ID' => $post_id];
                    if (isset($post['post_title'])) {
                        $post_update['post_title'] = wp_strip_all_tags($post['post_title']);
                    }
                    if (isset($post['post_content'])) {
                        $post_update['post_content'] = $post['post_content'];
                    }
                    if (isset($post['post_status'])) {
                        $post_update['post_status'] = $post['post_status'];
                    }
                    if (isset($post['post_date'])) {
                        $post_update['post_date'] = $post['post_date'];
                    }
                    // Update the post
                    $result = wp_update_post($post_update, true);
                    if (is_wp_error($result)) {
                        return $result;
                    }
                    // Update post meta
                    foreach ($meta as $key => $value) {
                        update_post_meta($post_id, sanitize_key($key), maybe_serialize($value));
                    }
                    break;
                case 'post_seo':
                    $post_id = $task->task_object['post_id'] ?? 0;
                    if (!$post_id || get_post_status($post_id) === false) {
                        return new WP_Error('invalid_post', 'Invalid or missing post_id.');
                    }

                    $title = $submitted_data['title'] ?? '';
                    $slug = $submitted_data['slug'] ?? '';
                    $focus_keyword = $submitted_data['focusKeyword'] ?? '';
                    $meta_description = $submitted_data['metaDescription'] ?? '';
                    $seo_analysis = $submitted_data['seoAnalysis'] ?? [];
                    $actions = $submitted_data['actions'] ?? [];

                    if (empty($actions)) {
                        return new WP_Error('missing_actions', 'No actionable instructions provided.');
                    }

                    // Apply title update
                    if (!empty($actions['modifyTitle']) && !empty($title)) {
                        wp_update_post([
                            'ID' => $post_id,
                            'post_title' => wp_strip_all_tags($title)
                        ]);
                    }

                    // Apply slug update
                    if (!empty($actions['updateSlug']) && !empty($slug)) {
                        wp_update_post([
                            'ID' => $post_id,
                            'post_name' => sanitize_title($slug)
                        ]);
                    }

                    // Apply meta description
                    if (!empty($actions['updateMetaDescription']) && !empty($meta_description)) {
                        update_post_meta($post_id, '_aioseo_description', sanitize_text_field($meta_description));
                        update_post_meta($post_id, '_yoast_wpseo_metadesc', sanitize_text_field($meta_description));
                    }

                    // Apply focus keyword
                    if (!empty($actions['addFocusKeyword']) && !empty($focus_keyword)) {
                        update_post_meta($post_id, '_aioseo_focuskw', sanitize_text_field($focus_keyword));
                        update_post_meta($post_id, '_yoast_wpseo_focuskw', sanitize_text_field($focus_keyword));
                    }

                    // Optionally store SEO analysis report as JSON
                    if (!empty($seo_analysis)) {
                        update_post_meta($post_id, '_seo_analysis_report', wp_json_encode($seo_analysis));
                    }

                    break;
                case 'payment_completed':
                    $order_id = $submitted_data['orderId'] ?? '';
                    $payment = $submitted_data['paymentDetails'] ?? [];
                    $customer = $submitted_data['customerDetails'] ?? [];
                    $actions = $submitted_data['actions'] ?? [];

                    if (empty($order_id) || empty($payment) || empty($customer) || empty($actions)) {
                        return new WP_Error('missing_fields', 'Required payment_completed fields are missing.');
                    }

                    $wc_order = wc_get_order($order_id);
                    if (!$wc_order) {
                        return new WP_Error('invalid_order', 'The provided order ID is not valid.');
                    }

                    // Update order note with payment info
                    $note = sprintf(
                        'Payment completed: %s %s via %s (Transaction ID: %s)',
                        wc_price($payment['amount'], ['currency' => $payment['currency']]),
                        $payment['currency'],
                        $payment['paymentMethod'],
                        $payment['transactionId']
                    );
                    $wc_order->add_order_note($note);

                    // Update status if needed
                    if ($wc_order->get_status() !== 'processing') {
                        $wc_order->update_status('processing', 'Order marked as processing after payment completion.');
                    }

                    // Send emails
                    $email_content = $actions['emailContent'] ?? [];

                    if (!empty($actions['sendEmailToCustomer']) && !empty($customer['email']) && !empty($email_content['customerEmail'])) {
                        wp_mail($customer['email'], 'Your Order Payment is Complete', $email_content['customerEmail']);
                    }

                    if (!empty($actions['notifyAdmin']) && !empty($email_content['adminEmail'])) {
                        wp_mail(get_option('admin_email'), 'Payment Completed - Order #' . $wc_order->get_order_number(), $email_content['adminEmail']);
                    }

                    if (!empty($email_content['supplierEmail'])) {
                        wp_mail('supplier@example.com', 'Supplier Notification - Payment Completed', $email_content['supplierEmail']);
                    }

                    if (!empty($email_content['shopManagerEmail'])) {
                        wp_mail('shop.manager@example.com', 'Shop Manager Notification - Payment Completed', $email_content['shopManagerEmail']);
                    }

                    break;
                case 'order_status_update':
                    $order_id = $submitted_data['orderId'] ?? '';
                    $new_status = $submitted_data['newStatus'] ?? '';
                    $customer = $submitted_data['customerDetails'] ?? [];
                    $summary = $submitted_data['orderSummary'] ?? [];
                    $reason = $submitted_data['statusChangeReason'] ?? '';
                    $actions = $submitted_data['actions'] ?? [];

                    if (empty($order_id) || empty($new_status) || empty($customer) || empty($summary) || empty($actions)) {
                        return new WP_Error('missing_data', 'Required fields are missing in order_status_update task.');
                    }

                    $wc_order = wc_get_order($order_id);
                    if (!$wc_order) {
                        return new WP_Error('invalid_order', 'Order not found.');
                    }

                    // Update order status
                    if ($wc_order->get_status() !== $new_status) {
                        $note = 'Order status changed to "' . $new_status . '"';
                        if (!empty($reason)) {
                            $note .= ' - Reason: ' . $reason;
                        }
                        $wc_order->update_status($new_status, $note);
                    }

                    // Send emails
                    $email_content = $actions['emailContent'] ?? [];

                    if (!empty($actions['sendEmailToCustomer']) && !empty($customer['email']) && !empty($email_content['customerEmail'])) {
                        wp_mail($customer['email'], 'Order Status Updated', $email_content['customerEmail']);
                    }

                    if (!empty($actions['notifyAdmin']) && !empty($email_content['adminEmail'])) {
                        wp_mail(get_option('admin_email'), 'Order Status Changed - #' . $wc_order->get_order_number(), $email_content['adminEmail']);
                    }

                    break;
                case 'order_processing':
                    $order_id = $submitted_data['orderId'] ?? '';
                    $customer = $submitted_data['customerDetails'] ?? [];
                    $items = $submitted_data['orderItems'] ?? [];
                    $payment = $submitted_data['paymentDetails'] ?? [];
                    $analysis = $submitted_data['analysis'] ?? [];
                    $actions = $submitted_data['actions'] ?? [];

                    if (empty($order_id) || empty($customer) || empty($items) || empty($payment) || empty($analysis) || empty($actions)) {
                        return new WP_Error('missing_data', 'Required fields are missing in order_processing task.');
                    }

                    $wc_order = wc_get_order($order_id);
                    if (!$wc_order) {
                        return new WP_Error('invalid_order', 'Order not found.');
                    }

                    // Address correction (if any)
                    if (!empty($analysis['isAddressCorrected']) && !empty($analysis['addressCorrections'])) {
                        $corrections = $analysis['addressCorrections'];
                        $address_update = [];

                        if (!empty($corrections['correctedAddressLine1'])) {
                            $address_update['address_1'] = $corrections['correctedAddressLine1'];
                        }
                        if (!empty($corrections['correctedCity'])) {
                            $address_update['city'] = $corrections['correctedCity'];
                        }
                        if (!empty($corrections['correctedPostalCode'])) {
                            $address_update['postcode'] = $corrections['correctedPostalCode'];
                        }

                        if (!empty($address_update)) {
                            $wc_order->set_address($address_update, 'shipping');
                            $wc_order->save();
                        }
                    }

                    // Add order note from feedback
                    if (!empty($analysis['feedback'])) {
                        $wc_order->add_order_note('AI Order Feedback: ' . sanitize_text_field($analysis['feedback']));
                    }

                    // Email notifications
                    $email_content = $actions['emailContent'] ?? [];

                    if (!empty($actions['sendEmailToCustomer']) && !empty($customer['email']) && !empty($email_content['customerEmail'])) {
                        wp_mail($customer['email'], 'Your Order is Being Processed', $email_content['customerEmail']);
                    }

                    if (!empty($actions['sendEmailToAdmin']) && !empty($email_content['adminEmail'])) {
                        wp_mail(get_option('admin_email'), 'New Order Processing - #' . $wc_order->get_order_number(), $email_content['adminEmail']);
                    }

                    break;
                case 'new_user_onboarding':
                    $user_id = $task->task_object['post_id'] ?? 0;
                    $user = get_userdata($user_id);

                    if (!$user || !get_user_by('ID', $user_id)) {
                        return new WP_Error('invalid_user', 'User not found.');
                    }

                    $actions = $submitted_data['actions'] ?? [];
                    if (empty($actions['status'])) {
                        return new WP_Error('missing_status', 'No action status provided for user onboarding.');
                    }

                    $status = $actions['status'];
                    $welcome_message = $actions['welcomeMessage'] ?? '';
                    $unapprove_reason = $actions['unapproveReason'] ?? '';

                    switch ($status) {
                        case 'approve':
                            // Optionally update user meta or flags to mark as approved
                            update_user_meta($user_id, 'user_status', 'approved');
                            break;

                        case 'unapprove':
                            // Optionally mark as pending or blocked
                            update_user_meta($user_id, 'user_status', 'unapproved');
                            if (!empty($unapprove_reason)) {
                                update_user_meta($user_id, 'unapprove_reason', sanitize_text_field($unapprove_reason));
                            }
                            break;

                        case 'delete':
                            require_once ABSPATH . 'wp-admin/includes/user.php';
                            wp_delete_user($user_id);
                            break;

                        case 'welcome':
                            if (!empty($user->user_email) && !empty($welcome_message)) {
                                wp_mail($user->user_email, 'Welcome to ' . get_bloginfo('name'), $welcome_message);
                            }
                            break;

                        default:
                            return new WP_Error('invalid_action', 'Unrecognized onboarding action: ' . esc_html($status));
                    }

                    break;
                case 'metform_submit':
                    $form_id = $submitted_data['formId'] ?? '';
                    $entry = $submitted_data['entry'] ?? [];
                    $description = $submitted_data['formDescription'] ?? '';
                    $analysis = $submitted_data['analysis'] ?? [];
                    $actions = $submitted_data['actions'] ?? [];

                    if (empty($form_id) || empty($entry) || empty($analysis) || empty($actions)) {
                        return new WP_Error('missing_data', 'Missing required fields in MetForm submission.');
                    }

                    // Log entry analysis as post meta or custom storage if needed
                    $log_entry = [
                        'form_id' => $form_id,
                        'submitted_fields' => $entry['submittedFields'] ?? [],
                        'submitted_at' => $entry['timestamp'] ?? current_time('mysql'),
                        'form_description' => $description,
                        'validity' => $analysis['entryValidity'] ?? null,
                        'intent' => $analysis['purposeAnalysis'] ?? '',
                        'feedback' => $analysis['feedback'] ?? []
                    ];

                    // Store log as option (you may want to move this to DB or a custom table)
                    add_option('metform_entry_log_' . wp_generate_password(8, false), wp_json_encode($log_entry));

                    // Send email if requested
                    if (!empty($actions['sendEmailNotification'])) {
                        $recipient = get_option('admin_email');
                        $subject = 'New MetForm Submission (Form ID: ' . esc_html($form_id) . ')';
                        $body = "Purpose: " . $description . "\n\n";

                        if (!empty($entry['submittedFields'])) {
                            $body .= "Submitted Fields:\n";
                            foreach ($entry['submittedFields'] as $key => $value) {
                                $body .= esc_html($key) . ': ' . esc_html($value) . "\n";
                            }
                        }

                        $body .= "\nIntent Analysis: " . ($analysis['purposeAnalysis'] ?? 'N/A') . "\n";
                        $body .= "Valid Entry: " . (!empty($analysis['entryValidity']) ? 'Yes' : 'No') . "\n";

                        if (!empty($analysis['feedback'])) {
                            $body .= "\nFeedback:\n- " . implode("\n- ", array_map('esc_html', $analysis['feedback']));
                        }

                        wp_mail($recipient, $subject, $body);
                    }

                    // Handle redirect URL or display message if needed
                    if (!empty($actions['redirectUrl'])) {
                        update_option('metform_redirect_' . $form_id, esc_url_raw($actions['redirectUrl']));
                    }

                    if (!empty($actions['displayMessage'])) {
                        update_option('metform_message_' . $form_id, sanitize_text_field($actions['displayMessage']));
                    }

                    break;
                case 'media_seo':
                    $filename = $submitted_data['filename'] ?? '';
                    if (empty($filename)) {
                        return new WP_Error('missing_filename', 'Media filename is required.');
                    }

                    $media_id = $task->task_object['post_id']; // ?? attachment_url_to_postid(wp_upload_dir()['baseurl'] . '/' . ltrim($filename, '/'));

                    if (!$media_id) {
                        return new WP_Error('media_not_found', 'No media found for the provided filename.' . json_encode($task));
                    }

                    $update_args = [
                        'ID' => $media_id,
                        'post_title' => sanitize_text_field($submitted_data['title'] ?? ''),
                        'post_name' => sanitize_title($submitted_data['slug'] ?? ''),
                        'post_excerpt' => sanitize_text_field($submitted_data['caption'] ?? ''),
                        'post_content' => sanitize_textarea_field($submitted_data['description'] ?? '')
                    ];
                    wp_update_post($update_args);

                    update_post_meta($media_id, '_wp_attachment_image_alt', sanitize_text_field($submitted_data['altText'] ?? ''));
                    update_post_meta($media_id, '_media_keywords', array_map('sanitize_text_field', $submitted_data['keywords'] ?? []));
                    update_post_meta($media_id, '_media_meta_description', sanitize_textarea_field($submitted_data['metaDescription'] ?? ''));

                    if (!empty($submitted_data['schema'])) {
                        update_post_meta($media_id, '_media_schema_headline', sanitize_text_field($submitted_data['schema']['headline'] ?? ''));
                        update_post_meta($media_id, '_media_schema_description', sanitize_textarea_field($submitted_data['schema']['description'] ?? ''));
                    }

                    break;
                case 'elem_form':
                    $form_id = sanitize_text_field($submitted_data['formId'] ?? '');
                    $entry = $submitted_data['entry']['submittedFields'] ?? [];
                    $timestamp = $submitted_data['entry']['timestamp'] ?? '';
                    $description = sanitize_text_field($submitted_data['formDescription'] ?? '');
                    $analysis = $submitted_data['analysis'] ?? [];
                    $actions = $submitted_data['actions'] ?? [];

                    // Optionally log or store the submission
                    $log_entry = [
                        'form_id' => $form_id,
                        'timestamp' => $timestamp,
                        'description' => $description,
                        'analysis' => $analysis,
                        'entry' => $entry
                    ];
                    // Example: store in a custom log post type or custom table if needed

                    // Perform actions
                    if (!empty($actions['sendEmailNotification'])) {
                        $to = get_option('admin_email');
                        $subject = "New Elem Form Submission (Form ID: {$form_id})";
                        $body = "Form submitted at: {$timestamp}\n\nDescription: {$description}\n\nSubmitted Fields:\n";
                        foreach ($entry as $key => $value) {
                            $body .= "{$key}: {$value}\n";
                        }
                        $body .= "\n---\nPurpose Analysis: {$analysis['purposeAnalysis']}\nFeedback:\n";
                        foreach ($analysis['feedback'] as $note) {
                            $body .= "- {$note}\n";
                        }
                        wp_mail($to, $subject, $body);
                    }

                    // Optionally return data to redirect or display message
                    if (!empty($actions['redirectUrl'])) {
                        wp_redirect(esc_url_raw($actions['redirectUrl']));
                        exit;
                    }

                    if (!empty($actions['displayMessage'])) {
                        echo esc_html($actions['displayMessage']);
                    }

                    break;
                case 'create_content':
                    $content_type = sanitize_text_field($submitted_data['contentType'] ?? '');
                    $outline = $submitted_data['outline'] ?? [];
                    $seo_data = $submitted_data['seoData'] ?? [];

                    // Construct post content from outline
                    $generated_content = '';
                    if (!empty($outline['headings'])) {
                        foreach ($outline['headings'] as $heading) {
                            $generated_content .= "<h2>" . esc_html($heading) . "</h2>\n";
                        }
                    }
                    if (!empty($outline['keyPoints'])) {
                        foreach ($outline['keyPoints'] as $point_data) {
                            $generated_content .= "<h3>" . esc_html($point_data['point']) . "</h3>\n";
                            $generated_content .= "<p>" . esc_html($point_data['explanation']) . "</p>\n";
                        }
                    }

                    // Prepare post arguments
                    $post_data = $seo_data['posts'] ?? [];
                    $post_args = [
                        'post_title'   => sanitize_text_field($post_data['post_title'] ?? 'Untitled'),
                        'post_content' => $post_data['post_content'] ?? $generated_content,
                        'post_status'  => sanitize_text_field($post_data['post_status'] ?? 'draft'),
                        'post_type'    => ($content_type === 'customPostType') ? 'custom_post_type' : 'post',
                    ];

                    if (!empty($post_data['post_date'])) {
                        $post_args['post_date'] = sanitize_text_field($post_data['post_date']);
                    }

                    $post_id = wp_insert_post($post_args);

                    if (is_wp_error($post_id)) {
                        error_log('Error creating content: ' . $post_id->get_error_message());
                        break;
                    }

                    // Save post meta
                    if (!empty($seo_data['postmeta']) && is_array($seo_data['postmeta'])) {
                        foreach ($seo_data['postmeta'] as $meta) {
                            update_post_meta($post_id, sanitize_key($meta['meta_key']), wp_kses_post($meta['meta_value']));
                        }
                    }

                    // Save Yoast indexable fields (if Yoast is installed and compatible)
                    if (!empty($seo_data['yoast_indexable'])) {
                        $yoast_meta = $seo_data['yoast_indexable'];

                        $yoast_mapping = [
                            '_yoast_wpseo_title' => 'title',
                            '_yoast_wpseo_metadesc' => 'description',
                            '_yoast_wpseo_focuskw' => 'primary_focus_keyword',
                            '_yoast_wpseo_focuskw_score' => 'primary_focus_keyword_score',
                            '_yoast_wpseo_readability_score' => 'readability_score',
                            '_yoast_wpseo_is_cornerstone' => 'is_cornerstone',
                            '_yoast_wpseo_robots_index' => 'is_robots_noindex',
                            '_yoast_wpseo_robots_follow' => 'is_robots_nofollow',
                            '_yoast_wpseo_twitter_title' => 'twitter_title',
                            '_yoast_wpseo_twitter_description' => 'twitter_description',
                            '_yoast_wpseo_opengraph-title' => 'open_graph_title',
                            '_yoast_wpseo_opengraph-description' => 'open_graph_description',
                            '_yoast_wpseo_estimated_reading_time_minutes' => 'estimated_reading_time_minutes',
                        ];

                        foreach ($yoast_mapping as $meta_key => $field_key) {
                            if (isset($yoast_meta[$field_key])) {
                                update_post_meta($post_id, $meta_key, wp_kses_post($yoast_meta[$field_key]));
                            }
                        }
                    }

                    break;
                case 'comment_moderation':
                    $comment_id     = absint($submitted_data['commentId']);
                    $status         = sanitize_text_field($submitted_data['status']);
                    $needs_editing  = filter_var($submitted_data['needsEditing'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    $edited_content = $submitted_data['editedContent'] ?? '';
                    $reply_required = filter_var($submitted_data['replyRequired'] ?? false, FILTER_VALIDATE_BOOLEAN);
                    $reply_content  = $submitted_data['replyContent'] ?? '';
                    $spam_reasons   = $submitted_data['spamReasons'] ?? [];

                    // Update comment status
                    wp_set_comment_status($comment_id, $status);

                    // Update comment content if needed
                    if ($needs_editing && !empty($edited_content)) {
                        wp_update_comment([
                            'comment_ID'      => $comment_id,
                            'comment_content' => wp_kses_post($edited_content)
                        ]);
                    }

                    // Add reply if required
                    if ($reply_required && !empty($reply_content)) {
                        $parent_comment = get_comment($comment_id);
                        if ($parent_comment) {
                            wp_insert_comment([
                                'comment_post_ID'      => $parent_comment->comment_post_ID,
                                'comment_parent'       => $comment_id,
                                'comment_content'      => wp_kses_post($reply_content),
                                'user_id'              => get_current_user_id(),
                                'comment_author'       => 'Admin',
                                'comment_author_email' => get_option('admin_email'),
                                'comment_approved'     => 1,
                                'comment_date'         => current_time('mysql')
                            ]);
                        }
                    }

                    // Store spam reasons if provided
                    if (!empty($spam_reasons) && is_array($spam_reasons)) {
                        update_comment_meta($comment_id, '_spam_reasons', array_map('sanitize_text_field', $spam_reasons));
                    }

                    break;


                default:
                    return new WP_Error('unsupported_task', 'No logic defined for task type: ' . esc_html($task_type));
            }
        } catch (Exception $e) {
            return new WP_Error('task_execution_failed', $e->getMessage(), ['exception' => $e]);
        }

        return true;
    }


    public function get_keys($key_id = false) {
        return [];
    }

    public function get_total_rows() {
        global $wpdb;
        return $wpdb->get_row(
            $wpdb->prepare(
                "SELECT COUNT(*) as total,
                (SELECT COUNT(*) FROM {$this->table} WHERE status='pending') as pending,
                (SELECT COUNT(*) FROM {$this->table} WHERE status='completed') as completed,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='post_seo') as post_seo,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='media_seo') as media_seo,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='elem_form') as elem_form,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='seo_improvements') as seo_improvements,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='comment_moderation') as comment_moderation,
                (SELECT COUNT(*) FROM {$this->table} WHERE task_type='new_user_onboarding') as new_user_onboarding
                FROM {$this->table} WHERE 1
                ;"
            )
        );
    }

}



