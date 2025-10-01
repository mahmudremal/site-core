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
      const cart_line_item_id = cart.cart_items.filter(ci => ci.product_id == product.id).find(li => li.product_data.variations.find(v => product.product_data.variations.find(vi => v.id == vi.id)));
      console.log(cart_line_item_id);

      return;
      sleep(100).then(() => {
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
      api.delete(`cart/${item.id}`).then(res => res.data)
      .then(data => {
        // if (data?.success)
        console.log(data)
        setCart(prev => ({...prev, cart_items: prev.cart_items.filter(i => i.id != item.id)}));
      })
      .finally(() => resolve(true));
    });
  }

  const carted_this_variation = ({ product_id, variationId }) => {
    if (!cart?.cart_items?.length) return;
    const carted = cart.cart_items.filter(item => item.product_id == product_id).find(item => (item?.product_data?.variations || []).find(vI => vI.id == variationId));
    // console.log(carted)
    return carted;
  }

  return (
    <CartContext.Provider value={{ cart, setCart, add_to_cart, remove_cart, carted_this_variation }}>
      {children}
    </CartContext.Provider>
  );
};
