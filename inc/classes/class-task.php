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
        $this->table = $wpdb->prefix . 'partnership_tasks';
        $this->setup_hooks();
        $this->setup_job_seeking_hooks();
    }

    protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_plugin_page']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_filter('set-screen-option', [$this, 'set_screen'], 10, 3);
		add_action('partnership/create_task', [$this, 'create_task'], 10, 3);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
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
    
    public function tasks_search(WP_REST_Request $request) {
        global $wpdb;

        $status = $request->get_param('status') ?? 'any';
        $task_type = $request->get_param('task_type') ?? 'any';
        $excluded_ids = $request->get_param('excluded_ids') ? implode(',', array_map('intval', $request->get_param('excluded_ids'))) : null;

        // Build the query dynamically
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $query_conditions = [];

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
        $task_id = $request->get_param( 'task_id' );
        $data = $request->get_param( 'data' );

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
        add_action('post_inserted',function($a,$b,$c,$d){if(!$c){do_action('partnership/create_task','post_seo',['post_id'=>$a,'type'=>$b->post_type],sprintf('Review the SEO for the new %s titled "%s". Analyze the title, meta description, URL slug, headings (H1-H6), image alt text, and internal/external linking. Ensure they are optimized for relevant keywords, readability, and align with SEO best practices to improve search engine visibility and organic traffic potential for this content type.',$b->post_type,$b->post_title));}},10,4);
        add_action('wp_insert_post', function($a,$b,$c){if(!$c){do_action('partnership/create_task','seo_improvements',['post_id'=>$a],sprintf('Analyze the newly created post titled "%s" for SEO. Content, etc., will be fetched via API. Review title, metadata (date, cats, tags). Suggest title improvements, relevant keywords, categories, tags.',esc_html($b->post_title)));}},10,3);
        add_action('add_attachment',function($a){$b=get_post_mime_type($a);$c=basename(get_attached_file($a));$d=wp_get_attachment_metadata($a);do_action('partnership/create_task','media_seo',['post_id'=>$a,'mime'=>$b,'metadata'=>$d,'file'=>$c],sprintf('Review the SEO details for the newly uploaded media file "%s" (MIME type: %s). Ensure a descriptive title, relevant caption, appropriate alt text, and a comprehensive description are set. Optimize these elements with relevant keywords to enhance search engine indexing and accessibility. Consider the visual content and its context within the site.',$c,$b));},10,1);
        add_action('comment_post',function($a,$b,$c){do_action('partnership/create_task','comment_moderation',['post_id'=>$a,'content'=>$c['comment'],'email'=>$c['comment_author_email'],'author'=>$c['comment_author'],'ip'=>$c['comment_author_IP']],sprintf('Review the newly posted comment (ID: %d) by "%s" (%s) with IP address %s. Analyze the content for spam, hate speech, profanity, irrelevant links, or any violation of community guidelines. Determine if the comment should be approved, held for moderation, or marked as spam. Content: "%s"',$a,$c['comment_author'],$c['comment_author_email'],$c['comment_author_IP'],$c['comment']));},10,3);
        add_action('user_register',function($a){$b=get_userdata($a);if($b){do_action('partnership/create_task','new_user_onboarding',['post_id'=>$a,'login'=>$b->user_login,'email'=>$b->user_email,'name'=>$b->display_name],sprintf('Initiate the onboarding process for the new user "%s" (username: %s, email: %s). This may involve sending a welcome email with essential information, guiding them to complete their profile details, explaining key website features, and assigning any necessary initial roles or permissions based on their registration context.',$b->display_name,$b->user_login,$b->user_email));}},10,1);
        // WooCommerece
        add_action('woocommerce_new_order',function($a){$b=wc_get_order($a);if($b){$c=$b->get_order_number();$d=$b->get_billing_email();$e=$b->get_formatted_order_total();$f=$b->get_shipping_address();$g=$b->get_billing_address();$h=$b->get_items();do_action('partnership/create_task','order_processing',['post_id'=>$a,'number'=>$c,'email'=>$d,'total'=>$e,'shipping'=>$f,'billing'=>$g,'items'=>$h],sprintf('Process new WooCommerce order #%s (Total: %s) placed by %s. Verify order details, check inventory for all items, and initiate the fulfillment process according to the shipping address: %s. If any items are out of stock or there are any issues, flag the order for manual review. Also, consider sending an initial order confirmation to the customer (%s).',$c,$e,$d,$f,$d));}},10,1);
        add_action('woocommerce_payment_complete',function($a){$b=wc_get_order($a);if($b){$c=$b->get_order_number();$d=$b->get_shipping_method();$e=$b->get_billing_email();do_action('partnership/create_task','payment_completed',['post_id'=>$a,'number'=>$c,'shipping'=>$d,'email'=>$e],sprintf('Payment has been completed for WooCommerce order #%s. Update the order status to "processing" and prepare for shipment using the selected method: %s. Notify the customer (%s) about the successful payment and provide an estimated shipping timeframe or tracking information if available.',$c,$d,$e));}},10,1);
        add_action('woocommerce_order_status_changed',function($a,$b,$c){$d=wc_get_order($a);if($d){$e=$d->get_order_number();$f=$d->get_billing_email();do_action('partnership/create_task','order_status_update',['post_id'=>$a,'number'=>$e,'old'=>$b,'new'=>$c,'email'=>$f],sprintf('The status of WooCommerce order #%s for customer %s has changed from "%s" to "%s". Based on this new status, take the appropriate next steps. For example, if the status is "processing", initiate shipping; if "completed", send a shipment confirmation and potential follow-up; if "cancelled" or "refunded", process accordingly and notify the customer.',$e,$f,$b,$c));}},10,3);
        // necessery hooks
        add_action('switch_theme',function($a,$b){do_action('partnership/create_task','theme_switch_review',['name'=>$a,'version'=>$b->get('Version')],sprintf('The active WordPress theme has been switched to "%s" (version: %s). Review the website\'s front-end and back-end for any potential layout issues, broken functionalities, widget misplacements, or compatibility problems introduced by the new theme. Check if any theme-specific configurations or settings need to be adjusted. Ensure the site remains visually consistent and fully functional after the theme switch.',$a,$b->get('Version')));},10,2);
        add_action('activated_plugin',function($a){$b=get_plugin_data(WP_PLUGIN_DIR.'/'.$a);do_action('partnership/create_task','plugin_activation_review',['name'=>$b['Name'],'version'=>$b['Version'],'author'=>$b['Author'],'description'=>$b['Description']],sprintf('The plugin "%s" (version: %s) by %s has been activated. Review the plugin\'s description: "%s". Ensure it integrates correctly with the website and other active plugins without causing any conflicts. Check its settings for optimal configuration and determine if any immediate actions or setup steps are required for its proper functioning. Consider its impact on site performance and security.',esc_html($b['Name']),esc_html($b['Version']),esc_html($b['Author']),esc_html($b['Description'])));},10,1);
        // Form submission
        add_action('elementor_pro/forms/new_record',function($r){$n=$r->get_form_settings('form_name');$d=array_column($r->get_field_data(),'value','id');do_action('partnership/create_task','elem_form',['name'=>$n,'data'=>$d],sprintf('Process Elementor form "%s" submission: %s. Determine next action based on form purpose (e.g., contact->notify, newsletter->subscribe).',$n,json_encode($d)));},10,1);
        add_action('metform/form/submission_success',function($fid,$eid){$f=\MetForm\Core\Forms\Manager::get_instance()->get_form($fid);$fn=$f->form_name??'Unnamed Metform';$ed=metform_get_entry_data($eid);$pd=wp_list_pluck($ed,'value','label');do_action('partnership/create_task','metform_submit',['post_id'=>$fid,'name'=>$fn,'entry'=>$eid,'data'=>$pd],sprintf('Process Metform "%s" (ID:%d, Entry:%d) submission: %s. Determine next action based on form purpose (e.g., contact->notify, newsletter->subscribe, payment->verify).',$fn,$fid,$eid,json_encode($pd)));},10,2);

    }

    
    public function add_plugin_page() {
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
        $file_path = WP_SITECORE_DIR_PATH . '/src/js/tasks/schemas/'. $file_name .'.json';
        if ($file_name && file_exists($file_path) && ! is_dir($file_path)) {
            $file_content = file_get_contents($file_path);
            $file_content = json_decode($file_content);
            return new WP_REST_Response($file_content, 200);
        }
        return new WP_REST_Response(new WP_Error('not_found', 'File not found'), 404);
    }

    public function perform_task($task_id, $data) {
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



