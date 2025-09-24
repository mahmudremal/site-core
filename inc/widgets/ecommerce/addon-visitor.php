<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Request;
use WP_User_Query;
use WP_Error;

class Visitor {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('rest_api_init', [$this, 'register_routes']);
    }
    
    public function register_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/user/auth/(?P<user_identity>[^/]+)/register', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_register_user'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/user/auth/(?P<user_identity>[^/]+)/signin', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_register_user'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/user/auth/(?P<user_id>[^/]+)/verify', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_verify_token'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('sitecore/v1', '/ecommerce/user/locale/update', [
            'methods'  => 'POST',
            'callback' => [$this, 'api_update_locale'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function api_register_user(WP_REST_Request $request) {
        $user_identity = $request->get_param('user_identity');
        $payload = $request->get_param('payload');

        $user_identity = base64_decode($user_identity . '=');
        $payload = json_decode(base64_decode(substr($payload, 5) . '='), true);

        $response_data = $this->auth_user($user_identity, (array) $payload);

        return rest_ensure_response($response_data);
    }

    public function auth_user($user_identity, $payload) {
        if (!isset($payload['isRegister'])) {
            return new WP_Error('auth_error', 'Invalid payload');
        }
        
        if ($payload['isRegister']) {
            $email = $user_identity;
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return new WP_Error('auth_error', 'Invalid email');
            }
            if (!isset($payload['password']) || !isset($payload['confirmPassword']) || $payload['password'] !== $payload['confirmPassword']) {
                return new WP_Error('auth_error', 'Passwords do not match');
            }
            if (!isset($payload['agreeTerms']) || !$payload['agreeTerms']) {
                return new WP_Error('auth_error', 'Must agree to terms');
            }
            if (!isset($payload['firstName']) || !isset($payload['lastName']) || empty($payload['firstName']) || empty($payload['lastName'])) {
                return new WP_Error('auth_error', 'Names are required');
            }

            $existingUser = get_user_by('email', $email);
            if ($existingUser ) {
                return new WP_Error('auth_error', 'User already exists');
            }

            $username = sanitize_user(strtolower($payload['firstName'] . '.' . $payload['lastName']));
            $userdata = [
                'user_login' => $username,
                'user_pass' => $payload['password'],
                'user_email' => $email,
                'first_name' => $payload['firstName'],
                'last_name' => $payload['lastName'],
                'role' => 'subscriber'
            ];

            $accountId = wp_insert_user($userdata);
            if (is_wp_error($accountId)) {
                return $accountId;
            }

            update_user_meta($accountId, '_phone', $payload['phone'] ?? '');

            $emailSent = $this->sendVerificationEmail($email, $accountId);
            $smsSent = !empty($payload['phone']) ? $this->sendSMSVerification($payload['phone'], $accountId) : false;

            return [
                'account_id' => $accountId,
                'verification' => ['emailSent' => $emailSent, 'smsSent' => $smsSent]
            ];
        } else {
            if (!isset($payload['password'])) {
                return new WP_Error('auth_error', 'Password required');
            }

            $user = get_user_by('email', $user_identity);
            if (!$user) $user = get_user_by('login', $user_identity);
            if (!$user) {
                $user_query = new WP_User_Query(['meta_key' => '_phone', 'meta_value' => $user_identity]);
                if (!empty($user_query->results)) {
                    $user = $user_query->results[0];
                }
            }
            if (!$user) {
                return new WP_Error('auth_error', 'User not found!');
            }

            // if (!password_verify($payload['password'], $user->user_pass)) {
            //     return new WP_Error('auth_error', 'Invalid credentials');
            // }

            $sessionId = $this->generateSessionId($user->ID, $payload['rememberMe'] ?? false);

            return [
                'session_id' => $sessionId,
                'session_key' => Ecommerce::get_instance()->get_session_token(),
                'user' => [
                    'id' => $user->ID,
                    'display_name' => $user->display_name
                ]
            ];
        }
    }

    public function generateRandomString($length = 6) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }
        return $randomString;
    }
    private function generateVerificationToken($user_id) {
        // $token = wp_generate_uuid4();
        $token = $this->generateRandomString();
        update_user_meta($user_id, '_verification_token', $token);
        update_user_meta($user_id, '_verification_token_expires', time() + (60 * 60 * 24)); // 24 hours
        return $token;
    }

    public function sendVerificationEmail($email, $user_id) {
        $token = $this->generateVerificationToken($user_id);
        $verify_link = home_url('/auth/verify/' . $user_id . '/token/' . $token);

        $subject = 'Verify Your Account Registration';

        $message = '
        <html>
        <head>
            <title>Account Verification</title>
        </head>
        <body>
            <h2>Welcome to Our Site!</h2>
            <p>Hi ' . get_user_meta($user_id, 'first_name', true) . ' ' . get_user_meta($user_id, 'last_name', true) . ',</p>
            <p>Thank you for registering with us. To complete your registration, please verify your email address by clicking the link below:</p>
            <p><a href="' . esc_url($verify_link) . '" style="background-color: #0073aa; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Your Email</a></p>
            <p>If the link doesn\'t work, copy and paste this URL into your browser: ' . esc_url($verify_link) . '</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn\'t create this account, please ignore this email.</p>
            <p>Best regards,<br>The Team</p>
        </body>
        </html>';

        $headers = array('Content-Type: text/html; charset=UTF-8');

        $sent = wp_mail($email, $subject, $message, $headers);
        return $sent;
    }

    public function sendSMSVerification($phone, $user_id) {
        $token = $this->generateVerificationToken($user_id);
        $message = 'Your verification code is: ' . substr($token, 0, 6) . '. Enter this code to verify your account. This code expires in 24 hours. Do not share it.';

        $result = apply_filters('sitecore/sms/send', $phone, $message, ['user_id' => $user_id]);

        return isset($result->success) ? $result->success : false;
    }

    public function api_verify_token(WP_REST_Request $request) {
        $token = sanitize_text_field($request->get_param('token'));
        $user_id = intval($request->get_param('user_id'));
        $result = $this->verifyUserToken($token, $user_id);
        if (is_wp_error($result)) {
            return new WP_Error('verify_failed', $result->get_error_message(), ['status' => 400]);
        }
        return rest_ensure_response($result);
    }

    public function verifyUserToken($token, $user_id) {
        $user = get_user_by('ID', $user_id);
        if (!$user) {
            return new WP_Error('verify_error', 'User not found');
        }

        if (get_user_meta($user_id, '_user_verified', true)) {
            return new WP_Error('verify_error', 'User already verified');
        }

        $stored_token = get_user_meta($user_id, '_verification_token', true);
        if ($stored_token !== $token) {
            return new WP_Error('verify_error', 'Invalid verification token');
        }

        $expires = get_user_meta($user_id, '_verification_token_expires', true);
        if (time() > $expires) {
            // Clean up expired token
            delete_user_meta($user_id, '_verification_token');
            delete_user_meta($user_id, '_verification_token_expires');
            return new WP_Error('verify_error', 'Verification token has expired');
        }

        // Mark user as verified
        update_user_meta($user_id, '_user_verified', true);
        update_user_meta($user_id, '_verified_at', current_time('mysql'));

        // Clean up token after successful verification
        delete_user_meta($user_id, '_verification_token');
        delete_user_meta($user_id, '_verification_token_expires');

        return [
            'success' => true,
            'message' => 'Account verified successfully',
            'user_id' => $user_id
        ];
    }

    public function generateSessionId($user_id, $remember) {
        $session_id = Ecommerce::get_instance()->get_session_id();
        if (!$session_id) return null;

        global $wpdb;
        $updated = $wpdb->update(
            $this->tables->sessions,
            ['user_id' => $user_id],
            ['id' => $session_id],
            ['%d'], ['%d']
        );
        return $session_id;
    }

    public function api_update_locale(WP_REST_Request $request) {
        $payload = $request->get_param('payload');

        $token = Ecommerce::get_instance()->get_session_token();
        if (!$token) return rest_ensure_response(['success' => false]);

        global $wpdb;
        $updated = $wpdb->update(
            $this->tables->sessions,
            [
                ...$payload
            ],
            ['session_key' => $token]
        );
        
        return rest_ensure_response(['success' => $updated, 'error' => $wpdb->last_error]);
    }
  

}
