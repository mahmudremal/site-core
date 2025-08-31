<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class Divider {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'divider';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        if (!isset($element['data']['content']['devider']['fields']) || !is_array($element['data']['content']['devider']['fields'])) {
            return '<div></div>';
        }

        $fields = $element['data']['content']['devider']['fields'];

        $get = function($id, $default = '') use ($fields) {
            foreach ($fields as $f) {
                if (isset($f['id']) && $f['id'] === $id) {
                    return $f['value'] ?? $default;
                }
            }
            return $default;
        };

        $style = $get('style', 'solid');
        $weight = $get('weight', '1px');
        $color = $get('color', '#e0e0e0');
        $gradientStart = $get('gradientStart', '#6a11cb');
        $gradientEnd = $get('gradientEnd', '#2575fc');
        $width = $get('width', '100%');
        $alignment = $get('alignment', 'center');
        $showIcon = $get('showIcon') === true || $get('showIcon') === 'true';
        $iconType = $get('iconType', 'circle');
        $spacingTop = $get('spacingTop', '16px');
        $spacingBottom = $get('spacingBottom', '16px');

        $justify = [
            'left' => 'flex-start',
            'center' => 'center',
            'right' => 'flex-end'
        ];

        $alignmentCSS = $justify[$alignment] ?? 'center';

        $wrapper_style = 'display:flex;align-items:center;justify-content:' . $alignmentCSS . ';width:' . esc_attr($width) . ';margin-top:' . esc_attr($spacingTop) . ';margin-bottom:' . esc_attr($spacingBottom) . ';';

        if ($showIcon) {
            $wrapper_style .= 'gap:8px;';
        }

        $border_styles = ['solid', 'dashed', 'dotted', 'double'];

        $line_style = '';
        if ($style === 'gradient') {
            $line_style = 'flex:1;height:' . esc_attr($weight) . ';background:linear-gradient(90deg,' . esc_attr($gradientStart) . ',' . esc_attr($gradientEnd) . ');';
        } elseif (in_array($style, $border_styles)) {
            $line_style = 'flex:1;border-top:' . esc_attr($weight) . ' ' . esc_attr($style) . ' ' . esc_attr($color) . ';margin:0;';
        }

        $icon_html = '';
        if ($showIcon) {
            $icon_map = [
                'circle' => '●',
                'star' => '★',
                'heart' => '♥'
            ];
            $icon = $icon_map[$iconType] ?? '';
            $icon_html = '<div style="padding:0 8px;" class="divider-icon">' . $icon . '</div>';
        }

        if (!$showIcon) {
            if ($style === 'gradient') {
                return '<div style="' . $wrapper_style . '" class="divider-wrapper"><div style="' . $line_style . '"></div></div>';
            } else {
                return '<div style="' . $wrapper_style . '" class="divider-wrapper"><div style="' . $line_style . '"></div></div>';
            }
        }

        return '<div style="' . $wrapper_style . '" class="divider-wrapper">'
            . '<div style="' . $line_style . '"></div>'
            . $icon_html
            . '<div style="' . $line_style . '"></div>'
            . '</div>';
    }
}
