<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_Error;

class Cart {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('wp_ajax_add_to_cart', [$this, 'ajax_add_to_cart']);
        add_action('wp_ajax_nopriv_add_to_cart', [$this, 'ajax_add_to_cart']);
        add_action('wp_ajax_update_cart', [$this, 'ajax_update_cart']);
        add_action('wp_ajax_nopriv_update_cart', [$this, 'ajax_update_cart']);
        add_action('wp_ajax_remove_from_cart', [$this, 'ajax_remove_from_cart']);
        add_action('wp_ajax_nopriv_remove_from_cart', [$this, 'ajax_remove_from_cart']);
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
        
        if (!get_post($product_id) || get_post_type($product_id) !== 'sc_product') {
            return new WP_Error('invalid_product', 'Invalid product');
        }

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

        return $wpdb->get_results($wpdb->prepare(
            "SELECT ci.*, p.post_title as product_name 
             FROM {$this->tables->cart_items} ci 
             LEFT JOIN {$wpdb->posts} p ON ci.product_id = p.ID 
             WHERE ci.cart_id = %d 
             ORDER BY ci.created_at ASC",
            $cart->id
        ));
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

    public function ajax_add_to_cart() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sitecore_ecom_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
        $quantity = (isset($_POST['quantity']) && intval($_POST['quantity']) > 0) ? intval($_POST['quantity']) : 1;
        $variation_id = isset($_POST['variation_id']) ? intval($_POST['variation_id']) : null;
        
        $result = $this->add_to_cart($product_id, $quantity, $variation_id);
        
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        }

        wp_send_json_success([
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ]);
    }

    public function ajax_update_cart() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sitecore_ecom_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        $item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
        $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : 0;
        
        $this->update_cart_item($item_id, $quantity);
        
        wp_send_json_success([
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ]);
    }

    public function ajax_remove_from_cart() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sitecore_ecom_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        $item_id = isset($_POST['item_id']) ? intval($_POST['item_id']) : 0;
        $this->remove_from_cart($item_id);
        
        wp_send_json_success([
            'cart_count' => $this->get_cart_count(),
            'cart_total' => $this->get_cart_total(),
        ]);
    }
}