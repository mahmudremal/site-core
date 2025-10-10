<?php
namespace SITE_CORE\inc\Ecommerce\Addons;

use SITE_CORE\inc\Traits\Singleton;
use SITE_CORE\inc\Ecommerce;
use WP_REST_Response;
use WP_REST_Request;
use WP_Error;

class Page {
    use Singleton;

    protected $tables;

    protected function __construct() {
        $this->tables = Ecommerce::get_instance()->get_tables();

        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_rest_routes() {
        register_rest_route('sitecore/v1', '/ecommerce/pages/(?P<page_id>[^/]+)', [
            'methods'  => 'GET',
            'callback' => [$this, 'api_get_pages'],
            'permission_callback' => '__return_true',
            'args' => [],
        ]);
    }

    public function api_get_pages(WP_REST_Request $request) {
        $page_id = $request->get_param('page_id');
        // 
        $template = $this->get_page_template($page_id);
        // 
        return rest_ensure_response([
            'template' => $template
        ]);
    }

    public function get_page_template($page_id) {
        switch ($page_id) {
            case 'home':
                return [
                    [
                        'type' => 'heroBanner',
                        'props' => [
                            'bannerId' => 'spring-sale',
                            'slides' => [
                                [
                                    'imageUrl' => 'https://picsum.photos/1920/800',
                                    'title' => 'Discover Serenity Under Moonlit Skies',
                                    'subtitle' => 'Curated products that bring peace and harmony to your everyday life',
                                    'ctaText' => 'Explore Collection',
                                    'ctaLink' => '/collections/special',
                                ],
                                [
                                    'imageUrl' => 'https://picsum.photos/1920/800',
                                    'title' => 'Nature-Inspired Living',
                                    'subtitle' => 'Premium eco-friendly essentials designed for mindful moments',
                                    'ctaText' => 'Shop Now',
                                    'ctaLink' => '/collections/sale',
                                ],
                                [
                                    'imageUrl' => 'https://picsum.photos/1920/800',
                                    'title' => 'Your Journey to Tranquility Begins Here',
                                    'subtitle' => 'Experience products that nurture your soul and embrace nature',
                                    'ctaText' => 'Discover More',
                                    'ctaLink' => '/collections/discover',
                                ],
                            ]
                        ]
                    ],
                    ['type' => 'productCarousel', 'props' => ['className' => 'xpo_w-full', 'category' => 'Sample Category', 'recommendationType' => 'personalized']],
                    ['type' => 'contentBlock', 'props' => ['contentId' => 'how-to-shop']],
                    ['type' => 'categoryGrid', 'props' => ['categoriesCollections' => ['electronics', 'fashion', 'home', 'toys']]],
                    ['type' => 'justForYou', 'props' => ['card_bg' => 'xpo_p-4 xpo_bg-scwhite/70 xpo_rounded-xl', 'categories' => ['electronics', 'fashion', 'home', 'toys'], 'maxPaginations' => 2]],
                ];
                break;
            default:
                return [];
                break;
        }
    }
   
    
}