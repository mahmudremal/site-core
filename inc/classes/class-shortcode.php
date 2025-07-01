<?php
/**
 * ProTools Manager Shortcode class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;

class Shortcode {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
        // add_shortcode('partnership-application', [$this, 'promanager_interface_shortcode']);
        // add_filter('the_content', [$this, 'partnership_manager_screen_page']);
        // add_filter('partnership_manager_screen_active', [$this, 'partnership_manager_screen_active']);
    }

    public function promanager_interface_shortcode($args) {
        global $wp;
        if (apply_filters('pm_project/system/isactive', 'general-paused')) {return '';}
        // Check if user is logged in
        // if (!is_user_logged_in()) {
        //     return "<p>You're not permissible to access this.</p>";
        //     $current_url = esc_url(home_url(add_query_arg([], $wp->request)));
        //     return '<a href="' . wp_login_url($current_url) . '" class="button">Login</a>';
        // }
        $current_user = wp_get_current_user();
        // Check if user has administrative role
        /**
         * in_array('administrator', (array) $current_user->roles)
         */
        // Enqueue CSS and JS files
        // // wp_enqueue_style( 'site-core-admin' );
        
        // wp_enqueue_style( 'site-core-tailwind' );
        wp_enqueue_script( 'site-core-admin' );
        // wp_enqueue_script( 'site-core-public' );
        
        // <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        // <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        // <script src="https://cdn.jsdelivr.net/npm/react-router"></script>
        // <script src="https://cdn.jsdelivr.net/npm/react-router-dom/umd/react-router-dom.development.js"></script>
        
        return '
        <div class="partnershipapp do-not-track" data-sensitive="true" data-hj-suppress data-fs-ignore>
            <p>
                Partner manager Interface should be apear here. If your found this message repeating, please contact to Remal Mahmud (Developer).
                <a href="https://wa.me/8801814118328" target="_blank">+8801814118328</a> <a href="mailto:hello@mahmudremal.com">hello@mahmudremal.com</a>
            </p>
        </div>
        <link rel="stylesheet" href="' . esc_url(WP_SITECORE_BUILD_LIB_URI . '/css/remixicon.css') . '" media="all" />
        <style>div#wpadminbar {display: none;}</style>
        ';
    }

    function partnership_manager_screen_page($content) {
        if (apply_filters('pm_project/system/isactive', 'general-paused')) {return $content;}
        if (is_page((int) apply_filters('pm_project/system/getoption', 'general-screen', false))) {
            return do_shortcode('[partnership-application]');
        }
        return $content;
    }

    function partnership_manager_screen_active($default = false) {
        return true;
        if (apply_filters('pm_project/system/isactive', 'general-paused')) {return false;}
        if (is_page((int) apply_filters('pm_project/system/getoption', 'general-screen', false))) {
            return true;
        }
        return false;
    }

}