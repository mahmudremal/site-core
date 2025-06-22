<?php
$status = 'unknown';
$provider = isset($_GET['tap_id']) ? 'tap' : (
    isset($_GET['stripe_id']) ? 'stripe' : ''
);
$invoice_id = get_query_var('partnership_payment') ?? null;
// 
$payload = [
    ...$_GET,
    ...$_POST,
    'invoice_id' => $invoice_id
];
$verify = apply_filters('partnersmanagerpayment/verify', null, $payload, $provider, true);

$transaction = $verify['transection'] ?? [];

$status = $transaction['status'] ?? $status;

// if ($status == 'DECLINED') {
//     $transaction['status'] = $status = 'success';
//     $verify['status'] = $verify['success'] = true;
// }

if (isset($verify['success']) && $verify['success'] === true) {
    $status = 'success';
    do_action('partnersmanagerpayment/done', $status, $transaction);
}

// echo '<pre>';print_r($verify);echo '</pre>';wp_die();


// get the header
get_header();

// switch the status
switch ($status) {
    case 'success':
        $message = [
            'status' => 'success',
            'title' => __('Payment Successful', 'site-core'),
            'message' => __('Your payment has been successfully processed. Thank you for your purchase.', 'site-core'),
            'button' => __('Launch Tools', 'site-core'),
            'icon' => 'fa-check-circle',
        ];
        break;
    case 'cancel':
        $message = [
            'status' => 'cancel',
            'title' => __('Payment Cancelled', 'site-core'),
            'message' => __('Your transaction has been cancelled. You can try again or contact our support team for assistance.', 'site-core'),
            'button' => __('Try Again', 'site-core'),
            'icon' => 'fa-times-circle',
        ];
        break;
    case 'fail':
        $message = [
            'status' => 'fail',
            'title' => __('Payment Failed', 'site-core'),
            'message' => __('Sorry, your payment failed. Please try again or contact our support team for assistance.', 'site-core'),
            'button' => __('Try Again', 'site-core'),
            'icon' => 'fa-exclamation-circle',
        ];
        break;
    default:
        $message = [
            'status' => $status,
            'title' => __(ucfirst(strtolower($status)) . ' Payment Status', 'site-core'),
            'message' => __('We\'re sorry, but we\'re unable to confirm your payment. Please contact our support team for assistance.', 'site-core'),
            'button' => __('Contact Support', 'site-core'),
            'icon' => 'fa-question-circle',
        ];
        break;
}

?>
<div class="payment-status <?php echo esc_attr(strtolower($message['status'])); ?>">
    <h2><i class="fa <?php echo esc_attr($message['icon']); ?>"></i> <?php echo esc_html($message['title']); ?></h2>
    <p><?php echo esc_html($message['message']); ?></p>
    <a
        href="<?php echo esc_attr(home_url('/')); ?>"
        class="btn btn-primary" data-payment-object="<?php echo esc_attr(
        // ''
        substr(base64_encode(json_encode(['payload' => $payload, 'payment' => $verify])), 0, -1)
        ); ?>"><?php echo esc_html($message['button']); ?></a>
</div>
<style>
    .payment-status {
        display: flex;
        min-height: 60vh;
        align-items: center;
        flex-direction: column;
        justify-content: center;
    }
</style>
<?php
// get the footer
get_footer();
?>