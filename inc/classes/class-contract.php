<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Contract {
    use Singleton;

    protected $contract_table;
    protected $column_table;
    protected $card_table;
    protected $member_table;
    protected $checklist_table;
    protected $comment_table;
    protected $attachment_table;

    protected function __construct() {
        global $wpdb;
        $this->contract_table = $wpdb->prefix . 'partnership_contracts';
        $this->column_table = $wpdb->prefix . 'partnership_contract_columns';
        $this->card_table = $wpdb->prefix . 'partnership_contract_cards';
        $this->member_table = $wpdb->prefix . 'partnership_contract_card_members';
        $this->checklist_table = $wpdb->prefix . 'partnership_contract_checklists';
        $this->comment_table = $wpdb->prefix . 'partnership_contract_comments';
        $this->attachment_table = $wpdb->prefix . 'partnership_contract_attachments';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('init', [$this, 'add_custom_rewrite']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('wp_enqueue_scripts', [$this, 'register_scripts']);
        add_filter('partnership/invoice/paid', [$this, 'invoice_paid'], 10, 3);
        add_action('template_redirect', [$this, 'handle_pricing_payment_template']);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook( WP_SITECORE__FILE__, [$this, 'register_deactivation_hook'] );
    }

	public function register_routes() {
		register_rest_route('sitecore/v1', '/contracts/packages', [
			'methods' => 'GET',
			'callback' => [$this, 'get_contracts_packages'],
            'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/contracts/packages/(?P<package_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_contracts_package'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/contracts/packages/(?P<package_id>\d+)/(?P<package_plan>[^/]+)/create', [
			'methods' => 'POST',
			'callback' => [$this, 'create_package_contract'],
            'permission_callback' => function($request) {
                $_proven = Security::get_instance()->permission_callback($request);
                return true;
            }
		]);


        // Contract or project board api starts here
        
		register_rest_route('sitecore/v1', '/contracts', [
			'methods' => 'GET',
			'callback' => [$this, 'get_api_contracts'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
        register_rest_route('sitecore/v1', '/contracts/(?P<contract_id>\\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_api_contract'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/contract', [
            'methods' => 'POST',
            'callback' => [$this, 'api_create_contract'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/contracts/(?P<contract_id>\\d+)/members', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_contract_members'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/contracts/(?P<contract_id>\\d+)/columns', [
            'methods' => 'GET',
            'callback' => [$this, 'get_contract_columns'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/contracts/(?P<contract_id>\\d+)/column', [
            'methods' => 'POST',
            'callback' => [$this, 'create_column'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/columns/(?P<column_id>\\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_column'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/columns/(?P<column_id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_column'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/columns/(?P<column_id>\\d+)/cards', [
            'methods' => 'GET',
            'callback' => [$this, 'get_column_cards'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/columns/(?P<column_id>\\d+)/card', [
            'methods' => 'POST',
            'callback' => [$this, 'create_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_detail'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/checklists', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_checklists'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/checklist', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_checklist_item'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/checklists/(?P<checklist_id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_checklist_item'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/members', [
            'methods' => 'GET',
            'callback' => [$this, 'api_get_card_members'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/members', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_card_members'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/comments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_comments'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/comment', [
            'methods' => 'POST',
            'callback' => [$this, 'api_update_comment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
        register_rest_route('sitecore/v1', '/comments/(?P<comment_id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'api_delete_comment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/attachment', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_card_attachment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);

        register_rest_route('sitecore/v1', '/cards/(?P<card_id>\\d+)/attachments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_card_attachments'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
        ]);
	}

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'contracts/')) {
            $abilities[] = 'contracts';
        }
        return $abilities;
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Contract main table (like a project board)
        $sql_contract_table = "CREATE TABLE IF NOT EXISTS {$this->contract_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            invoice_item_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE(invoice_item_id)
        ) $charset_collate;";

        // Columns on the board (like Trello columns)
        $sql_column_table = "CREATE TABLE IF NOT EXISTS {$this->column_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            contract_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY contract_id (contract_id)
        ) $charset_collate;";

        // Cards inside columns
        $sql_card_table = "CREATE TABLE IF NOT EXISTS {$this->card_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            column_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            sort_order INT DEFAULT 0,
            due_date DATETIME DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY column_id (column_id)
        ) $charset_collate;";

        // Card members
        $sql_card_member_table = "CREATE TABLE IF NOT EXISTS {$this->member_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Checklist items on each card
        $sql_checklist_table = "CREATE TABLE IF NOT EXISTS {$this->checklist_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            sort_order INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id)
        ) $charset_collate;";

        // Comments or discussions on a card
        $sql_comment_table = "CREATE TABLE IF NOT EXISTS {$this->comment_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            user_id BIGINT NOT NULL,
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id),
            KEY user_id (user_id)
        ) $charset_collate;";

        // Attachments on a card
        $sql_attachment_table = "CREATE TABLE IF NOT EXISTS {$this->attachment_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            card_id BIGINT NOT NULL,
            file_url TEXT NOT NULL,
            uploaded_by BIGINT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY card_id (card_id),
            KEY uploaded_by (uploaded_by)
        ) $charset_collate;";


        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_contract_table);
        dbDelta($sql_column_table);
        dbDelta($sql_card_table);
        dbDelta($sql_card_member_table);
        dbDelta($sql_checklist_table);
        dbDelta($sql_comment_table);
        dbDelta($sql_attachment_table);

    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->contract_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->column_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->card_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->member_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->checklist_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->comment_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->attachment_table}");
    }
    
    public function register_scripts() {
        wp_register_script('site-core-pricing', WP_SITECORE_BUILD_JS_URI . '/pricing.js', [], Assets::filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/pricing.js'), true);
        wp_register_style('site-core-pricing', WP_SITECORE_BUILD_CSS_URI . '/pricing.css', [], Assets::filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/pricing.css'), 'all');
        wp_localize_script('site-core-pricing', 'siteCoreConfig', apply_filters('partnershipmang/siteconfig', []));
    }

    public function add_custom_rewrite() {
        add_rewrite_rule('^pricing/?$', 'index.php?custom_pricing=1', 'top');
        add_rewrite_tag('%custom_pricing%', '([^&]+)');
    }

    public function handle_pricing_payment_template() {
        $pricing_id = get_query_var('custom_pricing');
        if ($pricing_id) {
            include WP_SITECORE_DIR_PATH . '/templates/payment-pricing.php';
            exit;
        }
    }
    public function get_contracts_packages(WP_REST_Request $request) {
        // 
        $response = $this->get_packages();
        // 
        return rest_ensure_response($response);
    }
    
    public function get_contracts_package(WP_REST_Request $request) {
        $package_id = (int) $request->get_param('package_id');
        // 
        $packages = $this->get_packages();
        $found_index = array_search($package_id, array_column($packages, 'id'));
        // 
        if ($found_index !== false) {
            $response = $packages[$found_index];
        } else {
            $response = new WP_Error('package_not_found', 'Package with the specified ID not found.', ['status' => 404]);
        }
        // 
        return rest_ensure_response($response);
    }

    public function create_package_contract(WP_REST_Request $request) {
        $store = (int) $request->get_param('store');
        $package_id = (int) $request->get_param('package_id');
        $package_plan = (string) ucfirst($request->get_param('package_plan'));
        // 
        $packages = $this->get_packages();
        $found_index = array_search($package_id, array_column($packages, 'id'));
        // 
        $response = null;
        // 
        if ($found_index !== false) {
            $package = $packages[$found_index];

            if (isset($package['pricing']) && isset($package['pricing'][$package_plan])) {
                $price = $package['pricing'][$package_plan];
                $payload = [
                    'currency' => $request->get_param('currency'),
                    'client_email' => $request->get_param('client_email'),
                    'total' => (float) $price,
                    'items' => [
                        ['type' => 'package', 'label' => null, 'price' => 0, 'identifier' => $package_id . '->' . $package_plan, 'store' => $store],
                    ],
                    'customer' => [
                        'first_name' => $request->get_param('first_name'),
                        'middle_name' => $request->get_param('middle_name'),
                        'last_name' => $request->get_param('last_name'),
                        'phone' => [
                            'countryCode' => $request->get_param('countryCode'),
                            'number' => $request->get_param('client_phone')
                        ]
                    ],
                    'metadata' => [
                        'first_name' => $request->get_param('first_name'),
                        'middle_name' => $request->get_param('middle_name'),
                        'last_name' => $request->get_param('last_name'),
                        'phone' => $request->get_param('client_phone'),
                        'phone_code' => $request->get_param('countryCode')
                    ]
                ];
                $invoice_id = Invoice::get_instance()->create_invoice($payload);
                $response = Invoice::get_instance()->get_invoice($invoice_id);
                return rest_ensure_response($response);
            }
        }
        if (! $response) {
            $response = new WP_Error('package_not_found', 'Package with the specified ID not found.', ['status' => 404]);
        }
        // 
        return rest_ensure_response($response);
    }
    
    public static function get_packages() {
        return [
            [
                'id' => 1,
                'name' => 'Ecommerce',
                'packagefor' => 'Startup',
                'shortdesc' => 'Customer who just started their business and try to grow',
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '5 Post Design / 2 Motion Video',
                    // 'Whatsapp Marketing',
                    // 'Email Marketing',
                    // 'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 500,
                    // 'Quarterly' => 800,
                    'Monthly' => 1500,
                    'Yearly' => 15000,
                    // 'Lifetime' => 150000
                ]
            ],
            [
                'id' => 2,
                'name' => 'Business',
                'packagefor' => 'Small Business',
                'shortdesc' => 'The business who has stable condition but still trying to grow.',
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '10 Post Design / 4 Motion Graphics',
                    'Whatsapp marketing',
                    // 'Email Marketing',
                    'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 800,
                    // 'Quarterly' => 1300,
                    'Monthly' => 2500,
                    'Yearly' => 25000,
                    // 'Lifetime' => 250000,
                ]
            ],
            [
                'id' => 3,
                'name' => 'Corporate',
                'packagefor' => 'Corporate Ecommerce',
                'shortdesc' => 'Corporate business packages',
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Social Media Ads Management (1 platform)',
                    'Google Ads Management',
                    'All Conversion Setup',
                    'All Pixel Setup',
                    '15 Post Design',
                    '5 Motion Videos',
                    'Whatsapp Marketing',
                    'Email Marketing',
                    'SEO'
                ],
                'pricing' => [
                    // 'Weekly' => 1300,
                    // 'Quarterly' => 2500,
                    'Monthly' => 5000,
                    'Yearly' => 50000,
                    // 'Lifetime' => 500000,
                ]
            ],
            [
                'id' => 4,
                'name' => 'Custom',
                'packagefor' => 'Custom Package',
                'shortdesc' => "Let's discuss your plan of choice",
                'list_title' => "What's included",
                'icon' => '',
                'list' => [
                    'Custom setup, account provisioning, and dedicated support for complex needs.'
                ],
                'pricing' => []
            ],
        ];
    }


    public function invoice_paid($def, $invoice, $_db_updated) {
        if (! $_db_updated) {return $def;}
        if (! isset($invoice['id'])) {return $def;}
        $user_id = Invoice::get_instance()->get_invoice_meta($invoice['id'], 'author_id');
        if (empty($user_id)) {return $def;}
        $user = get_user_by('id', $user_id);
        // 
    }


    private function create_contract($args) {
        global $wpdb;
        $_inserted = $wpdb->insert(
            $this->contract_table,
            [
                'invoice_item_id' => $data['invoice_item_id'] ?? '',
                'title' => $data['title'] ?? '',
                'description' => $data['description'] ?? ''
            ],
            ['%d', '%s', '%s']
        );
        return $_inserted ? $this->get_contract($wpdb->insert_id) : new WP_Error('failed_create_contract', sprintf('Failed to create contract.\nError: %s', $wpdb->last_error), ['status' => 500]);
    }

    private function get_contract($contract_id, $row_only = true) {
        global $wpdb;
        
        $contract = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->contract_table} WHERE id = %d", $contract_id),
            ARRAY_A
        );
        
        if (!$contract) {
            return new WP_Error('contract_not_found', 'Contract not found.', ['status' => 404]);
        }
        
        $response = ['contract' => $contract];
        
        if (! $row_only) {

            $columns = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->column_table} WHERE contract_id = %d ORDER BY sort_order ASC", $contract_id),
                ARRAY_A
            );

            foreach ($columns as $index => $column) {
                $cards = $wpdb->get_results(
                    $wpdb->prepare("SELECT * FROM {$this->card_table} WHERE column_id = %d ORDER BY sort_order ASC", $column['id']),
                    ARRAY_A
                );

                foreach ($cards as &$card) {
                    $card['checklists'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->checklist_table} WHERE card_id = %d ORDER BY sort_order ASC", $card['id']),
                        ARRAY_A
                    );

                    $card['comments'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->comment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                        ARRAY_A
                    );

                    $card['attachments'] = $wpdb->get_results(
                        $wpdb->prepare("SELECT * FROM {$this->attachment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                        ARRAY_A
                    );
                }

                $columns[$index]['cards'] = $cards;
            }

            $response['columns'] = $columns;
        }
        return $response;

    }

    // contract or project board api function starts here
    public function get_api_contracts(WP_REST_Request $request) {
        global $wpdb;
        $user_id = Security::get_instance()->user_id;
        // 
        $deals = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->contract_table}"),
            ARRAY_A
        );
        if (!$deals) {
            return new WP_Error('no_contracts_found', 'No contracts found.', ['status' => 404]);
        }
        foreach ($deals as $index => $deal) {
            $deals[$index]['invoice_item'] = Invoice::get_instance()->get_invoice_by_item_id($deal['invoice_item_id']);
        }
        $response = $deals;
        return rest_ensure_response($response);
    }


    public function get_api_contract(WP_REST_Request $request) {
        $contract_id = (int) $request->get_param('contract_id');
        $user_id = Security::get_instance()->user_id;

        $response = $this->get_contract($contract_id, false);
        if (is_wp_error($response)) {
            return $response;
        }
        return rest_ensure_response($response);
    }


    public function api_create_contract(WP_REST_Request $request) {
        $data = $request->get_json_params();
        $response = $this->create_contract($data);
        if (is_wp_error($response)) {
            return $response;
        }
        return rest_ensure_response($response);
    }

    public function get_contract_columns(WP_REST_Request $request) {
        global $wpdb;
        $contract_id = (int) $request->get_param('contract_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->column_table} WHERE contract_id = %d ORDER BY sort_order ASC", $contract_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('no_columns_found', 'No columns found for this contract.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }

    public function create_column(WP_REST_Request $request) {
        global $wpdb;
        $contract_id = (int) $request->get_param('contract_id');
        $data = $request->get_json_params();
        $response = $wpdb->insert(
            $this->column_table,
            [
                'contract_id' => $contract_id,
                'title' => $data['title'] ?? '',
                'sort_order' => $data['sort_order'] ?? 0
            ],
            ['%d', '%s', '%d']
        );
        if ($response === false) {
            return new WP_Error('column_creation_failed', 'Failed to create column.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }
    public function api_update_column(WP_REST_Request $request) {
        global $wpdb;
        $column_id = (int) $request->get_param('column_id');
        $data = $request->get_json_params();
        $response = ($column_id === 0) ? $wpdb->insert(
            $this->column_table,
            [
                'title' => $data['title'] ?? '',
                'sort_order' => (int) $data['sort_order'] ?? 0,
                'contract_id' => (int) $data['contract_id'] ?? 0
            ],
            ['%s', '%d', '%d']
        ) : $wpdb->update(
            $this->column_table,
            [
                'title' => $data['title'] ?? '',
                'sort_order' => (int) $data['sort_order'] ?? 0
            ],
            ['id' => $column_id],
            ['%s', '%d'],
            ['%d']
        );
        if ($response === false) {
            return new WP_Error('column_update_failed', 'Failed to update column.', ['status' => 500]);
        }
        if ($column_id === 0) {
            $column_id = $wpdb->insert_id;
            $response = $wpdb->get_row(
                $wpdb->prepare("SELECT * FROM {$this->column_table} WHERE id = %d", $column_id),
                ARRAY_A
            );
        }
        return rest_ensure_response($response);
    }
    public function api_delete_column(WP_REST_Request $request) {
        global $wpdb;
        $column_id = (int) $request->get_param('column_id');
        $response = $wpdb->delete($this->column_table, ['id' => $column_id], ['%d']);
        if ($response === false) {
            return new WP_Error('column_deletion_failed', 'Failed to delete column.', ['status' => 500]);
        }
        $cards = $wpdb->get_results(
            $wpdb->prepare("SELECT id FROM {$this->card_table} WHERE column_id = %d", $column_id),
            ARRAY_A
        );
        foreach ($cards as $card) {
            $card_id = (int) $card['id'];
            $wpdb->delete($this->checklist_table, ['card_id' => $card_id], ['%d']);
            $wpdb->delete($this->comment_table, ['card_id' => $card_id], ['%d']);
            $wpdb->delete($this->attachment_table, ['card_id' => $card_id], ['%d']);
        }
        // 
        return rest_ensure_response($response);
    }

    public function get_column_cards(WP_REST_Request $request) {
        global $wpdb;
        $column_id = (int) $request->get_param('column_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->card_table} WHERE column_id = %d ORDER BY sort_order ASC", $column_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('no_cards_found', 'No cards found in this column.', ['status' => 404]);
        }
        foreach ($response as $index => $card) {
            $response[$index]['checklists'] = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->checklist_table} WHERE card_id = %d ORDER BY sort_order ASC", $card['id']),
                ARRAY_A
            );

            $response[$index]['comments'] = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->comment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                ARRAY_A
            );

            $response[$index]['attachments'] = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->attachment_table} WHERE card_id = %d ORDER BY created_at ASC", $card['id']),
                ARRAY_A
            );
        }
        return rest_ensure_response($response);
    }

    public function create_card(WP_REST_Request $request) {
        global $wpdb;
        $column_id = (int) $request->get_param('column_id');
        $data = $request->get_json_params();
        $response = $wpdb->insert(
            $this->card_table,
            [
                'column_id' => $column_id,
                'title' => $data['title'] ?? '',
                'description' => $data['description'] ?? '',
                'sort_order' => $data['sort_order'] ?? 0,
                'due_date' => $data['due_date'] ?? null
            ],
            ['%d', '%s', '%s', '%d', '%s']
        );
        if ($response === false) {
            return new WP_Error('card_creation_failed', 'Failed to create card.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }

    public function get_card_detail(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->card_table} WHERE id = %d", $card_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('card_not_found', 'Card not found.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }
    public function api_update_card(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $data = $request->get_json_params();
        $response = ($card_id === 0) ? $wpdb->insert(
            $this->card_table,
            [
                'title' => $data['title'] ?? '',
                'description' => $data['description'] ?? '',
                'column_id' => (int) $data['column_id'] ?? 0,
                'sort_order' => (int) $data['sort_order'] ?? 0,
                'due_date' => $data['due_date'] ?? null
            ],
            ['%s', '%s', '%d', '%d', '%s']
        ) : $wpdb->update(
            $this->card_table,
            [
                'title' => $data['title'] ?? '',
                'description' => $data['description'] ?? '',
                'sort_order' => (int) $data['sort_order'] ?? 0,
                'due_date' => $data['due_date'] ?? null,
                'column_id' => (int) $data['column_id'] ?? 0
            ],
            ['id' => $card_id],
            ['%s', '%s', '%d', '%s', '%d'],
            ['%d']
        );
        if ($response === false) {
            return new WP_Error('card_update_failed', 'Failed to update card.', ['status' => 500]);
        }

        if ($card_id === 0) {
            $card_id = $wpdb->insert_id;
            $response = $wpdb->get_row(
                $wpdb->prepare("SELECT * FROM {$this->card_table} WHERE id = %d", $card_id),
                ARRAY_A
            );
        }
        
        return rest_ensure_response($response);
    }
    public function api_delete_card(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->delete($this->card_table, ['id' => $card_id], ['%d']);
        if ($response === false) {
            return new WP_Error('card_deletion_failed', 'Failed to delete card.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }

    public function api_update_checklist_item(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $checklist_id = (int) $request->get_param('id');
        $data = $request->get_json_params();
        $response = ($checklist_id === 0) ? $wpdb->insert(
            $this->checklist_table,
            [
                'title' => $data['title'] ?? '',
                'card_id' => (int) $card_id ?? 0,
                'sort_order' => (int) $data['sort_order'] ?? 0,
                'is_completed' => (bool) $data['is_completed'] ?? false,
            ],
            ['%s', '%d', '%d', '%d']
        ) : $wpdb->update(
            $this->checklist_table,
            [
                'title' => $data['title'] ?? '',
                'is_completed' => (bool) $data['is_completed'] ?? false,
                'sort_order' => (int) $data['sort_order'] ?? 0
            ],
            ['id' => $checklist_id],
            ['%s', '%d', '%d'],
            ['%d']
        );
        if ($response === false) {
            return new WP_Error('checklist_creation_failed', 'Failed to create checklist item.', ['status' => 500]);
        }
        if ($checklist_id === 0) {
            $checklist_id = $wpdb->insert_id;
            $response = $wpdb->get_row(
                $wpdb->prepare("SELECT * FROM {$this->checklist_table} WHERE id = %d", $checklist_id),
                ARRAY_A
            );
        }
        return rest_ensure_response($response ? ['success' => $response] : ['message' => sprintf('Failed to update checklist item.\nError: %s', $wpdb->last_error)]);
    }
    public function api_delete_checklist_item(WP_REST_Request $request) {
        global $wpdb;
        $checklist_id = (int) $request->get_param('checklist_id');
        $response = $wpdb->delete($this->checklist_table, ['id' => $checklist_id], ['%d']);
        if ($response === false) {
            return new WP_Error('checklist_deletion_failed', 'Failed to delete checklist item.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }

    public function get_card_checklists(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->checklist_table} WHERE card_id = %d ORDER BY sort_order ASC", $card_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('no_checklists_found', 'No checklists found for this card.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }

    public function api_update_comment(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $comment_id = (int) $request->get_param('id');
        $comment = (string) $request->get_param('comment');
        $response = (empty($comment_id)) ? $wpdb->insert(
            $this->comment_table,
            [
                'card_id' => $card_id,
                'user_id' => Security::get_instance()->user_id,
                'comment' => maybe_serialize($comment ?? '')
            ],
            ['%d', '%d', '%s']
        ) : $wpdb->update(
            $this->comment_table,
            [
                'comment' => maybe_serialize($comment ?? '')
            ],
            ['id' => $comment_id],
            ['%s'],
            ['%d']
        );
        if ($response === false) {
            return new WP_Error('comment_creation_failed', 'Failed to add comment.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }
    public function api_delete_comment(WP_REST_Request $request) {
        global $wpdb;
        $comment_id = (int) $request->get_param('comment_id');
        $response = $wpdb->delete($this->comment_table, ['id' => $comment_id], ['%d']);
        if ($response === false) {
            return new WP_Error('comment_deletion_failed', 'Failed to delete comment.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }

    public function get_card_comments(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->comment_table} WHERE card_id = %d ORDER BY created_at ASC", $card_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('no_comments_found', 'No comments found for this card.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }

    public function api_get_card_members(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT
                    GROUP_CONCAT(user_id SEPARATOR ',') AS members_id
                FROM
                    {$this->member_table}
                WHERE
                    card_id = %d;
                ",
                $card_id
            )
        );
        if (!$response) {
            return new WP_Error('no_members_found', 'No members found for this card.', ['status' => 404]);
        }
        return rest_ensure_response($response[0]);
    }
    public function api_update_card_members(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $members = (string) $request->get_param('members');
        $members = explode(',', $members);

        $wpdb->delete($this->member_table, ['card_id' => $card_id], ['%d']);
        foreach ($members as $member_id) {
            $member_id = (int) $member_id;
            $response = $wpdb->insert(
                $this->member_table,
                [
                    'card_id' => $card_id,
                    'user_id' => $member_id
                ],
                ['%d', '%d']
            );
            if ($response === false) {
                return new WP_Error('member_update_failed', 'Failed to update card members.', ['status' => 500]);
            }
        }
        return rest_ensure_response(['success' => true]);
    }
    public function upload_card_attachment(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->insert(
            $this->attachment_table,
            [
                'card_id' => $card_id,
                'file_url' => $request->get_param('file_url') ?? '',
                'uploaded_by' => Security::get_instance()->user_id
            ],
            ['%d', '%s', '%d']
        );
        if ($response === false) {
            return new WP_Error('attachment_upload_failed', 'Failed to upload attachment.', ['status' => 500]);
        }
        return rest_ensure_response($response);
    }

    public function get_card_attachments(WP_REST_Request $request) {
        global $wpdb;
        $card_id = (int) $request->get_param('card_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->attachment_table} WHERE card_id = %d ORDER BY uploaded_at ASC", $card_id),
            ARRAY_A
        );
        if (!$response) {
            return new WP_Error('no_attachments_found', 'No attachments found for this card.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }

    public function api_get_contract_members(WP_REST_Request $request) {
        global $wpdb;
        $contract_id = (int) $request->get_param('contract_id');
        $response = $wpdb->get_results(
            $wpdb->prepare("
            SELECT
                u.ID as id, u.user_email as email, u.user_registered as registered_on,
                MAX(CASE WHEN um.meta_key = 'first_name' THEN um.meta_value ELSE NULL END) AS first_name,
                MAX(CASE WHEN um.meta_key = 'last_name' THEN um.meta_value ELSE NULL END) AS last_name,
                MAX(CASE WHEN um.meta_key = 'middle_name' THEN um.meta_value ELSE NULL END) AS middle_name,
                MAX(CASE WHEN um.meta_key = 'designation' THEN um.meta_value ELSE NULL END) AS designation,
                MAX(CASE WHEN um.meta_key = 'avater' THEN um.meta_value ELSE NULL END) AS avater
            FROM
                {$wpdb->users} AS u
            LEFT JOIN
                {$wpdb->usermeta} AS um ON u.ID = um.user_id
            GROUP BY
                u.ID
            "),
            ARRAY_A
        );
        // WHERE u.spam=0 AND u.deleted=0;
        if (!$response) {
            return rest_ensure_response($wpdb->last_error);
            // return new WP_Error('no_members_found', 'No members found for this contract.', ['status' => 404]);
        }
        return rest_ensure_response($response);
    }
    
    
}
