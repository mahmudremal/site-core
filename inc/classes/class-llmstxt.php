<?php
/**
 * A plugin for generating an llms.txt file with complete site details and editable content via the WordPress admin.
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Llmstxt {
    use Singleton;

    private $_optionsKey = 'llms_txt_options';
    
    protected function __construct() {
        $this->setup_hooks();
    }

    protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('init', [$this, 'add_rewrite_rules']);
        add_action('template_redirect', [$this, 'serve_llms_txt']);
    }

    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            __('LLMSTxt Settings', 'domain'),
            __('LLMSTxt', 'domain'),
            'manage_options',
            'llmstxt',
            [$this, 'settings_page']
        );
    }

    public function register_settings() {
        register_setting($this->_optionsKey . '_group', $this->_optionsKey);
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(__('LLMSTxt Settings', 'domain')); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields($this->_optionsKey . '_group'); ?>
                <?php $options = get_option($this->_optionsKey); ?>
                <textarea name="<?php echo esc_attr($this->_optionsKey); ?>" rows="10" style="width: 100%;"><?php echo esc_textarea($options); ?></textarea>
                <p class="description"><?php echo esc_html(__('Customize the content of llms.txt. You can add custom directives, links, etc.', 'domain')); ?></p>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function add_rewrite_rules() {
        add_rewrite_rule('^llms\.txt', 'index.php?llms_txt=1', 'top');
        add_rewrite_tag('%llms_txt%', '([0-9]+)');
    }

    public function serve_llms_txt() {
        if (get_query_var('llms_txt')) {
            header('Content-Type: text/plain');
            header('Access-Control-Allow-Origin: *'); 
            echo $this->generate_llms_txt();
            exit;
        }
    }

    private function generate_llms_txt() {
        $_cached = get_transient($this->_optionsKey);
        if ($_cached) {return $_cached;}
        // 
        $output = "# ". get_bloginfo('name') ."\n\n";
        $output .= "> ". get_bloginfo('description') ."\n\n";
        $output .= "Site URL: ". get_bloginfo('url') ."\n\n";
        // 
        $output .= $this->get_custom_post_types_info();
        $output .= $this->get_term_taxonomies_info();
        // 
        $options = get_option($this->_optionsKey);
        if (!empty($options)) {
            $output .= "# Custom Directives\n\n". $options ."\n";
        }
        // 
        set_transient($this->_optionsKey, $output, 12 * HOUR_IN_SECONDS);
        // 
        return $output;
    }

    private function get_custom_post_types_info() {
        $output = '';

        $custom_post_types = get_post_types(['public' => true], 'objects');
        foreach ($custom_post_types as $post_type) {
            $output .= "## " . $post_type->labels->name . "\n"; 
            $posts = get_posts(['post_type' => $post_type->name, 'numberposts' => -1]);

            foreach ($posts as $post) {
                $output .= "- [" . $post->post_title . "](".get_permalink($post->ID) . "): " . get_the_excerpt($post->ID) . "\n";
            }

            $output .= "\n";
        }

        return $output;
    }

    private function get_term_taxonomies_info() {
        $output = '';
        
        $taxonomies = get_taxonomies(['public' => true], 'objects');
        foreach ($taxonomies as $taxonomy) {
            $terms = get_terms(['taxonomy' => $taxonomy->name, 'hide_empty' => false]);
            if (!empty($terms) && !is_wp_error($terms)) {
                $output .= "## " . $taxonomy-> labels->name . "\n"; 
                foreach ($terms as $term) {
                    $output .= "- [" . $term->name . "](".get_term_link($term) . ")\n";
                }
                $output .= "\n";
            }
        }

        return $output;
    }
}