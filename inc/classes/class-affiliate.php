<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Affiliate {
	use Singleton;

	protected $tables;

	protected function __construct() {
		global $wpdb;
		$this->tables = (object) [
			'links'  => $wpdb->prefix . 'sitecore_affiliate_links',
			'visits' => $wpdb->prefix . 'sitecore_affiliate_visits',
		];
		$this->setup_hooks();
		$this->setup_pageditors();
	}

	protected function setup_hooks() {
		add_action('init', [$this, 'register_shortcodes']);
		add_action('admin_menu', [$this, 'add_admin_menu']);
		add_action('rest_api_init', [$this, 'register_routes']);
		add_filter('sitecore/llmstxt/content', [$this, 'llmstxt'], 10, 2);
        add_filter('sitecore/settings/fields', [$this, 'settings'], 10, 1);
        add_filter('sitecore/database/tables', [$this, 'database_tables'], 10, 1);
        add_action('admin_enqueue_scripts', [ $this, 'admin_enqueue_scripts' ], 10, 1);
		// register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		// register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
	}
	protected function setup_pageditors() {
		add_action('elementor/dynamic_tags/register', [$this, 'register_dynamic_tags'], 10, 1);
		add_filter('elementor/query/get_autocomplete/sitecore-elem-affiliate-links', [$this, 'query_affiliate_links'], 10, 2);
		add_filter('elementor/query/get_value_titles/sitecore-elem-affiliate-links', [$this, 'query_affiliate_links_title'], 10, 2);
	}

	public function register_activation_hook() {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset_collate = $wpdb->get_charset_collate();
		$tables = $this->get_table_schema();
        foreach ((array) $this->tables as $_tableKey => $_tableName) {
            dbDelta("CREATE TABLE IF NOT EXISTS {$_tableName} ({$tables[$_tableKey]}) $charset_collate;");
        }
	}

	public function register_deactivation_hook() {
		global $wpdb;
		foreach ((array) $this->tables as $table) {
			$wpdb->query("DROP TABLE IF EXISTS {$table}");
		}
	}

	protected function get_table_schema() {
        return [
            'links' => "
                id INT AUTO_INCREMENT PRIMARY KEY,
				title TEXT NOT NULL,
				shortcode VARCHAR(100) NOT NULL UNIQUE,
				link TEXT NOT NULL,
				comments TEXT DEFAULT '',
				_info TEXT DEFAULT '',
				visits INT DEFAULT 0,
				_status ENUM('active', 'inactive') DEFAULT 'active',
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ",
            'visits' => "
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
				link_id INT NOT NULL,
				ip_address VARCHAR(100),
				device_type VARCHAR(50), 
				browser_name VARCHAR(100),
				browser_version VARCHAR(50),
				os_name VARCHAR(100),
				os_version VARCHAR(50),
				country VARCHAR(100),
				city VARCHAR(100),
				latlon VARCHAR(50),
				_time DATETIME DEFAULT CURRENT_TIMESTAMP,
				INDEX (link_id),
				INDEX (ip_address)
            ",
        ];
    }

	public function database_tables($tables) {
		$tables[] = [
			'id' => 'affiliate',
			'title' => 'Affiliate Link Managements',
			'tables' => array_map(fn($tabKey) => ['key' => $tabKey, 'name' => $this->tables->$tabKey, 'schema' => $this->get_table_schema()[$tabKey]], array_keys((array) $this->tables))
		];
		return $tables;
	}

	public function register_dynamic_tags($dynamic_tags) {
		if (!class_exists('ElementorPro\Modules\DynamicTags\Module')) {
			return;
		}
		include_once WP_SITECORE_DIR_PATH . '/inc/widgets/tags/affiliates.php';
		$dynamic_tags->register(new Elementor_Affiliate_Links_Tags());
	}
	
	public function register_shortcodes() {
        if (apply_filters('pm_project/system/isactive', 'affiliate-paused')) {return;}
		add_shortcode('affiliate_link', [$this, 'handle_shortcode_redirect']);
		add_rewrite_rule('^links/([^/]+)/?$', 'index.php?affiliate_redirect=$matches[1]', 'top');
		add_filter('query_vars', fn($vars) => array_merge($vars, ['affiliate_redirect']));
		add_action('template_redirect', [$this, 'process_affiliate_redirect']);
	}

	public function handle_shortcode_redirect($atts) {
		return '';
	}

	public function process_affiliate_redirect() {
		$code = get_query_var('affiliate_redirect');
		if (!$code) return;

		global $wpdb;
		$link = $wpdb->get_row($wpdb->prepare("SELECT id, link FROM {$this->tables->links} WHERE shortcode = %s", $code));
		if ($link) {
			// $_SERVER['REMOTE_ADDR'] = '51.158.253.177';
			$browser_details = (object) $this->custom_parse_user_agent($_SERVER['HTTP_USER_AGENT']);
			$geo_data = $this->get_geo_data($_SERVER['REMOTE_ADDR']);
			
			$wpdb->insert($this->tables->visits, [
				'link_id' => $link->id,
				'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
				'device_type' => $browser_details->device_type ?? '-',
				'browser_name' => $browser_details->browser_name ?? '-',
				'browser_version' => $browser_details->browser_version ?? '-',
				'os_name' => $browser_details->os_name ?? '-',
				'os_version' => $browser_details->os_version ?? '-',
				'country' => $geo_data['country_code'] ?? '-',
				'city' => $geo_data['city'] ?? '-',
				'latlon' => implode(',', [$geo_data['lat'], $geo_data['lon']])
			]);
			$wpdb->query($wpdb->prepare("UPDATE {$this->tables->links} SET visits = visits + 1 WHERE id = %d", $link->id));
			wp_redirect($link->link);
			exit;
		}
	}
	
	public function custom_parse_user_agent($user_agent) {
		$browser_data = (object) [
			'device_type'     => 'Desktop', // Default
			'browser_name'    => 'Unknown',
			'browser_version' => '0.0',
			'os_name'         => 'Unknown',
			'os_version'      => '0.0',
		];

		if (empty($user_agent)) {
			return $browser_data;
		}

		// --- 1. Detect OS and Version ---
		if (preg_match('/Windows NT ([\d\.]+)/i', $user_agent, $matches)) {
			$browser_data->os_name = 'Windows';
			$browser_data->os_version = $matches[1];
		} elseif (preg_match('/Macintosh;.*?OS X ([\d_]+)/i', $user_agent, $matches)) {
			$browser_data->os_name = 'macOS';
			$browser_data->os_version = str_replace('_', '.', $matches[1]);
		} elseif (preg_match('/Android ([\d\.]+)/i', $user_agent, $matches)) {
			$browser_data->os_name = 'Android';
			$browser_data->os_version = $matches[1];
			$browser_data->device_type = 'Mobile';
		} elseif (preg_match('/iPhone|iPad|iPod/i', $user_agent)) {
			$browser_data->os_name = 'iOS';
			if (preg_match('/OS ([\d_]+)/i', $user_agent, $matches)) {
				$browser_data->os_version = str_replace('_', '.', $matches[1]);
			}
			$browser_data->device_type = (stripos($user_agent, 'iPad') !== false) ? 'Tablet' : 'Mobile';
		} elseif (preg_match('/Linux/i', $user_agent)) {
			$browser_data->os_name = 'Linux';
		}

		// --- 2. Detect Device Type (Refinement) ---
		if (stripos($user_agent, 'Mobile') !== false || stripos($user_agent, 'Android') !== false) {
			$browser_data->device_type = 'Mobile';
		} elseif (stripos($user_agent, 'Tablet') !== false || stripos($user_agent, 'iPad') !== false) {
			$browser_data->device_type = 'Tablet';
		}

		// --- 3. Detect Browser and Version (Order matters, as some UAs contain multiple names) ---
		if (preg_match('/OPR|Opera/i', $user_agent)) { // Opera must be before Chrome
			$browser_data->browser_name = 'Opera';
			$pattern = '/(OPR|Opera)\/([\d\.]+)/i';
			if (preg_match($pattern, $user_agent, $matches)) {
				$browser_data->browser_version = $matches[2];
			}
		} elseif (preg_match('/Edge\/([\d\.]+)/i', $user_agent, $matches)) { // Edge (Chromium)
			$browser_data->browser_name = 'Edge';
			$browser_data->browser_version = $matches[1];
		} elseif (preg_match('/Chrome\/([\d\.]+)/i', $user_agent, $matches)) { // Chrome must be before Safari
			$browser_data->browser_name = 'Chrome';
			$browser_data->browser_version = $matches[1];
		} elseif (preg_match('/Safari\/([\d\.]+)/i', $user_agent, $matches)) {
			// Find Safari version more accurately. The real version is usually the 'Version/X.Y.Z' part.
			if (preg_match('/Version\/([\d\.]+)/i', $user_agent, $v_matches)) {
				$browser_data->browser_version = $v_matches[1];
			} else {
				$browser_data->browser_version = $matches[1];
			}
			$browser_data->browser_name = 'Safari';
		} elseif (preg_match('/Firefox\/([\d\.]+)/i', $user_agent, $matches)) {
			$browser_data->browser_name = 'Firefox';
			$browser_data->browser_version = $matches[1];
		} elseif (preg_match('/MSIE ([\d\.]+)|Trident\/\d+\.\d+;.*rv:([\d\.]+)/i', $user_agent, $matches)) {
			$browser_data->browser_name = 'Internet Explorer';
			$browser_data->browser_version = $matches[1] ?? $matches[2] ?? '11.0';
		}

		return $browser_data;
	}

	private function get_geo_data($ip_address) {
		$geo_data = [
			'country' => '-',
			'country_code' => '-',
			'city' => '-',
			'lat' => '-',
			'lon' => '-',
		];

		if (filter_var($ip_address, FILTER_VALIDATE_IP)) {
			$url = "http://ip-api.com/json/{$ip_address}";

			$response = file_get_contents($url);
			if ($response) {
				$data = json_decode($response, true);
				if ($data && $data['status'] === 'success') {
					$geo_data['country'] = $data['country'] ?? '-';
					$geo_data['country_code'] = $data['countryCode'] ?? '-';
					$geo_data['city'] = $data['city'] ?? '-';
					$geo_data['lat'] = $data['lat'] ?? '-';
					$geo_data['lon'] = $data['lon'] ?? '-';
				}
			}
		}

		return $geo_data;
	}

	public function register_routes() {
		register_rest_route('sitecore/v1', '/affiliates/links', [
			'methods'  => 'GET',
			'callback' => [$this, 'get_all_links'],
			'permission_callback' => '__return_true',
		]);

		register_rest_route('sitecore/v1', '/affiliates/link/(?P<id>\d+)', [
			'methods'  => 'GET',
			'callback' => [$this, 'get_link_details'],
			'permission_callback' => '__return_true',
		]);

		register_rest_route('sitecore/v1', '/affiliates/link/(?P<id>\d+)', [
			'methods'  => 'POST',
			'callback' => [$this, 'save_link'],
			'permission_callback' => '__return_true',
		]);

		register_rest_route('sitecore/v1', '/affiliates/link/(?P<id>\d+)', [
			'methods'  => 'DELETE',
			'callback' => [$this, 'delete_link'],
			'permission_callback' => '__return_true',
		]);

		register_rest_route('sitecore/v1', '/affiliates/visits', [
			'methods'  => 'GET',
			'callback' => [$this, 'get_all_visits'],
			'permission_callback' => '__return_true',
		]);
	}

	public function get_table($name) {
		if (isset($this->tables->$name)) {
			return $this->tables->$name;
		}
		return null;
	}

	public function get_all_links(WP_REST_Request $request) {
		global $wpdb;
		$current_page = (int) $request->get_param('page') ?: 1;
		$per_page = (int) $request->get_param('per_page') ?: 20;
		$search = (string) $request->get_param('search') ?: '';
		$orderby = (string) $request->get_param('sort_by') ?: 'id';
		$order = strtoupper((string) $request->get_param('sort_order')) === 'ASC' ? 'ASC' : 'DESC';
		$offset = ($current_page - 1) * $per_page;

		$where = 'WHERE 1=1';
		if (!empty($search)) {
			$where .= $wpdb->prepare(" AND (title LIKE %s OR shortcode LIKE %s OR link LIKE %s)", "%$search%", "%$search%", "%$search%");
		}

		$total_items = $wpdb->get_var("SELECT COUNT(*) FROM {$this->tables->links} $where");
		$total_pages = ceil($total_items / $per_page);

		$data = $wpdb->get_results("SELECT id, title, shortcode, link, comments, visits, created_at, updated_at FROM {$this->tables->links} $where ORDER BY $orderby $order LIMIT $per_page OFFSET $offset");

		$response = rest_ensure_response($data);
		$response->header('X-WP-Total', (int) $total_items);
		$response->header('X-WP-TotalPages', (int) $total_pages);
		return $response;
	}

	public function get_all_visits(WP_REST_Request $request) {
		global $wpdb;
		$current_page = (int) $request->get_param('page') ?: 1;
		$per_page = (int) $request->get_param('per_page') ?: 20;
		$search = (string) $request->get_param('search') ?: '';
		$orderby = (string) $request->get_param('orderby') ?: 'id';
		$order = strtoupper((string) $request->get_param('order')) === 'ASC' ? 'ASC' : 'DESC';
		$offset = ($current_page - 1) * $per_page;

		$where = 'WHERE 1=1';
		if (!empty($search)) {
			$where .= $wpdb->prepare(" AND ip_address LIKE %s", "%$search%");
		}

		$total_items = $wpdb->get_var("SELECT COUNT(*) FROM {$this->tables->visits} $where");
		$total_pages = ceil($total_items / $per_page);

		$data = $wpdb->get_results("SELECT * FROM {$this->tables->visits} $where ORDER BY $orderby $order LIMIT $per_page OFFSET $offset");

		$response = rest_ensure_response($data);
		$response->header('X-WP-Total', (int) $total_items);
		$response->header('X-WP-TotalPages', (int) $total_pages);
		return $response;
	}

	public function get_link($id) {
		global $wpdb;
		$id = (int) $id;
		$link = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tables->links} WHERE id = %d", $id));
		if (!$link) {return null;}
		$link->url = site_url(sprintf('/links/%s/', $link->shortcode));
		return $link;
	}
	public function get_link_details(WP_REST_Request $request) {
		global $wpdb;
		$id = (int) $request['id'];
		$link = $this->get_link($id);
		if (!$link) {
			return new WP_Error('no_link', __('Link not found', 'site-core'), ['status' => 404]);
		}
		$visits = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->tables->visits} WHERE link_id = %d", $id));
		$link->url = site_url(sprintf('/links/%s/', $link->shortcode));
		return [
			'link'   => $link,
			'visits' => $visits
		];
	}

	public function save_link(WP_REST_Request $request) {
		global $wpdb;
		$id = (int) $request['id'];
		$title = sanitize_text_field($request['title']);
		$link = sanitize_text_field($request['link']);
		$shortcode = sanitize_title($request['shortcode']);
		$comments = sanitize_text_field($request['comments'] ?? '');

		$data = compact('title', 'link', 'shortcode', 'comments');

		if ($id === 0) {
			$wpdb->insert($this->tables->links, $data);
			$id = $wpdb->insert_id;
		} else {
			$wpdb->update($this->tables->links, $data, ['id' => $id]);
		}
		return ['id' => $id];
	}

	public function delete_link(WP_REST_Request $request) {
		global $wpdb;
		$id = (int) $request['id'];
		$wpdb->delete($this->tables->links, ['id' => $id]);
		return ['deleted' => true];
	}

	public function add_admin_menu() {
		if (apply_filters('pm_project/system/isactive', 'affiliate-paused')) {return;}
		add_menu_page(__('Affiliate Links', 'site-core'), __('Affiliates', 'site-core'), 'manage_options', 'affiliate-links', [$this, 'admin_page'], 'dashicons-admin-links');
	}

	public function admin_page() {
		echo '<div class="wrap" id="affiliate-links-app"><h1>Affiliate Links</h1></div>';
	}
	
	public function admin_enqueue_scripts($curr_page) {
        if ($curr_page != 'toplevel_page_affiliate-links') {return;}
        if (apply_filters('pm_project/system/isactive', 'affiliate-paused')) {return;}
        wp_enqueue_script('site-core');
        wp_enqueue_style('site-core');
    }

	public function settings($args) {
		$args['affiliate']		= [
			'title'							=> __('Affiliate', 'site-core'),
			'description'					=> __('Affiliate configurations, fields customization. Things enables and disables.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'affiliate-paused',
					'label'					=> __('Pause', 'site-core'),
					'description'			=> __('Mark to pause the the Affiliate functionalities. Would be a reason for site image break.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> false
				],
				[
					'id' 					=> 'affiliate-allow-redirect',
					'label'					=> __('Allow Redirect', 'site-core'),
					'description'			=> __('Allow redirect to affiliate links.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> true
				],
				[
					'id' 					=> 'affiliate-allow-shortcode',
					'label'					=> __('Allow Shortcode', 'site-core'),
					'description'			=> __('Allow shortcode for affiliate links.', 'site-core'),
					'type'					=> 'checkbox',
					'default'				=> true
				]
			]
		];
        return $args;
    }

	public function llmstxt($output, $lang) {
		global $wpdb;
        $_res = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->tables->links}"), ARRAY_A);
		if (count($_res)) {
			$output .= "My Affiliates:\n";
		}
		foreach ($_res as $link) {
			$output .=  sprintf('- %s: %s', $link['title'], site_url(sprintf('/links/%s/', $link['shortcode']))) . "\n";
		}
		return $output;
	}
	
	
	
	
    public function query_affiliate_links($results, $data) {
        global $wpdb;
		$search_query = isset($data['q']) ? sanitize_text_field($data['q']) : '';
		$like = '%' . $wpdb->esc_like($search_query) . '%';
        $_res = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, title AS text FROM {$this->tables->links} WHERE title LIKE %s OR shortcode LIKE %s OR link LIKE %s OR comments LIKE %s OR _info LIKE %s",
				$like, $like, $like, $like, $like
			)
		);

        return [...$results, ...$_res];
    }
	public function query_affiliate_links_title($results, $request) {
		$ids = $request['id'] ?? [];
		if (!is_array($ids)) {
			$ids = [$ids];
		}
		foreach ($ids as $id) {
			$link = $this->get_link((int) $id);
			//  && $link->_status === 'active'
			if ($link) {
				$results[$id] = $link->title;
			}
		}

		return $results;
	}
}
