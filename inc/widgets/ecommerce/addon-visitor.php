<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_Error;

class Visitor {
    use Singleton;

    protected function __construct() {
        add_action('init', [$this, 'manage_visitor_token']);
    }

    public function manage_visitor_token() {
        if (!isset($_COOKIE['x-visitor-token'])) {
            $token = bin2hex(random_bytes(32));
            setcookie('x-visitor-token', $token, time() + (86400 * 30), "/"); // 30 days
            $_COOKIE['x-visitor-token'] = $token;
        }
    }

    public function get_visitor_token() {
        return isset($_COOKIE['x-visitor-token']) ? $_COOKIE['x-visitor-token'] : null;
    }
}
