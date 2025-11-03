<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Locale {
    use Singleton;

    protected function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        if (!apply_filters('pm_project/system/isactive', 'storefront-apiactive')) {return;}
		register_rest_route('sitecore/v1', '/ecommerce/locales/(?P<text_domain>[^/]+)/(?P<locale_id>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_translations'],
			'permission_callback' => '__return_true',
            'args'                => [
                'text_domain'    => [
                    'required'    => true,
                    'type'        => ['string'],
                    'description' => __('An string of text domain name.', 'site-core'),
                ],
                'locale_id'    => [
                    'required'    => true,
                    'type'        => ['string'],
                    'description' => __('An string of locale name.', 'site-core'),
                ]
            ]
		]);
		register_rest_route('sitecore/v1', '/ecommerce/locale/update', [
			'methods' => 'POST',
			'callback' => [$this, 'post_translations'],
			'permission_callback' => '__return_true',
            'args'                => [
                'list'    => [
                    'required'    => true,
                    'type'        => ['array', 'object'],
                    'description' => __('An list object of languages as per key: value structure.', 'site-core'),
                ]
            ]
		]);
    }

    public function get_translations(WP_REST_Request $request) {
        $text_domain = $request->get_param('text_domain');
        $locale_id = $request->get_param('locale_id');
        $file_path = WP_SITECORE_DIR_PATH . "/languages/translations/{$text_domain}/{$locale_id}.json";
        if (file_exists($file_path)) {
            $data = json_decode(file_get_contents($file_path), true);
            return new WP_REST_Response($data, 200);
        } else {
            return new WP_Error('no_translations', 'No translations found for the specified text domain and locale.', ['status' => 404]);
        }
    }


    public function post_translations(WP_REST_Request $request) {
        $list = $request->get_param('list');
        foreach ($list as $text_domain => $translations) {
            foreach ($translations as $locale_id => $texts) {
                $file_path = WP_SITECORE_DIR_PATH . "/languages/translations/{$text_domain}/{$locale_id}.json";
                wp_mkdir_p(dirname($file_path));
                $existing_data = file_exists($file_path) ? json_decode(file_get_contents($file_path), true) : [];
                foreach ($texts as $key => $value) {
                    if (!isset($existing_data[$key])) {
                        $existing_data[$key] = $value;
                    }
                }
                file_put_contents($file_path, json_encode($existing_data, JSON_PRETTY_PRINT));
            }
        }
        return new WP_REST_Response(['message' => 'Translations updated successfully'], 200);
    }

    
}