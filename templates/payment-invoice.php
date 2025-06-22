<?php
/**
 * Payment Invoice Template
 *
 * This file is loaded when visiting /invoice/[invoice-id]/pay
 */
get_header();
$config = [
    'phonecode' => apply_filters('pm_project/system/getoption', 'checkout-default-phonecode', false),
    'middlename' => apply_filters('pm_project/system/getoption', 'checkout-enable-middlename', false),
    'emirate' => apply_filters('pm_project/system/getoption', 'checkout-enable-emirate', false),
    'city' => apply_filters('pm_project/system/getoption', 'checkout-enable-city', false),
    'overview' => apply_filters('pm_project/system/getoption', 'checkout-enable-overview', false),
    'pbk' => apply_filters('pm_project/system/getoption', 'payment-tap-publickey', false),
    'bg' => apply_filters('pm_project/system/getoption', 'payment-invoice-bg', false),
];
?>
<div id="payment-invoice" data-config="<?php echo esc_attr(base64_encode(json_encode($config))); ?>"></div>

<style>#header, #footer {display: none;}</style>


<style>
#bookContainer {position: relative;width: 600px;height: 400px;overflow: hidden;perspective: 1000px;}
#rightPage {width: 50%;height: 100%;position: absolute;top: 0;right: 0;transform-origin: left center;transition: transform 0.7s ease-in-out, opacity 0.7s ease-in-out;}
.closed #rightPage {transform: rotateY(180deg);opacity: 0;}
</style>

<?php
wp_enqueue_style('site-core-invoice');
wp_enqueue_script('site-core-invoice');
get_footer();
