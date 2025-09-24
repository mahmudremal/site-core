<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class Cart {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/cart/(?P<product_id>\d+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_toggle_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sitecore/v1', '/ecommerce/cart/add', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_add_to_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sitecore/v1', '/ecommerce/cart/update', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_update_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sitecore/v1', '/ecommerce/cart/remove', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_remove_from_cart'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('sitecore/v1', '/ecommerce/cart', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_cart'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_cart($create_if_not_exists = true) {
        global $wpdb;
        $session_id = Ecommerce::get_instance()->get_session_id();
        
        $cart = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tables->carts} WHERE session_id = %d AND status = 'active'",
            $session_id
        ));

        if (!$cart && $create_if_not_exists) {
            $wpdb->insert($this->tables->carts, [
                'session_id' => $session_id,
                'user_id' => get_current_user_id() ?: null,
                'status' => 'active',
            ]);
            return $this->get_cart(false);
        }
        return $cart;
    }

    public function add_to_cart($product_id, $quantity = 1, $variation_id = null, $meta_data = []) {
        global $wpdb;
        
        // if (!get_post($product_id) || get_post_type($product_id) !== 'sc_product') {
        //     return new WP_Error('invalid_product', 'Invalid product');
        // }

        $cart = $this->get_cart();
        $price = Product::get_instance()->get_product_price($product_id, $variation_id);
        
        $existing_item = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tables->cart_items} WHERE cart_id = %d AND product_id = %d AND variation_id %s",
            $cart->id, $product_id, $variation_id ? "= $variation_id" : "IS NULL"
        ));

        if ($existing_item) {
            return $wpdb->update($this->tables->cart_items, [
                'quantity' => $existing_item->quantity + $quantity,
                'updated_at' => current_time('mysql'),
            ], ['id' => $existing_item->id]);
        }

        return $wpdb->insert($this->tables->cart_items, [
            'cart_id' => $cart->id,
            'product_id' => $product_id,
            'variation_id' => $variation_id,
            'quantity' => $quantity,
            'price' => $price,
            'meta_data' => maybe_serialize($meta_data),
        ]);
    }

    public function update_cart_item($item_id, $quantity) {
        global $wpdb;
        if ($quantity <= 0) {
            return $this->remove_from_cart($item_id);
        }
        return $wpdb->update($this->tables->cart_items, [
            'quantity' => $quantity,
            'updated_at' => current_time('mysql'),
        ], ['id' => $item_id]);
    }

    public function remove_from_cart($item_id) {
        global $wpdb;
        return $wpdb->delete($this->tables->cart_items, ['id' => $item_id]);
    }

    public function get_cart_items() {
        global $wpdb;
        $cart = $this->get_cart(false);
        if (!$cart) return [];

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT ci.*, p.post_title as product_name FROM {$this->tables->cart_items} ci LEFT JOIN {$wpdb->posts} p ON ci.product_id = p.ID WHERE ci.cart_id = %d ORDER BY ci.created_at ASC",
                $cart->id
            ),
            ARRAY_A
        );
        foreach ($items as $index => $row) {
            $items[$index]['meta_data'] = maybe_unserialize($row['meta_data']);
            $items[$index]['product'] = Product::get_instance()->get_product($row['product_id']);
        }
        return $items;
    }

    public function get_cart_total() {
        global $wpdb;
        $cart = $this->get_cart(false);
        if (!$cart) return 0;

        return (float) $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(price * quantity) FROM {$this->tables->cart_items} WHERE cart_id = %d",
            $cart->id
        ));
    }

    public function get_cart_count() {
        global $wpdb;
        $cart = $this->get_cart(false);
        if (!$cart) return 0;

        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(quantity) FROM {$this->tables->cart_items} WHERE cart_id = %d",
            $cart->id
        ));
    }

    public function clear_cart() {
        global $wpdb;
        $cart = $this->get_cart(false);
        if (!$cart) return false;

        return $wpdb->delete($this->tables->cart_items, ['cart_id' => $cart->id]);
    }

    public function api_add_to_cart(WP_REST_Request $request) {
        $product_id = $request->get_param('product_id') ? intval($request->get_param('product_id')) : 0;
        $quantity = ($request->get_param('quantity') && intval($request->get_param('quantity')) > 0) ? intval($request->get_param('quantity')) : 1;
        $variation_id = $request->get_param('variation_id') ? intval($request->get_param('variation_id')) : null;
        
        $result = $this->add_to_cart($product_id, $quantity, $variation_id);
        
        if (is_wp_error($result)) {
            return new WP_REST_Response(['success' => false, 'message' => $result->get_error_message()], 400);
        }

        return new WP_REST_Response([
            'success' => true,
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ], 200);
    }

    public function api_update_cart(WP_REST_Request $request) {
        $item_id = $request->get_param('item_id') ? intval($request->get_param('item_id')) : 0;
        $quantity = $request->get_param('quantity') ? intval($request->get_param('quantity')) : 0;
        
        $this->update_cart_item($item_id, $quantity);
        
        return new WP_REST_Response([
            'success' => true,
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ], 200);
    }

    public function api_remove_from_cart(WP_REST_Request $request) {
        $item_id = $request->get_param('item_id') ? intval($request->get_param('item_id')) : 0;
        $this->remove_from_cart($item_id);
        
        return new WP_REST_Response([
            'success' => true,
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ], 200);
    }

    public function api_get_cart(WP_REST_Request $request) {
        return new WP_REST_Response([
            'success' => true,
            'cart_items' => $this->get_cart_items(),
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ], 200);
    }

    public function api_toggle_cart(WP_REST_Request $request) {
        global $wpdb;

        // Get the product details from the request
        $product_id = (int) $request->get_param('product_id');
        $variation_id = (int) $request->get_param('variation_id');
        $quantity = (int) $request->get_param('quantity') > 0 ? (int) $request->get_param('quantity') : 1;
        $meta_data = $request->get_param('meta_data') ? (array) $request->get_param('meta_data') : [];

        // Check if the product is valid
        // if (!get_post($product_id) || get_post_type($product_id) !== 'sc_product') {}
        if (!is_numeric($product_id)) {
            return new WP_Error('invalid_product', 'Invalid product ID.', ['status' => 400]);
        }

        // Get the current user's cart
        $cart = $this->get_cart();
        if (!isset($cart->id)) {
            return new WP_Error('cart_not_found', 'Unable to retrieve cart.', ['status' => 500]);
        }

        // Attempt to delete the item from the cart first.
        // The wpdb->delete() function returns the number of rows affected (0 or 1).
        $deleted = $wpdb->delete(
            $this->tables->cart_items,
            [
                'cart_id' => $cart->id,
                'product_id' => $product_id,
                'variation_id' => $variation_id > 0 ? $variation_id : null
            ],
            ['%d', '%d', '%d']
        );

        if (false === $deleted) {
            // Handle database write failure
            return new WP_Error(
                'db_error',
                'A database error occurred during the operation.',
                ['status' => 500]
            );
        }

        // If a row was deleted, the item was already in the cart.
        if ($deleted > 0) {
            return rest_ensure_response([
                'success' => true,
                'action' => 'removed',
                'message' => 'Product successfully removed from cart.',
            ]);
        } else {
            // If no row was deleted, the item was not in the cart, so we insert it.
            $price = Product::get_instance()->get_product_price($product_id, $variation_id);

            $inserted = $wpdb->insert(
                $this->tables->cart_items,
                [
                    'cart_id' => $cart->id,
                    'product_id' => $product_id,
                    'variation_id' => $variation_id > 0 ? $variation_id : null,
                    'quantity' => $quantity,
                    'price' => $price,
                    'meta_data' => maybe_serialize($meta_data),
                ],
                ['%d', '%d', '%d', '%d', '%f', '%s']
            );

            if (false === $inserted) {
                // Handle database insert failure
                return new WP_Error(
                    'insert_failed',
                    'Failed to add the product to the cart.',
                    ['status' => 500]
                );
            }

            return rest_ensure_response([
                'success' => true,
                'action' => 'added',
                'message' => 'Product successfully added to cart.',
            ]);
        }
    }

}
