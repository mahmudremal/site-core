<?php
namespace SITE_CORE\inc;

use Elementor\Controls_Manager;
use ElementorPro\Modules\DynamicTags\Tags\Base\Data_Tag;
use ElementorPro\Modules\DynamicTags\Module as DynamicTagsModule;
use ElementorPro\Modules\QueryControl\Module as QueryModule;

if (!defined('ABSPATH')) {
    exit;
}

class Elementor_Affiliate_Links_Tags extends Data_Tag {
    public function get_name() {
        return 'affiliate-links';
    }

    public function get_group() {
        return DynamicTagsModule::SITE_GROUP;
    }

    public function get_categories() {
        return [DynamicTagsModule::URL_CATEGORY, DynamicTagsModule::TEXT_CATEGORY];
    }

    public function get_title() {
        return esc_html(__('Affiliate Links', 'site-core'));
    }

    public function get_panel_template() {
        return ' ({{ url }})';
    }

    public function get_value(array $options = []) {
        $settings = $this->get_settings();
        $type = $settings['type'] ?? '';

        if (empty($settings['link_id']) || !in_array($type, ['link', 'title', 'shortcode', 'original_url', 'comments', 'info', 'created_at', 'updated_at'])) {
            return '';
        }

        $link = Affiliate::get_instance()->get_link((int) $settings['link_id']);
        
        if (!$link || empty($link->_status) || empty($link->url) || $link->_status !== 'active') {
            return '';
        }

        switch ($type) {
            case 'link':
                return $link->url;
            case 'title':
                return $link->title;
            case 'shortcode':
                return $link->shortcode;
            case 'original_url':
                return $link->link;
            case 'comments':
                return $link->comments;
            case 'info':
                return $link->_info;
            case 'created_at':
                return $link->created_at;
            case 'updated_at':
                return $link->updated_at;
            default:
                return '';
        }

    }

    protected function register_controls() {
        $this->add_control('type', [
            'label' => esc_html__('Type', 'site-core'),
            'type' => Controls_Manager::SELECT,
            'options' => [
                'link' => esc_html__('Link', 'site-core'),
                'title' => esc_html__('Title', 'site-core'),
                'shortcode' => esc_html__('Shortcode', 'site-core'),
                'original_url' => esc_html__('Original URL', 'site-core'),
                'comments' => esc_html__('Comments', 'site-core'),
                'info' => esc_html__('Info', 'site-core'),
                'created_at' => esc_html__('Created At', 'site-core'),
                'updated_at' => esc_html__('Updated At', 'site-core')
            ],
            'default' => 'link',
        ]);

        $this->add_control('link_id', [
            'label' => esc_html__('Search & Select', 'site-core'),
            'type' => QueryModule::QUERY_CONTROL_ID,
            'label_block' => true,
            'autocomplete' => [
                'object'   => 'custom',
                'display'  => 'detailed',
                'filter_type' => 'sitecore-elem-affiliate-links',
                // 'query'    => ['custom_table' => Affiliate::get_instance()->get_table('links')],
            ],
        ]);


    }

    


    public function render() {
        $value = $this->get_value();
        $type  = $this->get_settings('type');

        if (in_array($type, ['link', 'original_url'], true)) {
            echo esc_url($value);
        } else {
            echo esc_html($value);
        }
    }



}