<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_User_Query;
use WP_Error;

class Services {
    use Singleton;

    protected $tables;

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) [
			'agreements'  => $wpdb->prefix . 'sitecore_services_agreements',
		];

        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_action('save_post', [$this, 'service_save_meta_boxes']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_shortcode('select-package', [$this, 'select_package_shortcode']);
        add_action('add_meta_boxes', [$this, 'service_register_meta_boxes']);
        add_filter('init', [$this, 'register_services_cpt_and_taxonomies'], 1, 0);
		register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

    
    public function register_activation_hook() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset_collate = $wpdb->get_charset_collate();
        $tables = [
            'agreements' => "
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                signature TEXT NOT NULL,
                referrer VARCHAR(255) DEFAULT NULL,
                services TEXT NOT NULL,
                record TEXT NOT NULL,
                tax_id INT UNSIGNED NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

    public function register_services_cpt_and_taxonomies() {
        register_post_type('service', [
            'labels' => [
                'name' => 'Services',
                'singular_name' => 'Service',
                'add_new' => 'Add New',
                'add_new_item' => 'Add New Service',
                'edit_item' => 'Edit Service',
                'new_item' => 'New Service',
                'view_item' => 'View Service',
                'search_items' => 'Search Services',
                'not_found' => 'No Services found',
                'not_found_in_trash' => 'No Services found in Trash',
                'all_items' => 'All Services',
            ],
            'public' => true,
            'has_archive' => true,
            'rewrite' => ['slug' => 'services'],
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-hammer',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        ]);

        // Service Category (hierarchical)
        register_taxonomy('service_category', 'service', [
            'labels' => [
                'name' => 'Service Categories',
                'singular_name' => 'Service Category',
                'search_items' => 'Search Service Categories',
                'all_items' => 'All Service Categories',
                'parent_item' => 'Parent Service Category',
                'parent_item_colon' => 'Parent Service Category:',
                'edit_item' => 'Edit Service Category',
                'update_item' => 'Update Service Category',
                'add_new_item' => 'Add New Service Category',
                'new_item_name' => 'New Service Category Name',
                'menu_name' => 'Service Categories',
            ],
            'hierarchical' => true,
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_menu' => true,
            'show_in_nav_menus' => false,
            'show_in_rest' => true, // if you want Gutenberg support
            'rewrite' => ['slug' => 'service-category'],
        ]);

        // Service Tag (non-hierarchical)
        register_taxonomy('service_tag', 'service', [
            'labels' => [
                'name' => 'Service Tags',
                'singular_name' => 'Service Tag',
                'search_items' => 'Search Service Tags',
                'popular_items' => 'Popular Service Tags',
                'all_items' => 'All Service Tags',
                'edit_item' => 'Edit Service Tag',
                'update_item' => 'Update Service Tag',
                'add_new_item' => 'Add New Service Tag',
                'new_item_name' => 'New Service Tag Name',
                'menu_name' => 'Service Tags',
            ],
            'hierarchical' => false,
            'public' => false,
            'show_ui' => true,
            'show_admin_column' => true,
            'show_in_menu' => true,
            'show_in_nav_menus' => false,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'service-tag'],
        ]);

    }
    
    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/services/list', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_services_list'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/services/agreement', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_services_agreement'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/services/agreements', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_agreements_list'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function api_get_services_list(WP_REST_Request $request) {
        $tax_id = $request->get_param('tax_id');
        $args = [
            'post_type' => 'service',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'fields' => 'ids',
            'tax_query' => [
                [
                    'field' => 'term_id',
                    'taxonomy' => 'service_category',
                    'terms' => $tax_id,
                ],
            ],
        ];
        $services = get_posts($args);

        $result = [
            'list' => [],
            'config' => [
                'website' => get_site_url(),
                'taxName' => get_the_category_by_ID((int) $tax_id),
                'logo' => apply_filters('pm_project/system/getoption', 'services-logo', ''),
                'pre' => apply_filters('pm_project/system/getoption', 'services-deal-pre', ''),
                'post' => apply_filters('pm_project/system/getoption', 'services-deal-post', ''),
                'phone' => apply_filters('pm_project/system/getoption', 'services-deal-phone', ''),
                'email' => apply_filters('pm_project/system/getoption', 'services-deal-email', ''),
                'address' => apply_filters('pm_project/system/getoption', 'services-deal-address', ''),
                'bankaddress' => apply_filters('pm_project/system/getoption', 'services-bankaddress', ''),
                'agencySignature' => apply_filters('pm_project/system/getoption', 'services-signature', ''),
                'background' => apply_filters('pm_project/system/getoption', 'services-deal-background', '#02424F'),
                'agencyRepresentative' => apply_filters('pm_project/system/getoption', 'services-representative', ''),
            ]
        ];
        foreach ($services as $service_id) {
            $result['list'][] = [
                'id'            => $service_id,
                'title'         => get_the_title($service_id),
                'excerpt'       => get_the_excerpt($service_id),
                'permalink'     => get_the_permalink($service_id),
                'pricing'       => get_post_meta($service_id, '_service_conditionals', true)
            ];
        }
        return rest_ensure_response($result);
    }
    public function api_update_services_agreement(WP_REST_Request $request) {
        $id = $request->get_param('id');global $wpdb;
        $_referrar = $request->get_param('_referrar');
        $services = $request->get_param('services');
        $record = json_decode(stripslashes($request->get_param('record')), true);
        $tax_id = $request->get_param('tax_id');

        if (empty($tax_id) || empty($services) || empty($record)) {
            return new WP_Error('invalid_data', __('Invalid data provided', 'site-core'), ['status' => 400]);
        }

        $file = $request->get_file_params()['signature'] ?? null;
        if ($file && $file['error'] !== UPLOAD_ERR_OK) {
            return new WP_Error('upload_error', 'File upload failed', ['status' => 400]);
        }

        $signature = $this->upload_pdf_file($file);
        if (is_wp_error($signature)) {return $signature;}
        
        if ($id) {
            $result = $wpdb->update(
                $this->tables->agreements,
                [
                    'signature' => maybe_serialize($signature),
                    'tax_id' => $tax_id,
                    'services' => $services,
                    'record' => maybe_serialize($record),
                ],
                ['id' => $id],
                ['%s', '%s', '%s', '%s'],
                ['%d']
            );
        } else {
            $result = $wpdb->insert(
                $this->tables->agreements,
                [
                    'signature' => maybe_serialize($signature),
                    'tax_id' => $tax_id,
                    'services' => $services,
                    'record' => maybe_serialize($record),
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql'),
                    'referrer' => $_referrar,
                ],
                ['%s', '%s', '%s', '%s', '%s', '%s']
            );
            $id = $wpdb->insert_id;
        }

        if ($result && $id) {
            $sent = $this->send_aggrement_email($id, 'confirmation-client');
            $sent = $this->send_aggrement_email($id, 'confirmation-admin');
        }

        return rest_ensure_response(['success' => $result, 'error' => $wpdb->last_error]);
    }
    public function api_get_agreements_list(WP_REST_Request $request) {
        global $wpdb;
        $search   = $request->get_param('search');
        $_status  = $request->get_param('status');
        $order_by = $request->get_param('order_by') ?: 'id';
        $page     = max(1, (int) $request->get_param('page'));
        $order    = strtoupper($request->get_param('order') ?: 'ASC');
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $offset   = ($page - 1) * $per_page;

        // Allowed fields for order_by to prevent SQL injection
        $allowed_order_by = ['id', 'referrer', 'services', 'record', 'tax_id', 'created_at', 'updated_at'];
        if (!in_array($order_by, $allowed_order_by, true)) {
            $order_by = 'id';
        }

        // Allowed sort order
        if (!in_array($order, ['ASC', 'DESC'], true)) {
            $order = 'DESC';
        }

        // Base WHERE
        $where = 'WHERE 1=1';
        $params = [];

        // if (!empty($_status) && $_status != 'any') {
        //     $where .= " AND _status = %s";
        //     $params[] = $_status;
        // }

        if (!empty($search)) {
            $where .= " AND (record LIKE %s OR services LIKE %s)";
            $params[] = '%' . $wpdb->esc_like($search) . '%';
            $params[] = '%' . $wpdb->esc_like($search) . '%';
        }

        // Get total count.
        $count_sql = "SELECT COUNT(*) FROM {$this->tables->agreements} {$where}";
        $total_items = (int) $wpdb->get_var($wpdb->prepare($count_sql, ...$params));

        // Get results
        $data_sql = "SELECT * FROM {$this->tables->agreements} {$where} ORDER BY {$order_by} {$order} LIMIT %d OFFSET %d";
        $params[] = $per_page;$params[] = $offset;
        $results = $wpdb->get_results($wpdb->prepare($data_sql, ...$params));

        foreach ($results as $index => $result) {
            $result->signature = (object) maybe_unserialize($result->signature);
            $result->signature->url = set_url_scheme($result->signature->url);
            $result->record = maybe_unserialize($result->record);
            $result->services = maybe_unserialize($result->services);
            $services = [];
            foreach (explode(',', $result->services) as $service_id) {
                $services[] = ['id' => $service_id, 'title' => get_the_title((int) $service_id), 'url' => get_the_permalink((int) $service_id)];
            }
            $result->services = $services;
            $results[$index] = $result;
        }

        // Pagination headers
        $max_pages = ceil($total_items / $per_page);
        $response = rest_ensure_response($results);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $max_pages);
        $response->header('X-WP-lasterror', $wpdb->last_error);

        return $response;
    }

    private function upload_pdf_file($file) {
        if (empty($file) || !isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return new WP_Error('invalid_file', __('Invalid file upload', 'site-core'), ['status' => 400]);
        }
        // Get WordPress uploads directory
        $upload_dir = wp_upload_dir();
        $pdf_dir    = trailingslashit($upload_dir['basedir']) . 'pdfdocuments/';

        // Create directory if not exists
        if (!file_exists($pdf_dir)) {
            wp_mkdir_p($pdf_dir);
        }

        // Generate safe filename
        $filename   = sanitize_file_name($file['name']);
        $target     = $pdf_dir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            return new WP_Error('move_error', 'Failed to save PDF', ['status' => 500]);
        }

        // File URL
        $file_url = trailingslashit($upload_dir['baseurl']) . 'pdfdocuments/' . $filename;

        // Example DB update or return
        // $wpdb->update(...);

        return ['url' => $file_url, 'path' => $target];
    }
    
    public function service_register_meta_boxes() {
        add_meta_box(
            'service_basic_info',
            'Basic Information',
            [$this, 'service_metabox_callback'],
            'service',
            'normal',
            'default'
        );
    }
    public function service_metabox_callback($post) {
        $metabox = get_post_meta($post->ID, '_service_conditionals', true);
        $base_tax = get_post_meta($post->ID, '_service_base_tax', true);
        $metabox = !$metabox ? [] : $metabox;
        wp_enqueue_style('site-core');
        wp_enqueue_script('site-core');
        ?>
        <div class="xpo_flex xpo_flex-col xpo_gap-3">
            <fieldset>
                <div class="xpo_flex xpo_items-center xpo_gap-2">
                    <label for="_service_base_tax"><?php esc_html_e('Base Taxonomy ID', 'site-core'); ?></label>
                    <input type="text" name="_service_base_tax" id="_service_base_tax" value="<?php echo esc_attr($base_tax); ?>" />
                </div>
            </fieldset>

            <div id="services_meta-box" data-config="<?php echo esc_attr( json_encode( $metabox ) ); ?>">
                This text should be disappeared within a seconds. if you see this yet, please contact developer.
            </div>
        </div>
        <?php
    }
    public function service_save_meta_boxes($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        if (!empty($_POST['_service_conditionals'])) {
            $conditionals = json_decode(stripslashes($_POST['_service_conditionals']), true);
            update_post_meta($post_id, '_service_conditionals', $conditionals);
        }
        if (!empty($_POST['_service_base_tax'])) {
            update_post_meta($post_id, '_service_base_tax', sanitize_text_field($_POST['_service_base_tax']) ?? '');
        }
    }


    public function select_package_shortcode($atts) {
        $atts = shortcode_atts([
            'tax_id' => null,
            'button_text' => 'Select',
        ], $atts, 'select-package');
        if (empty($atts['tax_id'])) {
            $atts['tax_id'] = get_post_meta(get_the_ID(), '_service_base_tax', true);
        }
        $output = sprintf(
            '<button class="select-package-button" data-tax_id="%s">%s</button>',
            esc_attr($atts['tax_id']), esc_html($atts['button_text'])
        );
        // $output .= sprintf('<script type="text/javascript" src="%s"></script>', esc_url());
        wp_enqueue_style('site-core');
        wp_enqueue_script('site-core');
        return $output;
    }

    
    public function settings($args) {
        $args['services'] = [
            'title'                         => __('Services', 'site-core'),
			'description'					=> __('Service and Service deal maker configuration.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'services-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Mark to disable Service service.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'services-redirect',
					'label'					=> __('Lead', 'site-core'),
					'description'			=> __('Choose [Select service] button action.', 'site-core'),
					'type'					=> 'select',
                    'options'				=> [
                        'redirect'			=> __('Redirect to contact us page', 'site-core'),
                        'deal'				=> __('Open in popup', 'site-core'),
                    ],
					'default'				=> 'deal'
				],
				[
					'id' 					=> 'services-contactus',
					'label'					=> __('Contact US', 'site-core'),
					'description'			=> __('Select contact us page', 'site-core'),
					'type'					=> 'select',
                    'options'				=> Menus::get_instance()->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
				[
					'id' 					=> 'services-logo',
					'label'					=> __('Logo', 'site-core'),
					'description'			=> __('Provide agency logo url', 'site-core'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-signature',
					'label'					=> __('Signature', 'site-core'),
					'description'			=> __('Provide agency representative signature image url.', 'site-core'),
					'type'					=> 'url',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-representative',
					'label'					=> __('Representative', 'site-core'),
					'description'			=> __('Provide agency representative full name.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-pre',
					'label'					=> __('Pre Agreement', 'site-core'),
					'description'			=> __('Provide pre agreement content.', 'site-core'),
					'type'					=> 'textarea',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-post',
					'label'					=> __('Post Agreement', 'site-core'),
					'description'			=> __('Provide post agreement content.', 'site-core'),
					'type'					=> 'textarea',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-address',
					'label'					=> __('Agreement Address', 'site-core'),
					'description'			=> __('Provide agreement agency full address.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-phone',
					'label'					=> __('Agency Tel', 'site-core'),
					'description'			=> __('Provide Agency hotline number.', 'site-core'),
					'type'					=> 'tel',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-email',
					'label'					=> __('Agency Email', 'site-core'),
					'description'			=> __('Provide Agency email address.', 'site-core'),
					'type'					=> 'email',
					'default'				=> ''
				],
				[
					'id' 					=> 'services-deal-background',
					'label'					=> __('Brand Color', 'site-core'),
					'description'			=> __('Provide Agency brand color.', 'site-core'),
					'type'					=> 'color',
					'default'				=> '#02424F'
				],
				[
					'id' 					=> 'services-bankaddress',
					'label'					=> __('Bank Info', 'site-core'),
					'description'			=> __('Provide Bank account details to show to pay through.', 'site-core'),
					'type'					=> 'textarea',
					'default'				=> ''
				],
			]
        ];
        return $args;
    }

    public function get_agreement($agreement_id) {
        global $wpdb;
        $agreement = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tables->agreements} WHERE id = %d", $agreement_id), ARRAY_A);
        if (!$agreement) {
            return new WP_Error('not_found', __('Agreement not found', 'site-core'), ['status' => 404]);
        }
        $agreement['signature'] = maybe_unserialize($agreement['signature']);
        $agreement['record'] = maybe_unserialize($agreement['record']);
        $agreement['services'] = maybe_unserialize($agreement['services']);
        $services = [];
        foreach (explode(',', $agreement['services']) as $service_id) {
            $services[] = ['id' => $service_id, 'title' => get_the_title((int) $service_id)];
        }
        $agreement['services'] = $services;
        return $agreement;
    }

    public function send_aggrement_email($agreement_id, $email_type) {
        $agreement = $this->get_agreement($agreement_id);
        if (is_wp_error($agreement)) {
            return $agreement;
        }
        $_file = $agreement['signature']['path'] ?? '';
        $_template = WP_SITECORE_DIR_PATH . '/templates/emails/agreement-' . $email_type . '.php';
        if (!file_exists($_template)) {
            return new WP_Error('template_not_found', __('Email template not found', 'site-core'));
        }
        // 
        include_once $_template;
        // 
        $sent = wp_mail(...$emailPayload);
        if (!$sent || is_wp_error($sent)) {
            return new WP_Error('email_send_failed', __('Failed to send email', 'site-core'));
        }
        return true;
    }

    public function add_menu_page() {
        add_menu_page(
            __('Contract', 'site-core'),
            __('Contract', 'site-core'),
            'manage_options',
            'contract',
            [$this, 'contract_admin_menu_page'],
            'dashicons-media-document'
        );
    }
    public function contract_admin_menu_page() {
        wp_enqueue_script('site-core');
        wp_enqueue_style('site-core');
        ?>
        <div class="wrap" id="service-contract-leads" data-config="{}"></div>
        <?php
    }
    
}
