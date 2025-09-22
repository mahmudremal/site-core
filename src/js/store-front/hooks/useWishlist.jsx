import { useContext } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';

export const useWishlist = () => {
  return useContext(WishlistContext);
};
