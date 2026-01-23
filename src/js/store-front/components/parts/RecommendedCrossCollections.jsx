import { sleep } from '@functions';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBadgeColor } from "../product/helpers";
import { RecommendedCrossCollectionsSkeleton } from '../skeletons/SkeletonLoader';
import { sprintf } from 'sprintf-js';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';

export default function RecommendedCrossCollections({ collectionType = 'special' }) {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(null);

  const fetch_collections = () => {
    setLoading(true);
    sleep(1000).then(() => {
      setCollections([
        {
          id: 1,
          name: __('Summer Essentials', 'site-core'),
          description: __('Beat the heat with our curated summer collection', 'site-core'),
          image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
          link: '/collections/summer-special',
          badge: __('Hot', 'site-core'),
          productCount: 45,
          trending: true,
        },
        {
          id: 2,
          name: __('Tech Innovation', 'site-core'),
          description: __('Latest gadgets and smart devices for modern living', 'site-core'),
          image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop',
          link: '/collections/tech-innovation',
          badge: __('New', 'site-core'),
          productCount: 32,
          trending: false,
        },
        {
          id: 3,
          name: __('Minimalist Home', 'site-core'),
          description: __('Clean, functional designs for your living space', 'site-core'),
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
          link: '/collections/minimalist-home',
          badge: __('Trending', 'site-core'),
          productCount: 28,
          trending: true,
        }
      ])
    })
      .finally(() => setLoading(false));
    // 
    // api.get(`collections/${collectionType}`).then(res => res.data)
    // .then(res => {})
    // .catch(err => notify.error(err)).finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch_collections();
  }, [collectionType]);

  if (loading) return <RecommendedCrossCollectionsSkeleton count={3} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {collections.map((collection) => (
        <div key={collection.id} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="relative h-48 overflow-hidden">
            <img alt={collection.name} src={collection.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>

            {collection.badge && (
              <div className={`absolute top-4 right-4 ${getBadgeColor(collection.badge)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {collection.badge}
              </div>
            )}

            {collection.trending && (
              <div className="absolute top-4 left-4 flex items-center gap-1 bg-white bg-opacity-20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {__('Trending', 'site-core')}
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-2">{collection.name}</h3>
              <p className="text-gray-200 text-sm mb-2">{collection.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{sprintf(__('%s items', 'site-core'), collection.productCount)}</span>
                <Link to={collection.link || '#'} className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  {__('Explore', 'site-core')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}