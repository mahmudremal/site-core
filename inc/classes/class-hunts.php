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
		];
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
    }
	
	public function register_routes() {
		register_rest_route('sitecore/v1', '/hunts/filters', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_filters'],
			'permission_callback' => '__return_true'
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
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->species, 'id,name'),
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
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->weapons, 'id,name'),
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
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->states, 'id,name,abbreviation'),
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
			'callback' => fn($request) => $this->api_save_simple($request, $this->tables->bag_types, 'id,name,species_id'),
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

	}

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Species
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->species} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL
			) $charset_collate;"
		);

		// Weapons
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->weapons} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL
			) $charset_collate;"
		);

		// States
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->states} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				abbreviation VARCHAR(10) NOT NULL
			) $charset_collate;"
		);

		// Bag Types
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->bag_types} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				name VARCHAR(255) NOT NULL,
				species_id VARCHAR(20) NOT NULL
				-- FOREIGN KEY (species_id) REFERENCES {$this->tables->species}(id) ON DELETE CASCADE
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
				-- FOREIGN KEY (state_id) REFERENCES {$this->tables->states}(id) ON DELETE CASCADE
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
				weapon_id VARCHAR(20) NOT NULL,
				bag_type_id VARCHAR(20) NOT NULL,
				gmu_id VARCHAR(20) NOT NULL,
				document_id VARCHAR(20)
				-- FOREIGN KEY (weapon_id) REFERENCES {$this->tables->weapons}(id) ON DELETE CASCADE
				-- FOREIGN KEY (bag_type_id) REFERENCES {$this->tables->bag_types}(id) ON DELETE CASCADE
				-- FOREIGN KEY (gmu_id) REFERENCES {$this->tables->gmu}(id) ON DELETE CASCADE
			) $charset_collate;"
		);

		// Documents
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->documents} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				code VARCHAR(50) NOT NULL,
				total_quota INT
			) $charset_collate;"
		);

		// Applications
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->applications} (
				id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
				document_id VARCHAR(20) NOT NULL,
				is_resident BOOLEAN,
				quota INT
				-- FOREIGN KEY (document_id) REFERENCES {$this->tables->documents}(id) ON DELETE CASCADE
			) $charset_collate;"
		);

		// Odds
		dbDelta(
			"CREATE TABLE IF NOT EXISTS {$this->tables->odds} (
				id VARCHAR(20) NOT NULL PRIMARY KEY,
				application_id BIGINT UNSIGNED NOT NULL,
				odds FLOAT,
				type VARCHAR(50)
				-- FOREIGN KEY (application_id) REFERENCES {$this->tables->applications}(id) ON DELETE CASCADE
			) $charset_collate;"
		);
    }

    public function register_deactivation_hook() {
		global $wpdb;
		foreach ((array) $this->tables as $_table) {
			$wpdb->query("DROP TABLE IF EXISTS {$_table}");
		}
	}

	public function register_scripts() {
        wp_register_script('site-core-hunts', WP_SITECORE_BUILD_JS_URI . '/hunts.js', [], Assets::filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/hunts.js'), true);
        wp_register_style('site-core-hunts', WP_SITECORE_BUILD_CSS_URI . '/hunts.css', [], Assets::filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/hunts.css'), 'all');
		wp_localize_script('site-core-hunts', 'siteCoreConfig', apply_filters('partnershipmang/siteconfig', []));
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
			]
		];
        return $args;
    }

	public function api_get_filters(WP_REST_Request $request) {
		global $wpdb;
		// $response = [
		// "weapon" => [
		// 	[
		// 		"_id" => "4P54J",
		// 		"name" => "Archery"
		// 	],
		// 	[
		// 		"_id" => "M3ZgJ",
		// 		"name" => "Muzzleloader"
		// 	],
		// 	[
		// 		"_id" => "9JMbP",
		// 		"name" => "Rifle"
		// 	],
		// 	[
		// 		"_id" => "vPEk3",
		// 		"name" => "Shotgun"
		// 	],
		// 	[
		// 		"_id" => "k36N3",
		// 		"name" => "Handgun"
		// 	]
		// ],
		// "states" => [
		// 	[
		// 		"_id" => "4P54J",
		// 		"name" => "Wyoming"
		// 	],
		// 	[
		// 		"_id" => "M3ZgJ",
		// 		"name" => "New Mexico"
		// 	],
		// 	[
		// 		"_id" => "03e0X",
		// 		"name" => "Arizona"
		// 	],
		// 	[
		// 		"_id" => "9JMbP",
		// 		"name" => "Colorado"
		// 	],
		// 	[
		// 		"_id" => "e3W5P",
		// 		"name" => "Montana"
		// 	],
		// 	[
		// 		"_id" => "73N8P",
		// 		"name" => "Utah"
		// 	],
		// 	[
		// 		"_id" => "vXdKP",
		// 		"name" => "Idaho"
		// 	],
		// 	[
		// 		"_id" => "nJQAJ",
		// 		"name" => "Nevada"
		// 	],
		// 	[
		// 		"_id" => "vPEk3",
		// 		"name" => "Oregon"
		// 	],
		// 	[
		// 		"_id" => "k36N3",
		// 		"name" => "Washington"
		// 	],
		// 	[
		// 		"_id" => "WXLvJ",
		// 		"name" => "California"
		// 	],
		// 	[
		// 		"_id" => "xPvyJ",
		// 		"name" => "Kansas"
		// 	],
		// 	[
		// 		"_id" => "l3DwX",
		// 		"name" => "Alaska"
		// 	],
		// 	[
		// 		"_id" => "A3oQP",
		// 		"name" => "Alabama"
		// 	],
		// 	[
		// 		"_id" => "MXar3",
		// 		"name" => "Arkansas"
		// 	],
		// 	[
		// 		"_id" => "LJr4X",
		// 		"name" => "Connecticut"
		// 	],
		// 	[
		// 		"_id" => "OJY43",
		// 		"name" => "District of Columbia"
		// 	],
		// 	[
		// 		"_id" => "rJpo3",
		// 		"name" => "Delaware"
		// 	],
		// 	[
		// 		"_id" => "LJwAX",
		// 		"name" => "Florida"
		// 	],
		// 	[
		// 		"_id" => "jJRLX",
		// 		"name" => "Georgia"
		// 	],
		// 	[
		// 		"_id" => "7Pz2P",
		// 		"name" => "Hawaii"
		// 	],
		// 	[
		// 		"_id" => "23glJ",
		// 		"name" => "Iowa"
		// 	],
		// 	[
		// 		"_id" => "LXAv3",
		// 		"name" => "Illinois"
		// 	],
		// 	[
		// 		"_id" => "M3953",
		// 		"name" => "Indiana"
		// 	],
		// 	[
		// 		"_id" => "2Pb1J",
		// 		"name" => "Kentucky"
		// 	],
		// 	[
		// 		"_id" => "qJ0EP",
		// 		"name" => "Louisiana"
		// 	],
		// 	[
		// 		"_id" => "0XmpP",
		// 		"name" => "Massachusetts"
		// 	],
		// 	[
		// 		"_id" => "BPGlX",
		// 		"name" => "Maryland"
		// 	],
		// 	[
		// 		"_id" => "oPVx3",
		// 		"name" => "Maine"
		// 	],
		// 	[
		// 		"_id" => "r3k73",
		// 		"name" => "Michigan"
		// 	],
		// 	[
		// 		"_id" => "BPlMX",
		// 		"name" => "Minnesota"
		// 	],
		// 	[
		// 		"_id" => "zPKOP",
		// 		"name" => "Missouri"
		// 	],
		// 	[
		// 		"_id" => "d38D3",
		// 		"name" => "Mississippi"
		// 	],
		// 	[
		// 		"_id" => "0P1DJ",
		// 		"name" => "North Carolina"
		// 	],
		// 	[
		// 		"_id" => "NXyV3",
		// 		"name" => "North Dakota"
		// 	],
		// 	[
		// 		"_id" => "ZJBe3",
		// 		"name" => "Nebraska"
		// 	],
		// 	[
		// 		"_id" => "34kyX",
		// 		"name" => "New Hampshire"
		// 	],
		// 	[
		// 		"_id" => "P544J",
		// 		"name" => "New Jersey"
		// 	],
		// 	[
		// 		"_id" => "3ZygX",
		// 		"name" => "New York"
		// 	],
		// 	[
		// 		"_id" => "3eb0J",
		// 		"name" => "Ohio"
		// 	],
		// 	[
		// 		"_id" => "JMObX",
		// 		"name" => "Oklahoma"
		// 	],
		// 	[
		// 		"_id" => "3W05J",
		// 		"name" => "Pennsylvania"
		// 	],
		// 	[
		// 		"_id" => "3NM8X",
		// 		"name" => "Rhode Island"
		// 	],
		// 	[
		// 		"_id" => "XdyK3",
		// 		"name" => "South Carolina"
		// 	],
		// 	[
		// 		"_id" => "JQdA3",
		// 		"name" => "South Dakota"
		// 	],
		// 	[
		// 		"_id" => "PEakP",
		// 		"name" => "Tennessee"
		// 	],
		// 	[
		// 		"_id" => "36mNX",
		// 		"name" => "Texas"
		// 	],
		// 	[
		// 		"_id" => "XLZvJ",
		// 		"name" => "Virginia"
		// 	],
		// 	[
		// 		"_id" => "Pn6eP",
		// 		"name" => "Vermont"
		// 	],
		// 	[
		// 		"_id" => "Jxb5X",
		// 		"name" => "Wisconsin"
		// 	],
		// 	[
		// 		"_id" => "32zk3",
		// 		"name" => "West Virginia"
		// 	]
		// ],
		// "species" => [
		// 	[
		// 		"_id" => "4P54J",
		// 		"name" => "Elk"
		// 	],
		// 	[
		// 		"_id" => "M3ZgJ",
		// 		"name" => "Antelope"
		// 	],
		// 	[
		// 		"_id" => "03e0X",
		// 		"name" => "Deer"
		// 	],
		// 	[
		// 		"_id" => "9JMbP",
		// 		"name" => "Moose"
		// 	],
		// 	[
		// 		"_id" => "e3W5P",
		// 		"name" => "Bighorn Sheep"
		// 	],
		// 	[
		// 		"_id" => "73N8P",
		// 		"name" => "Mountain Goat"
		// 	],
		// 	[
		// 		"_id" => "nJQAJ",
		// 		"name" => "Bison"
		// 	],
		// 	[
		// 		"_id" => "vPEk3",
		// 		"name" => "Desert Sheep"
		// 	],
		// 	[
		// 		"_id" => "k36N3",
		// 		"name" => "Black Bear"
		// 	],
		// 	[
		// 		"_id" => "932kJ",
		// 		"name" => "Coues Deer"
		// 	],
		// 	[
		// 		"_id" => "xPvyJ",
		// 		"name" => "CA Bighorn Sheep"
		// 	],
		// 	[
		// 		"_id" => "WPqDJ",
		// 		"name" => "Ibex"
		// 	],
		// 	[
		// 		"_id" => "bJODP",
		// 		"name" => "Barbary Sheep"
		// 	],
		// 	[
		// 		"_id" => "GJjnJ",
		// 		"name" => "Oryx"
		// 	],
		// 	[
		// 		"_id" => "l3DwX",
		// 		"name" => "Brown Bear"
		// 	],
		// 	[
		// 		"_id" => "A3oQP",
		// 		"name" => "Caribou"
		// 	],
		// 	[
		// 		"_id" => "MXar3",
		// 		"name" => "Muskox"
		// 	],
		// 	[
		// 		"_id" => "LJr4X",
		// 		"name" => "Dall Sheep"
		// 	]
		// ]
		// ];
		// return rest_ensure_response($response);

		// Fetch data from database
		$states    = $wpdb->get_results("SELECT id, name, abbreviation FROM {$this->tables->states}", ARRAY_A);
		$species   = $wpdb->get_results("SELECT id, name FROM {$this->tables->species}", ARRAY_A);
		$weapons   = $wpdb->get_results("SELECT id, name FROM {$this->tables->weapons}", ARRAY_A);
		$bag_types = $wpdb->get_results("SELECT id, name, species_id FROM {$this->tables->bag_types}", ARRAY_A);
		$gmu       = $wpdb->get_results("SELECT id, name, code, state_id FROM {$this->tables->gmu}", ARRAY_A);

		return rest_ensure_response([
			'states'    => $states,
			'species'   => $species,
			'weapons'   => $weapons,
			'bag_types' => $bag_types,
			'gmu'       => $gmu
		]);
	}

	public function api_get_hunts(WP_REST_Request $request) {
		global $wpdb;

		// Get filters
		$state      = $request->get_param('state');
		$weapon     = $request->get_param('weapon');
		$species    = $request->get_param('species');
		$points     = (int) $request->get_param('points');
		$pointsType = $request->get_param('pointsType');
		$resident   = filter_var($request->get_param('resident'), FILTER_VALIDATE_BOOLEAN);
		$page       = max(1, (int) $request->get_param('page'));
		$per_page   = max(24, (int) $request->get_param('per_page'));

		$offset = ($page - 1) * $per_page;

		// Base query
		$sql = "
			SELECT s.*, 
				w.name AS weapon_name, 
				b.name AS bag_type_name, 
				g.name AS gmu_name, g.public_ratio, g.total_sqmi, 
				st.name AS state_name, st.abbreviation 
			FROM {$this->tables->seasons} s
			INNER JOIN {$this->tables->weapons} w      ON w.id = s.weapon_id
			INNER JOIN {$this->tables->bag_types} b    ON b.id = s.bag_type_id
			INNER JOIN {$this->tables->gmu} g          ON g.id = s.gmu_id
			INNER JOIN {$this->tables->states} st      ON st.id = g.state_id
			WHERE 1=1
		";

		// Apply filters
		if ($state) {
			$sql .= $wpdb->prepare(" AND st.id = %s", $state);
		}

		if ($weapon) {
			$sql .= $wpdb->prepare(" AND w.id = %s", $weapon);
		}

		if ($species) {
			$sql .= $wpdb->prepare(" AND b.species_id = %s", $species);
		}

		$sql .= " ORDER BY s.user_odds DESC";

		// Total count
		$total_items = (int) $wpdb->get_var("SELECT COUNT(*) FROM ({$sql}) as t");

		// Pagination
		$sql .= $wpdb->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);

		// Fetch results
		$results = $wpdb->get_results($sql);

		$response_data = [];

		foreach ($results as $row) {
			$response_data[] = [
				'id'               => $row->id,
				'app_year'         => $row->app_year,
				'user_odds'        => (float) $row->user_odds,
				'harvest_rate'     => (float) $row->harvest_rate,
				'season_type'      => $row->season_type,
				'start_date'       => $row->start_date,
				'end_date'         => $row->end_date,
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
				'gmu_id'           => $row->gmu_id,
				'gmu'              => [
					'id'            => $row->gmu_id,
					'name'          => $row->gmu_name,
					'public_ratio'  => (float) $row->public_ratio,
					'total_sqmi'    => (float) $row->total_sqmi,
					'state'         => [
						'id'           => $state,
						'name'         => $row->state_name,
						'abbreviation' => $row->abbreviation
					]
				],
				'document_id'      => $row->document_id
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
			$data[$field] = sanitize_text_field($request->get_param($field));
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




	public function hunting_table_shortcode($atts) {
		$atts = shortcode_atts([
			'state' => '',
			'weapon' => '',
			'species' => '',
			'points' => 0,
			'pointsType' => 'BONUS',
			'resident' => false,
			'page' => 1,
			'per_page' => 10
		], $atts, 'hunting-record-table');
		$atts = array_map('sanitize_text_field', $atts);

		wp_enqueue_script('site-core-hunts');
		wp_enqueue_style('site-core-hunts');

		ob_start();
		?>
		<div id="hunting-record-table" data-params='<?php echo esc_attr(json_encode($atts)); ?>'></div>
		<style>#hunting-record-table {top: 0;left: 0;width: 100%;height: 100vh;margin: auto;padding: unset;position: fixed;max-width: unset;}</style>
		<style>.xpo_bg-paper {background: radial-gradient(circle, #e0c48f 0%, #b68b4c 100%);}.xpo_font-vintage {font-family: 'Georgia', serif;}.beer-horn-flip {transform: rotateY(180deg) translateY(-50%);margin-top: 0 !important;}</style>
		<?php
		return ob_get_clean();
	}

	public function add_admin_menu() {
		$icon = file_exists(WP_SITECORE_BUILD_PATH . '/icons/animal.svg') ? WP_SITECORE_BUILD_URI . '/icons/animal.svg' : 'dashicons-pets';
        add_menu_page(__('Hunting', 'domain'), __('Hunting', 'domain'), 'manage_options', 'hunting', [$this, 'hunting_admin_page'], $icon, 20);
        // add_submenu_page('hunting', 'API Keys', 'API Keys', 'manage_options', 'hunting-api-keys', [$this, 'api_keys_admin_page']);
    }

    public function hunting_admin_page() {
		$this->register_scripts();
		wp_enqueue_script('site-core-hunts');
		wp_enqueue_style('site-core-hunts');
        ?>
        <div id="hunting-editor-table" data-params="{}"></div>
        <?php
    }

}