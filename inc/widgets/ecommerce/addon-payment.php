<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Payment {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_rest_routes() {
        if (!apply_filters('pm_project/system/isactive', 'storefront-apiactive')) {return;}
        register_rest_route('sitecore/v1', '/ecommerce/payments/sslcommerz/initiate/(?P<order_id>[^/]+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_initiate_sslcommerz'],
            'permission_callback' => '__return_true',
            'args' => [],
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/payments/sslcommerz/callback/(?P<status>[a-zA-Z0-9_-]+)/(?P<order_id>[^/]+)', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_sslcommerz_callback'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function api_initiate_sslcommerz(WP_REST_Request $request) {
        $order_id = $request->get_param('order_id') ?: null;
        if (empty($order_id)) {
            return rest_ensure_response(['success' => false, 'message' => 'Order id is not validated.']);
        }

        $order = $this->get_order($order_id);
        if (empty($order)) {
            return rest_ensure_response(['success' => false, 'message' => 'Order not found.']);
        }

        // --- SSLCommerz API credentials ---
        $store_id    = 'your_store_id_here';
        $store_pass  = 'your_store_password_here';
        $is_live     = false; // true for live

        $ssl_api_url = $is_live
            ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        // --- Prepare order and customer data ---
        $total_amount = (float) $order['total_amount'];
        if ($total_amount <= 0) {
            // fallback: calculate total from items
            $total_amount = 0;
            foreach ($order['items'] as $item) {
                $price = !empty($item['metadata']['sale_price'])
                    ? floatval($item['metadata']['sale_price'])
                    : floatval($item['metadata']['price']);
                $total_amount += $price;
            }
        }

        $billing = $order['billing_data'];

        // --- SSLCommerz payment data ---
        $post_data = [
            'store_id' => $store_id,
            'store_passwd' => $store_pass,
            'total_amount' => $total_amount,
            'currency' => 'BDT',
            'tran_id' => $order['order_number'] ?? ('ORD-' . $order_id . '-' . time()),
            'success_url' => home_url("/wp-json/sitecore/v1/ecommerce/payments/sslcommerz/callback/success/{$order_id}"),
            'fail_url' => home_url("/wp-json/sitecore/v1/ecommerce/payments/sslcommerz/callback/fail/{$order_id}"),
            'cancel_url' => home_url("/wp-json/sitecore/v1/ecommerce/payments/sslcommerz/callback/cancel/{$order_id}"),

            // Customer Info
            'cus_name' => trim($billing['firstName'] . ' ' . $billing['lastName']),
            'cus_email' => $billing['email'] ?: 'noemail@example.com',
            'cus_add1' => $billing['address'] ?: 'N/A',
            'cus_city' => $billing['city'] ?: 'Dhaka',
            'cus_country' => $billing['country'] ?: 'BD',
            'cus_phone' => $billing['phone'] ?: '01700000000',

            // Shipment Info
            'ship_name' => 'Order #' . $order['order_number'],
            'ship_add1' => $order['shipping_data']['address'] ?: 'N/A',
            'ship_city' => $order['shipping_data']['city'] ?: 'Dhaka',
            'ship_country' => $order['shipping_data']['country'] ?: 'BD',

            // Optional
            'product_category' => 'ecommerce',
            'product_profile' => 'general',
            'num_of_item' => count($order['items']),
        ];

        // --- Make the API request ---
        $response = wp_remote_post($ssl_api_url, [
            'method' => 'POST',
            'timeout' => 60,
            'body' => $post_data,
        ]);

        if (is_wp_error($response)) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Connection error: ' . $response->get_error_message(),
            ]);
        }

        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        if (!is_array($result) || empty($result['GatewayPageURL'])) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Failed to initiate payment.',
                'response' => $result,
            ]);
        }

        // --- You may save transaction reference if needed ---
        update_post_meta($order_id, '_sslcommerz_tran_id', $post_data['tran_id']);

        return rest_ensure_response([
            'success' => true,
            'payment_url' => esc_url($result['GatewayPageURL']),
            'transaction_id' => $post_data['tran_id'],
        ]);
    }

    public function api_sslcommerz_callback(WP_REST_Request $request) {
        $status   = sanitize_text_field($request->get_param('status'));
        $order_id = sanitize_text_field($request->get_param('order_id'));

        $store_id   = 'your_store_id_here';
        $store_pass = 'your_store_password_here';
        $is_live    = false; // change to true in production

        $validation_url = $is_live
            ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
            : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';

        $order = $this->get_order($order_id);
        if (empty($order)) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Order not found.',
            ]);
        }

        $post_data = $request->get_json_params();
        if (empty($post_data)) {
            $post_data = $request->get_body_params();
        }

        // Must have val_id for successful transaction verification
        $val_id = isset($post_data['val_id']) ? sanitize_text_field($post_data['val_id']) : null;
        if (empty($val_id)) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Validation ID (val_id) missing from callback.',
            ]);
        }

        // --- STEP 1: VALIDATE TRANSACTION WITH SSLCommerz ---
        $validate_url = add_query_arg([
            'val_id'       => $val_id,
            'store_id'     => $store_id,
            'store_passwd' => $store_pass,
            'format'       => 'json'
        ], $validation_url);

        $response = wp_remote_get($validate_url, ['timeout' => 60]);
        if (is_wp_error($response)) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Validation request failed: ' . $response->get_error_message(),
            ]);
        }

        $body = json_decode(wp_remote_retrieve_body($response), true);

        if (!is_array($body) || empty($body['status'])) {
            return rest_ensure_response([
                'success' => false,
                'message' => 'Invalid validation response.',
                'response' => $body,
            ]);
        }

        // --- STEP 2: VERIFY VALIDATION STATUS ---
        if ($body['status'] !== 'VALID' && $body['status'] !== 'VALIDATED') {
            update_post_meta($order_id, '_payment_status', 'failed');
            return rest_ensure_response([
                'success' => false,
                'message' => 'Payment validation failed.',
                'validation_response' => $body,
            ]);
        }

        // --- STEP 3: MATCH AMOUNT AND TRANSACTION INFO ---
        $expected_amount = (float) $order['total_amount'];
        $paid_amount     = (float) $body['amount'];

        if (abs($expected_amount - $paid_amount) > 0.01) {
            update_post_meta($order_id, '_payment_status', 'amount_mismatch');
            return rest_ensure_response([
                'success' => false,
                'message' => 'Payment amount mismatch.',
                'expected' => $expected_amount,
                'paid' => $paid_amount,
            ]);
        }

        // --- STEP 4: MARK ORDER AS SUCCESSFUL ---
        update_post_meta($order_id, '_payment_status', 'completed');
        update_post_meta($order_id, '_sslcommerz_transaction_id', sanitize_text_field($body['tran_id']));
        update_post_meta($order_id, '_sslcommerz_validation_data', $body);

        return rest_ensure_response([
            'success' => true,
            'status'  => 'completed',
            'message' => 'Payment verified successfully.',
            'order_id' => $order_id,
            'transaction_id' => $body['tran_id'],
        ]);
    }


}