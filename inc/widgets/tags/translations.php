<?php
namespace SITE_CORE\inc;

use Elementor\Controls_Manager;
use ElementorPro\Modules\DynamicTags\Tags\Base\Data_Tag;
use ElementorPro\Modules\DynamicTags\Module as DynamicTagsModule;

if (!defined('ABSPATH')) {
    exit;
}

class Elementor_Translations_Tags extends Data_Tag {
    public function get_name() {
        return 'translations';
    }

    public function get_group() {
        return DynamicTagsModule::SITE_GROUP;
    }

    public function get_categories() {
        return [DynamicTagsModule::TEXT_CATEGORY];
    }

    public function get_title() {
        return esc_html(__('Translations', 'site-core'));
    }

    public function get_value(array $options = []) {
        $settings = $this->get_settings();
        $text = $settings['text'] ?? '';
        $text_domain = $settings['text_domain'] ?? 'site-core';

        if (empty($text)) {
            return '';
        }

        return __($text, $text_domain);
    }

    protected function register_controls() {
        $this->add_control('text', [
            'label' => esc_html__('Text to Translate', 'site-core'),
            'type' => Controls_Manager::TEXTAREA,
            'default' => esc_html__('Hello, World!', 'site-core'),
        ]);

        $this->add_control('text_domain', [
            'label' => esc_html__('Text Domain', 'site-core'),
            'type' => Controls_Manager::SELECT,
            'options' => $this->get_text_domains(),
            'default' => 'site-core',
        ]);
    }

    protected function get_text_domains() {
        $text_domains = [];
        $text_domains['site-core'] = 'Site Core';

        $active_plugins = get_option('active_plugins', []);
        foreach ($active_plugins as $plugin) {
            $plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin);
            $text_domains[$plugin_data['TextDomain']] = $plugin_data['Name'];
        }

        $themes = wp_get_themes();
        foreach ($themes as $theme) {
            $text_domains[$theme->get('TextDomain')] = $theme->get('Name');
        }

        $all_plugins = get_plugins();
        foreach ($all_plugins as $plugin_file => $plugin_data) {
            if (!in_array($plugin_file, $active_plugins)) {
                $text_domains[$plugin_data['TextDomain']] = $plugin_data['Name'];
            }
        }

        return $text_domains;
    }

    public function render() {
        $value = $this->get_value();
        echo esc_html($value);
    }
}