<?php
/**
 * Error handling class
 * Will be used to store error data.
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;
use WPDB;

class Sms {
    use Singleton;
    
    protected $tables;
    protected $api_url = 'https://api.bdbulksms.net/api.php';
    protected $api_general_url = 'https://api.bdbulksms.net/g_api.php';
    
    public function __construct() {
        $this->setup_hooks();
        global $wpdb;
        $this->tables = (object) [
            'messages' => $wpdb->prefix . 'sitecore_sms_messages',
        ];
        $this->init_filters();
    }
    
    protected function setup_hooks() {
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        register_activation_hook( WP_SITECORE__FILE__, [$this, 'register_activation_hook'] );
        register_deactivation_hook( WP_SITECORE__FILE__, [$this, 'register_deactivation_hook'] );
    }
    
    protected function init_filters() {
        add_filter('sitecore/sms/send', [$this, 'send_sms'], 10, 3);
        add_filter('sitecore/sms/balance', [$this, 'get_balance'], 10, 1);
        add_filter('sitecore/sms/rate', [$this, 'get_rate'], 10, 1);
        add_filter('sitecore/sms/expiry', [$this, 'get_expiry'], 10, 1);
        add_filter('sitecore/sms/token_stats', [$this, 'get_token_stats'], 10, 1);
        add_filter('sitecore/sms/total_stats', [$this, 'get_total_stats'], 10, 1);
        add_filter('sitecore/sms/monthly_stats', [$this, 'get_monthly_stats'], 10, 2);
        add_filter('sitecore/sms/token_monthly_stats', [$this, 'get_token_monthly_stats'], 10, 2);
        add_filter('sitecore/sms/all_stats', [$this, 'get_all_stats'], 10, 2);
        add_filter('sitecore/sms/send_bulk', [$this, 'send_bulk_sms'], 10, 3);
        add_filter('sitecore/sms/get_messages', [$this, 'get_messages'], 10, 2);
        add_filter('sitecore/sms/delete_message', [$this, 'delete_message'], 10, 1);
    }
    
    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        $tableSchemas = [
            'messages' => "id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                recipient VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                sms_type VARCHAR(50) DEFAULT 'general',
                status VARCHAR(20) DEFAULT 'pending',
                response_data TEXT,
                token_used VARCHAR(100),
                api_response TEXT,
                sent_at DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
        ];
        
        foreach ($tableSchemas as $tableKey => $schema) {
            $tableName = $this->tables->$tableKey;
            dbDelta("CREATE TABLE IF NOT EXISTS {$tableName} ({$schema}) $charset_collate;");
        }
    }
    
    public function register_deactivation_hook() {
        global $wpdb;
        foreach ((array) $this->tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS {$table}");
        }
    }

    public function settings($args) {
		$args['sms']		= [
			'title'							=> __('SMS', 'site-core'),
			'description'					=> sprintf(__('Automation sms notifications for wordpress that will automate some common notification work flows on wordpress with external %s greenweb SMS portal %s.', 'site-core'), '<a href="https://sms.greenweb.com.bd/index.php" target="_blank">', '</a>'),
			'fields'						=> [
				[
					'id' 					=> 'sms-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the SMS notification activity.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
                [
					'id' 					=> 'sms-token',
					'label'					=> __('Token', 'site-core'),
					'description'			=> __('SMS Token key', 'site-core'),
					'type'					=> 'password',
					'default'				=> '1261611592917580023692f947891a2252e914448316e1b08a837'
				],
                [
					'id' 					=> 'sms-header',
					'label'					=> __('SMS Header', 'site-core'),
					'description'			=> __('SMS Header (Company name).', 'site-core'),
					'type'					=> 'text',
					'default'				=> '[Moonlit Meadow]'
				],
			]
		];
        return $args;
    }
    
    public function send_sms($to, $message, $args = []) {
        if (apply_filters('pm_project/system/isactive', 'sms-paused')) return;
        $defaults = [
            'token' => apply_filters('pm_project/system/getoption', 'sms-token', false),
            'sms_type' => 'general',
            'save_to_db' => true,
        ];
        
        $args = wp_parse_args($args, $defaults);
        
        if (empty($args['token'])) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $data = [
            'to' => $to,
            'message' => $message,
            'token' => $args['token']
        ];
        
        $response = wp_remote_request($this->api_url . '?json', [
            'method' => 'POST',
            'body' => $data,
            'timeout' => 30,
            'sslverify' => false,
        ]);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if ($args['save_to_db']) {
            $this->save_message_to_db($to, $message, $args['sms_type'], $result, $args['token']);
        }
        
        return $result;
    }
    
    public function send_bulk_sms($recipients, $message, $args = []) {
        if (apply_filters('pm_project/system/isactive', 'sms-paused')) return;
        $defaults = [
            'token' => apply_filters('pm_project/system/getoption', 'sms-token', false),
            'sms_type' => 'bulk',
            'save_to_db' => true,
        ];
        
        $args = wp_parse_args($args, $defaults);
        
        if (empty($args['token'])) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        if (is_array($recipients)) {
            $to = implode(',', $recipients);
        } else {
            $to = $recipients;
        }
        
        return $this->send_sms($to, $message, $args);
    }
    
    public function get_balance($token = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&balance&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_rate($token = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&rate&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_expiry($token = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&expiry&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_token_stats($token = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&tokensms&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_total_stats($token = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&totalsms&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_monthly_stats($token = '', $month = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&monthlysms';
        
        if (!empty($month)) {
            $url .= '=' . $month;
        }
        
        $url .= '&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_token_monthly_stats($token = '', $month = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&tokenmonthlysms';
        
        if (!empty($month)) {
            $url .= '=' . $month;
        }
        
        $url .= '&json';
        
        return $this->make_api_request($url);
    }
    
    public function get_all_stats($token = '', $month = '') {
        if (empty($token)) {
            $token = apply_filters('pm_project/system/getoption', 'sms-token', false);
        }
        
        if (empty($token)) {
            return new WP_Error('no_token', 'SMS token is required');
        }
        
        $url = $this->api_general_url . '?token=' . $token . '&balance&expiry&rate&tokensms&totalsms&monthlysms&tokenmonthlysms';
        
        if (!empty($month)) {
            $url = str_replace('&monthlysms', '&monthlysms=' . $month, $url);
            $url = str_replace('&tokenmonthlysms', '&tokenmonthlysms=' . $month, $url);
        }
        
        $url .= '&json';
        
        return $this->make_api_request($url);
    }
    
    protected function make_api_request($url) {
        $response = wp_remote_get($url, [
            'timeout' => 30,
            'sslverify' => false,
        ]);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $body;
        }
        
        return $result;
    }
    
    protected function save_message_to_db($recipient, $message, $sms_type, $api_response, $token) {
        global $wpdb;
        
        $status = 'failed';
        $sent_at = null;
        
        if (is_array($api_response)) {
            foreach ($api_response as $result) {
                if (isset($result['status']) && $result['status'] === 'SENT') {
                    $status = 'sent';
                    $sent_at = current_time('mysql');
                    break;
                }
            }
        }
        
        $wpdb->insert(
            $this->tables->messages,
            [
                'recipient' => $recipient,
                'message' => $message,
                'sms_type' => $sms_type,
                'status' => $status,
                'response_data' => maybe_serialize($api_response),
                'token_used' => $token,
                'api_response' => is_array($api_response) ? json_encode($api_response) : $api_response,
                'sent_at' => $sent_at,
                'created_at' => current_time('mysql')
            ],
            [
                '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
            ]
        );
        
        return $wpdb->insert_id;
    }
    
    public function get_messages($limit = 50, $args = []) {
        global $wpdb;
        
        $defaults = [
            'status' => '',
            'sms_type' => '',
            'date_from' => '',
            'date_to' => '',
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        ];
        
        $args = wp_parse_args($args, $defaults);
        
        $where = "WHERE 1=1";
        $where_values = [];
        
        if (!empty($args['status'])) {
            $where .= " AND status = %s";
            $where_values[] = $args['status'];
        }
        
        if (!empty($args['sms_type'])) {
            $where .= " AND sms_type = %s";
            $where_values[] = $args['sms_type'];
        }
        
        if (!empty($args['date_from'])) {
            $where .= " AND created_at >= %s";
            $where_values[] = $args['date_from'];
        }
        
        if (!empty($args['date_to'])) {
            $where .= " AND created_at <= %s";
            $where_values[] = $args['date_to'];
        }
        
        $orderby = sanitize_sql_orderby($args['orderby'] . ' ' . $args['order']);
        if (!$orderby) {
            $orderby = 'created_at DESC';
        }
        
        $where_values[] = (int) $args['offset'];
        $where_values[] = (int) $limit;
        
        $sql = "SELECT * FROM {$this->tables->messages} {$where} ORDER BY {$orderby} LIMIT %d, %d";
        
        if (!empty($where_values)) {
            $sql = $wpdb->prepare($sql, $where_values);
        }
        
        $results = $wpdb->get_results($sql);
        
        foreach ($results as &$result) {
            $result->response_data = maybe_unserialize($result->response_data);
        }
        
        return $results;
    }
    
    public function delete_message($message_id) {
        global $wpdb;
        
        $result = $wpdb->delete(
            $this->tables->messages,
            ['id' => $message_id],
            ['%d']
        );
        
        return $result !== false;
    }
    
    public static function get_message_types() {
        return apply_filters('sitecore/sms/message_types', [
            'general' => 'General SMS',
            'order_notification' => 'Order Notification',
            'otp_verification' => 'OTP Verification',
            'promotional' => 'Promotional',
            'reminder' => 'Reminder',
            'alert' => 'Alert',
            'bulk' => 'Bulk SMS'
        ]);
    }
    

}








// // Send SMS
// $result = apply_filters('sitecore/sms/send', '+8801234567890', 'Hello World', [
//     'sms_type' => 'order_notification',
//     'token' => 'your_token_here'
// ]);

// // Send Bulk SMS
// $recipients = ['+8801234567890', '+8801234567891'];
// $result = apply_filters('sitecore/sms/send_bulk', $recipients, 'Bulk message');

// // Get Balance
// $balance = apply_filters('sitecore/sms/balance', 'your_token');

// // Get Messages with filters
// $messages = apply_filters('sitecore/sms/get_messages', 20, [
//     'status' => 'sent',
//     'sms_type' => 'order_notification'
// ]);
