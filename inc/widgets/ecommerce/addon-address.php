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
    }

    public function api_list_addresses(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id') ?: 0;

        if (!empty($user_id)) {
            global $wpdb;
            $result = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$this->tables->client_addresses} WHERE user_id = %d ORDER BY _order DESC LIMIT 0, 12;",
                    $user_id
                )
            );
            return rest_ensure_response($result);
        }

        return rest_ensure_response(['success' => false]);
    }

    public function api_update_address(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id') ?: 0;
        $address_id = (int) $request->get_param('address_id') ?: 0;
        $addressData = $request->get_param('addressData') ?: [];

        global $wpdb;
        if (!empty($address_id)) {
            $updated = $wpdb->update(
                $this->tables->client_addresses,
                [
                    'user_id' => $user_id,
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
                    ...$addressData
                ]
            );
            return rest_ensure_response(['id' => $updated]);
        }
    }
    
}