<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Payment_Stripe {
    use Singleton;

    private $secret_key;
    private $webhook_secret;

    protected function __construct() {
        $this->secret_key    = get_option('stripe_secret_key');
        $this->webhook_secret = get_option('stripe_webhook_secret');
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnersmanagerpayment/create_payment_intent',   [ $this, 'stripe_create_intent' ], 10, 3);
        add_filter('partnersmanagerpayment/verify',                  [ $this, 'stripe_verify'        ], 10, 3);
        add_filter('partnersmanagerpayment/create_subscription',     [ $this, 'stripe_create_sub'    ], 10, 3);
        add_filter('partnersmanagerpayment/pause_subscription',      [ $this, 'stripe_pause_sub'     ], 10, 2);
        add_filter('partnersmanagerpayment/resume_subscription',     [ $this, 'stripe_resume_sub'    ], 10, 2);
        add_filter('partnersmanagerpayment/cancel_subscription',     [ $this, 'stripe_cancel_sub'    ], 10, 2);
        add_filter('partnersmanagerpayment/refund_payment',          [ $this, 'stripe_refund'        ], 10, 3);
        add_filter('partnersmanagerpayment/webhook',                 [ $this, 'stripe_handle_webhook'], 10, 1);
        add_filter('partnership/payment/gateways',                   [ $this, 'push_gateways'], 10, 1);
    }

    public function push_gateways($gateways) {
        $gateways['stripe'] = [
            'title' => __('Stripe', 'site-core'),
            'icon' => WP_SITECORE_BUILD_URI . '/icons/stripe.svg',
        ];
        return $gateways;
    }

    private function curl($endpoint, $params = [], $method = 'POST') {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.stripe.com/v1/' . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, $this->secret_key . ':');
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        }
        $resp = curl_exec($ch);
        curl_close($ch);
        return json_decode($resp, true);
    }

    public function stripe_create_intent($null, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'stripe', 'stripe', $provider)) return $null;
        $params = [
            'amount'   => $args['amount'],
            'currency' => $args['currency'],
            'metadata' => $args['metadata'] ?? []
        ];
        return $this->curl('payment_intents', $params);
    }

    public function stripe_verify($verified, $data, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'stripe', 'stripe', $provider)) return $verified;
        $intent = $this->curl('payment_intents/' . $data['id'], [], 'GET');
        return isset($intent['status']) && $intent['status'] === 'succeeded';
    }

    public function stripe_create_sub($null, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'stripe', 'stripe', $provider)) return $null;
        $params = [
            'customer'    => $args['customer_id'],
            'items[0]'    => 'price_' . $args['price_id'],
            'metadata'    => $args['metadata'] ?? []
        ];
        return $this->curl('subscriptions', $params);
    }

    public function stripe_pause_sub($false, $subscription_id) {
        $params = ['pause_collection' => ['behavior' => 'mark_uncollectible']];
        return $this->curl("subscriptions/{$subscription_id}", $params, 'POST');
    }

    public function stripe_resume_sub($false, $subscription_id) {
        $params = ['pause_collection' => ''];
        return $this->curl("subscriptions/{$subscription_id}", $params, 'POST');
    }

    public function stripe_cancel_sub($false, $subscription_id) {
        return $this->curl("subscriptions/{$subscription_id}", [], 'DELETE');
    }

    public function stripe_refund($false, $payment_id, $args) {
        $params = ['payment_intent' => $payment_id] + ($args['params'] ?? []);
        return $this->curl('refunds', $params);
    }

    public function stripe_handle_webhook($payload) {
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $event = json_decode($payload, true);
        if ($sig_header && $this->verify_signature($payload, $sig_header)) {
            do_action('partnersmanagerpayment/stripe_event', $event);
        }
        return $payload;
    }

    private function verify_signature($payload, $sig_header) {
        list($t, $v) = explode(',', str_replace(['t=', 'v='], '', $sig_header));
        $signed = hash_hmac('sha256', $t . '.' . $payload, $this->webhook_secret);
        return hash_equals($signed, $v);
    }
}
