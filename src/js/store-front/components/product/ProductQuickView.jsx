import { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, X } from 'lucide-react';
import { formatProduct } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import api from '../../services/api';
import { notify, sleep } from '@functions';
import { useWishlist } from '../../hooks/useWishlist';
import { ProductDetailsSkeleton, SkeletonLoader } from '../skeletons/SkeletonLoader';
import { sprintf } from 'sprintf-js';
import { useLocale } from '../../hooks/useLocale';
import { useCurrency } from '../../hooks/useCurrency';

export default function ProductQuickView({ prod = {} }) {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { wishlist, setWishlist } = useWishlist();
  const { cart, setCart } = useCart();

  const [product, setProduct] = useState({ ...prod });
  const [loading, setLoading] = useState(true);

  const [cartForm, setCartForm] = useState({
    quantity: 1,
    selectedVariations: {},
  });

  const updateVariation = (variationKey, value) => {
    setCartForm(prev => ({
      ...prev,
      selectedVariations: {
        ...prev.selectedVariations,
        [variationKey]: value
      }
    }));
  };

  const incrementQty = () => {
    setCartForm(prev => ({ ...prev, quantity: prev.quantity + 1 }));
  };

  const decrementQty = () => {
    setCartForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }));
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`inline-block w-4 h-4 ${i < count ? 'text-yellow-400' : 'text-gray-300'
            }`}
        />
      );
    }
    return stars;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartData = {
      product_id: product.id,
      quantity: cartForm.quantity,
      variations: cartForm.selectedVariations,
    };

    api.post(`/cart/${product.id}`, cartData).then(res => res.data)
      .then(res => {
        if (res?.action === 'added') {
          setCart(prev => [product, ...prev]);
          notify.success('Product added to cart!');
        } else if (res?.action === 'removed') {
          setCart(prev => prev.filter(i => i.id !== res.id));
          notify.success('Product removed from cart!');
        } else {
          notify.error('Something went wrong!');
        }
      })
      .catch(err => notify.error(err));
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    api.post(`/wishlist/${product.id}`).then(res => res.data)
      .then(res => {
        if (res?.action === 'added') {
          setWishlist(prev => [product, ...prev]);
          notify.success('Product added to wishlist!');
        } else if (res?.action === 'removed') {
          setWishlist(prev => prev.filter(p => p.product_id !== product.id));
          notify.success('Product removed from wishlist!');
        }
      })
      .catch(err => notify.error(err));
  };

  const isInCart = cart.cart_items.some(p => p.product_id === product?.id);
  const isInWishlist = wishlist.some(p => p.product_id === product?.id);

  useEffect(() => {
    sleep(2000).then(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="w-full max-h-[90vh] overflow-y-auto relative">
        {loading ? (
          <ProductDetailsSkeleton />
        ) : (
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {product?.metadata?.gallery && product?.metadata.gallery?.length ? (
                <img
                  alt={product.title}
                  src={product?.metadata.gallery?.[0]?.url}
                  className="w-full h-auto rounded-md object-contain"
                />
              ) : (
                <SkeletonLoader className="w-full h-64" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex">{renderStars(Math.round(product.average_rating || 0))}</div>
                <span className="text-sm">{sprintf(__('(%s Reviews)', 'site-core'), product.reviews_count || 0)}</span>
              </div>
              <div className="text-xl font-semibold text-scprimary-600 mb-4">
                {money(product.metadata.sale_price, product.metadata.currency)}
                {product.metadata.price && product.metadata.price !== product.metadata.sale_price && (
                  <span className="text-sm line-through ml-2">
                    {money(product.metadata.price, product.metadata.currency)}
                  </span>
                )}
              </div>
              <p className="mb-4">{product.metadata.short_description}</p>

              {product.variations && Object.keys(product.variations).map((variationKey) => {
                const variation = product.variations[variationKey];
                return (
                  <div key={variationKey} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {variation.label || variationKey}
                    </label>
                    {variation.type === 'color' ? (
                      <div className="flex space-x-2">
                        {variation.options?.map(option => (
                          <button
                            key={option.value}
                            className={`w-7 h-7 rounded-full border-2 ${cartForm.selectedVariations[variationKey] === option.value
                                ? 'border-scprimary-500'
                                : 'border-gray-300 hover:border-scprimary-500'
                              }`}
                            style={{ backgroundColor: option.color || option.value }}
                            onClick={() => updateVariation(variationKey, option.value)}
                            aria-label={`Select ${option.label || option.value}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <select
                        value={cartForm.selectedVariations[variationKey] || ''}
                        onChange={e => updateVariation(variationKey, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        {variation.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label || option.value}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{__('Quantity', 'site-core')}</label>
                <div className="flex items-center border border-gray-300 rounded-md w-max">
                  <button type="button" onClick={decrementQty} aria-label="Decrease quantity" className="px-3 py-1 text-xl hover:bg-gray-100">-</button>
                  <span className="px-4 py-1 text-center">{cartForm.quantity}</span>
                  <button type="button" onClick={incrementQty} aria-label="Increase quantity" className="px-3 py-1 text-xl hover:bg-gray-100">+</button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" aria-label={__('Add to Cart', 'site-core')} onClick={handleAddToCart} className="bg-scprimary-600 text-scwhite/70 px-5 py-2 rounded-lg font-semibold hover:bg-scprimary-700 transition-colors flex items-center">
                  <ShoppingCart strokeWidth={isInCart ? 5 : 2} className="w-5 h-5 mr-2" />
                  {isInCart ? __('Remove from Cart', 'site-core') : __('Add to Cart', 'site-core')}
                </button>
                <button type="button" aria-label={__('Add to Wishlist', 'site-core')} onClick={handleAddToWishlist} className="bg-scwhite/70 text-scprimary-600 px-5 py-2 rounded-lg font-semibold border border-scprimary-600 hover:bg-scprimary-50 transition-colors flex items-center">
                  <Heart strokeWidth={isInWishlist ? 5 : 2} className="w-5 h-5 mr-2" />
                  {isInWishlist ? __('Remove from Wishlist', 'site-core') : __('Add to Wishlist', 'site-core')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
