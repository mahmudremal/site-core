import { useState, useEffect } from 'react';
import { ProductDetailsSkeleton, SkeletonLoader } from '../components/skeletons/SkeletonLoader';
import { ProductGallery } from '../components/product/ProductGallery';
import RelatedProducts from '../components/product/RelatedProducts';
import ProductTabs from '../components/product/productTabs';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { formatProduct } from '../utils/formatters';
import { useWishlist } from '../hooks/useWishlist';
import { Link, useParams } from 'react-router-dom';
import { notify, sleep } from '@functions';
import { useCart } from '../hooks/useCart';
import api from '../services/api';
import ProductPageHelmet from '../components/helmets/ProductPageHelmet';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { sprintf } from 'sprintf-js';
import { __ } from '@js/utils';
import MoonlitSky from '../components/backgrounds/MoonlitSky';


export default function ProductPage() {
  const { id: post_id = null } = useParams();
  const { wishlist, setWishlist } = useWishlist();
  const { cart, setCart } = useCart();

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [cartForm, setCartForm] = useState({
    quantity: 1,
    selectedVariations: {},
  });

  const updateCartForm = (field, value) => {
    setCartForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    updateCartForm('quantity', cartForm.quantity + 1);
  };

  const decrementQty = () => {
    if (cartForm.quantity > 1) {
      updateCartForm('quantity', cartForm.quantity - 1);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`xpo_inline-block xpo_w-5 xpo_h-5 ${
            i < count ? 'xpo_text-yellow-400' : 'xpo_text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const fetchProduct = async () => {
    setLoading(true);
    sleep(5000).then(() => {
      api.get(`products/${post_id}`).then(res => res.data)
      .then(product => {
        setProduct(product);

        product.variations = (product?.variations??[]).reduce((carry, row) => {
          carry[row.type] = carry?.[row.type]??[];
          carry[row.type].push(row)
          return carry;
        }, {});
        
        
        setCartForm(prev => ({
          ...prev,
          selectedVariations: []
        }));
      })
      .catch(err => notify.error(err))
      .finally(() => setLoading(false));
    });
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    if (!post_id) return;
    scrollToTop();
    fetchProduct();
  }, [post_id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const cartData = {
      product_id: product.id,
      quantity: cartForm.quantity,
      variations: cartForm.selectedVariations,
    };

    // Add your cart logic here
    // console.log('Adding to cart:', cartData);
    api.post(`/cart/${product.id}`, cartData).then(res => res.data)
    .then(res => {
      // setCart(prev => prev);
      if (res?.action == 'added') {
        setCart(prev => [product, ...prev]);
        return notify.success('Product added to cart!');
      }
      if (res?.action == 'removed') {
        setCart(prev => prev.filter(i => i.id != res.id));
        return notify.success('Product removed to cart!');
      }
      return notify.error('Something went wrong!');
    })
    .catch(err => notify.error(err)).finally(() => {});
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    api.post(`/wishlist/${product.id}`).then(res => res.data)
    .then(res => {
      if (res?.action == 'added') {
        setWishlist(prev => [product, ...prev]);
        return notify.success('Product added to wishlist!');
      }
      if (res?.action == 'removed') {
        setWishlist(prev => prev.filter(p => p.product_id != product.id));
        return notify.success('Product removed to wishlist!');
      }
    })
    .catch(err => notify.error(err)).finally(() => {});
  };

  const isInCart = cart.cart_items.some(p => p.product_id == product?.id);
  const isInWishlist = wishlist.some(p => p.product_id == product?.id);

  return (
    <div>
      <SiteHeader />
      <ProductPageHelmet />


      <div className="xpo_relative xpo_min-h-screen">
        <div className="xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>
        
        {/* xpo_font-sans xpo_bg-scwhite-100/20  */}
        <div className="xpo_container xpo_relative xpo_mx-auto xpo_px-4 xpo_py-8 xpo_z-10">
          <nav className="xpo_text-sm xpo_text-scwhite-600 xpo_mb-6 xpo_space-x-2">
            {!loading && (<Link to="/" className="hover:xpo_text-scwhite-800">{__('Home', 'site-core')}</Link>)}
            {loading ? [...Array(3).keys()].map(i => <SkeletonLoader key={i} className="xpo_h-4 xpo_w-32 xpo_inline-block" />) : !product?.categories?.length ? (
              <>
                <Link to="/categories" className="hover:xpo_text-scwhite-800">{__('Categories', 'site-core')}</Link>
                <span className="xpo_text-scwhite-800">{product?.title}</span>
              </>
            ) : (
              <>
                {product.categories.map((cat, catI) => typeof cat === 'string' ? <span key={catI} className="xpo_text-scwhite-800">{cat}</span> : <Link key={catI} to={`/collections/${cat.slug}`} className="hover:xpo_text-scwhite-800">{cat.name}</Link>)}
                <span className="xpo_text-scwhite-800">{product?.title}</span>
              </>
            )}
          </nav>

          <div className="xpo_product_section xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-lg xpo_p-8 xpo_mb-12 xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-8">
            <ProductGallery images={product?.metadata?.gallery??[]} loading={loading} />

            <div>
              {loading ? (
                <ProductDetailsSkeleton />
              ) : (
                <>
                  <h1 className="xpo_text-3xl xpo_font-bold xpo_mb-4 xpo_text-gray-800">
                    {product?.title}
                  </h1>
                  <div className="xpo_flex xpo_items-center xpo_mb-4">
                    <div className="xpo_flex xpo_items-center xpo_space-x-1">
                      {renderStars(Math.round(product?.average_rating || 0))}
                    </div>
                    <span className="xpo_text-sm xpo_text-gray-600 xpo_ml-2">
                      {sprintf(__('(%d Reviews)', 'site-core'), product?.reviews_count || 0)}
                    </span>
                  </div>
                  <div className="xpo_text-2xl xpo_font-bold xpo_text-scprimary-600 xpo_mb-6">
                    ${Math.min(product?.metadata?.price, product?.metadata?.sale_price)}
                    {product?.metadata?.price && product?.metadata?.price !== product?.metadata?.sale_price && (
                      <span className="xpo_text-sm xpo_text-gray-500 xpo_line-through xpo_ml-2">
                        ${product?.metadata?.price}
                      </span>
                    )}
                  </div>
                  <p className="xpo_text-gray-700 xpo_mb-6 xpo_leading-relaxed" dangerouslySetInnerHTML={{__html: product?.metadata?.short_description??''}}>
                  </p>

                  {(product?.variations??[]).map((variation, vrIndex) => (
                      <div key={vrIndex} className="xpo_mb-6">
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                          {variation.title}
                        </label>
                        {variation.type === 'color' ? (
                          <div className="xpo_flex xpo_space-x-2">
                            {variation.options?.map((option) => (
                              <button
                                key={option.value}
                                className={`xpo_w-8 xpo_h-8 xpo_rounded-full xpo_border-2 ${
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
                            onChange={(e) => updateVariation(variationKey, e.target.value)}
                            className="xpo_border xpo_border-gray-300 xpo_rounded-md xpo_px-3 xpo_py-2"
                          >
                            {variation.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label || option.value}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}

                  <div className="xpo_mb-6">
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      Quantity
                    </label>
                    <div className="xpo_flex xpo_items-center xpo_border xpo_border-gray-300 xpo_rounded-md xpo_w-max">
                      <button type="button" onClick={decrementQty} aria-label={__('Decrease quantity', 'site-core')} className="xpo_px-3 xpo_py-2 xpo_text-xl hover:xpo_bg-gray-100">-</button>
                      <span className="xpo_px-4 xpo_py-2 xpo_text-center">{cartForm.quantity}</span>
                      <button type="button" onClick={incrementQty} aria-label={__('Increase quantity', 'site-core')} className="xpo_px-3 xpo_py-2 xpo_text-xl hover:xpo_bg-gray-100">+</button>
                    </div>
                  </div>

                  <div className="xpo_flex xpo_space-x-4 xpo_mb-8">
                    <button type="button" aria-label="Add to Cart" onClick={handleAddToCart} className="xpo_bg-scprimary-600 xpo_text-scwhite/70 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-scprimary-700 xpo_transition-colors">
                      <ShoppingCart strokeWidth={isInCart ? 5 : 2} className="xpo_inline-block xpo_w-5 xpo_h-5 xpo_mr-2" />
                      {isInCart ? __('Remove from Cart', 'site-core') : __('Add to Cart', 'site-core')}
                    </button>
                    <button type="button" aria-label="Add to Wishlist" onClick={handleAddToWishlist} className="xpo_bg-scwhite/70 xpo_text-scprimary-600 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold xpo_border xpo_border-scprimary-600 hover:xpo_bg-scprimary-50 xpo_transition-colors">
                      <Heart strokeWidth={isInWishlist ? 5 : 2} className="xpo_inline-block xpo_w-5 xpo_h-5 xpo_mr-2" />
                      {isInWishlist ? __('Remove from Wishlist', 'site-core') : __('Add to Wishlist', 'site-core')}
                    </button>
                  </div>

                  {product?.features && (
                    <div className="xpo_bg-gray-50 xpo_p-4 xpo_rounded-lg">
                      <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4">Key Features</h3>
                      <ul className="xpo_list-disc xpo_list-inside xpo_text-gray-700 xpo_space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <ProductTabs loading={loading} product={product} />

          <RelatedProducts />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};


