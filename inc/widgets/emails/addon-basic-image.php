<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicImage {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-image';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $data = $element['data']['content'] ?? [];

        // Helper to get field value
        $get = function($section, $id, $default = '') use ($data) {
            if (empty($data[$section]) || !is_array($data[$section])) {
                return $default;
            }
            foreach ($data[$section] as $field) {
                if (($field['id'] ?? '') === $id) {
                    return $field['value'] ?? $default;
                }
            }
            return $default;
        };

        // Content fields
        $src = trim($get('imageContent', 'src', ''));
        $alt = htmlspecialchars($get('imageContent', 'alt', 'Image'), ENT_QUOTES);
        $title = htmlspecialchars($get('imageContent', 'title', ''), ENT_QUOTES);
        $caption = trim($get('imageContent', 'caption', ''));

        // Settings fields
        $width = $get('imageSettings', 'width', 'auto');
        $customWidth = $get('imageSettings', 'customWidth', '');
        $height = $get('imageSettings', 'height', 'auto');
        $customHeight = $get('imageSettings', 'customHeight', '');
        $objectFit = $get('imageSettings', 'objectFit', 'cover');
        $alignment = $get('imageSettings', 'alignment', 'center');

        // Effects
        $enableBorderRadius = filter_var($get('imageEffects', 'enableBorderRadius', false), FILTER_VALIDATE_BOOLEAN);
        $borderRadius = $get('imageEffects', 'borderRadius', 'medium');
        $customBorderRadius = $get('imageEffects', 'customBorderRadius', '');
        $enableHoverEffect = filter_var($get('imageEffects', 'enableHoverEffect', false), FILTER_VALIDATE_BOOLEAN);
        $hoverEffect = $get('imageEffects', 'hoverEffect', 'zoom');
        $enableLazyLoad = filter_var($get('imageEffects', 'enableLazyLoad', true), FILTER_VALIDATE_BOOLEAN);

        // Link
        $enableLink = filter_var($get('linkSettings', 'enableLink', false), FILTER_VALIDATE_BOOLEAN);
        $linkUrl = trim($get('linkSettings', 'linkUrl', ''));
        $linkTarget = $get('linkSettings', 'linkTarget', '_self');

        // Placeholder if no image src
        if ($src === '') {
            return $this->placeholder('Please add an image URL');
        }

        // Styles
        $widthCss = ($width === 'custom' && $customWidth !== '') ? $customWidth : ($width === 'auto' ? 'auto' : $width);
        $heightCss = ($height === 'custom' && $customHeight !== '') ? $customHeight : ($height === 'auto' ? 'auto' : $height);

        $borderRadiusMap = [
            'small' => '4px',
            'medium' => '8px',
            'large' => '16px',
            'xl' => '24px',
            'full' => '50%',
            'custom' => $customBorderRadius ?: '8px'
        ];
        $borderRadiusCss = $enableBorderRadius ? ($borderRadiusMap[$borderRadius] ?? '8px') : '0';

        $containerStyle = 'text-align: '.esc_attr($alignment).';';
        switch ($alignment) {
            case 'left': $containerStyle .= ' margin: 0 auto 0 0;'; break;
            case 'right': $containerStyle .= ' margin: 0 0 0 auto;'; break;
            default: $containerStyle .= ' margin: 0 auto;'; break;
        }

        $imageStyle = "display: block; max-width: 100%; width: {$widthCss}; height: {$heightCss}; object-fit: {$objectFit}; border-radius: {$borderRadiusCss};";
        if ($enableHoverEffect) {
            $imageStyle .= " transition: all 0.3s ease;";
        }

        // Hover effect class
        $hoverClass = $enableHoverEffect ? 'basic-image-hover-' . esc_attr($hoverEffect) : '';

        // Build image HTML
        $img = '<img src="' . esc_url($src) . '" alt="' . $alt . '" title="' . $title . '" loading="' . ($enableLazyLoad ? 'lazy' : 'eager') . '" style="' . $imageStyle . '" class="basic-image-element ' . $hoverClass . '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';" />';

        // Wrap in link if enabled
        if ($enableLink && $linkUrl !== '') {
            $img = '<a href="' . esc_url($linkUrl) . '" target="' . esc_attr($linkTarget) . '" style="display:inline-block; text-decoration:none; outline:none;">' . $img . '</a>';
        }

        // Caption HTML
        $captionHtml = '';
        if ($caption !== '') {
            $captionEscaped = nl2br(esc_html($caption));
            $captionHtml = '<div style="margin-top:8px; font-size:14px; color:#666; font-style:italic; text-align:' . esc_attr($alignment) . ';">' . $captionEscaped . '</div>';
        }

        // Error fallback HTML
        $errorFallback = '<div style="display:none; padding:20px; border:2px dashed #ff6b6b; border-radius:8px; text-align:center; color:#ff6b6b; background-color:#fff5f5;">'
            . '<p>Failed to load image</p><small>' . esc_html($src) . '</small></div>';

        return '<div style="' . $containerStyle . '" class="basic-image-container">'
            . $img
            . $errorFallback
            . $captionHtml
            . '</div>';
    }

    protected function placeholder($text) {
        return '<div style="padding:40px 20px; border:2px dashed #ddd; border-radius:8px; text-align:center; color:#999; background-color:#f9f9f9;">'
            . '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image" viewBox="0 0 24 24" style="margin-bottom:10px; opacity:0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="M21 15l-5-5L5 21"></path></svg>'
            . '<p>' . esc_html($text) . '</p>'
            . '</div>';
    }
}
