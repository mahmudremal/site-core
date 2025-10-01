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
        add_action('init', [$this, 'add_rewrite_rules']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('template_redirect', [$this, 'serve_llms_txt']);
		add_filter('pm_project/settings/fields', [$this, 'settings'], 10, 1);
    }

    public function add_admin_menu() {
        if (apply_filters('pm_project/system/isactive', 'llmstxt-disabled')) {return;}
        add_submenu_page(
            'tools.php',
            __('LLMSTxt Settings', 'site-core'),
            __('LLMSTxt', 'site-core'),
            'manage_options',
            'llmstxt',
            [$this, 'settings_page']
        );
    }

    public function register_settings() {
        register_setting($this->_optionsKey . '_group', $this->_optionsKey);
    }

    public function settings($args) {
        $args['llmstxt'] = [
            'title' => __('LlmsTxt', 'site-core'),
			'description'					=> __('LLMs.txt file configuration for this site.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'llmstxt-disabled',
					'label'					=> __('Disable', 'site-core'),
					'description'			=> __('Mark to disable llmstxt on the site or make it private.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-termtaxs',
					'label'					=> __('Disable Terms', 'site-core'),
					'description'			=> __('Mark to disable terms taxonomies on this site.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-excerpt',
					'label'					=> __('Disable Excerpt', 'site-core'),
					'description'			=> __('Mark to disable post excerpt on llmstxt.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-multilang',
					'label'					=> __('Multi Lang', 'site-core'),
					'description'			=> __('Mark to enable multi language listing on llmstxt.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-cache',
					'label'					=> __('Enable Cache', 'site-core'),
					'description'			=> __('Mark to enable cache for 12 hours on llmstxt.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-mkdlfile',
					'label'					=> __('Downloadable', 'site-core'),
					'description'			=> __('Mark to make llmstxt is a file downloadable.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'llmstxt-posttypes',
					'label'					=> __('Disable Post types', 'site-core'),
					'description'			=> __('Mark to disable custom post types on this site.', 'site-core'),
					'type'					=> 'text',
					'default'				=> '',
                    'attr'                  => [
                        'data-cpts'		=> esc_attr(
							json_encode(
                                // 'public' => false, '_builtin' => true
                                array_values(array_map(function($post_type) {return ['id' => $post_type->name, 'label' => $post_type->labels->name];}, get_post_types([], 'objects')))
                            )
						),
                    ]
				],
			]
        ];
        return $args;
    }
    
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(__('LLMSTxt Settings', 'site-core')); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields($this->_optionsKey . '_group'); ?>
                <?php $options = get_option($this->_optionsKey); ?>
                <textarea name="<?php echo esc_attr($this->_optionsKey); ?>" rows="10" style="width: 100%;"><?php echo esc_textarea($options); ?></textarea>
                <p class="description"><?php echo esc_html(__('Customize the content of llms.txt. You can add custom directives, links, etc.', 'site-core')); ?></p>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function add_rewrite_rules() {
        if (apply_filters('pm_project/system/isactive', 'llmstxt-disabled')) {return;}
        add_rewrite_rule('^([a-z]{2})/llms\.txt$', 'index.php?llms_txt=1', 'top');
        add_rewrite_rule('^llms\.txt', 'index.php?llms_txt=1', 'top');
        add_rewrite_tag('%llms_txt%', '([0-9]+)');
    }

    public function serve_llms_txt() {
        if (get_query_var('llms_txt')) {
            header('Content-Type: text/plain');
            header('Access-Control-Allow-Origin: *');
            if (apply_filters('pm_project/system/isactive', 'llmstxt-mkdlfile')) {
                header('Content-Disposition: attachment; filename="llms.txt"');
            }
            echo $this->generate_llms_txt();
            exit;
        }
    }

    private function generate_llms_txt() {
        if (apply_filters('pm_project/system/isactive', 'llmstxt-disabled')) {
			return 'LLMS.txt file has been disabled by administrative.';
		}
        $current_language = function_exists('pll_current_language') ? pll_current_language() : get_locale();
        $_cache_key = $this->_optionsKey . '_' . $current_language;
        if (apply_filters('pm_project/system/isactive', 'llmstxt-cache')) {
            $_cached = get_transient($_cache_key);
            if ($_cached) {return $_cached;}
        }
        // 
        $output = "# ". get_bloginfo('name') ."\n\n";
        $output .= "> ". get_bloginfo('description') ."\n\n";
        $output .= sprintf(__('Site URL: %s', 'site-core'), home_url('/')) ."\n\n";
        // 
        if (!apply_filters('pm_project/system/isactive', 'llmstxt-posttypes')) {
            $output .= $this->get_custom_post_types_info($current_language);
        }
        if (!apply_filters('pm_project/system/getoption', 'llmstxt-termtaxs', null)) {
            $output .= $this->get_term_taxonomies_info($current_language);
        }
        // 
        $options = get_option($this->_optionsKey);
        if (!empty($options)) {
            $output .= sprintf(__('# Custom Directives: %s', 'site-core'), "\n\n". $options) ."\n";
        }
        $output = apply_filters('sitecore/llmstxt/content', $output, $current_language);
        // Add language links
        if (function_exists('pll_the_languages') && apply_filters('pm_project/system/isactive', 'llmstxt-multilang')) {
            $output .= "\n" . sprintf(__('# Other Language Versions', 'site-core')) . "\n";
            $languages = pll_the_languages(['raw' => 1]);
            $default_language = pll_default_language();
            foreach ($languages as $lang) {
                if ($lang['slug'] === $current_language) {continue;}
                $output .= "- [". esc_html($lang['name']) ."](". site_url(
                    $lang['slug'] === $default_language ? 'llms.txt' : $lang['slug'].'/llms.txt'
                ) .")\n";
            }
        }
        // 
        if (apply_filters('pm_project/system/isactive', 'llmstxt-cache')) {
            set_transient($_cache_key, $output, 12 * HOUR_IN_SECONDS);
        }
        // 
        return $output;
    }

    private function get_custom_post_types_info($current_language) {
        $output = '';
        $post_types = explode(',', apply_filters('pm_project/system/getoption', 'llmstxt-posttypes', 'post,page'));

        foreach ($post_types as $post_type) {
            $pType = get_post_type_object($post_type);
            $post_type_label = ($pType) ? $pType->labels->name : ucfirst($post_type);
            $output .= "## " . $post_type_label . "\n";
            $posts = get_posts(['post_type' => $post_type, 'numberposts' => 200, 'order' => 'DESC', 'orderby' => 'date', 'lang' => $current_language]);
            // 
            foreach ($posts as $post) {
                $output .= sprintf(
                    "- [%s](%s)%s \n",
                    get_the_title($post),
                    get_permalink($post), 
                    !apply_filters('pm_project/system/isactive', 'llmstxt-excerpt') ? sprintf(': %s', get_the_excerpt($post)) : ''
                );
            }
            // 
            $output .= "\n";
        }

        return $output;
    }

    private function get_term_taxonomies_info($current_language) {
        $output = '';
        
        $taxonomies = get_taxonomies(['public' => true], 'objects');
        foreach ($taxonomies as $taxonomy) {
            $terms = get_terms(['taxonomy' => $taxonomy->name, 'hide_empty' => false, 'lang' => $current_language]);
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