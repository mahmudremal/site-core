

export const getBadgeColor = (badge) => {
  switch (badge.toLowerCase()) {
    case 'hot': return 'bg-red-500';
    case 'new': return 'bg-green-500';
    case 'trending': return 'bg-purple-500';
    case 'bestseller': return 'bg-yellow-500';
    case 'limited': return 'bg-orange-500';
    case 'popular': return 'bg-blue-500';
    case 'sale': return 'bg-red-600';
    case 'deal': return 'bg-green-600';
    case 'organic': return 'bg-green-700';
    default: return 'bg-gray-500';
  }
};