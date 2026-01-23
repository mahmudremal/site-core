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
        <div id="primary" class="container mx-auto p-4 md:p-6 lg:p-8">
            <main id="main" class="site-main">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Image Gallery -->
                    <div class="lg:col-span-1">
                        <!-- Placeholder for image slides -->
                        <div class="space-y-2">
                            <?php for ($i = 0; $i < 4; $i++) : ?>
                                <img src="https://placehold.co/100" alt="Product Thumbnail" class="w-full cursor-pointer border-2 border-transparent hover:border-blue-500">
                            <?php endfor; ?>
                        </div>
                    </div>

                    <!-- Main Image -->
                    <div class="lg:col-span-5">
                        <?php 
                        if ( has_post_thumbnail() ) {
                            the_post_thumbnail('large', ['class' => 'w-full rounded-lg']);
                        } else {
                            echo '<img src="https://placehold.co/600x600" alt="No product image" class="w-full rounded-lg">';
                        }
                        ?>
                    </div>

                    <!-- Product Info & Sidebar -->
                    <div class="lg:col-span-6">
                        <h1 class="text-3xl font-bold mb-2"><?php the_title(); ?></h1>
                        <div class="flex items-center mb-4">
                            <span class="text-yellow-500"><?php echo do_shortcode('[svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-filled"] [svg icon="star-half"]'); ?></span>
                            <span class="ml-2 text-gray-600">(4.5)</span>
                        </div>
                        
                        <div class="text-4xl font-bold mb-4">
                            <?php
                            $price = get_post_meta(get_the_ID(), 'price', true);
                            if ( $price ) {
                                echo esc_html($price);
                            }
                            ?>
                        </div>

                        <div class="mb-6">
                            <button class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">Add to Cart</button>
                        </div>

                        <!-- Shipping Info -->
                        <div class="border-t border-b py-4 mb-6">
                            <div class="flex justify-between text-sm">
                                <span>Standard shipping</span>
                                <span>$5.00</span>
                            </div>
                            <div class="text-xs text-gray-500">Est. delivery: Sep 14 - Oct 18</div>
                        </div>

                        <!-- Shop with confidence -->
                        <div class="mb-6">
                            <h3 class="font-bold mb-2">Shop with confidence</h3>
                            <ul class="list-disc list-inside text-sm space-y-1">
                                <li>Buyer Protection</li>
                                <li>30 day returns</li>
                                <li>Easy access to support</li>
                                <li>Secure, flexible payment options</li>
                            </ul>
                            <a href="#" class="text-blue-600 text-sm">[Learn more]</a>
                        </div>
                        
                        <div class="text-sm text-gray-600 mb-6">Items are sold and shipped by Unique Bargains</div>
                    </div>
                </div>

                <!-- Additional Product Details -->
                <div class="mt-12">
                    <!-- Customer Reviews -->
                    <div class="border-t pt-8 mb-8">
                        <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>
                        <!-- Review list placeholder -->
                    </div>

                    <!-- Description -->
                    <div class="border-t pt-8 mb-8">
                        <h2 class="text-2xl font-bold mb-4">Description</h2>
                        <div class="prose max-w-none">
                            <?php the_content(); ?>
                        </div>
                    </div>

                    <!-- Sold By -->
                    <div class="border-t pt-8 mb-8">
                        <h2 class="text-2xl font-bold mb-4">Sold By</h2>
                        <!-- Seller info placeholder -->
                    </div>

                    <!-- Related Products -->
                    <div class="border-t pt-8">
                        <h2 class="text-2xl font-bold mb-4">Related Products</h2>
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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