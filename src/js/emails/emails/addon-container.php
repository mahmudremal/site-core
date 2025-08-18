<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class Container {
    use Singleton;
    
    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }
    
    public function get_name() {
        return 'container';
    }
    
    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }
    
    public function render($element) {
        // Helper function to get field value by id from element data
        $get_setting_value = function($element, $tab, $section, $key, $default = '') {
            if (!isset($element['data'][$tab][$section])) return $default;
            
            // Handle both array structure and fields structure
            $sectionData = $element['data'][$tab][$section];
            
            // If it's an array of field objects (like in your JSON)
            if (is_array($sectionData) && isset($sectionData[0]) && isset($sectionData[0]['id'])) {
                foreach ($sectionData as $field) {
                    if ($field['id'] === $key) {
                        return $field['value'] ?? $default;
                    }
                }
            }
            // If it's a fields structure (nested)
            elseif (isset($sectionData['fields'])) {
                foreach ($sectionData['fields'] as $field) {
                    if ($field['id'] === $key) {
                        return $field['value'] ?? $default;
                    }
                }
            }
            
            return $default;
        };

        // Get layout settings
        $layout_type = $get_setting_value($element, 'content', 'layout', 'layout_type', 'columns');
        $columns = max(1, intval($get_setting_value($element, 'content', 'layout', 'columns', 1)));
        $rows = max(1, intval($get_setting_value($element, 'content', 'layout', 'rows', 1)));
        $flex_direction = $get_setting_value($element, 'content', 'layout', 'flex_direction', 'row');

        // Get spacing settings
        $column_gap = intval($get_setting_value($element, 'content', 'spacing', 'column_gap', 20));
        $row_gap = intval($get_setting_value($element, 'content', 'spacing', 'row_gap', 20));
        $padding = $get_setting_value($element, 'content', 'spacing', 'padding', ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0]);

        // Get alignment settings
        $justify_content = $get_setting_value($element, 'content', 'alignment', 'justify_content', 'flex-start');
        $align_items = $get_setting_value($element, 'content', 'alignment', 'align_items', 'stretch');
        $flex_wrap = $get_setting_value($element, 'content', 'alignment', 'flex_wrap', 'nowrap');

        // Get background settings
        $background_type = $get_setting_value($element, 'style', 'background', 'background_type', 'none');
        $background_color = $get_setting_value($element, 'style', 'background', 'background_color', '#ffffff');

        // Get border settings
        $border_width = intval($get_setting_value($element, 'style', 'border', 'border_width', 0));
        $border_style = $get_setting_value($element, 'style', 'border', 'border_style', 'solid');
        $border_color = $get_setting_value($element, 'style', 'border', 'border_color', '#e2e8f0');
        $border_radius = intval($get_setting_value($element, 'style', 'border', 'border_radius', 0));

        // Build container styles
        $styles = [];
        $styles[] = "column-gap: {$column_gap}px";
        $styles[] = "row-gap: {$row_gap}px";
        $styles[] = "padding: {$padding['top']}px {$padding['right']}px {$padding['bottom']}px {$padding['left']}px";
        $styles[] = "border-width: {$border_width}px";
        $styles[] = "border-style: {$border_style}";
        $styles[] = "border-color: {$border_color}";
        $styles[] = "border-radius: {$border_radius}px";
        $styles[] = "min-height: 60px";
        $styles[] = "position: relative";

        // Get advanced settings for additional styling
        $enable_margin = $get_setting_value($element, 'advanced', 'layout', 'enableMargin', false);
        $enable_padding = $get_setting_value($element, 'advanced', 'layout', 'enablePadding', false);
        $enable_shadow = $get_setting_value($element, 'advanced', 'styling', 'enableShadow', false);
        $enable_border = $get_setting_value($element, 'advanced', 'styling', 'enableBorder', false);
        $enable_advanced = $get_setting_value($element, 'advanced', 'advanced', 'enableAdvanced', false);

        // Advanced margin settings
        if ($enable_margin) {
            $margin_top = $get_setting_value($element, 'advanced', 'layout', 'marginTop', '');
            $margin_right = $get_setting_value($element, 'advanced', 'layout', 'marginRight', '');
            $margin_bottom = $get_setting_value($element, 'advanced', 'layout', 'marginBottom', '');
            $margin_left = $get_setting_value($element, 'advanced', 'layout', 'marginLeft', '');
            
            if ($margin_top || $margin_right || $margin_bottom || $margin_left) {
                $margin_values = [
                    $margin_top ?: '0',
                    $margin_right ?: '0', 
                    $margin_bottom ?: '0',
                    $margin_left ?: '0'
                ];
                $styles[] = "margin: " . implode(' ', $margin_values);
            }
        }

        // Advanced padding settings (override basic padding if enabled)
        if ($enable_padding) {
            $padding_top = $get_setting_value($element, 'advanced', 'layout', 'paddingTop', '');
            $padding_right = $get_setting_value($element, 'advanced', 'layout', 'paddingRight', '');
            $padding_bottom = $get_setting_value($element, 'advanced', 'layout', 'paddingBottom', '');
            $padding_left = $get_setting_value($element, 'advanced', 'layout', 'paddingLeft', '');
            
            if ($padding_top || $padding_right || $padding_bottom || $padding_left) {
                $padding_values = [
                    $padding_top ?: '0',
                    $padding_right ?: '0',
                    $padding_bottom ?: '0', 
                    $padding_left ?: '0'
                ];
                // Override basic padding
                $styles = array_filter($styles, function($style) {
                    return !strpos($style, 'padding:');
                });
                $styles[] = "padding: " . implode(' ', $padding_values);
            }
        }

        // Advanced shadow settings
        if ($enable_shadow) {
            $shadow_size = $get_setting_value($element, 'advanced', 'styling', 'shadowSize', 'medium');
            $shadow_map = [
                'small' => '0 1px 3px rgba(0,0,0,0.12)',
                'medium' => '0 4px 6px rgba(0,0,0,0.1)', 
                'large' => '0 10px 25px rgba(0,0,0,0.15)'
            ];
            $styles[] = "box-shadow: " . ($shadow_map[$shadow_size] ?? $shadow_map['medium']);
        }

        // Advanced border settings (override basic border if enabled)
        if ($enable_border) {
            $adv_border_color = $get_setting_value($element, 'advanced', 'styling', 'borderColor', 'gray');
            $adv_border_width = $get_setting_value($element, 'advanced', 'styling', 'borderWidth', '1');
            
            $border_color_map = [
                'gray' => '#e2e8f0',
                'red' => '#ef4444',
                'blue' => '#3b82f6',
                'green' => '#10b981'
            ];
            
            // Override basic border settings
            $styles = array_filter($styles, function($style) {
                return !strpos($style, 'border-width:') && !strpos($style, 'border-color:');
            });
            
            $styles[] = "border-width: {$adv_border_width}px";
            $styles[] = "border-color: " . ($border_color_map[$adv_border_color] ?? $adv_border_color);
        }

        // Advanced background color (override basic background if set)
        $adv_bg_color = $get_setting_value($element, 'advanced', 'styling', 'backgroundColor', '');
        if ($adv_bg_color && $adv_bg_color !== 'white') {
            $bg_color_map = [
                'white' => '#ffffff',
                'gray' => '#f3f4f6', 
                'blue' => '#dbeafe',
                'red' => '#fef2f2',
                'green' => '#f0fdf4'
            ];
            
            // Override background color
            $styles = array_filter($styles, function($style) {
                return !strpos($style, 'background-color:');
            });
            
            $styles[] = "background-color: " . ($bg_color_map[$adv_bg_color] ?? $adv_bg_color);
        }

        // Advanced width settings
        $width_setting = $get_setting_value($element, 'advanced', 'layout', 'width', 'default');
        $custom_width = $get_setting_value($element, 'advanced', 'layout', 'customWidth', '');
        
        if ($width_setting !== 'default') {
            if ($width_setting === 'custom' && $custom_width) {
                $styles[] = "width: {$custom_width}";
            } elseif ($width_setting === 'full') {
                $styles[] = "width: 100%";
            }
        }

        // Advanced CSS properties
        if ($enable_advanced) {
            $z_index = $get_setting_value($element, 'advanced', 'advanced', 'zIndex', '');
            if ($z_index) {
                $styles[] = "z-index: {$z_index}";
            }
        }

        // Add layout-specific styles
        switch ($layout_type) {
            case 'columns':
                $styles[] = "display: grid";
                $styles[] = "grid-template-columns: repeat({$columns}, 1fr)";
                break;
            case 'rows':
                $styles[] = "display: grid";
                $styles[] = "grid-template-rows: repeat({$rows}, 1fr)";
                break;
            case 'grid':
                $styles[] = "display: grid";
                $styles[] = "grid-template-columns: repeat({$columns}, 1fr)";
                $styles[] = "grid-template-rows: repeat({$rows}, 1fr)";
                break;
            case 'flex':
                $styles[] = "display: flex";
                $styles[] = "flex-direction: {$flex_direction}";
                $styles[] = "justify-content: {$justify_content}";
                $styles[] = "align-items: {$align_items}";
                $styles[] = "flex-wrap: {$flex_wrap}";
                break;
            default:
                $styles[] = "display: grid";
                $styles[] = "grid-template-columns: 1fr";
        }

        $style_string = implode('; ', $styles);

        // Initialize container structure
        $total_cells = 1;
        if ($layout_type === 'columns') {
            $total_cells = $columns;
        } elseif ($layout_type === 'rows') {
            $total_cells = $rows;
        } elseif ($layout_type === 'grid') {
            $total_cells = $columns * $rows;
        }

        // Get or initialize structure
        $structure = $element['structure'] ?? ['cells' => []];
        
        // Initialize cells if needed
        while (count($structure['cells']) < $total_cells) {
            $structure['cells'][] = [
                'id' => 'cell_' . count($structure['cells']),
                'children' => []
            ];
        }

        // Remove excess cells
        $structure['cells'] = array_slice($structure['cells'], 0, $total_cells);

        // Start building HTML with advanced attributes
        $css_id = '';
        $css_classes = 'container';
        
        if ($enable_advanced) {
            $adv_css_id = $get_setting_value($element, 'advanced', 'advanced', 'cssId', '');
            $adv_css_classes = $get_setting_value($element, 'advanced', 'advanced', 'cssClasses', '');
            
            if ($adv_css_id) {
                $css_id = " id=\"{$adv_css_id}\"";
            }
            
            if ($adv_css_classes) {
                $css_classes .= " {$adv_css_classes}";
            }
        }

        $html = "<div class=\"{$css_classes}\"{$css_id} style=\"{$style_string}\" data-element-id=\"{$element['id']}\" data-element-type=\"container\">";

        // Render each cell
        foreach ($structure['cells'] as $cell_index => $cell_data) {
            $cell_styles = [
                "min-height: 40px",
                "position: relative"
            ];
            
            $cell_style_string = implode('; ', $cell_styles);
            
            $html .= "<div class=\"container-cell\" style=\"{$cell_style_string}\">";
            
            // Render cell children
            if (!empty($cell_data['children'])) {
                foreach ($cell_data['children'] as $child_index => $child_element) {
                    // Apply render filter for child elements
                    $child_html = apply_filters('do_render_element', '', $child_element);
                    $html .= "<div class=\"child-element\">{$child_html}</div>";
                }
            } else {
                // Empty cell placeholder
                $html .= "<div class=\"empty-cell\" style=\"min-height: 40px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic;\">Cell " . ($cell_index + 1) . "</div>";
            }
            
            $html .= "</div>";
        }

        $html .= "</div>";

        return $html;
    }
}