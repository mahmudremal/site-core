<?php
/**
 * Sidebar template part which will be like sidebar filters follwoing current query.
 * 
 * This should be well designed.
 */

$current_term = get_queried_object();
?>

<div class="space-y-8">
    <!-- Category Filter -->
    <div class="filter-widget">
        <h3 class="text-lg font-semibold mb-4">All Categories</h3>
        <ul class="space-y-2">
            <?php
            $categories = get_terms([
                'taxonomy' => 'sc_product_category',
                'hide_empty' => false,
                'parent' => 0,
            ]);

            function render_category_list($categories, $current_term, $depth = 0) {
                $indent_class = 'pl-' . ($depth * 4);
                foreach ($categories as $category) {
                    $is_active = ($current_term && $category->term_id === $current_term->term_id);
                    $active_class = $is_active ? 'font-bold text-blue-600' : 'hover:text-blue-600';
                    
                    echo '<li class="' . $indent_class . '">';
                    echo '<a href="' . esc_url(get_term_link($category)) . '" class="' . $active_class . '">' . esc_html($category->name) . '</a>';

                    $children = get_terms([
                        'taxonomy' => 'sc_product_category',
                        'hide_empty' => false,
                        'parent' => $category->term_id,
                    ]);
                    if ($children) {
                        echo '<ul class="space-y-2 mt-2">';
                        render_category_list($children, $current_term, $depth + 1);
                        echo '</ul>';
                    }
                    echo '</li>';
                }
            }

            render_category_list($categories, $current_term);
            ?>
        </ul>
    </div>

    <!-- Tags Filter -->
    <div class="filter-widget">
        <h3 class="text-lg font-semibold mb-4">Tags</h3>
        <div class="flex flex-wrap gap-2">
            <?php
            $tags = get_terms([
                'taxonomy' => 'sc_product_tag',
                'hide_empty' => true,
            ]);
            foreach ($tags as $tag) {
                $is_active = ($current_term && $tag->term_id === $current_term->term_id);
                $active_class = $is_active ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300';
                echo '<a href="' . esc_url(get_term_link($tag)) . '" class="px-3 py-1 rounded-full text-sm ' . $active_class . '">' . esc_html($tag->name) . '</a>';
            }
            ?>
        </div>
    </div>

    <!-- Price Range Filter -->
    <div class="filter-widget">
        <h3 class="text-lg font-semibold mb-4">Price Range</h3>
        <div class="space-y-4">
            <!-- This is a placeholder for a price range slider -->
            <input type="range" min="0" max="1000" class="w-full">
            <div class="flex justify-between text-sm">
                <span>$0</span>
                <span>$1000</span>
            </div>
        </div>
    </div>
</div>