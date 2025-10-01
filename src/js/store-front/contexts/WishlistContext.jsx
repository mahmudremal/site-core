import { createContext, useCallback, useEffect, useState } from 'react';
import { sleep, notify } from '@functions';
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


  const toggle_wishlist = ({ product }) => {
    if (!product) return console.log(product);
    sleep(0).then(() => {
      api.post(`/wishlist/${product.id}`).then(res => res.data)
      .then(res => {
        if (res?.action == 'added') {
          setWishlist(prev => [product, ...prev]);
        } else {
          setWishlist(prev => prev.filter(p => p.product_id != product.id));
        }
      })
      .catch(err => notify.error(err)).finally(() => {});
    });
  }
  const is_in_wishlist = useCallback(({ product_id }) => {
      return wishlist.some(w => w.product_id == product_id);
    }, [wishlist, setWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, toggle_wishlist, is_in_wishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
