<?php
namespace SITE_CORE\inc\Emails\Addons;
use SITE_CORE\inc\Traits\Singleton;

class BasicPricingTable {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
    }

    public function get_name() {
        return 'basic-pricing-table';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $fields         = $element['data']['content']['pricing'] ?? [];
        $styleFields    = $element['data']['style']['tableStyle'] ?? [];
        $advancedFields = $element['data']['advanced']['tableAdvanced'] ?? [];

        $get = function($group, $id, $default = '') {
            foreach ($group as $f) {
                if (($f['id'] ?? '') === $id) {
                    return $f['value'] ?? $default;
                }
            }
            return $default;
        };

        $getBool = function($group, $id, $default = false) use ($get) {
            $value = $get($group, $id, $default);
            return $value === true || $value === 'true';
        };

        $title      = $get($fields, 'title', 'Basic Plan');
        $price      = $get($fields, 'price', '$0');
        $features   = [];

        foreach ($fields as $f) {
            if (($f['id'] ?? '') === 'features' && isset($f['value']) && is_array($f['value'])) {
                $features = $f['value'];
                break;
            }
        }

        $buttonText = $get($fields, 'buttonText', 'Get Started');
        $buttonUrl  = $get($fields, 'buttonUrl', '#');

        $borderRadius = $get($styleFields, 'borderRadius', '8px');
        $boxShadow    = $get($styleFields, 'shadow', '0 0 10px rgba(0,0,0,0.05)');
        $background   = $get($styleFields, 'background', '#fff');
        $textAlign    = $get($styleFields, 'textAlign', 'center');
        $primaryColor = $get($styleFields, 'primaryColor', '#4f46e5');

        $highlight      = $getBool($advancedFields, 'highlight', false);
        $highlightLabel = $get($advancedFields, 'highlightLabel', 'Popular');

        ob_start();
        ?>
        <div class="pricing-table<?php echo $highlight ? ' highlighted' : ''; ?>" style="border-radius: <?php echo esc_attr($borderRadius); ?>; box-shadow: <?php echo esc_attr($boxShadow); ?>; background: <?php echo esc_attr($background); ?>; padding: 24px; text-align: <?php echo esc_attr($textAlign); ?>; position: relative; overflow: hidden;">
            <?php if ($highlight): ?>
                <div style="position: absolute; top: 12px; right: -40px; background: <?php echo esc_attr($primaryColor); ?>; color: #fff; padding: 4px 40px; transform: rotate(45deg); font-size: 12px; font-weight: bold;">
                    <?php echo esc_html($highlightLabel); ?>
                </div>
            <?php endif; ?>
            <h3 style="margin: 0 0 12px;"><?php echo esc_html($title); ?></h3>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 16px;"><?php echo esc_html($price); ?></div>
            <ul style="list-style: none; padding: 0; margin: 0; margin-bottom: 24px;">
                <?php foreach ($features as $f): ?>
                    <?php
                        $text = $f['text'] ?? '';
                        $available = ($f['available'] ?? false) === true || $f['available'] === 'true';
                        $color = $available ? '#333' : '#999';
                        $iconColor = $available ? esc_attr($primaryColor) : '#ccc';
                        $icon = $available ? '✓' : '✕'; // Use UTF-8 fallback
                    ?>
                    <li style="display: flex; align-items: center; justify-content: <?php echo esc_attr($textAlign); ?>; color: <?php echo esc_attr($color); ?>; margin-bottom: 8px; gap: 6px;">
                        <span style="color: <?php echo esc_attr($iconColor); ?>;"><?php echo $icon; ?></span>
                        <span><?php echo esc_html($text); ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
            <a href="<?php echo esc_url($buttonUrl); ?>" style="display: inline-block; padding: 10px 20px; background: <?php echo esc_attr($primaryColor); ?>; color: #fff; border-radius: 4px; text-decoration: none; font-weight: bold;">
                <?php echo esc_html($buttonText); ?>
            </a>
        </div>
        <?php
        return ob_get_clean();
    }
}
