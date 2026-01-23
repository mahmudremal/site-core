<?php
/**
 * Product card template which will be included inside wordpress posts loop.
 * 
 * Should be simple card. with an image, price (also implement discounted price id applicable)
 * You'll put like [10 brought this] for static now. later I'll work on this.
 * 
 */

// Assuming $product is fetched or available
$price = get_post_meta(get_the_ID(), 'price', true);
$sale_price = get_post_meta(get_the_ID(), 'sale_price', true);
$stock = get_post_meta(get_the_ID(), 'stock', true);

?>
<div class="group relative border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
    <a href="<?php the_permalink(); ?>">
        <?php if (has_post_thumbnail()) : ?>
            <?php the_post_thumbnail('medium', ['class' => 'w-full h-48 object-cover']); ?>
        <?php else : ?>
            <img src="https://placehold.co/300x300" alt="Placeholder Image" class="w-full h-48 object-cover">
        <?php endif; ?>
    </a>

    <div class="p-4">
        <h2 class="text-lg font-semibold truncate">
            <a href="<?php the_permalink(); ?>" class="hover:text-blue-600"><?php the_title(); ?></a>
        </h2>

        <div class="mt-2 flex items-baseline">
            <?php if ($sale_price && $sale_price < $price) : ?>
                <span class="text-xl font-bold text-red-600"><?php echo esc_html($sale_price); ?></span>
                <span class="ml-2 text-sm text-gray-500 line-through"><?php echo esc_html($price); ?></span>
            <?php elseif ($price) : ?>
                <span class="text-xl font-bold"><?php echo esc_html($price); ?></span>
            <?php endif; ?>
        </div>

        <div class="mt-2 text-sm text-gray-500">
            <span>[10 bought this]</span>
        </div>

        <?php if ($stock === '0') : ?>
            <div class="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 rounded">Sold Out</div>
        <?php endif; ?>
    </div>
</div>
