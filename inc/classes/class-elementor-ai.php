<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Elementor_Ai {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
        add_filter('rest_api_init', [$this, 'rest_api_init']);
		add_action('elementor/preview/enqueue_scripts', [$this, 'enqueue_preview_scripts']);
		add_action('elementor/editor/after_enqueue_scripts', [$this, 'enqueue_scripts'], 10);
	}

	public function enqueue_scripts() {
		wp_enqueue_style('site-core');
		wp_enqueue_script('elementor-ai-writer', WP_SITECORE_BUILD_JS_URI . '/elementor.js', ['elementor-editor', 'jquery'], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/elementor.js'), true);
		wp_localize_script('elementor-ai-writer', 'EAI', [
			'rest'  => esc_url_raw(rest_url('eai/v1/generate')),
			'nonce' => wp_create_nonce('wp_rest')
		]);
	}

	public function enqueue_preview_scripts() {
		wp_enqueue_style('site-core');
		wp_enqueue_script('elementor-ai-writer', WP_SITECORE_BUILD_JS_URI . '/elementor.js', ['elementor-editor', 'jquery'], Assets::get_instance()->filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/elementor.js'), true);
		wp_localize_script('elementor-ai-writer', 'EAI', [
			'rest'  => esc_url_raw(rest_url('eai/v1/preview')),
			'nonce' => wp_create_nonce('wp_rest')
		]);
	}
	public function rest_api_init() {
		if (apply_filters('pm_project/system/isactive', 'editor-disabled')) {return;}
		register_rest_route('sitecore/v1', '/elementor/editor/ai', [
			[
				'methods' => 'POST',
				'callback' => [$this, 'api_generate_ai_content'],
				'permission_callback' => [$this, 'check_permission']
			]
		]);
		register_rest_route('sitecore/v1', '/elementor/editor/ai/transform', [
			[
				'methods' => 'POST',
				'callback' => [$this, 'api_transform_block'],
				'permission_callback' => [$this, 'check_permission']
			]
		]);
		register_rest_route('sitecore/v1', '/elementor/editor/ai/models', [
			[
				'methods' => 'GET',
				'callback' => [$this, 'api_get_models'],
				'permission_callback' => [$this, 'check_permission']
			]
		]);
	}

	public function check_permission($request) {
		return current_user_can('edit_posts');
	}

	public function api_generate_ai_content(WP_REST_Request $request) {
		$params = $request->get_json_params();
		$prompt = $params['prompt'] ?? '';
		
		return rest_ensure_response([
			'status' => 'success',
			'data' => [
				'id' => uniqid(),
				'content' => "Generated content for: " . $prompt,
				'elementor_json' => [
					'elType' => 'container',
					'settings' => [],
					'elements' => [
						[
							'elType' => 'widget',
							'widgetType' => 'text-editor',
							'settings' => [
								'editor' => '<h2>' . esc_html($prompt) . '</h2><p>This is AI generated content...</p>'
							]
						]
					]
				]
			]
		]);
	}

	public function api_transform_block(WP_REST_Request $request) {
		$params = $request->get_json_params();
		return rest_ensure_response([
			'status' => 'success',
			'data' => 'Transformed content'
		]);
	}

	public function api_get_models() {
		return rest_ensure_response([
			'status' => 'success',
			'data' => [
				['id' => 'gpt-4', 'name' => 'GPT-4'],
				['id' => 'gpt-3.5-turbo', 'name' => 'GPT-3.5 Turbo'],
				['id' => 'gemini-pro', 'name' => 'Gemini Pro']
			]
		]);
	}
}

