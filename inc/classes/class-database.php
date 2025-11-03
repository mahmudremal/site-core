<?php
/**
 * Database managements
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Request;
use WP_Error;

class Database {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
		add_filter('sitecore/settings/fields', [$this, 'settings'], 10, 1);
	}

	
    public function settings($args) {
        $args['database'] = [
            'title'                         => __('Database', 'site-core'),
			'description'					=> __('Database managements and configurations.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'database-tables_managements',
					'label'					=> '',
					'description'			=> '',
					'type'					=> 'textarea',
					'default'				=> ''
				],
			]
        ];
        return $args;
    }

	public function register_routes() {
		register_rest_route('sitecore/v1', '/database/tables', [
			'methods'  => 'GET',
			'callback' => [$this, 'api_get_database_tables'],
			'permission_callback' => '__return_true',
		]);
		register_rest_route('sitecore/v1', '/database/tables', [
			'methods'  => 'POST',
			'callback' => [$this, 'api_update_database_tables'],
			'permission_callback' => '__return_true',
            'args' => [
                'id'			=> ['required' => true],
                'tableKey'      => ['required' => true],
                'action'		=> ['required' => true],
            ]
		]);
	}

	public function api_get_database_tables(WP_REST_Request $request) {
		global $wpdb;
		
		$tables = apply_filters('sitecore/database/tables', []);
		
		$_tables_status = [];
		foreach ($tables as $index => $data) {
			$_tables_status = array_merge($_tables_status, array_values(array_map(fn($row) => $row['name'], (array) $data['tables'])));
		}
		
		if (empty($_tables_status)) {
			return rest_ensure_response(['tables' => []]);
		}
		
		$union_parts = [];
		foreach ($_tables_status as $table_name) {
			$union_parts[] = "SELECT '" . esc_sql($table_name) . "' AS table_name";
		}
		$union_sql = implode(' UNION ALL ', $union_parts);
		
		$sql = "
			SELECT t.table_name,
				CASE WHEN ist.TABLE_NAME IS NOT NULL THEN 1 ELSE 0 END AS exists_flag
			FROM (
				{$union_sql}
			) t
			LEFT JOIN INFORMATION_SCHEMA.TABLES ist 
			ON ist.TABLE_SCHEMA = '{$wpdb->dbname}'
			AND ist.TABLE_NAME = t.table_name;
		";
		
		$results = $wpdb->get_results($sql, ARRAY_A);
		
		$table_exists_map = [];
		foreach ($results as $row) {
			$table_exists_map[$row['table_name']] = (bool) $row['exists_flag'];
		}
		
		$response = ['tables' => []];
		foreach ($tables as $group) {
			$group_tables = [];
			foreach ((array) $group['tables'] as $alias => $table) {
				$table_name = $table['name'];$table_schema = $table['schema'];
				$group_tables[$table['key']] = $table_exists_map[$table['name']] ?? false;
			}
			$response['tables'][] = [
				'id' => $group['id'] ?? '',
				'title' => $group['title'] ?? '',
				'tables' => $group_tables
			];
		}
		
		return rest_ensure_response($response);
	}



	public function api_update_database_tables(WP_REST_Request $request) {
		global $wpdb;
		
		$id = $request->get_param('id');
		$tableKey = $request->get_param('tableKey');
		$action = $request->get_param('action');
		
		if (!$id || !$tableKey || !$action) {
			return rest_ensure_response([
				'success' => false,
				'message' => 'Missing required parameters: id, tableKey, or action'
			]);
		}
		
		$tables = apply_filters('sitecore/database/tables', []);
		
		$table_name = null;$table_schema = null;
		foreach ($tables as $group) {
			if (isset($group['id']) && $group['id'] === $id && isset($group['tables'])) {
				foreach ($group['tables'] as $table) {
					if ($table['key'] == $tableKey) {
						$table_name = $table['name'];
						$table_schema = $table['schema'];
					}
				}
				break;
			}
		}
		
		if (!$table_name || !$table_schema) {
			return rest_ensure_response([
				'success' => false,
				'message' => 'Table key not found in the specified group'
			]);
		}
		
		if ($action === 'disable') {
			$result = $wpdb->query(
				$wpdb->prepare("DROP TABLE IF EXISTS %s;", $table_name)
			);
			if ($result === false) {
				return rest_ensure_response([
					'success' => false,
					'message' => 'Failed to drop table: ' . $wpdb->last_error
				]);
			}
		} elseif ($action === 'active') {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
			$charset_collate = $wpdb->get_charset_collate();
			dbDelta("CREATE TABLE IF NOT EXISTS {$table_name} ({$table_schema}) $charset_collate;");
			if (!empty($wpdb->last_error)) {
				return rest_ensure_response([
					'success' => false,
					'message' => 'Failed to create table: ' . $wpdb->last_error
				]);
			}
		} else {
			return rest_ensure_response([
				'success' => false,
				'message' => 'Invalid action'
			]);
		}
		
		return rest_ensure_response([
			'success' => true,
			'message' => ucfirst($action) . ' action completed for table: ' . $tableKey
		]);
	}


}
