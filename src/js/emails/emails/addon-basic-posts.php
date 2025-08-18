<?php
namespace SITE_CORE\inc\Emails\Addons;

use SITE_CORE\inc\Traits\Singleton;

class BasicPosts {
    use Singleton;

    protected function __construct() {
        add_filter('do_render_element', [$this, 'return_render'], 1, 2);
        add_filter('sitecore/email/queries/posts', function($default, $request) {
            $payload = $request->get_param('payload');
            return [
                'templates' => [
                    ['id' => 1, 'name' => 'Welcome Email'],
                    ['id' => 2, 'name' => 'Newsletter']
                ]
            ];
        }, 10, 2);
    }

    public function get_name() {
        return 'basic-posts';
    }

    public function return_render($def, $element) {
        if ($element['type'] != $this->get_name()) return $def;
        return $this->render($element);
    }

    public function render($element) {
        $get = function ($group, $id, $default = '') {
            foreach ($group as $field) {
                if ($field['id'] === $id) {
                    return $field['value'] ?? $default;
                }
            }
            return $default;
        };

        $query    = $element['data']['content']['query'] ?? [];
        $layout   = $element['data']['style']['layout'] ?? [];
        $display  = $element['data']['advanced']['display'] ?? [];

        $postType     = $get($query, 'postType', 'post');
        $postsPerPage = (int) $get($query, 'postsPerPage', 6);
        $order        = $get($query, 'order', 'DESC');
        $orderby      = $get($query, 'orderby', 'date');
        $taxonomy     = $get($query, 'taxonomy', '');
        $terms        = $get($query, 'terms', '');

        $layoutType = $get($layout, 'layout', 'grid');
        $columns    = (int) $get($layout, 'columns', 3);
        $gap        = $get($layout, 'gap', '20px');

        $showImage   = filter_var($get($display, 'showImage', true), FILTER_VALIDATE_BOOLEAN);
        $showTitle   = filter_var($get($display, 'showTitle', true), FILTER_VALIDATE_BOOLEAN);
        $showExcerpt = filter_var($get($display, 'showExcerpt', true), FILTER_VALIDATE_BOOLEAN);
        $showMeta    = filter_var($get($display, 'showMeta', false), FILTER_VALIDATE_BOOLEAN);

        $args = [
            'post_type'      => $postType,
            'posts_per_page' => $postsPerPage,
            'order'          => $order,
            'orderby'        => $orderby
        ];

        if ($taxonomy && $terms) {
            $args['tax_query'] = [
                [
                    'taxonomy' => $taxonomy,
                    'field'    => 'slug',
                    'terms'    => array_map('trim', explode(',', $terms))
                ]
            ];
        }

        $query_posts = new \WP_Query($args);

        if (!$query_posts->have_posts()) {
            return '<div>No posts found.</div>';
        }

        $style = $layoutType === 'grid'
            ? "display:grid;grid-template-columns:repeat($columns,1fr);gap:$gap;"
            : "display:flex;flex-direction:column;gap:$gap;";

        ob_start();
        echo "<div style=\"$style\">";
        while ($query_posts->have_posts()) {
            $query_posts->the_post();
            echo '<div class="post-card" style="border:1px solid #eee;border-radius:4px;overflow:hidden;">';
            if ($showImage && has_post_thumbnail()) {
                echo get_the_post_thumbnail(get_the_ID(), 'full', ['style' => 'width:100%;height:auto;']);
            }
            echo '<div style="padding:16px;">';
            if ($showTitle) {
                echo '<h3 style="margin:0 0 10px;">' . esc_html(get_the_title()) . '</h3>';
            }
            if ($showMeta) {
                echo '<div style="font-size:12px;color:#888;">' . get_the_date() . ' by ' . get_the_author() . '</div>';
            }
            if ($showExcerpt) {
                echo '<p>' . esc_html(get_the_excerpt()) . '</p>';
            }
            echo '</div></div>';
        }
        echo '</div>';
        wp_reset_postdata();
        return ob_get_clean();
    }
}
