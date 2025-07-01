<?php
/**
 * App ID: 763621
 * Access Key: pM-8JVM4SoKoYzPcY5nP5zmQRxPqsQVEtJzVeUeO8As
 * Secret key: 8qC3L7jUZ6aZ6EUWDxrxc3TUR0GHPqwke5R3ex6-IJE
 */

namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;


class Instant_Images {
	use Singleton;

	protected $_access_key = 'pM-8JVM4SoKoYzPcY5nP5zmQRxPqsQVEtJzVeUeO8As';

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
		add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
		// add_filter('media_upload_tabs', [$this, 'media_upload_tabs'], 10, 1);
		// add_filter('media_view_settings', [$this, 'media_view_settings'], 10, 1);
		add_filter('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'], 10, 1);
	}

	public function register_routes() {
		if (apply_filters('pm_project/system/isactive', 'instantimg-disabled')) {return;}
		register_rest_route('sitecore/v1', '/media/3rd/unsplash/photos', [
			'methods' => 'GET',
			'callback' => [$this, 'api_search_images'],
			'args' => [
				'query' => [
					'default' => '',
					'sanitize_callback' => 'sanitize_text_field',
					'description' => __('Search term', 'site-core')
				],
				'page' => [
					'default' => 1,
					'sanitize_callback' => 'absint',
					'validate_callback' => function($v) { return is_numeric($v); },
					'description' => __('Page number', 'site-core')
				],
				'per_page' => [
					'default' => 10,
					'sanitize_callback' => 'absint',
					'validate_callback' => function($v) { return is_numeric($v); },
					'description' => __('Results per page', 'site-core')
				],
				'color' => [
					'default' => '',
					'sanitize_callback' => 'sanitize_text_field',
					'description' => __('Filter by color', 'site-core')
				],
			],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/media/3rd/unsplash/photos/(?P<image_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_image_info'],
			'args' => [
				'image_id' => [
					'required' => true,
					'sanitize_callback' => 'sanitize_text_field',
					'description' => __('Image ID from Unsplash', 'site-core')
				],
			],
			'permission_callback' => '__return_true'
		]);

		register_rest_route('sitecore/v1', '/media/3rd/unsplash/photos/(?P<image_id>\d+)/download', [
			'methods' => 'POST',
			'callback' => [$this, 'api_download_image'],
			'args' => [
				'image_id' => [
					'required' => true,
					'sanitize_callback' => 'sanitize_text_field',
					'description' => __('Image ID from Unsplash', 'site-core')
				],
			],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/instantimage/upload', [
			'methods' => 'POST',
			'callback' => [$this, 'api_image_upload'],
			'permission_callback' => '__return_true'
		]);
	}

    public function settings($args) {
		$args['instantimg']		= [
			'title'							=> __('Images', 'site-core'),
			'description'					=> __('Instant image media library configurations.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'instantimg-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Mark to disable Instant image media library suggestions.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				// [
				// 	'id' 					=> 'instantimg-base',
				// 	'label'					=> __('Base URI', 'site-core'),
				// 	'description'			=> __('Provide Instant image base api url.', 'site-core'),
				// 	'type'					=> 'text',
				// 	'default'				=> 'https://proxy.getinstantimages.com/api'
				// ],
				// [
				// 	'id' 					=> 'instantimg-appid',
				// 	'label'					=> __('App ID', 'site-core'),
				// 	'description'			=> __('Provide Instant image App id.', 'site-core'),
				// 	'type'					=> 'text',
				// 	'default'				=> ''
				// ],
				// [
				// 	'id' 					=> 'instantimg-access_key',
				// 	'label'					=> __('Access Key', 'site-core'),
				// 	'description'			=> __('Provide unspash app access key.', 'site-core'),
				// 	'type'					=> 'text',
				// 	'default'				=> ''
				// ],
				// [
				// 	'id' 					=> 'instantimg-secret_key',
				// 	'label'					=> __('Secret Key', 'site-core'),
				// 	'description'			=> __('Provide unspash app secret key.', 'site-core'),
				// 	'type'					=> 'text',
				// 	'default'				=> ''
				// ],
			]
		];
        return $args;
    }

	// Search images from Unsplash API
	public function api_search_images(WP_REST_Request $request) {
		$query = $request->get_param('query');
		$page = $request->get_param('page');
		$per_page = $request->get_param('per_page');
		$color = $request->get_param('color');

		$endpoint = 'https://api.unsplash.com/search/photos';

		$args = [
			'query'    => (string) $query,
			'page'     => (int) $page,
			'per_page' => (int) $per_page,
			'color'    => $color,
			// 'order_by' => 'latest',
			// 'orientation' => 'landscape',
		];

		$url = add_query_arg($args, $endpoint);

		$response = wp_remote_get($url, [
			'timeout' => 30,
			'headers' => [
				'Authorization' => 'Client-ID ' . $this->_access_key,
			],
		]);

		
		if (is_wp_error($response)) {
			return new WP_Error('api_error', __('Error fetching images', 'site-core'), ['status' => 500]);
		}

		$data = json_decode(wp_remote_retrieve_body($response), true);

		if (isset($data['errors'])) {
			return new WP_Error('api_error', $data['errors'][0], ['status' => 500]);
		}

		// Format the response
		$images = [];
		if (!empty($data['results'])) {
			foreach ($data['results'] as $img) {
				$images[] = [
					'id' => $img['id'],
					'description' => $img['description'] ?? $img['alt_description'],
					'thumbnail' => $img['urls']['small'],
					'full' => $img['urls']['full'],
					'download_location' => $img['links']['download_location']
				];
			}
		}
		
		// Return response with pagination info
		$total = isset($data['total']) ? $data['total'] : 0;
		return new WP_REST_Response($images, 200, [
			'X-WP-Total' => $total,
			'X-WP-TotalPages' => ceil($total / $per_page),
		]);
	}

	public function api_download_image(WP_REST_Request $request) {
		$image_id = $request->get_param('image_id');

		// Fetch image details
		$image_info = $this->get_image_details($image_id);
		if (is_wp_error($image_info)) {
			return $image_info;
		}

		$full_url = $image_info['urls']['full'];

		// Download and sideload the image into Media Library
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		require_once(ABSPATH . 'wp-admin/includes/file.php');
		require_once(ABSPATH . 'wp-admin/includes/media.php');

		// Prepare an array with image info for sideloading
		$tmp = download_url($full_url);
		if (is_wp_error($tmp)) {
			return new WP_Error('download_error', __('Failed to download image', 'site-core'), ['status' => 500]);
		}

		$file_array = array(
			'name' => basename($full_url), // Sanitize filename
			'tmp_name' => $tmp,
		);

		// Sideload the image into WordPress Media Library
		$attachment_id_id = media_handle_sideload($file_array, 0); // 0 for no post ID
		@unlink($file_array['tmp_name']); // Clean up temp file

		if (is_wp_error($attachment_id_id)) {
			return $attachment_id_id;
		}

		// Get the URL of the uploaded media
		$url = wp_get_attachment_url($attachment_id_id);

		return rest_ensure_response([
			'message' => __('Image uploaded to Media Library successfully', 'site-core'),
			'attachment_id' => $attachment_id_id,
			'url' => $url,
		]);
	}


	public function api_get_image_info(WP_REST_Request $request) {
		$image_id = $request->get_param('image_id');
		return rest_ensure_response($this->get_image_details($image_id));
	}
	
	private function get_image_details($image_id) {
		// Fetch image detail from Unsplash API
		$endpoint = "https://api.unsplash.com/photos/{$image_id}";
		$response = wp_remote_get($endpoint, ['timeout' => 10, 'headers' => ['Authorization' => 'Client-ID ' . $this->_access_key]]);
		
		if (is_wp_error($response)) {
			return new WP_Error('api_error', __('Error fetching image details', 'site-core'), ['status' => 500]);
		}
		
		$data = json_decode(wp_remote_retrieve_body($response), true);
		
		if (isset($data['errors'])) {
			return new WP_Error('api_error', $data['errors'][0], ['status' => 500]);
		}
		
		return $data;
	}

	public function api_image_upload(WP_REST_Request $request) {
		if (apply_filters('pm_project/system/isactive', 'instantimg-disabled')) {
			return new WP_Error('api_error', __('Unsplash is disabled', 'site-core'), ['status' => 403]);
		}

		// if (!current_user_can('upload_files')) {
		// 	return new WP_Error('rest_forbidden', __('You do not have permission to upload files.', 'site-core'), ['status' => 403]);
		// }

		$url = esc_url_raw($request->get_param('url'));
		$title = sanitize_text_field($request->get_param('title'));
		$alt = sanitize_text_field($request->get_param('alt'));
		$caption = sanitize_textarea_field($request->get_param('caption'));
		$filename = sanitize_file_name($request->get_param('filename'));
		$extension = sanitize_file_name($request->get_param('extension') ?: 'jpg');

		if (empty($url)) {
			return new WP_Error('rest_invalid_param', __('Image URL is required.', 'site-core'), ['status' => 400]);
		}

		// Download and sideload the image into Media Library
		require_once(ABSPATH . 'wp-admin/includes/image.php');
		require_once(ABSPATH . 'wp-admin/includes/file.php');
		require_once(ABSPATH . 'wp-admin/includes/media.php');

		// Prepare filename and upload directory
		$wp_upload_dir = wp_upload_dir();

		$temp_file = isset($_FILES['media_file']) ? $_FILES['media_file'] : false;
		$local_file = trailingslashit($wp_upload_dir['path']) . (!empty($temp_file['name']) ? $temp_file['name'] : (
			$filename ? $filename : 'file-' . time() . $extension
		));

		if (empty($temp_file)) {
			// Download the image
			$temp_file = download_url($url);
			if (is_wp_error($temp_file)) {
				return new WP_Error('rest_download_error', __('Failed to download image.', 'site-core'), ['status' => 500, 'error' => $temp_file->get_error_message()]);
			}
			// Move the temp file to final destination
			if (!@copy($temp_file, $local_file)) {
				wp_delete_file($temp_file);
				return new WP_Error('rest_move_error', __('Failed to move downloaded image.', 'site-core'), ['status' => 500]);
			}
			wp_delete_file($temp_file);
			// Set correct file permissions using WordPress API
			$wp_filesystem = WP_Filesystem();
			if ($wp_filesystem && is_object($GLOBALS['wp_filesystem'])) {
				$GLOBALS['wp_filesystem']->chmod($local_file, FS_CHMOD_FILE);
			}
		} else {
			if (!move_uploaded_file($temp_file['tmp_name'], $local_file)) {
				return new WP_Error('rest_move_error', __('Failed to move downloaded image.', 'site-core'), ['status' => 500]);
			}
		}
		// Prepare attachment
		$filetype = wp_check_filetype($local_file);
		$attachment = [
			'post_title'     => $title ? $title : preg_replace('/\.[^.]+$/', '', basename($local_file)),
			'guid'           => $wp_upload_dir['url'] . '/' . basename($local_file),
			'post_mime_type' => $filetype['type'],
			'post_status'    => 'inherit',
			'post_excerpt'   => $caption,
			'post_content'   => '',
		];

		// Insert attachment
		$attachment_id = wp_insert_attachment($attachment, $local_file);

		if (is_wp_error($attachment_id)) {
			return new WP_Error('rest_insert_error', __('Failed to insert attachment.', 'site-core'), ['status' => 500]);
		}

		// Generate metadata
		$attach_data = wp_generate_attachment_metadata($attachment_id, $local_file);
		wp_update_attachment_metadata($attachment_id, $attach_data);

		// Set alt text
		if (!empty($alt)) {
			update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt);
		}

		$response_data = [
			'attachment_id' => $attachment_id,
			'url'           => wp_get_attachment_url($attachment_id),
			'file'          => $local_file,
			'mime_type'     => $filetype['type'],
			'title'         => get_the_title($attachment_id),
			'alt'           => $alt,
			'caption'       => $caption,
		];

		return rest_ensure_response(['message' => __('Image uploaded successfully', 'site-core'), 'data' => $response_data]);
	}



	public function media_upload_tabs($_tabs) {
		if (apply_filters('pm_project/system/isactive', 'instantimg-disabled')) {return $_tabs;}
		$_tabs['instant_image'] = __('Instant Images', 'site-core');
		return $_tabs;
	}
	function media_view_settings($settings) {
		if (apply_filters('pm_project/system/isactive', 'instantimg-disabled')) {return $settings;}
		$settings['tabs'] = isset($settings['tabs']) ? $settings['tabs'] : [];
		$settings['tabs']['instant_image'] = 'Photogrid';
		return $settings;
	}
	public function admin_enqueue_scripts($curr_page) {
		if (apply_filters('pm_project/system/isactive', 'instantimg-disabled')) {return;}
		wp_enqueue_script('media-unsplash', WP_SITECORE_BUILD_JS_URI . '/media.js', ['media-views'], null, true);
	}
}

?>