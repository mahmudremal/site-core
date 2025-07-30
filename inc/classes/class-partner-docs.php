<?php
/**
 * ProTools Manager Shortcode class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;
use WP_Query;

class Partner_Docs {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('init', [$this, 'register_partner_docs_cpt_and_taxonomies'], 1, 0);
        add_filter('sitecore/security/api/abilities', [$this, 'api_abilities'], 10, 3);
    }

	public function register_routes() {
		register_rest_route('sitecore/v1', '/docs/(?P<post_type>(service_doc|partner_doc))/list', [
			'methods' => 'GET',
			'callback' => [$this, 'api_list_docs'],
            'args' => [
                'post_type' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'page' => [
                    'required' => false,
                    'sanitize_callback' => 'absint',
                ],
                's' => [
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'status' => [
                    'required' => false,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'per_page' => [
                    'required' => false,
                    'sanitize_callback' => 'absint',
                ],
            ],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/docs/(?P<post_type>(service_doc|partner_doc))/(?P<post_taxonomy>(partner_category|service_category))', [
			'methods' => 'GET',
			'callback' => [$this, 'api_docs_categories'],
            'args' => [
                'post_type' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/docs/(?P<post_type>(service_doc|partner_doc))/(?P<post_taxonomy>(partner_category|service_category))/(?P<category_slug>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'api_docs_category'],
            'args' => [
                'post_type' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'category_slug' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/docs/(?P<post_type>(service_doc|partner_doc))/raw/(?P<post_slug>[^/]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_single_doc'],
            'args' => [
                'post_type' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'post_slug' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
			'permission_callback' => '__return_true'
		]);
    }
    
    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'docs/')) {
            $abilities[] = 'service-docs';
            $abilities[] = 'partner-docs';
        }
        return $abilities;
    }
    
    public function register_partner_docs_cpt_and_taxonomies() {
        // Register Custom Post Type
        register_post_type('partner_doc', array(
            'labels' => array(
                'name' => 'Partner Docs',
                'singular_name' => 'Partner Doc',
                'add_new' => 'Add New',
                'add_new_item' => 'Add New Partner Doc',
                'edit_item' => 'Edit Partner Doc',
                'new_item' => 'New Partner Doc',
                'view_item' => 'View Partner Doc',
                'search_items' => 'Search Partner Docs',
                'not_found' => 'No Partner Docs found',
                'not_found_in_trash' => 'No Partner Docs found in Trash',
                'all_items' => 'All Partner Docs',
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'partner-docs'),
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-media-document',
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        ));

        // Register Hierarchical Taxonomy (like Categories)
        register_taxonomy('partner_category', 'partner_doc', array(
            'labels' => array(
                'name' => 'Partner Categories',
                'singular_name' => 'Partner Category',
                'search_items' => 'Search Partner Categories',
                'all_items' => 'All Partner Categories',
                'parent_item' => 'Parent Partner Category',
                'parent_item_colon' => 'Parent Partner Category:',
                'edit_item' => 'Edit Partner Category',
                'update_item' => 'Update Partner Category',
                'add_new_item' => 'Add New Partner Category',
                'new_item_name' => 'New Partner Category Name',
                'menu_name' => 'Partner Categories',
            ),
            'hierarchical' => true,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'partner-category'),
        ));

        // Register Non-Hierarchical Taxonomy (like Tags)
        register_taxonomy('partner_tag', 'partner_doc', array(
            'labels' => array(
                'name' => 'Partner Tags',
                'singular_name' => 'Partner Tag',
                'search_items' => 'Search Partner Tags',
                'popular_items' => 'Popular Partner Tags',
                'all_items' => 'All Partner Tags',
                'edit_item' => 'Edit Partner Tag',
                'update_item' => 'Update Partner Tag',
                'add_new_item' => 'Add New Partner Tag',
                'new_item_name' => 'New Partner Tag Name',
                'menu_name' => 'Partner Tags',
            ),
            'hierarchical' => false,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'partner-tag'),
        ));
    }

    
    public function api_list_docs(WP_REST_Request $request) {
        global $wpdb;
        $post_type   = sanitize_text_field($request->get_param('post_type'));
        $page     = absint($request->get_param('page')) ?: 1;
        $search   = sanitize_text_field($request->get_param('s'));
        $status   = sanitize_text_field($request->get_param('status'));
        $per_page = absint($request->get_param('per_page')) ?: 10;
        $offset   = ($page - 1) * $per_page;
        $args     = [
            'post_type'      => $post_type,
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'post_status'    => $status ?: 'publish',
            's'              => $search,
        ];
        $query = new WP_Query($args);
        $total_items = $query->found_posts;
        $max_pages = ceil($total_items / $per_page);
        $response_data = [];
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            $response_data[] = [
                'id'          => $post_id,
                'title'       => get_the_title($post_id),
                'slug'        => get_post_field('post_name', $post_id),
                'content'     => get_the_content($post_id),
                'excerpt'     => get_the_excerpt($post_id),
                'date'        => get_the_date('Y-m-d H:i:s', $post_id),
                'status'      => get_post_status($post_id),
                'author'      => get_the_author_meta('display_name', get_post_field('post_author', $post_id)),
                'categories'  => wp_get_post_terms($post_id, 'partner_category', ['fields' => 'names']),
                'tags'        => wp_get_post_terms($post_id, 'partner_tag', ['fields' => 'names']),
            ];
        }
    
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $max_pages);
    
        return $response;
    }
    
    public function api_docs_categories(WP_REST_Request $request) {
        global $wpdb;
        $post_type  = sanitize_text_field($request->get_param('post_type'));
        $post_taxonomy  = sanitize_text_field($request->get_param('post_taxonomy'));
        $page     = absint($request->get_param('page')) ?: 1;
        $search   = sanitize_text_field($request->get_param('s'));
        $status   = sanitize_text_field($request->get_param('status'));
        $per_page = absint($request->get_param('per_page')) ?: 10;
        $offset   = ($page - 1) * $per_page;
        
        $categores = get_terms([
            'taxonomy'   => $post_taxonomy,
            'hide_empty' => true,
            'search'     => $search,
            'number'     => $per_page,
            'offset'     => $offset,
        ]);
        $total_items = count($categores);
        $max_pages = ceil($total_items / $per_page);
        $response_data = [];
        foreach ($categores as $category) {
            $post_ids = get_posts([
                'post_type'      => $post_type,
                'orderby'       => 'date',
                'order'         => 'DESC',
                'posts_per_page' => 6,
                'fields'         => 'ids',
                'post_status'    => $status ?: 'publish',
                'tax_query'      => [
                    [
                        'taxonomy' => $post_taxonomy,
                        'field'    => 'term_id',
                        'terms'    => $category->term_id,
                    ],
                ],
            ]);
            $posts = array_map(function($post_id) {
                return [
                    'id'      => (int) $post_id,
                    'title'   => get_post_field('post_title', $post_id),
                    'slug'    => get_post_field('post_name', $post_id),
                    'excerpt' => get_the_excerpt($post_id),
                    'date'    => get_the_date('', $post_id),
                    'author'  => get_the_author_meta('display_name', get_post_field('post_author', $post_id)),
                ];
            }, $post_ids);
            $response_data[] = [
                'id'          => $category->term_id,
                'name'        => $category->name,
                'slug'        => $category->slug,
                'description' => $category->description,
                'count'       => $category->count,
                'docs'        => $posts
            ];
        }
    
        $response = rest_ensure_response($response_data);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $max_pages);
    
        return $response;
    }
    
    public function api_docs_category(WP_REST_Request $request) {
        global $wpdb;
        $post_taxonomy  = sanitize_text_field($request->get_param('post_taxonomy'));
        $post_type  = sanitize_text_field($request->get_param('post_type'));
        $page     = absint($request->get_param('page')) ?: 1;
        $search   = sanitize_text_field($request->get_param('s'));
        $status   = sanitize_text_field($request->get_param('status'));
        $per_page = absint($request->get_param('per_page')) ?: 50;
        $offset   = ($page - 1) * $per_page;
        $category_slug = sanitize_text_field($request->get_param('category_slug'));
        $category = get_term_by('slug', $category_slug, $post_taxonomy);
        if (!$category) {
            return new WP_Error('no_category', 'Category not found', ['status' => 404]);
        }
        $args = [
            'post_type'      => $post_type,
            'posts_per_page' => $per_page,
            'offset'         => $offset,
            'post_status'    => $status ?: 'publish',
            's'              => $search,
            'tax_query'      => [
                [
                    'taxonomy' => $post_taxonomy,
                    'field'    => 'slug',
                    'terms'    => $category_slug,
                ],
            ],
        ];
        $query = new WP_Query($args);
        $total_items = $query->found_posts;
        $max_pages = ceil($total_items / $per_page);
        $category_posts = [];
        while ($query->have_posts()) {
            $query->the_post();
            $post_id = get_the_ID();
            $category_posts[] = [
                'id'          => $post_id,
                'title'       => get_the_title($post_id),
                'content'     => get_the_content($post_id),
                'excerpt'     => get_the_excerpt($post_id),
                'status'      => get_post_status($post_id),
                'slug'        => get_post_field('post_name', $post_id),
                'date'        => get_the_date('Y-m-d H:i:s', $post_id),
                'author'      => get_the_author_meta('display_name', get_post_field('post_author', $post_id)),
                'categories'  => wp_get_post_terms($post_id, $post_taxonomy, ['fields' => 'names']),
                'tags'        => wp_get_post_terms($post_id, 'partner_tag', ['fields' => 'names']),
            ];
        }
        
        $response = rest_ensure_response([
            'category' => $category,
            'posts'    => $category_posts,
        ]);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $max_pages);
    
        return $response;
    }
    
    public function api_get_single_doc(WP_REST_Request $request) {
        global $wpdb;
        $post_type  = sanitize_text_field($request->get_param('post_type'));
        $post_slug = sanitize_text_field($request->get_param('post_slug'));
        $post = get_page_by_path($post_slug, OBJECT, $post_type);
        if (!$post) {
            return new WP_Error('no_post', 'Post not found', ['status' => 404]);
        }
        return $post;
    }

}