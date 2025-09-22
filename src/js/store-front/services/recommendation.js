import { beacon } from '../utils/beacon';

export const trackRecommendation = (data) => {
  // This will send a beacon with the recommendation data.
  beacon('/recommendation-tracking-endpoint', data);
};
