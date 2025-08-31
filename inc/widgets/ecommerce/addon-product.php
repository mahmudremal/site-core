<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;

class Product {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_shortcode('svg', [$this, 'svg_shortcode']);
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_taxonomies']);
        add_filter('template_include', [$this, 'template_include'], 1, 1);
    }

    public function register_post_types() {
        register_post_type('sc_product', [
            'labels' => [
                'name' => 'Products',
                'singular_name' => 'Product',
            ],
            'public' => true,
            'has_archive' => true,
            'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
            'show_in_rest' => true,
        ]);

        register_post_type('sc_variation', [
            'labels' => [
                'name' => 'Product Variations',
                'singular_name' => 'Product Variation',
            ],
            'public' => false,
            'supports' => ['title', 'custom-fields'],
            'show_in_rest' => false,
        ]);
    }

    public function register_taxonomies() {
        register_taxonomy('sc_product_category', 'sc_product', [
            'labels' => [
                'name' => 'Product Categories',
                'singular_name' => 'Product Category',
            ],
            'hierarchical' => true,
            'public' => true,
            'show_in_rest' => true,
        ]);

        register_taxonomy('sc_product_tag', 'sc_product', [
            'labels' => [
                'name' => 'Product Tags',
                'singular_name' => 'Product Tag',
            ],
            'hierarchical' => false,
            'public' => true,
            'show_in_rest' => true,
        ]);
    }

    public function get_product($product_id) {
        $product = (object) wp_parse_args(get_post($product_id), [
            'id' => 1,
            'sale' => null,
            'clearance' => null,
            'price' => 123,
            // ...
        ]);
        return $product;
        // this is basic now but later i'll implement functions here.
    }

    public function add_product_meta($product_id, $meta_key, $meta_value) {
        global $wpdb;
        return $wpdb->insert($this->tables->products_meta, [
            'product_id' => $product_id,
            'meta_key' => $meta_key,
            'meta_value' => maybe_serialize($meta_value),
        ]);
    }

    public function get_product_meta($product_id, $meta_key = '') {
        global $wpdb;
        if ($meta_key) {
            return maybe_unserialize($wpdb->get_var($wpdb->prepare(
                "SELECT meta_value FROM {$this->tables->products_meta} WHERE product_id = %d AND meta_key = %s ORDER BY id DESC LIMIT 1",
                $product_id, $meta_key
            )));
        }
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$this->tables->products_meta} WHERE product_id = %d",
            $product_id
        ), ARRAY_A);
        $meta = [];
        foreach ($results as $row) {
            $meta[$row['meta_key']] = maybe_unserialize($row['meta_value']);
        }
        return $meta;
    }

    public function update_product_meta($product_id, $meta_key, $meta_value) {
        global $wpdb;
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$this->tables->products_meta} WHERE product_id = %d AND meta_key = %s",
            $product_id, $meta_key
        ));
        
        if ($existing) {
            return $wpdb->update($this->tables->products_meta,
                ['meta_value' => maybe_serialize($meta_value), 'updated_at' => current_time('mysql')],
                ['product_id' => $product_id, 'meta_key' => $meta_key]
            );
        }
        return $this->add_product_meta($product_id, $meta_key, $meta_value);
    }

    public function delete_product_meta($product_id, $meta_key) {
        global $wpdb;
        return $wpdb->delete($this->tables->products_meta, [
            'product_id' => $product_id,
            'meta_key' => $meta_key,
        ]);
    }

    public function get_product_price($product_id, $variation_id = null) {
        if ($variation_id) {
            $price = $this->get_product_meta($variation_id, 'price');
            if ($price) return (float) $price;
        }
        return (float) $this->get_product_meta($product_id, 'price') ?: 0;
    }

    public function get_product_variations($product_id) {
        return get_posts([
            'post_type' => 'sc_variation',
            'post_parent' => $product_id,
            'post_status' => 'publish',
            'numberposts' => -1,
        ]);
    }

    public function create_product_variation($product_id, $variation_data) {
        $variation_id = wp_insert_post([
            'post_type' => 'sc_variation',
            'post_parent' => $product_id,
            'post_title' => $variation_data['title'],
            'post_status' => 'publish',
        ]);

        if ($variation_id && !is_wp_error($variation_id)) {
            if(isset($variation_data['meta']) && is_array($variation_data['meta'])) {
                foreach ($variation_data['meta'] as $key => $value) {
                    $this->add_product_meta($variation_id, $key, $value);
                }
            }
		}
	}

    public function template_include( $template ) {
        if ( is_singular('sc_product') ) {
            $custom_template = WP_SITECORE_DIR_PATH . '\\templates\\theme\\single-sc_product.php';
            return $custom_template;
        }
        if ( is_tax('sc_product_category') ) {
            $custom_template = WP_SITECORE_DIR_PATH . '\\templates\\theme\\taxonomy-sc_product_category.php';
            return $custom_template;
        }
        if ( is_tax('sc_product_tag') ) {
            $custom_template = WP_SITECORE_DIR_PATH . '\\templates\\theme\\taxonomy-sc_product_tag.php';
            return $custom_template;
        }
        return $template;
    }

    public function svg_shortcode( $args ) {
        $args = (object) wp_parse_args($args, [
            'icon' => null,
            'size' => 20,
        ]);
        if (!$args->icon) return;
        $svgs = [
            'star-filled' => '<svg fill="#000000" width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><rect id="Icons" x="-512" y="-192" width="1280" height="800" style="fill:none;"/><g id="Icons1" serif:id="Icons"><g id="Strike"></g><g id="H1"></g><g id="H2"></g><g id="H3"></g><g id="list-ul"></g><g id="hamburger-1"></g><g id="hamburger-2"></g><g id="list-ol"></g><g id="list-task"></g><g id="trash"></g><g id="vertical-menu"></g><g id="horizontal-menu"></g><g id="sidebar-2"></g><g id="Pen"></g><g id="Pen1" serif:id="Pen"></g><g id="clock"></g><g id="external-link"></g><g id="hr"></g><g id="info"></g><g id="warning"></g><g id="plus-circle"></g><g id="minus-circle"></g><g id="vue"></g><g id="cog"></g><g id="logo"></g><path id="star" d="M32.001,9.188l5.666,17.438l18.335,0l-14.833,10.777l5.666,17.438l-14.834,-10.777l-14.833,10.777l5.666,-17.438l-14.834,-10.777l18.335,0l5.666,-17.438Z"/><g id="radio-check"></g><g id="eye-slash"></g><g id="eye"></g><g id="toggle-off"></g><g id="shredder"></g><g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"></g><g id="react"></g><g id="check-selected"></g><g id="turn-off"></g><g id="code-block"></g><g id="user"></g><g id="coffee-bean"></g><g id="coffee-beans"><g id="coffee-bean1" serif:id="coffee-bean"></g></g><g id="coffee-bean-filled"></g><g id="coffee-beans-filled"><g id="coffee-bean2" serif:id="coffee-bean"></g></g><g id="clipboard"></g><g id="clipboard-paste"></g><g id="clipboard-copy"></g><g id="Layer1"></g></g></svg>',
            'start-half' => '<svg fill="#000000" width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><g transform="matrix(1,0,0,1,-1152,-192)"><rect id="Icons" x="0" y="0" width="1280" height="800" style="fill:none;"/><g id="Icons1" serif:id="Icons"><g id="Strike"></g><g id="H1"></g><g id="H2"></g><g id="H3"></g><g id="list-ul"></g><g id="hamburger-1"></g><g id="hamburger-2"></g><g id="list-ol"></g><g id="list-task"></g><g id="trash"></g><g id="vertical-menu"></g><g id="horizontal-menu"></g><g id="sidebar-2"></g><g id="Pen"></g><g id="Pen1" serif:id="Pen"></g><g id="clock"></g><g id="external-link"></g><g id="hr"></g><g id="info"></g><g id="warning"></g><g id="plus-circle"></g><g id="minus-circle"></g><g id="vue"></g><g id="cog"></g><g id="logo"></g><g id="star-empty" transform="matrix(1.05152,0,0,1.05152,460.558,-59.6026)"><path d="M693.388,264.584L710.825,264.584L696.719,274.833L702.107,291.416L688,281.167L673.893,291.416L679.281,274.833L665.175,264.584L682.612,264.584L688,248C689.796,253.528 691.592,259.056 693.388,264.584ZM688,260.391L688,276.434L694.824,281.392L692.217,273.37L699.041,268.413L690.606,268.413L688,260.391Z" style="fill-rule:nonzero;"/></g><g id="radio-check"></g><g id="eye-slash"></g><g id="eye"></g><g id="toggle-off"></g><g id="shredder"></g><g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"></g><g id="react"></g><g id="check-selected"></g><g id="turn-off"></g><g id="code-block"></g><g id="user"></g><g id="coffee-bean"></g><g transform="matrix(0.638317,0.368532,-0.368532,0.638317,785.021,-208.975)"><g id="coffee-beans"><g id="coffee-bean1" serif:id="coffee-bean"></g></g></g><g id="coffee-bean-filled"></g><g transform="matrix(0.638317,0.368532,-0.368532,0.638317,913.062,-208.975)"><g id="coffee-beans-filled"><g id="coffee-bean2" serif:id="coffee-bean"></g></g></g><g id="clipboard"></g><g transform="matrix(1,0,0,1,128.011,1.35415)"><g id="clipboard-paste"></g></g><g id="clipboard-copy"></g><g id="Layer1"></g></g></g></svg>',
            'start-blank' => '<svg fill="#000000" width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"><rect id="Icons" x="-448" y="-192" width="1280" height="800" style="fill:none;"/><g id="Icons1" serif:id="Icons"><g id="Strike"></g><g id="H1"></g><g id="H2"></g><g id="H3"></g><g id="list-ul"></g><g id="hamburger-1"></g><g id="hamburger-2"></g><g id="list-ol"></g><g id="list-task"></g><g id="trash"></g><g id="vertical-menu"></g><g id="horizontal-menu"></g><g id="sidebar-2"></g><g id="Pen"></g><g id="Pen1" serif:id="Pen"></g><g id="clock"></g><g id="external-link"></g><g id="hr"></g><g id="info"></g><g id="warning"></g><g id="plus-circle"></g><g id="minus-circle"></g><g id="vue"></g><g id="cog"></g><g id="logo"></g><path id="star-empty" d="M37.675,26.643l18.335,0l-14.834,10.777l5.666,17.438l-14.833,-10.777l-14.834,10.777l5.666,-17.438l-14.833,-10.777l18.335,0l5.666,-17.438c1.888,5.813 3.777,11.625 5.666,17.438Zm-8.407,4.026l-8.869,0l7.175,5.213l-2.74,8.435l7.175,-5.213l7.175,5.213l-2.741,-8.435l7.175,-5.213l-8.869,0l-2.74,-8.434c-0.914,2.811 -1.827,5.623 -2.741,8.434Z" style="fill-rule:nonzero;"/><g id="radio-check"></g><g id="eye-slash"></g><g id="eye"></g><g id="toggle-off"></g><g id="shredder"></g><g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"></g><g id="react"></g><g id="check-selected"></g><g id="turn-off"></g><g id="code-block"></g><g id="user"></g><g id="coffee-bean"></g><g id="coffee-beans"><g id="coffee-bean1" serif:id="coffee-bean"></g></g><g id="coffee-bean-filled"></g><g id="coffee-beans-filled"><g id="coffee-bean2" serif:id="coffee-bean"></g></g><g id="clipboard"></g><g id="clipboard-paste"></g><g id="clipboard-copy"></g><g id="Layer1"></g></g></svg>',
            'arrow-left' => '<svg width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H10.75V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12Z" fill="#1C274C"/><path d="M10.75 18C10.75 18.3034 10.5673 18.5768 10.287 18.6929C10.0068 18.809 9.68417 18.7449 9.46967 18.5304L3.46967 12.5304C3.32902 12.3897 3.25 12.1989 3.25 12C3.25 11.8011 3.32902 11.6103 3.46967 11.4697L9.46967 5.46969C9.68417 5.25519 10.0068 5.19103 10.287 5.30711C10.5673 5.4232 10.75 5.69668 10.75 6.00002V18Z" fill="#1C274C"/></svg>',
            'arrow-right' => '<svg width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H13.25V12.75H4C3.58579 12.75 3.25 12.4142 3.25 12Z" fill="#1C274C"/><path d="M13.25 12.75V18C13.25 18.3034 13.4327 18.5768 13.713 18.6929C13.9932 18.809 14.3158 18.7449 14.5303 18.5304L20.5303 12.5304C20.671 12.3897 20.75 12.1989 20.75 12C20.75 11.8011 20.671 11.6103 20.5303 11.4697L14.5303 5.46969C14.3158 5.25519 13.9932 5.19103 13.713 5.30711C13.4327 5.4232 13.25 5.69668 13.25 6.00002V11.25V12.75Z" fill="#1C274C"/></svg>',
            'arrow-down' => '<svg width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M12 3.25C12.4142 3.25 12.75 3.58579 12.75 4L12.75 13.25H11.25L11.25 4C11.25 3.58579 11.5858 3.25 12 3.25Z" fill="#1C274C"/><path d="M6.00002 13.25C5.69667 13.25 5.4232 13.4327 5.30711 13.713C5.19103 13.9932 5.25519 14.3158 5.46969 14.5303L11.4697 20.5303C11.6103 20.671 11.8011 20.75 12 20.75C12.1989 20.75 12.3897 20.671 12.5304 20.5303L18.5304 14.5303C18.7449 14.3158 18.809 13.9932 18.6929 13.713C18.5768 13.4327 18.3034 13.25 18 13.25L6.00002 13.25Z" fill="#1C274C"/></svg>',
            'arrow-up' => '<svg width="'.$args->size.'px" height="'.$args->size.'px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="M12 20.75C12.4142 20.75 12.75 20.4142 12.75 20L12.75 10.75L11.25 10.75L11.25 20C11.25 20.4142 11.5858 20.75 12 20.75Z" fill="#1C274C"/><path d="M6.00002 10.75C5.69667 10.75 5.4232 10.5673 5.30711 10.287C5.19103 10.0068 5.25519 9.68417 5.46969 9.46967L11.4697 3.46967C11.6103 3.32902 11.8011 3.25 12 3.25C12.1989 3.25 12.3897 3.32902 12.5304 3.46967L18.5304 9.46967C18.7449 9.68417 18.809 10.0068 18.6929 10.287C18.5768 10.5673 18.3034 10.75 18 10.75L6.00002 10.75Z" fill="#1C274C"/></svg>',
        ];
        return $svgs[$args->icon] ?? null;
    }
    
}