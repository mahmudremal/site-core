<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Request;
use WP_Error;

class Reviews {
    use Singleton;

    public $tables;

    protected function __construct() {
        $this->tables = (object) [
            'reviews'     => Ecommerce::get_instance()->get_tables()->reviews,
        ];
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_slug>[^/]+)/reviews', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_reviews'],
			'permission_callback' => '__return_true',
		]);
    }

    public function api_get_product_reviews(WP_REST_Request $request) {
        $product_slug = $request->get_param('product_slug');
        if (empty($product_slug)) {
            return new WP_Error('invalid_product_id', 'Product ID is required.', ['status' => 400]);
        }

        $product_id = get_id_from_blogname($product_slug);

        global $wpdb;
        $per_page = 12;
        $page = $request->get_param('page') ? absint($request->get_param('page')) : 1;
        $offset = ($page - 1) * $per_page;

        $total_items = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$this->tables->reviews} WHERE product_id = %d", $product_id));
        $max_pages = ceil($total_items / $per_page);

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->reviews} WHERE product_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
                $product_id, $per_page, $offset
            ),
            ARRAY_A
        );

        $response_data = $results;

        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $max_pages);

        return $response;
    }

}
