<?php
/**
 * ProTools Manager Manifest class
 *
 * @package PartnershipManager
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;

class Manifest {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
        add_filter('wp_head', [$this, 'add_manifest_link_to_head']);
        add_filter('init', [$this, 'add_manifest_json_rewrite_rule']);
        add_filter('template_redirect', [$this, 'render_manifest_json']);
        add_filter('query_vars', [$this, 'register_manifest_json_query_var']);
    }
    public function add_manifest_json_rewrite_rule() {
        add_rewrite_rule('^manifest\.json$', 'index.php?manifest_json=1', 'top');
    }
    public function register_manifest_json_query_var($vars) {
        $vars[] = 'manifest_json';
        return $vars;
    }
    public function render_manifest_json() {
        if (get_query_var('manifest_json') == 1) {
            header('Content-Type: application/json');
    
            $manifest = [
                'name' => 'Partnership Dashboard',
                'short_name' => 'Partnership',
                'start_url' => site_url('/'), // get_the_permalink((int) apply_filters('pm_project/system/getoption', 'general-screen', 0)),
                'display' => 'standalone',
                'background_color' => '#fdedef',
                'theme_color' => '#e63f51',
                'description' => sprintf(__('Manage your partnership with %s', 'site-core'), get_bloginfo('name')),
                'icons' => [
                    [
                        'src' => esc_url(WP_SITECORE_BUILD_URI . '/icons/brand/favicon-16x16.png'),
                        'sizes' => '16x16',
                        'type' => 'image/png',
                    ],
                    [
                        'src' => esc_url(WP_SITECORE_BUILD_URI . '/icons/brand/favicon-32x32.png'),
                        'sizes' => '32x32',
                        'type' => 'image/png',
                    ],
                    [
                        'src' => esc_url(WP_SITECORE_BUILD_URI . '/icons/brand/android-chrome-192x192.png'),
                        'sizes' => '192x192',
                        'type' => 'image/png',
                    ],
                    [
                        'src' => esc_url(WP_SITECORE_BUILD_URI . '/icons/brand/android-chrome-512x512.png'),
                        'sizes' => '512x512',
                        'type' => 'image/png',
                    ],
                ],
                'scope' => '/',
                'orientation' => 'portrait',
                'splash_pages' => null,
            ];
    
            // echo json_encode($manifest, JSON_UNESCAPED_SLASHES);
            echo json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            exit; // Prevent WordPress from continuing to load
        }
    }
    public function add_manifest_link_to_head() {
        // if (!is_page(301)) {return;}
        echo '<link rel="manifest" href="' . esc_url(home_url('/manifest.json')) . '">' . "\n";
    }

}