<?php
/**
 * Header Nav menus template for generation.
 * 
 * This template should be well designed just like https://www.wish.com/ header nav menus with drop down, and dropdown mega menus whatever it requires.
 * 
 */

$mega_menu = SITE_CORE\inc\Ecommerce\Addons\Template::get_instance()->get_dynamic_mega_menu_items();

if ( ! empty( $mega_menu ) ) {
    echo '<nav class="relative bg-white shadow-md">';
    echo '<ul class="flex items-center justify-center list-none p-0 m-0">';

    foreach ( $mega_menu as $main_item ) {
        echo '<li class="group relative">';
        echo '<a href="' . esc_url( $main_item['link'] ) . '" class="px-4 py-3 flex items-center text-gray-700 hover:text-blue-600">';
        echo esc_html( $main_item['name'] );
        if ( ! empty( $main_item['children'] ) ) {
            echo '<span>'. do_shortcode('[svg icon="arrow-down"]') .'</span>';
        }
        echo '</a>';

        if ( ! empty( $main_item['children'] ) ) {
            echo '<div class="absolute left-0 top-full w-auto min-w-max bg-white shadow-lg rounded-md p-4 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 flex gap-8">';
            
            foreach ( $main_item['children'] as $sub_item ) {
                echo '<div class="mega-menu-column">';
                echo '<h4 class="font-bold text-gray-800 mb-3"><a href="' . esc_url( $sub_item['link'] ) . '" class="hover:text-blue-600">' . esc_html( $sub_item['name'] ) . '</a></h4>';

                if ( ! empty( $sub_item['children'] ) ) {
                    echo '<ul class="space-y-2">';
                    foreach ( $sub_item['children'] as $sub_sub ) {
                        echo '<li><a href="' . esc_url( $sub_sub['link'] ) . '" class="text-gray-600 hover:text-blue-600">' . esc_html( $sub_sub['name'] ) . '</a></li>';
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