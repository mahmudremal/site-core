import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryGrid = ({ categories = [], onLoaded = null }) => {
  const defaultCategories = [
    {
      id: 1,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and tech essentials',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
      productCount: 1247,
      featured: true
    },
    {
      id: 2,
      name: 'Fashion & Apparel',
      slug: 'fashion',
      description: 'Trending styles for every occasion',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
      productCount: 2891,
      featured: true
    },
    {
      id: 3,
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Transform your living space',
      imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=300&fit=crop',
      productCount: 1563,
      featured: false
    },
    {
      id: 4,
      name: 'Beauty & Personal Care',
      slug: 'beauty',
      description: 'Premium skincare and cosmetics',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
      productCount: 876,
      featured: false
    },
    {
      id: 5,
      name: 'Sports & Outdoors',
      slug: 'sports',
      description: 'Gear up for your active lifestyle',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
      productCount: 634,
      featured: false
    },
    {
      id: 6,
      name: 'Books & Stationery',
      slug: 'books',
      description: 'Knowledge and creativity essentials',
      imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
      productCount: 1092,
      featured: false
    },
    {
      id: 7,
      name: 'Toys & Games',
      slug: 'toys',
      description: 'Joy and fun for all ages',
      imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
      productCount: 445,
      featured: false
    },
    {
      id: 8,
      name: 'Groceries & Food',
      slug: 'groceries',
      description: 'Fresh and quality everyday essentials',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      productCount: 2156,
      featured: true
    }
  ];

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);

  const displayCategories = categories?.length ? categories : defaultCategories;


  return (
    <section className="xpo_pt-8 xpo_pb-16 xpo_px-4 xpo_bg-scwhite-300 dark:xpo_bg-scprimary-900">
      <div className="xpo_mx-auto">
        
        <div className="xpo_mb-10">
          <h2 className="xpo_text-3xl xpo_font-bold xpo_text-scprimary-600 dark:xpo_text-scwhite-100 xpo_mb-3">
            Shop by Category
          </h2>
          <p className="xpo_text-scprimary-400 dark:xpo_text-scwhite-600">
            Explore our wide range of products across different categories
          </p>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-4 xpo_gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/collections/${category.slug}`}
              className="xpo_group xpo_relative xpo_bg-scwhite-100 dark:xpo_bg-scprimary-800 xpo_rounded-2xl xpo_overflow-hidden xpo_border xpo_border-scwhite-500 dark:xpo_border-scprimary-700 hover:xpo_border-scaccent-400 dark:hover:xpo_border-scaccent-600 xpo_transition-all xpo_duration-300 xpo_cursor-pointer hover:xpo_shadow-lg"
            >
              <div className="xpo_relative xpo_h-48 xpo_overflow-hidden xpo_bg-scwhite-400 dark:xpo_bg-scprimary-700">
                <img
                  alt={category.name}
                  src={category.imageUrl}
                  className="xpo_w-full xpo_h-full xpo_object-cover group-hover:xpo_scale-110 xpo_transition-transform xpo_duration-500"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="xpo_absolute xpo_inset-0 xpo_bg-gradient-to-t xpo_from-scprimary-900/80 xpo_via-scprimary-900/20 xpo_to-transparent"></div>
                
                {category.featured && (
                  <div className="xpo_absolute xpo_top-3 xpo_right-3 xpo_px-3 xpo_py-1 xpo_bg-scaccent-500 xpo_text-scwhite-100 xpo_text-xs xpo_font-semibold xpo_rounded-full">
                    Featured
                  </div>
                )}
              </div>

              <div className="xpo_p-5">
                <h3 className="xpo_text-xl xpo_font-bold xpo_text-scprimary-600 dark:xpo_text-scwhite-100 xpo_mb-2 group-hover:xpo_text-scaccent-500 dark:group-hover:xpo_text-scaccent-400 xpo_transition-colors">
                  {category.name}
                </h3>
                <p className="xpo_text-sm xpo_text-scprimary-400 dark:xpo_text-scwhite-600 xpo_mb-3 xpo_line-clamp-2">
                  {category.description}
                </p>
                
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                  <span className="xpo_text-sm xpo_font-medium xpo_text-scaccent-500 dark:xpo_text-scaccent-400">
                    {(category.productCount || '0').toLocaleString()} items
                  </span>
                  <div className="xpo_w-8 xpo_h-8 xpo_bg-scaccent-100 dark:xpo_bg-scaccent-900/30 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center group-hover:xpo_bg-scaccent-500 dark:group-hover:xpo_bg-scaccent-600 xpo_transition-colors">
                    <ArrowRight className="xpo_w-4 xpo_h-4 xpo_text-scaccent-600 dark:xpo_text-scaccent-400 group-hover:xpo_text-scwhite-100 xpo_transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* <div className="xpo_text-center xpo_mt-10">
          <Link 
            to="/categories"
            className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-scwhite-100 dark:xpo_bg-scprimary-800 xpo_border xpo_border-scaccent-400 dark:xpo_border-scaccent-600 xpo_rounded-lg xpo_text-scaccent-600 dark:xpo_text-scaccent-400 xpo_font-semibold hover:xpo_bg-scaccent-500 dark:hover:xpo_bg-scaccent-600 hover:xpo_text-scwhite-100 xpo_transition-all xpo_duration-300"
          >
            View All Categories
            <ArrowRight className="xpo_w-5 xpo_h-5" />
          </Link>
        </div> */}

      </div>
    </section>
  );
};

export default CategoryGrid;