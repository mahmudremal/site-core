<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Payment_Sslcommerz {
    use Singleton;

    private $store_id;
    private $store_passwd;
    private $sandbox;
    private $api_url;
    private $validation_url;
    private $refund_url;

    protected function __construct() {
        $this->store_id         = get_option('sslcommerz_store_id');
        $this->store_passwd     = get_option('sslcommerz_store_password');
        $this->sandbox          = get_option('sslcommerz_sandbox_mode', true);
        $base                   = $this->sandbox
                                  ? 'https://sandbox.sslcommerz.com'
                                  : 'https://securepay.sslcommerz.com';
        $this->api_url          = $base . '/gwprocess/v4/api.php';
        $this->validation_url   = $base . '/validator/api/validationserverAPI.php';
        $this->refund_url       = $base . '/validator/api/merchantTransIDvalidationAPI.php';
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnersmanagerpayment/create_payment_intent', [ $this, 'create_intent'        ], 10, 3);
        add_filter('partnersmanagerpayment/verify',                [ $this, 'verify_transaction'  ], 10, 3);
        add_filter('partnersmanagerpayment/refund_payment',        [ $this, 'refund_transaction'  ], 10, 4);
        add_filter('partnersmanagerpayment/webhook',               [ $this, 'handle_webhook'      ], 10, 1);
        add_filter('sitecore/payment/gateways',                 [ $this, 'push_gateways'], 10, 1);
    }

    public function push_gateways($gateways) {
        $gateways['sslcommerz'] = [
            'title' => __('SslCommerz', 'site-core'),
            'icon' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEX////7/P3g5fDi5/EATaICT6MMUKMTUqTJ0eSHnccdV6YsXqkARp/X3utsiL0jWaeBmMVyjL+VqM0dVqarudbx8/gASqHN1ea0wdszYqtlg7oANZo9aK5ff7jDzeFIb7FTd7SbrNB3kcG6xd0AQJ3ihWIJAAAA8UlEQVR4AYXQBQKDMBBE0QlOlBSv2/3PWFwT+irIXxQN4li46LieH5j5YYRGTJkVFwCkYlYqAaCPBjSAU8qsggxAXoRLlM1SjQbyqFd2f1U6d4mVEg1Sz/2MtUvZ9Kua+g0bXnHHY+p01+GxcNGfMAzM1NTNA/SBwwFl7MSb+hUGEaaBBzH0l54G1NvQKx7Dt75C4FOouDuDojRN02J7kXvBaEy+9eOmk/iVVffIxVJZMEZPsBJNZ+oWv+WtFqbusZZqhI6hu4sXKLPXmgvkAZupdIWmBcGVHQlLsH8D6t+ATNmBwgV04fkWHk/QILkVAX6QaiG2LYx6UQAAAABJRU5ErkJggg==',
        ];
        return $gateways;
    }

    private function curl($url, $params = [], $method = 'POST') {
        $ch = curl_init();
        if ($method === 'GET' && !empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        }
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $resp = curl_exec($ch);
        curl_close($ch);
        return json_decode($resp, true);
    }

    public function create_intent($null, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'sslcommerz', 'sslcommerz', $provider)) {
            return $null;
        }
        $post_data = [
            'store_id'        => $this->store_id,
            'store_passwd'    => $this->store_passwd,
            'total_amount'    => $args['amount'],
            'currency'        => $args['currency'],
            'tran_id'         => $args['tran_id'],
            'success_url'     => $args['success_url'],
            'fail_url'        => $args['failure_url'],
            'cancel_url'      => $args['cancel_url'],
            'cus_name'        => $args['customer']['name'] ?? '',
            'cus_email'       => $args['customer']['email'] ?? '',
            'cus_add1'        => $args['customer']['address'] ?? '',
            'cus_phone'       => $args['customer']['phone'] ?? '',
            'ship_name'       => $args['shipping']['name'] ?? '',
            'cart'            => isset($args['items']) ? json_encode($args['items']) : ''
        ];
        return $this->curl($this->api_url, $post_data);  // :contentReference[oaicite:0]{index=0}
    }

    public function verify_transaction($verified, $data, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'sslcommerz', 'sslcommerz', $provider)) {
            return $verified;
        }
        $params = [
            'val_id'       => $data['val_id']       ?? '',
            'store_id'     => $this->store_id,
            'store_passwd' => $this->store_passwd,
            'v'            => 1,
            'format'       => 'json'
        ];
        $resp = $this->curl($this->validation_url, $params, 'GET');
        $status = $resp['status'] ?? '';
        return in_array($status, ['VALID', 'VALIDATED'], true);  // :contentReference[oaicite:1]{index=1}
    }

    public function refund_transaction($false, $payment_id, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'sslcommerz', 'sslcommerz', $provider)) {
            return $false;
        }
        $params = [
            'bank_tran_id'    => $payment_id,
            'refund_trans_id' => uniqid('refund_'),
            'store_id'        => $this->store_id,
            'store_passwd'    => $this->store_passwd,
            'refund_amount'   => $args['amount'],
            'refund_remarks'  => $args['remarks']   ?? '',
            'refe_id'         => $args['reference'] ?? ''
        ];
        return $this->curl($this->refund_url, $params, 'GET');  // :contentReference[oaicite:2]{index=2}
    }

    public function handle_webhook($payload) {
        $parsed = json_decode($payload, true);
        if (empty($parsed)) {
            parse_str($payload, $parsed);
        }
        do_action('partnersmanagerpayment/sslcommerz_event', $parsed);
        return $payload;
    }
}
