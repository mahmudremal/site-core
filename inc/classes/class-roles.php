<?php
/**
 * User Roles table class
 *
 * @package SiteCore
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_Error;
use WP_REST_Request;
use WP_User_Query;

class Roles {
	use Singleton;
    
    private $roles;
    
	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_filter('init', [$this, 'register_custom_partnership_roles']);
        add_filter('pm_project/settings/fields', [$this, 'settings'], 4, 1);
        add_filter('admin_init', [$this, 'restrict_partnership_roles_admin_access']);
        add_action('after_setup_theme', [$this, 'disable_toolbar_for_partnership_roles']);
        add_filter('partnership/security/permission/approval', [$this, 'api_permission_approval'], 10, 2);
    }

    public function register_routes() {
		register_rest_route('sitecore/v1', '/settings/roles', [
			'methods' => 'POST',
			'callback' => [$this, 'api_settings_roles'],
			'permission_callback' => function(WP_REST_Request $request) {
                // if ( ! is_user_logged_in() ) {
                //     return new WP_Error('rest_not_logged_in', __('You must be logged in to access this endpoint.', 'site-core'), ['status' => 401]);
                // }
                // $_nonce = $request->get_header('X-WP-Nonce');
                // return !empty($_nonce) && wp_verify_nonce($_nonce, '_role_settings_security');
                return true;
            },
		]);
		register_rest_route('sitecore/v1', '/roles', [
			'methods' => 'GET',
			'callback' => [$this, 'api_list_roles'],
            'permission_callback' => '__return_true'
		]);
    }
    
    public function get_roles() {
        if ( ! $this->roles ) {
            $roles = get_option('_partnership_roles', []);
            $this->roles = [
                'partnership_project_manager' => [
                    'label' => __('Partnership Project Manager', 'site-core'),
                    'capabilities' => [
                        'all_access' => true,
                    ],
                ],
                'partnership_stuff'          => [
                    'label' => __('Partnership Freelancer', 'site-core'),
                    'capabilities' => [
                        'read' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_influencer'     => [
                    'label' => __('Partnership Influencer', 'site-core'),
                    'capabilities' => [
                        'read' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_partner'        => [
                    'label' => __('Partnership Partner', 'site-core'),
                    'capabilities' => [
                        'read' => true,
                        'users' => true,
                        'payouts' => true,
                        'referral' => true,
                        'invoices' => false,
                        'packages' => true,
                        'contracts' => false,
                        'partner-docs' => true,
                        'support-ticket' => true,
                    ],
                ],
                'partnership_client'         => [
                    'label' => __('Partnership Client', 'site-core'),
                    'capabilities' => [
                        'read' => true,
                        'team' => true,
                        'stores' => true,
                        'payouts' => false,
                        'referral' => true,
                        'invoices' => true,
                        'packages' => true,
                        'contracts' => true,
                        'service-docs' => true,
                        'support-ticket' => true,
                    ],
                ],
            ];
            foreach ($this->roles as $role_key => $role) {
                if (isset($roles[$role_key])) {
                    $this->roles[$role_key]['capabilities'] = $roles[$role_key];
                }
            }
        }
        return $this->roles;
    }
    
    public function register_custom_partnership_roles() {
        $roles = $this->get_roles();
        // 
        foreach ($roles as $role_key => $role) {
            add_role($role_key, $role['label'], $role['capabilities']);
        }
    }
    
    public function restrict_partnership_roles_admin_access() {
        if ( is_admin() && ! defined( 'DOING_AJAX' ) && is_user_logged_in() ) {
            $restricted_roles = array_keys($this->get_roles());
            // 
            $user = wp_get_current_user();
            // 
            foreach ( $restricted_roles as $role ) {
                if ( in_array( $role, (array) $user->roles, true ) ) {
                    wp_redirect( home_url() );
                    exit;
                }
            }
        }
    }
    public function disable_toolbar_for_partnership_roles() {
        if ( is_user_logged_in() ) {
            $restricted_roles = array_keys($this->get_roles());

            $user = wp_get_current_user();

            foreach ( $restricted_roles as $role ) {
                if ( in_array( $role, (array) $user->roles, true ) ) {
                    show_admin_bar( false );
                    return;
                }
            }
        }
    }

    public function api_settings_roles(WP_REST_Request $request) {
        $form = (array) $request->get_param('form') ?: [];
        if (empty($form)) {
            return new WP_Error('no_data_found', 'No data found.', ['status' => 404]);
        }
        $_updated = update_option('_partnership_roles', $form, null);
        // $_updated = $form;
        return rest_ensure_response(['success' => $_updated]);
    }

    public function api_list_roles(WP_REST_Request $request) {
        return rest_ensure_response($this->get_roles());
    }
    
    public function settings($args) {
		$args['roles']		= [
			'title'							=> __('Roles', 'site-core'),
			'description'					=> __('Roles configurations, fields customization. Things enables and disables.', 'site-core'),
			'fields'						=> [
				[
					'id' 					=> 'roles-assign-interface',
					'label'					=> __('N/A', 'site-core'),
					'description'			=> __('Role assign interface will be apear here.', 'site-core'),
					'type'					=> 'text',
					'default'				=> '',
					'attr'					=> [
						'data-config'		=> esc_attr(
							json_encode([
								'_nonce'		=> wp_create_nonce('_role_settings_security'),
								'roles'			=> Roles::get_instance()->get_roles()
							])
						),
					]
				],
			]
		];
        return $args;
    }


    public function has_ability($capabilities, $user_id = false) {
        if (!$user_id) {
            $user_id = Security::get_instance()->user_id;
        }
        $capabilities = (array) $capabilities;
        // 
        $user = is_integer($user_id) ? get_user_by('id', $user_id) : $user_id;
        if (!$user) {return false;}
        $user_roles = (array) $user->roles;
        $roles = $this->get_roles();
        foreach ($user_roles as $role) {
            if (empty($roles[$role]['capabilities'])) {
                continue;
            }

            $role_capabilities = $roles[$role]['capabilities'];

            if (!empty($role_capabilities['all_access'])) {
                return true;
            }

            foreach ($capabilities as $capability) {
                if (!empty($role_capabilities[$capability])) {
                    return true;
                }
            }
        }

        return false;
    }
    

    public function api_permission_approval($permission, WP_REST_Request $request) {
        return true;


        
        // if ( ! is_user_logged_in() ) {return false;}
        $user_id = Security::get_instance()->user_id;
        if ( ! $user_id ) {return false;}

        
        $_route = $request->get_route();
        if (! str_starts_with($_route, '/sitecore/v1/')) {
            return $permission;
        }
        $_route = str_replace('/sitecore/v1/', '', $_route);
        // 
        $_abilities = apply_filters('partnership/security/api/abilities', [], $_route, $user_id);
        if (empty($_abilities)) {return $permission;}
        // 
        return $this->has_ability($_abilities, $user_id);
    }
    
}