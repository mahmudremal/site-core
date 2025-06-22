<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Toolbar {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_action('admin_bar_menu', [$this, 'admin_bar_menu'], 10, 1);
	}
    public function admin_bar_menu($wp_admin_bar) {
        if (!is_admin_bar_showing()) {return;}
        $wp_admin_bar->add_node([
            'id'     => 'partnership-dashboard',
            'title'  => __('Partnership Dashboard', 'domain'),
            'href'   => site_url('/partnership-dashboard'),
            'parent' => 'site-name',
            'meta'   => [
                'class' => 'ab-item',
                'title' => __('Go to Partnership Dashboard', 'domain')
            ]
        ]);
    }

}