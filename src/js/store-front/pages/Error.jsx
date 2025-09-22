import { useState } from 'react';
import { AlertTriangle, Home, ArrowLeft, Search, RefreshCw, ShoppingBag, Star, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import ErrorPageHelmet from '../components/helmets/ErrorPageHelmet';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import { ProductCard3 } from '../components/product/ProductCard';

export default function ErrorPage() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [errorType, setErrorType] = useState(404);

  const errorTypes = {
    '404': {
      id: 404,
      label: __('404 Demo', 'site-core'),
      title: __('404 - Page Not Found', 'site-core'),
      message: __("Oops! The page you're looking for doesn't exist.", 'site-core'),
      description: __("It might have been moved, deleted, or you entered the wrong URL.", 'site-core'),
      icon: '🔍'
    },
    '500': {
      id: 500,
      label: __('500 Demo', 'site-core'),
      title: __('500 - Server Error', 'site-core'),
      message: __("Something went wrong on our end.", 'site-core'),
      description: __("We're working to fix this issue. Please try again later.", 'site-core'),
      icon: '⚠️'
    },
    'network': {
      id: 'network',
      label: __('Network Demo', 'site-core'),
      title: __('Connection Error', 'site-core'),
      message: __("Unable to connect to our servers.", 'site-core'),
      description: __("Please check your internet connection and try again.", 'site-core'),
      icon: '🌐'
    },
    'payment': {
      id: 'payment',
      label: __('Payment Demo', 'site-core'),
      title: __('Payment Failed', 'site-core'),
      message: __("We couldn't process your payment.", 'site-core'),
      description: __("Please check your payment details and try again.", 'site-core'),
      icon: '💳'
    }
  };

  const recommendedProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      rating: 4.8,
      reviews: 342,
      badge: "Best Seller"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 299.99,
      originalPrice: 349.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      rating: 4.9,
      reviews: 128,
      badge: "New Arrival"
    },
    {
      id: 3,
      name: "Portable Bluetooth Speaker",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
      rating: 4.7,
      reviews: 256,
      badge: "Hot Deal"
    },
    {
      id: 4,
      name: "Ergonomic Office Chair",
      price: 349.99,
      originalPrice: 449.99,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
      rating: 4.6,
      reviews: 89,
      badge: "Popular"
    },
    {
      id: 5,
      name: "Wireless Charging Station",
      price: 49.99,
      originalPrice: 69.99,
      image: "https://images.unsplash.com/photo-1609792858004-21c9aab89cec?w=300&h=300&fit=crop",
      rating: 4.5,
      reviews: 167,
      badge: "Limited"
    },
    {
      id: 6,
      name: "Premium Laptop Stand",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
      rating: 4.8,
      reviews: 203,
      badge: "Editor's Choice"
    }
  ];

  const currentError = errorTypes[errorType];

  const getBadgeColor = (badge) => {
    const colors = {
      'Best Seller': 'xpo_bg-yellow-100 xpo_text-yellow-800',
      'New Arrival': 'xpo_bg-green-100 xpo_text-green-800',
      'Hot Deal': 'xpo_bg-red-100 xpo_text-red-800',
      'Popular': 'xpo_bg-scaccent-100 xpo_text-scaccent-800',
      'Limited': 'xpo_bg-purple-100 xpo_text-purple-800',
      "Editor's Choice": 'xpo_bg-indigo-100 xpo_text-indigo-800'
    };
    return colors[badge] || 'xpo_bg-gray-100 xpo_text-gray-800';
  };

  return (
    <div>
      <SiteHeader />
      <div className="xpo_bg-gray-50 xpo_min-h-screen">
        <ErrorPageHelmet error={currentError} />
        <div className="xpo_max-w-7xl xpo_mx-auto xpo_px-4 sm:xpo_px-6 lg:xpo_px-8 xpo_py-12">
          
          <div className="xpo_mb-8 xpo_flex xpo_gap-4">
            {Object.values(errorTypes).map(({ id: key, label }, i) => (
              <button key={i} onClick={() => setErrorType(key)} className={`xpo_px-3 xpo_py-1 xpo_text-sm xpo_rounded-full ${errorType === key ? 'xpo_bg-scprimary xpo_text-white' : 'xpo_bg-white xpo_text-gray-600 xpo_border'}`}>{label}</button>
            ))}
          </div>

          <div className="xpo_text-center xpo_py-16">
            <div className="xpo_text-8xl xpo_mb-6">{currentError.icon}</div>
            
            <h1 className="xpo_text-4xl xpo_font-bold xpo_text-gray-900 xpo_mb-4">
              {currentError.title}
            </h1>
            
            <p className="xpo_text-xl xpo_text-gray-600 xpo_mb-2 xpo_max-w-2xl xpo_mx-auto">
              {currentError.message}
            </p>
            
            <p className="xpo_text-gray-500 xpo_mb-8 xpo_max-w-xl xpo_mx-auto">
              {currentError.description}
            </p>

            <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_justify-center xpo_items-center xpo_mb-12">
              <Link to="/" className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-scprimary xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-800 xpo_transition-colors">
                <Home className="xpo_w-5 xpo_h-5" />
                {__('Go to Homepage', 'site-core')}
              </Link>
              
              <button onClick={() => window?.history && window.history.back()} className="xpo_flex xpo_items-center xpo_gap-2 xpo_border xpo_border-gray-300 xpo_text-gray-700 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors">
                <ArrowLeft className="xpo_w-5 xpo_h-5" />
                {__('Go Back', 'site-core')}
              </button>
              
              <button onClick={() => window?.location && window.location.reload()} className="xpo_flex xpo_items-center xpo_gap-2 xpo_border xpo_border-gray-300 xpo_text-gray-700 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors">
                <RefreshCw className="xpo_w-5 xpo_h-5" />
                {__('Try Again', 'site-core')}
              </button>
            </div>

            <div className="xpo_max-w-md xpo_mx-auto xpo_mb-16">
              <div className="xpo_relative">
                <Search className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                <input
                  type="text"
                  placeholder={__('Search for products...', 'site-core')}
                  className="xpo_w-full xpo_pl-12 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl xpo_focus:ring-2 xpo_focus:ring-scprimary xpo_focus:border-transparent xpo_bg-white"
                />
                <button className="xpo_absolute xpo_right-2 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_bg-scprimary xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-gray-800 xpo_transition-colors">
                  {__('Search', 'site-core')}
                </button>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-8">
            <div className="xpo_text-center xpo_mb-8">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                {__("Don't leave empty-handed!", 'site-core')}
              </h2>
              <p className="xpo_text-gray-600">
                {__("Check out these popular products while you're here", 'site-core')}
              </p>
            </div>

            <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6">
              {recommendedProducts.map((product, index) => (
                <ProductCard3 key={index} product={product} />
              ))}
            </div>

            <div className="xpo_text-center xpo_mt-8">
              <Link to="/collections/special" className="xpo_bg-scprimary xpo_text-white xpo_px-8 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-800 xpo_transition-colors">
                {__('View All Products', 'site-core')}
              </Link>
            </div>
          </div>

          <div className="xpo_mt-12 xpo_bg-gradient-to-r xpo_from-scaccent-50 xpo_to-purple-50 xpo_rounded-2xl xpo_p-8 xpo_text-center">
            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
              {__('Need Help?', 'site-core')}
            </h3>
            <p className="xpo_text-gray-600 xpo_mb-6">
              {__('Our customer support team is here to assist you 24/7', 'site-core')}
            </p>
            <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_justify-center">
              <button className="xpo_bg-white xpo_text-gray-900 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_shadow-sm">
                {__('Contact Support', 'site-core')}
              </button>
              <button className="xpo_bg-white xpo_text-gray-900 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_shadow-sm">
                {__('Live Chat', 'site-core')}
              </button>
              <button className="xpo_bg-white xpo_text-gray-900 xpo_px-6 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_shadow-sm">
                {__('FAQs', 'site-core')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};
