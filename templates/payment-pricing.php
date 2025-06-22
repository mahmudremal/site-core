<?php
/**
 * Payment Invoice Template
 *
 * This file is loaded when visiting /pricing/
 */
get_header();
?>

<div id="payment-pricing"></div>

<?php
wp_enqueue_style('site-core-pricing');
wp_enqueue_script('site-core-pricing');
get_footer();
