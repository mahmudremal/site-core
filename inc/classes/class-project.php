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
		// Load class instances.

			Hunts::get_instance();
		
		// Cdn::get_instance();
		// 	Apps::get_instance();
		// 	Task::get_instance();
		// 	Error::get_instance();
		// 	Utils::get_instance();
		// 	Radar::get_instance();
		// Editor::get_instance();
		// 		Suite::get_instance();
		// 		Users::get_instance();
		// 		Roles::get_instance();
		Menus::get_instance();
		Option::get_instance();
		Assets::get_instance();
		// Llmstxt::get_instance();
		// 		Payout::get_instance();
		// 		Stores::get_instance();
		// 	Visitor::get_instance();
		// 		Toolbar::get_instance();
		// 		Invoice::get_instance();
		// 		Finance::get_instance();
		// 	Payment::get_instance();
		// 		Supports::get_instance();
		// 		Referral::get_instance();
			Security::get_instance();
			// 	Frontend::get_instance();
			// 	Contract::get_instance();
			// Manifest::get_instance();
			// Currency::get_instance();
			// Shortcode::get_instance();
			// 	Admin_Menu::get_instance();
			// 	Partner_Docs::get_instance();
			// 	Service_Docs::get_instance();
		Translations::get_instance();
		// 	Notifications::get_instance();
		// Instant_Images::get_instance();
				
		// 		Payment_Tap::get_instance();
		// 		Payment_Tabby::get_instance();
		// 		Payment_Stripe::get_instance();
		// 		Payment_Sslcommerz::get_instance();
        // 
		// Uncomment the following line if setup_hooks needs to be called.
		$this->setup_hooks();
	}

	/**
	 * Sets up WordPress hooks for the project.
	 */
	protected function setup_hooks() {
		add_action('init', [$this, 'init'], 1, 0);
		register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
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

}
