<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicHeading {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-heading';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $content = $element['data']['content']['heading'] ?? [];
        $style = $element['data']['style']['headingStyle'] ?? [];
        $advanced = $element['data']['advanced']['headingAdvanced'] ?? [];

        $get = function($group, $id, $fallback = '') {
            foreach ($group as $field) {
                if (isset($field['id']) && $field['id'] === $id) {
                    return $field['value'] ?? $fallback;
                }
            }
            return $fallback;
        };

        $text = $get($content, 'text', 'Heading Title');
        $tag = $get($content, 'tag', 'h2');
        $alignment = $get($content, 'alignment', 'left');

        $color = $get($style, 'color', '#222');
        $fontSize = $get($style, 'fontSize', '32px');
        $fontWeight = $get($style, 'fontWeight', '600');
        $lineHeight = $get($style, 'lineHeight', '1.3');
        $letterSpacing = $get($style, 'letterSpacing', '0px');
        $textTransform = $get($style, 'textTransform', 'none');

        $margin = $get($advanced, 'margin', '0 0 20px 0');
        $padding = $get($advanced, 'padding', '0');

        $style_attr = sprintf(
            'color:%s; font-size:%s; font-weight:%s; line-height:%s; letter-spacing:%s; text-transform:%s; text-align:%s; margin:%s; padding:%s;',
            esc_attr($color),
            esc_attr($fontSize),
            esc_attr($fontWeight),
            esc_attr($lineHeight),
            esc_attr($letterSpacing),
            esc_attr($textTransform),
            esc_attr($alignment),
            esc_attr($margin),
            esc_attr($padding)
        );

        $allowed_tags = ['h1','h2','h3','h4','h5','h6','div','span','p'];
        $tag = in_array(strtolower($tag), $allowed_tags) ? $tag : 'h2';

        return sprintf(
            '<%1$s style="%2$s">%3$s</%1$s>',
            $tag,
            $style_attr,
            esc_html($text)
        );
    }
}
