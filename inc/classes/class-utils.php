<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WP_User_Query;

class Utils {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_filter('init', [$this, 'disable_gutenberg']);
        add_filter('rest_api_init', [$this, 'rest_api_init']);
        add_filter('wp_print_scripts', [$this, 'wp_print_scripts'], 10, 0);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
    }
    
    public function rest_api_init() {
    }

    public function settings($args) {
		$args['utils']		= [
			'title'							=> __('Utils', 'site-core'),
			'description'					=> __('Wordpress utils to control your wordpress closely to improve performace and necessity first.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'utils-off-gutenburg',
					'label'					=> __('Gutenburg', 'site-core'),
					'description'			=> __('Mark to dsable gutenburg editor from wordpress.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'utils-off-heartbit-front',
					'label'					=> __('Heartbit', 'site-core'),
					'description'			=> __('Mark to dsable heartbit for wordpress on frontend.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'utils-off-heartbit-back',
					'label'					=> __('Heartbit', 'site-core'),
					'description'			=> __('Mark to dsable heartbit for wordpress on frontend.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];
        return $args;
    }

    public function disable_gutenberg() {
        if (!apply_filters('pm_project/system/isactive', 'utils-off-gutenburg')) {return;}
        add_filter('use_block_editor_for_post', '__return_false', 10);
        add_filter('use_block_editor_for_post_type', '__return_false', 10);
    }
    public function wp_print_scripts() {
        if (apply_filters('pm_project/system/isactive', 'utils-off-heartbit-back')) {
            if (is_admin()) {
                wp_deregister_script('heartbeat');
            }
        } else if (apply_filters('pm_project/system/isactive', 'utils-off-heartbit-front')) {
            if (!is_admin()) {
                wp_deregister_script('heartbeat');
            }
        } else {}
    }
    
}