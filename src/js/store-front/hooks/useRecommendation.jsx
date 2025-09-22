import { useContext } from 'react';
import { RecommendationContext } from '../contexts/RecommendationContext';

export const useRecommendation = () => {
  return useContext(RecommendationContext);
};
