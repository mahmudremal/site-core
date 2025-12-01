<?php
/**
 * Bootstraps the Theme.
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Project {
	use Singleton;

	public static $tables = [
        // 'tools_service',
    ];

	/**
	 * Constructor for the Project class.
	 * Loads necessary classes and sets up hooks.
	 */
	protected function __construct() {
		$this->setup_hooks();
		// $this->setup_hunts();
		$this->setup_agreements();
		// $this->setup_partnership();
		// $this->setup_extensions();
	}
	protected function setup_hooks() {
		Cdn::get_instance();
		Sms::get_instance();
		Task::get_instance();
		Login::get_instance();
		Utils::get_instance();
		Menus::get_instance();
		Redis::get_instance();
		Option::get_instance();
		Assets::get_instance();
		Emails::get_instance();
		Editor::get_instance();
		Credits::get_instance();
		Llmstxt::get_instance();
		Database::get_instance();
		Ecommerce::get_instance();
		Affiliate::get_instance();
		Translations::get_instance();
		Store_Manager::get_instance();
		Instant_Images::get_instance();
		add_action('init', [$this, 'init'], 1, 0);
		// register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);


		// Radar::get_instance();
		// Visitor::get_instance();


		// Disable REST API index
		add_filter( 'rest_index', function( $response ) {
			return new \WP_Error(
				'rest_index_disabled',
				__( 'The REST API index is disabled for public access.' ),
				[ 'status' => 403 ]
			);
		});
		// Disable all namespace indexes
		add_filter( 'rest_namespace_index', function( $response, $request ) {
			return new \WP_Error(
				'rest_namespace_disabled',
				__( 'The REST API namespace index is disabled for public access.' ),
				[ 'status' => 403 ]
			);
		}, 10, 2);
	}

	/**
	 * Sets up WordPress hooks for the project - Hunt Research tool.
	 */
	protected function setup_hunts() {
		Hunts::get_instance();
		Menus::get_instance();
		Option::get_instance();
		Assets::get_instance();
		Security::get_instance();
		Translations::get_instance();
		// 
		add_action('init', [$this, 'init'], 1, 0);
		// register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		// register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
	}

	protected function setup_agreements() {
		Teams::get_instance();
		Contracts::get_instance();
	}

	protected function setup_partnership() {
		Apps::get_instance();
		Typographics::get_instance();
		Payment_Tap::get_instance();
		Payment_Tabby::get_instance();
		Payment_Stripe::get_instance();
		Payment_Sslcommerz::get_instance();

		Notifications::get_instance();
		Frontend::get_instance();
		Contract::get_instance();
		Manifest::get_instance();
		Currency::get_instance();
		Shortcode::get_instance();
		Admin_Menu::get_instance();
		Partner_Docs::get_instance();
		Service_Docs::get_instance();
		Toolbar::get_instance();
		Invoice::get_instance();
		Finance::get_instance();
		Payment::get_instance();
		Supports::get_instance();
		Referral::get_instance();
		Security::get_instance();
		Payout::get_instance();
		Stores::get_instance();
		Users::get_instance();
		Roles::get_instance();
		Error::get_instance();
		Translations::get_instance();
	}
	
	protected function setup_extensions() {
		Suite::get_instance();
	}

	/**
	 * Initializes the plugin.
	 * Loads the text domain for localization.
	 */
	public function init() {
		load_plugin_textdomain('site-core', false, dirname( plugin_basename( WP_SITECORE__FILE__ ) ) . '/languages');		
	}

	public function register_activation_hook() {
		flush_rewrite_rules();
	}

	public function register_deactivation_hook() {
	}

}
