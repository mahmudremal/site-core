<?php
/**
 * This plugin made for UxnDev and all it's sites core applications.
 *
 * @wordpress-plugin
 * Plugin Name:       Site Core
 * Plugin URI:        https://github.com/mahmudremal/
 * Description:       This plugin is specially designed for this wordpress website with necessery files, themes, assets to store, enqueue, register or deregister.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            UxnDev
 * Author URI:        https://github.com/mahmudremal/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       site-core
 * Domain Path:       /languages
 * 
 * @package SiteCore
 * @author  Remal Mahmud (https://github.com/mahmudremal/)
 * @version 1.0.2
 * @link https://github.com/mahmudremal/wp-partnership-manager/
 * @category	WooComerce Plugin
 * @copyright	Copyright (c) 2023-25
 * 
 */


defined('WP_SITECORE__FILE__') || define('WP_SITECORE__FILE__', untrailingslashit(__FILE__));
defined('WP_SITECORE_DIR_PATH') || define('WP_SITECORE_DIR_PATH', untrailingslashit(plugin_dir_path(WP_SITECORE__FILE__)));
defined('WP_SITECORE_DIR_URI') || define('WP_SITECORE_DIR_URI', untrailingslashit(plugin_dir_url(WP_SITECORE__FILE__)));
defined('WP_SITECORE_BUILD_URI') || define('WP_SITECORE_BUILD_URI', untrailingslashit(WP_SITECORE_DIR_URI) . '/dist');
defined('WP_SITECORE_BUILD_PATH') || define('WP_SITECORE_BUILD_PATH', untrailingslashit(WP_SITECORE_DIR_PATH) . '/dist');
defined('WP_SITECORE_BUILD_JS_URI') || define('WP_SITECORE_BUILD_JS_URI', untrailingslashit(WP_SITECORE_DIR_URI) . '/dist/js');
defined('WP_SITECORE_BUILD_JS_DIR_PATH') || define('WP_SITECORE_BUILD_JS_DIR_PATH', untrailingslashit(WP_SITECORE_DIR_PATH) . '/dist/js');
defined('WP_SITECORE_BUILD_IMG_URI') || define('WP_SITECORE_BUILD_IMG_URI', untrailingslashit(WP_SITECORE_DIR_URI) . '/dist/src/img');
defined('WP_SITECORE_BUILD_CSS_URI') || define('WP_SITECORE_BUILD_CSS_URI', untrailingslashit(WP_SITECORE_DIR_URI) . '/dist/css');
defined('WP_SITECORE_BUILD_CSS_DIR_PATH') || define('WP_SITECORE_BUILD_CSS_DIR_PATH', untrailingslashit(WP_SITECORE_DIR_PATH) . '/dist/css');
defined('WP_SITECORE_BUILD_LIB_URI') || define('WP_SITECORE_BUILD_LIB_URI', untrailingslashit(WP_SITECORE_DIR_URI) . '/dist/library');
defined('WP_SITECORE_ARCHIVE_POST_PER_PAGE') || define('WP_SITECORE_ARCHIVE_POST_PER_PAGE', 9);
defined('WP_SITECORE_SEARCH_RESULTS_POST_PER_PAGE') || define('WP_SITECORE_SEARCH_RESULTS_POST_PER_PAGE', 9);
defined('WP_SITECORE_OPTIONS') || define('WP_SITECORE_OPTIONS', get_option('site-core'));
// 
// 
// 
require_once WP_SITECORE_DIR_PATH . '/inc/helpers/autoloader.php';
require_once WP_SITECORE_DIR_PATH . '/inc/helpers/template-tags.php';
try {
	\SITE_CORE\inc\Project::get_instance();
} catch (\Throwable $th) {
	//throw $th;
} catch (\WP_Error $th) {
	//throw $th;
} catch (Error $th) {
	//throw $th;
}



