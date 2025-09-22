<?php
/**
 * ProTools Manager Shortcode class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Typographics {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}
    protected function setup_hooks() {
		add_action('wp_head', [$this, 'wp_head'], 1, 0);
    }
    
    public function wp_head() {
        ?>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <style>body {font-family: 'Open Sans', sans-serif;}h1 {font-family: 'Roboto', sans-serif;}</style>
        <?php
    }

}