<?php
namespace SITE_CORE\inc;
use SITE_CORE\inc\Traits\Singleton;
use WP_Error;

class Teams {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}
	protected function setup_hooks() {
    add_action('init', [$this, 'register_cpt_teams']);
    add_action('add_meta_boxes', [$this, 'team_register_meta_boxes']);
    add_action('save_post_team', [$this, 'team_save_meta_fields']);
	}
    public function register_cpt_teams() {
        $labels = [
            'name'               => _x('Teams', 'post type general name', 'sitecore'),
            'singular_name'      => _x('Team', 'post type singular name', 'sitecore'),
            'menu_name'          => _x('Teams', 'admin menu', 'sitecore'),
            'name_admin_bar'     => _x('Team', 'add new on admin bar', 'sitecore'),
            'add_new'            => _x('Add New', 'team', 'sitecore'),
            'add_new_item'       => __('Add New Team', 'sitecore'),
            'new_item'           => __('New Team', 'sitecore'),
            'edit_item'          => __('Edit Team', 'sitecore'),
            'view_item'          => __('View Team', 'sitecore'),
            'all_items'          => __('All Teams', 'sitecore'),
            'search_items'       => __('Search Teams', 'sitecore'),
            'parent_item_colon'  => __('Parent Teams:', 'sitecore'),
            'not_found'          => __('No teams found.', 'sitecore'),
            'not_found_in_trash' => __('No teams found in Trash.', 'sitecore')
        ];

        $args = [
            'labels'             => $labels,
            'public'             => true,
            'has_archive'        => true,
            'publicly_queryable' => false,
            'show_in_rest'       => true,
            'rewrite'            => ['slug' => 'teams'],
            'supports'           => ['title', 'editor', 'thumbnail', 'excerpt'],
            'menu_position'      => 20,
            'menu_icon'          => 'dashicons-groups'
        ];

        register_post_type( 'team', $args );
    }
    public function team_register_meta_boxes() {
        add_meta_box(
            'team_basic_info',
            'Basic Information',
            [$this, 'team_basic_info_callback'],
            'team',
            'normal',
            'default'
        );

        add_meta_box(
            'team_social_links',
            'Social Platform Links',
            [$this, 'team_social_links_callback'],
            'team',
            'normal',
            'default'
        );

        add_meta_box(
            'team_video_url',
            'Member Video URL',
            [$this, 'team_video_url_callback'],
            'team',
            'normal',
            'default'
        );
    }
    public function team_basic_info_callback( $post ) {
        $designation = get_post_meta( $post->ID, '_team_designation', true );
        $department  = get_post_meta( $post->ID, '_team_department', true );
        $joining     = get_post_meta( $post->ID, '_team_joining_date', true );
        $rating      = get_post_meta( $post->ID, '_team_rating', true );

        ?>
        <p>
            <label>Designation: </label><br>
            <input type="text" name="team_designation" value="<?php echo esc_attr($designation); ?>" style="width: 100%;">
        </p>
        <p>
            <label>Department:</label><br>
            <select name="team_department" style="width: 100%;">
                <option value="">Select Department</option>
                <option value="HR" <?php selected( $department, 'HR' ); ?>>HR</option>
                <option value="Marketing" <?php selected( $department, 'Marketing' ); ?>>Marketing</option>
                <option value="Development" <?php selected( $department, 'Development' ); ?>>Development</option>
                <option value="Design" <?php selected( $department, 'Design' ); ?>>Design</option>
            </select>
        </p>
        <p>
            <label>Joining Date:</label><br>
            <input type="date" name="team_joining_date" value="<?php echo esc_attr($joining); ?>" style="width: 100%;">
        </p>
        <p>
            <label>Rating (1-5):</label><br>
            <input type="number" name="team_rating" min="1" max="5" value="<?php echo esc_attr($rating); ?>" style="width: 100%;">
        </p>
        <?php
    }
    public function team_social_links_callback( $post ) {
        $socials = [ 'facebook', 'whatsapp', 'github', 'linkedin', 'twitter' ];
        foreach ( $socials as $platform ) {
            $val = get_post_meta( $post->ID, "_team_{$platform}", true );
            echo "<p>
                <label>" . ucfirst($platform) . " URL:</label><br>
                <input type='url' name='team_{$platform}' value='" . esc_attr($val) . "' style='width: 100%;'>
            </p>";
        }
    }
    public function team_video_url_callback( $post ) {
        $video = get_post_meta( $post->ID, '_team_video_url', true );
        ?>
        <p>
            <label>Video URL:</label><br>
            <input type="url" name="team_video_url" value="<?php echo esc_attr($video); ?>" style="width: 100%;">
        </p>
        <?php
    }
    public function team_save_meta_fields( $post_id ) {
        if ( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) return;

        $fields = [
            'designation',
            'department',
            'joining_date',
            'rating',
            'facebook',
            'whatsapp',
            'github',
            'linkedin',
            'twitter',
            'video_url',
        ];

        foreach ( $fields as $field ) {
            if ( isset($_POST["team_{$field}"]) ) {
                update_post_meta( $post_id, "_team_{$field}", sanitize_text_field($_POST["team_{$field}"]) );
            }
        }
    }


}