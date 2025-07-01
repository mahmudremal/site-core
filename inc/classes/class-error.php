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
use WP_Error;
use WP_REST_Request;
use WPDB;

class Error {
    use Singleton;

    protected $table_name;

    protected function __construct() {
        $this->setup_hooks();
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'error_reports'; // Define the table for storing errors
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_error_reporting_endpoint']);
        // Register activation and deactivation hooks
        register_activation_hook( WP_SITECORE__FILE__, [$this, 'register_activation_hook'] );
        register_deactivation_hook( WP_SITECORE__FILE__, [$this, 'register_deactivation_hook'] );
    }

    public function register_activation_hook() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$this->table_name} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            error_subject VARCHAR(255) NOT NULL,
            error_message TEXT NOT NULL,
            error_platform VARCHAR(100) NOT NULL,
            status ENUM('unresolved', 'solved') DEFAULT 'unresolved',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $sql = "DROP TABLE IF EXISTS {$this->table_name};";
        $wpdb->query($sql);
    }

    public function register_error_reporting_endpoint() {
        register_rest_route('sitecore/v1', '/error/report', [
            'methods'  => 'POST',
            'callback' => [$this, 'handle_error_report'],
            'permission_callback' => '__return_true',
            'args' => [
                'error_subject' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function( $param ) {
                        return !empty( $param );
                    },
                    'description' => 'Short summary of the error',
                ],
                'error_message' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_textarea_field',
                    'validate_callback' => function( $param ) {
                        return !empty( $param );
                    },
                    'description' => 'Detailed error message',
                ],
                'error_platform' => [
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                    'description' => 'Platform where the error occurred',
                ]
            ]
        ]);
    }

    public function handle_error_report(WP_REST_Request $request) {
        $error_subject = sanitize_text_field($request->get_param('error_subject'));
        $error_message = sanitize_textarea_field($request->get_param('error_message'));
        $error_platform = sanitize_text_field($request->get_param('error_platform'));

        if (empty($error_subject) || empty($error_message)) {
            return new WP_Error('missing_fields', 'Error subject and message are required', ['status' => 400]);
        }

        // Check if this error already exists and is unresolved
        global $wpdb;
        $existing_error = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE error_subject = %s AND error_message = %s AND status = 'unresolved'",
                $error_subject, $error_message
            )
        );

        if ($existing_error) {
            return new WP_REST_Response('Duplicate error report. This error is already being reviewed.', 200);
        }

        // Insert new error report
        $wpdb->insert(
            $this->table_name,
            [
                'error_subject' => $error_subject,
                'error_message' => $error_message,
                'error_platform' => $error_platform,
                'created_at' => current_time('mysql'),
                'status' => 'unresolved'
            ]
        );

        return new WP_REST_Response('Error report submitted successfully.', 200);
    }
}
