<?php
namespace SITE_CORE\inc\Emails\Addons;

use SITE_CORE\inc\Traits\Singleton;

class BasicButton {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-button';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        // Helper function to get field value by section and id
        $getFieldValue = function($section, $id, $defaultValue = '') use ($element) {
            $sectionData = $element['data']['content'][$section] ?? $element['data']['style'][$section] ?? null;
            if (!is_array($sectionData)) return $defaultValue;
            foreach ($sectionData as $field) {
                if ($field['id'] === $id) {
                    return $field['value'] ?? $defaultValue;
                }
            }
            return $defaultValue;
        };

        // Get content values
        $text = $getFieldValue('buttonContent', 'text', 'Click Me');
        $title = $getFieldValue('buttonContent', 'title');

        // Get action values
        $url = $getFieldValue('buttonAction', 'url', '');
        $linkTarget = $getFieldValue('buttonAction', 'linkTarget', '_self');

        // Get style values
        $size = $getFieldValue('buttonStyle', 'size', 'medium');
        $fullWidth = $getFieldValue('buttonStyle', 'fullWidth') === true;
        $alignment = $getFieldValue('buttonStyle', 'alignment', 'left');

        // Get custom style values
        $backgroundColor = $getFieldValue('customStyle', 'backgroundColor', '#007bff');
        $textColor = $getFieldValue('customStyle', 'textColor', '#ffffff');
        $borderColor = $getFieldValue('customStyle', 'borderColor', '#007bff');
        $borderRadius = $getFieldValue('customStyle', 'borderRadius', '6px');
        $fontWeight = $getFieldValue('customStyle', 'fontWeight', '500');

        $padding = '8px 16px';
        if ($size === 'small') $padding = '6px 12px';
        if ($size === 'large') $padding = '12px 24px';
        if ($size === 'xl') $padding = '16px 32px';

        // Define styles
        $buttonStyles = sprintf(
            'background-color: %s; color: %s; border: 1px solid %s; border-radius: %s; font-weight: %s; text-decoration: none; display: inline-block; text-align: center; vertical-align: middle; line-height: 1.5; width: %s; padding: %s;',
            $backgroundColor,
            $textColor,
            $borderColor,
            $borderRadius,
            $fontWeight,
            $fullWidth ? '100%%' : 'auto',
            $padding
        );

        // Build the button HTML
        $buttonHtml = sprintf(
            '<div style="text-align: %s;">
                <%s target="%s" title="%s" style="%s" class="basic-button">
                    %s
                </%s>
            </div>',
            $alignment,
            sprintf('%s href="%s"', !empty($url) ? 'a' : 'button', esc_url($url)),
            esc_attr($linkTarget),
            esc_attr($title),
            esc_attr($buttonStyles),
            esc_html($text),
            !empty($url) ? 'a' : 'button'
        );

        return $buttonHtml;
    }
}