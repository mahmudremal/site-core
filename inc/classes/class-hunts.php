<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WP_User_Query;

class Hunts {
	use Singleton;

	protected $tables;
	protected $currentImportPoint;
	
	protected function __construct() {
		global $wpdb;
        $this->tables = (object) [
			'species'         => $wpdb->prefix . 'hunts_species',
			'weapons'         => $wpdb->prefix . 'hunts_weapons',
			'states'          => $wpdb->prefix . 'hunts_states',
			'bag_types'       => $wpdb->prefix . 'hunts_bag_types',
			'gmu'             => $wpdb->prefix . 'hunts_gmu',
			'seasons'         => $wpdb->prefix . 'hunts_seasons',
			'documents'       => $wpdb->prefix . 'hunts_documents',
			'applications'    => $wpdb->prefix . 'hunts_applications',
			'odds'            => $wpdb->prefix . 'hunts_odds',
			'shortner'		  => $wpdb->prefix . 'hunts_shortner',
		];
		$this->currentImportPoint = 0;
		// Load events
		$this->setup_hooks();
	}

    protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_action('wp_enqueue_scripts', [$this, 'register_scripts']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);

		add_shortcode('hunting-record-table', [$this, 'hunting_table_shortcode']);
		add_action('admin_menu', [$this, 'add_admin_menu']);

		add_shortcode('huntarizona_research_restricted_access', [$this, 'huntarizona_research_restricted_access']);
		
