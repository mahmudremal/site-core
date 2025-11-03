<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_REST_Response;

class Currency {
	use Singleton;

	public $_currencies = [
		[ 'code' => 'USD', 'sign' => '$', 'position' => 'prefix', 'rate' => 1 ],
		[ 'code' => 'EUR', 'sign' => '€', 'position' => 'prefix', 'rate' => 0.93 ],
		[ 'code' => 'GBP', 'sign' => '£', 'position' => 'prefix', 'rate' => 0.80 ],
		[ 'code' => 'JPY', 'sign' => '¥', 'position' => 'prefix', 'rate' => 154.75 ],
		[ 'code' => 'AUD', 'sign' => 'A$', 'position' => 'prefix', 'rate' => 1.52 ],
		[ 'code' => 'CAD', 'sign' => 'C$', 'position' => 'prefix', 'rate' => 1.36 ],
		[ 'code' => 'CHF', 'sign' => 'CHF', 'position' => 'suffix', 'rate' => 0.91 ],
		[ 'code' => 'CNY', 'sign' => '¥', 'position' => 'prefix', 'rate' => 7.24 ],
		[ 'code' => 'HKD', 'sign' => 'HK$', 'position' => 'prefix', 'rate' => 7.83 ],
		[ 'code' => 'SGD', 'sign' => 'S$', 'position' => 'prefix', 'rate' => 1.35 ],
		[ 'code' => 'NZD', 'sign' => 'NZ$', 'position' => 'prefix', 'rate' => 1.66 ],
		[ 'code' => 'SEK', 'sign' => 'kr', 'position' => 'suffix', 'rate' => 10.76 ],
		[ 'code' => 'NOK', 'sign' => 'kr', 'position' => 'suffix', 'rate' => 11.00 ],
		[ 'code' => 'DKK', 'sign' => 'kr', 'position' => 'suffix', 'rate' => 6.95 ],
		[ 'code' => 'KRW', 'sign' => '₩', 'position' => 'prefix', 'rate' => 1372.65 ],
		[ 'code' => 'INR', 'sign' => '₹', 'position' => 'prefix', 'rate' => 83.47 ],
		[ 'code' => 'BRL', 'sign' => 'R$', 'position' => 'prefix', 'rate' => 5.15 ],
		[ 'code' => 'MXN', 'sign' => '$',  'position' => 'prefix', 'rate' => 17.02 ],
		[ 'code' => 'ZAR', 'sign' => 'R',  'position' => 'prefix', 'rate' => 18.49 ],
		[ 'code' => 'TRY', 'sign' => '₺', 'position' => 'prefix', 'rate' => 32.24 ],

		// Middle Eastern currencies
		[ 'code' => 'AED', 'sign' => 'د.إ', 'position' => 'prefix', 'rate' => 3.67 ],
		[ 'code' => 'SAR', 'sign' => 'ر.س', 'position' => 'prefix', 'rate' => 3.75 ],
		[ 'code' => 'QAR', 'sign' => 'ر.ق', 'position' => 'prefix', 'rate' => 3.64 ],
		[ 'code' => 'KWD', 'sign' => 'د.ك', 'position' => 'prefix', 'rate' => 0.31 ],
		[ 'code' => 'BHD', 'sign' => 'د.ب', 'position' => 'prefix', 'rate' => 0.38 ],
		[ 'code' => 'OMR', 'sign' => 'ر.ع', 'position' => 'prefix', 'rate' => 0.38 ],
		[ 'code' => 'JOD', 'sign' => 'د.ا', 'position' => 'prefix', 'rate' => 0.71 ],
		[ 'code' => 'LBP', 'sign' => 'ل.ل', 'position' => 'prefix', 'rate' => 89000 ],
		[ 'code' => 'EGP', 'sign' => '£', 'position' => 'prefix', 'rate' => 47.08 ],
		[ 'code' => 'IQD', 'sign' => 'ع.د', 'position' => 'prefix', 'rate' => 1309.50 ],
		[ 'code' => 'YER', 'sign' => 'ر.ي', 'position' => 'prefix', 'rate' => 250.30 ],
	];

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'rest_api_init']);
	}
	public function rest_api_init() {
		register_rest_route('sitecore/v1', '/currencies/list', [
			'methods' => 'GET',
			'callback' => [$this, 'api_get_list'],
			'permission_callback' => '__return_true'
		]);
	}

	public function api_get_list() {
		return rest_ensure_response($this->_currencies);
	}

	public function get_list() {
		return $this->_currencies;
	}
}
