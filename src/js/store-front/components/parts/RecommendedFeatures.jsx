import { useState } from 'react';
import { Heart, TrendingUp, Clock, Users } from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';
import { sprintf } from 'sprintf-js';


export default function RecommendedFeatures() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [userActivity, setUserActivity] = useState({
    categories: ["Electronics", "Kitchen", "Wearables"],
    brands: ["AudioTech", "BrewMaster"],
    recentlyViewed: [1, 3, 5],
    priceRange: "100-300"
  });
  
  return (
    <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_mb-8">
      <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-6">
        <Users className="xpo_w-6 xpo_h-6 xpo_text-blue-600" />
        <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{__('Recommended for You', 'site-core')}</h2>
      </div>
      <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 xpo_gap-4 xpo_mb-6">
        <div className="xpo_bg-blue-50 xpo_p-4 xpo_rounded-xl">
          <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
            <Clock className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
            <span className="xpo_font-medium xpo_text-blue-900">{__('Recently Viewed', 'site-core')}</span>
          </div>
          <p className="xpo_text-sm xpo_text-blue-700">{sprintf(__('%d products', 'site-core'), userActivity.recentlyViewed.length)}</p>
        </div>
        <div className="xpo_bg-green-50 xpo_p-4 xpo_rounded-xl">
          <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
            <TrendingUp className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
            <span className="xpo_font-medium xpo_text-green-900">{__('Top Categories', 'site-core')}</span>
          </div>
          <p className="xpo_text-sm xpo_text-green-700">{userActivity.categories.join(', ')}</p>
        </div>
        <div className="xpo_bg-purple-50 xpo_p-4 xpo_rounded-xl">
          <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
            <Heart className="xpo_w-5 xpo_h-5 xpo_text-purple-600" />
            <span className="xpo_font-medium xpo_text-purple-900">{__('Preferred Brands', 'site-core')}</span>
          </div>
          <p className="xpo_text-sm xpo_text-purple-700">{userActivity.brands.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}