		add_shortcode('huntarizona_draw_tools_subscription_status', [$this, 'huntarizona_draw_tools_subscription_status']);
    }
	
	public function register_routes() {
		if (apply_filters('pm_project/system/isactive', 'hunts-disabled')) {return;}
		register_rest_route('sitecore/v1', '/hunts/rseasons', [
			'methods' => 'POST',
			'callback' => [$this, 'api_get_remote_seasons'],
			'permission_callback' => '__return_true'
		]);
		
		register_rest_route('sitecore/v1', '/hunts/filters', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_filters'],
			'permission_callback' => '__return_true'
		]);
		
		// /auth
		register_rest_route('sitecore/v1', '/hunts/auth', [
			'methods'             => 'POST',
			'callback'            => [$this, 'api_hunts_auth'],
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [
				'email'					=> ['type' => 'string', 'required' => true],
				'password'				=> ['type' => 'string',  'required' => true]
			]
		]);
		
		// /hunts
		register_rest_route('sitecore/v1', '/hunts', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_hunts'],
			'permission_callback' => '__return_true',
			'args' => [
				'state'      => [
					'type'        => 'string',
					'required'    => false,
					'description' => 'State ID'
				],
				'weapon'     => [
					'type'        => 'string',
					'required'    => false,
					'description' => 'Weapon ID'
				],
				'species'    => [
					'type'        => 'string',
					'required'    => false,
					'description' => 'Species ID'
				],
				'points'     => [
					'type'        => 'integer',
					'required'    => false,
					'default'     => 0,
					'description' => 'User points'
				],
				'pointsType' => [
					'type'        => 'string',
					'required'    => false,
					'default'     => 'BONUS',
					'description' => 'Points type (BONUS / PREFERENCE)'
				],
				'resident'   => [
					'type'        => 'boolean',
					'required'    => false,
					'default'     => false,
					'description' => 'Is resident hunter'
				],
				'page'       => [
					'type'        => 'integer',
					'required'    => false,
					'default'     => 1,
					'description' => 'Page number'
				],
				'per_page'   => [
					'type'        => 'integer',
					'required'    => false,
					'default'     => 10,
					'description' => 'Items per page'
				],
			]
		]);
		register_rest_route('sitecore/v1', '/hunts', [
			'methods'             => ['POST', 'PUT'],
			'callback'            => [$this, 'api_save_hunt'],
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [
				'id'               => ['type' => 'string', 'required' => true, 'description' => 'Season ID (for update or insert)'],
				'app_year'         => ['type' => 'integer', 'required' => true],
				'user_odds'        => ['type' => 'number',  'required' => true],
				'harvest_rate'     => ['type' => 'number',  'required' => true],
				'season_type'      => ['type' => 'string',  'required' => true],
				'start_date'       => ['type' => 'string',  'format' => 'date', 'required' => true],
				'end_date'         => ['type' => 'string',  'format' => 'date', 'required' => true],
				'hunters_per_sqmi' => ['type' => 'number',  'required' => true],
				'weapon_id'        => ['type' => 'string',  'required' => true],
				'bag_type_id'      => ['type' => 'string',  'required' => true],
				'gmu_id'           => ['type' => 'string',  'required' => true],
				'document_id'      => ['type' => 'string',  'required' => false],
			]
		]);
		register_rest_route('sitecore/v1', '/hunts', [
			'methods'  => 'DELETE',
			'callback' => [$this, 'api_delete_hunt'],
			'permission_callback' => '__return_true', // current_user_can('manage_options'),
			'args' => [
				'id' => [
					'type'        => 'string',
					'required'    => true,
					'description' => 'Season ID to delete'
				]
			]
		]);

		// /species
		register_rest_route('sitecore/v1', '/species', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_species'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/species', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->species, 'id,name,_status,_order'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/species', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->species),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /weapons
		register_rest_route('sitecore/v1', '/weapons', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_weapons'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/weapons', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->weapons, 'id,name,_status,_order'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/weapons', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->weapons),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /states
		register_rest_route('sitecore/v1', '/states', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_states'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/states', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->states, 'id,name,abbreviation,_status,_order'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/states', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->states),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /bag_types
		register_rest_route('sitecore/v1', '/bag_types', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_bag_types'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/bag_types', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->bag_types, 'id,name,species_id,_status,_order'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/bag_types', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->bag_types),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /gmu
		register_rest_route('sitecore/v1', '/gmu', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_gmu'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/gmu', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->gmu, 'id,name,code,total_sqmi,public_sqmi,public_ratio,state_id'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/gmu', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->gmu),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /documents
		register_rest_route('sitecore/v1', '/documents', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_documents'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/documents', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->documents, 'id,code,total_quota'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);

		register_rest_route('sitecore/v1', '/documents', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->documents),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /applications
		register_rest_route('sitecore/v1', '/applications', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_applications'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/applications', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->applications, 'id,document_id,is_resident,quota'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/applications', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->applications),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'integer', 'required' => true] ]
		]);

		// /odds
		register_rest_route('sitecore/v1', '/odds', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_odds'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/odds', [
			'methods'  => 'POST',
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->odds, 'id,application_id,odds,type'),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);
		register_rest_route('sitecore/v1', '/odds', [
			'methods'  => 'DELETE',
			'callback' => fn($request) => $this->api_delete_simple($request, $this->tables->odds),
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options'),
			'args' => [ 'id' => ['type' => 'string', 'required' => true] ]
		]);

		// /syncs
		register_rest_route('sitecore/v1', '/(?P<catalogue_table>[^/]+)/sync', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_catalogue_table_sync'],
			'permission_callback' => '__return_true', // fn() => current_user_can('manage_options')
		]);

		// /bulk_import
		register_rest_route('sitecore/v1', '/hunts/bulk_import', [
			'methods' => 'POST',
			'callback' => [$this, 'api_do_bulk_import'],
			'permission_callback' => '__return_true',
			'args' => [
				'csv_data'      => [
					'type'        => 'string',
					'required'    => true,
					'description' => 'A csv file content matching to our template.'
				],
			]
		]);

		// /bulk_import
		register_rest_route('sitecore/v1', '/hunts/share', [
			'methods' => 'POST',
			'callback' => [$this, 'api_get_share_shortner'],
			'permission_callback' => '__return_true',
			'args' => [
				'filter_data'      => [
					'type'        => 'object',
					'required'    => true,
					'description' => 'A csv file content matching to our template.'
				],
			]
		]);

	}

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Species
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->species} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				_status BOOLEAN NOT NULL DEFAULT TRUE,
				_order INT NOT NULL DEFAULT 0
			) $charset_collate;"
		);

		// Weapons
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->weapons} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				_status BOOLEAN NOT NULL DEFAULT TRUE,
				_order INT NOT NULL DEFAULT 0
			) $charset_collate;"
		);

		// States
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->states} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				abbreviation VARCHAR(10) NOT NULL,
				_status BOOLEAN NOT NULL DEFAULT TRUE,
				_order INT NOT NULL DEFAULT 0
			) $charset_collate;"
		);

		// Bag Types
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->bag_types} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				species_id VARCHAR(20) NOT NULL,
				_status BOOLEAN NOT NULL DEFAULT TRUE,
				_order INT NOT NULL DEFAULT 0
			) $charset_collate;"
		);

		// GMU
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->gmu} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				code VARCHAR(50),
				total_sqmi FLOAT,
				public_sqmi FLOAT,
				public_ratio FLOAT,
				state_id VARCHAR(20) NOT NULL
			) $charset_collate;"
		);

		// Seasons
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->seasons} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				app_year YEAR NOT NULL,
				user_odds FLOAT,
				harvest_rate FLOAT,
				start_date DATE,
				end_date DATE,
				hunters_per_sqmi FLOAT,
				season_type VARCHAR(255),
				addi_units TEXT,
				addi_notes TEXT,
				weapon_id VARCHAR(20) NOT NULL,
				bag_type_id VARCHAR(20) NOT NULL,
				gmu_id VARCHAR(20) NOT NULL,
				document_id VARCHAR(20)
			) $charset_collate;"
		);

		// Documents
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->documents} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				code VARCHAR(50) NOT NULL,
				-- _probability INT NOT NULL DEFAULT 0,
				total_quota INT
			) $charset_collate;"
		);

		// Applications
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->applications} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
				document_id VARCHAR(20) NOT NULL,
				is_resident BOOLEAN,
				quota INT,
				_listodds TEXT
			) $charset_collate;"
		);

		// Odds
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->odds} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				application_id BIGINT UNSIGNED NOT NULL,
				odds FLOAT,
				type VARCHAR(50)
			) $charset_collate;"
		);

		// Shortner
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->shortner} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
				shortcode VARCHAR(50) NOT NULL,
				visited INT NOT NULL DEFAULT 0,
				filters TEXT
			) $charset_collate;"
		);
    }

    public function register_deactivation_hook() {
		global $wpdb;
		foreach ((array) $this->tables as $_key => $_table) {
			$wpdb->query($wpdb->prepare("DROP TABLE IF EXISTS {$_table}"));
		}
	}

	public function register_scripts() {
        wp_register_script('site-core-hunts', WP_SITECORE_BUILD_JS_URI . '/hunts.js', [], Assets::filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/hunts.js'), true);
        wp_register_style('site-core-hunts', WP_SITECORE_BUILD_CSS_URI . '/hunts.css', [], Assets::filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/hunts.css'), 'all');
		wp_localize_script('site-core-hunts', 'siteCoreConfig', apply_filters('sitecorejs/siteconfig', [
			'_in' => is_user_logged_in(),
			'rest_url' => rest_url('sitecore/v1'),
			'publicPath' => WP_SITECORE_BUILD_URI . '/',
			'hunt_api' => is_admin() ? substr(base64_encode(apply_filters('pm_project/system/getoption', 'hunts-apikey', 'ojjrlqlvfkarsltfvggweoubhzrwqzgw')), 0, -1) : null,
			'_apss' => apply_filters('pm_project/system/getoption', 'hunts-appass', null) ? base64_encode(apply_filters('pm_project/system/getoption', 'hunts-appass', null)) : null,
			'profiledash' => apply_filters('pm_project/system/getoption', 'hunts-profiledash', null)
		]));
    }

    public function settings($args = []) {
		$args['hunts']	= [
			'title'							=> __('Hunts', 'site-core'),
			'description'					=> __('Configure hunting table database, rest api endpoint and hunting record relations.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'hunts-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Disable hunting record configurations.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'hunts-apiend',
					'label'					=> __('API Endpoint', 'site-core'),
					'description'			=> __('API endpoint for huntful application.', 'site-core'),
					'type'					=> 'url',
					'default'				=> 'https://www.onxmaps.com/hunting-fool/api/v1'
				],
				[
					'id' 					=> 'hunts-apikey',
					'label'					=> __('API Key', 'site-core'),
					'description'			=> __('API Key of onxmaps.com site.', 'site-core'),
					'type'					=> 'text',
					'default'				=> 'ojjrlqlvfkarsltfvggweoubhzrwqzgw'
				],
				[
					'id' 					=> 'hunts-overwrite',
					'label'					=> __('Overwrite', 'site-core'),
					'description'			=> __('Enable to overwrite data on each time api or pdf import triggired.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'hunts-appass',
					'label'					=> __('Password', 'site-core'),
					'description'			=> __('Enter your application password.', 'site-core'),
					'type'					=> 'password',
					'default'				=> false
				],
				[
					'id' 					=> 'hunts-profiledash',
					'label'					=> __('Dashboard', 'site-core'),
					'description'			=> __('Enter your membership profile dashboard url.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
			]
		];
        return $args;
    }

	public function api_get_remote_seasons(WP_REST_Request $request) {
		$payload = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode($request->get_param('filters')))), true);
		$api_key = apply_filters('pm_project/system/getoption', 'hunts-filters-apikey', 'ory_at_NmUJQmGOc8H3Iicb7l_DYfyeZ_kk0rjB97xA4UWgVJ4.qb7Fd19cnDvLqK_NwzyfhsEo7ym-kE_GZwfEP2t-5Ao');
		$api_key = 'ory_at_NmUJQmGOc8H3Iicb7l_DYfyeZ_kk0rjB97xA4UWgVJ4.qb7Fd19cnDvLqK_NwzyfhsEo7ym-kE_GZwfEP2t-5Ao';

		$query = `query hrtSeasonsQuery($first: Int, $input: HuntPlannerSeasonFilter, $after: String, $sort: HuntPlannerSeasonSort, $userData: HuntPlannerUserData) {
                huntPlannerSeasonsConnection(
                    first: $first
                    after: $after
                    input: $input
                    sort: $sort
                    userData: $userData
                ) {
                    totalCount
                    edges {
                        cursor
                        node {
                            id
                            appYear
                            additionalUnits
                            userOdds
                            seasonType
                            harvestRate
                            startDate
                            endDate
                            huntersPerSQMI
                            gameDepartmentNotes
                            weapon {
                                id
                                name
                                __typename
                            }
                            bagType {
                                id
                                name
                                species {
                                    id
                                    name
                                    __typename
                                }
                                __typename
                            }
                            gmu {
                                id
                                name
                                totalSqmi
                                publicRatio
                                publicSqmi
                                code
                                state {
                                    name
                                    id
                                    abbreviation
                                    __typename
                                }
                                __typename
                            }
                            huntDocument {
                                totalApplicants
                                totalQuota
                                code
                                applications {
                                    quota
                                    isResident
                                    odds {
                                        id
                                        odds
                                        type
                                        ... on HuntPlannerPreferenceOdds {
                                            id
                                            minPoints
                                            odds
                                            type
                                            __typename
                                        }
                                        __typename
                                    }
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        __typename
                    }
                    pageInfo {
                        hasPreviousPage
                        hasNextPage
                        startCursor
                        endCursor
                        __typename
                    }
                    __typename
                }
            }`;

		$url = 'https://api.production.onxmaps.com/v1/supergraph/';
		$headers = [
			'accept' => "*/*",
			'accept-language' => "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7,ar;q=0.6",
			'apollographql-client-name' => "onxmaps.hunt-planner.web",
			'apollographql-client-version' => "25.27+ca00b8d",
			'authorization' => "Bearer ory_at_NmUJQmGOc8H3Iicb7l_DYfyeZ_kk0rjB97xA4UWgVJ4.qb7Fd19cnDvLqK_NwzyfhsEo7ym-kE_GZwfEP2t-5Ao",
			'cache-control' => "no-cache",
			'content-type' => "application/json",
			'onx-application-id' => "hunt-planner",
			'onx-application-platform' => "web",
			'onx-application-version' => "1",
			'pragma' => "no-cache",
			'priority' => "u=1, i",
			'sec-ch-ua' => "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
			'sec-ch-ua-mobile' => "?0",
			'sec-ch-ua-platform' => "\"Windows\"",
			'sec-fetch-dest' => "empty",
			'sec-fetch-mode' => "cors",
			'sec-fetch-site' => "same-site"
		];
		$payload['query'] = $query;
		$response = wp_remote_post($url, [
			'body'    => json_encode($payload),
			'headers'	=> $headers,
			'method'  => 'POST',
			'timeout' => 45,
		]);
		
		if (is_wp_error($response)) {
			return $response;
		}
		$data = wp_remote_retrieve_body($response);
		return rest_ensure_response($data);
		$parsed = json_decode($data, true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			return new WP_Error('parse_error', sprintf('JSON decoding error: %s', json_last_error_msg()), ['status' => 500]);
		}

		return rest_ensure_response($parsed);

	}

	public function api_get_filters(WP_REST_Request $request) {
		global $wpdb;
		
		$_cached = get_transient('hunts_filters_data');
		if ($_cached) {
			// return rest_ensure_response($_cached);
		}
		
		// Fetch data from database
		$states    = $wpdb->get_results("SELECT id, name, _order, abbreviation FROM {$this->tables->states} WHERE _status = TRUE", ARRAY_A);
		$species   = $wpdb->get_results("SELECT id, name, _order FROM {$this->tables->species} WHERE _status = TRUE", ARRAY_A);
		$weapons   = $wpdb->get_results("SELECT id, name, _order FROM {$this->tables->weapons} WHERE _status = TRUE", ARRAY_A);
		$bag_types = $wpdb->get_results("SELECT id, name, _order, species_id FROM {$this->tables->bag_types} WHERE _status = TRUE", ARRAY_A);
		// $gmu       = $wpdb->get_results("SELECT id, name, code, state_id FROM {$this->tables->gmu}", ARRAY_A);
		$years       = $wpdb->get_results("SELECT DISTINCT app_year FROM {$this->tables->seasons} ORDER BY app_year DESC;", ARRAY_A);
		$units       = $wpdb->get_results("SELECT DISTINCT name FROM {$this->tables->gmu} ORDER BY name ASC;", ARRAY_A);
		$aFilters	= $wpdb->get_row(
		"
		SELECT
		(SELECT MIN(harvest_rate) FROM {$this->tables->seasons}) AS min_harvest_rate,
		(SELECT MAX(harvest_rate) FROM {$this->tables->seasons}) AS max_harvest_rate,
		(SELECT MIN(user_odds) FROM {$this->tables->seasons}) AS min_user_odds,
		(SELECT MAX(user_odds) FROM {$this->tables->seasons}) AS max_user_odds,
		(SELECT MIN(public_ratio) FROM {$this->tables->gmu}) AS min_public_ratio,
		(SELECT MAX(public_ratio) FROM {$this->tables->gmu}) AS max_public_ratio,
		(SELECT MIN(public_sqmi) FROM {$this->tables->gmu}) AS min_public_sqmi,
		(SELECT MAX(public_sqmi) FROM {$this->tables->gmu}) AS max_public_sqmi,
		(SELECT MIN(odds) FROM {$this->tables->odds}) AS min_public_odds,
		(SELECT MAX(odds) FROM {$this->tables->odds}) AS max_public_odds
		;", ARRAY_A);

		$response = [
			...$aFilters,
			'states'    => $states,
			'species'   => $species,
			'weapons'   => $weapons,
			'years'		=> $years,
			'units'		=> $units,
			// 'bag_types' => $bag_types,
			// 'gmu'       => $gmu
		];
		
		set_transient('hunts_filters_data', $response, 7 * DAY_IN_SECONDS);

		return rest_ensure_response($response);
	}

	public function api_hunts_auth(WP_REST_Request $request) {
		$email  = $request->get_param('email');
		$pass   = $request->get_param('password');

		if (empty($email) || empty($pass)) {
			return new WP_Error('fields_required', 'Email and password are required.', ['status' => 403]);
		}

		$user = get_user_by('email', $email);

		if (!$user || is_wp_error($user)) {
			return new WP_Error('not_found', 'User not found regarding the email address provided!', ['status' => 404]);
		}

		if (!wp_check_password($pass, $user->user_pass, $user->ID)) {
			return new WP_Error('credentials_invalid', 'Invalid credentials. Account email and password not matched properly.', ['status' => 403]);
		}

		// Log in the user
		wp_set_current_user($user->ID);
		wp_set_auth_cookie($user->ID, true);

		return rest_ensure_response([
			'authenticated' => true,
			'user_id' => $user->ID
		]);
	}

	
	public function api_get_hunts(WP_REST_Request $request) {
		global $wpdb;

		// Get filters
		$year		= $request->get_param('year');
		$state      = $request->get_param('state');
		$weapons     = explode(',', $request->get_param('weapon'));
		$weapons = (count($weapons) == 1 && empty($weapons[0])) ? [] : $weapons;
		$species    = $request->get_param('species');
		$pointsType = $request->get_param('pointsType');
		$points     = (int) $request->get_param('points');
		$page       = max(1, (int) $request->get_param('page'));
		$per_page   = max(1, (int) $request->get_param('per_page'));
		$is_resident   = $request->get_param('is_resident');
		$_status   = $request->get_param('_status');

		// advance filters
		$units   = explode(',', $request->get_param('units'));
		$units = (count($units) == 1 && empty($units[0])) ? [] : $units;
		$date_range   = $request->get_param('date_range');
		$draw_odds   = $request->get_param('draw_odds');
		$harvest_rate   = $request->get_param('harvest_rate');
		$public_land_ratio   = $request->get_param('public_land_ratio');
		$per_sqmi   = $request->get_param('per_sqmi');

		$public_odds   = $request->get_param('public_odds');
		$public_ratio   = $request->get_param('public_ratio');
		$harvest_rate   = $request->get_param('harvest_rate');

		$offset = ($page - 1) * $per_page;

		$sql = "
			SELECT s.*,
			a.is_resident,
			a._listodds AS odds,
			a.quota AS tags_given,
			w.name AS weapon_name,
			a.id AS application_id,
			b.name AS bag_type_name,
			d.total_quota AS total_quota,
			s.addi_units AS additional_units,
			s.addi_notes AS additional_notes,
			sp.name AS species_name, sp.id AS species_id,
			g.name AS gmu_name, g.public_ratio, g.public_sqmi, g.total_sqmi,
			st.id AS state_id, st.name AS state_name, st.abbreviation

			
			FROM {$this->tables->seasons} s
			LEFT JOIN {$this->tables->weapons} w ON w.id = s.weapon_id
			LEFT JOIN {$this->tables->bag_types} b ON b.id = s.bag_type_id
			LEFT JOIN {$this->tables->species} sp ON sp.id = b.species_id
			LEFT JOIN {$this->tables->gmu} g ON g.id = s.gmu_id
			LEFT JOIN {$this->tables->states} st ON st.id = g.state_id
			LEFT JOIN {$this->tables->documents} d ON d.id = s.document_id
			LEFT JOIN {$this->tables->applications} a ON a.document_id = d.id
			
			WHERE 1=1
		";
		$sql = "
			SELECT s.*,
			a.is_resident,
			a._listodds AS odds,
			a.quota AS tags_given,
			w.name AS weapon_name,
			a.id AS application_id,
			b.name AS bag_type_name,
			d.total_quota AS total_quota,
			s.addi_units AS additional_units,
			s.addi_notes AS additional_notes,
			sp.name AS species_name, sp.id AS species_id,
			g.name AS gmu_name, g.public_ratio, g.public_sqmi, g.total_sqmi,
			st.id AS state_id, st.name AS state_name, st.abbreviation

			
			FROM {$this->tables->applications} a
			LEFT JOIN {$this->tables->documents} d ON d.id = a.document_id
			LEFT JOIN {$this->tables->seasons} s ON s.document_id = d.id
			LEFT JOIN {$this->tables->weapons} w ON w.id = s.weapon_id
			LEFT JOIN {$this->tables->bag_types} b ON b.id = s.bag_type_id
			LEFT JOIN {$this->tables->species} sp ON sp.id = b.species_id
			LEFT JOIN {$this->tables->gmu} g ON g.id = s.gmu_id
			LEFT JOIN {$this->tables->states} st ON st.id = g.state_id
			
			WHERE 1=1
		";

		if ($state) {
			$sql .= $wpdb->prepare(" AND st.id = %s", $state);
		}

		if (count($weapons)) {
			$placeholders = implode(', ', array_fill(0, count($weapons), '%s'));
			$sql .= $wpdb->prepare(" AND w.id IN ({$placeholders})", $weapons);
		}

		if (count($units)) {
			$placeholders = implode(', ', array_fill(0, count($units), '%s'));
			$sql .= $wpdb->prepare(" AND g.name IN ({$placeholders})", $units);
		}

		if ($species) {
			$sql .= $wpdb->prepare(" AND b.species_id = %s", $species);
		}

		if ($year && $year >= 2000) {
			$sql .= $wpdb->prepare(" AND s.app_year = %d", $year);
		}

		if ($is_resident != -1) {
			$sql .= $wpdb->prepare(" AND a.is_resident = %d", (int) $is_resident);
		}

		if ($public_land_ratio) {
			$sql .= $wpdb->prepare(" AND g.public_ratio <= %f", (float) $public_land_ratio);
		}

		if ($per_sqmi) {
			$sql .= $wpdb->prepare(" AND s.hunters_per_sqmi <= %f", (float) $per_sqmi);
		}

		// if ($harvest_rate) {
		// 	$sql .= $wpdb->prepare(" AND s.harvest_rate <= %f", (float) $harvest_rate);
		// }

		if ($draw_odds) {
			$sql .= $wpdb->prepare(" AND s.user_odds <= %f", (float) $draw_odds);
		}

		if ($date_range) {
			list($start_date, $end_date) = explode(' to ', $date_range);
			$sql .= $wpdb->prepare(
				" AND (s.start_date <= %s AND s.end_date >= %s)",
				date('Y-m-d', strtotime($end_date)),
				date('Y-m-d', strtotime($start_date))
			);
		}

		if ($_status != -1) {
			$sql .= $wpdb->prepare(" AND st._status = %d AND w._status = %d", (bool) $_status, (bool) $_status);
		}
		
		// Disabled currently.
		// if ($public_odds) {
		// 	$public_odds = array_map('floatval', explode(',', $public_odds));
		// 	$sql .= $wpdb->prepare(" AND o.odds BETWEEN %f AND %f", ...$public_odds );
		// }
		
		if ($public_ratio) {
			$public_ratio = array_map('floatval', explode(',', $public_ratio));
			$sql .= $wpdb->prepare(" AND g.public_ratio BETWEEN %f AND %f", ...$public_ratio );
		}
		
		if ($harvest_rate) {
			$harvest_rate = array_map('floatval', explode(',', $harvest_rate));
			$sql .= $wpdb->prepare(" AND s.harvest_rate BETWEEN %f AND %f", ...$harvest_rate );
		}

		$sql .= " ORDER BY s.document_id DESC";

		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql}) as t");

		$sql .= $wpdb->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);
		// return rest_ensure_response($sql);

		$results = $wpdb->get_results($sql);
		// return rest_ensure_response([$sql]);

		$response_data = [];

		foreach ($results as $row) {
			// $odds_points = $wpdb->get_results(
			// 	$wpdb->prepare(
			// 		"SELECT o.odds FROM {$this->tables->odds} o LEFT JOIN {$this->tables->applications} a ON a.id = o.application_id WHERE o.application_id = %d AND a.is_resident = %d",
			// 		$row->application_id, (int) $row->is_resident
			// 	)
			// );
			$response_data[] = [
				'id'               => $row->id,
				'app_year'         => $row->app_year,
				'user_odds'        => (float) $row->user_odds,
				'harvest_rate'     => (float) $row->harvest_rate,
				'season_type'      => $row->season_type,
				'start_date'       => strtotime($row->start_date),
				'end_date'         => strtotime($row->end_date),
				'hunters_per_sqmi' => (float) $row->hunters_per_sqmi,
				'weapon_id'       => $row->weapon_id,
				'weapon'           => [
					'id'   => $row->weapon_id,
					'name' => $row->weapon_name
				],
				'bag_type_id'	  => $row->bag_type_id,
				'bag_type'         => [
					'id'   => $row->bag_type_id,
					'name' => $row->bag_type_name
				],
				'species'         => [
					'id'   => $row->species_id,
					'name' => $row->species_name
				],
				'gmu_id'           => $row->gmu_id,
				'gmu'              => [
					'id'            => $row->gmu_id,
					'name'          => $row->gmu_name,
					'public_ratio'  => (float) $row->public_ratio,
					'total_sqmi'    => (float) $row->total_sqmi,
					'public_sqmi'    => (float) $row->public_sqmi
				],
				'state'         => [
					'id'           => $row->state_id,
					'name'         => $row->state_name,
					'abbreviation' => $row->abbreviation
				],
				'tags_given'      => $row->tags_given,
				'document_id'      => $row->document_id,
				'application_id'	=> $row->application_id,
				'is_resident'      => $row->is_resident,
				'notes'				=> $row->additional_notes,
				'additional_units'	=> $row->additional_units,
				// 'average_odds'		=> $row->average_odds,
				// '_probability'	=> $row->_probability,
				'odds'				=> $row->odds,
			];
		}

		$max_pages = ceil($total_items / $per_page);

		$response = rest_ensure_response($response_data);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_save_hunt(WP_REST_Request $request) {
		global $wpdb;

		// Collect data
		$data = [
			'id'               => sanitize_text_field($request->get_param('id')),
			'app_year'         => (int) $request->get_param('app_year'),
			'user_odds'        => (float) $request->get_param('user_odds'),
			'harvest_rate'     => (float) $request->get_param('harvest_rate'),
			'season_type'      => sanitize_text_field($request->get_param('season_type')),
			'start_date'       => sanitize_text_field($request->get_param('start_date')),
			'end_date'         => sanitize_text_field($request->get_param('end_date')),
			'hunters_per_sqmi' => (float) $request->get_param('hunters_per_sqmi'),
			'weapon_id'        => sanitize_text_field($request->get_param('weapon_id')),
			'bag_type_id'      => sanitize_text_field($request->get_param('bag_type_id')),
			'gmu_id'           => sanitize_text_field($request->get_param('gmu_id')),
			'document_id'      => sanitize_text_field($request->get_param('document_id'))
		];

		$table = $this->tables->seasons;

		// Check if entry exists
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE id = %s",
				$data['id']
			)
		);

		if ($exists) {
			// Update existing
			$wpdb->update(
				$table,
				[
					'app_year'         => $data['app_year'],
					'user_odds'        => $data['user_odds'],
					'harvest_rate'     => $data['harvest_rate'],
					'season_type'      => $data['season_type'],
					'start_date'       => $data['start_date'],
					'end_date'         => $data['end_date'],
					'hunters_per_sqmi' => $data['hunters_per_sqmi'],
					'weapon_id'        => $data['weapon_id'],
					'bag_type_id'      => $data['bag_type_id'],
					'gmu_id'           => $data['gmu_id'],
					'document_id'      => $data['document_id']
				],
				['id' => $data['id']]
			);

			$message = 'Season updated.';
		} else {
			// Insert new
			$wpdb->insert(
				$table,
				[
					'id'               => $data['id'],
					'app_year'         => $data['app_year'],
					'user_odds'        => $data['user_odds'],
					'harvest_rate'     => $data['harvest_rate'],
					'season_type'      => $data['season_type'],
					'start_date'       => $data['start_date'],
					'end_date'         => $data['end_date'],
					'hunters_per_sqmi' => $data['hunters_per_sqmi'],
					'weapon_id'        => $data['weapon_id'],
					'bag_type_id'      => $data['bag_type_id'],
					'gmu_id'           => $data['gmu_id'],
					'document_id'      => $data['document_id']
				]
			);

			$message = 'Season inserted.';
		}

		return rest_ensure_response([
			'success' => true,
			'message' => $message,
			'season_id' => $data['id']
		]);
	}

	public function api_delete_hunt(WP_REST_Request $request) {
		global $wpdb;

		$id = sanitize_text_field($request->get_param('id'));

		$deleted = $wpdb->delete($this->tables->seasons, [ 'id' => $id ]);

		if ($deleted) {
			return rest_ensure_response([
				'success' => true,
				'message' => 'Season deleted.',
				'season_id' => $id
			]);
		} else {
			return new WP_Error('delete_failed', 'Failed to delete season.', [ 'status' => 400 ]);
		}
	}


	public function api_get_species(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->species}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_weapons(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->weapons}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_states(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->states}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_bag_types(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->bag_types}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_gmu(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->gmu}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_documents(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->documents}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_applications(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->applications}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}

	public function api_get_odds(WP_REST_Request $request) {
		global $wpdb;
		$page     = max(1, (int) $request->get_param('page'));
		$per_page = max(24, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;

		$sql_base = "SELECT * FROM {$this->tables->odds}";
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");

		$sql = $wpdb->prepare("{$sql_base} LIMIT %d OFFSET %d", $per_page, $offset);
		$results = $wpdb->get_results($sql, ARRAY_A);

		$max_pages = ceil($total_items / $per_page);
		$response = rest_ensure_response($results);
		$response->header('X-WP-Total', $total_items);
		$response->header('X-WP-TotalPages', $max_pages);

		return $response;
	}


	protected function api_save_simple(WP_REST_Request $request, $table, $fields) {
		global $wpdb;

		$data = [];
		foreach (explode(',', $fields) as $field) {
			$field = trim($field);
			$data[$field] = $field == '_status' ? (bool) $request->get_param($field) : sanitize_text_field($request->get_param($field));
		}

		$id_field = explode(',', $fields)[0];
		$id_value = $data[$id_field];

		$exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE {$id_field} = %s", $id_value));

		if ($exists) {
			$wpdb->update($table, $data, [ $id_field => $id_value ]);
			$msg = 'Updated';
		} else {
			$wpdb->insert($table, $data);
			$msg = 'Inserted';
		}

		return rest_ensure_response([
			'success' => true,
			'message' => $msg,
			'data'    => $data
		]);
	}

	protected function api_delete_simple(WP_REST_Request $request, $table) {
		global $wpdb;

		$id = sanitize_text_field($request->get_param('id'));
		$id_field = $wpdb->get_col_info('name', 0);
		$id_field = $id_field[0] ?? 'id';

		$wpdb->query($wpdb->prepare("DELETE FROM {$table} WHERE id = %s", $id));

		return rest_ensure_response([
			'success' => true,
			'message' => 'Deleted',
			'id'      => $id
		]);
	}

	public function api_catalogue_table_sync(WP_REST_Request $request) {
		$catalogue_table = $request->get_param('catalogue_table');
		$available_ends = ['weapons', 'states', 'species', 'seasons'];
		if ($catalogue_table == 'hunts') {
			$catalogue_table = 'seasons';
		}
		if (!in_array($catalogue_table, $available_ends)) {
            return new WP_Error('invalid_request', 'Invalid request provided. Please review your request again.', ['status' => 404]);
		}
		// if (!in_array($catalogue_table, [...$available_ends, 'bag_types', 'gmu'])) {
		// 	return new WP_Error('invalid_request', 'Invalid request provided. Please review your request again.', ['status' => 404]);
		// }		
		$endpoint = apply_filters('pm_project/system/getoption', 'hunts-apiend', 'https://www.onxmaps.com/hunting-fool/api/v1');
		if ($catalogue_table == 'seasons') {
			$url = $endpoint . '/' . $catalogue_table;
			$cursor = $request->get_param('cursor');
			if (empty($cursor) || $cursor === 'null' || $cursor === null) {$cursor = null;}
			$payload = [
				'cursor' => $cursor,
				'stateId' => (string) $request->get_param('stateId'),
				'speciesId' => (string) $request->get_param('speciesId'),
				// 'weaponId' => (string) $request->get_param('weaponId'),
				'sortOrder' => (string) $request->get_param('sortOrder'), // DRAW_ODDS_DESC | GMU_CODE_ASC
				// 'pointsType' => (string) $request->get_param('pointsType'),
				'isResident' => (bool) $request->get_param('isResident'),
				// 'points' => (int) $request->get_param('points'),
				'pageNum' => (int) $request->get_param('pageNum'),
				'apikey' => apply_filters('pm_project/system/getoption', 'hunts-apikey', 'ojjrlqlvfkarsltfvggweoubhzrwqzgw')
			];
			// $this->currentImportPoint = (int) $request->get_param('points');
			if (empty($payload['cursor'])) {
				$payload['cursor'] = null;
			}
			$response = wp_remote_post($url, [
				'body'    => json_encode($payload),
				'headers'	=> [
					'Content-Type' => 'application/json',
					'Accept'       => '*/*',
				],
				'method'  => 'POST',
				'timeout' => 45,
			]);
		} else {
			$url = $endpoint . '/' . $catalogue_table . '?apikey=' . apply_filters('pm_project/system/getoption', 'hunts-apikey', 'ojjrlqlvfkarsltfvggweoubhzrwqzgw');
			$response = wp_remote_get($url);
		}
		
		if (is_wp_error($response)) {
			return $response;
		}
		$data = wp_remote_retrieve_body($response);
		$insertation = $result_data = json_decode($data, true);
		if (json_last_error() !== JSON_ERROR_NONE) {
			return new WP_Error('parse_error', sprintf('JSON decoding error: %s', json_last_error_msg()), ['status' => 500]);
		}
		// 
		if (isset($result_data['edges'])) {
			$result_data = array_map(function($e) {
				$node = $e['node'];
				if (is_string($node)) {
					// print_r($node);wp_die('Remal');
				}
				return [
					...$node,
					'gmuId' => $node['gmu']['id'],
					'weaponId' => $node['weapon']['id'],
					'bagTypeId' => $node['bagType']['id'],
					'documentId' => $node['huntDocument']['code']
				];
			}, $result_data['edges']);
			$insertation['edges'] = $this->_import_operation($result_data);
		} else {
			$insertation = $this->_import_operation($result_data);
		}
		// 
		return rest_ensure_response(['success' => true, 'data' => $insertation]);
	}

	public function api_do_bulk_import(WP_REST_Request $request) {
		$csv_data = $request->get_param('csv_data');$response = null;
		$csv_data = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode($csv_data))), true);
		// 
		$response = $csv_data;
		// 
		return rest_ensure_response($response === null ? new WP_Error('failed_import', 'Bulk import operation failed for some reason.', ['status' => 400]) : $response);
	}


	private function _import_operation(array $_datalist) {
		global $wpdb;
		foreach ($_datalist as $index => $row) {
			$_entry_status = -1;
			switch ($row['__typename']) {
				case 'HuntPlannerSpecies':
				// case 'HuntPlannerBagType':
				case 'HuntPlannerWeapon':
				case 'HuntPlannerState':
					$_sql_table = $row['__typename'] == 'HuntPlannerSpecies' ? $this->tables->species : (
						$row['__typename'] == 'HuntPlannerWeapon' ? $this->tables->weapons : (
							$row['__typename'] == 'HuntPlannerState' ? $this->tables->states : (
								$row['__typename'] == 'HuntPlannerBagType' ? $this->tables->bag_types : null
							)
						)
					);
					$sql_base = $wpdb->prepare("SELECT * FROM {$_sql_table} WHERE id=%s", $row['id']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$_sql_table,
							$row['__typename'] == 'HuntPlannerState' ? ['id' => $row['id'], 'name' => $row['name'], 'abbreviation' => $row['abbreviation']] : ['id' => $row['id'], 'name' => $row['name']],
							$row['__typename'] == 'HuntPlannerState' ? ['%s', '%s', '%s'] : ['%s', '%s']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$_sql_table,
							$row['__typename'] == 'HuntPlannerState' ? ['name' => $row['name'], 'abbreviation' => $row['abbreviation']] : ['name' => $row['name']],
							['id' => $row['id']],
							$row['__typename'] == 'HuntPlannerState' ? ['%s', '%s'] : ['%s'], ['%s']
						);
					}
					break;
				case 'HuntPlannerSeason':
					$sql_base = $wpdb->prepare("SELECT * FROM {$this->tables->seasons} WHERE id=%s", $row['id']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$this->tables->seasons,
							[
								'id' => $row['id'],
								'app_year' => $row['appYear'],
								'user_odds' => $row['userOdds'],
								'harvest_rate' => $row['harvestRate'],
								'start_date' => $row['startDate'],
								'end_date' => $row['endDate'],
								'hunters_per_sqmi' => $row['huntersPerSQMI'],
								'addi_units' => $row['additionalUnits'],
								'addi_notes' => $row['gameDepartmentNotes'],
								'season_type' => $row['seasonType'],
								'gmu_id' => $row['gmuId'],
								'weapon_id' => $row['weaponId'],
								'bag_type_id' => $row['bagTypeId'],
								'document_id' => $row['documentId']
							],
							['%s', '%d', '%f', '%f', '%s', '%s', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$this->tables->seasons,
							[
								'app_year' => $row['appYear'],
								'user_odds' => $row['userOdds'],
								'harvest_rate' => $row['harvestRate'],
								'start_date' => $row['startDate'],
								'end_date' => $row['endDate'],
								'hunters_per_sqmi' => $row['huntersPerSQMI'],
								'addi_units' => $row['additionalUnits'],
								'addi_notes' => $row['gameDepartmentNotes'],
								'season_type' => $row['seasonType'],
								'gmu_id' => $row['gmuId'],
								'weapon_id' => $row['weaponId'],
								'bag_type_id' => $row['bagTypeId'],
								'document_id' => $row['documentId']
							],
							['id' => $row['id']],
							['%d', '%f', '%f', '%s', '%s', '%f', '%s', '%s', '%s', '%s', '%s', '%s', '%s'], ['%s']
						);
					}
					if (isset($row['bagType'])) {
						$_datalist[$index]['bagType'] = $this->_import_operation([$row['bagType']]);
					}
					if (isset($row['gmu'])) {
						$_datalist[$index]['gmu'] = $this->_import_operation([$row['gmu']]);
					}
					if (isset($row['huntDocument'])) {
						$_datalist[$index]['huntDocument'] = $this->_import_operation([$row['huntDocument']]);
					}
					break;
				case 'HuntPlannerDocument':
					$sql_base = $wpdb->prepare("SELECT * FROM {$this->tables->documents} WHERE code=%s", $row['code']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$this->tables->documents,
							[
								'id' => $row['code'],
								'code' => $row['code'],
								'total_quota' => $row['totalQuota'],
								// '_probability' => $this->currentImportPoint
							],
							['%s', '%s', '%d']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$this->tables->documents,
							[
								'id' => $row['id'],
								'totalQuota' => $row['totalQuota'],
								// '_probability' => $this->currentImportPoint
							],
							['code' => $row['code']],
							['%s', '%d'], ['%s']
						);
					}
					// 
					if (isset($row['applications'])) {
						$wpdb->delete($this->tables->applications, ['document_id' => $row['code']], ['%s']);
						$_list = [];foreach ($row['applications'] as $i => $_app) {$_list[$i] = ['document_id' => $row['code'], ...$_app];}
						$_datalist[$index]['applications'] = $this->_import_operation($_list);
					}
					break;
				case 'HuntPlannerBonusOdds':
					$sql_base = $wpdb->prepare("SELECT * FROM {$this->tables->odds} WHERE id=%s", $row['id']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$this->tables->odds,
							['id' => $row['id'], 'odds' => $row['odds'], 'type' => $row['type'], 'application_id' => $row['application_id']],
							['%s', '%f', '%s', '%s']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$this->tables->odds,
							['odds' => $row['odds'], 'type' => $row['type'], 'application_id' => $row['application_id']],
							['id' => $row['id']],
							['%f', '%s', '%s'], ['%s']
						);
					}
					break;
				case 'HuntPlannerDocumentApplication':
					$_entry_status = $wpdb->insert(
						$this->tables->applications,
						[
							'document_id' => $row['document_id'],
							'quota' => $row['quota'],
							'is_resident' => (bool) $row['isResident'],
							'_listodds' => implode(',', array_map(fn($i) => $i['odds'], $row['odds']))
						],
						['%s', '%d', '%d', '%s']
					);
					if (isset($row['odds'])) {
						$_list = [];foreach ($row['odds'] as $i => $_app) {$_list[$i] = ['application_id' => $wpdb->insert_id ? $wpdb->insert_id : $row['id'], ...$_app];}
						$_datalist[$index]['odds'] = $this->_import_operation($_list);
					}
					break;
				case 'HuntPlannerGMU':
					$sql_base = $wpdb->prepare("SELECT * FROM {$this->tables->gmu} WHERE id=%s", $row['id']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$this->tables->gmu,
							[
								'id' => $row['id'],
								'name' => $row['name'],
								'total_sqmi' => $row['totalSqmi'],
								'public_sqmi' => $row['publicSqmi'],
								'public_ratio' => $row['publicRatio'],
								'code' => $row['code'],
								'state_id' => $row['state']['id']
							],
							['%s', '%s', '%f', '%f', '%f', '%s', '%s']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$this->tables->gmu,
							[
								'name' => $row['name'],
								'total_sqmi' => $row['totalSqmi'],
								'public_sqmi' => $row['publicSqmi'],
								'public_ratio' => $row['publicRatio'],
								'code' => $row['code'],
								'state_id' => $row['state']['id']
							],
							['id' => $row['id']],
							['%s', '%f', '%f', '%f', '%s', '%s'], ['%s']
						);
					}
					break;
				// case 'HuntPlannerSeasonEdge':
				// 	break;
				case 'HuntPlannerBagType':
					$sql_base = $wpdb->prepare("SELECT * FROM {$this->tables->bag_types} WHERE id=%s", $row['id']);
					$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql_base}) AS t");
					if (!$total_items) {
						$_entry_status = $wpdb->insert(
							$this->tables->bag_types,
							['id' => $row['id'], 'name' => $row['name'], 'species_id' => $row['species']['id']],
							['%s', '%s', '%s']
						);
					} else {
						$_entry_status = apply_filters('pm_project/system/isactive', 'hunts-overwrite') && $wpdb->update(
							$this->tables->bag_types,
							['name' => $row['name'], 'species_id' => $row['species']['id']],
							['id' => $row['id']],
							['%s', '%s'], ['%s']
						);
					}
					break;
				default:
					break;
			}
			$_datalist[$index]['__imported'] = ($_entry_status >= 1) ? true : (!$_entry_status ? $wpdb->last_error : null);
		}
		return $_datalist;
	}


	public function api_get_share_shortner(WP_REST_Request $request) {
		$filter_data = $request->get_param('filter_data');$response = null;
		// $filter_data = json_decode(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', stripslashes(html_entity_decode($filter_data))), true);
		// 
		$stringfied_filters = json_encode($filter_data);
		global $wpdb;
		$_exists = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT id, shortcode FROM {$this->tables->shortner} WHERE filters = %s", $stringfied_filters
			)
		);
		if ($_exists) {
			$response = (array) $_exists;
			$response['error'] = $wpdb->last_error;
		} else {
			$shortcode = uniqid('h');
			$inserted = $wpdb->insert(
				$this->tables->shortner,
				['shortcode' => $shortcode, 'filters' => $stringfied_filters],
				['%s', '%s']
			);
			$response = [
				'id' => $wpdb->insert_id,
				'shortcode' => $shortcode,
				// 'filters' => $filter_data,
				'error' => $inserted ? null : $wpdb->last_error
			];
		}
		// 
		return rest_ensure_response($response);
	}


	public function hunting_table_shortcode($atts) {
		if (apply_filters('pm_project/system/isactive', 'hunts-disabled')) {return __('Hunting record application disabled by admin.', 'site-core');}
		$_filters = isset($_GET['f']) ? $_GET['f'] : '';
		if (!empty($_filters)) {
			global $wpdb;
			$data = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT filters FROM {$this->tables->shortner} WHERE shortcode = %s", $_filters
				)
			);
			$_filters = $data && !empty($data->filters) ? $data->filters : '';

		}
		$atts = shortcode_atts([
			'state' => '',
			'points' => 0,
			'weapon' => '',
			'species' => '',
			'pointsType' => 'BONUS',
			'resident' => false,
			'page' => 1,
			'per_page' => 10,
			'_filters' => $_filters
		], $atts, 'hunting-record-table');
		$atts = array_map('sanitize_text_field', $atts);

		wp_enqueue_script('site-core-hunts');
		wp_enqueue_style('site-core-hunts');
		wp_enqueue_style('site-core');

		ob_start();
		?>
		<div id="hunting-record-table" data-params="<?php echo esc_attr(json_encode($atts)); ?>"></div>
		<style>#hunting-record-table {top: 0;left: 0;width: 100%;height: 100vh;margin: auto;padding: unset;position: fixed;max-width: unset;}</style>
		<style>.xpo_bg-paper {background: radial-gradient(circle, #e0c48f 0%, #b68b4c 100%);}.xpo_font-vintage {font-family: 'Georgia', serif;}.beer-horn-flip {transform: rotateY(180deg) translateY(-50%);margin-top: 0 !important;}</style>
		<?php
		return ob_get_clean();
	}

	public function add_admin_menu() {
		$icon = file_exists(WP_SITECORE_BUILD_PATH . '/icons/animal.svg') ? WP_SITECORE_BUILD_URI . '/icons/animal.svg' : 'dashicons-pets';
        add_menu_page(__('Hunting', 'site-core'), __('Hunting', 'site-core'), 'read', 'hunting', [$this, 'hunting_admin_page'], $icon, 20);
        // add_submenu_page('hunting', 'API Keys', 'API Keys', 'manage_options', 'hunting-api-keys', [$this, 'api_keys_admin_page']);
    }

    public function hunting_admin_page() {
		if (apply_filters('pm_project/system/isactive', 'hunts-disabled')) {
			echo esc_html(__('Hunting record application disabled by admin.', 'site-core'));
			echo '<br />';
			echo esc_html(__('Please enable if from settings page to get it back.', 'site-core'));
			return;
		}
		$this->register_scripts();
		wp_enqueue_script('site-core-hunts');
		wp_enqueue_style('site-core-hunts');
		wp_enqueue_style('site-core');
        ?>
        <div id="hunting-editor-table" data-params="{}"></div>
        <?php
    }

	public function huntarizona_research_restricted_access($atts) {
		wp_enqueue_style('site-core');
		wp_enqueue_style('site-core-hunts');
		
		$atts = shortcode_atts(array(
			'title' => __('Restricted Access', 'site-core'),
			'description' => __('Only available to ALL PAID HUNT ARIZONA members. Sign up for the ALL PAID HUNT ARIZONA MEMBERSHIP & APPLICATION SERVICE today for full access.', 'site-core'),
			'button_text' => __('Become a Member', 'site-core'),
			'login_text' => __('Already an ALL PAID HUNT ARIZONA Member?', 'site-core'),
			'login_link_text' => __('Log in here.', 'site-core'),
			'buy_url' => site_url('/checkout/?add-to-cart=247331'),
			'login_url' => site_url('/my-account/?redirect_to=' . urlencode(get_the_permalink())),
			'benefits_title' => __('Membership Benefits Include:', 'site-core'),
		), $atts);

		ob_start();
		?>
		<div class="xpo_mx-auto xpo_text-center xpo_p-0 md:xpo_p-4 md:xpo_pt-0 xpo_relative xpo_rounded-md xpo_w-full xpo_max-w-3xl">
			<div class="xpo_flex xpo_items-center xpo_gap-3">
				<div class="xpo_flex xpo_flex-col xpo_items-center xpo_gap-3 xpo_text-[#5c3b10] xpo_text-center xpo_justify-center xpo_w-full">
					<img decoding="async" src="https://huntarizona.com/wp-content/uploads/2025/07/AZO-Draw-Odds-Tool-Logo-2-300x300.png" width="238" height="238" alt="Arizone outftters draw tools" class="wp-image-251654 alignnone size-medium">
					<!-- <h1 class="xpo_text-3xl md:xpo_text-7xl xpo_font-bold xpo_tracking-wide draw-calculation-themetext">ARIZONA OUTFITTERS</h1>
					<h2 class="xpo_text-3xl md:xpo_text-7xl xpo_font-bold xpo_tracking-wide draw-calculation-themetext">DRAW TOOL</h2> -->
				</div>
			</div>

			<div class="xpo_w-full xpo_relative">
				<div class="xpo_absolute xpo_-left-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat xpo_top-1/3" style="background-image: url('<?php echo esc_url(WP_SITECORE_BUILD_URI . '/images/7021c278bcbf3785c459.png'); ?>');"></div>
				<div class="xpo_absolute xpo_-right-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat beer-horn-flip xpo_top-1/3" style="background-image: url('<?php echo esc_url(WP_SITECORE_BUILD_URI . '/images/7021c278bcbf3785c459.png'); ?>');"></div>
				<div class="xpo_z-10 xpo_relative" style="font-family: 'Poppins',Helvetica,Arial,Lucida,sans-serif;">
					<div class="xpo_flex xpo_flex-nowrap xpo_justify-center">
						<div class="">
							<div class="xpo_bg-[#987A56] xpo_border-8 xpo_border-solid xpo_border-[#5c3b10] xpo_inline-block xpo_p-8 xpo_rounded-md xpo_shadow-lg">
								<div class="md:xpo_w-[550px]">
									<div class="xpo_flex xpo_flex-col xpo_gap-6 xpo_mb-6">

										<div class="draw-calculation-themetext">
											<div class="xpo_text-center xpo_relative">
												<h3 class="xpo_font-bold xpo_text-white xpo_mb-4" style="font-size: 42px;">
													<?php echo esc_html($atts['title']); ?>
												</h3>
												<p class="xpo_text-2xl xpo_text-white xpo_mb-6">
													<?php echo esc_html($atts['description']); ?>
												</p>
												<a href="<?php echo esc_url($atts['buy_url']); ?>" class="xpo_bg-[#135242] hover:xpo_bg-[#135242]/60 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded xpo_inline-flex xpo_items-center xpo_gap-2 xpo_mx-auto xpo_mb-4" target="_blank">
													<?php echo esc_html($atts['button_text']); ?>
												</a>
												<p class="xpo_text-white xpo_mb-6">
													<?php echo esc_html($atts['login_text']); ?>
													<a href="<?php echo esc_url($atts['login_url']); ?>" class="xpo_block xpo_text-white xpo_underline">
														<?php echo esc_html($atts['login_link_text']); ?>
													</a>
												</p>
												<div class="xpo_text-left">
													<h3 class="xpo_text-3xl xpo_font-semibold xpo_text-white xpo_mb-2" style="margin-top: 30px;"><?php echo esc_html($atts['benefits_title']); ?></h3>
													<ul class="xpo_list-disc xpo_list-inside xpo_text-white xpo_space-y-1 !xpo_pb-0">
														<li><?php echo esc_html(__('Arizona Combo Hunt & Fish License', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Combo Hunt & Fish License Renewal', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Draw Application (unlimited species)', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Point Guard Plus', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Big Game Super Raffle (unlimited species)', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Migratory Bird & Federal Waterfowl Stamp', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Tag Fees When You Are Drawn', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Real-time draw odds calculations', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Historical trends and charts', 'site-core')); ?></li>
														<li><?php echo esc_html(__('Expert hunting insights', 'site-core')); ?></li>
													</ul>
												</div>
											</div>
										</div>
	
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<p class="xpo_text-[#5c3b10] xpo_mt-6 xpo_max-w-3xl xpo_mx-auto"><?php echo esc_html(__('Use this tool to estimate your draw chances for big game hunts in Arizona based on species, units, hunt type, residency, weapon of choice, and your bonus point profile. Updated annually using the latest AZGFD data.', 'site-core')); ?></p>
		</div>
		<style>.beer-horn-flip {--tw-scale-x: -1;}</style>
		<?php
		return ob_get_clean();
	}

	public function huntarizona_draw_tools_subscription_status($atts) {
		$atts = shortcode_atts(['product_id' => 247331], $atts);
		// 
		if (is_user_logged_in()) {
			$current_user = wp_get_current_user();
			if (in_array('administrator', $current_user->roles)) {
				return do_shortcode('[hunting-record-table]');
			}
			if (wc_customer_bought_product($current_user->user_email, $current_user->ID, $atts['product_id'])) {
				return do_shortcode('[hunting-record-table]');
			}
		}
		return do_shortcode('[huntarizona_research_restricted_access]');
	}
		
}