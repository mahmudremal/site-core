import { useEffect, useState } from 'react';
import { Minus, Plus, X, Heart, ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';
import CartPageHelmet from '../components/helmets/CartPageHelmet';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import ProductCatalogue from "../components/product/ProductCatalogue";
import { useLocale } from "../hooks/useLocale";
import { sprintf } from 'sprintf-js';
import { useCart } from '../hooks/useCart';
import { useCurrency } from '../hooks/useCurrency';
import Butterflies from '../components/backgrounds/Butterflies';
import api from '../services/api';
import { useWishlist } from '../hooks/useWishlist';


const CartPage = () => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [loading, setLoading] = useState(null);
  const { cart, add_to_cart, remove_cart } = useCart();
  const [cart_items, setCartItems] = useState(
    () => cart?.cart_items ?? { cart_items: [] }
  );

  const subtotal = cart.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cart.cart_items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     setLoading(false);
  //   }, 100);

  //   return () => clearTimeout(delay);
  // }, []);

  const CartLineItem = ({ item }) => {
    const { is_in_wishlist, toggle_wishlist } = useWishlist();
    const [variation, setVariation] = useState(() => {
      const variationExisted = (item?.product_data?.variations || []).find(i => i) || {};
      return { ...item.product_data, ...variationExisted };
    });
    const [quantity, setQuantity] = useState(() => parseInt(item.quantity));
    const [firstCall, setFirstCall] = useState(null);

    useEffect(() => {
      if (!firstCall) {
        setFirstCall(true);
        return;
      }
      const delay = setTimeout(() => {
        api.post(`cart/${item.id}`, {
          quantity,
        })
          .then(res => res.data)
          .then(() => {
            // setCartItems(items =>
            //   items.map(itm =>
            //     itm.id === item.id ? { ...itm, quantity: quantity } : itm
            //   )
            // );
          })
          .catch(err => notify.error(err))
      }, 2000);

      return () => clearTimeout(delay);
    }, [quantity]);

    // useEffect(() => {
    //   // if (!variation) return;
    //   console.log(variation)
    // }, [variation])


    // if (!variation?.gallery?.length) return null;

    const get_featured_image = () => {
      if (variation?.gallery?.length && typeof variation.gallery !== 'string' && variation.gallery.find(i => i.url)?.url) return variation.gallery.find(i => i.url)?.url;
      if (item?.product_data?.featured_image) return item?.product_data?.featured_image;
      if (item?.product_data?.metadata?.gallery?.length && item.product_data.metadata.gallery.find(i => i.url)?.url) return item.product_data.metadata.gallery.find(i => i.url)?.url;
      return null;
    }


    return (
      <>
        <CartPageHelmet />
        <div className="bg-scwhite/70 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={get_featured_image()}
                alt={variation?.title || item.product_name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {variation?.title || item.product_name}
              </h3>
              <div className="flex gap-4 text-xs text-gray-500 mb-2">
                {(item?.product_data?.variations || []).flatMap(variable =>
                  variable.attributes.map((attr, attrIndex) =>
                    <span key={attrIndex}>{sprintf(__('%s: %s', 'site-core'), attr.label, attr.name)}</span>
                  )
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">
                    {money(item.price, item.currency)}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {money(item.originalPrice, item.currency)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(prev => prev - 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="px-3 py-2 text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <button onClick={() => remove_cart({ item })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>

                  <button onClick={() => toggle_wishlist({ product: { ...item.product_data, id: item.product_data.product_id } })} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors">
                    <Heart className={`w-4 h-4 ${is_in_wishlist({ product_id: item.product_id }) ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  useEffect(() => {
    window?.dataLayer?.push?.({
      'event': 'view_cart'
    });
    window?.clarity?.('event', 'view_cart');
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Cart Items Section */}
      <div className="lg:col-span-2">
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {__('Shopping Cart', 'site-core')}
            </h1>
            <span className="text-sm text-gray-500">
              {sprintf(cart.cart_items.length === 1 ? __('%d item', 'site-core') : __('%d items', 'site-core'), cart.cart_items.length)}
            </span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <></>
            ) : !cart.cart_items?.length ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {__('Your cart is empty', 'site-core')}
                </h2>

                <p className="text-gray-500 text-center mb-8">
                  {__('Looks like you haven\'t added anything to your cart yet. Start shopping to fill it up!', 'site-core')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Link
                    to="/collections/special"
                    className="flex-1 bg-scprimary text-scwhite/70 py-3 px-6 rounded-xl font-medium text-center hover:bg-gray-800 transition-colors"
                  >
                    {__('Start Shopping', 'site-core')}
                  </Link>

                  <Link
                    to="/collections/featured"
                    className="flex-1 border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors"
                  >
                    {__('View Featured', 'site-core')}
                  </Link>
                </div>

              </div>
            ) : cart.cart_items.map((item, iIndex) => <CartLineItem key={iIndex} item={item} />)}
          </div>

          {/* Service Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-blue-900">{__('Free Shipping', 'site-core')}</p>
                  <p className="text-xs text-blue-700">{sprintf(__('Orders over %s', 'site-core'), money(100, 'usd'))}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-green-900">{__('Secure Payment', 'site-core')}</p>
                  <p className="text-xs text-green-700">{__('SSL Protected', 'site-core')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs font-medium text-purple-900">{__('Easy Returns', 'site-core')}</p>
                  <p className="text-xs text-purple-700">{__('30-day policy', 'site-core')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {__('Order Summary', 'site-core')}
          </h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">{__('Savings', 'site-core')}</span>
                <span className="font-medium text-green-600">-{money(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Shipping', 'site-core')}</span>
              <span className="font-medium">
                {shipping === 0 ? __('Free', 'site-core') : money(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Tax', 'site-core')}</span>
              <span className="font-medium">{money(tax)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-gray-900">{__('Total', 'site-core')}</span>
              <span className="text-lg font-bold text-gray-900">{money(total)}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <Link to="/checkout" className="w-full bg-scprimary text-scwhite/70 py-3 px-4 rounded-xl font-medium flex justify-center hover:bg-gray-800 transition-colors mb-4">{__('Proceed to Checkout', 'site-core')}</Link>
            <Link to="/collections/special" className="w-full border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {__('Continue Shopping', 'site-core')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

const PageBody = () => {
  const { __ } = useLocale();
  return (
    <div>
      <SiteHeader />
      <Butterflies count={5} />
      <div className="py-8">
        <div className="container relative z-10 mx-auto">
          <CartPage />

          <div className="mt-12">
            <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {__('You might also like', 'site-core')}
              </h2>

              <ProductCatalogue tools={false} endpoint={`products?dir=cart/crosssales`} filters={{ per_page: 4 }} loadMore={false} card_bg="" maxPaginations={4} />

            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

export default PageBody;