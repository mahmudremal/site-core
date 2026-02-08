// productCarousel: lazy(() => import('../product/ProductCarousel')),


import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { ProductCard2 } from './ProductCard';
import api from '../../services/api';
import { notify } from '@functions';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';
const ProductCarousel = ({ category, recommendationType, filters = {}, title, className = "", slidesPerView = 4, autoplay = false, showNavigation = true, spaceBetween = 16, autoplayDelay = 3000, onLoaded = null }) => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef(null);
  const containerRef = useRef(null);
  const [responsiveSlidesPerView, setResponsiveSlidesPerView] = useState(slidesPerView);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setResponsiveSlidesPerView(1);
      } else if (width < 768) {
        setResponsiveSlidesPerView(2);
      } else if (width < 1024) {
        setResponsiveSlidesPerView(3);
      } else {
        setResponsiveSlidesPerView(slidesPerView);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slidesPerView]);

  useEffect(() => onLoaded && onLoaded(), [onLoaded]);

  const buildFilters = () => {
    const apiFilters = {
      per_page: 12, // Get more products for carousel
      orderby: 'date',
      order: 'DESC',
      ...filters
    };
    if (category) {
      apiFilters.sc_product_category = category;
    }
    if (recommendationType) {
      switch (recommendationType) {
        case 'featured':
          apiFilters.meta_key = 'featured';
          apiFilters.meta_value = 'yes';
          break;
        case 'bestseller':
          apiFilters.orderby = 'meta_value_num';
          apiFilters.meta_key = 'sales_count';
          break;
        case 'latest':
          apiFilters.orderby = 'date';
          apiFilters.order = 'DESC';
          break;
        case 'sale':
          apiFilters.meta_filters = JSON.stringify([{
            key: 'sale_price',
            value: '',
            compare: '!='
          }]);
          break;
        default:
          break;
      }
    }
    return apiFilters;
  };
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = buildFilters();
      const response = await api.get('products', { params: apiFilters });

      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setCurrentIndex(0);
      } else {
        setProducts([]);
        notify.warning('No products found');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      notify.error(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, [category, recommendationType, JSON.stringify(filters)]);
  const startAutoplay = () => {
    if (autoplay && products.length > responsiveSlidesPerView) {
      autoplayRef.current = setInterval(() => {
        handleNext();
      }, autoplayDelay);
    }
  };
  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };
  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [autoplay, products.length, responsiveSlidesPerView, autoplayDelay]);
  const maxIndex = Math.max(0, products.length - responsiveSlidesPerView);
  const handlePrev = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? maxIndex : prevIndex - 1;
      return newIndex;
    });

    setTimeout(() => setIsTransitioning(false), 300);
  };
  const handleNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex >= maxIndex ? 0 : prevIndex + 1;
      return newIndex;
    });

    setTimeout(() => setIsTransitioning(false), 300);
  };
  const handleMouseEnter = () => {
    if (autoplay) stopAutoplay();
  };
  const handleMouseLeave = () => {
    if (autoplay) startAutoplay();
  };
  if (loading) {
    return (
      <section className={`mb-12 ${className}`}>
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          <span className="ml-2 text-gray-600">{__('Loading products...', 'site-core')}</span>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className={`mb-12 ${className}`}>
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load products</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-scwhite/70 rounded hover:bg-blue-700 transition-colors"
            >
              {__('Retry', 'site-core')}
            </button>
          </div>
        </div>
      </section>
    );
  }
  if (!products.length) {
    return (
      <section className={`mb-12 ${className}`}>
        {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-600">{__('No products available', 'site-core')}</p>
        </div>
      </section>
    );
  }
  const slideWidth = 100 / responsiveSlidesPerView;
  const translateX = -(currentIndex * slideWidth);
  return (
    <section className={`mb-12 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={containerRef}
      >
        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(${translateX}%)`,
              width: `${(products.length / responsiveSlidesPerView) * 100}%`
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id || index}
                className="flex-shrink-0"
                style={{
                  width: `${slideWidth}%`,
                  paddingLeft: index === 0 ? '0' : `${spaceBetween / 2}px`,
                  paddingRight: index === products.length - 1 ? '0' : `${spaceBetween / 2}px`
                }}
              >
                <div className="h-full">
                  <ProductCard2 product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {showNavigation && products.length > responsiveSlidesPerView && (
          <>
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              className={`absolute top-1/2 left-2 transform -translate-y-1/2 z-10 bg-scwhite/70 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${currentIndex === 0 ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
                }`}
              aria-label="Previous products"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className={`absolute top-1/2 right-2 transform -translate-y-1/2 z-10 bg-scwhite/70 bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${currentIndex >= maxIndex ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'
                }`}
              aria-label="Next products"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}
        {products.length > responsiveSlidesPerView && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => !isTransitioning && setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default ProductCarousel;
const ProductCarouselExamples = () => {
  return (
    <div>
      <ProductCarousel category="sample-category" title="Featured Products" />
      <ProductCarousel recommendationType="bestseller" title="Best Sellers" autoplay={true} />
      <ProductCarousel
        filters={{
          meta_key: 'featured',
          meta_value: 'yes',
          per_page: 8
        }}
        title="Featured Products"
        slidesPerView={3}
      />
      <ProductCarousel recommendationType="sale" title="On Sale Now" className="bg-red-50 p-4 rounded-lg" autoplay={true} autoplayDelay={5000} />
    </div>
  )
}