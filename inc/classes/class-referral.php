<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Query;
use WP_Error;
use WP_User;

class Referral {
	use Singleton;

	public $comission = .20;

	protected function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_filter('query_vars', [ $this, 'query_vars' ]);
		add_action('rest_api_init', [$this, 'rest_api_init']);
		add_action('init', [$this, 'register_referral_post_type']);
        add_action('template_redirect', [$this, 'maybe_set_referral_cookie']);
		add_action('user_register', [$this, 'track_referral_on_register'], 10, 1);
		add_action('create_referral_record', [$this, 'create_referral_record'], 10, 2);
        add_filter('sitecore/security/api/abilities', [$this, 'api_abilities'], 10, 3);
		add_action('woocommerce_order_status_completed', [$this, 'track_referral_on_order'], 10, 1);
	}
	public function register_referral_post_type() {
		register_post_type('referral', [
			'label' => 'Referrals',
			'public' => false,
			'show_ui' => false,
			'supports' => ['title', 'custom-fields'],
		]);
	}
	public function rest_api_init() {
		register_rest_route('sitecore/v1', '/referral-link/(?P<user_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_referral_link'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('sitecore/v1', '/referral-code/check', [
			'methods' => 'POST',
			'callback' => [$this, 'check_referral_code'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('sitecore/v1', '/referral-code/save', [
			'methods' => 'POST',
			'callback' => [$this, 'save_referral_code'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('sitecore/v1', '/referrals', [
			'methods' => 'GET',
			'callback' => [$this, 'get_referrals'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);

		register_rest_route('sitecore/v1', '/referrals', [
			'methods' => 'POST',
			'callback' => [$this, 'create_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);

		register_rest_route('sitecore/v1', '/referrals/(?P<id>\d+)', [
			'methods' => 'PUT',
			'callback' => [$this, 'update_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);

		register_rest_route('sitecore/v1', '/referrals/(?P<id>\d+)', [
			'methods' => 'DELETE',
			'callback' => [$this, 'delete_referral'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		
		register_rest_route('sitecore/v1', '/referrals/invite', [
			'methods' => 'POST',
			'callback' => [$this, 'invite_user'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'referral')) {
            $abilities[] = 'referral';
        }
        return $abilities;
    }
    
	public function query_vars($vars) {
        $vars[] = 'ref';
        return $vars;
    }
	
	public function get_referral_link(WP_REST_Request $request) {
		$user_id = Security::get_instance()->user_id;
		$code = get_user_meta($user_id, 'referral_code', true);
		if (!$code) {
			$code = substr(md5(uniqid()), 0, 4);
			update_user_meta($user_id, 'referral_code', $code);
		}
		return ['link' => add_query_arg('ref', $code, site_url('/pricing'))];
	}
	
	public function check_referral_code($code) {
		$users = get_users([
			'meta_key' => 'referral_code',
			'meta_value' => $code,
			'number' => 1,
			'fields' => 'ID',
		]);
		return ['exists' => !empty($users), 'user' => $users[0] ?? null];
	}
	
	public function save_referral_code($user_id, $code) {
		$existing = get_user_meta($user_id, 'referral_code', true);
		if ($existing) {
			return new WP_Error('referral_code_exists', 'Referral code already settled for this user.');
		}
		if ($this->referral_code_exists($code)) {
			return new WP_Error('referral_code_taken', 'Referral code is already in use by another user.');
		}
		update_user_meta($user_id, 'referral_code', $code);
		return ['saved' => true];
	}
	
    public function maybe_set_referral_cookie() {
		$ref = get_query_var('ref');
        if ($ref && !empty($ref) && !isset($_COOKIE['ref'])) {
			// 
			$_validate = $this->check_referral_code($ref);
			if ($_validate['exists']) {
				setcookie('ref', $ref, time() + (30 * DAY_IN_SECONDS), COOKIEPATH, COOKIE_DOMAIN);$_COOKIE['ref'] = $ref;
			}
			// wp_redirect(home_url('/dashboard/'));die;
        }
    }
	public function get_referrals(WP_REST_Request $request) {
		global $wpdb;
		$user_id  = Security::get_instance()->user_id;
		$page     = max(1, (int) $request->get_param('page'));
		$search   = (string) $request->get_param('s');
		$status   = (string) $request->get_param('status');
		$per_page = max(1, (int) $request->get_param('per_page'));
		$offset   = ($page - 1) * $per_page;
	
		$referral_code = get_user_meta($user_id, 'referral_code', true);
	
		$where = $wpdb->prepare(
			"WHERE pm_referrer.meta_key = %s
			AND pm_referrer.meta_value = %s
			AND p.post_type = %s
			AND pm_user.meta_key = %s",
			'referrer_id',
			$referral_code,
			'referral',
			'user_id'
		);
	
		if (!empty($status) && $status !== 'any') {
			$where .= $wpdb->prepare(" AND u.user_status = %d", $status == 'active');
		}
	
		if (!empty($search)) {
			$where .= $wpdb->prepare(" AND (u.display_name LIKE %s OR u.user_email LIKE %s)", "%{$search}%", "%{$search}%");
		}
	
		$query = "SELECT SQL_CALC_FOUND_ROWS
			u.ID as user_id,
			u.display_name,
			u.user_email,
			u.user_registered as join_date,
			u.user_status as verified,
			p.ID as id,
			p.post_date as issued_at,
			(SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = 'converted' AND post_id = p.ID) AS converted
			FROM {$wpdb->postmeta} pm_referrer
			LEFT JOIN {$wpdb->posts} p ON p.ID = pm_referrer.post_id
			LEFT JOIN {$wpdb->postmeta} pm_user ON p.ID = pm_user.post_id
			LEFT JOIN {$wpdb->users} u ON pm_user.meta_value = u.ID
			$where
			ORDER BY p.post_date DESC
			LIMIT %d OFFSET %d";
	
		$prepared_query = $wpdb->prepare($query, $per_page, $offset);
		$response_data = $wpdb->get_results($prepared_query, ARRAY_A);
	
		$total_found = $wpdb->get_var("SELECT FOUND_ROWS()");
		$max_pages = ceil($total_found / $per_page);
	
		foreach ($response_data as $index => $row) {
			$response_data[$index]['join_date'] = strtotime($row['join_date']);
		}
	
		$response = rest_ensure_response($response_data);
		$response->header('X-WP-Total', $total_found);
		$response->header('X-WP-TotalPages', $max_pages);
	
		return $response;
	}
	
	public function create_referral(WP_REST_Request $request) {
		$referrer_id = $request->get_param('referrer_id');
		$user_id = $request->get_param('user_id');
		$post_id = wp_insert_post([
			'post_type' => 'referral',
			'post_title' => 'Referral by ' . $referrer_id,
			'post_status' => 'publish',
		]);
		update_post_meta($post_id, 'referrer_id', $referrer_id);
		update_post_meta($post_id, 'user_id', $user_id);
		update_post_meta($post_id, 'converted', false);
		return ['id' => $post_id];
	}
	public function update_referral(WP_REST_Request $request) {
		$id = $request->get_param('id');
		$converted = $request->get_param('converted');
		update_post_meta($id, 'converted', $converted);
		return ['updated' => true];
	}
	public function delete_referral(WP_REST_Request $request) {
		$id = $request->get_param('id');
		wp_delete_post($id, true);
		return ['deleted' => true];
	}
	public function invite_user(WP_REST_Request $request) {
		$email = $request->get_param('email');
		$referrer_id = $request->get_param('referrer_id');
		$link = add_query_arg('ref', $referrer_id, site_url());
		// send email to $email with $link
		return ['status' => 'sent', 'link' => $link];
	}
	public function track_referral_on_register($user_id) {
		if (!isset($_COOKIE['ref'])) return;
		$referrer_id = $_COOKIE['ref'];
		$post_id = wp_insert_post([
			'post_type' => 'referral',
			'post_title' => 'Referral register ' . $user_id,
			'post_status' => 'publish',
		]);
		update_post_meta($post_id, 'referrer_id', $referrer_id);
		update_post_meta($post_id, 'user_id', $user_id);
		update_post_meta($post_id, 'converted', false);
	}
	public function track_referral_on_order($order_id) {
		$order = wc_get_order($order_id);
		$user_id = $order->get_user_id();
		$query = new WP_Query([
			'post_type' => 'referral',
			'meta_query' => [
				[
					'key' => 'user_id',
					'value' => $user_id,
				]
			]
		]);
		foreach ($query->posts as $post) {
			update_post_meta($post->ID, 'converted', true);
			// calculate and store amount here
		}
	}

	public function create_referral_record($referrer_id, $user_id) {
        $post_id = wp_insert_post([
            'post_title' => 'Referral by ' . $referrer_id . ' of ' . $user_id,
            'post_status' => 'publish',
            'post_type' => 'referral',
        ]);

        if ($post_id) {
            update_post_meta($post_id, 'referrer_id', $referrer_id);
            update_post_meta($post_id, 'user_id', $user_id);
            update_post_meta($post_id, 'converted', false);
            return $post_id;
        }
        return false;
    }

	public function maybe_create_user( $args ) {
		if ( ! isset( $args['email'] ) || empty( $args['email'] ) ) {
			return new WP_Error( 'email_required', __('Email is required.', 'site-core') );
		}
	
		$email = sanitize_email( $args['email'] );
	
		$user = get_user_by( 'email', $email );
	
		if ( $user ) {
			return $user->ID;
		} else {
			$userdata = array(
				'user_email'  => $email,
				'user_login'  => $email,
				'user_pass'   => wp_generate_password(),
				'first_name'  => isset( $args['first_name'] ) ? sanitize_text_field( $args['first_name'] ) : '',
				'last_name'   => isset( $args['last_name'] ) ? sanitize_text_field( $args['last_name'] ) : '',
				'role'        => $args['role'] ?? 'subscriber',
			);
	
			$user_id = wp_insert_user( $userdata );
	
			if ( is_wp_error( $user_id ) ) {
				return $user_id;
			}
	
			if ( isset( $args['meta_data'] ) && is_array( $args['meta_data'] ) ) {
				foreach ( $args['meta_data'] as $meta_key => $meta_value ) {
					update_user_meta( $user_id, sanitize_key( $meta_key ), maybe_serialize( $meta_value ) );
				}
			}
	
			return $user_id;
		}
	}
	
	
}
