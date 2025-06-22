<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Payment_Tap {
    use Singleton;

    private $api_base = 'https://api.tap.company/';

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnersmanagerpayment/create_payment_intent', [ $this, 'tap_create_charge' ], 10, 3);
        add_filter('partnersmanagerpayment/verify',                [ $this, 'tap_verify'        ], 10, 4);
        add_filter('partnersmanagerpayment/refund_payment',        [ $this, 'tap_refund'        ], 10, 4);
        add_filter('partnersmanagerpayment/payout',                [ $this, 'tap_payout'        ], 10, 3);
        add_filter('partnersmanagerpayment/webhook',               [ $this, 'tap_handle_webhook'], 10, 1);
        add_filter('partnership/payment/gateways',                 [ $this, 'push_gateways'], 10, 1);
        add_filter('partnership/payment/gateway/switched',         [ $this, 'switch_gateways'], 10, 3);
        add_filter('partnership/payment/card/submit',              [ $this, 'card_submit'], 10, 4);
        add_filter('partnership/payment/transection/verify',       [ $this, 'transection_verify'], 10, 4);
    }

    private function secret_key() {
        return apply_filters('pm_project/system/getoption', 'payment-tap-secretkey', null);
    }
    private function public_key() {
        return apply_filters('pm_project/system/getoption', 'payment-tap-publickey', null);
    }

    public function push_gateways($gateways) {
        $gateways['tap'] = [
            'title' => __('Tap', 'site-core'),
            'icon' => WP_SITECORE_BUILD_URI . '/icons/tap.svg',
            'description' => '', // __('Fill your card information below. This is secure, and are handled and resposibility by the payment provider. Now US. We never store your card information.', 'site-core'),
            'fields' => [
                ['type' => 'cards', 'required' => true]
            ]
        ];
        return $gateways;
    }

    public function switch_gateways($return, $gateway, $user_id) {
        if ($gateway == 'tap') {
            $return = [
                'type'          => 'card',
                'cards'         => $this->get_stored_cards($user_id),
                'pk'            => substr(base64_encode($this->public_key()), 0, -1),
                'customer_id'   => $this->get_customer_id(Users::prepare_user_data_for_response(get_userdata($user_id)))
            ];
        }
        return $return;
    }

    public function transection_verify($return, $transection_id, $gateway, $user_id) {
        if ($gateway == 'tap') {
            $return = $this->tap_verify(['status' => false], ['id' => $transection_id], 'tap', true);
        }
        return $return;
    }

    private function request(string $path, array $data = [], string $method = 'POST') {
        $url = rtrim($this->api_base, '/') . '/' . ltrim($path, '/');
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->secret_key(),
            'Content-Type: application/json',
        ]);
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }
        $resp = curl_exec($ch);
        curl_close($ch);
        if ($resp === false) {
            return new WP_Error('request_failed', __('Request failed', 'site-core'));
        }
        if (empty($resp)) {
            return new WP_Error('empty_response', __('Empty response', 'site-core'));
        }
        return json_decode($resp, true);
    }

    public function tap_create_charge($null, $args, $provider) {
        global $wpdb;
        if (!apply_filters('payment/provider/match', $provider === 'tap', 'tap', $provider)) {
            return $null;
        }
        if (isset($args['user']) && isset($args['user']['id'])) {
            $cards = $this->get_stored_cards($args['user']['id']);
            $found_index = array_search((int) $args['card'], array_column($cards, 'id'));
            $card = $cards[$found_index] ?? null;
            if (!$card) {return $null;}
        }

        $payload = [
            'amount'            => $args['amount'],
            'currency'          => $args['currency'],
            'customer_initiated'=> $args['customer_initiated'] ?? true,
            'threeDSecure'      => $args['threeDSecure']       ?? true,
            'save_card'         => $args['save_card']          ?? false,
            'description'       => $args['description']        ?? 'N/A',
            'metadata'          => $args['metadata']           ?? [],
            'reference'         => $args['reference']          ?? [
                'product_info' => $args['title'],
                'customer_id' => $args['user']['id'] ?? 0,
                'card_id'   => $card['id'],
                'invoice_id' => wp_unique_id('invc')
            ],
            'receipt' => $args['receipt']            ?? [
                'email' => true,
                'sms' => false
            ],
            'customer' => $args['customer'] ?? null,
            'source' => $args['source'] ?? null,
            
            'post' => ['url' => admin_url('admin-ajax.php?action=payment_webhook')],
            'redirect' => null
        ];
        if (! $payload['customer']) {$payload['customer']['id'] = $this->get_customer_id($args['user']);}
        if (! $payload['source']) {$payload['source']['id'] = $this->createCard2Token($card, $args['user']);}
        if (! $payload['redirect']) {$payload['redirect'] = ['url' => site_url("/partnership/payment/{$payload['reference']['invoice_id']}/status")];}

        $payload = apply_filters('tap/payment/charge/payload', $payload, $args, $provider);

        // return $payload;
        
        $response = $this->request('v2/charges', $payload);  // :contentReference[oaicite:0]{index=0}
        if ($response && isset($response['id'])) {
            if (isset($response['id']['save_card']) && $response['id']['save_card']) {
            }
            unset($card['token']);
            $updated = $wpdb->update(
                $this->usermeta,
                ['meta_value' => maybe_serialize($card)],
                ['umeta_id' => (int) $card['id']],
                ['%s'], ['%d']
            );
        }
        return $response;
    }

    public function tap_verify($verified, $data, $provider, $return = false) {
        if (!apply_filters('payment/provider/match', $provider === 'tap', 'tap', $provider)) {
            return $verified;
        }
        $charge_id = $data['tap_id'] ?? $data['id'] ?? $data['charge_id'] ?? null;
        $resp = $this->request("v2/charges/{$charge_id}", [], 'GET');  // :contentReference[oaicite:1]{index=1}
        $_is_completed = isset($resp['status']) && $resp['status'] === 'CAPTURED' || $resp['status'] === 'AUTHORIZED';

        $invoice = Invoice::get_instance()->get_invoice($data['invoice_id']);

        if ($resp && !empty($resp)) {
            Invoice::get_instance()->update_invoice_meta($invoice['id'], '_payment_object', maybe_serialize($resp));
        }
                
        if ($_is_completed && isset($data['invoice_id']) && !empty($data['invoice_id']) && $data['invoice_id'] !== 0) {
            Invoice::get_instance()->mark_paid_invoice($data['invoice_id']);
            // 
            if (isset($resp['card']) && isset($resp['card']['id'])) {
                // store card
            }
        }

        if ($return) {return ['success' => $_is_completed, 'transection' => $resp];}

        return $_is_completed;
    }


    public function create_payout(array $payload) {
    // $payload = [
    //     'toAccountId' => $toAccountId, // This is the recipient's account ID (e.g., a vendor ID)
    //     'amount' => $amount, // Amount to be sent
    //     'currency' => $currency, // Currency type
    //     'description' => 'Payout to account ' . $toAccountId // Description of the transaction
    // ];
        
        // if (empty($payload['toAccountId']) || empty($payload['amount']) || empty($payload['currency'])) {
        //     return ['success' => false, 'message' => 'Incomplete payout information.'];
        // }
        $response = $this->request('v2/payouts', $payload);
        return $response;
    }
    
    public function tap_refund($false, $payment_id, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'tap', 'tap', $provider)) {
            return $false;
        }
        $payload = [
            'charge_id' => $payment_id,
            'amount'    => $args['amount'],
            'reason'    => $args['reason'] ?? '',
        ];
        return $this->request('v2/refunds', $payload);  // :contentReference[oaicite:2]{index=2}
    }

    public function tap_payout($false, $args, $provider) {
        if (!apply_filters('payment/provider/match', $provider === 'tap', 'tap', $provider)) {
            return $false;
        }
        
        $payload = [
            'amount' => $args['amount'],
            'currency' => $args['currency'],
            'toAccountId' => $args['account_id'],
            'description' => sprintf(__('Payout to account %s', 'site-core'), $args['account_id'])
        ];

        return $payload;
        
        if (empty($payload['toAccountId']) || empty($payload['amount']) || empty($payload['currency'])) {
            return ['success' => false, 'message' => 'Incomplete payout information.'];
        }
        
        return $this->create_payout($payload);
    }

    public function tap_handle_webhook($payload) {
        $event   = json_decode($payload, true);
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        do_action('partnersmanagerpayment/tap_event', $event, $headers);  // :contentReference[oaicite:3]{index=3}
        return $payload;
    }

    private function createCard2Token($card, $user) {
        $payload = [
            'saved_card' => [
                'card_id' => $card['card_id'],
                'customer_id' => $this->get_customer_id($user)
            ],
            'client_ip' => Users::get_the_user_ip()
        ];
        $payload['client_ip'] = $payload['client_ip'] == '::1' ? '127.0.0.1' : $payload['client_ip'];
        return $payload;
        $resp = $this->request("v2/tokens", $payload);
        return $resp;
    }

    public function card_submit($return, $params, $gateway, $user_id) {
        if ($gateway == 'tap') {
            $_updated = set_transient($user_id . '_tap_stored_cards', $params, 1 * HOUR_IN_SECONDS);
            if ($_updated) {
                $return = $this->get_stored_cards($user_id);
            }
        }
        return $return;
    }
    
    public function get_customer_id($user) {
        $_id = get_user_meta($user['id'], '_tap_customer_id', true);
        if (empty($_id)) {
            $_id = $this->create_customer_id($user);
        }
        return $_id;
    }
    
    private function create_customer_id($user) {
        $payload = [
            'first_name' => $user['firstName'] ?? '',
            'middle_name' => $user['middleName'] ?? '',
            'last_name' => $user['lastName'] ?? '',
            'email' => $user['email'] ?? '',
            'phone' => [
                'country_code' => get_user_meta($user['ID'], 'phone_code', true),
                'number' => (int) $user['phone'] ?? '51234567'
            ]
        ];
        $res = $this->request("v2/customers", $payload);
        if (is_wp_error($res)) {
            return $res;
        }
        if (isset($res['id'])) {
            update_user_meta((int) $user['ID'], '_tap_customer_id', $res['id']);
        }
        return $res['id'] ?? null;
    }
    private function get_stored_cards($user_id) {
        global $wpdb;

        $cards = get_transient($user_id . '_tap_stored_cards');
        return ($cards) ? [$cards] : [];
    
        $cards = [];
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT umeta_id, meta_value
                FROM {$wpdb->usermeta}
                WHERE user_id = %d AND meta_key = %s",
                (int) $user_id,
                '_tap_stored_cards'
            )
        );
    
        if (empty($results)) {return [];}

        foreach ($results as $row) {
            $card_data = maybe_unserialize(maybe_unserialize($row->meta_value));
            $card_data['id'] = $row->umeta_id;
            $cards[] = $card_data;
        }
    
        return $cards;
    }

}
