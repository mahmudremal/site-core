<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Query;

class Template {
    use Singleton;

    protected $tables;

    protected function __construct() {
        // global $wpdb;
        // $this->tables = (object) array_merge((array) Ecommerce::get_instance()->get_tables(), [
        //     'thememenus' => $wpdb->prefix . 'sitecore_thememenus',
        // ]);
        add_action('wp_enqueue_scripts', [$this, 'wp_enqueue_scripts'], 0, 0);
        add_action('theme_header_menu_hook', [$this, 'theme_header_menu_hook']);
    }
    public function get_dynamic_mega_menu_items( $taxonomy_cat = 'sc_product_category', $taxonomy_tag = 'sc_product_tag', $max_main_items = 14 ) {
        $main_categories = get_terms([
            'number'     => $max_main_items,
            'taxonomy'   => $taxonomy_cat,
            'orderby'    => 'count',
            'order'      => 'DESC',
            'hide_empty' => true,
            'parent'     => 0
        ]);

        $menu = [];

        foreach ( $main_categories as $main_cat ) {
            $sub_categories = get_terms([
                'parent'     => $main_cat->term_id,
                'taxonomy'   => $taxonomy_cat,
                'orderby'    => 'count',
                'order'      => 'DESC',
                'hide_empty' => true
            ]);

            $sub_items = [];

            foreach ( $sub_categories as $sub_cat ) {
                $sub_sub_items = get_terms([
                    'taxonomy'   => $taxonomy_tag,
                    'orderby'    => 'count',
                    'order'      => 'DESC',
                    'hide_empty' => true
                ]);

                $sub_sub_menu = [];
                if ( ! empty( $sub_sub_items ) && ! is_wp_error( $sub_sub_items ) ) {
                    foreach ( $sub_sub_items as $tag ) {
                        $sub_sub_menu[] = [
                            'link' => get_tag_link($tag->term_id),
                            'name' => $tag->name
                        ];
                    }
                }

                $sub_items[] = [
                    'link'     => get_term_link($sub_cat),
                    'name'     => $sub_cat->name,
                    'children' => $sub_sub_menu
                ];
            }

            $menu[] = [
                'link'     => get_term_link($main_cat),
                'name'     => $main_cat->name,
                'children' => $sub_items
            ];
        }

        return $menu;
    }

    public function get_dynamic_nav_menus_html() {
        ob_start();
        include WP_SITECORE_DIR_PATH . '\\templates\\theme\\template-parts\\nav-menus.php';
        return ob_get_clean();
    }

    public function wp_enqueue_scripts() {
        wp_enqueue_script('tailwind-cdn', 'https://cdn.tailwindcss.com/', array(), null, true);
        $tailwind_config = ['prefix' => 'xpo_'];
        $inline_script = 'window.tailwind = window.tailwind || {}; window.tailwind.config = ' . wp_json_encode( $tailwind_config ) . ';';
        wp_add_inline_script( 'tailwind-cdn', $inline_script );
    }
    
    function theme_header_menu_hook() {
        include WP_SITECORE_DIR_PATH . '\\templates\\theme\\template-parts\\nav-menus.php';
    }

    public function header_menu() {
        $custom_template = WP_SITECORE_DIR_PATH . '\\templates\\theme\\template-parts\\nav-menus.php';
        return $custom_template;
    }

    
}