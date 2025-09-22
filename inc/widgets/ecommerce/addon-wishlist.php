<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Request;
use WP_Error;

class Wishlist {
    use Singleton;

    public $tables;

    protected function __construct() {
        $this->tables = (object) [
            'wishlist'     => Ecommerce::get_instance()->get_tables()->wishlist,
        ];
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/wishlist', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_wishlist'],
			'permission_callback' => '__return_true',
		]);
        register_rest_route('sitecore/v1', '/ecommerce/wishlist/(?P<product_id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_wishlist'],
			'permission_callback' => '__return_true',
		]);
    }

    public function api_get_wishlist(WP_REST_Request $request) {
        global $wpdb;
        $customer_id = 1;$per_page = 36;
        $page = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset = ($page - 1) * $per_page;

        $total_items = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$this->tables->wishlist} WHERE customer_id = %d", $customer_id));
        $max_pages = ceil($total_items / $per_page);

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->wishlist} WHERE customer_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
                $customer_id, $per_page, $offset
            ),
            ARRAY_A
        );

        $response_data = $results;

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $max_pages);

        return $response;
    }

    public function api_update_wishlist(WP_REST_Request $request) {
        $customer_id = 1;
        if (0 === $customer_id) {
            return new WP_Error(
                'not_logged_in',
                'You must be logged in to manage your wishlist.',
                ['status' => 401]
            );
        }

        $product_id = $request->get_param('product_id');

        if (empty($product_id) || ! is_numeric($product_id)) {
            return new WP_Error(
                'invalid_product_id',
                'Invalid product ID provided.',
                ['status' => 400]
            );
        }

        global $wpdb;

        $deleted = $wpdb->delete(
            $this->tables->wishlist,
            [
                'customer_id' => $customer_id,
                'product_id' => $product_id
            ],
            ['%d', '%d']
        );

        if (false === $deleted) {
            return new WP_Error(
                'database_error',
                'A database error occurred.',
                ['status' => 500]
            );
        }

        if ($deleted === 1) {
            return rest_ensure_response([
                'success' => true,
                'action' => 'removed',
                'product_id' => $product_id,
                'message' => 'Product successfully removed from wishlist.'
            ]);
        }

        $inserted = $wpdb->insert(
            $this->tables->wishlist,
            [
                'product_id' => $product_id,
                'customer_id' => $customer_id
            ],
            ['%d', '%d']
        );

        if (false === $inserted) {
            return new WP_Error(
                'insert_failed',
                'Failed to add the product to the wishlist.',
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'action' => 'added',
            'product_id' => $product_id,
            'message' => 'Product successfully added to wishlist.'
        ]);
    }

}
