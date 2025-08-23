<?php
/**
 * Email handling class
 * Will be used to store email data.
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_User_Query;
use WP_Error;

class Emails {
    use Singleton;

    protected $tables;

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) [
            'templates' => $wpdb->prefix . 'sitecore_email_templates',
            'relations' => $wpdb->prefix . 'sitecore_email_templates_relation',
        ];
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        // add_action('init', [$this, 'load_addons']);
        add_action('init', [$this, 'add_custom_rewrite']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_shortcode('email_template', [$this, 'render_email_template']);
        add_action('template_redirect', [$this, 'handle_email_render_template']);
        add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
        register_activation_hook( WP_SITECORE__FILE__, [$this, 'register_activation_hook'] );
        register_deactivation_hook( WP_SITECORE__FILE__, [$this, 'register_deactivation_hook'] );
        $this->setup_woocommerce_email_template_hooks();
        $this->setup_email_template_hooks();
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        $tableSchemas = [
            'templates' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\ntitle VARCHAR(255) NOT NULL,\n_type TEXT NOT NULL,\n_template longtext NOT NULL DEFAULT ('{\"elements\":[]}'),\n_status ENUM('publish', 'draft', 'trash') DEFAULT 'draft',\ncreated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\nupdated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            'relations' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,\ntemplate_id BIGINT(20) UNSIGNED NOT NULL,\nemail_id TEXT NOT NULL,\nattachments TEXT NOT NULL",
        ];
        foreach ((array) $this->tables as $tableKey => $tableName) {
            dbDelta("CREATE TABLE IF NOT EXISTS {$tableName} (
                {$tableSchemas[$tableKey]}
            ) $charset_collate;");
        }
    }

    public function register_deactivation_hook() {
        global $wpdb;
        foreach ((array) $this->tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$table};");
        }
        
    }

    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/emails/templates', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_emails_templates'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/emails/templates/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_emails_template'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ]
            ]
        ]);
        register_rest_route('sitecore/v1', '/emails/templates/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_emails_template'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
                'title' => [
                    'required' => false,
                    'type' => 'string'
                ],
                '_type' => [
                    'required' => false,
                    'type' => 'string'
                ],
                '_template' => [
                    'required' => false,
                    'type' => 'string'
                ],
                '_status' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'draft'
                ]
            ]
        ]);
        register_rest_route('sitecore/v1', '/emails/templates/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_emails_template'],
            'permission_callback' => '__return_true',
            'args' => [
                'id' => [
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ]
            ]
        ]);
        register_rest_route('sitecore/v1', '/emails/queries', [
            'methods' => 'POST',
            'callback' => [$this, 'api_get_emails_queries'],
            'permission_callback' => '__return_true',
            'args' => [
                'action_id' => [
                    'validate_callback' => function($param) {return !empty($param);},
                    'required' => true,
                    'type' => 'string'
                ],
                'payload' => [
                    'required' => true,
                    'type' => 'object',
                    'validate_callback' => function($param) {return !empty($param);}
                ],
            ]
        ]);
        // 
        register_rest_route('sitecore/v1', '/emails/relations', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_emails_relations'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/emails/relations/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_emails_relation'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/emails/relations/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_emails_relation'],
            'permission_callback' => '__return_true'
        ]);
        register_rest_route('sitecore/v1', '/emails/autocomplete/templates', [
            'methods' => 'POST',
            'callback' => [$this, 'api_get_templates_autocompletions'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function add_custom_rewrite() {
        add_rewrite_rule('^email-templates/([^/]+)/preview/?$', 'index.php?email_template_id=$matches[1]', 'top');
        add_rewrite_tag('%email_template_id%', '([^&]+)');
    }

    public function handle_email_render_template() {
        $template_id = get_query_var('email_template_id');
        if ($template_id) {
            include WP_SITECORE_DIR_PATH . '/templates/email-template.php';
            exit;
        }
    }

    public function render_email_template($args) {
        $args = (object) wp_parse_args($args, ['id' => null]);
        if (!$args->id) {return '';}
        Emails::get_instance()->load_addons();
        $template = Emails::get_instance()->get((int) $args->id);
        return apply_filters('do_render_email_template', '', $template);
    }

    public function admin_enqueue_scripts($curr_page) {
        if ($curr_page !== 'toplevel_page_email-templates') {return;}
        wp_enqueue_script('site-core');
        wp_enqueue_style('site-core');
    }

    public function api_get_emails_templates(WP_REST_Request $request) {
        global $wpdb;
        $search   = $request->get_param('search');
        $_status  = $request->get_param('status');
        $order_by = $request->get_param('order_by') ?: 'id';
        $page     = max(1, (int) $request->get_param('page'));
        $order    = strtoupper($request->get_param('order') ?: 'ASC');
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $offset   = ($page - 1) * $per_page;

        // Allowed fields for order_by to prevent SQL injection
        $allowed_order_by = ['id', 'title', '_type', '_status', 'created_at', 'updated_at'];
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

        if (!empty($_status) && $_status != 'any') {
            $where .= " AND _status = %s";
            $params[] = $_status;
        }

        if (!empty($search)) {
            $where .= " AND title LIKE %s";
            $params[] = '%' . $wpdb->esc_like($search) . '%';
        }

        // Get total count
        $count_sql = "SELECT COUNT(*) FROM {$this->tables->templates} {$where}";
        $total_items = (int) $wpdb->get_var($wpdb->prepare($count_sql, ...$params));

        // Get results
        $data_sql = "SELECT id, title, _type, _status, created_at, updated_at FROM {$this->tables->templates} {$where} ORDER BY {$order_by} {$order} LIMIT %d OFFSET %d";
        $params[] = $per_page;$params[] = $offset;
        $results = $wpdb->get_results($wpdb->prepare($data_sql, ...$params));

        // Pagination headers
        $max_pages = ceil($total_items / $per_page);
        $response = rest_ensure_response($results);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $max_pages);

        return $response;
    }
    
    public function api_get_emails_template(WP_REST_Request $request) {
        $_template = $this->get($request->get_param('id'));
        return rest_ensure_response(['status' => !!$_template, 'template' => $_template]);
    }

    public function api_update_emails_template(WP_REST_Request $request) {
        global $wpdb;

        $_template = $request->get_param('_template');
        $template_id = (int) $request->get_param('id');
        $title = sanitize_text_field($request->get_param('title'));
        $_type = sanitize_text_field($request->get_param('_type'));
        $_status = sanitize_text_field($request->get_param('_status') ?? 'draft');

        if ($template_id === 0) {
            $wpdb->insert($this->tables->templates, [
                'title' => $title,
                '_type' => $_type,
                '_status' => $_status,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
                '_template' => maybe_serialize(json_decode(['elements' => []], true))
            ]);

            $new_id = $wpdb->insert_id;

            return new WP_REST_Response([
                'success' => true,
                'message' => 'Template created successfully.',
                'id' => $new_id
            ], 201);
        } else {
            $data = [];
            $data['updated_at'] = current_time('mysql');
            if (!empty($title)) $data['title'] = $title;
            if (!empty($_type)) $data['_type'] = $_type;
            if (!empty($_status)) $data['_status'] = $_status;
            if (!empty($_template)) $data['_template'] = maybe_serialize(json_decode($_template, true));
            $updated = $wpdb->update($this->tables->templates, $data, ['id' => $template_id]);
            // 
            if ($updated !== false) {
                return new WP_REST_Response([
                    'success' => true,
                    'message' => 'Template updated successfully.',
                    'id' => $template_id
                ], 200);
            } else {
                return new WP_Error('update_failed', 'Failed to update the template.', ['status' => 500]);
            }
        }
    }
    
    public function api_delete_emails_template(WP_REST_Request $request) {
        global $wpdb;
        $template_id = (int) $request->get_param('id');
        $deleted = $wpdb->delete($this->tables->templates, ['id' => $template_id], ['%d']);
        return rest_ensure_response(['success' => $deleted, 'error' => $wpdb->last_error]);
    }

    public function api_get_emails_queries(WP_REST_Request $request) {
        $action_id = $request->get_param('action_id');
        $payload = $request->get_param('payload');

        if (empty($action_id)) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Action ID is required'
            ]);
        }

        $this->load_addons();

        $response = apply_filters('sitecore/email/queries/' . $action_id, null, $request);

        if ($response === null) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'No handler found for the specified action'
            ]);
        }

        if (is_wp_error($response)) {
            return rest_ensure_response([
                'success' => false,
                'message' => $response->get_error_message(),
                'code' => $response->get_error_code()
            ]);
        }

        if ($response instanceof WP_REST_Response) {
            return $response;
        }

        return rest_ensure_response([
            'success' => true,
            'data' => $response
        ]);
    }
    
    public function api_get_emails_relations(WP_REST_Request $request) {
        global $wpdb;
        $search   = $request->get_param('search');
        $_status  = $request->get_param('status');
        $order_by = $request->get_param('order_by') ?: 'id';
        $page     = max(1, (int) $request->get_param('page'));
        $order    = strtoupper($request->get_param('order') ?: 'ASC');
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $offset   = ($page - 1) * $per_page;

        // Allowed fields for order_by to prevent SQL injection
        $allowed_order_by = ['id', 'title', '_type', '_status', 'created_at', 'updated_at'];
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

        if (!empty($_status) && $_status != 'any') {
            $where .= " AND t._status = %s";
            $params[] = $_status;
        }

        if (!empty($search)) {
            $where .= " AND (r.email_id LIKE %s OR t.title LIKE %s)";
            $params[] = '%' . $wpdb->esc_like($search) . '%';
            $params[] = '%' . $wpdb->esc_like($search) . '%';
        }

        // Get total count.
        $count_sql = "SELECT COUNT(*) FROM {$this->tables->relations} r LEFT JOIN {$this->tables->templates} ON t.id = r.template_id {$where}";
        $total_items = (int) $wpdb->get_var($wpdb->prepare($count_sql, ...$params));

        // Get results
        $data_sql = "SELECT r.*, t.title, t._type, t._status FROM {$this->tables->relations} r LEFT JOIN {$this->tables->templates} t ON t.id = r.template_id {$where} ORDER BY {$order_by} {$order} LIMIT %d OFFSET %d";
        $params[] = $per_page;$params[] = $offset;
        $results = $wpdb->get_results($wpdb->prepare($data_sql, ...$params));

        // Pagination headers
        $max_pages = ceil($total_items / $per_page);
        $response = rest_ensure_response($results);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $max_pages);
        $response->header('X-WP-lasterror', $wpdb->last_error);

        return $response;
    }
    public function api_update_emails_relation(WP_REST_Request $request) {
        global $wpdb;
        $id             = (int) $request->get_param('id');
        $email_id       = sanitize_text_field($request->get_param('email_id'));
        $attachments    = sanitize_text_field($request->get_param('attachments'));
        $template_id    = (int) sanitize_text_field($request->get_param('template_id'));

        if ($template_id <= 0) {
            return new WP_Error('invalid_template_id', 'The template id provided is invalid!');
        }
        
        if ($id <= 0) {
            $updated = $wpdb->insert(
                $this->tables->relations,
                [
                    'email_id' => $email_id,
                    'template_id' => $template_id,
                    'attachments' => $attachments,
                ],
                ['%s', '%d', '%s']
            );
        } else {
            $updated = $wpdb->update(
                $this->tables->relations,
                [
                    'email_id' => $email_id,
                    'template_id' => $template_id,
                    'attachments' => $attachments,
                ],
                ['id' => $id],
                ['%s', '%d', '%s'],
                ['%d']
            );
        }


        $response = rest_ensure_response(['success' => $updated]);
        return $response;
    }
    public function api_delete_emails_relation(WP_REST_Request $request) {
        global $wpdb;
        $id = (int) $request->get_param('id');
        // 
        if ($id <= 0) {
            return new WP_Error('invalid_id', 'The relation id provided is invalid!');
        }
        // 
        $updated = $wpdb->delete(
            $this->tables->relations,
            ['id' => $id], ['%d']
        );
        // 
        $response = rest_ensure_response(['success' => $updated, 'error' => $wpdb->last_error]);
        return $response;
    }
    public function api_get_templates_autocompletions(WP_REST_Request $request) {
        $search = $request->get_param('search');global $wpdb;
        $category = $request->get_param('category');
        $results = $category == 'templates' ? $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id AS value, title AS label FROM {$this->tables->templates} WHERE title LIKE %s",
                '%'.$wpdb->esc_like($search).'%'
            )
        ) : [];
        $response = rest_ensure_response($results);
        return $response;
    }
    

    public function get($template_id) {
        global $wpdb;
        $_template = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tables->templates} WHERE id = %d;", $template_id));
        if ($_template) {
            // $_template->_template = ['elements' => []];
            $_template->_template = maybe_unserialize($_template->_template);
        }
        return $_template;
    }
    public function get_email_template($identifier) {
        return $this->get($identifier);
    }
    
    public function load_addons() {
        // include_once WP_SITECORE_DIR_PATH . '/inc/widgets/emails/index.php';
        include_once WP_SITECORE_DIR_PATH . '\\src\\js\\emails\\emails\\index.php';
        Emails\Addons::get_instance();
    }
    
    public function add_admin_menu() {
        add_menu_page(__('Email Templates', 'textdomain'), __('Email Templates', 'textdomain'), 'manage_options', 'email-templates', [$this, 'admin_page'], 'dashicons-email-alt', 20);
    }

    public function admin_page() {
        remove_all_actions('admin_notices');
        ?>
        <div id="email-editor-screen">
            <div style="padding: 70px 20px;background: red;">
                <h1 style="color: #fff;line-height: 40px;">Here we'll implement an overview insight without any controls but just to get insignhts about flows, file storages, drive storages, finance, referrals and so on.</h1>
            </div>
        </div>
        <?php
    }

    /**
     * In this area, we put functions to replace woocommerce email template's parts.
     */
    private function setup_woocommerce_email_template_hooks() {
        add_filter('woocommerce_email_header', [$this, 'replace_woocommerce_email_template'], 10, 2);
        add_filter('woocommerce_email_footer', [$this, 'replace_woocommerce_email_template'], 10, 2);
        add_filter('woocommerce_email_order_details', [$this, 'replace_woocommerce_email_template'], 10, 4);
        add_filter('woocommerce_email_order_meta', [$this, 'replace_woocommerce_email_template'], 10, 3);
        add_filter('woocommerce_email_customer_details', [$this, 'replace_woocommerce_email_template'], 10, 3);
        add_filter('woocommerce_email_after_order_table', [$this, 'replace_woocommerce_email_template'], 10, 4);
        add_filter('wp_mail', [$this, 'replace_wp_email_template'], 10, 1);
    }
    public function replace_woocommerce_email_template($order, $sent_to_admin = false, $plain_text = false, $email = null) {
        $template_type = $email->id;
        $result = $this->get_email_template($template_type);
        if ($result !== null) {
            return $result;
        }
        return $order;
    }
    public function replace_wp_email_template($args) {
        $template_type = $args['subject'];
        $result = $this->get_email_template($template_type);
        if ($result !== null) {
            $args['message'] = $result;
        }
        return $args;
    }

    /**
     * Here we'll setup all hooks to replace general email templates.
     */
    private function setup_email_template_hooks() {
        add_filter('woocommerce_email_get_template', [$this, 'woocommerce_email_get_template'], 10, 2);
        // add_filter('wp_mail', [$this, 'replace_full_wp_mail_template'], 10, 1);
    }
    public function woocommerce_email_get_template($template, $email) {
        $result = $this->get_email_template($email->id);
        return $result !== null ? $result : $template;
    }
    // public function replace_full_wp_mail_template($args) {
    //     $result = $this->get_email_template('wp_' . sanitize_title($args['subject']));
    //     if ($result !== null) {
    //         $args['message'] = $result;
    //         $args['headers'] = array('Content-Type: text/html');
    //     }
    //     return $args;
    // }

}
