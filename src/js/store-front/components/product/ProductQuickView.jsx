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
          className={`inline-block w-4 h-4 ${
            i < count ? 'text-yellow-400' : 'text-gray-300'
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
    <div className="xpo_container">
      <div className="xpo_w-full xpo_max-h-[90vh] xpo_overflow-y-auto xpo_relative">
        {loading ? (
          <ProductDetailsSkeleton />
        ) : (
          <div className="xpo_p-2 xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-6">
            <div>
              {product?.metadata?.gallery && product?.metadata.gallery?.length ? (
                <img
                  alt={product.title}
                  src={product?.metadata.gallery?.[0]?.url}
                  className="xpo_w-full xpo_h-auto xpo_rounded-md xpo_object-contain"
                />
              ) : (
                <SkeletonLoader className="xpo_w-full xpo_h-64" />
              )}
            </div>

            <div>
              <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-2">{product.title}</h2>
              <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-2">
                <div className="xpo_flex">{renderStars(Math.round(product.average_rating || 0))}</div>
                <span className="xpo_text-sm">{sprintf(__('(%d Reviews)', 'site-core'), product.reviews_count || 0)}</span>
              </div>
              <div className="xpo_text-xl xpo_font-semibold xpo_text-scprimary-600 xpo_mb-4">
                {money(product.metadata.sale_price, product.metadata.currency)}
                {product.metadata.price && product.metadata.price !== product.metadata.sale_price && (
                  <span className="xpo_text-sm xpo_line-through xpo_ml-2">
                    {money(product.metadata.price, product.metadata.currency)}
                  </span>
                )}
              </div>
              <p className="xpo_mb-4">{product.metadata.short_description}</p>

              {product.variations && Object.keys(product.variations).map((variationKey) => {
                const variation = product.variations[variationKey];
                return (
                  <div key={variationKey} className="xpo_mb-4">
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
                      {variation.label || variationKey}
                    </label>
                    {variation.type === 'color' ? (
                      <div className="xpo_flex xpo_space-x-2">
                        {variation.options?.map(option => (
                          <button
                            key={option.value}
                            className={`xpo_w-7 xpo_h-7 xpo_rounded-full xpo_border-2 ${
                              cartForm.selectedVariations[variationKey] === option.value
                                ? 'xpo_border-scprimary-500'
                                : 'xpo_border-gray-300 hover:xpo_border-scprimary-500'
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
                        className="xpo_border xpo_border-gray-300 xpo_rounded-md xpo_px-3 xpo_py-2 xpo_w-full"
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

              <div className="xpo_mb-4">
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">Quantity</label>
                <div className="xpo_flex xpo_items-center xpo_border xpo_border-gray-300 xpo_rounded-md xpo_w-max">
                  <button type="button" onClick={decrementQty} aria-label="Decrease quantity" className="xpo_px-3 xpo_py-1 xpo_text-xl hover:xpo_bg-gray-100">-</button>
                  <span className="xpo_px-4 xpo_py-1 xpo_text-center">{cartForm.quantity}</span>
                  <button type="button" onClick={incrementQty} aria-label="Increase quantity" className="xpo_px-3 xpo_py-1 xpo_text-xl hover:xpo_bg-gray-100">+</button>
                </div>
              </div>

              <div className="xpo_flex xpo_space-x-4">
                <button type="button" aria-label={__('Add to Cart', 'site-core')} onClick={handleAddToCart} className="xpo_bg-scprimary-600 xpo_text-scwhite/70 xpo_px-5 xpo_py-2 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-scprimary-700 xpo_transition-colors xpo_flex xpo_items-center">
                  <ShoppingCart strokeWidth={isInCart ? 5 : 2} className="xpo_w-5 xpo_h-5 xpo_mr-2" />
                  {isInCart ? __('Remove from Cart', 'site-core') : __('Add to Cart', 'site-core')}
                </button>
                <button type="button" aria-label={__('Add to Wishlist', 'site-core')} onClick={handleAddToWishlist} className="xpo_bg-scwhite/70 xpo_text-scprimary-600 xpo_px-5 xpo_py-2 xpo_rounded-lg xpo_font-semibold xpo_border xpo_border-scprimary-600 hover:xpo_bg-scprimary-50 xpo_transition-colors xpo_flex xpo_items-center">
                  <Heart strokeWidth={isInWishlist ? 5 : 2} className="xpo_w-5 xpo_h-5 xpo_mr-2" />
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
