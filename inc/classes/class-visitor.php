<?php
namespace SITE_CORE\inc;

use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Visitor {
    use Singleton;

    protected $_visit_id;
    protected $session_key;
    protected $inline_memory;
    protected $visitor_table;
    protected $activity_table;
    protected $events_table;

    protected function __construct() {
        global $wpdb;
        $this->_visit_id        = null;
        $this->visitor_table    = [];
        $this->session_key      = 'pmsute_trks';
        $this->visitor_table    = $wpdb->prefix . 'sitecore_visitor';
        $this->activity_table   = $wpdb->prefix . 'sitecore_visit_activity';
        $this->events_table     = $wpdb->prefix . 'sitecore_visit_events';
        $this->setup_hooks();
        $this->setup_events();
    }

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('wp_enqueue_scripts', [$this, 'register_scripts']);
        register_activation_hook(WP_SITECORE__FILE__, [$this, 'register_activation_hook']);
        register_deactivation_hook(WP_SITECORE__FILE__, [$this, 'register_deactivation_hook']);
    }

    protected function setup_events() {
        add_action('init', function() {
            if (!session_id()) {
                session_start();
            }

            // On each page load, check for the visitor's tracker
            if (is_wp_error($this->get_visitor_by_tracker()) && $this->is_tracking_condition_met()) {
                // Generate a unique tracking code (you can customize this as needed)
                $tracking_id = uniqid('trk', true);
                $_SESSION[$this->session_key] = $tracking_id;
                
                // Store the visitor tracker in the database
                $this->create_visitor([
                    'tracker' => $tracking_id,
                    'user_id' => is_user_logged_in() ? get_current_user_id() : null,
                    'dataset' => null
                ]);
            }
        });

        add_action('template_redirect', function() {
            if ($this->is_tracking_condition_met() && !is_wp_error($this->get_visitor_by_tracker())) {
                if (function_exists('is_product') && is_product()) {
                    global $post;
                    $this->log_activity('visit', $post->ID, 1, 'product');
                } elseif (function_exists('is_product_category') && is_product_category()) {
                    $category = get_queried_object();
                    $this->log_activity('visit', $category->term_id, 1, 'category');
                } elseif (function_exists('is_archive') && is_archive()) {
                    $this->log_activity('visit', get_queried_object_id(), 1, 'archive');
                } elseif (is_singular()) {
                    $this->log_activity('visit', get_the_ID(), 1, 'post');
                } else {
                    if ($this->is_user_initiated_request()) {
                        if (is_404()) {
                            $this->log_activity('visit', $this->get_requested_uri(), 0, '404');
                        } else {
                            $this->log_activity('visit', $this->get_requested_uri(), 1, 'other');
                        }
                    }
                }
            }
        });

        add_action('woocommerce_add_to_cart', function($cart_item_key, $product_id, $quantity, $variation_id = null) {
            if ($this->is_tracking_condition_met()) {
                // Log the Add To Cart action
                $this->log_activity('atc', $product_id, 1, 'product'); // Set impression to 1 for successful add
            }
        });
        add_action('woocommerce_cart_updated', function() {
            if ($this->is_tracking_condition_met()) {
                $cart = WC()->cart->get_cart();
                foreach ($cart as $cart_item_key => $cart_item) {
                    $this->log_activity('cart_update', $cart_item['product_id'], 1, 'product');
                }
            }
        });
        add_action('wishlist_add', function($product_id) {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('wishlist_add', $product_id, 1, 'product');
            }
        });
        add_action('wishlist_remove', function($product_id) {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('wishlist_remove', $product_id, 1, 'product');
            }
        });
        add_action('woocommerce_thankyou', function($order_id) {
            if ($this->is_tracking_condition_met()) {
                // Log the checkout action
                $this->log_activity('checkout', $order_id, 1, 'checkout'); // Set impression to 1 for successful checkout
                $order = wc_get_order($order_id);
                $payment_method = $order->get_payment_method();
                if (!in_array($payment_method, ['cod', 'bank'])) {
                    $this->log_activity('online_checkout', $order_id, 1, 'checkout'); // Log activity
                }
            }
        });
        add_action('comment_post', function($comment_ID, $comment_approved) {
            if ($this->is_tracking_condition_met() && $comment_approved) {
                $this->log_activity(
                    'product' === get_post_type($comment->comment_post_ID) ? 'review' : 'comment',
                    $comment_ID,
                    1,
                    'comment'
                );
            }
        }, 10, 2);
        add_action('pre_get_posts', function($query) {
            if ($query->is_search() && !is_admin()) {
                if ($this->is_tracking_condition_met()) {
                    $search_query = get_search_query();
                    $this->log_activity('search', $search_query, 1, 'search');
                }
            }
        });
        add_action('wp_login', function($user_login, $user) {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('login', $user->ID, 1, 'user');
            }
        }, 10, 2);
        add_action('user_register', function($user_id) {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('registration', $user_id, 1, 'user');
            }
        });
        add_action('profile_update', function($user_id, $old_user_data) {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('profile_update', $user_id, 1, 'user');
            }
        }, 10, 2);
        add_action('wp_ajax_nopriv_submit_newsletter', function() {
            if ($this->is_tracking_condition_met()) {
                $this->log_activity('newsletter_signup', '', 1, 'newsletter');
            }
        });
        // Gravity Forms Submission Tracking
        add_action('gform_after_submission', function($entry, $form) {
            if ($this->is_tracking_condition_met()) {
                $form_id = $form['id'];
                $this->log_activity('form_submission', $form_id, 1, 'gravity_form'); // Log Gravity Form submission
            }
        }, 10, 2);
        // WPForms Submission Tracking
        add_action('wpforms_process_complete', function($fields, $form_data) {
            if ($this->is_tracking_condition_met()) {
                $form_id = $form_data['id'];
                $this->log_activity('form_submission', $form_id, 1, 'wpform'); // Log WPForms submission
            }
        }, 10, 2);
        // Metform Submission Tracking
        add_action('metform_after_submission', function($form_data) {
            if ($this->is_tracking_condition_met() && isset($form_data['form_id'])) {
                $form_id = $form_data['form_id'];
                $this->log_activity('form_submission', $form_id, 1, 'metform'); // Log Metform submission
            }
        });

    }

    public function register_routes() {
        // Activities REST API Routes
        register_rest_route('sitecore/v1', '/activities/(?P<activity_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_activity'],
            'permission_callback' => '__return_true',
            'args'                => [
                'activity_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Activity ID for fetching details.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/activities/(?P<activity_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_delete_activity'],
            'permission_callback' => '__return_true',
            'args'                => [
                'activity_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) && $param > 0; },
                    'description'       => __('Activity ID for deletion.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/activities/(?P<activity_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_save_activity'], // Create or Update depends on presence of activity_id in payload
            'permission_callback' => '__return_true',
            'args'                => [
                'activity_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); }, // ID can be 0 for create
                    'description'       => __('Activity ID for updating; use 0 to create a new activity.', 'site-core'),
                    'required'          => true,
                ],
                'visitor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) && $param > 0; },
                    'description'       => __('Visitor ID associated with the activity.', 'site-core'),
                    'required'          => true,
                ],
                'activity' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Description of the activity.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        // Visitors REST API Routes
        register_rest_route('sitecore/v1', '/visitors/(?P<visitor_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_visitor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'visitor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Visitor ID for fetching details.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/visitors/(?P<visitor_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_delete_visitor'],
            'permission_callback' => '__return_true',
            'args'                => [
                'visitor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) && $param > 0; },
                    'description'       => __('Visitor ID for deletion.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/visitors/(?P<visitor_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_save_visitor'], // Create or Update depends on visitor_id in payload
            'permission_callback' => '__return_true',
            'args'                => [
                'visitor_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); }, // ID can be 0 for create
                    'description'       => __('Visitor ID for updating; use 0 to create a new visitor.', 'site-core'),
                    'required'          => true,
                ],
                'tracker' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Tracker code for the visitor.', 'site-core'),
                    'required'          => true,
                ],
                'user_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) || is_null($param); },
                    'description'       => __('User ID associated with the visitor; can be null.', 'site-core'),
                    'required'          => false,
                ],
                'dataset' => [
                    'validate_callback' => function($param) { return is_string($param) || is_null($param); },
                    'description'       => __('Serialized dataset for the visitor; can be null.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);

        // Events REST API Routes
        register_rest_route('sitecore/v1', '/events/(?P<event_id>\d+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'api_get_event'],
            'permission_callback' => '__return_true',
            'args'                => [
                'event_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); },
                    'description'       => __('Event ID for fetching details.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/events/(?P<event_id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'api_delete_event'],
            'permission_callback' => '__return_true',
            'args'                => [
                'event_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) && $param > 0; },
                    'description'       => __('Event ID for deletion.', 'site-core'),
                    'required'          => true,
                ],
            ],
        ]);

        register_rest_route('sitecore/v1', '/events/(?P<event_id>\d+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'api_save_event'], // Create or Update depends on event_id in payload
            'permission_callback' => '__return_true',
            'args'                => [
                'event_id' => [
                    'validate_callback' => function($param) { return is_numeric($param); }, // ID can be 0 for create
                    'description'       => __('Event ID for updating; use 0 to create a new event.', 'site-core'),
                    'required'          => true,
                ],
                'activity_id' => [
                    'validate_callback' => function($param) { return is_numeric($param) && $param > 0; },
                    'description'       => __('Activity ID associated with the event.', 'site-core'),
                    'required'          => true,
                ],
                'event_type' => [
                    'validate_callback' => function($param) { return !empty($param); },
                    'description'       => __('Type of the event (stay, click, scroll).', 'site-core'),
                    'required'          => true,
                ],
                'target' => [
                    'validate_callback' => function($param) { return is_string($param) || is_null($param); },
                    'description'       => __('Target of the event; can be null.', 'site-core'),
                    'required'          => false,
                ],
            ],
        ]);
    }

    public function register_activation_hook() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql_visitor = "CREATE TABLE IF NOT EXISTS {$this->visitor_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            tracker VARCHAR(255) NOT NULL UNIQUE,
            user_id BIGINT NULL DEFAULT NULL,
            dataset LONGTEXT DEFAULT NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";

        $sql_activity = "CREATE TABLE IF NOT EXISTS {$this->activity_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            visitor_id BIGINT NOT NULL,
            impression INT NOT NULL DEFAULT 1,
            issuedat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            activity TEXT NOT NULL,
            object_type ENUM('post', 'archive', '404', 'product', 'category', 'checkout', 'other') NOT NULL,
            object_id TEXT NOT NULL,
            PRIMARY KEY (id),
            KEY visitor_id_idx (visitor_id)
        ) $charset_collate;";



        $sql_events = "CREATE TABLE IF NOT EXISTS {$this->events_table} (
            id BIGINT NOT NULL AUTO_INCREMENT,
            activity_id BIGINT NOT NULL,
            attime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            event_type ENUM('stay', 'click', 'scroll') NOT NULL,
            target TEXT DEFAULT NULL,
            PRIMARY KEY (id),
            KEY activity_id_idx (activity_id)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_visitor);
        dbDelta($sql_activity);
        dbDelta($sql_events);
    }

    public function register_deactivation_hook() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$this->visitor_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->activity_table}");
        $wpdb->query("DROP TABLE IF EXISTS {$this->events_table}");
    }

    public function register_scripts() {
        if (!$this->is_allowed()) {return;}
		// Enqueue scripts.
		wp_enqueue_script('site-core-visitor', WP_SITECORE_BUILD_JS_URI . '/visitor.js', [], Assets::filemtime(WP_SITECORE_BUILD_JS_DIR_PATH . '/visitor.js'), true);
        wp_localize_script('site-core-visitor', '_visitorline', ['visit_id' => $this->_visit_id]);
	}

    public function is_allowed() {
        return !(is_user_logged_in() && current_user_can('administrator'));
    }

    public function api_get_activity(WP_REST_Request $request) {
        $activity_id = (int) $request->get_param('activity_id');
        
        // Fetch activity from the database using the ID
        $activity = $this->get_activity($activity_id);

        if (is_wp_error($activity)) {
            return $activity; // Return error if activity is not found
        }

        return rest_ensure_response($activity);
    }

    public function api_delete_activity(WP_REST_Request $request) {
        $activity_id = (int) $request->get_param('activity_id');
        
        // Delete activity and return status
        $result = $this->delete_activity($activity_id);

        if (is_wp_error($result)) {
            return $result; // Return error if delete operation failed
        }

        return rest_ensure_response(['status' => 'success', 'message' => 'Activity deleted successfully.']);
    }

    public function api_save_activity(WP_REST_Request $request) {
        // Get parameters
        $activity_id = (int) $request->get_param('activity_id');
        $visitor_id = (int) $request->get_param('visitor_id');
        $activity = sanitize_text_field($request->get_param('activity'));

        if ($activity_id === 0) {
            // Creating a new activity
            $activity_id = $this->create_activity($visitor_id, $activity);
        } else {
            // Updating an existing activity
            $activity_id = $this->update_activity($activity_id, $visitor_id, $activity);
        }

        if (is_wp_error($activity_id)) {
            return $activity_id; // Return error if create/update failed
        }

        return rest_ensure_response(['activity_id' => $activity_id]);
    }

    // Visitors

    public function api_get_visitor(WP_REST_Request $request) {
        $visitor_id = (int) $request->get_param('visitor_id');

        // Fetch visitor
        $visitor = $this->get_visitor($visitor_id, true);
        if (is_wp_error($visitor)) {
            return $visitor; // Return error if visitor not found
        }

        // Fetch activities
        global $wpdb;
        $activities = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$this->activity_table} WHERE visitor_id = %d", $visitor_id),
            ARRAY_A
        );

        // Fetch events associated with each activity
        foreach ($activities as &$activity) {
            $activity['events'] = $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$this->events_table} WHERE activity_id = %d", $activity['id']),
                ARRAY_A
            );
        }

        // Attach activities to visitor data
        $visitor['activities'] = $activities;

        return rest_ensure_response($visitor);
    }

    public function api_delete_visitor(WP_REST_Request $request) {
        $visitor_id = (int) $request->get_param('visitor_id');

        // Delete activities and events
        global $wpdb;
        $wpdb->delete($this->events_table, ['activity_id' => $visitor_id]); // Assuming visitor_id can be used to fetch events (may need actual logic based on activities)
        $activities = $wpdb->get_results($wpdb->prepare("SELECT id FROM {$this->activity_table} WHERE visitor_id = %d", $visitor_id));

        foreach ($activities as $activity) {
            $wpdb->delete($this->events_table, ['activity_id' => $activity->id]); // Delete related events
        }
        $wpdb->delete($this->activity_table, ['visitor_id' => $visitor_id]); // Delete related activities

        // Delete the visitor
        $result = $this->delete_visitor($visitor_id);
        if (is_wp_error($result)) {
            return $result; // Return error if delete operation failed
        }

        return rest_ensure_response(['status' => 'success', 'message' => 'Visitor and associated data deleted successfully.']);
    }

    public function api_save_visitor(WP_REST_Request $request) {
        // Get parameters
        $visitor_id = (int) $request->get_param('visitor_id');
        $tracker = sanitize_text_field($request->get_param('tracker'));
        $user_id = $request->get_param('user_id') !== null ? (int) $request->get_param('user_id') : null;
        $dataset = $request->get_param('dataset');

        if ($visitor_id === 0) {
            // Creating a new visitor
            $visitor_id = $this->create_visitor([
                'tracker' => $tracker,
                'user_id' => $user_id,
                'dataset' => $dataset,
            ]);
        } else {
            // Updating an existing visitor
            $update_data = [
                'tracker' => $tracker,
                'user_id' => $user_id,
                'dataset' => $dataset,
            ];
            $this->update_visitor($visitor_id, $update_data);
        }

        if (is_wp_error($visitor_id)) {
            return $visitor_id; // Return error if create/update failed
        }

        return rest_ensure_response(['visitor_id' => $visitor_id]);
    }

    // Events

    public function api_get_event(WP_REST_Request $request) {
        $event_id = (int) $request->get_param('event_id');
        
        // Fetch event from the database using the ID
        $event = $this->get_event($event_id);

        if (is_wp_error($event)) {
            return $event; // Return error if event not found
        }

        return rest_ensure_response($event);
    }

    public function api_delete_event(WP_REST_Request $request) {
        $event_id = (int) $request->get_param('event_id');
        
        // Delete event and return status
        $result = $this->delete_event($event_id);

        if (is_wp_error($result)) {
            return $result; // Return error if delete operation failed
        }

        return rest_ensure_response(['status' => 'success', 'message' => 'Event deleted successfully.']);
    }

    public function api_save_event(WP_REST_Request $request) {
        // Get parameters
        $event_id = (int) $request->get_param('event_id');
        $activity_id = (int) $request->get_param('activity_id');
        $event_type = sanitize_text_field($request->get_param('event_type'));
        $target = $request->get_param('target');

        if ($event_id === 0) {
            // Creating a new event
            $event_id = $this->create_event($activity_id, $event_type, $target);
        } else {
            // Updating an existing event
            $this->update_event($event_id, $activity_id, $event_type, $target);
        }

        if (is_wp_error($event_id)) {
            return $event_id; // Return error if create/update failed
        }

        return rest_ensure_response(['event_id' => $event_id]);
    }
    

    // Visitors

    private function get_visitor($visitor_id, $with_info = false) {
        global $wpdb;

        $visitor_id = intval($visitor_id);
        if ($visitor_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid visitor ID.');
        }

        $visitor = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->visitor_table} WHERE id = %d", $visitor_id),
            ARRAY_A
        );

        if (!$visitor) {
            return new WP_Error('visitor_not_found', 'Visitor not found.');
        }

        if ($with_info && !empty($visitor['dataset'])) {
            $visitor['dataset'] = maybe_unserialize($visitor['dataset']);
        }

        return $visitor;
    }

    private function create_visitor($data) {
        global $wpdb;

        $tracker = sanitize_text_field($data['tracker']);
        $user_id = isset($data['user_id']) ? intval($data['user_id']) : null;
        $dataset = isset($data['dataset']) ? maybe_serialize($data['dataset']) : null;

        $insert_data = [
            'tracker' => $tracker,
            'user_id' => $user_id,
            'dataset' => $dataset,
        ];

        $result = $wpdb->insert($this->visitor_table, $insert_data);
        if ($result === false) {
            return new WP_Error('db_insert_error', 'Failed to insert visitor.', $wpdb->last_error);
        }

        return $wpdb->insert_id;
    }

    private function update_visitor($visitor_id, $data) {
        global $wpdb;

        $visitor_id = intval($visitor_id);
        if ($visitor_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid visitor ID.');
        }

        $update_data = [];
        if (isset($data['tracker'])) {
            $update_data['tracker'] = sanitize_text_field($data['tracker']);
        }
        if (isset($data['user_id'])) {
            $update_data['user_id'] = intval($data['user_id']);
        }
        if (isset($data['dataset'])) {
            $update_data['dataset'] = maybe_serialize($data['dataset']);
        }

        if (empty($update_data)) {
            return new WP_Error('no_data', 'No data to update.');
        }

        $result = $wpdb->update($this->visitor_table, $update_data, ['id' => $visitor_id]);
        return $result !== false;
    }

    private function delete_visitor($visitor_id) {
        global $wpdb;

        $visitor_id = intval($visitor_id);
        if ($visitor_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid visitor ID.');
        }

        $result = $wpdb->delete($this->visitor_table, ['id' => $visitor_id]);
        if ($result === false) {
            return new WP_Error('db_delete_error', 'Failed to delete visitor.', $wpdb->last_error);
        }

        return true;
    }

    // Activities

    private function get_activity($activity_id) {
        global $wpdb;

        $activity_id = intval($activity_id);
        if ($activity_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid activity ID.');
        }

        $activity = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->activity_table} WHERE id = %d", $activity_id),
            ARRAY_A
        );

        if (!$activity) {
            return new WP_Error('activity_not_found', 'Activity not found.');
        }

        return $activity;
    }

    private function create_activity($visitor_id, $activity) {
        global $wpdb;

        $visitor_id = intval($visitor_id);
        if ($visitor_id <= 0) {
            return new WP_Error('invalid_visitor', 'Invalid visitor ID for activity.');
        }

        $activity = sanitize_text_field($activity);
        
        $insert_data = [
            'visitor_id' => $visitor_id,
            'activity'   => $activity,
        ];

        $result = $wpdb->insert($this->activity_table, $insert_data);
        if ($result === false) {
            return new WP_Error('db_insert_error', 'Failed to insert activity.', $wpdb->last_error);
        }

        return $wpdb->insert_id;
    }

    private function update_activity($activity_id, $visitor_id, $activity) {
        global $wpdb;

        $activity_id = intval($activity_id);
        $visitor_id = intval($visitor_id);

        if ($activity_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid activity ID.');
        }

        $update_data = [
            'visitor_id' => $visitor_id,
            'activity'   => sanitize_text_field($activity),
        ];

        $result = $wpdb->update($this->activity_table, $update_data, ['id' => $activity_id]);
        return $result !== false;
    }

    private function delete_activity($activity_id) {
        global $wpdb;

        $activity_id = intval($activity_id);
        if ($activity_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid activity ID.');
        }

        $result = $wpdb->delete($this->activity_table, ['id' => $activity_id]);
        if ($result === false) {
            return new WP_Error('db_delete_error', 'Failed to delete activity.', $wpdb->last_error);
        }

        return true;
    }

    // Events

    private function get_event($event_id) {
        global $wpdb;

        $event_id = intval($event_id);
        if ($event_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid event ID.');
        }

        $event = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->events_table} WHERE id = %d", $event_id),
            ARRAY_A
        );

        if (!$event) {
            return new WP_Error('event_not_found', 'Event not found.');
        }

        return $event;
    }

    private function create_event($activity_id, $event_type, $target) {
        global $wpdb;

        $activity_id = intval($activity_id);
        if ($activity_id <= 0) {
            return new WP_Error('invalid_activity', 'Invalid activity ID for event.');
        }

        $event_type = sanitize_text_field($event_type);
        $target = !empty($target) ? sanitize_textarea_field($target) : null;

        $insert_data = [
            'activity_id' => $activity_id,
            'event_type'  => $event_type,
            'target'      => $target,
        ];

        $result = $wpdb->insert($this->events_table, $insert_data);
        if ($result === false) {
            return new WP_Error('db_insert_error', 'Failed to insert event.', $wpdb->last_error);
        }

        return $wpdb->insert_id;
    }

    private function update_event($event_id, $activity_id, $event_type, $target) {
        global $wpdb;

        $event_id = intval($event_id);
        $activity_id = intval($activity_id);

        if ($event_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid event ID.');
        }

        $update_data = [
            'activity_id' => $activity_id,
            'event_type'  => sanitize_text_field($event_type),
            'target'      => !empty($target) ? sanitize_textarea_field($target) : null,
        ];

        $result = $wpdb->update($this->events_table, $update_data, ['id' => $event_id]);
        return $result !== false;
    }

    private function delete_event($event_id) {
        global $wpdb;

        $event_id = intval($event_id);
        if ($event_id <= 0) {
            return new WP_Error('invalid_id', 'Invalid event ID.');
        }

        $result = $wpdb->delete($this->events_table, ['id' => $event_id]);
        if ($result === false) {
            return new WP_Error('db_delete_error', 'Failed to delete event.', $wpdb->last_error);
        }

        return true;
    }

    


    private function log_activity($activity_type, $object_id, $impression = 1, $object_type = 'other') {
        global $wpdb;
        
        $visitor = $this->get_visitor_by_tracker();
        
        if (is_wp_error($visitor)) {
            return new WP_Error('visitor_not_found', 'Failed to get visitor');
        }

        // Insert data into the database
        $result = $wpdb->insert(
            $this->activity_table,
            [
                'visitor_id'   => $visitor['id'],
                'activity'     => sanitize_text_field($activity_type),
                'issuedat'     => current_time('mysql', 1),
                'impression'   => intval($impression),
                'object_type'  => sanitize_text_field($object_type),
                'object_id'    => sanitize_textarea_field($object_id),
            ],
            ['%d', '%s', '%s', '%d', '%s', '%s']
        );

        if ($result === false) {
            return new WP_Error('db_insert_error', 'Failed to log activity.', $wpdb->last_error);
        }

        $activity_id = $wpdb->insert_id;

        if ($activity_type == 'visit') {
            $this->_visit_id = $activity_id;
        }

        return $activity_id;
    }
    private function get_visitor_by_tracker() {
        global $wpdb;
        $tracker = $_SESSION[$this->session_key] ?? null;
        if (empty($tracker)) {
            return new WP_Error('tracker_not_found', 'Visitor tracker not found.');
        }
        
        // Sanitize the tracker input
        $tracker = sanitize_text_field($tracker);

        // Fetch visitor from the database using the tracker
        $visitor = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$this->visitor_table} WHERE tracker = %s", $tracker),
            ARRAY_A
        );

        // Check if visitor exists
        if (!$visitor) {
            return new WP_Error('visitor_not_found', 'Visitor not found.');
        }

        return $visitor;
    }
    public function get_requested_uri() {
        global $wp;
        return home_url(add_query_arg(array(), $wp->request));
    }
    private function is_tracking_condition_met() {
        return !wp_doing_ajax() && !(defined('REST_REQUEST') && REST_REQUEST) && !is_admin() && $this->is_allowed();
    }
    private function is_user_initiated_request() {
        if (defined('DOING_AJAX') && DOING_AJAX) {return false;}
        return !(isset($_SERVER['HTTP_USER_AGENT']) && preg_match('/bot|crawl|spider/i', $_SERVER['HTTP_USER_AGENT']));
    }

    public function get_product_recommendations($visitor_id) {
        global $wpdb;

        // Get the last 5 visited products
        $visited_products = $wpdb->get_results($wpdb->prepare(
            "SELECT object_id FROM {$this->activity_table} 
            WHERE visitor_id = %d AND object_type = 'product'
            ORDER BY issuedat DESC LIMIT 5",
            $visitor_id
        ));

        $product_ids = array_map(function($entry) {
            return $entry->object_id;
        }, $visited_products);

        $recommended_products = [];

        if (!empty($product_ids)) {
            // Get related products based on categories of visited products
            foreach ($product_ids as $product_id) {
                // Retrieve product categories
                $terms = get_the_terms($product_id, 'product_cat');
                if ($terms) {
                    foreach ($terms as $term) {
                        $related_products = wc_get_products([
                            'category' => [$term->slug],
                            'exclude' => $product_ids, // Exclude already viewed products
                            'limit' => 3 // Get a limited number of related products
                        ]);
                        $recommended_products = array_merge($recommended_products, $related_products);
                    }
                }
            }
        }

        return array_unique($recommended_products, SORT_REGULAR);
    }
    
}
