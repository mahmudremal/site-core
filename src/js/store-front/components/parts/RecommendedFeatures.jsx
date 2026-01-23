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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">{__('Recommended for You', 'site-core')}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">{__('Recently Viewed', 'site-core')}</span>
          </div>
          <p className="text-sm text-blue-700">{sprintf(__('%d products', 'site-core'), userActivity.recentlyViewed.length)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">{__('Top Categories', 'site-core')}</span>
          </div>
          <p className="text-sm text-green-700">{userActivity.categories.join(', ')}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">{__('Preferred Brands', 'site-core')}</span>
          </div>
          <p className="text-sm text-purple-700">{userActivity.brands.join(', ')}</p>
        </div>
      </div>
    </div>
  )
}