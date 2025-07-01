<?php
/**
 * Enqueue theme assets
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Assets {
	use Singleton;

	/**
	 * Constructor for the Assets class.
	 * Sets up hooks.
	 */
	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

	/**
	 * Sets up WordPress hooks for enqueuing assets.
	 */
	protected function setup_hooks() {
		add_action('wp_enqueue_scripts', [ $this, 'register_styles' ]);
		add_action('wp_enqueue_scripts', [ $this, 'register_scripts' ]);
		add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
		add_filter('partnershipmang/siteconfig', [ $this, 'siteConfig' ], 1, 1);
	}

	/**
	 * Registers and enqueues frontend styles.
	 */
	public function register_styles() {
		wp_register_style('site-core', WP_SITECORE_DIR_URI . '/styling.css', [], $this->filemtime(WP_SITECORE_DIR_PATH . '/styling.css'), 'all');
		if (!apply_filters('partnership_manager_screen_active', false)) {return;}

		// Enqueue styles.
		$version = $this->filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/public.css');
		// wp_register_style('site-core-public', WP_SITECORE_BUILD_CSS_URI . '/public.css', [], $version, 'all');
		// wp_register_style('site-core-pricing', WP_SITECORE_BUILD_CSS_URI . '/pricing.css', [], $version, 'all');
		// wp_register_style('site-core-admin', WP_SITECORE_BUILD_CSS_URI . '/admin.css', [], $this->filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/admin.css'), 'all');
	}

	/**
	 * Registers and enqueues frontend scripts.
	 */
	public function register_scripts() {
		if (!apply_filters('partnership_manager_screen_active', false)) {return;}

		// Enqueue scripts.
		// wp_register_script('site-core-public', WP_SITECORE_BUILD_JS_URI . '/public.js', [], $this->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/public.js'), true);
		// 
	}

	/**
	 * Registers and enqueues admin styles and scripts.
	 *
	 * @param string $curr_page The current admin page.
	 */
	public function admin_enqueue_scripts($curr_page) {
		wp_register_style('site-core', WP_SITECORE_DIR_URI . '/styling.css', [], $this->filemtime(WP_SITECORE_DIR_PATH . '/styling.css'), 'all');
		// wp_register_style('site-core-tailwind', WP_SITECORE_DIR_URI . '/assets/tailwind.css', [], $this->filemtime(WP_SITECORE_DIR_PATH . '/assets/tailwind.css'), 'all');
		// wp_register_style('site-core-admin', WP_SITECORE_BUILD_CSS_URI . '/admin.css', [], $this->filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/admin.css'), 'all');
		// wp_register_script('site-core-admin', WP_SITECORE_BUILD_JS_URI . '/admin.js', [], $this->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/admin.js'), true);
		// wp_register_script('site-core-setting', WP_SITECORE_BUILD_JS_URI . '/setting.js', [], $this->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/setting.js'), true);
		// wp_localize_script('site-core-admin', 'siteCoreConfig', apply_filters('partnershipmang/siteconfig', []));
		// if ($curr_page == 'settings_page_site-core') {
		// 	wp_enqueue_script('site-core-setting');
		// }
		// if ($curr_page !== 'toplevel_page_pro-tools') {return;}
		// wp_enqueue_style('site-core-tailwind');
		// wp_enqueue_style('site-core-admin');
		// wp_enqueue_script('site-core-admin');
		// wp_enqueue_style('site-core-public');
	}

	/**
	 * Gets the file modification time.
	 *
	 * @param string $path The file path.
	 * @return int|false The file modification time or false if the file does not exist.
	 */
	public static function filemtime($path) {
		return (file_exists($path)&&!is_dir($path))?filemtime($path):false;
	}

	/**
	 * Configures site settings for localization.
	 *
	 * @param array $args The configuration arguments.
	 * @return array The modified configuration arguments.
	 */
	public function siteConfig($args) {
		return wp_parse_args([
			'ajaxUrl'    		=> admin_url('admin-ajax.php'),
			'ajax_nonce' 		=> wp_create_nonce('ajax/verify/nonce'),
			'logout_url'		=> wp_logout_url(),
			'loggedin'			=> is_user_logged_in(),
			'buildPath'  		=> WP_SITECORE_BUILD_URI,
			'appURI'			=> WP_SITECORE_DIR_URI,
			'i18n'				=> [],
			// 'locale'			=> get_user_meta(get_current_user_id(), 'partnership_dashboard_locale', true), // get_user_locale(),
			'user_id'			=> get_current_user_id(),
			'isSignUp'			=> strpos($_SERVER['REQUEST_URI'], 'signup') !== false,
			'pages'				=> [
				'privacy'		=> get_the_permalink(apply_filters('pm_project/system/getoption', 'general-policy', null)),
				'terms'			=> get_the_permalink(apply_filters('pm_project/system/getoption', 'general-policy', null)),
			]
		], (array) $args);
	}

	/**
	 * Placeholder function for dequeuing scripts.
	 */
	public function wp_denqueue_scripts() {}
}
