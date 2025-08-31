<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicSocials {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-socials';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }


    public function render($element) {
        $contentFields = $element['data']['content']['socials'] ?? [];
        $styleFields = $element['data']['style']['iconStyle'] ?? [];
        $advancedFields = $element['data']['advanced']['advancedOptions'] ?? [];

        $get = function($fields, $id, $default = '') {
            foreach ($fields as $f) {
                if (isset($f['id']) && $f['id'] === $id) {
                    return $f['value'] ?? $default;
                }
            }
            return $default;
        };

        $getBool = function($fields, $id, $default = false) use ($get) {
            $val = $get($fields, $id, $default);
            return $val === true || $val === 'true';
        };

        $size = $get($styleFields, 'size', '24px');
        $color = $get($styleFields, 'color', '#333');
        $background = $get($styleFields, 'background', 'transparent');
        $borderRadius = $get($styleFields, 'borderRadius', '50%');
        $gap = $get($styleFields, 'gap', '12px');
        $alignment = $get($styleFields, 'alignment', 'center');

        $openNewTab = $getBool($advancedFields, 'openNewTab', true);
        $nofollow = $getBool($advancedFields, 'nofollow', false);

        $itemsField = null;
        foreach ($contentFields as $f) {
            if (isset($f['id']) && $f['id'] === 'items') {
                $itemsField = $f;
                break;
            }
        }

        $items = is_array($itemsField['value'] ?? null) ? $itemsField['value'] : [];

        if (empty($items)) {
            return '<div>No social data</div>';
        }

        $justify = [
            'left' => 'flex-start',
            'center' => 'center',
            'right' => 'flex-end'
        ];
        $containerStyle = 'display:flex;justify-content:' . ($justify[$alignment] ?? 'center') . ';gap:' . esc_attr($gap) . ';';

        $iconStyle = 'display:inline-flex;align-items:center;justify-content:center;width:' . esc_attr($size) . ';height:' . esc_attr($size) . ';color:' . esc_attr($color) . ';background:' . esc_attr($background) . ';border-radius:' . esc_attr($borderRadius) . ';text-decoration:none;transition:all 0.3s ease;';

        $iconMap = [
            'facebook' => 'F',
            'twitter' => 'T',
            'linkedin' => 'L',
            'instagram' => 'I',
            'youtube' => 'Y',
            'github' => 'G'
        ];

        $output = '<div style="' . $containerStyle . '">';
        foreach ($items as $item) {
            $icon = $iconMap[$item['icon']] ?? '+';
            $url = esc_url($item['url'] ?? '#');
            $target = $openNewTab ? ' target="_blank"' : '';
            $relAttr = $nofollow ? ' rel="nofollow"' : '';
            $output .= '<a href="' . $url . '"' . $target . $relAttr . ' style="' . $iconStyle . '">' . $icon . '</a>';
        }
        $output .= '</div>';

        return $output;
    }
}
