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
      'Best Seller': 'bg-yellow-100 text-yellow-800',
      'New Arrival': 'bg-green-100 text-green-800',
      'Hot Deal': 'bg-red-100 text-red-800',
      'Popular': 'bg-scaccent-100 text-scaccent-800',
      'Limited': 'bg-purple-100 text-purple-800',
      "Editor's Choice": 'bg-indigo-100 text-indigo-800'
    };
    return colors[badge] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <SiteHeader />
      <div className="min-h-screen">
        <ErrorPageHelmet error={currentError} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* <div className="mb-8 flex gap-4">
            {Object.values(errorTypes).map(({ id: key, label }, i) => (
              <button key={i} onClick={() => setErrorType(key)} className={`px-3 py-1 text-sm rounded-full ${errorType === key ? 'bg-scprimary text-scwhite' : 'bg-scwhite text-gray-600 border'}`}>{label}</button>
            ))}
          </div> */}

          <div className="text-center py-16">
            <div className="text-8xl mb-6 dark:text-scwhite-600">{currentError.icon}</div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-scwhite-600 mb-4">
              {currentError.title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-scwhite-600 mb-2 max-w-2xl mx-auto">
              {currentError.message}
            </p>

            <p className="text-gray-500 dark:text-scwhite-600 mb-8 max-w-xl mx-auto">
              {currentError.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/" className="flex items-center gap-2 bg-scprimary text-scwhite px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                <Home className="w-5 h-5" />
                {__('Go to Homepage', 'site-core')}
              </Link>

              <button onClick={() => window?.history && window.history.back()} className="flex items-center gap-2 border border-gray-300 text-gray-700 dark:text-scwhite-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-scaccent-50 dark:hover:text-scprimary-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                {__('Go Back', 'site-core')}
              </button>

              <button onClick={() => window?.location && window.location.reload()} className="flex items-center gap-2 border border-gray-300 text-gray-700 dark:text-scwhite-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-scaccent-50 dark:hover:text-scprimary-600 transition-colors">
                <RefreshCw className="w-5 h-5" />
                {__('Try Again', 'site-core')}
              </button>
            </div>

            <div className="max-w-md mx-auto mb-16">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={__('Search for products...', 'site-core')}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scprimary focus:border-transparent bg-scwhite"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-scprimary text-scwhite px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  {__('Search', 'site-core')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-scwhite-600/50 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {__("Don't leave empty-handed!", 'site-core')}
              </h2>
              <p className="text-gray-600">
                {__("Check out these popular products while you're here", 'site-core')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedProducts.map((product, index) => (
                <ProductCard3 key={index} product={product} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/collections/special" className="bg-scprimary text-scwhite px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                {__('View All Products', 'site-core')}
              </Link>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-scaccent-50/70 to-purple-50/70 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {__('Need Help?', 'site-core')}
            </h3>
            <p className="text-gray-600 mb-6">
              {__('Our customer support team is here to assist you 24/7', 'site-core')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/knowledge-base/queries" className="bg-scwhite text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                {__('Contact Support', 'site-core')}
              </Link>
              <button onClick={() => window?.Tawk_API?.toggle?.()} className="bg-scwhite text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                {__('Live Chat', 'site-core')}
              </button>
              <Link to="/help" className="bg-scwhite text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                {__('FAQs', 'site-core')}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};
