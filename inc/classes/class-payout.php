<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Payout {
	use Singleton;
    
    protected $payout_table;
    
	protected function __construct() {
        global $wpdb;
        $this->payout_table = $wpdb->prefix . 'partnership_payouts';
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
	}
    public function register_routes() {
		register_rest_route('sitecore/v1', '/payouts', [
			'methods' => 'GET',
			'callback' => [$this, 'get_payouts'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payout/update', [
			'methods' => 'POST',
			'callback' => [$this, 'update_payout'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
		register_rest_route('sitecore/v1', '/payouts/(?P<payout_id>\d+)/(?P<payout_status>(pending|approved|declined))', [
			'methods' => 'POST',
			'callback' => [$this, 'update_payout_status'],
			'permission_callback' => [Security::get_instance(), 'permission_callback']
		]);
	}
    
    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'payouts/')) {
            $abilities[] = 'payouts';
        }
        return $abilities;
    }
    
    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $sql_table = "CREATE TABLE IF NOT EXISTS {$this->payout_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            user_id BIGINT NOT NULL,
            status ENUM('approved', 'declined', 'pending') DEFAULT 'pending',
            currency VARCHAR(50) DEFAULT 'USD',
            method VARCHAR(50) DEFAULT 'tap',
            amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
            account_id TEXT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            approved_at DATETIME NULL,
            approved_by INT NULL,
            comment TEXT NULL,
            PRIMARY KEY (id),
            UNIQUE(id)
        ) $charset_collate;";
        
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_table);
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->payout_table}");
    }

    public function get_payouts(WP_REST_Request $request) {
        global $wpdb;
    
        // Retrieve request parameters
        $page     = $request->get_param('page') ?: 1; // Default to page 1 if not provided
        $search   = $request->get_param('s');
        $status   = $request->get_param('status');
        $per_page = $request->get_param('per_page') ?: 10; // Default to 10 if not provided
    
        // Set the initial SQL query
        $sql = "SELECT * FROM {$this->payout_table} WHERE 1=1";
        $params = array();
    
        // Add search condition if provided
        if (!empty($search)) {
            $sql .= " AND (currency LIKE %s OR method LIKE %s OR comment LIKE %s)";
            $params[] = '%' . $wpdb->esc_like($search) . '%'; // For currency
            $params[] = '%' . $wpdb->esc_like($search) . '%'; // For method
            $params[] = '%' . $wpdb->esc_like($search) . '%'; // For comment
        }
    
        // Add status condition if provided
        if (!empty($status) && $status !== 'any') {
            $sql .= " AND status = %s";
            $params[] = $status; // For status
        }
    
        // Calculate offset for pagination
        $offset = ($page - 1) * $per_page;
    
        // Finalize the SQL query
        $sql .= " ORDER BY id ASC LIMIT %d, %d";
        $params[] = $offset;
        $params[] = $per_page;
    
        // Prepare the SQL query for execution
        $query = $wpdb->prepare($sql, $params);
    
        // Execute the query
        $payouts = $wpdb->get_results($query);
    
        // Get total count of records for pagination
        $count_sql = "SELECT COUNT(*) FROM {$this->payout_table} WHERE 1=1";
        if (!empty($search)) {
            $count_sql .= " AND (currency LIKE %s OR method LIKE %s OR comment LIKE %s)";
            // Prepare parameters for counts as well
            $count_params = array(
                '%' . $wpdb->esc_like($search) . '%',
                '%' . $wpdb->esc_like($search) . '%',
                '%' . $wpdb->esc_like($search) . '%',
            );
    
            if (!empty($status) && $status !== 'any') {
                $count_sql .= " AND status = %s";
                $count_params[] = $status; // Add status for count query
            }
    
            // Prepare the count SQL query
            $count_query = $wpdb->prepare($count_sql, $count_params);
            $total_payouts = $wpdb->get_var($count_query);
        } else {
            $total_payouts = $wpdb->get_var($count_sql);
        }
    
        $max_pages = ceil($total_payouts / $per_page);
    
        // Prepare response data
        $response_data = array();
        foreach ($payouts as $payout) {
            $response_data[] = (array) $payout;
        }
    
        // Prepare the response
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', $total_payouts);
        $response->header('X-WP-TotalPages', $max_pages);
    
        return $response;
    }

    public function get_payout(int $payout_id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$this->payout_table} WHERE id = %d LIMIT 1;",
            $payout_id
        ));
    }
    
	public function update_payout(WP_REST_Request $request) {
        global $wpdb;
        
        $user_id = Security::get_instance()->user_id;
        $payout_id = $request->get_param('payout_id');

        $status = $request->get_param('status') ?? 'pending';
        $currency = $request->get_param('currency') ?? 'AED';
        $method = $request->get_param('method') ?? 'bank';
        $amount = $request->get_param('amount') ?? 0;
        $comment = $request->get_param('comment') ?? '';
        $account_id = $request->get_param('account_id') ?? '';
        $approved_by = $request->get_param('approved_by');
    
        $data = [
            'user_id' => $user_id,
            'status' => $status,
            'currency' => $currency,
            'method' => $method,
            'amount' => $amount,
            'comment' => $comment,
            'account_id' => $account_id,
            'approved_by' => $approved_by,
            'created_at' => current_time('mysql')
        ];
    
        if (empty($payout_id) || !is_numeric($payout_id) || $payout_id <= 0) {
            $data['created_at'] = current_time('mysql');
            $wpdb->insert($this->payout_table, $data);
            $response = [
                'success' => true,
                'message' => 'Payout request created successfully.',
                'payout_id' => $wpdb->insert_id
            ];
        } else {
            $data['updated_at'] = current_time('mysql');
            $where = ['id' => $payout_id];
            $result = $wpdb->update($this->payout_table, $data, $where);
            if ($result !== false) {
                $response = [
                    'success' => true,
                    'message' => 'Payout request updated successfully.',
                    'payout_id' => $payout_id
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'No changes made or payout not found.',
                ];
            }
        }
    
        return rest_ensure_response($response);
    }

    public function update_payout_status(WP_REST_Request $request) {
        global $wpdb;
    
        $payout_id = (int) $request->get_param('payout_id');
        // $payout_status = $request->get_param('payout_status');
        $payout_status = 'pending';

        $_payout = $this->get_payout($payout_id);
        $_payout->amount = (float) $_payout->amount;
        
        $approved_by = Security::get_instance()->user_id;
    
        $data = [
            'status' => $payout_status,
            'updated_at' => current_time('mysql'),
        ];
        
        // If the status is 'approved', set additional fields
        if ($payout_status === 'approved') {
            $data['approved_at'] = current_time('mysql');
            $data['approved_by'] = $approved_by;
            // Payment execution logic can be added here
            $payload = [
                'payout' => (array) $_payout,
                // 
                'amount' => $_payout->amount,
                'currency' => $_payout->currency,
                'account_id' => $_payout->account_id,
                'description' => 'Payout to account ' . $_payout->account_id
            ];
            // Execute the payment using the appropriate method
            $_payment_executed = apply_filters('partnership/payment/payout', null, $payload, $_payout->method);
            if (is_wp_error($_payment_executed)) {
                return new WP_Error('payment_execution_error', $_payment_executed->get_error_message(), ['status' => 500]);
            }
            if (! $_payment_executed) {
                return new WP_Error('payment_execution_error', __('Failed to execute the payment.', 'site-core'), ['status' => 500]);
            }
        }

        $updated = $wpdb->update(
            $this->payout_table,
            $data,
            ['id' => $payout_id]
        );
    
        if ($updated === false) {
            return new WP_Error('database_update_error', __('Failed to update the payout status.', 'site-core'), ['status' => 500]);
        }
    
        // Return a success response
        return rest_ensure_response([
            'success' => true,
            'message' => __('Payout status updated successfully.', 'site-core'),
            'payout_id' => $payout_id,
            'new_status' => $payout_status,
        ]);
    }

}