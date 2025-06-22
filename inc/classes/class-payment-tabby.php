<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Payment_Tabby {
    use Singleton;

    private $secret_key;
    private $merchant_code;
    private $api_base;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_filter('partnership/payment/gateways',          [ $this, 'push_gateways'], 10, 1);
        add_filter('partnership/payment/gateway/switched',  [ $this, 'switch_gateways'], 10, 3);
        add_filter('tap/payment/charge/payload',            [ $this, 'tap_payment_charge_payload'], 10, 3);
        add_filter('payment/provider/match',                [ $this, 'payment_provider_match'], 10, 3);
    }

    public function push_gateways($gateways) {
        $gateways['tabby'] = [
            'title' => __('Tabby', 'site-core'),
            'icon' => WP_SITECORE_BUILD_URI . '/icons/tabby.svg',
            // 'description' => __('Pay via installment with tabby 12 month plan now. buy now pay later. click on [Pay Now] button to proceed.', 'site-core'),
            'description' => '
                <div style="width: 100%;">
                    <div style="padding: 20px;text-align: center;">
                        <div style="display: flex;flex-direction: column;gap: 20px">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-252.3 356.1 163 80.9" style="height: 80px;">
                                <path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2" d="M-108.9 404.1v30c0 1.1-.9 2-2 2H-231c-1.1 0-2-.9-2-2v-75c0-1.1.9-2 2-2h120.1c1.1 0 2 .9 2 2v37m-124.1-29h124.1"></path>
                                <circle cx="-227.8" cy="361.9" r="1.8" fill="currentColor"></circle>
                                <circle cx="-222.2" cy="361.9" r="1.8" fill="currentColor"></circle>
                                <circle cx="-216.6" cy="361.9" r="1.8" fill="currentColor"></circle>
                                <path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2" d="M-128.7 400.1H-92m-3.6-4.1 4 4.1-4 4.1"></path>
                            </svg>
                            <div >
                                <p class="">After clicking “Pay now”, you will be redirected to Pay later with Tabby to complete your purchase securely.</p>
                            </div>
                        </div>
                    </div>
                </div>
            ',
            'fields' => [
                ['type' => 'none', 'required' => true]
            ]
        ];
        return $gateways;
    }

    public function switch_gateways($return, $gateway, $user_id) {
        if ($gateway == 'tabby') {
            $return = [
                'type'          => 'installment',
                'customer_id'   => Payment_Tap::get_instance()->get_customer_id(Users::prepare_user_data_for_response(get_userdata($user_id)))
            ];
        }
        return $return;
    }

    public function tap_payment_charge_payload($payload, $args, $gateway) {
        if ($gateway == 'tabby') {
            $payload['source'] = ['id' => 'src_tabby.installement'];
        }
        return $payload;
    }

    public function payment_provider_match($matched, $current, $asked) {
        if ($asked == 'tabby' && $current == 'tap') {
            return true;
        }
        return $matched;
    }
    
}
