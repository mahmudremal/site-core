<?php
/**
 * So for the single product, look this will be the main thing. you know, single product is the pearl of the crawn of an ecommerce site.
 * So here i demonstrate how the template layour should be
 * 
 */

get_header();

$header_template = SITE_CORE\inc\Ecommerce\Addons\Template::get_instance()->header_menu();
include $header_template;

if ( have_posts() ) :
    while ( have_posts() ) : the_post();

        // Get product categories and tags
        $categories = get_the_terms( get_the_ID(), 'sc_product_category' );
        $tags = get_the_terms( get_the_ID(), 'sc_product_tag' );
        ?>
        <div id="primary" class="xpo_container xpo_mx-auto xpo_p-4 md:xpo_p-6 lg:xpo_p-8">
            <main id="main" class="site-main">
                <div class="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-12 xpo_gap-8">
                    <!-- Image Gallery -->
                    <div class="lg:xpo_col-span-1">
                        <!-- Placeholder for image slides -->
                        <div class="xpo_space-y-2">
                            <?php for ($i = 0; $i < 4; $i++) : ?>
                                <img src="https://via.placeholder.com/100" alt="Product Thumbnail" class="xpo_w-full xpo_cursor-pointer xpo_border-2 xpo_border-transparent hover:xpo_border-blue-500">
                            <?php endfor; ?>
                        </div>
                    </div>

                    <!-- Main Image -->
                    <div class="lg:xpo_col-span-5">
                        <?php 
                        if ( has_post_thumbnail() ) {
                            the_post_thumbnail('large', ['class' => 'xpo_w-full xpo_rounded-lg']);
                        } else {
                            echo '<img src="https://via.placeholder.com/600x600" alt="No product image" class="xpo_w-full xpo_rounded-lg">';
                        }
                        ?>
                    </div>

                    <!-- Product Info & Sidebar -->
                    <div class="lg:xpo_col-span-6">
                        <h1 class="xpo_text-3xl xpo_font-bold xpo_mb-2"><?php the_title(); ?></h1>
                        <div class="xpo_flex xpo_items-center xpo_mb-4">
                            <span class="xpo_text-yellow-500"><?php echo do_shortcode('[svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-half"]'); ?></span>
                            <span class="xpo_ml-2 xpo_text-gray-600">(4.5)</span>
                        </div>
                        
                        <div class="xpo_text-4xl xpo_font-bold xpo_mb-4">
                            <?php
                            $price = get_post_meta(get_the_ID(), 'price', true);
                            if ( $price ) {
                                echo esc_html($price);
                            }
                            ?>
                        </div>

                        <div class="xpo_mb-6">
                            <button class="xpo_w-full xpo_bg-blue-600 xpo_text-white xpo_font-bold xpo_py-3 xpo_px-6 xpo_rounded-lg hover:xpo_bg-blue-700">Add to Cart</button>
                        </div>

                        <!-- Shipping Info -->
                        <div class="xpo_border-t xpo_border-b xpo_py-4 xpo_mb-6">
                            <div class="xpo_flex xpo_justify-between xpo_text-sm">
                                <span>Standard shipping</span>
                                <span>$5.00</span>
                            </div>
                            <div class="xpo_text-xs xpo_text-gray-500">Est. delivery: Sep 14 - Oct 18</div>
                        </div>

                        <!-- Shop with confidence -->
                        <div class="xpo_mb-6">
                            <h3 class="xpo_font-bold xpo_mb-2">Shop with confidence</h3>
                            <ul class="xpo_list-disc xpo_list-inside xpo_text-sm xpo_space-y-1">
                                <li>Buyer Protection</li>
                                <li>30 day returns</li>
                                <li>Easy access to support</li>
                                <li>Secure, flexible payment options</li>
                            </ul>
                            <a href="#" class="xpo_text-blue-600 xpo_text-sm">[Learn more]</a>
                        </div>
                        
                        <div class="xpo_text-sm xpo_text-gray-600 xpo_mb-6">Items are sold and shipped by Unique Bargains</div>
                    </div>
                </div>

                <!-- Additional Product Details -->
                <div class="xpo_mt-12">
                    <!-- Customer Reviews -->
                    <div class="xpo_border-t xpo_pt-8 xpo_mb-8">
                        <h2 class="xpo_text-2xl xpo_font-bold xpo_mb-4">Customer Reviews</h2>
                        <!-- Review list placeholder -->
                    </div>

                    <!-- Description -->
                    <div class="xpo_border-t xpo_pt-8 xpo_mb-8">
                        <h2 class="xpo_text-2xl xpo_font-bold xpo_mb-4">Description</h2>
                        <div class="xpo_prose xpo_max-w-none">
                            <?php the_content(); ?>
                        </div>
                    </div>

                    <!-- Sold By -->
                    <div class="xpo_border-t xpo_pt-8 xpo_mb-8">
                        <h2 class="xpo_text-2xl xpo_font-bold xpo_mb-4">Sold By</h2>
                        <!-- Seller info placeholder -->
                    </div>

                    <!-- Related Products -->
                    <div class="xpo_border-t xpo_pt-8">
                        <h2 class="xpo_text-2xl xpo_font-bold xpo_mb-4">Related Products</h2>
                        <div class="xpo_grid xpo_grid-cols-2 md:xpo_grid-cols-4 lg:xpo_grid-cols-5 xpo_gap-6">
                            <?php
                            // Example query for related products
                            $related_args = [
                                'post_type' => 'sc_product',
                                'posts_per_page' => 5,
                                'post__not_in' => [get_the_ID()],
                            ];
                            $related_query = new WP_Query($related_args);
                            if ($related_query->have_posts()) {
                                while ($related_query->have_posts()) {
                                    $related_query->the_post();
                                    include WP_SITECORE_DIR_PATH . '/templates/theme/template-parts/product-card.php';
                                }
                            }
                            wp_reset_postdata();
                            ?>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        <?php
    endwhile;
endif;

get_footer();