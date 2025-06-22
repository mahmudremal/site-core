<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;
use WP_User;

class Finance {
	use Singleton;

	protected $table;

	protected function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . 'partnership_finance';
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
		register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
	}

	public function register_routes() {
		register_rest_route('sitecore/v1', '/finance/transactions', [
			'methods' => 'GET',
			'callback' => [$this, 'get_transactions'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/finance/transaction', [
			'methods' => 'POST',
			'callback' => [$this, 'add_transaction_api'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/finance/balance/(?P<user_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_balance'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/finance/account', [
			'methods' => 'GET',
			'callback' => [$this, 'get_account'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'finance/')) {
            $abilities[] = 'finance';
        }
        return $abilities;
    }
    
	public function register_activation_hook() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT(20) UNSIGNED NOT NULL,
			amount DECIMAL(10,2) NOT NULL,
			type ENUM('credit', 'debit') NOT NULL,
			reference VARCHAR(255),
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id)
		) $charset_collate;";
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta($sql);
	}

	public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->table}");
    }

	public function add_transaction_api(WP_REST_Request $request) {
		$user_id = absint($request->get_param('user_id'));
		$amount = floatval($request->get_param('amount'));
		$type = $request->get_param('type');
		$reference = sanitize_text_field($request->get_param('reference'));
		$description = sanitize_textarea_field($request->get_param('description'));
	
		$response = $this->add_transaction($user_id, $amount, $type, $reference, $description);
	
		return rest_ensure_response($response);
	}

	public function add_transaction($user_id, $amount, $type, $reference, $description) {
		global $wpdb;
	
		// Validate transaction type
		if (!in_array($type, ['credit', 'debit'])) {
			return new WP_Error('invalid_type', 'Invalid transaction type', ['status' => 400]);
		}
		
		// Validate amount
		if ($amount <= 0) {
			return new WP_Error('invalid_amount', 'Amount must be positive', ['status' => 400]);
		}
	
		// Adjust amount based on transaction type
		$adjusted_amount = $type === 'debit' ? -$amount : $amount;
		$previous_balance = floatval(get_user_meta($user_id, '_finance_balance', true));
		$new_balance = $previous_balance + $adjusted_amount;
	
		// Update user balance
		update_user_meta($user_id, '_finance_balance', $new_balance);
	
		// Record the transaction
		$wpdb->insert($this->table, [
			'user_id' => $user_id,
			'amount' => $amount,
			'type' => $type,
			'reference' => $reference,
			'description' => $description,
			'created_at' => current_time('mysql'),
		]);
	
		return ['status' => 'success', 'new_balance' => $new_balance];
	}

	public function get_transactions(WP_REST_Request $request) {
		global $wpdb;
		$user_id = absint($request->get_param('user_id'));
		$per_page = absint($request->get_param('limit')) ?: 20;

        $total_items = $wpdb->get_var($wpdb->prepare("SELECT COUNT(id) FROM {$this->table} WHERE user_id = %d", $user_id));
		
		$results = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->table} WHERE user_id = %d ORDER BY created_at DESC LIMIT %d", $user_id, $per_page), ARRAY_A);

		$response = rest_ensure_response($results);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) ceil($total_items / $per_page));
    
        return $response;
	}

	public function get_balance(WP_REST_Request $request) {
		$user_id = absint($request->get_param('user_id'));
		$balance = get_user_meta($user_id, '_finance_balance', true);
		return rest_ensure_response(['user_id' => $user_id, 'balance' => floatval($balance)]);
	}
	public function get_account(WP_REST_Request $request) {
		$user_id = Security::get_instance()->user_id;
		
		$minimum_withdraw = 500;
		
		$balance = (float) get_user_meta($user_id, '_finance_balance', true);
		$payments_to_date = 0;
		$referral_earn = 0;
		$withdrawable = $balance >= $minimum_withdraw ? $balance : 0;
		return rest_ensure_response([
			'balance' => $balance,
			'withdrawable' => $withdrawable,
			'referral_earn' => $referral_earn,
			'payments_to_date' => $payments_to_date,
			'minimum_withdraw' => $minimum_withdraw
		]);
	}
}
