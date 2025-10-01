<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_User_Query;
use WP_Error;

class Editor {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_filter('rest_api_init', [$this, 'rest_api_init']);
		add_action('wp_ajax_put_ai_content', [$this, 'put_ai_content']);
		add_action('wp_ajax_nopriv_put_ai_content', [$this, 'put_ai_content']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
        add_filter('admin_enqueue_scripts', [$this, 'enqueue_editor_scripts_and_styles']);
    }
    
    public function rest_api_init() {
		if (apply_filters('pm_project/system/isactive', 'editor-disabled')) {return;}
		register_rest_route('sitecore/v1', '/ai/content/put', [
			'methods' => 'POST',
			'callback' => [$this, 'api_submit_ai_content'],
			'permission_callback' => '__return_true' // [Security::get_instance(), 'permission_callback']
		]);
    }

    public function settings($args) {
		$args['editor']		= [
			'title'							=> __('Editor', 'site-core'),
			'description'					=> __('Wordpress editor to control your wordpress closely to improve performace and necessity first.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'editor-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Mark to disable AI editor on post edit screen.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
			]
		];
        return $args;
    }

	public function put_ai_content() {
		if (apply_filters('pm_project/system/isactive', 'editor-disabled')) {return;}
		$response = $_POST;
		wp_send_json_success($response);
	}
	
	function enqueue_editor_scripts_and_styles($hook) {
		if (apply_filters('pm_project/system/isactive', 'editor-disabled')) {return;}
		if ('post.php' === $hook || 'post-new.php' === $hook) {
			// wp_enqueue_style('task-ai-editor', WP_SITECORE_BUILD_CSS_URI . '/editor.css', [], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_CSS_DIR_PATH . '/editor.css'), 'all');
			wp_enqueue_script('task-ai-editor', WP_SITECORE_BUILD_JS_URI . '/editor.js', [], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/editor.js'), true);
			wp_localize_script('task-ai-editor', '_aieditor_config', [
				'_id' => get_the_ID(),
				'_rest' => home_url('/wp-json/sitecore/v1'),
				'_nonce' => site_url('_ai_editor_nonce'),
				'_locale' => get_user_locale(),
			]);
		}
	}

	public function api_submit_ai_content(WP_REST_Request $request) {
		global $wpdb;$response = ['status' => false];
		$_operation_type = $request->get_param('area');

		if ($_operation_type == 'cpt') {
			$post_id = $request->get_param('post_id');
			$post_title = $request->get_param('post_title');
			$post_content = $request->get_param('post_content');
			$metadata = $request->get_param('metadata');
			if (empty($title) || empty($content) || empty($metadata)) {
				$response = new WP_Error('fields_empty', "Fields shouldn't be blank", ['status' => 500]);
			}
			$response = wp_insert_post([
				'ID' => $post_id,
				'post_title' => $post_title,
				'post_content' => $post_content,
			], true);
		}
		return rest_ensure_response($response);
	}
    
}