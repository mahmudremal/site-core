<?php
/**
 * Register Menus
 *
 * @package PartnershipManager
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
class Menus {
	use Singleton;
	protected function __construct() {
		// load class.
		$this->setup_hooks();
	}
	protected function setup_hooks() {
		add_filter('pm_project/settings/general', [$this, 'general'], 1, 1);
		add_filter('pm_project/settings/fields', [$this, 'menus'], 1, 1);
	}
	/**
	 * WordPress Option page.
	 * 
	 * @return array
	 */
	public function general($args) {
		return [
			...$args,
			'page_title'					=> __('Partnership dashboard Settings', 'site-core'),
			'menu_title'					=> __('Dashboard', 'site-core'),
			'page_header'					=> __('Partnership dashboard application in depth configuration screen.', 'site-core'),
			'page_subheader'				=> __("Place to setup your partnership program deshboard with application configurations and stuffs. Don't touch anything if you're not sure enough on this. Carefully change, update or delete anything because it may required some data to matched same stage and it does't save any revissions.", 'site-core'),
		];
	}
	public function menus($args) {
		// apply_filters('pm_project/system/isactive', 'general-paused')
		// apply_filters('pm_project/system/getoption', 'general-paused', false)
		$args['general']	= [
			'title'							=> __('General', 'site-core'),
			'description'					=> __('General settings for teddy-bear customization popup.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'general-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the application unconditionally.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'general-screen',
					'label'					=> __('dashboard screen', 'site-core'),
					'description'			=> __("Select a dashboard screen from where we'll apply the dashboard interface", 'site-core'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
				[
					'id' 					=> 'general-policy',
					'label'					=> __('Privacy policy', 'site-core'),
					'description'			=> __("Select a privacy policy page.", 'site-core'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
				[
					'id' 					=> 'general-terms',
					'label'					=> __('Terms & Condition', 'site-core'),
					'description'			=> __("Select a term and condition page", 'site-core'),
					'type'					=> 'select',
					'options'				=> $this->get_query(['post_type' => 'page', 'post_status' => 'any', 'type' => 'option', 'limit' => 50]),
					'default'				=> false
				],
			]
		];

		return $args;
	}
	public function get_query($args) {
		global $teddy_Plushies;
		$args = (object) wp_parse_args($args, [
			'post_type'		=> 'product',
			'type'			=> 'option',
			'limit'			=> 500,
			'queryType'		=> 'post',
			'noaccessory'	=> false,
			'post_status'	=> 'publish'
		]);
		$options = [];
		if($args->queryType == 'post') {
			$query = get_posts([
				'numberposts'		=> $args->limit,
				'post_type'			=> $args->post_type,
				'order'				=> 'DESC',
				'orderby'			=> 'date',
				'post_status'		=> $args->post_status
				
			]);
			foreach($query as $_post) {
				if($args->noaccessory && $teddy_Plushies->is_accessory($_post->ID)) {continue;}
				$options[$_post->ID] = get_the_title($_post->ID);

				// Function to remove popup customization meta.
				// _product_custom_popup || _teddy_custom_data
				// $meta = get_post_meta($_post->ID, '_product_custom_popup', true);
				// $exists = get_post_meta($_post->ID, '_product_custom_popup_stagged', true);
				// if(! $meta && $exists) {
				// 	update_post_meta($_post->ID, '_product_custom_popup', $exists);
				// 	$updated = delete_post_meta($_post->ID, '_product_custom_popup_stagged');
				// 	if(!$updated) {echo 'post meta failed to removed';}
				// }
				
			}
		} else if($args->queryType == 'term') {
			$query = get_categories('taxonomy=product_cat&post_type=product');
			foreach($query as $_post) {
				$options[$_post->cat_ID] = $_post->cat_name;
			}
		} else {}
		return $options;
	}
}

/**
 * {{client_name}}, {{client_address}}, {{todays_date}}, {{retainer_amount}}
 */
