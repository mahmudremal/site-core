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
          name: "Summer Essentials",
          description: "Beat the heat with our curated summer collection",
          image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
          link: "/collections/summer-special",
          productCount: 45,
          trending: true,
          badge: "Hot"
        },
        {
          id: 2,
          name: "Tech Innovation",
          description: "Latest gadgets and smart devices for modern living",
          image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop",
          link: "/collections/tech-innovation",
          productCount: 32,
          trending: false,
          badge: "New"
        },
        {
          id: 3,
          name: "Minimalist Home",
          description: "Clean, functional designs for your living space",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
          link: "/collections/minimalist-home",
          productCount: 28,
          trending: true,
          badge: "Trending"
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
    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6 xpo_mb-12">
      {collections.map((collection) => (
        <div key={collection.id} className="xpo_group xpo_relative xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_overflow-hidden hover:xpo_shadow-2xl xpo_transition-all xpo_duration-300 xpo_transform hover:xpo_scale-105">
          <div className="xpo_relative xpo_h-48 xpo_overflow-hidden">
            <img alt={collection.name} src={collection.image} className="xpo_w-full xpo_h-full xpo_object-cover group-hover:xpo_scale-110 xpo_transition-transform xpo_duration-500" />
            <div className="xpo_absolute xpo_inset-0 xpo_bg-gradient-to-t xpo_from-black xpo_via-transparent xpo_to-transparent xpo_opacity-60"></div>
            
            {collection.badge && (
              <div className={`xpo_absolute xpo_top-4 xpo_right-4 ${getBadgeColor(collection.badge)} xpo_text-white xpo_text-xs xpo_font-bold xpo_px-3 xpo_py-1 xpo_rounded-full`}>
                {collection.badge}
              </div>
            )}

            {collection.trending && (
              <div className="xpo_absolute xpo_top-4 xpo_left-4 xpo_flex xpo_items-center xpo_gap-1 xpo_bg-white xpo_bg-opacity-20 xpo_backdrop-blur-sm xpo_text-white xpo_text-xs xpo_font-medium xpo_px-2 xpo_py-1 xpo_rounded-full">
                <TrendingUp className="xpo_w-3 xpo_h-3" />
                {__('Trending', 'site-core')}
              </div>
            )}

            <div className="xpo_absolute xpo_bottom-4 xpo_left-4 xpo_right-4">
              <h3 className="xpo_text-xl xpo_font-bold xpo_text-white xpo_mb-2">{collection.name}</h3>
              <p className="xpo_text-gray-200 xpo_text-sm xpo_mb-2">{collection.description}</p>
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <span className="xpo_text-white xpo_text-sm xpo_font-medium">{sprintf(__('%s items', 'site-core'), collection.productCount)}</span>
                <Link to={collection.link || '#'} className="xpo_bg-white xpo_text-gray-900 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_text-sm xpo_font-medium hover:xpo_bg-gray-100 xpo_transition-colors">
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