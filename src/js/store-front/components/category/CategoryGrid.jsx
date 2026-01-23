import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../hooks/useLocale';
// import api from '../../services/api';

const CategoryGrid = ({ categories = [], onLoaded = null }) => {
  const { __ } = useLocale();
  const defaultCategories = [
    // {
    //   id: 1,
    //   name: 'Electronics',
    //   slug: 'electronics',
    //   description: 'Latest gadgets and tech essentials',
    //   imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    //   productCount: 1247,
    //   featured: true
    // },
    // {
    //   id: 2,
    //   name: 'Fashion & Apparel',
    //   slug: 'fashion',
    //   description: 'Trending styles for every occasion',
    //   imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    //   productCount: 2891,
    //   featured: true
    // },
    // {
    //   id: 3,
    //   name: 'Home & Living',
    //   slug: 'home-living',
    //   description: 'Transform your living space',
    //   imageUrl: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=400&h=300&fit=crop',
    //   productCount: 1563,
    //   featured: false
    // },
    // {
    //   id: 4,
    //   name: 'Beauty & Personal Care',
    //   slug: 'beauty',
    //   description: 'Premium skincare and cosmetics',
    //   imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    //   productCount: 876,
    //   featured: false
    // },
    // {
    //   id: 5,
    //   name: 'Sports & Outdoors',
    //   slug: 'sports',
    //   description: 'Gear up for your active lifestyle',
    //   imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    //   productCount: 634,
    //   featured: false
    // },
    // {
    //   id: 6,
    //   name: 'Books & Stationery',
    //   slug: 'books',
    //   description: 'Knowledge and creativity essentials',
    //   imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
    //   productCount: 1092,
    //   featured: false
    // },
    // {
    //   id: 7,
    //   name: 'Toys & Games',
    //   slug: 'toys',
    //   description: 'Joy and fun for all ages',
    //   imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
    //   productCount: 445,
    //   featured: false
    // },
    // {
    //   id: 8,
    //   name: 'Groceries & Food',
    //   slug: 'groceries',
    //   description: 'Fresh and quality everyday essentials',
    //   imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    //   productCount: 2156,
    //   featured: true
    // }
  ];

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     api.get('get categories collections')
  //   }, 1000);

  //   return () => clearTimeout(delay);
  // }, []);

  const displayCategories = categories?.length ? categories : defaultCategories;

  if (!displayCategories?.length) return <></>;

  return (
    <section className="pt-8 pb-16 px-4 bg-scwhite-300/70 dark:bg-scprimary-900/70">
      <div className="container mx-auto">

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-scprimary-600 dark:text-scwhite-100 mb-3">
            {__('Shop by Category', 'site-core')}
          </h2>
          <p className="text-scprimary-400 dark:text-scwhite-600">
            {__('Explore our wide range of products across different categories', 'site-core')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/collections/${category.slug}`}
              className="group relative bg-scwhite-100 dark:bg-scprimary-800 rounded-2xl overflow-hidden border border-scwhite-500 dark:border-scprimary-700 hover:border-scaccent-400 dark:hover:border-scaccent-600 transition-all duration-300 cursor-pointer hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden bg-scwhite-400 dark:bg-scprimary-700">
                <img
                  alt={category.name}
                  src={category.imageUrl}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-scprimary-900/80 via-scprimary-900/20 to-transparent"></div>

                {category.featured && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-scaccent-500 text-scwhite-100 text-xs font-semibold rounded-full">
                    {__('Featured', 'site-core')}
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="text-xl font-bold text-scprimary-600 dark:text-scwhite-100 mb-2 group-hover:text-scaccent-500 dark:group-hover:text-scaccent-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-scprimary-400 dark:text-scwhite-600 mb-3 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-scaccent-500 dark:text-scaccent-400">
                    {sprintf(__('%s items', 'site-core'), (category.productCount || '0').toLocaleString())}
                  </span>
                  <div className="w-8 h-8 bg-scaccent-100 dark:bg-scaccent-900/30 rounded-full flex items-center justify-center group-hover:bg-scaccent-500 dark:group-hover:bg-scaccent-600 transition-colors">
                    <ArrowRight className="w-4 h-4 text-scaccent-600 dark:text-scaccent-400 group-hover:text-scwhite-100 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* <div className="text-center mt-10">
          <Link 
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-scwhite-100 dark:bg-scprimary-800 border border-scaccent-400 dark:border-scaccent-600 rounded-lg text-scaccent-600 dark:text-scaccent-400 font-semibold hover:bg-scaccent-500 dark:hover:bg-scaccent-600 hover:text-scwhite-100 transition-all duration-300"
          >
            {__('View All Categories', 'site-core')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div> */}

      </div>
    </section>
  );
};

export default CategoryGrid;