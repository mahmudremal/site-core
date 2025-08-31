<?php
namespace SITE_CORE\inc\Emails\Addons;

use SITE_CORE\inc\Traits\Singleton;

class BasicHTML {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-html';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $contentFields = $element->data->content->html ?? [];
        $styleFields = $element->data->style->htmlStyle ?? [];
        $advancedFields = $element->data->advanced->htmlAdvanced ?? [];

        // Helper to get value by id in array of objects
        $getValue = function($group, $id, $fallback = '') {
            if (!is_array($group)) return $fallback;
            foreach ($group as $field) {
                if (isset($field->id) && $field->id === $id) {
                    return $field->value ?? $fallback;
                }
            }
            return $fallback;
        };

        $htmlCode = $getValue($contentFields, 'code', '');
        $padding = $getValue($styleFields, 'padding', '0px');
        $margin = $getValue($styleFields, 'margin', '0px');
        $background = $getValue($styleFields, 'background', 'transparent');
        $customClass = $getValue($advancedFields, 'customClass', '');
        $customId = $getValue($advancedFields, 'customId', '');

        // Sanitize output where necessary except htmlCode (assuming trusted or filtered elsewhere)
        $style = "padding: {$padding}; margin: {$margin}; background: {$background};";
        $classAttr = $customClass ? ' class="' . esc_attr($customClass) . '"' : '';
        $idAttr = $customId ? ' id="' . esc_attr($customId) . '"' : '';

        return "<div style=\"$style\"$classAttr$idAttr>$htmlCode</div>";
    }
}
