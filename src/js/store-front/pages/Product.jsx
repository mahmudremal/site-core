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
        setCart(prev => ({...prev, cart_items: [product, ...prev.cart_items]}));
        return notify.success('Product added to cart!');
      }
      if (res?.action == 'removed') {
        setCart(prev => ({...prev, cart_items: prev.cart_items.filter(i => i.id != res.id)}));
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
                  <h1 className="xpo_text-3xl xpo_font-bold xpo_mb-4 xpo_text-scprimary-800 dark:xpo_text-scwhite-100">
                    {product?.title}
                  </h1>

                  {/* Rating Section */}
                  <div className="xpo_flex xpo_items-center xpo_mb-4">
                    <div className="xpo_flex xpo_items-center xpo_space-x-1">
                      {renderStars(Math.round(product?.seller?.short_rating || 0))}
                    </div>
                    <span className="xpo_text-sm xpo_text-scprimary-600 dark:xpo_text-scwhite-400 xpo_ml-2">
                      {sprintf(__('(%s Rating)', 'site-core'), product?.seller?.short_rating || '0.0')}
                    </span>
                    {product?.seller?.shop_name && (
                      <span className="xpo_text-sm xpo_text-scprimary-500 dark:xpo_text-scwhite-500 xpo_ml-4">
                        {__('by', 'site-core')} {product.seller.shop_name}
                      </span>
                    )}
                  </div>

                  {/* SKU */}
                  {product?.metadata?.sku && (
                    <div className="xpo_text-sm xpo_text-scprimary-600 dark:xpo_text-scwhite-400 xpo_mb-4">
                      <span className="xpo_font-medium">{__('SKU:', 'site-core')}</span> {product.metadata.sku}
                    </div>
                  )}

                  {/* Price Section */}
                  <div className="xpo_text-2xl xpo_font-bold xpo_text-scaccent-600 xpo_mb-6">
                    {product?.metadata?.currency?.toUpperCase() || '$'}{Math.min(
                      parseFloat(product?.metadata?.price || 0), 
                      parseFloat(product?.metadata?.sale_price || product?.metadata?.price || 0)
                    ).toFixed(2)}
                    {product?.metadata?.price && 
                     product?.metadata?.sale_price && 
                     parseFloat(product.metadata.price) > parseFloat(product.metadata.sale_price) && (
                      <span className="xpo_text-lg xpo_text-scprimary-400 dark:xpo_text-scwhite-500 xpo_line-through xpo_ml-3">
                        {product?.metadata?.currency?.toUpperCase() || '$'}{parseFloat(product.metadata.price).toFixed(2)}
                      </span>
                    )}
                    {product?.metadata?.price && 
                     product?.metadata?.sale_price && 
                     parseFloat(product.metadata.price) > parseFloat(product.metadata.sale_price) && (
                      <span className="xpo_text-sm xpo_text-green-600 xpo_ml-3 xpo_bg-green-50 dark:xpo_bg-green-900/20 xpo_px-2 xpo_py-1 xpo_rounded">
                        {__('Save', 'site-core')} {Math.round(((parseFloat(product.metadata.price) - parseFloat(product.metadata.sale_price)) / parseFloat(product.metadata.price)) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <div className="xpo_text-scprimary-700 dark:xpo_text-scwhite-300 xpo_mb-6 xpo_leading-relaxed" 
                       dangerouslySetInnerHTML={{__html: product?.metadata?.short_description || product?.excerpt || ''}}>
                  </div>

                  {/* Product Variations */}
                  {product?.variations?.length > 0 && (
                    <div className="xpo_mb-6">
                      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-scprimary-800 dark:xpo_text-scwhite-100 xpo_mb-4">
                        {__('Available Variations', 'site-core')}
                      </h3>
                      {product.variations.map((variation, vrIndex) => (
                        <div key={vrIndex} className="xpo_mb-4 xpo_p-4 xpo_border xpo_border-scprimary-200 dark:xpo_border-scprimary-600 xpo_rounded-lg">
                          <div className="xpo_flex xpo_flex-col sm:xpo_flex-row sm:xpo_items-center xpo_justify-between xpo_mb-2">
                            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-scprimary-700 dark:xpo_text-scwhite-200 xpo_mb-2 sm:xpo_mb-0">
                              {variation.title}
                            </label>
                            <div className="xpo_text-sm xpo_text-scaccent-600 xpo_font-semibold">
                              {product?.metadata?.currency?.toUpperCase() || '$'}{parseFloat(variation.sale_price || variation.price || 0).toFixed(2)}
                              {variation.price && variation.sale_price && parseFloat(variation.price) > parseFloat(variation.sale_price) && (
                                <span className="xpo_text-scprimary-400 dark:xpo_text-scwhite-500 xpo_line-through xpo_ml-2">
                                  {product?.metadata?.currency?.toUpperCase() || '$'}{parseFloat(variation.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {variation.description && (
                            <p className="xpo_text-sm xpo_text-scprimary-600 dark:xpo_text-scwhite-400 xpo_mb-2">
                              {variation.description}
                            </p>
                          )}
                          
                          {variation.sku && (
                            <p className="xpo_text-xs xpo_text-scprimary-500 dark:xpo_text-scwhite-500">
                              <span className="xpo_font-medium">{__('SKU:', 'site-core')}</span> {variation.sku}
                            </p>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => updateVariation('selected_variation_id', variation.id)}
                            className={`xpo_mt-3 xpo_px-4 xpo_py-2 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_transition-colors ${
                              cartForm.selectedVariations.selected_variation_id === variation.id
                                ? 'xpo_bg-scaccent-600 xpo_text-scwhite-50 xpo_border-scaccent-600'
                                : 'xpo_bg-scwhite-100 dark:xpo_bg-scprimary-700 xpo_text-scprimary-700 dark:xpo_text-scwhite-200 xpo_border xpo_border-scprimary-300 dark:xpo_border-scprimary-500 hover:xpo_bg-scaccent-50 dark:hover:xpo_bg-scprimary-600'
                            }`}
                          >
                            {cartForm.selectedVariations.selected_variation_id === variation.id ? 
                              __('Selected', 'site-core') : 
                              __('Select This Variation', 'site-core')
                            }
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="xpo_mb-6">
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-scprimary-700 dark:xpo_text-scwhite-200 xpo_mb-2">
                      {__('Quantity', 'site-core')}
                    </label>
                    <div className="xpo_flex xpo_items-center xpo_border xpo_border-scprimary-300 dark:xpo_border-scprimary-600 xpo_rounded-md xpo_w-max xpo_bg-scwhite-50 dark:xpo_bg-scprimary-800">
                      <button 
                        type="button" 
                        onClick={decrementQty} 
                        aria-label={__('Decrease quantity', 'site-core')} 
                        className="xpo_px-3 xpo_py-2 xpo_text-xl xpo_text-scprimary-700 dark:xpo_text-scwhite-200 hover:xpo_bg-scprimary-100 dark:hover:xpo_bg-scprimary-700 xpo_transition-colors"
                      >
                        -
                      </button>
                      <span className="xpo_px-4 xpo_py-2 xpo_text-center xpo_text-scprimary-800 dark:xpo_text-scwhite-100 xpo_font-semibold">
                        {cartForm.quantity}
                      </span>
                      <button 
                        type="button" 
                        onClick={incrementQty} 
                        aria-label={__('Increase quantity', 'site-core')} 
                        className="xpo_px-3 xpo_py-2 xpo_text-xl xpo_text-scprimary-700 dark:xpo_text-scwhite-200 hover:xpo_bg-scprimary-100 dark:hover:xpo_bg-scprimary-700 xpo_transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_mb-8">
                    <button 
                      type="button" 
                      aria-label="Add to Cart" 
                      onClick={handleAddToCart} 
                      className="xpo_bg-scaccent-600 xpo_text-scwhite-50 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-scaccent-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_shadow-md hover:xpo_shadow-lg"
                    >
                      <ShoppingCart strokeWidth={isInCart ? 3 : 2} className="xpo_w-5 xpo_h-5 xpo_mr-2" />
                      {isInCart ? __('Remove from Cart', 'site-core') : __('Add to Cart', 'site-core')}
                    </button>
                    
                    <button 
                      type="button" 
                      aria-label="Add to Wishlist" 
                      onClick={handleAddToWishlist} 
                      className="xpo_bg-scwhite-100 dark:xpo_bg-scprimary-700 xpo_text-scaccent-600 dark:xpo_text-scaccent-400 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold xpo_border xpo_border-scaccent-600 dark:xpo_border-scaccent-400 hover:xpo_bg-scaccent-50 dark:hover:xpo_bg-scprimary-600 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center"
                    >
                      <Heart strokeWidth={isInWishlist ? 3 : 2} className="xpo_w-5 xpo_h-5 xpo_mr-2" />
                      {isInWishlist ? __('Remove from Wishlist', 'site-core') : __('Add to Wishlist', 'site-core')}
                    </button>
                  </div>

                  {/* Specifications as Key Features */}
                  {product?.metadata?.specifications?.length > 0 && (
                    <div className="xpo_bg-scwhite-100 dark:xpo_bg-scprimary-800 xpo_p-6 xpo_rounded-lg xpo_border xpo_border-scprimary-200 dark:xpo_border-scprimary-600">
                      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-scprimary-800 dark:xpo_text-scwhite-100 xpo_mb-4 xpo_flex xpo_items-center">
                        <svg className="xpo_w-5 xpo_h-5 xpo_mr-2 xpo_text-scaccent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {__('Key Specifications', 'site-core')}
                      </h3>
                      <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 xpo_gap-3">
                        {product.metadata.specifications.map((spec, index) => (
                          <div key={index} className="xpo_flex xpo_justify-between xpo_items-center xpo_py-2 xpo_px-3 xpo_bg-scwhite-50 dark:xpo_bg-scprimary-700 xpo_rounded">
                            <span className="xpo_text-sm xpo_font-medium xpo_text-scprimary-700 dark:xpo_text-scwhite-300">
                              {spec.label}:
                            </span>
                            <span className="xpo_text-sm xpo_text-scprimary-600 dark:xpo_text-scwhite-400">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
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


