

export const getBadgeColor = (badge) => {
    switch (badge.toLowerCase()) {
      case 'hot': return 'xpo_bg-red-500';
      case 'new': return 'xpo_bg-green-500';
      case 'trending': return 'xpo_bg-purple-500';
      case 'bestseller': return 'xpo_bg-yellow-500';
      case 'limited': return 'xpo_bg-orange-500';
      case 'popular': return 'xpo_bg-blue-500';
      case 'sale': return 'xpo_bg-red-600';
      case 'deal': return 'xpo_bg-green-600';
      case 'organic': return 'xpo_bg-green-700';
      default: return 'xpo_bg-gray-500';
    }
};