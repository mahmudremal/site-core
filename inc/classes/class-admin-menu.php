<?php
/**
 * Bootstraps the Theme.
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;

class Admin_Menu {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
    }

    public function add_admin_menu() {
        add_menu_page('Partnership', 'Partnership', 'manage_options', 'partnership', [$this, 'partnership_admin_page'], 'dashicons-businessman', 20);
        // add_submenu_page('partnership', 'API Keys', 'API Keys', 'manage_options', 'partnership-api-keys', [$this, 'api_keys_admin_page']);
    }

    public function partnership_admin_page() {
        ?>
        <div style="padding: 70px 20px;background: red;">
            <h1 style="color: #fff;line-height: 40px;">Here we'll implement an overview insight without any controls but just to get insignhts about flows, file storages, drive storages, finance, referrals and so on.</h1>
        </div>
        <?php
    }

}
