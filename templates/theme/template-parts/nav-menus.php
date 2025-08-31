<?php
/**
 * Header Nav menus template for generation.
 * 
 * This template should be well designed just like https://www.wish.com/ header nav menus with drop down, and dropdown mega menus whatever it requires.
 * 
 */

$mega_menu = SITE_CORE\inc\Ecommerce\Addons\Template::get_instance()->get_dynamic_mega_menu_items();

if ( ! empty( $mega_menu ) ) {
    echo '<nav class="xpo_relative xpo_bg-white xpo_shadow-md">';
    echo '<ul class="xpo_flex xpo_items-center xpo_justify-center xpo_list-none xpo_p-0 xpo_m-0">';

    foreach ( $mega_menu as $main_item ) {
        echo '<li class="xpo_group xpo_relative">';
        echo '<a href="' . esc_url( $main_item['link'] ) . '" class="xpo_px-4 xpo_py-3 xpo_flex xpo_items-center xpo_text-gray-700 hover:xpo_text-blue-600">';
        echo esc_html( $main_item['name'] );
        if ( ! empty( $main_item['children'] ) ) {
            echo '<span>'. do_shortcode('[svg icon="arrow-down"]') .'</span>';
        }
        echo '</a>';

        if ( ! empty( $main_item['children'] ) ) {
            echo '<div class="xpo_absolute xpo_left-0 xpo_top-full xpo_w-auto xpo_min-w-max xpo_bg-white xpo_shadow-lg xpo_rounded-md xpo_p-4 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_invisible group-hover:xpo_visible xpo_transition-all xpo_duration-300 xpo_flex xpo_gap-8">';
            
            foreach ( $main_item['children'] as $sub_item ) {
                echo '<div class="xpo_mega-menu-column">';
                echo '<h4 class="xpo_font-bold xpo_text-gray-800 xpo_mb-3"><a href="' . esc_url( $sub_item['link'] ) . '" class="hover:xpo_text-blue-600">' . esc_html( $sub_item['name'] ) . '</a></h4>';

                if ( ! empty( $sub_item['children'] ) ) {
                    echo '<ul class="xpo_space-y-2">';
                    foreach ( $sub_item['children'] as $sub_sub ) {
                        echo '<li><a href="' . esc_url( $sub_sub['link'] ) . '" class="xpo_text-gray-600 hover:xpo_text-blue-600">' . esc_html( $sub_sub['name'] ) . '</a></li>';
                    }
                    echo '</ul>';
                }
                echo '</div>'; // .mega-menu-column
            }
            echo '</div>'; // .mega-menu
        }
        echo '</li>';
    }

    echo '</ul>';
    echo '</nav>';
}