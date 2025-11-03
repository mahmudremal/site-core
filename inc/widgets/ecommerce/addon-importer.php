<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Importer {
    use Singleton;

    protected function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        if (!apply_filters('pm_project/system/isactive', 'storefront-apiactive')) {return;}
		// register_rest_route('sitecore/v1', '/ecommerce/importer', [
		// 	'methods' => 'POST',
		// 	'callback' => [$this, 'post_translations'],
		// 	'permission_callback' => '__return_true',
        //     'args'                => [
        //         'list'    => [
        //             'required'    => true,
        //             'type'        => ['array', 'object'],
        //             'description' => __('An list object of languages as per key: value structure.', 'site-core'),
        //         ]
        //     ]
		// ]);
    }

    public function post_translations(WP_REST_Request $request) {
    }

}