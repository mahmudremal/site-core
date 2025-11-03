<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Address {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();
        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        if (!apply_filters('pm_project/system/isactive', 'storefront-apiactive')) {return;}
        register_rest_route('sitecore/v1', '/ecommerce/(?P<user_id>\d+)/addresses', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_list_addresses'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/(?P<user_id>\d+)/address/(?P<address_id>\d+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_update_address'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/addresses/coverage-area', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_list_coverage_area'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function api_list_addresses(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id') ?: 0;
        $session_id = Ecommerce::get_instance()->get_session_id();

        global $wpdb;
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->client_addresses} WHERE user_id = %d OR session_id = %d ORDER BY _order DESC LIMIT 0, 12;",
                (int) $user_id == 0 ? -1 : $user_id, (int) $session_id
            )
        );
        return rest_ensure_response($results);
    }

    public function api_update_address(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id') ?: 0;
        $address_id = (int) $request->get_param('address_id') ?: 0;
        $addressData = $request->get_param('addressData') ?: [];
        $session_id = Ecommerce::get_instance()->get_session_id();

        global $wpdb;
        if (!empty($address_id)) {
            $updated = $wpdb->update(
                $this->tables->client_addresses,
                [
                    'user_id' => $user_id,
                    'session_id' => $session_id,
                    ...$addressData
                ],
                ['id' => $address_id]
            );
            return rest_ensure_response(['success' => $updated]);
        } else {
            $updated = $wpdb->insert(
                $this->tables->client_addresses,
                [
                    'user_id' => $user_id,
                    'session_id' => $session_id,
                    ...$addressData
                ]
            );
            return rest_ensure_response(['id' => $updated]);
        }
    }

    public function api_list_coverage_area(WP_REST_Request $request) {
        $address = $request->get_param('address');
        $json_string = file_get_contents(WP_SITECORE_DIR_PATH . '/templates/locations/coverage-area.json');
        $addressData = json_decode($json_string, true);
        if (is_null($addressData)) {
            return new WP_REST_Response(['error' => 'Could not decode coverage area data.'], 500);
        }
        return rest_ensure_response(['coverage' => $addressData]);
    }
    
}