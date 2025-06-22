<?php
/**
 * ProTools Manager Shortcode class
 *
 * @package PartnershipManager
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Service_Docs {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
        add_filter('init', [$this, 'register_service_docs_cpt_and_taxonomies'], 1, 0);
    }

    public function register_service_docs_cpt_and_taxonomies() {

        // Register Custom Post Type
        register_post_type('service_doc', array(
            'labels' => array(
                'name' => 'Service Docs',
                'singular_name' => 'Service Doc',
                'add_new' => 'Add New',
                'add_new_item' => 'Add New Service Doc',
                'edit_item' => 'Edit Service Doc',
                'new_item' => 'New Service Doc',
                'view_item' => 'View Service Doc',
                'search_items' => 'Search Service Docs',
                'not_found' => 'No Service Docs found',
                'not_found_in_trash' => 'No Service Docs found in Trash',
                'all_items' => 'All Service Docs',
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'service-docs'),
            'show_in_rest' => true,
            'menu_icon' => 'dashicons-media-text',
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        ));

        // Register Hierarchical Taxonomy (like Categories)
        register_taxonomy('service_category', 'service_doc', array(
            'labels' => array(
                'name' => 'Service Categories',
                'singular_name' => 'Service Category',
                'search_items' => 'Search Service Categories',
                'all_items' => 'All Service Categories',
                'parent_item' => 'Parent Service Category',
                'parent_item_colon' => 'Parent Service Category:',
                'edit_item' => 'Edit Service Category',
                'update_item' => 'Update Service Category',
                'add_new_item' => 'Add New Service Category',
                'new_item_name' => 'New Service Category Name',
                'menu_name' => 'Service Categories',
            ),
            'hierarchical' => true,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'service-category'),
        ));

        // Register Non-Hierarchical Taxonomy (like Tags)
        register_taxonomy('service_tag', 'service_doc', array(
            'labels' => array(
                'name' => 'Service Tags',
                'singular_name' => 'Service Tag',
                'search_items' => 'Search Service Tags',
                'popular_items' => 'Popular Service Tags',
                'all_items' => 'All Service Tags',
                'edit_item' => 'Edit Service Tag',
                'update_item' => 'Update Service Tag',
                'add_new_item' => 'Add New Service Tag',
                'new_item_name' => 'New Service Tag Name',
                'menu_name' => 'Service Tags',
            ),
            'hierarchical' => false,
            'show_in_rest' => true,
            'rewrite' => array('slug' => 'service-tag'),
        ));
    }

}