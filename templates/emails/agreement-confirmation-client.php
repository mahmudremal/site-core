<?php
/**
 * Email Template: Agreement Confirmation for Client
 * File: agreement-confirmation-client.php
 */

// Get agency information
$agency = [
    'website' => get_site_url(),
    'logo' => apply_filters('pm_project/system/getoption', 'services-logo', ''),
    'pre' => apply_filters('pm_project/system/getoption', 'services-deal-pre', ''),
    'post' => apply_filters('pm_project/system/getoption', 'services-deal-post', ''),
    'phone' => apply_filters('pm_project/system/getoption', 'services-deal-phone', ''),
    'email' => apply_filters('pm_project/system/getoption', 'services-deal-email', ''),
    'address' => apply_filters('pm_project/system/getoption', 'services-deal-address', ''),
    'bankaddress' => apply_filters('pm_project/system/getoption', 'services-bankaddress', ''),
    'agencySignature' => apply_filters('pm_project/system/getoption', 'services-signature', ''),
    'background' => apply_filters('pm_project/system/getoption', 'services-deal-background', '#02424F'),
    'agencyRepresentative' => apply_filters('pm_project/system/getoption', 'services-representative', ''),
];

// Client information from agreement
$client = $agreement['record'];
$services = $agreement['services'];
$created_date = date('F j, Y', strtotime($agreement['created_at']));
$agreement_id = $agreement['id'];

// Generate services list
$services_list = '';
if (!empty($services)) {
    foreach ($services as $service) {
        $services_list .= '• ' . esc_html($service['title']) . '<br>';
    }
}

// Email subject
$subject = 'Digital Marketing Agreement Confirmation'; // - Agreement #' . $agreement_id;

// Email headers
$headers = [
    'Content-Type: text/html; charset=UTF-8',
    'From: ' . get_bloginfo('name') . ' <' . $agency['email'] . '>',
];

// Email attachments
$attachments = [];
if (!empty($_file) && file_exists($_file)) {
    $attachments[] = $_file;
}

// Email HTML content
ob_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html($subject); ?></title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: <?php echo esc_attr($agency['background']); ?>;
            background: linear-gradient(135deg, <?php echo esc_attr($agency['background']); ?> 0%, #1a5460 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 1px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 25px;
        }
        .message {
            color: #555555;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .agreement-details {
            background-color: #f8f9fa;
            border-left: 4px solid <?php echo esc_attr($agency['background']); ?>;
            padding: 25px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        .agreement-details h3 {
            color: <?php echo esc_attr($agency['background']); ?>;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
        }
        .detail-label {
            font-weight: 600;
            color: #2c3e50;
            width: 140px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #555555;
            flex: 1;
        }
        .services-section {
            background-color: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .services-section h3 {
            color: <?php echo esc_attr($agency['background']); ?>;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .services-list {
            color: #555555;
            line-height: 1.8;
        }
        .next-steps {
            background: linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 100%);
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .next-steps h3 {
            color: <?php echo esc_attr($agency['background']); ?>;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .next-steps ul {
            color: #555555;
            padding-left: 20px;
            margin: 0;
        }
        .next-steps li {
            margin-bottom: 8px;
        }
        .contact-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        .contact-info h3 {
            color: <?php echo esc_attr($agency['background']); ?>;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .contact-details {
            color: #555555;
            line-height: 1.8;
        }
        .footer {
            background-color: <?php echo esc_attr($agency['background']); ?>;
            color: #ffffff;
            text-align: center;
            padding: 30px;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .footer a {
            color: #ffffff;
            text-decoration: none;
        }
        .signature-confirmation {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .signature-confirmation .icon {
            font-size: 32px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .signature-confirmation h3 {
            color: #155724;
            margin: 0 0 10px 0;
        }
        .signature-confirmation p {
            color: #155724;
            margin: 0;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 20px !important;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <?php if (!empty($agency['logo'])): ?>
                <img src="<?php echo esc_url($agency['logo']); ?>" alt="<?php echo esc_attr(get_bloginfo('name')); ?>" class="logo">
            <?php endif; ?>
            <h1>Agreement Confirmed</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Hello <?php echo esc_html($client['fullName']); ?>!
            </div>

            <div class="message">
                Thank you for signing our Digital Marketing Agreement. We're excited to partner with you and help grow your business through our digital marketing services.
            </div>

            <!-- Signature Confirmation -->
            <div class="signature-confirmation">
                <div class="icon">✓</div>
                <h3>Agreement Successfully Signed</h3>
                <p>Your digital signature has been recorded and the agreement is now active.</p>
            </div>

            <!-- Agreement Details -->
            <div class="agreement-details">
                <h3>Agreement Details</h3>
                
                <div class="detail-row">
                    <div class="detail-label">Agreement ID:</div>
                    <div class="detail-value">#<?php echo esc_html($agreement_id); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Client Name:</div>
                    <div class="detail-value"><?php echo esc_html($client['fullName']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Business Name:</div>
                    <div class="detail-value"><?php echo esc_html($client['businessName']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Industry:</div>
                    <div class="detail-value"><?php echo esc_html($client['businessIndustry']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value"><?php echo esc_html($client['email']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Phone:</div>
                    <div class="detail-value"><?php echo esc_html($client['phone']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Agreement Date:</div>
                    <div class="detail-value"><?php echo esc_html($created_date); ?></div>
                </div>
            </div>

            <!-- Services Section -->
            <?php if (!empty($services_list)): ?>
            <div class="services-section">
                <h3>Services Included</h3>
                <div class="services-list">
                    <?php echo $services_list; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Next Steps -->
            <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                    <li>Our team will review your requirements and create a customized strategy</li>
                    <li>You'll receive a detailed project timeline within 2-3 business days</li>
                    <li>We'll schedule a kickoff meeting to discuss your goals and expectations</li>
                    <li>Our dedicated account manager will be in touch to coordinate next steps</li>
                </ul>
            </div>

            <div class="message">
                A copy of the signed agreement is attached to this email for your records. Please keep it in a safe place for future reference.
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
                <h3>Questions or Concerns?</h3>
                <div class="contact-details">
                    <?php if (!empty($agency['phone'])): ?>
                        <strong>Phone:</strong> <?php echo esc_html($agency['phone']); ?><br>
                    <?php endif; ?>
                    <?php if (!empty($agency['email'])): ?>
                        <strong>Email:</strong> <a href="mailto:<?php echo esc_attr($agency['email']); ?>"><?php echo esc_html($agency['email']); ?></a><br>
                    <?php endif; ?>
                    <?php if (!empty($agency['website'])): ?>
                        <strong>Website:</strong> <a href="<?php echo esc_url($agency['website']); ?>"><?php echo esc_html($agency['website']); ?></a><br>
                    <?php endif; ?>
                    <?php if (!empty($agency['address'])): ?>
                        <strong>Address:</strong> <?php echo esc_html($agency['address']); ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                Thank you for choosing <?php echo esc_html(get_bloginfo('name')); ?> for your digital marketing needs.<br>
                We look forward to helping your business grow!
            </p>
            <?php if (!empty($agency['website'])): ?>
                <p style="margin-top: 15px;">
                    <a href="<?php echo esc_url($agency['website']); ?>">Visit our website</a>
                </p>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
<?php
$message = ob_get_clean();

// Prepare email payload array
$emailPayload = [
    $client['email'],                    // To
    $subject,                           // Subject  
    $message,                          // Message
    $headers,                          // Headers
    $attachments                       // Attachments
];
?>