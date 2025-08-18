<?php
/**
 * Text Editor addon class.
 *
 * @package PartnershipManager
 */
namespace SITE_CORE\inc\Emails;
use SITE_CORE\inc\Traits\Singleton;

class Addons {
    use Singleton;

    protected $addons = [];

    protected function __construct() {
        $this->setup_hooks();
        $this->setup_addons();
    }

    protected function setup_hooks() {
        add_filter('do_render_email_template', [$this, 'render_template'], 0, 2);
    }

    protected function setup_addons() {
        // $addon_files = glob(WP_SITECORE_DIR_PATH . '/inc/widgets/emails/addon-*.php');
        $addon_files = glob(WP_SITECORE_DIR_PATH . '\\src\\js\\emails\\emails\\addon-*.php');
        if (empty($addon_files)) {return;}
        foreach ($addon_files as $file) {
            require_once $file;
            $class_name = $this->get_class_name_from_file($file);

            $this->addons[] = $class_name;

            // if (class_exists($class_name) && method_exists($class_name, 'get_instance')) {
                call_user_func([$class_name, 'get_instance']);
            // }
        }
    }
    
    protected function get_class_name_from_file($file_path) {
        $filename = basename($file_path, '.php');
        $parts = explode('-', $filename);
        array_shift($parts);
        $class_suffix = implode('', array_map('ucfirst', $parts));
        return __NAMESPACE__ . '\\Addons\\' . $class_suffix;
    }

    public function render_template($def = null, $template = []) {
        $result = '';
        $result .= '<div class="email-template" style="margin: auto;max-width: 1050px;padding: 50px 10px;border: 1px solid #eee;">';
        $result .= '<div class="email-template__body">';
        if (is_string($template)) {
            $template = maybe_unserialize($template);
        }
        $template = (array) $template;
        if (is_string($template['_template'])) {
            $template['_template'] = maybe_unserialize($template['_template']);
        }
        foreach ($template['_template']['elements'] ?? [] as $element) {
            $result .= sprintf('<div class="emailelement-%s emailelement-id-%s">', $element['type'], $element['id']);
            $result .= apply_filters('do_render_element', '', $element);
            $result .= '</div>';
        }
        $result .= '</div>';
        $result .= '</div>';
        return $result;
    }
    

}