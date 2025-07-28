import React, { useState } from 'react';
import { Search, Home, ArrowLeft, FileX } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { home_route } from '@banglee/core';
import { __ } from '@js/utils';

const BStreamError = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(home_route('bstream', `/search?q=${encodeURIComponent(query.trim())}`));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const isVideoPath = location.pathname.includes('/shorts/') || location.pathname.includes('/video/');

  console.log('BStreamError rendered', { isVideoPath, pathname: location.pathname });

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center xpo_px-4">
      <div className="xpo_max-w-md xpo_w-full xpo_text-center">
        
        <div className="xpo_flex xpo_justify-center xpo_mb-8">
          {isVideoPath ? (
            <FileX className="xpo_w-24 xpo_h-24 xpo_text-gray-400" />
          ) : (
            <div className="xpo_text-gray-400">
              <span className="xpo_text-8xl xpo_font-bold">404</span>
            </div>
          )}
        </div>

        <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-4">
          {isVideoPath 
            ? __('Video not found', 'site-core')
            : __('Page not found', 'site-core')
          }
        </h1>

        <p className="xpo_text-gray-600 xpo_mb-8 xpo_leading-relaxed">
          {isVideoPath 
            ? __('The video you are looking for does not exist or has been removed.', 'site-core')
            : __('The page you are looking for does not exist or has been moved.', 'site-core')
          }
        </p>

        <div className="xpo_space-y-4">
          
          <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-3 xpo_justify-center">
            
            <Link
              to={home_route('bstream', '/upload')}
              onClick={handleGoHome}
              className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_px-6 xpo_py-3 xpo_bg-primary-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-primary-700 xpo_transition-colors xpo_duration-200 xpo_font-medium"
            >
              <Home className="xpo_w-5 xpo_h-5 xpo_mr-2" />
              {__('Go Home', 'site-core')}
            </Link>

            <button
              onClick={handleGoBack}
              className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_px-6 xpo_py-3 xpo_bg-gray-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-gray-700 xpo_transition-colors xpo_duration-200 xpo_font-medium"
            >
              <ArrowLeft className="xpo_w-5 xpo_h-5 xpo_mr-2" />
              {__('Go Back', 'site-core')}
            </button>

          </div>

          <div className="xpo_pt-4 xpo_border-t xpo_border-gray-200">
            <p className="xpo_text-sm xpo_text-gray-500 xpo_mb-4">
              {__('Or try searching for something else:', 'site-core')}
            </p>
            <form onSubmit={handleSearchSubmit} className="xpo_flex xpo_max-w-sm xpo_mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={__('Search...', 'site-core')}
                className="xpo_flex-1 xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-l-lg xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent"
              />
              <button
                type="submit"
                className="xpo_px-4 xpo_py-2 xpo_bg-primary-600 xpo_text-white xpo_rounded-r-lg xpo_hover:bg-primary-700 xpo_transition-colors xpo_duration-200"
              >
                <Search className="xpo_w-5 xpo_h-5" />
              </button>
            </form>
          </div>

        </div>

        <div className="xpo_mt-8 xpo_pt-6 xpo_border-t xpo_border-gray-200">
          <p className="xpo_text-xs xpo_text-gray-400">
            {isVideoPath 
              ? __('If you think this is an error, please contact support.', 'site-core')
              : __('If you need help, please contact our support team.', 'site-core')
            }
          </p>
        </div>

      </div>
    </div>
  );
};

export default BStreamError;