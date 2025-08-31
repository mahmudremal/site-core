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
<div class="xpo_group xpo_relative xpo_border xpo_rounded-lg xpo_overflow-hidden xpo_bg-white hover:xpo_shadow-lg xpo_transition-shadow">
    <a href="<?php the_permalink(); ?>">
        <?php if (has_post_thumbnail()) : ?>
            <?php the_post_thumbnail('medium', ['class' => 'xpo_w-full xpo_h-48 xpo_object-cover']); ?>
        <?php else : ?>
            <img src="https://via.placeholder.com/300x300" alt="Placeholder Image" class="xpo_w-full xpo_h-48 xpo_object-cover">
        <?php endif; ?>
    </a>

    <div class="xpo_p-4">
        <h2 class="xpo_text-lg xpo_font-semibold xpo_truncate">
            <a href="<?php the_permalink(); ?>" class="hover:xpo_text-blue-600"><?php the_title(); ?></a>
        </h2>

        <div class="xpo_mt-2 xpo_flex xpo_items-baseline">
            <?php if ($sale_price && $sale_price < $price) : ?>
                <span class="xpo_text-xl xpo_font-bold xpo_text-red-600"><?php echo esc_html($sale_price); ?></span>
                <span class="xpo_ml-2 xpo_text-sm xpo_text-gray-500 xpo_line-through"><?php echo esc_html($price); ?></span>
            <?php elseif ($price) : ?>
                <span class="xpo_text-xl xpo_font-bold"><?php echo esc_html($price); ?></span>
            <?php endif; ?>
        </div>

        <div class="xpo_mt-2 xpo_text-sm xpo_text-gray-500">
            <span>[10 bought this]</span>
        </div>

        <?php if ($stock === '0') : ?>
            <div class="xpo_absolute xpo_top-2 xpo_left-2 xpo_bg-black xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded">Sold Out</div>
        <?php endif; ?>
    </div>
</div>
