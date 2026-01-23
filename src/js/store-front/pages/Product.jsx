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
          className={`inline-block w-5 h-5 ${i < count ? 'text-yellow-400' : 'text-gray-300'
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
          return prod;
        })
        .then(_product => {
          // analytics part
          window?.dataLayer?.push?.({
            'event': 'view_item',
            'ecommerce': {
              'items': [{
                'item_name': _product.title,
                'item_id': _product?.metadata?.sku || _product?.id,
                'price': parseFloat(_product?.metadata?.sale_price || _product?.metadata?.price),
                'category': _product?.categories?.find?.(i => i)
              }]
            }
          });
          window?.clarity?.('event', 'view_item');
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

  const handleUpdateCart = ({ item_id: cart_item_id }) => {
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

    api.post(`cart/${cart_item_id || 0}`, {
      ...cartData,
      product_data
    }).then(res => res.data)
      .then(res => {
        setCart(prev => ({
          ...prev,
          cart_items: prev.cart_items.find(i => i.id == res.id) ? prev.cart_items.map(i => i.id == res.id ? res : i) : [res, ...prev.cart_items]
        }));
      })
      .catch(err => notify.error(err)).finally(() => { });
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
      .catch(err => notify.error(err)).finally(() => { });
  };

  const isInWishlist = wishlist.some(p => p.product_id == product?.id);

  return (
    <>
      <ProductPageHelmet product={product} />
      <nav className="text-sm text-scwhite-600 mb-6 space-x-2">
        {!loading && (<Link to="/" className="hover:text-scwhite-800">{__('Home', 'site-core')}</Link>)}
        {loading ? [...Array(3).keys()].map(i => <SkeletonLoader key={i} className="h-4 w-32 inline-block" />) : !product?.categories?.length ? (
          <>
            <Link to="/categories" className="hover:text-scwhite-800">{__('Categories', 'site-core')}</Link>
            <span className="text-scwhite-800">{visibleVariation?.title}</span>
          </>
        ) : (
          <>
            {product.categories.map((cat, catI) => typeof cat === 'string' ? <span key={catI} className="text-scwhite-800">{cat}</span> : <Link key={catI} to={`/collections/${cat.slug}`} className="hover:text-scwhite-800">{cat.name}</Link>)}
            <span className="text-scwhite-800">{visibleVariation?.title}</span>
          </>
        )}
      </nav>

      <div className="product_section bg-scwhite/70 rounded-lg shadow-lg p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductGallery images={visibleVariation?.metadata?.gallery ?? []} loading={loading} />

        <div>
          {loading ? (
            <ProductDetailsSkeleton />
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4 text-scprimary-800 dark:text-scwhite-100">
                {visibleVariation?.title}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(product?.seller?.short_rating || 0))}
                </div>
                <span className="text-sm text-scprimary-600 dark:text-scwhite-400 ml-2">
                  {sprintf(__('(%s Rating)', 'site-core'), product?.seller?.short_rating || '0.0')}
                </span>
                {product?.seller?.shop_name && (
                  <span className="text-sm text-scprimary-500 dark:text-scwhite-500 ml-4">
                    {__('by', 'site-core')} {product.seller.shop_name}
                  </span>
                )}
              </div>

              {visibleVariation?.metadata?.sku && (
                <div className="text-sm text-scprimary-600 dark:text-scwhite-400 mb-4">
                  <span className="font-medium">{__('SKU:', 'site-core')}</span> {visibleVariation.metadata.sku}
                </div>
              )}

              <div className="text-2xl font-bold text-scaccent-600 mb-6">
                {product?.metadata?.currency?.toUpperCase() || '$'}{Math.min(
                  parseFloat(visibleVariation?.metadata?.price || 0),
                  parseFloat(visibleVariation?.metadata?.sale_price || product?.metadata?.price || 0)
                ).toFixed(2)}
                {visibleVariation?.metadata?.price &&
                  visibleVariation?.metadata?.sale_price &&
                  parseFloat(visibleVariation.metadata.price) > parseFloat(visibleVariation.metadata.sale_price) && (
                    <span className="text-lg text-scprimary-400 dark:text-scwhite-500 line-through ml-3">
                      {product?.metadata?.currency?.toUpperCase() || '$'}{parseFloat(visibleVariation.metadata.price).toFixed(2)}
                    </span>
                  )}
                {visibleVariation?.metadata?.price &&
                  visibleVariation?.metadata?.sale_price &&
                  parseFloat(visibleVariation.metadata.price) > parseFloat(visibleVariation.metadata.sale_price) && (
                    <span className="text-sm text-green-600 ml-3 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                      {__('Save', 'site-core')} {Math.round(((parseFloat(visibleVariation.metadata.price) - parseFloat(visibleVariation.metadata.sale_price)) / parseFloat(visibleVariation.metadata.price)) * 100)}%
                    </span>
                  )}
              </div>

              <div className="text-scprimary-700 dark:text-scwhite-300 mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: visibleVariation?.metadata?.short_description || visibleVariation?.excerpt || `${visibleVariation?.description ?? ''}`.slice(0, 300) }}>
              </div>

              {product && (<SelectVariation product={product} cart={[cartForm, setCartForm]} setVisibleVariation={setVisibleVariation} setVariationCarted={setVariationCarted} />)}

              <div className="mb-6">
                <label className="block text-sm font-medium text-scprimary-700 dark:text-scwhite-200 mb-2">
                  {__('Quantity', 'site-core')}
                </label>
                <div className="flex items-center border border-scprimary-300 dark:border-scprimary-600 rounded-md w-max bg-scwhite-50 dark:bg-scprimary-800">
                  <button
                    type="button"
                    onClick={decrementQty}
                    aria-label={__('Decrease quantity', 'site-core')}
                    className="px-3 py-2 text-xl text-scprimary-700 dark:text-scwhite-200 hover:bg-scprimary-100 dark:hover:bg-scprimary-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-center text-scprimary-800 dark:text-scwhite-100 font-semibold">
                    {cartForm.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={incrementQty}
                    aria-label={__('Increase quantity', 'site-core')}
                    className="px-3 py-2 text-xl text-scprimary-700 dark:text-scwhite-200 hover:bg-scprimary-100 dark:hover:bg-scprimary-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  type="button"
                  aria-label={__('Add to Cart', 'site-core')}
                  onClick={() => handleUpdateCart({ item_id: variationCarted?.id })}
                  className="bg-scaccent-600 text-scwhite-50 px-6 py-3 rounded-lg font-semibold hover:bg-scaccent-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {variationCarted ? __('Update Cart', 'site-core') : __('Add to Cart', 'site-core')}
                </button>

                <button
                  type="button"
                  aria-label={__('Add to Wishlist', 'site-core')}
                  onClick={handleAddToWishlist}
                  className="bg-scwhite-100 dark:bg-scprimary-700 text-scaccent-600 dark:text-scaccent-400 px-6 py-3 rounded-lg font-semibold border border-scaccent-600 dark:border-scaccent-400 hover:bg-scaccent-50 dark:hover:bg-scprimary-600 transition-colors flex items-center justify-center"
                >
                  <Heart strokeWidth={isInWishlist ? 3 : 2} className="w-5 h-5 mr-2" />
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
  const [cartForm = {}, setCartForm = () => { }] = cartFormObj;
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
    <div className="flex flex-wrap gap-3">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`w-10 h-10 rounded-full border-2 relative cursor-pointer transition-all duration-200 hover:scale-110 ${itemSelected
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-300 hover:border-gray-400'
              }`}
            style={{ backgroundColor: item.value || item.name.toLowerCase() }}
            title={item.name}
          >
            {itemSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
    <div className="space-y-2">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <label
            key={item.id}
            className={`flex items-center p-3 cursor-pointer border rounded-lg transition-all duration-200 hover:bg-gray-50 ${itemSelected
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-900'
              }`}
          >
            <input
              type="checkbox"
              checked={itemSelected}
              onChange={() => handleSelect(attribute.id, item.id)}
              className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">{item.name}</span>
          </label>
        );
      })}
    </div>
  );

  const renderImageAttribute = (attribute, availableItems, isSelected) => (
    <div className="grid grid-cols-4 gap-3">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${itemSelected
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
              }`}
            title={item.name}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500 text-center p-1">
                  {item.name}
                </span>
              </div>
            )}
            {itemSelected && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-blue-500 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
    <div className="grid grid-cols-2 gap-2">
      {availableItems.map((item) => {
        const itemSelected = isSelected === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelect(attribute.id, item.id)}
            className={`p-3 text-left border rounded-lg transition-all duration-200 hover:bg-gray-50 ${itemSelected
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-900'
              }`}
          >
            <span className="text-sm font-medium">{item.name}</span>
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
        <div className="mb-6">
          {product.attributes.map((attribute) => {
            const availableItems = getAvailableItems(attribute);
            const isSelected = selected[attribute.id];

            return (
              <div key={attribute.id} className="mb-6">
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                  {sprintf(__('Select %s', 'site-core'), attribute.label)}
                  {attribute.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {availableItems.length > 0 ? (
                  <div className="space-y-1">
                    {attribute.type === 'color' && renderColorAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'select' && renderSelectAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'checkbox' && renderCheckboxAttribute(attribute, availableItems, isSelected)}
                    {attribute.type === 'image' && renderImageAttribute(attribute, availableItems, isSelected)}
                    {(!attribute.type || !['color', 'select', 'checkbox', 'image'].includes(attribute.type)) &&
                      renderDefaultAttribute(attribute, availableItems, isSelected)}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500 italic flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="container relative mx-auto px-4 py-8 z-10">
        <ProductPage />
        <RelatedProducts />
      </div>
      <SiteFooter />
    </div>
  )
}