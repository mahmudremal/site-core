<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Request;
use WP_Query;
use WP_Error;

class Product {
    use Singleton;

    protected $cache;
    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();
        $this->cache = (object) [
            'product_tts' => 43200, // 12 hours
            'views_tts' => 3600, // 1 hour
        ];

        add_shortcode('svg', [$this, 'svg_shortcode']);
        add_action('init', [$this, 'register_post_types']);
        add_action('init', [$this, 'register_taxonomies']);
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('template_include', [$this, 'template_include'], 1, 1);
        
        add_action('wp_ajax_create_sc_product', [$this, 'handle_create_sc_product']);
        add_action('wp_ajax_nopriv_create_sc_product', [$this, 'handle_create_sc_product']);
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
            'rewrite' => ['slug' => 'products'],
            'menu_icon' => 'dashicons-products',
            'show_in_rest' => true,
        ]);

        register_post_type('sc_variation', [
            'labels' => [
                'name' => 'Product Variations',
                'singular_name' => 'Product Variation',
            ],
            'public' => false,
            'supports' => ['title', 'custom-fields'],
            'menu_icon' => 'dashicons-category',
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
            'rewrite' => ['slug' => 'collections'],
        ]);

        register_taxonomy('sc_product_tag', 'sc_product', [
            'labels' => [
                'name' => 'Product Tags',
                'singular_name' => 'Product Tag',
            ],
            'hierarchical' => false,
            'public' => true,
            'show_in_rest' => true,
            'rewrite' => ['slug' => 'collections-tags'],
        ]);
    }

    public function register_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/products', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_products'],
			'permission_callback' => '__return_true',
		]);
        register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_slug>[^/]+)', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_detailed'],
			'permission_callback' => '__return_true',
		]);
        register_rest_route('sitecore/v1', '/ecommerce/products/(?P<product_slug>[^/]+)/related', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_product_related'],
			'permission_callback' => '__return_true',
		]);
        register_rest_route('sitecore/v1', '/ecommerce/categories', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_categories_list'],
			'permission_callback' => '__return_true',
		]);
    }

    public function get_product_views($product_id) {
        $_cache = apply_filters('sitecore/redis/get', 'product.views.' . $product_id, null);
        if ($_cache) return $_cache;
        $_product_views = $this->get_product_meta($product_id, 'views', true) || 0;
        $stored = apply_filters('sitecore/redis/set', 'product.' . $product_id, $_product_views, $this->cache->views_tts);
        return $_product_views;
    }
    

    public function get_product($product_id) {
        $_cache = apply_filters('sitecore/redis/get', 'product.' . $product_id, null);
        if ($_cache) return $_cache;
        $product = [
            'id' => $product_id,
            'title' => get_the_title($product_id),
            'content' => get_the_content($product_id),
            'excerpt' => get_the_excerpt($product_id),
            'date' => get_the_date('', $product_id),
            'slug' => get_post_field('post_name', $product_id),
            'link' => get_the_permalink($product_id),
            'featured_image' => get_the_post_thumbnail_url($product_id, 'full'),
            // 'thumbnail'   => get_the_post_thumbnail_url($product_id, 'large'),
            // 'description' => get_the_content($product_id),
            'metadata' => $this->get_product_meta($product_id),
            // 'taxonomies' => [
            //     'sc_product_category' => wp_get_post_terms($product_id, 'sc_product_category', ['fields' => 'all']),
            //     'sc_product_tag' => wp_get_post_terms($product_id, 'sc_product_tag', ['fields' => 'all']),
            // ],
            'categories'  => wp_get_post_terms($product_id, 'sc_product_category', ['fields' => 'all']),
            'tags'        => wp_get_post_terms($product_id, 'sc_product_tag', ['fields' => 'all']),
            'variations'  => $this->get_product_variations($product_id),
        ];
        foreach ($product['metadata'] as $key => $value) {
            $product['metadata'][$key] = maybe_unserialize($value);
        }
        $product['featured_image'] = 'https://core.agency.local/wp-content/uploads/sites/5/2025/09/photo-by-pixabay.jpeg';
        $product['metadata']['gallery'] = [
            ['url' => 'https://core.agency.local/wp-content/uploads/sites/5/2025/09/photo-by-junior-teixeira.jpeg'],
            ['url' => 'https://core.agency.local/wp-content/uploads/sites/5/2025/09/photo-by-staci.jpeg'],
            ['url' => 'https://core.agency.local/wp-content/uploads/sites/5/2025/09/photo-by-life-of-pix.jpg'],
        ];
        $stored = apply_filters('sitecore/redis/set', 'product.' . $product_id, $product, $this->cache->product_tts);
        return $product;
    }

    public function add_product_meta($product_id, $meta_key, $meta_value) {
        global $wpdb;
        // return $wpdb->insert($this->tables->products_meta, [
        //     'product_id' => $product_id,
        //     'meta_key' => $meta_key,
        //     'meta_value' => maybe_serialize($meta_value),
        // ]);
        return add_post_meta($product_id, 'sc_' . $meta_key, $meta_value);
    }

    public function get_product_meta($product_id, $meta_key = '', $is_single = true) {
        global $wpdb;
        // if (!empty($meta_key)) {
        //     return maybe_unserialize(
        //         $wpdb->get_var(
        //             $wpdb->prepare("SELECT meta_value FROM {$this->tables->products_meta} WHERE product_id = %d AND meta_key = %s ORDER BY id DESC LIMIT 1", $product_id, $meta_key)
        //         )
        //     );
        // }
        // $results = $wpdb->get_results($wpdb->prepare("SELECT meta_key, meta_value FROM {$this->tables->products_meta} WHERE product_id = %d", $product_id), ARRAY_A);
        // $meta = [];
        // foreach ($results as $row) {
        //     $meta[$row['meta_key']] = maybe_unserialize($row['meta_value']);
        // }
        // return $meta;

        
        // if (empty($meta_key)) {
        //     $results = $wpdb->get_results($wpdb->prepare("SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s", $product_id, 'sc_%%'), ARRAY_A);
        //     $meta = [];
        //     foreach ($results as $row) {
        //         $meta[substr($row['meta_key'], 3)] = maybe_unserialize($row['meta_value']);
        //     }
        //     return $meta;
        // }
        $metas = get_post_meta($product_id, $meta_key, $is_single);
        if (empty($meta_key)) {
            $filtered = array_filter($metas, fn($key) => substr($key, 0, 3) === 'sc_', ARRAY_FILTER_USE_KEY);
            $newMetadata = array_reduce(
                array_keys($filtered),
                function($carry, $key) use ($filtered) {
                    $unserialized = maybe_unserialize($filtered[$key][0]);
                    $carry[substr($key, 3)] = $unserialized;
                    return $carry;
                },
                []
            );
            return $newMetadata;
        }
        return $metas;
    }

    public function update_product_meta($product_id, $meta_key, $meta_value, $prev_value = null) {
        global $wpdb;
        // $existing = $wpdb->get_var($wpdb->prepare(
        //     "SELECT id FROM {$this->tables->products_meta} WHERE product_id = %d AND meta_key = %s",
        //     $product_id, $meta_key
        // ));
        
        // if ($existing) {
        //     return $wpdb->update($this->tables->products_meta,
        //         ['meta_value' => maybe_serialize($meta_value), 'updated_at' => current_time('mysql')],
        //         ['product_id' => $product_id, 'meta_key' => $meta_key]
        //     );
        // }
        // return $this->add_product_meta($product_id, $meta_key, $meta_value);
        return update_post_meta($product_id, 'sc_' . $meta_key, $meta_value, $prev_value);
    }

    public function delete_product_meta($product_id, $meta_key, $meta_value = null) {
        global $wpdb;
        // return $wpdb->delete($this->tables->products_meta, [
        //     'product_id' => $product_id,
        //     'meta_key' => $meta_key,
        // ]);
        return delete_post_meta($product_id, 'sc_' . $meta_key, $meta_value);
    }

    public function get_product_price($product_id, $variation_id = null) {
        if ($variation_id) {
            $price = $this->get_product_meta($variation_id, 'price');
            if ($price) return (float) $price;
        }
        return (float) $this->get_product_meta($product_id, 'price') ?: 0;
    }

    public function get_product_variations($product_id) {
        global $wpdb;
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->variations} WHERE product_id=%d", (int) $product_id
            ),
            ARRAY_A
        );
        foreach ($results as $index => $row) {
            foreach ($row as $key => $value) {
                $row[$key] = maybe_unserialize($value);
            }
            $results[$index] = $row;
        }
        return $results;
    }
    public function update_product_variation($product_id, $variation_id, $variation_data) {
        global $wpdb;
        foreach ($variation_data as $key => $value) {
            $variation_data[$key] = maybe_serialize($value);
        }
        if (empty($variation_id)) {
            $results = $wpdb->insert(
                $this->tables->variations,
                [
                    'product_id' => $product_id,
                    ...$variation_data
                ],
                ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s']
            );
            // wp_die($wpdb->last_error);
            return $wpdb->insert_id;
        } else {
            $updated = $wpdb->update(
                $this->tables->variations,
                [
                    'product_id' => $product_id,
                    ...$variation_data
                ],
                ['id' => (int) $variation_id],
                ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s'],
                ['%d']
            );
            return $updated;
        }
	}
    public function delete_product_variation($variation_id) {
        global $wpdb;
        $success = $wpdb->delete(
            $this->tables->variations,
            ['id' => (int) $variation_id],
            ['%d']
        );
        return $success;
    }

    public function get_product_attributes($product_id) {
        global $wpdb;
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$this->tables->attributes} WHERE product_id = %d",
                (int) $product_id
            ),
            ARRAY_A
        );
        foreach ($results as $index => $row) {
            foreach ($row as $key => $value) {
                $row[$key] = maybe_unserialize($value);
            }
            $row['items'] = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT * FROM {$this->tables->attribute_items} WHERE attribute_id = %d LIMIT 0, 100;",
                    $row['id']
                ),
                ARRAY_A
            );
            $results[$index] = $row;
        }
        return $results;
    }
    public function update_product_attribute($product_id, $attribute_id, $attribute_data) {
        global $wpdb;
        foreach ($attribute_data as $key => $value) {
            $attribute_data[$key] = maybe_serialize($value);
        }
        if (empty($attribute_id)) {
            $results = $wpdb->insert(
                $this->tables->attributes,
                [
                    'product_id' => (int) $product_id,
                    ...$attribute_data
                ],
                ['%d', '%s', '%s']
            );
            $attribute_id = $wpdb->insert_id;
            return $attribute_id;
        } else {
            $updated = $wpdb->update(
                $this->tables->attributes,
                [
                    'product_id' => (int) $product_id,
                    ...$attribute_data
                ],
                ['id' => (int) $attribute_id],
                ['%d', '%s', '%s'],
                ['%d']
            );
            return $updated;
        }
	}
    public function delete_product_attribute($attribute_id) {
        global $wpdb;
        $success = $wpdb->delete(
            $this->tables->attributes,
            ['id' => (int) $attribute_id],
            ['%d']
        );
        return $success;
    }

    public function update_product_attribute_item($product_id, $attribute_id, $item_id, $item_data) {
        global $wpdb;
        foreach ($item_data as $key => $value) {
            $item_data[$key] = maybe_serialize($value);
        }
        if (empty($item_id)) {
            $results = $wpdb->insert(
                $this->tables->attribute_items,
                [
                    'attribute_id' => (int) $attribute_id,
                    ...$item_data
                ],
                ['%d', '%s', '%s']
            );
            $item_id = $wpdb->insert_id;
            return $item_id;
        } else {
            $updated = $wpdb->update(
                $this->tables->attribute_items,
                [
                    ...$item_data
                ],
                ['id' => (int) $item_id],
                ['%s', '%s'],
                ['%d']
            );
            return $updated;
        }
	}
    public function delete_product_attribute_item($item_id) {
        global $wpdb;
        $success = $wpdb->delete(
            $this->tables->attribute_items,
            ['id' => (int) $item_id],
            ['%d']
        );
        return $success;
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

    public function api_get_products(WP_REST_Request $request) {
        // Get parameters with defaults
        $current_page = max(1, (int) $request->get_param('page') ?? 1);
        $per_page = max(1, (int) $request->get_param('per_page') ?? 24);
        $search = $request->get_param('search') ?? '';
        $orderby = $request->get_param('orderby') ?? 'id'; // id, title, date, meta_value, etc.
        $order = strtoupper($request->get_param('order') ?? 'DESC'); // ASC or DESC

        // Sanitize order
        if (!in_array($order, ['ASC', 'DESC'])) {
            $order = 'DESC';
        }

        // Include or exclude post IDs (comma separated string or array)
        $include_ids = $request->get_param('include_ids');
        if (is_string($include_ids)) {
            $include_ids = array_filter(array_map('absint', explode(',', $include_ids)));
        } elseif (!is_array($include_ids)) {
            $include_ids = [];
        }

        $exclude_ids = $request->get_param('exclude_ids');
        if (is_string($exclude_ids)) {
            $exclude_ids = array_filter(array_map('absint', explode(',', $exclude_ids)));
        } elseif (!is_array($exclude_ids)) {
            $exclude_ids = [];
        }

        // Taxonomy filters: expect array or comma separated string of term IDs or slugs
        // Example param names: sc_product_category, sc_product_tag
        $tax_query = ['relation' => 'AND'];
        $taxonomies = ['sc_product_category', 'sc_product_tag'];
        foreach ($taxonomies as $taxonomy) {
            $terms = $request->get_param($taxonomy);
            if ($terms) {
                if (is_string($terms)) {
                    $terms = array_filter(array_map('trim', explode(',', $terms)));
                }
                if (!empty($terms)) {
                    // Determine if terms are numeric IDs or slugs
                    $field = is_numeric($terms[0]) ? 'term_id' : 'slug';
                    $tax_query[] = [
                        'taxonomy' => $taxonomy,
                        'field' => $field,
                        'terms' => $terms,
                        'operator' => 'IN',
                    ];
                }
            }
        }
        if (count($tax_query) === 1) {
            // No taxonomy filters added, remove relation
            $tax_query = [];
        }

        // Meta query filters: expect array of meta filters or comma separated string
        // Example param: meta_filters = [{"key":"color","value":"red","compare":"="},{"key":"price","value":100,"compare":">="}]
        // Or simpler: meta_key, meta_value, meta_compare for single filter
        $meta_query = ['relation' => 'AND'];

        // Single meta filter params
        $meta_key = $request->get_param('meta_key');
        $meta_value = $request->get_param('meta_value');
        $meta_compare = $request->get_param('meta_compare') ?? '=';

        if ($meta_key && $meta_value !== null) {
            $meta_query[] = [
                'key' => sanitize_text_field($meta_key),
                'value' => $meta_value,
                'compare' => sanitize_text_field($meta_compare),
            ];
        }

        // Multiple meta filters param (JSON encoded)
        $meta_filters = $request->get_param('meta_filters');
        if ($meta_filters) {
            if (is_string($meta_filters)) {
                $decoded = json_decode($meta_filters, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    foreach ($decoded as $filter) {
                        if (isset($filter['key'], $filter['value'])) {
                            $meta_query[] = [
                                'key' => sanitize_text_field($filter['key']),
                                'value' => $filter['value'],
                                'compare' => isset($filter['compare']) ? sanitize_text_field($filter['compare']) : '=',
                            ];
                        }
                    }
                }
            } elseif (is_array($meta_filters)) {
                foreach ($meta_filters as $filter) {
                    if (isset($filter['key'], $filter['value'])) {
                        $meta_query[] = [
                            'key' => sanitize_text_field($filter['key']),
                            'value' => $filter['value'],
                            'compare' => isset($filter['compare']) ? sanitize_text_field($filter['compare']) : '=',
                        ];
                    }
                }
            }
        }

        if (count($meta_query) === 1) {
            // No meta filters added, remove relation
            $meta_query = [];
        }

        // Build WP_Query args
        $args = [
            'post_type' => 'sc_product',
            'posts_per_page' => $per_page,
            'paged' => $current_page,
            'orderby' => $orderby,
            'order' => $order,
            's' => $search ?: '',
            'post__in' => !empty($include_ids) ? $include_ids : null,
            'post__not_in' => !empty($exclude_ids) ? $exclude_ids : null,
            'tax_query' => $tax_query,
            'meta_query' => $meta_query,
            'fields' => 'ids',
        ];

        // Clean null values from args (post__in and post__not_in)
        // if (is_null($args['post__in'])) {
        //     unset($args['post__in']);
        // }
        // if (is_null($args['post__not_in'])) {
        //     unset($args['post__not_in']);
        // }
        // if (empty($args['tax_query'])) {
        //     unset($args['tax_query']);
        // }
        // if (empty($args['meta_query'])) {
        //     unset($args['meta_query']);
        // }
        // if (empty($args['s'])) {
        //     unset($args['s']);
        // }

        // Run query
        $query = new WP_Query($args);

        // Prepare response data
        $products = [];
        foreach ($query->posts as $post_id) {
            $products[] = $this->get_product($post_id);
        }

        // Pagination info
        $total_items = (int) $query->found_posts;
        $total_pages = (int) $query->max_num_pages;

        $response = rest_ensure_response($products);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $total_pages);

        return $response;
    }

    public function api_get_product_detailed(WP_REST_Request $request) {
        $product_slug = $request->get_param('product_slug');

        if (empty($product_slug)) {
            return rest_ensure_response(['message' => 'Product not found.'], 404);
        }

        // $product = get_page_by_path($product_slug, OBJECT, 'sc_product');
        global $wpdb;
        $product = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_name=%s AND post_type=%s;",
                $product_slug, 'sc_product'
            )
        );

        $product_id = (int) $product->ID;
        
        if (!$product_id) {
            return rest_ensure_response(['message' => 'Product not found.'], 404);
        }
        
        $product_data = $this->get_product($product_id);

        return rest_ensure_response($product_data);
    }

    public function api_get_product_related(WP_REST_Request $request) {
        $product_slug = $request->get_param('product_slug') ?: 0;
        
        $page = $request->get_param('page') ?: 1;
        $per_page = 12;

        if (empty($product_slug)) {
            return rest_ensure_response(['error' => 'Invalid product slug.']);
        }

        $product = get_page_by_path($product_slug, OBJECT, 'sc_product');
        $product_id = $product ? $product->ID : 0;

        if (!$product_id) {
            return rest_ensure_response(['error' => 'Product not found.']);
        }

        $product_categories = wp_get_post_terms($product_id, 'sc_product_category', ['fields' => 'ids']);
        $product_tags = wp_get_post_terms($product_id, 'sc_product_tag', ['fields' => 'ids']);

        $tax_query = [];
        if (!empty($product_categories)) {
            $tax_query[] = [
                'taxonomy' => 'sc_product_category',
                'field'    => 'term_id',
                'terms'    => $product_categories,
            ];
        }
        if (!empty($product_tags)) {
            $tax_query[] = [
                'taxonomy' => 'sc_product_tag',
                'field'    => 'term_id',
                'terms'    => $product_tags,
            ];
        }

        if (count($tax_query) > 1) {
            $tax_query = ['relation' => 'OR'] + $tax_query;
        }

        $args = [
            'post_type'      => 'sc_product',
            'post_status'    => 'publish',
            'post__not_in'   => [$product_id],  // Always exclude current product
            'posts_per_page' => $per_page,
            'paged'          => $page,
        ];

        // Add tax_query only if there are terms to filter by
        if (!empty($tax_query)) {
            $args['tax_query'] = $tax_query;
        }

        $recommended_products_query = new WP_Query($args);

        $response_data = [];
        $total_items = (int)$recommended_products_query->found_posts;
        $max_pages = (int)$recommended_products_query->max_num_pages;

        if ($recommended_products_query->have_posts()) {
            while ($recommended_products_query->have_posts()) {
                $recommended_products_query->the_post();
                $response_data[] = [
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'content' => apply_filters('the_content', get_the_content()),
                    'excerpt' => get_the_excerpt(),
                    'date' => get_the_date(),
                    'slug' => get_post_field('post_name', get_the_ID()),
                    'link' => get_permalink(),
                    'featured_image' => get_the_post_thumbnail_url(get_the_ID(), 'full'),
                    'metadata' => $this->get_product_meta(get_the_ID()),
                    'taxonomies' => [
                        'sc_product_category' => wp_get_post_terms(get_the_ID(), 'sc_product_category', ['fields' => 'all']),
                        'sc_product_tag' => wp_get_post_terms(get_the_ID(), 'sc_product_tag', ['fields' => 'all']),
                    ],
                    'variations'  => $this->get_product_variations(get_the_ID()),
                ];
            }
            wp_reset_postdata();
        }


        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', $total_items);
        $response->header('X-WP-TotalPages', $max_pages);

        return $response;
    }


    
    public function api_get_categories_list(WP_REST_Request $request) {
        $args = [
            'taxonomy'   => 'sc_product_category',
            'hide_empty' => true,
            'orderby'    => 'name',
            'order'      => 'ASC',
        ];

        $categories = get_terms($args);

        if (empty($categories) || is_wp_error($categories)) {
            return rest_ensure_response([], 404);
        }

        $response_data = [];
        foreach ($categories as $category) {
            $response_data[] = [
                'id'          => $category->term_id,
                'name'        => $category->name,
                'slug'        => $category->slug,
                'description' => $category->description,
                'count'       => $category->count,
            ];
        }

        return rest_ensure_response($response_data);
    }

    public function handle_create_sc_product() {
        // Get JSON payload from POST
        $payload = $_GET['payload']; // json_decode(stripslashes($_GET['payload']), true);
        if (!$payload) {
            wp_send_json_error('Invalid payload');
        }

        // Prepare post data
        $post_data = [
            'post_title'   => sanitize_text_field($payload['title'] ?? ''),
            'post_content' => wp_kses_post($payload['description'] ?? ''),
            'post_excerpt' => sanitize_text_field($payload['excerpt'] ?? ''),
            'post_status'  => 'publish',
            'post_type'    => 'sc_product',
        ];

        // Insert the post
        $post_id = wp_insert_post($post_data);

        if (is_wp_error($post_id)) {
            wp_send_json_error('Failed to create product');
        }

        // Set custom metadata
        if (!empty($payload['metadata']) && is_array($payload['metadata'])) {
            foreach ($payload['metadata'] as $key => $value) {
                // For arrays, serialize or json encode
                if (is_array($value)) {
                    update_post_meta($post_id, 'sc_' . $key, $value);
                } else {
                    update_post_meta($post_id, 'sc_' . $key, sanitize_text_field($value));
                }
            }
        }

        // Set categories (taxonomy: sc_product_category)
        if (!empty($payload['categories']) && is_array($payload['categories'])) {
            // Assuming categories are term IDs or slugs
            wp_set_object_terms($post_id, $payload['categories'], 'sc_product_category');
        }

        // Set tags (taxonomy: sc_product_tag)
        if (!empty($payload['tags']) && is_array($payload['tags'])) {
            wp_set_object_terms($post_id, $payload['tags'], 'sc_product_tag');
        }

        // Optionally, set featured image if thumbnail is provided and valid
        if (!empty($payload['thumbnail']) && is_numeric($payload['thumbnail'])) {
            set_post_thumbnail($post_id, intval($payload['thumbnail']));
        }

        // Return success with new post ID
        wp_send_json_success(['post_id' => $post_id]);
    }
    
}