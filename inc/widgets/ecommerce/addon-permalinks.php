<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Permalinks {
    use Singleton;

    protected function __construct() {
        add_filter('query_vars', [$this, 'query_vars']);
        add_action('init', [$this, 'add_rewrite_rules']);
        add_filter('template_include', [$this, 'template_include']);
    }
    
    public function add_rewrite_rules() {
        if (!apply_filters('pm_project/system/isactive', 'storefront-active')) {return;}
        // add_rewrite_rule( '^products/([^/]+)/?$', 'index.php?sf_product_slug=$matches[1]', 'top');
        add_rewrite_rule( '^carry/?$', 'index.php?sf_product_cart=1', 'top');
        add_rewrite_rule( '^checkout/?$', 'index.php?sf_product_checkout=1', 'top');
        add_rewrite_rule( '^my-bookmark/?$', 'index.php?sf_product_wishlist=1', 'top');
        add_rewrite_rule( '^order-confirmation/([^/]+)/?$', 'index.php?sf_order_confirmation=$matches[1]', 'top');
        add_rewrite_rule( '^orders/([^/]+)/?$', 'index.php?sf_orders_list=$matches[1]', 'top');
        // add_rewrite_rule( '^collections/([^/]+)/?$', 'index.php?sf_collections_list=$matches[1]', 'top');
    }
    public function query_vars($vars) {
        if (!apply_filters('pm_project/system/isactive', 'storefront-active')) {return $vars;}
        $vars[] = 'sf_product_slug';
        $vars[] = 'sf_product_cart';
        $vars[] = 'sf_product_checkout';
        $vars[] = 'sf_product_wishlist';
        $vars[] = 'sf_order_confirmation';
        $vars[] = 'sf_orders_list';
        $vars[] = 'sf_collections_list';
        return $vars;
    }

    public function template_include($template) {
        if (!apply_filters('pm_project/system/isactive', 'storefront-active')) {return $template;}
        // if (get_query_var('payment-status')) {
        //     $file = WP_SITECORE_DIR_PATH . '/templates/payment-status.php';
        //     return file_exists($file) ? $file : $template;
        // }
        return $template;
    }


}