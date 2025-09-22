<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Query;

class Query {
    use Singleton;

    protected $tables;

    protected function __construct() {
        global $wpdb;
        $this->tables = (object) array_merge((array) Ecommerce::get_instance()->get_tables(), [
            'reco_events' => $wpdb->prefix . 'sitecore_reco_events',
            'reco_item_meta' => $wpdb->prefix . 'sitecore_reco_item_meta',
            'reco_item_sim' => $wpdb->prefix . 'sitecore_reco_item_sim',
            'reco_user_topn' => $wpdb->prefix . 'sitecore_reco_user_topn',
            'reco_user_interest' => $wpdb->prefix . 'sitecore_reco_user_interest',
        ]);

        add_action('rest_api_init', [$this, 'register_rest_routes']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);
        add_action('pre_get_posts', [$this, 'filter_product_query']);
    }

    public function register_rest_routes() {
        register_rest_route('reco/v1', '/event', [
            'methods'  => 'POST',
            'callback' => [$this, 'ingest_event'],
            'permission_callback' => '__return_true'
        ]);

        register_rest_route('sitecore/v1', '/ecommerce/recommendations/category', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_recommended_categories'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function api_get_recommended_categories(WP_REST_Request $request) {
        $categories = $this->get_recommended_categories();
        return new WP_REST_Response($categories, 200);
    }

    public function get_recommended_categories() {
        global $wpdb;
        $uid = $this->get_reco_uid();

        $results = $wpdb->get_results($wpdb->prepare("
            SELECT term_id, weight FROM {$this->tables->reco_user_interest}
            WHERE user_key = %s AND taxonomy = 'category'
            ORDER BY weight DESC
            LIMIT 10
        ", $uid));

        $categories = [];
        foreach ($results as $row) {
            $term = get_term($row->term_id, 'sc_product_category');
            if ($term && !is_wp_error($term)) {
                $categories[] = [
                    'id' => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'weight' => $row->weight,
                ];
            }
        }

        return $categories;
    }

    public function enqueue_scripts() {
        // wp_localize_script('reco-js', 'RECO_CFG', ['uid' => $this->get_reco_uid(), 'endpoint' => rest_url('reco/v1/event')]);
        wp_enqueue_style('site-core');
        wp_enqueue_script('site-core');
    }

    public function get_reco_uid() {
        if (!isset($_COOKIE['reco_uid'])) {
            $uid = wp_generate_uuid4();
            setcookie('reco_uid', $uid, time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true);
            $_COOKIE['reco_uid'] = $uid;
        }
        return $_COOKIE['reco_uid'];
    }

    public function ingest_event(WP_REST_Request $request) {
        global $wpdb;
        $payload = $request->get_json_params();
        $uid = $this->get_reco_uid();
        $session = $payload['session_id'] ?? $uid;
        $type = sanitize_text_field($payload['event_type']);
        $item = isset($payload['item_id']) ? intval($payload['item_id']) : null;
        $cat  = isset($payload['category_id']) ? intval($payload['category_id']) : null;
        $meta = wp_json_encode($payload['meta'] ?? []);
        $ip_address = Ecommerce::get_instance()->get_client_ip();
        
        $wpdb->insert($this->tables->reco_events, [
            'occurred_at' => current_time('mysql', 1),
            'session_id' => $session,
            'user_key' => $uid,
            'user_id' => get_current_user_id() ?: null,
            'event_type' => $type,
            'item_id' => $item,
            'category_id' => $cat,
            'meta' => $meta,
            'ip' => $ip_address,
            'ua' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);

        if ($cat) {
            $this->update_interest($uid, 'category', $cat, $type);
        }
        return new WP_REST_Response(['ok' => true], 200);
    }

    public function update_interest($user_key, $tax, $term_id, $event_type) {
        global $wpdb;
        $w = in_array($event_type, ['add_to_cart', 'purchase']) ? 3.0 : ($event_type === 'view_item' ? 1.0 : 0.3);
        
        $wpdb->query($wpdb->prepare("
            INSERT INTO {$this->tables->reco_user_interest} (user_key, taxonomy, term_id, weight)
            VALUES (%s, %s, %d, %f)
            ON DUPLICATE KEY UPDATE weight = weight * EXP(-TIMESTAMPDIFF(SECOND, updated_at, NOW()) / (3600 * 24)) + %f
        ", $user_key, $tax, $term_id, $w, $w));
    }

    public function search_products($args = []) {
        $defaults = [
            'post_type' => 'sc_product',
            'post_status' => 'publish',
            'posts_per_page' => 12,
        ];
        return new WP_Query(array_merge($defaults, $args));
    }

    public function filter_product_query($query) {
        if (is_admin() || !$query->is_main_query() || !is_post_type_archive('sc_product')) {
            return;
        }

        $ctx = ['category_id' => get_queried_object_id() ?: null];
        $candidates = $this->get_candidates($ctx);

        if (empty($candidates)) {
            return;
        }

        $ids = array_keys($candidates);
        $query->set('post__in', $ids);
        $query->set('orderby', 'post__in');
    }

    public function get_candidates($ctx) {
        global $wpdb;
        $uid = $this->get_reco_uid();
        
        $recent_items = $wpdb->get_col($wpdb->prepare("
            SELECT DISTINCT item_id FROM {$this->tables->reco_events} 
            WHERE user_key = %s AND item_id IS NOT NULL AND event_type = 'view_item'
            ORDER BY occurred_at DESC LIMIT 5
        ", $uid));

        $sim_items = [];
        if (!empty($recent_items)) {
            $item_list = implode(',', array_map('intval', $recent_items));
            $results = $wpdb->get_results("
                SELECT sim_item_id, score FROM {$this->tables->reco_item_sim}
                WHERE item_id IN ({$item_list}) ORDER BY score DESC LIMIT 50
            ");
            foreach ($results as $row) {
                $sim_items[$row->sim_item_id] = max($sim_items[$row->sim_item_id] ?? 0, (float)$row->score);
            }
        }

        if (empty($sim_items) && !empty($ctx['category_id'])) {
            $top_in_cat = $wpdb->get_col($wpdb->prepare("
                SELECT p.ID FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->term_relationships} tr ON p.ID = tr.object_id
                INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                WHERE p.post_type = 'sc_product' AND p.post_status = 'publish' AND tt.taxonomy = 'sc_product_category' AND tt.term_id = %d
                ORDER BY p.post_date DESC LIMIT 100
            ", $ctx['category_id']));
            foreach ($top_in_cat as $id) {
                $sim_items[$id] = 0.2;
            }
        }
        
        arsort($sim_items);
        return $sim_items;
    }
}