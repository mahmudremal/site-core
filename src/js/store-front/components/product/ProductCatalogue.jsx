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


export default function ProductCatalogue({ tools = false, endpoint = 'products', catalogue = '', shadow = false, loadMore = 'infinity', filters: filterArgs = {}, card_bg = 'bg-scwhite/70', maxPaginations = -1, onLoaded = null }) {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { type: collectionType = catalogue } = useParams();
  const [showFilters, setShowFilters] = useState(null);
  const [categories, setCategories] = useState(['Electronics', 'Kitchen', 'Wearables', 'Furniture', 'Beauty']);
  const [brands, setBrands] = useState(['AudioTech', 'FitTech', 'BrewMaster', 'ComfortZone', 'SoundWave']);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
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

  useEffect(() => { onLoaded && onLoaded(); }, [onLoaded]);

  const fetchProducts = () => {
    setLoading(true);
    sleep(2000).then(() => {
      api.get(endpoint, { params: { ...filters } })
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
    <div ref={containerRef} className={`container ${card_bg} ${shadow ? 'rounded-2xl shadow-lg p-6' : ''}`}>
      {tools && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{__('Products', 'site-core')}</h2>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
              {sprintf(__('%d items', 'site-core'), pagination?.totalItems ?? products?.length)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select value={filters.orderby} onChange={(e) => setFilters(prev => ({ ...prev, orderby: e.target.value }))} className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="featured">{__('Featured', 'site-core')}</option>
                <option value="price-low">{__('Price: Low to High', 'site-core')}</option>
                <option value="price-high">{__('Price: High to Low', 'site-core')}</option>
                <option value="rating">{__('Highest Rated', 'site-core')}</option>
                <option value="newest">{__('Newest', 'site-core')}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button onClick={() => setShowFilters(prev => !prev)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter className="w-4 h-4" />
              {__('Filters', 'site-core')}
            </button>

            <div className="flex bg-gray-50 rounded-lg p-1">
              <button onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))} className={`p-2 rounded transition-colors ${filters.viewMode === 'grid' ? 'bg-scwhite/70 shadow-sm' : 'hover:bg-gray-100'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))} className={`p-2 rounded transition-colors ${filters.viewMode === 'list' ? 'bg-scwhite/70 shadow-sm' : 'hover:bg-gray-100'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{__('Filters', 'site-core')}</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{__('Category', 'site-core')}</label>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, category: [...prev.category, category] }));
                        } else {
                          setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }));
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{__('Brand', 'site-core')}</label>
              <div className="space-y-2">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filters.brand.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, brand: [...prev.brand, brand] }));
                        } else {
                          setFilters(prev => ({ ...prev, brand: prev.brand.filter(b => b !== brand) }));
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{__('Price Range', 'site-core')}</label>
              <select value={filters.priceRange} onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{__('All Prices', 'site-core')}</option>
                <option value="0-50">{sprintf(__('Under %s', 'site-core'), money(50))}</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200+">$200+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{__('Rating', 'site-core')}</label>
              <select value={filters.rating} onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{__('All Ratings', 'site-core')}</option>
                <option value="4.5">{sprintf(__('%f+ Stars', 'site-core'), 4.5)}</option>
                <option value="4.0">{sprintf(__('%f+ Stars', 'site-core'), 4.0)}</option>
                <option value="3.5">{sprintf(__('%f+ Stars', 'site-core'), 3.5)}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className={`grid ${filters.viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {products.map((product, pIndex) => <ProductCard3 key={pIndex} product={product} viewMode={filters.viewMode} />)}
        {loading && [...Array(filters.per_page).keys()].map(i => <ProductCardSkeleton key={i} />)}
      </div>

      <div className="flex justify-center mt-12">
        {/* <button className="bg-gray-900 text-scwhite/70 px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">Load More Products</button> */}
        {loading && (<span>{__('Loading...', 'site-core')}</span>)}
      </div>

    </div>
  )
}
