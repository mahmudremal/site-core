<?php
/**
 * ProTools Manager Shortcode class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Supports {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('init', [$this, 'register_support_cpt_and_taxonomies'], 1, 0);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
    }
    
    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'supports/')) {
            $abilities[] = 'support-ticket';
        }
        return $abilities;
    }

    public function register_support_cpt_and_taxonomies() {
        // Register Custom Post Type (non-public)
        register_post_type('support', array(
            'labels' => array(
                'name' => 'Supports',
                'singular_name' => 'Support',
                'add_new' => 'Add New',
                'add_new_item' => 'Add New Support',
                'edit_item' => 'Edit Support',
                'new_item' => 'New Support',
                'view_item' => 'View Support',
                'search_items' => 'Search Supports',
                'not_found' => 'No Supports found',
                'not_found_in_trash' => 'No Supports found in Trash',
                'all_items' => 'All Supports',
            ),
            'public' => false,
            'exclude_from_search' => true,
            'publicly_queryable' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'has_archive' => false,
            'rewrite' => false,
            'supports' => array('title', 'editor'),
            'menu_icon' => 'dashicons-sos',
        ));

        // Register Non-Public Hierarchical Taxonomy
        register_taxonomy('support_category', 'support', array(
            'labels' => array(
                'name' => 'Support Categories',
                'singular_name' => 'Support Category',
                'search_items' => 'Search Support Categories',
                'all_items' => 'All Support Categories',
                'parent_item' => 'Parent Support Category',
                'parent_item_colon' => 'Parent Support Category:',
                'edit_item' => 'Edit Support Category',
                'update_item' => 'Update Support Category',
                'add_new_item' => 'Add New Support Category',
                'new_item_name' => 'New Support Category Name',
                'menu_name' => 'Support Categories',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'show_in_nav_menus' => false,
            'show_tagcloud' => false,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite' => false,
        ));

        // Register Non-Public Tags (Non-hierarchical)
        register_taxonomy('support_tag', 'support', array(
            'labels' => array(
                'name' => 'Support Tags',
                'singular_name' => 'Support Tag',
                'search_items' => 'Search Support Tags',
                'popular_items' => 'Popular Support Tags',
                'all_items' => 'All Support Tags',
                'edit_item' => 'Edit Support Tag',
                'update_item' => 'Update Support Tag',
                'add_new_item' => 'Add New Support Tag',
                'new_item_name' => 'New Support Tag Name',
                'menu_name' => 'Support Tags',
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => false,
            'show_in_nav_menus' => false,
            'show_tagcloud' => false,
            'show_in_rest' => true,
            'hierarchical' => false,
            'rewrite' => false,
        ));
    }
    
	public function register_routes() {
		register_rest_route('sitecore/v1', '/supports/ticket', [
			'methods' => 'POST',
			'callback' => [$this, 'support_create_ticket'],
            'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/supports/tickets', [
			'methods' => 'GET',
			'callback' => [$this, 'support_list_tickets'],
            'permission_callback' => '__return_true'
		]);
    }

    public function support_create_ticket(WP_REST_Request $request) {
        $about = $request->get_param('about');
        $last_name = $request->get_param('last_name');
        $first_name = $request->get_param('first_name');
        $description = $request->get_param('description');
        $ticket = [
            'post_title'    => sanitize_text_field($about),
            'post_content'  => sanitize_textarea_field($description),
            'post_excerpt'  => sanitize_text_field($last_name . ' ' . $first_name),
            'post_author'   => Security::get_instance()->user_id,
            'post_type'     => 'support',
            'post_status'   => 'publish'
        ];

        // Insert the post into the database
        $post_id = wp_insert_post($ticket);

        if (is_wp_error($post_id)) {
            return new WP_Error('ticket_creation_failed', __('Failed to create ticket'), ['status' => 500]);
        }

        if (!empty($_FILES['attachments'])) {
            foreach ($_FILES['attachments']['name'] as $key => $value) {
                if ($_FILES['attachments']['error'][$key] == 0) {
                    $file = array(
                        'name' => $_FILES['attachments']['name'][$key],
                        'type' => $_FILES['attachments']['type'][$key],
                        'tmp_name' => $_FILES['attachments']['tmp_name'][$key],
                        'error' => $_FILES['attachments']['error'][$key],
                        'size' => $_FILES['attachments']['size'][$key]
                    );

                    // Use the WordPress function to handle the file upload
                    $attachment_id = $this->upload_support_attachment($file, $post_id);
                    if (is_wp_error($attachment_id)) {
                        return new WP_Error('attachment_upload_failed', __('Failed to upload attachment'), ['status' => 500]);
                    }
                }
            }
        }

        return rest_ensure_response(['message' => __('Ticket created successfully'), 'ticket_id' => $post_id]);
    }

    private function upload_support_attachment($file, $post_id) {
        // Get WordPress uploads directory info
        $upload_dir = wp_upload_dir();
        $custom_dir = $upload_dir['basedir'] . '/support_attachments';
        $custom_url = $upload_dir['baseurl'] . '/support_attachments';

        // Create the directory if it doesn't exist
        if (!file_exists($custom_dir)) {
            wp_mkdir_p($custom_dir);
        }

        // Generate a unique file name with prefix
        $file_info = pathinfo($file['name']);
        $unique_id = uniqid();
        $sanitized_filename = sanitize_file_name($file_info['filename']);
        $new_filename = "support-{$post_id}-{$sanitized_filename}-{$unique_id}." . $file_info['extension'];

        $destination = $custom_dir . '/' . $new_filename;

        // Move the uploaded file to the custom directory
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            // Return array with file data if successful
            $attachments = get_post_meta($post_id, '_support_attachments', true);
            if (empty($attachments)) {$attachments = [];}
            $attachments[] = [
                'file_path' => $destination,
                'file_name' => $file_info['filename'],
                'file_url'  => $custom_url . '/' . $new_filename
            ];
            $_updated = update_post_meta($post_id, '_support_attachments', $attachments);
            return [
                'file_path' => $destination,
                'file_name' => $new_filename,
                'file_url'  => $custom_url . '/' . $new_filename
            ];
        } else {
            return new WP_Error('upload_failed', 'Failed to move uploaded file.');
        }
    }

    public function support_list_tickets(WP_REST_Request $request) {
        $user_id = $request->get_param('user_id');
        if (empty($user_id)) {
            $user_id = Security::get_instance()->user_id;
        }
        $args = [
            'post_type' => 'support',
            'post_status' => 'publish',
            'posts_per_page' => 18,
            'author' => $user_id
        ];

        $query = new \WP_Query($args);
        if ($query->have_posts()) {
            $tickets = [];
            while ($query->have_posts()) {
                $query->the_post();
                $attachments = get_post_meta(get_the_ID(), '_support_attachments', true);
                $attachments = empty($attachments) ? [] : (array) $attachments;
                $tickets[] = [
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                    'date' => get_the_date(),
                    'attachements' => $attachments,
                    'status' => get_post_status(),
                ];
            }
            $total_items = $query->found_posts;
            $max_pages = $query->max_num_pages;
            wp_reset_postdata();

            $response = rest_ensure_response($tickets);
            $response->header('X-WP-Total', (int) $total_items);
            $response->header('X-WP-TotalPages', (int) $max_pages);

            return $response;
        } else {
            return new WP_Error('no_tickets', __('No tickets found'), ['status' => 404]);
        }
    }

}