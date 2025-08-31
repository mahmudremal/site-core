<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicShortcode {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-shortcode';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $contentFields  = $element['data']['content']['shortcode'] ?? [];
        $styleFields    = $element['data']['style']['shortcodeStyle'] ?? [];
        $advancedFields = $element['data']['advanced']['shortcodeAdvanced'] ?? [];

        $get = function($fields, $id, $default = '') {
            foreach ($fields as $f) {
                if (($f['id'] ?? '') === $id) {
                    return $f['value'] ?? $default;
                }
            }
            return $default;
        };

        $shortcode = trim($get($contentFields, 'code', ''));
        $textAlign = $get($styleFields, 'textAlign', 'center');
        $padding   = $get($styleFields, 'padding', '0px');
        $background = $get($styleFields, 'background', 'transparent');
        $wrapInDiv = $get($advancedFields, 'wrapInDiv', true);
        $wrapInDiv = $wrapInDiv === true || $wrapInDiv === 'true';

        if (empty($shortcode)) {
            return '<div style="padding:20px;border:2px dashed #ccc;border-radius:4px;text-align:center;color:#999;font-style:italic;">No shortcode provided</div>';
        }

        $output = do_shortcode($shortcode);

        if (!$wrapInDiv) {
            return $output;
        }

        $style = 'text-align:' . esc_attr($textAlign) . ';padding:' . esc_attr($padding) . ';background:' . esc_attr($background) . ';';

        return '<div class="shortcode-wrapper" style="' . $style . '">' . $output . '</div>';
    }
}
