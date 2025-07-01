<?php
/**
 * CDN media library
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;
use CURLFile;

class Cdn {
	use Singleton;

    private $host;
    private $pub_key;
    private $api_key;
    // private $sizes2_generate = [];
    
    protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

	protected function setup_hooks() {
        // add_action('wp_head', [$this, 'wp_head']);
        // add_action('send_headers', [$this, 'send_headers']);
        add_action('rest_api_init', [$this, 'rest_api_init']);
        add_action('add_attachment', [$this, 'handle_upload']);
        add_action('delete_attachment', [$this, 'handle_deletion']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_filter('media_row_actions', [$this, 'media_row_actions'], 10, 3);
        add_filter('wp_get_attachment_url', [$this, 'wp_get_attachment_url'], 10, 2);
        add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
        add_filter('wp_get_attachment_image_src', [$this, 'wp_get_attachment_image_src'], 10, 3);
        add_filter('wp_update_attachment_metadata', [$this, 'wp_update_attachment_metadata'], 10, 2);
        add_filter('intermediate_image_sizes_advanced', [$this, 'intermediate_image_sizes_advanced'], 10, 3);

        add_filter('handle_bulk_actions-upload', [$this, 'handle_bulk_send_to_cdn_action'], 10, 3);
        add_filter('bulk_actions-upload', [$this, 'add_bulk_send_to_cdn_action']);
        add_action('admin_notices', [$this, 'cdn_bulk_action_admin_notice']);

        add_action('wp_get_attachment_image_attributes', [$this, 'wp_get_attachment_image_attributes'], 10, 3);
    }

    public function get_cdn_host() {
        if (! $this->host) {
            $this->host = apply_filters('pm_project/system/getoption', 'cdn-provider', 'media');
        }
        return $this->host;
    }
    public function get_api_key() {
        if (! $this->api_key) {
            $this->api_key = apply_filters('pm_project/system/getoption', 'cdn-apikey', false);
        }
        return $this->api_key;
    }
    public function get_pub_key() {
        if (! $this->pub_key) {
            $this->pub_key = apply_filters('pm_project/system/getoption', 'cdn-pubkey', false);
        }
        return $this->pub_key;
    }

    public function wp_head() {
        if (headers_sent()) {return;}
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        // 
        echo '<meta http-equiv="Content-Security-Policy" content="img-src \'self\' https://ik.imagekit.io https://res.cloudinary.com;">' . "\n";
    }
    public function send_headers() {
        if (headers_sent()) {return;}
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        // 
        $img_sources = ["'self'", 'https://secure.gravatar.com', 'data:', 'https://ik.imagekit.io', 'https://res.cloudinary.com'];
        $script_sources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'];
        $style_sources = ["'self'", "'unsafe-inline'", '*'];
        $font_sources = ["'self'", 'data:', '*'];
        $worker_sources = ["'self'", 'blob:'];
        $connect_sources = ["'self'", '*'];
        $frame_sources = ['*'];
        $csp = [];
        $csp[] = "default-src 'self'";
        $csp[] = 'script-src ' . implode(' ', array_unique($script_sources));
        $csp[] = 'style-src ' . implode(' ', array_unique($style_sources));
        $csp[] = 'font-src ' . implode(' ', array_unique($font_sources));
        $csp[] = 'img-src ' . implode(' ', array_unique($img_sources));
        $csp[] = 'connect-src ' . implode(' ', array_unique($connect_sources));
        $csp[] = 'frame-src ' . implode(' ', array_unique($frame_sources));
        $csp[] = 'worker-src ' . implode(' ', array_unique($worker_sources));
        // 
        header('Content-Security-Policy: ' . implode('; ', $csp));
    }

    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/cdn/attachments/(?P<post_id>\d+)/send', [
			'methods' => 'GET',
			'callback' => [$this, 'api_send_attachment'],
            'permission_callback' => '__return_true' // [Security::get_instance(), 'permission_callback']
		]);
    }

    public function settings($args) {
		$args['cdn']		= [
			'title'							=> __('CDN', 'site-core'),
			'description'					=> __('CDN configurations, fields customization. Things enables and disables.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'cdn-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the cdn unconditionally. Would be a reason for site image break.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'cdn-provider',
					'label'					=> __('CDN Provider', 'site-core'),
					'description'			=> __('Select a cdn provider for image syncing from wordpress media library to cdn host.', 'site-core'),
					'type'					=> 'select',
					'options'				=> [
						'media'				=> __('WP Media library', 'site-core'),
						'cloudinary'		=> __('Cloudinary', 'site-core'),
						'imagekit'			=> __('imagekit', 'site-core'),
					],
					'default'				=> 'media'
				],
				[
					'id' 					=> 'cdn-pubkey',
					'label'					=> __('Public Key', 'site-core'),
					'description'			=> __('CDN api public key.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'cdn-apikey',
					'label'					=> __('API Key', 'site-core'),
					'description'			=> __('CDN api secret key.', 'site-core'),
					'type'					=> 'text',
					'default'				=> ''
				],
				[
					'id' 					=> 'cdn-delocals',
					'label'					=> __('Delete File', 'site-core'),
					'description'			=> __('Delete attachment files thubmnails instantly after sending to cdn.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'cdn-delocal-mainfile',
					'label'					=> __('Delete Main File', 'site-core'),
					'description'			=> __('Delete the main attachment file besides thumbnails.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];
        return $args;
    }

    public function handle_upload($post_ID) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}

        $file_path = get_attached_file($post_ID);
        $file_type = wp_check_filetype($file_path);

        if ($this->get_cdn_host() === 'cloudinary') {
            $upload_url = 'https://api.cloudinary.com/v1_1/' . $this->get_api_key() . '/image/upload';
            $response = wp_remote_post($upload_url, [
                'body' => [
                    'file' => curl_file_create($file_path, $file_type['type']),
                    'upload_preset' => 'unsigned'
                ]
            ]);
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (!empty($body['secure_url'])) {
                update_post_meta($post_ID, '_hostedon', 'cloudinary');
                update_post_meta($post_ID, '_cdn_link', esc_url($body['secure_url']));
                update_post_meta($post_ID, '_cdn_id', sanitize_text_field($body['public_id']));
                $this->delete_attachment_file_with_thumbnails($file_path, $post_ID);
            }
        }

        if ($this->get_cdn_host() === 'imagekit') {
            $upload_url = 'https://upload.imagekit.io/api/v1/files/upload';
            $filename = basename($file_path);

            $curl = curl_init();

            $post_fields = [
                'file' => new CURLFile($file_path, $file_type['type'], $filename),
                'fileName' => $filename,
                'useUniqueFileName' => 'true',
                'publicKey' => $this->get_pub_key(),
                // Add other optional fields if needed
            ];

            curl_setopt_array($curl, [
                CURLOPT_URL => $upload_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 20,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $post_fields,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Basic ' . base64_encode($this->get_api_key() . ':'),
                ],
            ]);

            $response = curl_exec($curl);
            $curl_error = curl_error($curl);
            $http_status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);

            if ($response === false) {
                wp_die("ImageKit Upload Error: $curl_error (HTTP Status: $http_status)");
            }

            $body = json_decode($response, true);
            // print_r($body);wp_die();

            if (!empty($body['url'])) {
                update_post_meta($post_ID, '_hostedon', 'imagekit');
                update_post_meta($post_ID, '_cdn_link', esc_url($body['url']));
                update_post_meta($post_ID, '_cdn_path', parse_url($body['url'])['path']);
                update_post_meta($post_ID, '_cdn_id', sanitize_text_field($body['fileId']));
                $this->delete_attachment_file_with_thumbnails($file_path, $post_ID);
            } else {
                wp_die("ImageKit Response Error: " . print_r($body, true));
            }
        }


    }

    public function wp_get_attachment_url($url, $post_ID) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $url;}
        $cdn_url = get_post_meta($post_ID, '_cdn_link', true);
        return $cdn_url ? $cdn_url : $url;
    }

    public function handle_deletion($post_ID) {
        $hosted_on = get_post_meta($post_ID, '_hostedon', true);
        $cdn_id = get_post_meta($post_ID, '_cdn_id', true);

        if (!$hosted_on || !$cdn_id) return;

        if ($hosted_on === 'cloudinary') {
            $delete_url = 'https://api.cloudinary.com/v1_1/' . $this->get_api_key() . '/resources/image/upload';
            $timestamp = time();
            $params_to_sign = "public_id={$cdn_id}&timestamp={$timestamp}";
            $signature = sha1($params_to_sign . $this->get_api_key());
            wp_remote_post($delete_url . '/' . $cdn_id, [
                'method' => 'DELETE',
                'body' => [
                    'public_id' => $cdn_id,
                    'timestamp' => $timestamp,
                    'signature' => $signature,
                    'api_key' => $this->get_api_key(),
                ]
            ]);
        }

        if ($hosted_on === 'imagekit') {
            $delete_url = 'https://api.imagekit.io/v1/files/' . $cdn_id;
            wp_remote_request($delete_url, [
                'method' => 'DELETE',
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($this->get_api_key() . ':')
                ]
            ]);
        }
    }


    public function get_resized_url($post_ID, array $params = [], $_return_object = false) {

        $file_path = get_post_meta($post_ID, '_cdn_path', true);
        if (empty($file_path)) {return false;}

        if (empty($params['w'])) {unset($params['w']);}
        if (empty($params['h'])) {unset($params['h']);}
        
        $mime_type = $params['mime_type'] ?? '';
        if (empty($params['mime_type'])) {
            $mime_type = get_post_mime_type($post_ID);
        }
        if ($mime_type && strpos($mime_type, 'image/') !== 0) {
            return $file_path; // Return original file if not an image
        }
        if (isset($params['mime_type'])) {
            unset($params['mime_type']);
        }

        $base_url = 'https://ik.imagekit.io/';

        // Build transformation string
        $transforms = [];
        foreach ($params as $key => $value) {
            $transforms[] = $key . '-' . $value;
        }
        $transform_path = implode(",", $transforms);

        // Final URL
        $image_url = esc_url(rtrim($base_url, '/') . '/' . ltrim($file_path, '/')) . '?tr=' . $transform_path;
        // 
        return (! $_return_object) ? $image_url : [
            'url' => $image_url,
            'width' => $params['w'] ?? null,
            'height' => $params['h'] ?? null,
            'fit' => $params['fit'] ?? null,
            'crop' => $params['c'] ?? null,
            // 'path' => str_replace($base_url, '', $image_url),
            'path' => pathinfo($image_url, PATHINFO_BASENAME),
        ];
    }

    public function wp_get_attachment_image_src($image, $attachment_id, $size) {
        // if ($this->get_cdn_host() === 'media') {return $image;}
        // if ($this->get_cdn_host() !== 'imagekit') {return $image;}
        $dimensions = [];

        [$dimensions['width'], $dimensions['height']] = $size;

        $url = $this->get_resized_url($attachment_id, [
            'w' => $dimensions['width'],
            'h' => $dimensions['height'],
            'fit' => 'cover'
        ]);
        // 
        return $url ? [$url, $dimensions['width'], $dimensions['height'], true] : $image;
    }

    public function delete_attachment_file_with_thumbnails($file_path, $_attachment_id) {
        if (!apply_filters('pm_project/system/isactive', 'cdn-delocals')) {return;}
        
        // Get attachment metadata
        $metadata = wp_get_attachment_metadata($_attachment_id);
        if (!$metadata) {
            return false;
        }

        // Get upload directory base path
        $upload_dir = wp_upload_dir();
        $base_path = trailingslashit($upload_dir['basedir']);

        // Delete main file if it exists
        if (apply_filters('pm_project/system/isactive', 'cdn-delocal-mainfile') && file_exists($file_path)) {
            @unlink($file_path);
        }

        // Check and delete thumbnails
        if (isset($metadata['sizes']) && is_array($metadata['sizes'])) {
            $attachment_file = get_attached_file($_attachment_id);
            $attachment_dir = trailingslashit(dirname($attachment_file));

            foreach ($metadata['sizes'] as $size) {
                if (isset($size['file'])) {
                    $thumb_path = $attachment_dir . $size['file'];
                    if (file_exists($thumb_path)) {
                        @unlink($thumb_path);
                    }
                }
            }
        }

        return true;
    }

    public function wp_update_attachment_metadata($metadata, $attachment_id) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $metadata;}
        if ($this->get_cdn_host() === 'media') {return $metadata;}
        $sizes = wp_get_registered_image_subsizes();
        if (empty($sizes)) {return $metadata;}
        // 
        foreach ($sizes as $size => $size_data) {
            $_resized = $this->get_resized_url($attachment_id, [
                'w' => $size_data['width'],
                'h' => $size_data['height'],
                'fit' => 'cover',
                // 'c' => $size_data['crop'] ? 'crop' : 'scale',
                // 'q' => $size_data['quality'] ?? 80,
                'mime_type' => $size_data['mime_type'] ?? $metadata['mime_type'] ?? 'image/jpeg',
            ], true);
            $metadata['sizes'][$size] = [
                ...wp_parse_args((array) $size_data, [
                    // 'file' => $metadata['sizes'][$size]['file'] ?? $metadata['file'] ?? '',
                    'file' => $_resized['path'],
                    'width' => $_resized['width'],
                    'height' => $_resized['height'],
                    'mime_type' => $_resized['mime_type'] ?? $metadata['mime_type'] ?? '',
                    // 'filesize' => 0,
                    'crop' => false,
                    'quality' => 80
                ]),
                'url' => $_resized['url']
            ];
        }
        return $metadata;
    }

    public function intermediate_image_sizes_advanced($sizes, $attachment_id, $metadata) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $sizes;}
        if ($this->get_cdn_host() === 'media') {return $sizes;}
        // $this->sizes2_generate = $sizes;
        return [];
    }

    public function media_row_actions($actions, $post, $detached) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $actions;}
        if ($this->get_cdn_host() === 'media') {return $actions;}
        $_already = get_post_meta(get_the_ID(), '_cdn_link', true);
        if (!empty($_already)) {return $actions;}
        $actions['send_to_cdn'] = sprintf('<a href="%s" aria-label="%s" data-post_id="%s">%s</a>', '#', __('Send to CDN', 'site-core'), esc_attr(get_the_ID()), esc_html(sprintf(__('Send to %s', 'site-core'), apply_filters('pm_project/system/getoption', 'cdn-provider', 'media'))));
        return $actions;
    }

    public function api_send_attachment(WP_REST_Request $request) {
        $post_id = (int) $request->get_param('post_id');

        if (empty($post_id)) {
            return new WP_Error('invalid_post_id', 'Invalid post id provided!');
        }

        $_already = get_post_meta($post_id, '_cdn_link', true);
        if (!empty($_already)) {
            return new WP_Error('already_uploaded', 'This attachment already uploaded!');
        }
        
        $this->handle_upload($post_id);
        
        return rest_ensure_response(['success' => true]);
    }
    
	public function admin_enqueue_scripts($curr_page) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        // if ($curr_page != 'settings_page_site-core') {return;}
        wp_enqueue_script('site-core-cdn', WP_SITECORE_BUILD_JS_URI . '/cdn.js', [], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/cdn.js'), true);
    }

    
    public function add_bulk_send_to_cdn_action($bulk_actions) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $bulk_actions;}
        if ($this->get_cdn_host() === 'media') {return $bulk_actions;}
        $bulk_actions['send_to_cdn'] = __('Send to CDN', 'site-core');
        return $bulk_actions;
    }
    public function handle_bulk_send_to_cdn_action($redirect_to, $action, $post_ids) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $redirect_to;}
        if ($this->get_cdn_host() === 'media') {return $redirect_to;}
        if ($action !== 'send_to_cdn') {
            return $redirect_to;
        }

        if (empty($post_ids)) {
            return $redirect_to;
        }

        $processed_count = 0;
        foreach ($post_ids as $post_id) {
            if (wp_attachment_is_image($post_id) || get_post_type($post_id) === 'attachment') {
                $file_path = get_attached_file($post_id);
                $_exists = get_post_meta($post_id, '_cdn_link', true);
                if ($file_path && !$_exists) {
                    $processed_count++;
                    $this->handle_upload($post_id);
                }
            }
        }
        $redirect_to = add_query_arg('sent_to_cdn', $processed_count, $redirect_to);
        return $redirect_to;
    }
    public function cdn_bulk_action_admin_notice() {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return;}
        if ($this->get_cdn_host() === 'media') {return;}
        if (!empty($_REQUEST['sent_to_cdn'])) {
            $sent_count = intval($_REQUEST['sent_to_cdn']);
            printf(
                '<div class="notice notice-success"><p>%s</p></div>', 
                sprintf(__('%d file(s) have been sent to CDN.', 'site-core'), $sent_count)
            );
        }
    }

    public function wp_get_attachment_image_attributes($attr, $attachment, $size) {
        if (apply_filters('pm_project/system/isactive', 'cdn-paused')) {return $attr;}
        if ($this->get_cdn_host() === 'media') {return $attr;}
        $image_id = $attachment->ID;
        if (empty($attr['src'])) {return $attr;}
        if (!empty($attr['srcset'])) {return $attr;}
        // $image_sizes = get_intermediate_image_sizes();
        $metadata = wp_get_attachment_metadata($image_id);
        $sources = [];
        foreach ($metadata['sizes'] as $size_key => $size) {
            if (empty($size['width']) || empty($size['height'])) {continue;}
            $image = $this->wp_get_attachment_image_src(null, $image_id, [$size['width'], $size['height']]);
            if (!$image) {continue;}
            $sources[] = $image[0] . ' ' . $size['width'] . 'w';
        }
        if (!empty($sources)) {
            $attr['srcset'] = implode(', ', $sources);
        }
        // print_r($attr);wp_die('Remal Mahmud');
        return $attr;
    }


    
}
