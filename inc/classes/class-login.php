<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Login {
    use Singleton;

    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        // Replace default login page with custom React component
        add_action('login_enqueue_scripts', [$this, 'enqueue_custom_login_assets']);
        add_action('login_head', [$this, 'add_custom_login_markup']);
        add_filter('login_headerurl', [$this, 'custom_login_logo_url']);
        add_filter('login_headertext', [$this, 'custom_login_logo_title']);
        
        // Hide default WordPress login form
        add_action('login_head', [$this, 'hide_default_login']);
        
        // Handle AJAX login/registration
        add_action('wp_ajax_custom_login', [$this, 'handle_ajax_login']);
        add_action('wp_ajax_nopriv_custom_login', [$this, 'handle_ajax_login']);
        add_action('wp_ajax_nopriv_custom_register', [$this, 'handle_ajax_register']);
		add_filter('sitecorejs/siteconfig', [ $this, 'siteConfig' ], 1, 1);
    }

    public function enqueue_custom_login_assets() {
        Assets::get_instance()->register_styles();
        Assets::get_instance()->register_scripts();
        wp_enqueue_style('site-core');
        wp_enqueue_script('site-core');
    }

    public function add_custom_login_markup() {
        echo '<div id="custom-login-root"></div>';
    }

    public function hide_default_login() {
        echo '<style>#login form, #login h1, .language-switcher, #nav, #backtoblog {display: none !important;}#custom-login-root input:not([type=checkbox]) {margin-bottom: 0;}body.login {background: #0f172a;}</style>';
    }

    public function custom_login_logo_url() {
        return home_url();
    }

    public function custom_login_logo_title() {
        return get_bloginfo('name');
    }

    public function handle_ajax_login() {
        check_ajax_referer('custom_login_nonce', 'nonce');

        $username = sanitize_user($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $remember = isset($_POST['remember']) && $_POST['remember'] === 'true';

        $creds = [
            'user_login'    => $username,
            'user_password' => $password,
            'remember'      => $remember
        ];

        $user = wp_signon($creds, is_ssl());

        if (is_wp_error($user)) {
            wp_send_json_error([
                'message' => $user->get_error_message()
            ]);
        } else {
            wp_send_json_success([
                'message' => 'Login successful',
                'redirect' => $_POST['redirect'] ?? admin_url()
            ]);
        }
    }

    public function handle_ajax_register() {
        check_ajax_referer('custom_login_nonce', 'nonce');

        // Check if registration is enabled
        if (!get_option('users_can_register')) {
            wp_send_json_error(['message' => 'Registration is currently disabled.']);
        }

        $username = sanitize_user($_POST['username'] ?? '');
        $email = sanitize_email($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Validate
        if (empty($username) || empty($email) || empty($password)) {
            wp_send_json_error(['message' => 'All fields are required.']);
        }

        if (!is_email($email)) {
            wp_send_json_error(['message' => 'Invalid email address.']);
        }

        // Create user
        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            wp_send_json_error(['message' => $user_id->get_error_message()]);
        } else {
            // Auto login after registration
            wp_set_current_user($user_id);
            wp_set_auth_cookie($user_id);
            
            wp_send_json_success([
                'message' => 'Registration successful',
                'redirect' => admin_url()
            ]);
        }
    }

    public function siteConfig($args) {
        if ($GLOBALS['pagenow'] !== 'wp-login.php') return $args;
        
		return wp_parse_args([
            'siteUrl' => home_url(),
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('custom_login_nonce'),
            'redirectUrl' => isset($_GET['redirect_to']) ? $_GET['redirect_to'] : admin_url(),
            'logoUrl' => get_site_icon_url() ?: '/favicon.ico',
            'siteName' => get_bloginfo('name'),
		], (array) $args);
	}
    
}