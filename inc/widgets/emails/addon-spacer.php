<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class Spacer {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'spacer';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        if (!isset($element['data']['layout']['spacer']) || !is_array($element['data']['layout']['spacer'])) {
            return '<div></div>';
        }

        $spacer = $element['data']['layout']['spacer'];

        $get_field_value = function($id, $default = '') use ($spacer) {
            foreach ($spacer as $field) {
                if (isset($field['id']) && $field['id'] === $id) {
                    return $field['value'] ?? $default;
                }
            }
            return $default;
        };

        $height = $get_field_value('height', '40px');
        $showLine = $get_field_value('showLine') === true || $get_field_value('showLine') === 'true';
        $lineColor = $get_field_value('lineColor', '#ccc');
        $lineThickness = $get_field_value('lineThickness', '1px');

        if ($showLine) {
            return '<hr style="height:' . esc_attr($lineThickness) . ';background-color:' . esc_attr($lineColor) . ';border:none;margin:0;margin-top:' . esc_attr($height) . ';margin-bottom:' . esc_attr($height) . ';width:100%;" />';
        }

        return '<div style="height:' . esc_attr($height) . ';"></div>';
    }
}
