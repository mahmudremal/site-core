<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Payment {
    use Singleton;

    private $post_data;

    protected function __construct() {
        $this->post_data = [];
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('init', [$this, 'register_post_type']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('query_vars', [$this, 'payment_query_vars']);
        add_action('init', [$this, 'add_payment_rewrite_rules']);
        add_action('wp_ajax_payment_webhook', [$this, 'handle_webhook']);
        add_filter('template_include', [$this, 'payment_status_template']);
        add_filter('template_include', [$this, 'payment_status_template']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_action('wp_ajax_nopriv_payment_webhook', [$this, 'handle_webhook']);

        add_filter('sitecore/payment/payout', [$this, 'payout_payment'], 1, 3);
    }

    public function add_payment_rewrite_rules() {
        add_rewrite_rule(
            '^partnership/payment/([^/]+)/status/?$',
            'index.php?partnership_payment=$matches[1]&payment-status=true',
            'top'
        );
    }

    public function payment_query_vars($vars) {
        $vars[] = 'partnership_payment';
        $vars[] = 'payment-status';
        return $vars;
    }

    public function payment_status_template($template) {
        if (get_query_var('payment-status')) {
            $file = WP_SITECORE_DIR_PATH . '/templates/payment-status.php';
            return file_exists($file) ? $file : $template;
        }
        return $template;
    }

    public function settings($args = []) {
		$args['payment']	= [
			'title'							=> __('Payment', 'site-core'),
			'description'					=> __('Payment configurations, gateway setups and all necessery things will be done form here.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'payment-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the application unconditionally.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'payment-tap-secretkey',
					'label'					=> __('Secret key', 'site-core'),
					'description'			=> __('Provide tap secret key.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'payment-tap-publickey',
					'label'					=> __('Public key', 'site-core'),
					'description'			=> __('Provide tap public key.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],


				[
					'id' 					=> 'payment-invoice-bg',
					'label'					=> __('Invoice background', 'site-core'),
					'description'			=> __('Provide here an image url that will work as an background image of anonymouse payment background.', 'site-core'),
					'type'					=> 'url',
					'default'				=> ''
				],

			]
		];
        return $args;
    }

    public function register_routes() {
		register_rest_route('sitecore/v1', '/payment/create', [
			'methods' => 'POST',
			'callback' => [$this, 'create_payment'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payment/gateways', [
			'methods' => 'GET',
			'callback' => [$this, 'get_payment_gateways'],
            'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/payment/switch/(?P<gateway>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_switch_gateway'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payment/card/submit/(?P<gateway>[^/]+)', [
			'methods' => 'POST',
			'callback' => [$this, 'submit_payment_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payment/card/(?P<card_id>\d+)/remove', [
			'methods' => 'DELETE',
			'callback' => [$this, 'remove_payment_card'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payment/verify/(?P<gateway>[^/]+)/(?P<transection_id>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'verify_payment_intend'],
            'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

    public function register_post_type() {
        register_post_type('partner_payments', [
            'label'       => 'Partner Payments',
            'public'      => false,
            'show_ui'     => false,
            'supports'    => [],
        ]);
    }

    public function create_payment_intent($args, $provider) {
        $post_id = $this->insert_record('intent', $args, $provider);
        $result = apply_filters('partnersmanagerpayment/create_payment_intent', null, $args, $provider);
        $this->update_record($post_id, ['result' => $result]);
        return $result;
    }

    public function get_payment_status($status, $args) {
        $post_id = $this->insert_record('status', $args, '');
        $new_status = apply_filters('partnersmanagerpayment/status', $status, $args);
        $this->update_record($post_id, ['status' => $new_status]);
        return $new_status;
    }

    public function verify_payment($data, $provider) {
        $post_id = $this->insert_record('verify', $data, $provider);
        $verified = apply_filters('partnersmanagerpayment/verify', false, $data, $provider);
        $this->update_record($post_id, ['verified' => $verified]);
        return $verified;
    }

    public function create_subscription($args, $provider) {
        $post_id = $this->insert_record('subscription', $args, $provider);
        $subscription = apply_filters('partnersmanagerpayment/create_subscription', null, $args, $provider);
        do_action('partnersmanagerpayment/subscription_created', $subscription, $args, $provider, $post_id);
        $this->update_record($post_id, ['subscription' => $subscription]);
        return $subscription;
    }

    public function pause_subscription($subscription_id, $provider) {
        $is_paused = apply_filters('partnersmanagerpayment/pause_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_paused', $is_paused, $subscription_id, $provider);
        return $is_paused;
    }

    public function resume_subscription($subscription_id, $provider) {
        $is_resumed = apply_filters('partnersmanagerpayment/resume_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_resumed', $is_resumed, $subscription_id, $provider);
        return $is_resumed;
    }

    public function cancel_subscription($subscription_id, $provider) {
        $is_cancelled = apply_filters('partnersmanagerpayment/cancel_subscription', false, $subscription_id, $provider);
        do_action('partnersmanagerpayment/subscription_cancelled', $is_cancelled, $subscription_id, $provider);
        return $is_cancelled;
    }

    public function refund_payment($payment_id, $args, $provider) {
        $is_refunded = apply_filters('partnersmanagerpayment/refund_payment', false, $payment_id, $args, $provider);
        do_action('partnersmanagerpayment/subscription_refunded', $is_refunded, $subscription_id, $provider, $args);
        return $is_refunded;
    }

    public function payout_payment($_null, $payload, $provider) {
        $_payment_made = apply_filters('partnersmanagerpayment/payout', false, $payload, $provider);
        return $_payment_made ? $_payment_made : $_null;
    }

    public function handle_webhook() {
        $payload = file_get_contents('php://input');
        apply_filters('partnersmanagerpayment/webhook', $payload);
        status_header(200);
        exit;
    }

    protected function insert_record($type, $data, $provider) {
        $post_id = wp_insert_post([
            'post_type'   => 'partner_payments',
            'post_status' => 'publish',
            'post_title'  => ucfirst($type) . ' - ' . time(),
        ]);
        if ($post_id) {
            update_post_meta($post_id, 'type', $type);
            update_post_meta($post_id, 'provider', $provider);
            update_post_meta($post_id, 'data', $data);
        }
        return $post_id;
    }

    protected function update_record($post_id, $fields) {
        foreach ($fields as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
    }


    public function create_payment(WP_REST_Request $request) {
        $package_id = $request->get_param('package_id');
		$pricing_plan = $request->get_param('pricing_plan');
		$starting = $request->get_param('starting');
		$gateway = $request->get_param('gateway');
		$currency = $request->get_param('currency');
		$card = $request->get_param('card');
        // 
        $packages = Contract::get_packages();
        $found_index = array_search($package_id, array_column($packages, 'id'));
        // 
        if ($found_index === false) {
            return new WP_Error('package_not_found', 'Package with the specified ID not found.', ['status' => 404]);
        }
        $package = $packages[$found_index];
        $pricing_amount = (isset($package['pricing']) && isset($package['pricing'][$pricing_plan])) ? $package['pricing'][$pricing_plan] : null;
        if (!$pricing_amount) {
            return new WP_Error('plan_not_found', 'Pricing plan on the selected package not found.', ['status' => 404]);
        }
        if ($pricing_amount == 0) {
            return rest_ensure_response(['payment_done' => true]);
        }
        $_intend = $this->create_payment_intent([
            'issued_on' => time(),
            'amount' => $pricing_amount,
            'title' => $package['name'] . ' - ' . $package['packagefor'] . ' - ' . $pricing_plan,
            'description' => $package['shortdesc'],

            'card' => $card,

            'save_card' => true,
            'currency' => $currency,

            'user' => Users::prepare_user_data_for_response(get_userdata(Security::get_instance()->user_id))
        ], $gateway);
        $response = $_intend;
        // 
		return rest_ensure_response($response);
    }

    public function get_payment_gateways(WP_REST_Request $request) {
        $response = apply_filters('sitecore/payment/gateways', []);
        return rest_ensure_response($response);
    }

    public function get_switch_gateway(WP_REST_Request $request) {
        $gateway = $request->get_param('gateway');
        $user_id = (int) Security::get_instance()->user_id;
        if (!$user_id) {
            return new WP_Error('user_not_found', 'User not found.', ['status' => 404]);
        }
        $response = apply_filters('sitecore/payment/gateway/switched', null, $gateway, $user_id);
        if (! $response) {$response = ['type' => 'none'];}
        return rest_ensure_response($response);
    }

    public function submit_payment_card(WP_REST_Request $request) {
        $gateway = $request->get_param('gateway');
        $params = $request->get_params();
        $user_id = Security::get_instance()->user_id;
        $response = apply_filters('sitecore/payment/card/submit', null, $params, $gateway, $user_id);
        return rest_ensure_response($response);
    }
    public function remove_payment_card(WP_REST_Request $request) {
        global $wpdb;
        $card_id = $request->get_param('card_id');
        $user_id = Security::get_instance()->user_id;

        if (!is_integer($user_id)) {
            delete_transient($user_id . '_tap_stored_cards');
        }
        
        $deleted = $wpdb->delete(
            $wpdb->usermeta,
            [
                'umeta_id' => (int) $card_id,
                'user_id'  => (int) $user_id
            ],
            ['%d', '%d']
        );
        if (false === $deleted) {
            return new WP_REST_Response(
                ['message' => __('Failed to delete payment card', 'site-core')],
                500 // Internal Server Error
            );
        } elseif ($deleted) {
            return new WP_REST_Response(
                ['message' => __('Payment card deleted successfully', 'site-core')],
                200 // OK
            );
        } else {
            return new WP_REST_Response(
                ['message' => __('Payment card not found or could not be deleted', 'site-core')],
                404 // Not Found
            );
        }
    }
    
    public function verify_payment_intend(WP_REST_Request $request) {
        $gateway = $request->get_param('gateway');
        $transection_id = $request->get_param('transection_id');
        $user_id = Security::get_instance()->user_id;
        $response = apply_filters('sitecore/payment/transection/verify', null, $transection_id, $gateway, $user_id);
        return rest_ensure_response($response);
    }

}
