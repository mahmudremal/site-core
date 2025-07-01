<?php
/**
 * Translation management class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Translations {
	use Singleton;

    private $directory;
    private $_trans_list;

	protected function __construct() {
        $this->directory = untrailingslashit(WP_SITECORE_DIR_PATH . '/languages/translations');
		$this->setup_hooks();
	}
	protected function setup_hooks() {
        add_shortcode('__', [$this, 'translate_shortcode']);
        add_action('shutdown', [$this, 'update_trans_list']);
		add_action('rest_api_init', [$this, 'rest_api_init']);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
	}
    public function rest_api_init() {
        register_rest_route('sitecore/v1', '/languages', [
			'methods' => 'GET',
			'callback' => [$this, 'get_languages'],
			'permission_callback' => '__return_true'
		]);
        register_rest_route('sitecore/v1', '/translations/(?P<language>[^/]+)/list', [
			'methods' => 'GET',
			'callback' => [$this, 'get_translations'],
			'permission_callback' => '__return_true'
		]);
		register_rest_route('sitecore/v1', '/translations', [
			'methods' => 'POST',
			'callback' => [$this, 'post_translation'],
			'permission_callback' => [Security::get_instance(), 'permission_callback'],
            'args'                => [
                'language' => [
                    'required'    => true,
                    'type'        => 'string',
                    'description' => __('The language code for the translation.', 'site-core'),
                ],
                'list'    => [
                    'required'    => true,
                    'type'        => ['array', 'object'],
                    'description' => __('An list object of languages as per key: value structure.', 'site-core'),
                ]
            ]
		]);
		register_rest_route('sitecore/v1', '/locale', [
			'methods' => 'POST',
			'callback' => [$this, 'set_user_locale'],
			'permission_callback' => [Security::get_instance(), 'permission_callback'],
            'args'                => [
                'language' => [
                    'required'    => true,
                    'type'        => 'string',
                    'description' => __('The language code for the translation.', 'site-core'),
                ],
                'user_id'    => [
                    'required'    => true,
                    'type'        => 'integer',
                    'description' => __('User id to set that language as default language.', 'site-core'),
                ]
            ]
		]);
    }

    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'translations/')) {
            $abilities[] = 'translations';
        }
        return $abilities;
    }
    
    public function get_trans_list($string = false) {
        if (!$this->_trans_list) {
            $this->_trans_list = (object) [
                'update' => false,
                'list' => (array) json_decode(file_get_contents($this->language_path($language)), true)
            ];
        }
        if (!$string) {
            return $this->_trans_list->list;
        }
        if (!isset($this->_trans_list->list[$string])) {
            $this->_trans_list->list[$string] = $string;
            $this->_trans_list->update = true;
        }
        return $this->_trans_list->list[$string];
    }
    public function update_trans_list() {
        if ($this->_trans_list && isset($this->_trans_list->update) && $this->_trans_list->update) {
            $updated = file_put_contents($this->language_path('en'), json_encode($this->_trans_list->list));
        }
    }
    
    public function language_path($language) {
        return $this->directory . '/' . $language . '.json';
    }
    public function get_languages(WP_REST_Request $request) {
        $languages = [];
        if (is_dir($this->directory)) {
            $files = glob($this->directory . '/*.json');
            foreach ($files as $file) {
                $languages[] = basename($file, '.json');
            }
        }
        return rest_ensure_response($languages);
    }
	public function get_translations(WP_REST_Request $request) {
		$language = $request->get_param('language');$data = [];
        if (file_exists($this->language_path($language)) && !is_dir($this->language_path($language))) {
            $data = (array) json_decode(file_get_contents($this->language_path($language)), true);
        }
		return rest_ensure_response($data);
	}
	public function post_translation(WP_REST_Request $request) {
		$language = $request->get_param('language');
		$list = $request->get_param('list');
        
        if (file_exists($this->language_path($language)) && !is_dir($this->language_path($language))) {
            $data = (array) json_decode(file_get_contents($this->language_path($language)), true);
            foreach ($list as $key => $value) {$data[$key] = $value;}
            file_put_contents($this->language_path($language), json_encode($data));
            return ['success' => true];
        }
		
		return ['success' => false];
	}
	public function set_user_locale(WP_REST_Request $request) {
		$language = $request->get_param('language');
		$user_id = (int) $request->get_param('user_id');

        if ($language && !empty($language) && $user_id && !empty($user_id)) {
            $updated = update_user_meta($user_id, 'partnership_dashboard_locale', $language);
            return ['success' => $updated];
        }
		
		return ['success' => false];
	}

    public function translate_shortcode($atts) {
        $atts = shortcode_atts(['text' => ''], $atts, '__');
        if (empty($atts['text']) && !empty($atts['t'])) {
            $atts['text'] = $atts['t'];
        }
        if (empty($atts['text'])) {
            return '';
        }
        return __($atts['text'], 'site-core');
        $_added = $this->get_trans_list($atts['text']);
        return $_added ? $_added : __($atts['text'], 'site-core');
    }
    
}