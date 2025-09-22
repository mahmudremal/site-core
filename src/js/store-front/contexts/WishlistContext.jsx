import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    api.get(`wishlist`).then(res => res.data)
    .then(res => {
      setWishlist(prev => res ?? prev);
    })
    .catch(err => notify.error(err));
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
