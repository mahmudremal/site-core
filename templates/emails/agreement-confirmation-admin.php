<?php
/**
 * Email Template: Agreement Confirmation for Agency Admin
 * File: agreement-confirmation-admin.php
 */

// Get agency information
$agency = [
    'name' => get_bloginfo('name'),
    'phone' => apply_filters('pm_project/system/getoption', 'services-deal-phone', ''),
    'email' => apply_filters('pm_project/system/getoption', 'services-deal-email', ''),
    'representative' => apply_filters('pm_project/system/getoption', 'services-representative', '')
];

// Client information from agreement
$client = $agreement['record'];
$created_date = date('F j, Y', strtotime($agreement['created_at']));
$agreement_id = $agreement['id'];

// Email subject
$subject = 'New Digital Marketing Agreement Signed - Agreement #' . $agreement_id;

// Email headers
$headers = [
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $agency['name'] . ' <' . $agency['email'] . '>',
];

// Email plain text content
ob_start();
?>
New Digital Marketing Agreement Confirmation

Dear <?php echo esc_html($agency['representative']); ?>,

We are pleased to inform you that a new Digital Marketing Agreement has been successfully signed. Below are the details of the agreement:

------------------------------------------------------------
Agreement ID: <?php echo esc_html($agreement_id); ?>

Client Name: <?php echo esc_html($client['fullName']); ?>

Business Name: <?php echo esc_html($client['businessName']); ?>

Industry: <?php echo esc_html($client['businessIndustry']); ?>

Email: <?php echo esc_html($client['email']); ?>

Phone: <?php echo esc_html($client['phone']); ?>

Agreement Date: <?php echo esc_html($created_date); ?>

------------------------------------------------------------

Services Included:
<?php
if (!empty($agreement['services'])) {
    foreach ($agreement['services'] as $service) {
        echo '• ' . esc_html($service['title']) . " - " . get_the_permalink((int) $service['id']) . "\n\n";
    }
}
?>

Agreement Document:
- <?php echo esc_html($agreement['signature']['url']??''); ?>


Next Steps:
- Review the client's requirements and create a customized strategy.
- Prepare a detailed project timeline within 2-3 business days.
- Schedule a kickoff meeting to discuss the client's goals and expectations.
- Assign a dedicated account manager to coordinate next steps.

If you have any questions or need further information, please feel free to reach out.

Thank you for your attention.

Best regards,
<?php echo esc_html($agency['name']); ?>

<?php if (!empty($agency['phone'])): ?>
Phone: <?php echo esc_html($agency['phone']); ?>

<?php endif; ?>
Email: <?php echo esc_html($agency['email']); ?>
<?php
$message = ob_get_clean();

// Prepare email payload array
$emailPayload = [
    $agency['email'],                    // To
    $subject,                           // Subject  
    $message,                          // Message
    $headers,                          // Headers
];
?>