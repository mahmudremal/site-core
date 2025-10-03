<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Order {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_rest_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/checkout', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_process_checkout'],
            'permission_callback' => '__return_true',
            'args' => [
                'payment_method' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'billing' => [
                    'required' => true,
                    'type' => 'array',
                    'sanitize_callback' => function ($value) {
                        return array_map('sanitize_text_field', $value);
                    },
                ],
                'shipping' => [
                    'required' => false,
                    'type' => 'array',
                    'sanitize_callback' => function ($value) {
                        return array_map('sanitize_text_field', $value);
                    },
                ],
                'currency' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'USD',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/orders/create-draft/(?P<order_id>[^/]+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_order_create_draft'],
            'permission_callback' => '__return_true',
            'args' => [
                'method' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'billing' => [
                    'required' => true,
                    'type' => 'array',
                    'sanitize_callback' => function ($value) {
                        return array_map('sanitize_text_field', $value);
                    },
                ],
                'shipping' => [
                    'required' => false,
                    'type' => 'array',
                    'sanitize_callback' => function ($value) {
                        return array_map('sanitize_text_field', $value);
                    },
                ],
                'currency' => [
                    'required' => false,
                    'type' => 'string',
                    'default' => 'USD',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/orders/(?P<order_id>[^/]+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_order'],
            'permission_callback' => '__return_true',
            'args' => [
                'order_id' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
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
            'cart_id' => $cart->id,
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

        // $wpdb->update($this->tables->carts, ['status' => 'converted'], ['id' => $cart->id]);
        
        return $order_id;
    }

    public function api_order_create_draft(WP_REST_Request $request) {
        $order_id = $request->get_param('order_id');
        $billing = $request->get_param('billing') ?: [];
        $method = $request->get_param('method') ?: 'cod';
        $shipping = $request->get_param('shipping') ?: [];
        $currency = $request->get_param('currency') ?: 'bdt';

        $order_data = [
            'payment_method' => $method,
            'shipping' => $shipping,
            'currency' => $currency,
            'billing' => $billing
        ];
        if (!empty($order_id)) $order_data['id'] = $order_id;

        if (empty($order_data['payment_method']) || empty($order_data['billing'])) {
            return new WP_REST_Response(['error' => 'Missing required checkout data'], 400);
        }

        $order_id = $this->create_order($order_data);
        
        if (is_wp_error($order_id)) {
            return new WP_REST_Response(['error' => $order_id->get_error_message()], 400);
        }

        $order = $this->get_order($order_id);
        
        $response = new WP_REST_Response([
            'order_id' => $order_id,
            'order_number' => $order->order_number,
            'redirect_url' => "/order-confirmation/{$order->order_number}"
        ], 200);

        $response->set_status(200);

        return $response;
    }

    public function api_get_order(WP_REST_Request $request) {
        $order_id = $request->get_param('order_id');

        if (empty($order_id)) {
            return new WP_REST_Response(['error' => 'Missing required order information'], 400);
        }

        $order = $this->get_order($order_id);

        if (empty($order)) {
            return new WP_REST_Response(['error' => 'Order information not found'], 400);
        }

        $response = new WP_REST_Response($order, 200);
        $response->set_status(200);
        return $response;
    }


    public function get_order($order_id) {
        global $wpdb;
        $order = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->orders} WHERE id = %d OR order_number = %s",
                (int) $order_id, (string) $order_id
            )
        );

        if (empty($order)) return $order;

        $order->items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->order_items} WHERE order_id = %d",
                (int) $order->id
            )
        );

        return $order;
        
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

    
    
}