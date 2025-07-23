<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;

class Links {
	use Singleton;

	protected $tables;

	protected function __construct() {
		global $wpdb;
		$this->tables = (object) [
			'links'  => $wpdb->prefix . 'affiliate_links',
			'visits' => $wpdb->prefix . 'affiliate_visits',
		];
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
		add_action('init', [$this, 'register_shortcodes']);
		add_action('admin_menu', [$this, 'add_admin_menu']);
		register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
		register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
	}

	public function register_activation_hook() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		dbDelta("CREATE TABLE {$this->tables->links} (
			id INT AUTO_INCREMENT PRIMARY KEY,
			shortcode VARCHAR(100) NOT NULL UNIQUE,
			link TEXT NOT NULL,
			comments TEXT DEFAULT '',
			_info TEXT DEFAULT '',
			visits INT DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) $charset_collate;");

		dbDelta("CREATE TABLE {$this->tables->visits} (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			link_id INT NOT NULL,
			ip_address VARCHAR(100),
			_time DATETIME DEFAULT CURRENT_TIMESTAMP
		) $charset_collate;");
	}

	public function register_deactivation_hook() {
		global $wpdb;
		foreach ((array)$this->tables as $table) {
			$wpdb->query("DROP TABLE IF EXISTS {$table}");
		}
	}

	public function register_shortcodes() {
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
		$link = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tables->links} WHERE shortcode = %s", $code));
		if ($link) {
			$wpdb->insert($this->tables->visits, [
				'link_id' => $link->id,
				'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
			]);
			$wpdb->query($wpdb->prepare("UPDATE {$this->tables->links} SET visits = visits + 1 WHERE id = %d", $link->id));
			wp_redirect($link->link);
			exit;
		}
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

	public function get_all_links(WP_REST_Request $request) {
		global $wpdb;
		$current_page = (int) $request->get_param('page') ?: 1;
		$per_page = (int) $request->get_param('per_page') ?: 20;
		$search = (string) $request->get_param('search') ?: '';
		$orderby = (string) $request->get_param('orderby') ?: 'id';
		$order = strtoupper((string) $request->get_param('order')) === 'ASC' ? 'ASC' : 'DESC';
		$offset = ($current_page - 1) * $per_page;

		$where = 'WHERE 1=1';
		if (!empty($search)) {
			$where .= $wpdb->prepare(" AND (shortcode LIKE %s OR link LIKE %s)", "%$search%", "%$search%");
		}

		$total_items = $wpdb->get_var("SELECT COUNT(*) FROM {$this->tables->links} $where");
		$total_pages = ceil($total_items / $per_page);

		$data = $wpdb->get_results("SELECT id, shortcode, link, comments, visits, created_at, updated_at FROM {$this->tables->links} $where ORDER BY $orderby $order LIMIT $per_page OFFSET $offset");

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

	public function get_link_details(WP_REST_Request $request) {
		global $wpdb;
		$id = (int) $request['id'];
		$link = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tables->links} WHERE id = %d", $id));
		$visits = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->tables->visits} WHERE link_id = %d", $id));
		return [
			'link'   => $link,
			'visits' => $visits
		];
	}

	public function save_link(WP_REST_Request $request) {
		global $wpdb;
		$id = (int) $request['id'];
		$link = sanitize_text_field($request['link']);
		$shortcode = sanitize_title($request['shortcode']);
		$comments = sanitize_text_field($request['comments'] ?? '');

		$data = compact('link', 'shortcode', 'comments');

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
		add_menu_page(__('Affiliate Links', 'site-core'), __('Affiliates', 'site-core'), 'manage_options', 'affiliate-links', [$this, 'admin_page'], 'dashicons-admin-links');
	}

	public function admin_page() {
		echo '<div class="wrap" id="affiliate-links-app"><h1>Affiliate Links</h1></div>';
	}
}
