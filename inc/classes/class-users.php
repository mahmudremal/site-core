<?php
/**
 * Users table class
 *
 * @package PartnershipManager
 */
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_REST_Response;
use WP_REST_Request;
use WP_User_Query;
use WP_Error;

class Users {
	use Singleton;

	protected function __construct() {
		// Load class.
		$this->setup_hooks();
	}

    protected function setup_hooks() {
        add_filter('rest_api_init', [$this, 'rest_api_init']);
        add_filter('partnership/security/api/abilities', [$this, 'api_abilities'], 10, 3);
    }
    
    public function rest_api_init() {
        register_rest_route(
            'sitecore/v1', '/users', [
                'methods'  => 'GET',
                'callback' => [$this, 'api_get_users'],
                'args'     => [
                    'page'     => [
                        'default'           => 1,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'description'       => __('Page number.', 'site-core')
                    ],
                    's'        => [
                        'default'           => '',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __('Search keyword.', 'site-core')
                    ],
                    'status'   => [
                        'default'           => '',
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __('User status (e.g., pending, approved).', 'site-core'),
                    ],
                    'per_page' => [
                        'default'           => 10,
                        'sanitize_callback' => 'absint',
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'description'       => __('Number of users per page.', 'site-core')
                    ]
                ],
                'permission_callback' => [Security::get_instance(), 'permission_callback']
            ]
        );
        register_rest_route(
            'sitecore/v1', '/users/(?P<user_id>\d+)', [
                'methods'             => 'GET',
                'callback'            => [$this, 'api_get_user_details'],
                'permission_callback' => [Security::get_instance(), 'permission_callback'],
                'args'                => [
                    'user_id' => [
                        'validate_callback' => function ($v) {return is_numeric($v);},
                        'sanitize_callback' => function ($v) {return absint($v);},
                        'required'          => true
                    ]
                ]
            ]
        );
        register_rest_route(
            'sitecore/v1', '/users/(?P<user_id>\d+)', [
                'methods'             => 'POST',
                'callback'            => [$this, 'api_update_user_details'],
                'permission_callback' => [Security::get_instance(), 'permission_callback']
            ]
        );
        register_rest_route(
            'sitecore/v1', '/users/(?P<user_id>\d+)/avater', [
                'methods'             => 'POST',
                'callback'            => [$this, 'api_update_user_avater'],
                'permission_callback' => [Security::get_instance(), 'permission_callback']
            ]
        );
    }
    
    public function api_abilities($abilities, $_route, $user_id) {
        if (str_starts_with($_route, 'users/')) {
            $abilities[] = 'users';
        }
        return $abilities;
    }
    
    public function api_get_users(WP_REST_Request $request) {
        $search   = $request->get_param('s');
        $page     = $request->get_param('page');
        $status   = $request->get_param('status');
        $per_page = $request->get_param('per_page');

        $args = array(
            'number'  => $per_page,
            'offset'  => ( $page - 1 ) * $per_page,
            'search'  => "*{$search}*",
            'fields'  => 'all',
            'orderby' => 'ID',
            'order'   => 'ASC',
            // 'role__in' => ['partnership_stuff', 'partnership_project_manager', 'partnership_partner'],
            // 'include' => [1, 5, 12, 27, 30], // Replace with your actual user IDs
        );

        // if ( ! empty( $status ) && $status != 'any' ) {
        //     $args['meta_query'] = array(
        //         array(
        //             'key'   => '_verified',
        //             'value' => strtolower(trim($status)) === 'active',
        //         ),
        //     );
        // }

        $user_query = new WP_User_Query( $args );
        $users      = $user_query->get_results();
        $total_users = $user_query->get_total();
        $max_pages   = ceil( $total_users / $per_page );

        $response_data = array();
        foreach ( $users as $user ) {
            $response_data[] = array(
                'id'         => $user->ID,
                'username'   => $user->user_login,
                'email'      => $user->user_email,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                // 'meta'       => get_user_meta($user->ID),
                ...$this->prepare_user_data_for_response($user)
            );
        }

        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', $total_users );
        $response->header( 'X-WP-TotalPages', $max_pages );

        return $response;
    }

    public function api_get_user_details(WP_REST_Request $request) {
        $user_id = $request->get_param('user_id');
        if ( ! $user_id ) {
            return new WP_Error( 'invalid_user_id', __('User ID is required.', 'site-core'), array( 'status' => 400 ) );
        }
        $user = get_userdata( $user_id );
        if ( ! $user ) {
            return new WP_Error( 'rest_user_invalid_id', __('Invalid user ID.', 'site-core'), array( 'status' => 404 ) );
        }
        // return rest_ensure_response( $this->prepare_user_data_for_response( $user ) );
        // $user_meta = get_user_meta($user_id, false, true);
        // $transformed_meta = array_map(function ($value) {
        //     if (is_array($value) && count($value) === 1) {
        //         return $value[0];
        //     }
        //     return $value;
        // }, $user_meta);
        return rest_ensure_response([
            'caps' => $user->caps,
            'roles' => $user->roles,
            'email' => $user->data->user_email,
            // 'metadata' => $transformed_meta,
            'editable' => $user->ID === Security::get_instance()->user_id,
            'metadata' => [
                // ...$transformed_meta,
                'first_name' => get_user_meta($user_id, 'first_name', true),
                'last_name' => get_user_meta($user_id, 'last_name', true),
                'description' => get_user_meta($user_id, 'description', true),

            ],
            ...$this->prepare_user_data_for_response($user)
        ]);
    }

