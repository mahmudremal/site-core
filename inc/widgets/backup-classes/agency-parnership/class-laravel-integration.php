<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;
use WP_User;

class Laravel_Integration {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_webhook_endpoint']);
        add_action('partnership_laravel_payment_done', [$this, 'partnership_laravel_payment_done'], 10, 2);
        add_action('partnership_laravel_account_opened', [$this, 'partnership_laravel_account_opened'], 10, 2);
    }

    public function register_webhook_endpoint() {
        register_rest_route('sitecore/v1', '/laravel-webhook', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_laravel_webhook'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function handle_laravel_webhook(WP_REST_Request $request) {
        $event_type = $request->get_param('event_type');
        $user_data = $request->get_params();

        if (empty($event_type) || empty($user_data) || !is_array($user_data) || !isset($user_data['email'])) {
            return new WP_Error('invalid_data', 'Invalid webhook data received.', ['status' => 400]);
        }

        $email = sanitize_email($user_data['email']);
        $user = get_user_by('email', $email);
        $referrer_id = $this->get_referrer_id_from_laravel_data($user_data);

        if (!$user) {
            $username = sanitize_user(explode('@', $email)[0]);
            $password = wp_generate_password();
            $user_id = wp_create_user($username, $password, $email);

            if (is_wp_error($user_id)) {
                return $user_id;
            }
            $user = get_user_by('id', $user_id);
        }

        switch ($event_type) {
            case 'account_opened':
                do_action('partnership_laravel_account_opened', $user, $user_data);
                if ($user && $referrer_id) {
                    do_action('create_referral_record', $referrer_id, $user->ID);
                }
                break;
            case 'payment_done':
                do_action('partnership_laravel_payment_done', $user, $user_data);
                break;
            case 'form_fillup':
                do_action('partnership_laravel_form_fillup', $user, $user_data);
                break;
            default:
                do_action('partnership_laravel_unknown_event', $event_type, $user, $user_data);
                break;
        }

        return rest_ensure_response(['success' => true, 'message' => 'Webhook processed.']);
    }

    private function get_referrer_id_from_laravel_data(array $laravel_data) {
        if (isset($laravel_data['referrer_code'])) {
            $users = get_users([
                'meta_key' => 'referral_code',
                'meta_value' => sanitize_text_field($laravel_data['referrer_code']),
                'number' => 1,
                'fields' => 'ID',
            ]);
            return !empty($users) ? $users[0] : null;
        }
        return null;
    }

    public function partnership_laravel_payment_done($user, $params) {}
    public function partnership_laravel_account_opened($user, $params) {}
}