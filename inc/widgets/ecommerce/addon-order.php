<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_Error;

class Order {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('wp_ajax_process_checkout', [$this, 'ajax_process_checkout']);
        add_action('wp_ajax_nopriv_process_checkout', [$this, 'ajax_process_checkout']);
    }

    public function create_order($order_data) {
        global $wpdb;
        
        $cart_addon = Cart::get_instance();
        $cart = $cart_addon->get_cart(false);
        if (!$cart) {
            return new WP_Error('empty_cart', 'Cart is empty');
        }

        $cart_items = $cart_addon->get_cart_items();
        if (empty($cart_items)) {
            return new WP_Error('empty_cart', 'Cart is empty');
        }

        $order_number = $this->generate_order_number();
        $subtotal = $cart_addon->get_cart_total();
        $tax_amount = $this->calculate_tax($subtotal);
        $shipping_amount = $this->calculate_shipping($order_data);
        $total_amount = $subtotal + $tax_amount + $shipping_amount;

        $wpdb->insert($this->tables->orders, [
            'order_number' => $order_number,
            'user_id' => get_current_user_id() ?: null,
            'session_id' => Ecommerce::get_instance()->get_session_id(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => $order_data['payment_method'] ?? '',
            'subtotal' => $subtotal,
            'tax_amount' => $tax_amount,
            'shipping_amount' => $shipping_amount,
            'total_amount' => $total_amount,
            'currency' => $order_data['currency'] ?? 'USD',
            'billing_data' => maybe_serialize($order_data['billing'] ?? []),
            'shipping_data' => maybe_serialize($order_data['shipping'] ?? []),
        ]);

        $order_id = $wpdb->insert_id;
        
        foreach ($cart_items as $item) {
            $wpdb->insert($this->tables->order_items, [
                'order_id' => $order_id,
                'product_id' => $item->product_id,
                'variation_id' => $item->variation_id,
                'product_name' => $item->product_name,
                'product_sku' => Product::get_instance()->get_product_meta($item->product_id, 'sku'),
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total' => $item->price * $item->quantity,
                'meta_data' => $item->meta_data,
            ]);
        }

        $wpdb->update($this->tables->carts, ['status' => 'converted'], ['id' => $cart->id]);
        
        return $order_id;
    }

    public function get_order($order_id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tables->orders} WHERE id = %d",
            $order_id
        ));
    }

    public function get_order_by_number($order_number) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->tables->orders} WHERE order_number = %s",
            $order_number
        ));
    }

    public function get_order_items($order_id) {
        global $wpdb;
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$this->tables->order_items} WHERE order_id = %d",
            $order_id
        ));
    }

    public function update_order_status($order_id, $status) {
        global $wpdb;
        return $wpdb->update($this->tables->orders, [
            'status' => $status,
            'updated_at' => current_time('mysql'),
        ], ['id' => $order_id]);
    }

    public function update_payment_status($order_id, $status) {
        global $wpdb;
        return $wpdb->update($this->tables->orders, [
            'payment_status' => $status,
            'updated_at' => current_time('mysql'),
        ], ['id' => $order_id]);
    }

    public function add_order_meta($order_id, $meta_key, $meta_value) {
        global $wpdb;
        return $wpdb->insert($this->tables->order_meta, [
            'order_id' => $order_id,
            'meta_key' => $meta_key,
            'meta_value' => maybe_serialize($meta_value),
        ]);
    }

    public function get_order_meta($order_id, $meta_key = '') {
        global $wpdb;
        if ($meta_key) {
            return maybe_unserialize($wpdb->get_var($wpdb->prepare(
                "SELECT meta_value FROM {$this->tables->order_meta} WHERE order_id = %d AND meta_key = %s ORDER BY id DESC LIMIT 1",
                $order_id, $meta_key
            )));
        }
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$this->tables->order_meta} WHERE order_id = %d",
            $order_id
        ), ARRAY_A);
        $meta = [];
        foreach ($results as $row) {
            $meta[$row['meta_key']] = maybe_unserialize($row['meta_value']);
        }
        return $meta;
    }

    public function update_order_meta($order_id, $meta_key, $meta_value) {
        global $wpdb;
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$this->tables->order_meta} WHERE order_id = %d AND meta_key = %s",
            $order_id, $meta_key
        ));
        
        if ($existing) {
            return $wpdb->update($this->tables->order_meta,
                ['meta_value' => maybe_serialize($meta_value)],
                ['order_id' => $order_id, 'meta_key' => $meta_key]
            );
        }
        return $this->add_order_meta($order_id, $meta_key, $meta_value);
    }

    protected function generate_order_number() {
        return 'SC-' . strtoupper(substr(uniqid(), -8)) . '-' . date('Y');
    }

    protected function calculate_tax($subtotal) {
        $tax_rate = get_option('sitecore_tax_rate', 0) / 100;
        return $subtotal * $tax_rate;
    }

    protected function calculate_shipping($order_data) {
        return (float) get_option('sitecore_shipping_cost', 0);
    }

    public function get_user_orders($user_id) {
        global $wpdb;
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$this->tables->orders} WHERE user_id = %d ORDER BY created_at DESC",
            $user_id
        ));
    }

    public function ajax_process_checkout() {
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'sitecore_ecom_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        $order_data = [
            'payment_method' => isset($_POST['payment_method']) ? sanitize_text_field($_POST['payment_method']) : '',
            'billing' => isset($_POST['billing']) ? array_map('sanitize_text_field', $_POST['billing']) : [],
            'shipping' => isset($_POST['shipping']) ? array_map('sanitize_text_field', $_POST['shipping']) : [],
            'currency' => (isset($_POST['currency']) && !empty($_POST['currency'])) ? sanitize_text_field($_POST['currency']) : 'USD',
        ];

        $order_id = $this->create_order($order_data);
        
        if (is_wp_error($order_id)) {
            wp_send_json_error($order_id->get_error_message());
        }

        $order = $this->get_order($order_id);
        
        wp_send_json_success([
            'order_id' => $order_id,
            'order_number' => $order->order_number,
            'redirect_url' => home_url("/order-confirmation/{$order->order_number}"),
        ]);
    }
}