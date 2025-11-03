import { useEffect, useRef, useState } from 'react';
import { Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ProductCard3 } from './ProductCard';
import { sleep, notify } from '@functions';
import { sprintf } from 'sprintf-js';
import api from '../../services/api';
import { ProductCardSkeleton } from '../skeletons/SkeletonLoader';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';


export default function ProductCatalogue({ tools = false, endpoint = 'products', catalogue = '', shadow = false, loadMore = 'infinity', filters: filterArgs = {}, card_bg = 'xpo_bg-scwhite/70', maxPaginations = -1, onLoaded = null }) {
    const { __ } = useLocale();
    const { money } = useCurrency();
    const { type: collectionType = catalogue } = useParams();
    const [showFilters, setShowFilters] = useState(null);
    const [categories, setCategories] = useState(['Electronics', 'Kitchen', 'Wearables', 'Furniture', 'Beauty']);
    const [brands, setBrands] = useState(['AudioTech', 'FitTech', 'BrewMaster', 'ComfortZone', 'SoundWave']);
    const [pagination, setPagination] = useState({totalItems: 0, totalPages: 1});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
      viewMode: 'grid',
      priceRange: '',
      orderby: 'id',
      order: 'DESC',
      category: [],
      per_page: 12,
      rating: '',
      search: '',
      brand: [],
      page: 1,
      ...filterArgs
    });

    useEffect(() => {onLoaded && onLoaded();}, [onLoaded]);

    const fetchProducts = () => {
      setLoading(true);
      sleep(2000).then(() => {
        api.get(endpoint, {params: {...filters}})
        .then(res => {
          setPagination(prev => ({
              ...prev,
              totalItems: parseInt(res.headers.get('x-wp-total') || '0'),
              totalPages: parseInt(res.headers.get('x-wp-totalpages') || '0')
            })
          );
          return res.data;
        })
        .then(res => res?.length && !res?.error && setProducts(prev => [...prev, ...res]))
        .catch(err => notify.error(err))
        .finally(() => setLoading(false));
      });
    }

    useEffect(() => {
      fetchProducts();

      if (filters.search) {
        window?.dataLayer?.push?.({
          'event': 'search',
          'search_term': filters.search
        });
        window?.clarity?.('event', 'search');
      }
      
    }, [filters]);

    const containerRef = useRef(null);
    useEffect(() => {
      if (loadMore !== 'infinity') return;
      const handleScroll = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.bottom <= windowHeight + 100) {
          if (!loading && filters.page < pagination.totalPages) {
            if (maxPaginations == -1 || maxPaginations > filters.page) {
              setFilters(prev => ({ ...prev, page: prev.page + 1 }));
            }
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, filters.page, pagination.totalPages]);

  return (
    <div ref={containerRef} className={`xpo_container ${card_bg} ${shadow ? 'xpo_rounded-2xl xpo_shadow-lg xpo_p-6' : ''}`}>
      {tools && (
        <div className="xpo_flex xpo_flex-col lg:xpo_flex-row lg:xpo_items-center xpo_justify-between xpo_gap-4 xpo_mb-6">
            <div className="xpo_flex xpo_items-center xpo_gap-4">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{__('Products', 'site-core')}</h2>
              <span className="xpo_bg-gray-100 xpo_text-gray-600 xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-sm xpo_font-medium">
                {sprintf(__('%d items', 'site-core'), pagination?.totalItems ?? products?.length)}
              </span>
            </div>
            
            <div className="xpo_flex xpo_items-center xpo_gap-4">
              <div className="xpo_relative">
                <select value={filters.orderby} onChange={(e) => setFilters(prev => ({...prev, orderby: e.target.value}))} className="xpo_appearance-none xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_pr-8 xpo_text-sm xpo_font-medium focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500">
                  <option value="featured">{__('Featured', 'site-core')}</option>
                  <option value="price-low">{__('Price: Low to High', 'site-core')}</option>
                  <option value="price-high">{__('Price: High to Low', 'site-core')}</option>
                  <option value="rating">{__('Highest Rated', 'site-core')}</option>
                  <option value="newest">{__('Newest', 'site-core')}</option>
                </select>
                <ChevronDown className="xpo_absolute xpo_right-2 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400 xpo_pointer-events-none" />
              </div>

              <button onClick={() => setShowFilters(prev => !prev)} className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium hover:xpo_bg-gray-100 xpo_transition-colors">
                <Filter className="xpo_w-4 xpo_h-4" />
                {__('Filters', 'site-core')}
              </button>

              <div className="xpo_flex xpo_bg-gray-50 xpo_rounded-lg xpo_p-1">
                <button onClick={() => setFilters(prev => ({...prev, viewMode: 'grid'}))} className={`xpo_p-2 xpo_rounded xpo_transition-colors ${filters.viewMode === 'grid' ? 'xpo_bg-scwhite/70 xpo_shadow-sm' : 'hover:xpo_bg-gray-100'}`}>
                  <Grid className="xpo_w-4 xpo_h-4" />
                </button>
                <button onClick={() => setFilters(prev => ({...prev, viewMode: 'list'}))} className={`xpo_p-2 xpo_rounded xpo_transition-colors ${filters.viewMode === 'list' ? 'xpo_bg-scwhite/70 xpo_shadow-sm' : 'hover:xpo_bg-gray-100'}`}>
                  <List className="xpo_w-4 xpo_h-4" />
                </button>
              </div>
            </div>
        </div>
      )}

      {showFilters && (
        <div className="xpo_bg-gray-50 xpo_rounded-xl xpo_p-6 xpo_mb-6">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{__('Filters', 'site-core')}</h3>
            <button onClick={() => setShowFilters(false)} className="xpo_text-gray-400 hover:xpo_text-gray-600">
              <X className="xpo_w-5 xpo_h-5" />
            </button>
          </div>
          
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-4 xpo_gap-6">
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">{__('Category', 'site-core')}</label>
              <div className="xpo_space-y-2">
                {categories.map(category => (
                  <label key={category} className="xpo_flex xpo_items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      className="xpo_rounded xpo_border-gray-300 xpo_text-blue-600 focus:xpo_ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({...prev, category: [...prev.category, category]}));
                        } else {
                          setFilters(prev => ({...prev, category: prev.category.filter(c => c !== category)}));
                        }
                      }}
                    />
                    <span className="xpo_ml-2 xpo_text-sm xpo_text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">{__('Brand', 'site-core')}</label>
              <div className="xpo_space-y-2">
                {brands.map(brand => (
                  <label key={brand} className="xpo_flex xpo_items-center">
                    <input
                      type="checkbox"
                      className="xpo_rounded xpo_border-gray-300 xpo_text-blue-600 focus:xpo_ring-blue-500"
                      checked={filters.brand.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({...prev, brand: [...prev.brand, brand]}));
                        } else {
                          setFilters(prev => ({...prev, brand: prev.brand.filter(b => b !== brand)}));
                        }
                      }}
                    />
                    <span className="xpo_ml-2 xpo_text-sm xpo_text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">{__('Price Range', 'site-core')}</label>
              <select value={filters.priceRange} onChange={(e) => setFilters(prev => ({...prev, priceRange: e.target.value}))} className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-3 xpo_py-2 xpo_text-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500">
                <option value="">{__('All Prices', 'site-core')}</option>
                <option value="0-50">{sprintf(__('Under %s', 'site-core'), money(50))}</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200+">$200+</option>
              </select>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">{__('Rating', 'site-core')}</label>
              <select value={filters.rating} onChange={(e) => setFilters(prev => ({...prev, rating: e.target.value}))} className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-3 xpo_py-2 xpo_text-sm focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500">
                <option value="">{__('All Ratings', 'site-core')}</option>
                <option value="4.5">{sprintf(__('%f+ Stars', 'site-core'), 4.5)}</option>
                <option value="4.0">{sprintf(__('%f+ Stars', 'site-core'), 4.0)}</option>
                <option value="3.5">{sprintf(__('%f+ Stars', 'site-core'), 3.5)}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={`xpo_grid ${filters.viewMode === 'grid' ? 'xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3 xl:xpo_grid-cols-4' : 'xpo_grid-cols-1'} xpo_gap-6`}>
        {products.map((product, pIndex) => <ProductCard3 key={pIndex} product={product} viewMode={filters.viewMode} />)}
        {loading && [...Array(filters.per_page).keys()].map(i => <ProductCardSkeleton key={i} />)}
      </div>

      <div className="xpo_flex xpo_justify-center xpo_mt-12">
        {/* <button className="xpo_bg-gray-900 xpo_text-scwhite/70 xpo_px-8 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-800 xpo_transition-colors">Load More Products</button> */}
        {loading && (<span>{__('Loading...', 'site-core')}</span>)}
      </div>
      
    </div>
  )
}
