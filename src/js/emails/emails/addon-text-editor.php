<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class TextEditor {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'text-editor';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        if (!isset($element['data']['content']['textcontent']) || !is_array($element['data']['content']['textcontent'])) {
            return '<div>No content available</div>';
        }

        $textcontent = $element['data']['content']['textcontent'];

        $get_field_value = function($id, $default = '') use ($textcontent) {
            foreach ($textcontent as $field) {
                if (isset($field['id']) && $field['id'] === $id) {
                    return $field['value'] ?? $default;
                }
            }
            return $default;
        };

        $text = $get_field_value('text');
        $dropcap = $get_field_value('dropcap') === true || $get_field_value('dropcap') === 'true';
        $columns = $get_field_value('columns');
        $columns_gap = $get_field_value('columns-gap');

        $styles = [];

        if (!empty($columns) && $columns !== 'Default') {
            $styles[] = 'column-count: ' . intval($columns);
            $styles[] = 'column-fill: balance';

            if (!empty($columns_gap)) {
                $gap = preg_match('/(px|rem|em|%)/', $columns_gap) ? $columns_gap : $columns_gap . 'px';
                $styles[] = 'column-gap: ' . $gap;
            }
        }

        $style_attr = '';
        if (!empty($styles)) {
            $style_attr = ' style="' . implode('; ', $styles) . '"';
        }

        if (empty($text)) {
            return '<div style="padding:20px;color:#999;font-style:italic;border:2px dashed #ddd;border-radius:4px;text-align:center;">Click to add text content</div>';
        }

        $processed_text = nl2br(esc_html($text));

        if ($dropcap) {
            $dropcap_css = '<style>.drop-cap::first-letter{float:left;font-size:3.5em;line-height:1;margin-right:0.1em;margin-top:0.1em;font-weight:bold;color:#333;}</style>';
            return $dropcap_css . '<div class="text-content drop-cap"' . $style_attr . '>' . $processed_text . '</div>';
        }

        return '<div class="text-content"' . $style_attr . '>' . $processed_text . '</div>';
    }
}
