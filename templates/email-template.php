<?php
namespace SITE_CORE\inc;
$template_id = get_query_var('email_template_id');
$template = Emails::get_instance()->get((int) $template_id);
?>
<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo esc_html($template->title); ?></title>
    </head>
    <body style="">
        <?php echo do_shortcode('[email_template id="' . $template_id . '"]'); ?>
    </body>
</html>
