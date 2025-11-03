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
        if (!apply_filters('pm_project/system/isactive', 'storefront-apiactive')) {return;}
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
                            'slidesa' => [
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
                    [
                        'type' => 'productCarousel',
                        'props' => [
                            'className' => 'xpo_w-full',
                            'category' => 'Sample Category',
                            'recommendationType' => 'personalized'
                        ]
                    ],
                    [
                        'type' => 'contentBlock',
                        'props' => [
                            'contentId' => 'how-to-shop'
                        ]
                    ],
                    [
                        'type' => 'categoryGrid',
                        'props' => [
                            'categories' => [
                                [
                                    'id' => 1,
                                    'name' => 'Electronics',
                                    'slug' => 'electronics',
                                    'description' => 'Latest gadgets and tech essentials',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
                                    'productCount' => 1247,
                                    'featured' => true
                                ],
                                [
                                    'id' => 2,
                                    'name' => 'Fashion & Apparel',
                                    'slug' => 'fashion',
                                    'description' => 'Trending styles for every occasion',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
                                    'productCount' => 2891,
                                    'featured' => true
                                ],
                                [
                                    'id' => 3,
                                    'name' => 'Home & Living',
                                    'slug' => 'home-living',
                                    'description' => 'Transform your living space',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=300&fit=crop',
                                    'productCount' => 1563,
                                    'featured' => false
                                ],
                                [
                                    'id' => 4,
                                    'name' => 'Beauty & Personal Care',
                                    'slug' => 'beauty',
                                    'description' => 'Premium skincare and cosmetics',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
                                    'productCount' => 876,
                                    'featured' => false
                                ],
                                [
                                    'id' => 5,
                                    'name' => 'Sports & Outdoors',
                                    'slug' => 'sports',
                                    'description' => 'Gear up for your active lifestyle',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
                                    'productCount' => 634,
                                    'featured' => false
                                ],
                                [
                                    'id' => 6,
                                    'name' => 'Books & Stationery',
                                    'slug' => 'books',
                                    'description' => 'Knowledge and creativity essentials',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
                                    'productCount' => 1092,
                                    'featured' => false
                                ],
                                [
                                    'id' => 7,
                                    'name' => 'Toys & Games',
                                    'slug' => 'toys',
                                    'description' => 'Joy and fun for all ages',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
                                    'productCount' => 445,
                                    'featured' => false
                                ],
                                [
                                    'id' => 8,
                                    'name' => 'Groceries & Food',
                                    'slug' => 'groceries',
                                    'description' => 'Fresh and quality everyday essentials',
                                    'imageUrl' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
                                    'productCount' => 2156,
                                    'featured' => true
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'justForYou',
                        'props' => [
                            'card_bg' => 'xpo_p-4 xpo_bg-scwhite/70 xpo_rounded-xl',
                            'categories' => [
                                'electronics', 'fashion', 'home', 'toys'
                            ],
                            'maxPaginations' => 2
                        ]
                    ],
                ];
                break;
            case 'collections':
                return [
                    // [
                    //     'type' => 'productCarousel',
                    //     'props' => [
                    //         'className' => 'xpo_w-full',
                    //         'category' => 'Sample Category',
                    //         'recommendationType' => 'personalized'
                    //     ]
                    // ]
                ];
                break;
            default:
                return [];
                break;
        }
    }
   
    
}