    public function api_update_user_details(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id');
        $metadata = (array) $request->get_param('metadata');
        // 
        $sanitized_email = sanitize_email($request->get_param('email'));

        if (!is_email($sanitized_email)) {
            return new WP_Error('invalid_email', __('The provided email address is not valid.'));
        }
        // if (email_exists($sanitized_email) && get_user_by('email', $sanitized_email)->ID !== $user_id) {
        //     return new WP_Error('email_exists', __('This email address is already in use.'));
        // }
        $updated = [];
        // $updated['email'] = wp_update_user(['ID' => $user_id, 'user_email' => $sanitized_email]);
        // 
        foreach ($metadata as $meta_key => $meta_value) {
            $updated[$meta_key] = update_user_meta($user_id, $meta_key, sanitize_text_field($meta_value));
        }
        // 
        return rest_ensure_response($updated);
    }

    public function api_update_user_avater(WP_REST_Request $request) {
        $user_id = (int) $request->get_param('user_id');

        if (!get_user_by('id', $user_id)) {
            return new WP_Error('invalid_user_id', __('Invalid user ID.'), array('status' => 404));
        }

        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            return new WP_Error('no_file_uploaded', __('No file was uploaded or an error occurred during upload.'), array('status' => 400));
        }

        $uploaded_file = $_FILES['avatar'];

        $allowed_types = array('image/jpeg', 'image/png', 'image/gif');
        if (!in_array($uploaded_file['type'], $allowed_types)) {
            return new WP_Error('invalid_file_type', __('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), array('status' => 400));
        }

        $upload_dir = wp_upload_dir();
        $user_files_dir = $upload_dir['basedir'] . '/userfiles/';
        if (!is_dir($user_files_dir)) {
            wp_mkdir_p($user_files_dir);
        }

        $previous_avatar_url = get_user_meta($user_id, 'avater', true);
        if ($previous_avatar_url) {
            $file_path = str_replace(wp_upload_dir()['baseurl'], wp_upload_dir()['basedir'], $previous_avatar_url);
            if (file_exists($file_path)) {
                unlink($file_path);
            }
        }

        $file_extension = pathinfo($uploaded_file['name'], PATHINFO_EXTENSION);
        $new_file_name = 'avater-' . $user_id . '-' . sanitize_file_name(strtolower(pathinfo($uploaded_file['name'], PATHINFO_FILENAME))) . '-' . time() . '.' . $file_extension;
        $target_path = $user_files_dir . $new_file_name;

        $move_result = move_uploaded_file($uploaded_file['tmp_name'], $target_path);

        if ($move_result) {
            $new_avatar_url = $upload_dir['baseurl'] . '/userfiles/' . $new_file_name;
            update_user_meta($user_id, 'avater', $new_avatar_url);
            return rest_ensure_response(array('message' => __('Avatar updated successfully.'), 'avatar_url' => $new_avatar_url));
        } else {
            return new WP_Error('upload_failed', __('Failed to move uploaded file.'), array('status' => 500));
        }
    }
    
    public static function prepare_user_data_for_response( $user ) {
        $data = [
            ...(array) $user,
            'phone'       => '',
            'id'          => $user->ID,
            'username'    => $user->user_login,
            'email'       => $user->user_email,
            'firstName'   => $user->first_name,
            'lastName'    => $user->last_name,
            'displayName' => $user->display_name,
            'avater'      => get_user_meta($user->ID, 'avater', true),
            'locale'      => get_user_meta($user->ID, 'partnership_dashboard_locale', true),
            'roles'       => array_map(function ($role) {return Roles::get_instance()->get_roles()[$role] ?? null;}, $user->roles),
        ];
        if (empty($data['avater'])) {
            if (!empty($user->first_name) && !empty($user->last_name)) {
                $data['avater'] = 'https://placehold.co/128x128/EEE/31343C?text=' . strtoupper(substr($user->first_name, 0, 1) . substr($user->last_name, 0, 1)) . '&font=poppins';
            } else {
                $data['avater'] = 'https://placehold.co/128x128/EEE/31343C?text=' . strtoupper(substr($user->user_login, 0, 2)) . '&font=poppins';
            }
        }
        if (isset($data['data']->user_pass)) {unset($data['data']->user_pass);}
        if (isset($data['data']->user_activation_key)) {unset($data['data']->user_activation_key);}
        return $data;
    }

    public static function get_the_user_ip() {
        if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return $ip;
    }

}