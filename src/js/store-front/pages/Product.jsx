import { useState, useEffect } from 'react';
import { ProductDetailsSkeleton, SkeletonLoader } from '../components/skeletons/SkeletonLoader';
import { ProductGallery } from '../components/product/ProductGallery';
import RelatedProducts from '../components/product/RelatedProducts';
import ProductTabs from '../components/product/productTabs';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { formatProduct, formatVeriationProduct } from '../utils/formatters';
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

const ProductPage = () => {
  const { id: post_id = null } = useParams();
  const { wishlist, setWishlist } = useWishlist();
  const { cart, setCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleVariation, setVisibleVariation] = useState(null);
  const [variationCarted, setVariationCarted] = useState(null);

  const [cartForm, setCartForm] = useState({
    quantity: 1,
    variations: {},
  });

  const updateCartForm = (field, value) => {
    setCartForm(prev => ({
      ...prev,
      [field]: value
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
    sleep(2000).then(() => {
      api.get(`products/${post_id}`).then(res => formatProduct(res.data))
      .then(prod => {
        setProduct(prod);
        setVisibleVariation(prod);
        setCartForm(prev => ({
          ...prev,
          variations: []
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

  const handleUpdateCart = ({item_id: cart_item_id}) => {
    if (!product) return;
    
    const product_data = {
      ...visibleVariation,
      variations: cartForm.variations.map(vari => ({
        ...vari,
        attributes: vari.attributes.map(attr => ({
          ...attr,
          label: product.attributes.find(att => att.id == attr.attribute_id)?.label
        }))
      })),
      attributes: [],
      categories: [],
    };
    const price = product_data.sale_price <= product_data.price && product_data.sale_price >= 0 ? product_data.sale_price : product_data.price;
    const cartData = {
      price: price,
      product_id: product.id,
      quantity: cartForm.quantity,
    };

    api.post(`/cart/${cart_item_id || 0}`, {
      ...cartData,
      product_data
    }).then(res => res.data)
    .then(res => {
      setCart(prev => ({
        ...prev,
        cart_items: prev.cart_items.find(i => i.id == res.id) ? prev.cart_items.map(i => i.id == res.id ? res : i) : [res, ...prev.cart_items]
      }));
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

  const isInWishlist = wishlist.some(p => p.product_id == product?.id);

  return (
    <>
      <ProductPageHelmet product={product} />
      <nav className="xpo_text-sm xpo_text-scwhite-600 xpo_mb-6 xpo_space-x-2">
        {!loading && (<Link to="/" className="hover:xpo_text-scwhite-800">{__('Home', 'site-core')}</Link>)}
        {loading ? [...Array(3).keys()].map(i => <SkeletonLoader key={i} className="xpo_h-4 xpo_w-32 xpo_inline-block" />) : !product?.categories?.length ? (
          <>
            <Link to="/categories" className="hover:xpo_text-scwhite-800">{__('Categories', 'site-core')}</Link>
            <span className="xpo_text-scwhite-800">{visibleVariation?.title}</span>
          </>
        ) : (
          <>
            {product.categories.map((cat, catI) => typeof cat === 'string' ? <span key={catI} className="xpo_text-scwhite-800">{cat}</span> : <Link key={catI} to={`/collections/${cat.slug}`} className="hover:xpo_text-scwhite-800">{cat.name}</Link>)}
            <span className="xpo_text-scwhite-800">{visibleVariation?.title}</span>
          </>
        )}
      </nav>

      <div className="xpo_product_section xpo_bg-scwhite/70 xpo_rounded-lg xpo_shadow-lg xpo_p-8 xpo_mb-12 xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-8">
        <ProductGallery images={visibleVariation?.metadata?.gallery??[]} loading={loading} />

        <div>
          {loading ? (
            <ProductDetailsSkeleton />
          ) : (
            <>
              <h1 className="xpo_text-3xl xpo_font-bold xpo_mb-4 xpo_text-scprimary-800 dark:xpo_text-scwhite-100">
                {visibleVariation?.title}
              </h1>

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

              {visibleVariation?.metadata?.sku && (
                <div className="xpo_text-sm xpo_text-scprimary-600 dark:xpo_text-scwhite-400 xpo_mb-4">
                  <span className="xpo_font-medium">{__('SKU:', 'site-core')}</span> {visibleVariation.metadata.sku}
                </div>
              )}

              <div className="xpo_text-2xl xpo_font-bold xpo_text-scaccent-600 xpo_mb-6">
                {product?.metadata?.currency?.toUpperCase() || '$'}{Math.min(
                  parseFloat(visibleVariation?.metadata?.price || 0), 
                  parseFloat(visibleVariation?.metadata?.sale_price || product?.metadata?.price || 0)
                ).toFixed(2)}
                {visibleVariation?.metadata?.price && 
                  visibleVariation?.metadata?.sale_price && 
                  parseFloat(visibleVariation.metadata.price) > parseFloat(visibleVariation.metadata.sale_price) && (
                  <span className="xpo_text-lg xpo_text-scprimary-400 dark:xpo_text-scwhite-500 xpo_line-through xpo_ml-3">
                    {product?.metadata?.currency?.toUpperCase() || '$'}{parseFloat(visibleVariation.metadata.price).toFixed(2)}
                  </span>
                )}
                {visibleVariation?.metadata?.price && 
                  visibleVariation?.metadata?.sale_price && 
                  parseFloat(visibleVariation.metadata.price) > parseFloat(visibleVariation.metadata.sale_price) && (
                  <span className="xpo_text-sm xpo_text-green-600 xpo_ml-3 xpo_bg-green-50 dark:xpo_bg-green-900/20 xpo_px-2 xpo_py-1 xpo_rounded">
                    {__('Save', 'site-core')} {Math.round(((parseFloat(visibleVariation.metadata.price) - parseFloat(visibleVariation.metadata.sale_price)) / parseFloat(visibleVariation.metadata.price)) * 100)}%
                  </span>
                )}
              </div>

              <div className="xpo_text-scprimary-700 dark:xpo_text-scwhite-300 xpo_mb-6 xpo_leading-relaxed" 
                    dangerouslySetInnerHTML={{__html: visibleVariation?.metadata?.short_description || visibleVariation?.excerpt || `${visibleVariation?.description??''}`.slice(0, 300)}}>
              </div>

              {product && (<SelectVariation product={product} cart={[cartForm, setCartForm]} setVisibleVariation={setVisibleVariation} setVariationCarted={setVariationCarted} />)}

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

              <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_mb-8">
                <button 
                  type="button" 
                  aria-label="Add to Cart" 
                  onClick={() => handleUpdateCart({item_id: variationCarted?.id})} 
                  className="xpo_bg-scaccent-600 xpo_text-scwhite-50 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-scaccent-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_shadow-md hover:xpo_shadow-lg"
                >
                  <ShoppingCart className="xpo_w-5 xpo_h-5 xpo_mr-2" />
                  {variationCarted ? __('Update Cart', 'site-core') : __('Add to Cart', 'site-core')}
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

            </>
          )}
        </div>
      </div>

      <ProductTabs loading={loading} product={product} />
    </>
  );
};

const SelectVariation = ({ product = {}, cart: cartFormObj = [], setVisibleVariation, setVariationCarted }) => {
  const [selected, setSelected] = useState({});
  const [cartForm = {}, setCartForm = () => {}] = cartFormObj;
  const { cart, setCart, carted_this_variation } = useCart();

  const handleSelect = (attId, itemId) => {
    setSelected(prev => {
      const newSelected = { ...prev };
      if (newSelected[attId] === itemId) {
        delete newSelected[attId];
      } else {
        newSelected[attId] = itemId;
      }
      return newSelected;
    });
  };

  const getAvailableItems = (att) => {
    return att.items.filter(item => {
      const testSelected = { ...selected };
      if (testSelected[att.id]) {
        delete testSelected[att.id];
      }
      testSelected[att.id] = item.id;
      return product.variations.some(variation => {
        const varMap = Object.fromEntries(
          variation.attributes.map(a => [a.attribute_id, a.attribute_item_id])
        );
        return Object.entries(testSelected).every(([aid, iid]) => varMap[aid] === iid);
      });
    });
  };

  const renderColorAttribute = (attribute, availableItems, isSelected) => (
    <div className="xpo_flex xpo_flex-wrap xpo_gap-3">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`xpo_w-10 xpo_h-10 xpo_rounded-full xpo_border-2 xpo_relative xpo_cursor-pointer xpo_transition-all xpo_duration-200 hover:xpo_scale-110 ${
              itemSelected 
                ? 'xpo_border-blue-500 xpo_shadow-lg' 
                : 'xpo_border-gray-300 hover:xpo_border-gray-400'
            }`}
            style={{ backgroundColor: item.value || item.name.toLowerCase() }}
            title={item.name}
          >
            {itemSelected && (
              <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center">
                <svg className="xpo_w-5 xpo_h-5 xpo_text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderSelectAttribute = (attribute, availableItems, isSelected) => (
    <select
      value={isSelected || ''}
      onChange={(e) => handleSelect(attribute.id, e.target.value)}
      className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_bg-white xpo_text-sm focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500 xpo_transition-colors"
    >
      <option value="">{sprintf(__('Choose %s', 'site-core'), attribute.label)}</option>
      {availableItems.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );

  const renderCheckboxAttribute = (attribute, availableItems, isSelected) => (
    <div className="xpo_space-y-2">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <label
            key={item.id}
            className={`xpo_flex xpo_items-center xpo_p-3 xpo_cursor-pointer xpo_border xpo_rounded-lg xpo_transition-all xpo_duration-200 hover:xpo_bg-gray-50 ${
              itemSelected 
                ? 'xpo_bg-blue-50 xpo_border-blue-300 xpo_text-blue-700' 
                : 'xpo_border-gray-200 xpo_text-gray-900'
            }`}
          >
            <input
              type="checkbox"
              checked={itemSelected}
              onChange={() => handleSelect(attribute.id, item.id)}
              className="xpo_mr-3 xpo_h-4 xpo_w-4 xpo_text-blue-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-blue-500"
            />
            <span className="xpo_text-sm xpo_font-medium">{item.name}</span>
          </label>
        );
      })}
    </div>
  );

  const renderImageAttribute = (attribute, availableItems, isSelected) => (
    <div className="xpo_grid xpo_grid-cols-4 xpo_gap-3">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`xpo_relative xpo_aspect-square xpo_rounded-lg xpo_overflow-hidden xpo_border-2 xpo_transition-all xpo_duration-200 hover:xpo_scale-105 ${
              itemSelected 
                ? 'xpo_border-blue-500 xpo_shadow-lg' 
                : 'xpo_border-gray-200 hover:xpo_border-gray-300'
            }`}
            title={item.name}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="xpo_w-full xpo_h-full xpo_object-cover"
              />
            ) : (
              <div className="xpo_w-full xpo_h-full xpo_bg-gray-100 xpo_flex xpo_items-center xpo_justify-center">
                <span className="xpo_text-xs xpo_text-gray-500 xpo_text-center xpo_p-1">
                  {item.name}
                </span>
              </div>
            )}
            {itemSelected && (
              <div className="xpo_absolute xpo_inset-0 xpo_bg-blue-500 xpo_bg-opacity-20 xpo_flex xpo_items-center xpo_justify-center">
                <div className="xpo_bg-blue-500 xpo_rounded-full xpo_p-1">
                  <svg className="xpo_w-4 xpo_h-4 xpo_text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderDefaultAttribute = (attribute, availableItems, isSelected) => (
    <div className="xpo_grid xpo_grid-cols-2 xpo_gap-2">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`xpo_p-3 xpo_text-left xpo_border xpo_rounded-lg xpo_transition-all xpo_duration-200 hover:xpo_bg-gray-50 ${
              itemSelected 
                ? 'xpo_bg-blue-50 xpo_border-blue-300 xpo_text-blue-700' 
                : 'xpo_border-gray-200 xpo_text-gray-900'
            }`}
          >
            <span className="xpo_text-sm xpo_font-medium">{item.name}</span>
          </button>
        );
      })}
    </div>
  );

  const allSelected = Object.keys(selected).length === product.attributes.length;
  const matchingVariation = allSelected
    ? product.variations.find(variation => {
        const varMap = Object.fromEntries(
          variation.attributes.map(a => [a.attribute_id, a.attribute_item_id])
        );
        return Object.entries(selected).every(([aid, iid]) => varMap[aid] === iid);
      })
    : null;

  useEffect(() => {
    if (matchingVariation) {
      const isInCart = carted_this_variation({ product_id: product.id, variationId: matchingVariation.id });
      setVisibleVariation(formatVeriationProduct(product, matchingVariation));
      setCartForm(prev => ({
        ...prev,
        quantity: isInCart ? parseInt(isInCart.quantity) : 1, // prev.quantity,
        variations: [matchingVariation]
      }));
      isInCart ? setVariationCarted(isInCart) : setVariationCarted(null);
    } else {
      setVariationCarted(null);
    }
  }, [matchingVariation, setVisibleVariation, setCartForm]);

  return (
    <div>
      {product?.variations?.length > 0 && (
        <div className="xpo_mb-6">
          {product.attributes.map((attribute) => {
            const availableItems = getAvailableItems(attribute);
            const isSelected = selected[attribute.id];
            
            return (
              <div key={attribute.id} className="xpo_mb-6">
                <label className="xpo_block xpo_mb-3 xpo_text-sm xpo_font-semibold xpo_text-gray-700">
                  {sprintf(__('Select %s', 'site-core'), attribute.label)}
                  {attribute.required && <span className="xpo_text-red-500 xpo_ml-1">*</span>}
                </label>
                
                {availableItems.length > 0 ? (
                  <div className="xpo_space-y-1">
                    {attribute.type === 'color' && renderColorAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'select' && renderSelectAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'checkbox' && renderCheckboxAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'image' && renderImageAttribute(attribute, availableItems, isSelected)}
                    {(!attribute.type || !['color', 'select', 'checkbox', 'image'].includes(attribute.type)) && 
                      renderDefaultAttribute(attribute, availableItems, isSelected)}
                  </div>
                ) : (
                  <div className="xpo_p-4 xpo_bg-gray-50 xpo_border xpo_border-gray-200 xpo_rounded-lg">
                    <p className="xpo_text-sm xpo_text-gray-500 xpo_italic xpo_flex xpo_items-center">
                      <svg className="xpo_w-4 xpo_h-4 xpo_mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      No options available based on previous selections.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function PageBody() {
  return (
    <div>
      <SiteHeader />

      <div className="xpo_relative xpo_min-h-screen">
        <div className="xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>

        <div className="xpo_container xpo_relative xpo_mx-auto xpo_px-4 xpo_py-8 xpo_z-10">
          <ProductPage />
          <RelatedProducts />
        </div>

      </div>
      <SiteFooter />
    </div>
  )
}