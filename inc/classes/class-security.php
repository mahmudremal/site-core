<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Security {
	use Singleton;

	private $_token_period = 3600 * 1 * 60000; // 1 * 6 hour
	private $secret = 'your-secret-key';
	public $user_id = null;

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', function () {
			remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
		
			add_filter('rest_pre_serve_request', function ($value) {
				header("Access-Control-Allow-Origin: *");
				header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
				header("Access-Control-Allow-Headers: Content-Type, Authorization");
				return $value;
			});
		}, 15);
		
		add_action('init', function () {
			header("Access-Control-Allow-Origin: *");
			header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
			header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");
		});

		
		add_filter('partnership/security/verify/permission', [$this, 'default_permission'], 10, 2);
		// return apply_filters('partnership/security/verify/permission', false);
		add_action('rest_api_init', [$this, 'rest_api_init']);
	}

	public function rest_api_init() {
		register_rest_route('sitecore/v1', '/token', [
			'methods' => 'POST',
			'callback' => [$this, 'issue_token'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/validate', [
			'methods' => 'POST',
			'callback' => [$this, 'validate_token'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/reset-password', [
			'methods' => 'POST',
			'callback' => [$this, 'reset_password'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/otp/verify', [
			'methods' => 'POST',
			'callback' => [$this, 'otp_verify'],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/otp/send', [
			'methods' => 'POST',
			'callback' => [$this, 'otp_send'],
			'permission_callback' => '__return_true'
		]);
	}

	public function issue_token(WP_REST_Request $request) {
		$email = $request->get_param('email');
		$username = $request->get_param('username');
		$password = $request->get_param('password');
		$isSignUp = $request->get_param('isSignUp');

		$firstName = $request->get_param('firstName');
		$lastName = $request->get_param('lastName');
		$password2 = $request->get_param('password2');
		$role = $request->get_param('role');
		$opt_sent = false;

		if ($isSignUp && !empty($isSignUp)) {
			if (!empty($password) && $password == $password2) {
				if (empty(trim($username))) {
					$username = strstr($email, '@', true);
					$username = sanitize_user($username, true);
					if (empty($username)) {$username = 'user_' . wp_generate_password(8, false);}
				}
				$user_id = username_exists( $username );
				if ($user_id || email_exists( $email )) {
					return new WP_REST_Response(['message' => __('User already exists.', 'site-core')], 403);
				}
				// $created = wp_create_user( $username, $password, $email );
				if (!in_array($role, ['partnership_partner', 'partnership_influencer', 'partnership_stuff'])) {
					$role = 'partnership_client';
				}
				$created = wp_insert_user([
					'user_pass' => $password,
					'user_login' => $username,
					'first_name' => $firstName,
					'last_name' => $lastName,
					'user_email' => $email,
					'role' => $role,
					'meta_input' => [
						// key => value
					]
				]);
				if (!$created || is_wp_error($created)) {
					return new WP_REST_Response(['message' => __('Failed to create account!', 'site-core'), 'error' => $created->get_error_message()], 403);
				}
				$user_id = $created;
				update_user_meta($user_id, 'first_name', $firstName);
				update_user_meta($user_id, 'last_name', $lastName);
				update_user_meta($user_id, '_verified', false);
				$opt_sent = $this->send_verification_email($user_id);
			}
		}

		$user = wp_authenticate($username, $password);
		if (is_wp_error($user)) {
			return new WP_REST_Response(['message' => 'Invalid credentials. ' . $user->get_error_message()], 403);
		}

		$full_name = trim($first_name . ' ' . $last_name);

		return [
			'token' => $isSignUp ? false : $this->encode_token(['user_id' => $user->ID, 'iat' => time(), 'exp' => time() + $this->_token_period]),
			'bearer' => $user->ID,
			'user' => $isSignUp ? false : Users::prepare_user_data_for_response($user),
			'isSignUp' => (bool) $isSignUp,
			'email' => $email,
			'verify' => (bool) $isSignUp === true,
			'opt_sent' => $opt_sent,
			'message' => $isSignUp ? __('Account created successfully. Please verify your email.', 'site-core') : __('Login successful.', 'site-core'),
			// 'role' => Roles::get_role($user->ID)
		];
	}

	public function validate_token(WP_REST_Request $request) {
		$token = $this->get_token_from_header();
		if (!$token) return new WP_REST_Response(['valid' => false], 403);

		$data = $this->decode_token($token);
		if (!$data) return new WP_REST_Response(['valid' => false], 403);

		return ['valid' => true, 'user_id' => $data['user_id']];
	}

	public function permission_callback(WP_REST_Request $request) {
		$data = $this->decode_token($this->get_token_from_header());
		if (is_wp_error($data)) {
			return $data;
		}
		// print_r($data);wp_die();
		$result = apply_filters('partnership/security/permission/approval', $data !== false, $request);
		return $result;
	}

	private function encode_token(array $payload): string {
		$header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
		$body = base64_encode(json_encode($payload));
		$signature = hash_hmac('sha256', "$header.$body", $this->secret, true);
		$signature_encoded = base64_encode($signature);
		return "$header.$body.$signature_encoded";
	}

	private function decode_token($token) {
		if (! is_string($token)) {
			return new WP_Error('invalid_token', __('Invalid token format.', 'site-core'));
			return false;
		}
		$parts = explode('.', $token);
		if (count($parts) !== 3) {
			return new WP_Error('invalid_token', __('Invalid token format.', 'site-core'));
			return false;
		}

		[$header_b64, $body_b64, $sig_b64] = $parts;

		$expected_sig = base64_encode(hash_hmac('sha256', "$header_b64.$body_b64", $this->secret, true));
		if (!hash_equals($expected_sig, $sig_b64)) {
			return new WP_Error('invalid_signature', __('Invalid token signature.', 'site-core'));
			return false;
		}

		$payload = json_decode(base64_decode($body_b64), true);
		if (!$payload || time() > $payload['exp']) {
			return new WP_Error('expired_token', __('Token has expired.', 'site-core'));
			return false;
		}

		if (isset($payload['user_id']) && !empty($payload['user_id'])) {
			$this->user_id = $payload['user_id'];
		}
		
		return $payload;
	}

	private function get_token_from_header(): ?string {
		$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
		if (stripos($auth, 'Bearer ') === 0) {
			return trim(substr($auth, 7));
		}
		return null;
	}

	public function reset_password(WP_REST_Request $request) {
		$email = $request->get_param('email');

		if (empty($email)) {
			return new WP_REST_Response(['message' => __('Email required.', 'site-core')], 403);
		}

		if (!is_email($email)) {
			return new WP_REST_Response(['message' => __('Invalid email address.', 'site-core')], 403);
		}

		if (!email_exists($email)) {
			return new WP_REST_Response(['message' => __('Email does not exist.', 'site-core')], 403);
		}

		$user = get_user_by('email', $email);
		if ($user) {
			retrieve_password($user->user_login);
			// do_action('retrieve_password', $user->user_login);
			return new WP_REST_Response(['message' => __('Password reset mail sent successfully.', 'site-core')], 200);
		} else {
			return new WP_REST_Response(['message' => __('User not found.', 'site-core')], 403);
		}
	}

	public function otp_send(WP_REST_Request $request) {
		$email = $request->get_param('email');

		if (empty($email)) {
			return new WP_REST_Response(['message' => __('Email required.', 'site-core')], 403);
		}

		if (!is_email($email)) {
			return new WP_REST_Response(['message' => __('Invalid email address.', 'site-core')], 403);
		}

		if (!email_exists($email)) {
			return new WP_REST_Response(['message' => __('Email does not exist.', 'site-core')], 403);
		}

		$user = get_user_by('email', $email);
		if ($user) {
			$result = $this->send_verification_email($user->ID);
			if (is_wp_error($result)) {
				return new WP_REST_Response(['message' => $result->get_error_message()], 403);
			}
			return new WP_REST_Response(['message' => __('Verification email sent successfully.', 'site-core')], 200);
		} else {
			return new WP_REST_Response(['message' => __('User not found.', 'site-core')], 403);
		}
	}
	
	private function send_verification_email($user_id) {
		if (get_user_meta($user_id, '_verified', true) === true) {
			return new WP_Error('already_verified', __('User is already verified.', 'site-core'));
		}
		$user = get_user_by('id', $user_id);
		if (!$user) return false;
		$token = random_int(100000, 999999);
		// 
		update_user_meta($user_id, '__verify_attempt', 0);
		update_user_meta($user_id, '__verify_token', $token);
		update_user_meta($user_id, '__verify_expires', time() + $this->_token_period);

		$subject = __('Email Verification', 'site-core');
		$message = sprintf(__('Your email verification code is: %d', 'site-core'), $token);

		return wp_mail($user->user_email, $subject, $message);
	}

	private function verify_otp_code($user_id, $code) {
		$attempts = (int) get_user_meta($user_id, '__verify_attempt', true);
		if (empty($attempts)) {$attempts = 0;}
		if ($attempts > 5) {
			return new WP_Error('too_many_attempts', __('Too many verification attempts. Please try again later.', 'site-core'));
		}
		update_user_meta($user_id, '__verify_attempt', $attempts + 1);
		
		$stored_code = get_user_meta($user_id, '__verify_token', true);
		$expires = get_user_meta($user_id, '__verify_expires', true);

		if (empty($stored_code) || empty($expires)) {
			return new WP_Error('invalid_code', __('Invalid verification code.', 'site-core'));
		}

		if (time() > $expires) {
			return new WP_Error('expired_code', __('Verification code has expired.', 'site-core'));
		}

		if ($stored_code == $code) {
			delete_user_meta($user_id, '__verify_token');
			delete_user_meta($user_id, '__verify_attempt');
			delete_user_meta($user_id, '__verify_expires');
			update_user_meta($user_id, '_verified', true);
			return true;
		}

		return new WP_Error('invalid_code', __('Invalid verification code.', 'site-core'));
	}

	public function otp_verify(WP_REST_Request $request) {
		$code = $request->get_param('code');
		$email = $request->get_param('email');

		if (empty($code) || empty($email)) {
			return new WP_REST_Response(['message' => __('Code and User ID are required.', 'site-core')], 403);
		}

		if (!is_numeric($code) || strlen($code) !== 6) {
			return new WP_REST_Response(['message' => __('Invalid code format.', 'site-core')], 403);
		}

		$user = get_user_by('email', $email);
		if (!$user) {
			return new WP_REST_Response(['message' => __('User not found.', 'site-core')], 403);
		}

		$result = $this->verify_otp_code($user->ID, $code);
		if (is_wp_error($result)) {
			return new WP_REST_Response(['message' => $result->get_error_message()], 403);
		}

		return new WP_REST_Response([
			'message' => __('Email verified successfully.', 'site-core'),
			'token' => $this->encode_token(['user_id' => $user->ID, 'iat' => time(), 'exp' => time() + $this->_token_period]),
			'bearer' => $user->ID,
			'user' => Users::prepare_user_data_for_response($user),
		], 200);
	}
	
}
