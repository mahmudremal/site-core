<?php
namespace SITE_CORE\inc\Emails\Addons;

use SITE_CORE\inc\Traits\Singleton;

class BasicBlackQuota {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'black-quota';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {

        $contentFields = $element['data']['content']['quote'];
        $styleFields = $element['data']['style']['quoteStyle'] ?? [];

        // Helper function to get field value
        $getFieldValue = function($group, $id, $fallback = '') {
            foreach ($group as $field) {
                if ($field['id'] === $id) {
                    return $field['value'] ?? $fallback;
                }
            }
            return $fallback;
        };

        // Get quote content values
        $quoteText = $getFieldValue($contentFields, 'text');
        $author = $getFieldValue($contentFields, 'author');

        // Get style values
        $alignment = $getFieldValue($styleFields, 'alignment', 'center');
        $fontSize = $getFieldValue($styleFields, 'fontSize', '20px');
        $fontColor = $getFieldValue($styleFields, 'fontColor', '#fff');
        $background = $getFieldValue($styleFields, 'background', '#000');
        $padding = $getFieldValue($styleFields, 'padding', '24px');
        $borderRadius = $getFieldValue($styleFields, 'borderRadius', '8px');

        // Build the quote HTML
        $quoteHtml = sprintf(
            '<div style="background: %s; padding: %s; border-radius: %s; color: %s; text-align: %s; font-size: %s; font-style: italic; position: relative;">
                <div style="margin-bottom: 12px;">%s</div>
                %s
            </div>',
            esc_attr($background),
            esc_attr($padding),
            esc_attr($borderRadius),
            esc_attr($fontColor),
            esc_attr($alignment),
            esc_attr($fontSize),
            esc_html($quoteText),
            $author ? sprintf('<div style="font-weight: bold; margin-top: 8px; opacity: 0.85;">— %s</div>', esc_html($author)) : ''
        );

        return $quoteHtml;
    }
}
