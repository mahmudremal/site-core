import { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { sleep } from '@functions';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    success: true,
    cart_items: [],
    cart_count: 0,
    cart_total: 0
  });

  useEffect(() => {
    api.get(`cart`).then(res => res.data)
    .then(res => setCart(prev => ({...prev, ...res})))
    .catch(err => notify.error(err));
  }, []);

  const add_to_cart = ({ item: product, quantity = null }) => {
    return new Promise((resolve, reject) => {
      quantity = quantity || product?.metadata?.min_qty || 1;
      sleep(1500).then(() => {
        api.post(`cart/${product.id}`, {
          quantity,
        }).then(res => res.data)
        .then(res => {
          if (res?.action == 'added') {
            setCart(prev => ({...prev, cart_items: [res?.item??product, ...prev.cart_items]}));
            // return notify.success('Product added to cart!');
          }
          if (res?.action == 'removed') {
            setCart(prev => ({...prev, cart_items: prev.cart_items.filter(i => i.id != res.id)}));
            // return notify.success('Product removed to cart!');
          }
        })
        .catch(err => reject(err)).finally(() => resolve(true));
      });
      // 
    });
  }

  const remove_cart = ({ item }) => {
    return new Promise((resolve) => {
      sleep(1500)
      .then(() => {
        setCart(prev => ({...prev, cart_items: prev.cart_items.filter(i => i.id == item.id)}))
      })
      .finally(() => resolve(true));
    });
  }

  return (
    <CartContext.Provider value={{ cart, setCart, add_to_cart, remove_cart }}>
      {children}
    </CartContext.Provider>
  );
};
