<?php
/**
 * Category or archive or products listing page where will be one category title, category description and rest of all products.
 * 
 * I want ot show product 5 columns per row but put ability to define here statically. like 3/2/4/5/6 whatever i like i'll set then.
 * 
 */

get_header();

// Get current taxonomy term info
$term = get_queried_object();

// Define the number of columns for the product grid
$grid_columns = 5;

?>

<div class="xpo_container xpo_flex xpo_mx-auto xpo_p-4 md:xpo_p-6 lg:xpo_p-8">
    <!-- Sidebar Filters Section -->
    <aside class="xpo_w-1/4 lg:xpo_w-1/5 xpo_pr-4 md:xpo_pr-6 lg:xpo_pr-8">
        <?php include WP_SITECORE_DIR_PATH . '/templates/theme/template-parts/sidebar-filters.php'; ?>
    </aside>

    <!-- Main Content -->
    <main class="xpo_w-3/4 lg:xpo_w-4/5">
        <h1 class="xpo_text-2xl md:xpo_text-3xl lg:xpo_text-4xl xpo_font-bold xpo_mb-4"><?php echo esc_html($term->name); ?></h1>
        
        <?php if (!empty($term->description)) : ?>
            <div class="xpo_prose xpo_max-w-none xpo_mb-6">
                <?php echo wpautop($term->description); ?>
            </div>
        <?php endif; ?>

        <?php
        // WP Query to get 'sc_product' posts in this taxonomy term
        $args = [
            'post_type' => 'sc_product',
            'posts_per_page' => 20, // Adjust as needed
            'paged' => get_query_var('paged') ? get_query_var('paged') : 1,
            'tax_query' => [[
                'taxonomy' => $term->taxonomy,
                'field' => 'term_id',
                'terms' => $term->term_id,
            ]],
        ];
        $query = new WP_Query($args);

        if ($query->have_posts()) : ?>
            <div class="xpo_grid xpo_grid-cols-<?php echo $grid_columns; ?> xpo_gap-4 md:xpo_gap-6">
                <?php
                while ($query->have_posts()) : $query->the_post(); ?>
                    <?php include WP_SITECORE_DIR_PATH . '/templates/theme/template-parts/product-card.php'; ?>
                <?php endwhile; ?>
            </div>

            <!-- Pagination -->
            <div class="xpo_mt-8">
                <?php
                echo paginate_links([
                    'total' => $query->max_num_pages,
                    'prev_text' => sprintf(__('%s Previous'), do_shortcode('[svg icon="arrow-left"]')),
                    'next_text' => sprintf(__('Next %s'), do_shortcode('[svg icon="arrow-right"]')),
                ]);
                ?>
            </div>

        <?php else : ?>
            <p class="xpo_text-center xpo_text-gray-500">No products found in this category.</p>
        <?php endif;

        wp_reset_postdata();
        ?>
    </main>
</div>

<?php
get_footer();