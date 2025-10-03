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
import MoonlitSky from '../components/backgrounds/MoonlitSky';
import Butterflies from '../components/backgrounds/Butterflies';
import api from '../services/api';
import { useWishlist } from '../hooks/useWishlist';


const CartPage = () => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const [loading, setLoading] = useState(null);
  const { cart, add_to_cart, remove_cart } = useCart();
  const [cart_items, setCartItems] = useState(
    () => cart?.cart_items??{cart_items: []}
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
      const variationExisted = (item?.product_data?.variations||[]).find(i => i) || {};
      return {...item.product_data, ...variationExisted};
    });
    const [quantity, setQuantity] = useState(() => parseInt(item.quantity));
    const [firstCall, setFirstCall] = useState(null);

    useEffect(() => {
      if (!firstCall) return setFirstCall(true);
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
        <div className="xpo_bg-scwhite/70 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_p-4 hover:xpo_shadow-md xpo_transition-shadow">
          <div className="xpo_flex xpo_gap-4">
            <div className="xpo_flex-shrink-0">
              <img
                src={get_featured_image()}
                alt={variation?.title || item.product_name}
                className="xpo_w-20 xpo_h-20 xpo_object-cover xpo_rounded-lg"
              />
            </div>
            
            <div className="xpo_flex-1 xpo_min-w-0">
              <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_text-sm xpo_mb-1">
                {variation?.title || item.product_name}
              </h3>
              <div className="xpo_flex xpo_gap-4 xpo_text-xs xpo_text-gray-500 xpo_mb-2">
                {(item?.product_data?.variations || []).flatMap(variable => 
                  variable.attributes.map((attr, attrIndex) => 
                    <span key={attrIndex}>{sprintf(__('%s: %s', 'site-core'), attr.label, attr.name)}</span>
                  )
                )}
              </div>
              
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_gap-2">
                  <span className="xpo_font-bold xpo_text-lg xpo_text-gray-900">
                    {money(item.price, item.currency)}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="xpo_text-sm xpo_text-gray-400 xpo_line-through">
                      {money(item.originalPrice, item.currency)}
                    </span>
                  )}
                </div>
                
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                  <div className="xpo_flex xpo_items-center xpo_border xpo_border-gray-200 xpo_rounded-lg">
                    <button
                      onClick={() => setQuantity(prev => prev - 1)}
                      className="xpo_p-2 hover:xpo_bg-gray-50 xpo_transition-colors"
                    >
                      <Minus className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                    </button>
                    <span className="xpo_px-3 xpo_py-2 xpo_text-sm xpo_font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="xpo_p-2 hover:xpo_bg-gray-50 xpo_transition-colors"
                    >
                      <Plus className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                    </button>
                  </div>
                  
                  <button onClick={() => remove_cart({ item })} className="xpo_p-2 xpo_text-red-500 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors">
                    <X className="xpo_w-4 xpo_h-4" />
                  </button>
                  
                  <button onClick={() => toggle_wishlist({ product: {...item.product_data, id: item.product_data.product_id} })} className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-red-500 hover:xpo_bg-gray-50 xpo_rounded-lg xpo_transition-colors">
                    <Heart className={`xpo_w-4 xpo_h-4 ${is_in_wishlist({ product_id: item.product_id }) ? 'xpo_fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-8">
      
      {/* Cart Items Section */}
      <div className="lg:xpo_col-span-2">
        <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
            <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
              {__('Shopping Cart', 'site-core')}
            </h1>
            <span className="xpo_text-sm xpo_text-gray-500">
              {sprintf(cart.cart_items.length === 1 ? __('%d item', 'site-core') : __('%d items', 'site-core'), cart.cart_items.length)}
            </span>
          </div>

          <div className="xpo_space-y-4">
            {loading ? (
              <></>
            ) : !cart.cart_items?.length ? (
              <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_py-16 xpo_px-6">
                <div className="xpo_w-24 xpo_h-24 xpo_bg-gray-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mb-6">
                  <ShoppingBag className="xpo_w-12 xpo_h-12 xpo_text-gray-400" />
                </div>
                
                <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-3">
                  {__('Your cart is empty', 'site-core')}
                </h2>
                
                <p className="xpo_text-gray-500 xpo_text-center xpo_mb-8">
                  {__('Looks like you haven\'t added anything to your cart yet. Start shopping to fill it up!', 'site-core')}
                </p>
                
                <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4 xpo_w-full">
                  <Link 
                    to="/collections/special" 
                    className="xpo_flex-1 xpo_bg-scprimary xpo_text-scwhite/70 xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium xpo_text-center hover:xpo_bg-gray-800 xpo_transition-colors"
                  >
                    {__('Start Shopping', 'site-core')}
                  </Link>
                  
                  <Link 
                    to="/collections/featured" 
                    className="xpo_flex-1 xpo_border xpo_border-gray-200 xpo_text-gray-700 xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium xpo_text-center hover:xpo_bg-gray-50 xpo_transition-colors"
                  >
                    {__('View Featured', 'site-core')}
                  </Link>
                </div>
                
              </div>
            ) : cart.cart_items.map((item, iIndex) => <CartLineItem key={iIndex} item={item} />)}
          </div>

          {/* Service Features */}
          <div className="xpo_mt-8 xpo_pt-6 xpo_border-t xpo_border-gray-200">
            <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-3 xpo_gap-4">
              <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_bg-blue-50 xpo_rounded-lg">
                <Truck className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
                <div>
                  <p className="xpo_text-xs xpo_font-medium xpo_text-blue-900">{__('Free Shipping', 'site-core')}</p>
                  <p className="xpo_text-xs xpo_text-blue-700">{sprintf(__('Orders over %s', 'site-core'), money(100, 'usd'))}</p>
                </div>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_bg-green-50 xpo_rounded-lg">
                <Shield className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
                <div>
                  <p className="xpo_text-xs xpo_font-medium xpo_text-green-900">{__('Secure Payment', 'site-core')}</p>
                  <p className="xpo_text-xs xpo_text-green-700">{__('SSL Protected', 'site-core')}</p>
                </div>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_bg-purple-50 xpo_rounded-lg">
                <RefreshCw className="xpo_w-5 xpo_h-5 xpo_text-purple-600" />
                <div>
                  <p className="xpo_text-xs xpo_font-medium xpo_text-purple-900">{__('Easy Returns', 'site-core')}</p>
                  <p className="xpo_text-xs xpo_text-purple-700">{__('30-day policy', 'site-core')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:xpo_col-span-1">
        <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_sticky xpo_top-8">
          <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">
            {__('Order Summary', 'site-core')}
          </h2>
          
          <div className="xpo_space-y-3 xpo_mb-6">
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span className="xpo_font-medium">{money(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="xpo_flex xpo_justify-between xpo_text-sm">
                <span className="xpo_text-green-600">{__('Savings', 'site-core')}</span>
                <span className="xpo_font-medium xpo_text-green-600">-{money(savings)}</span>
              </div>
            )}
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Shipping', 'site-core')}</span>
              <span className="xpo_font-medium">
                {shipping === 0 ? __('Free', 'site-core') : money(shipping)}
              </span>
            </div>
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Tax', 'site-core')}</span>
              <span className="xpo_font-medium">{money(tax)}</span>
            </div>
          </div>
          
          <div className="xpo_border-t xpo_border-gray-200 xpo_pt-4 xpo_mb-6">
            <div className="xpo_flex xpo_justify-between">
              <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">{__('Total', 'site-core')}</span>
              <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">{money(total)}</span>
            </div>
          </div>
          
          <div className="xpo_flex xpo_flex-col">
            <Link to="/checkout" className="xpo_w-full xpo_bg-scprimary xpo_text-scwhite/70 xpo_py-3 xpo_px-4 xpo_rounded-xl xpo_font-medium xpo_flex xpo_justify-center hover:xpo_bg-gray-800 xpo_transition-colors xpo_mb-4">{__('Proceed to Checkout', 'site-core')}</Link>
            <Link to="/collections/special" className="xpo_w-full xpo_border xpo_border-gray-200 xpo_text-gray-700 xpo_py-3 xpo_px-4 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                <ShoppingBag className="xpo_w-4 xpo_h-4" />
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
      <div className="xpo_min-h-screen xpo_relative xpo_py-8">
        {/* xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none xpo_hidden dark:xpo_block */}
        <div className="xpo_fixed xpo_max-h-screen xpo_z-[-1] xpo_inset-0 xpo_pointer-events-none xpo_select-none xpo_hidden dark:xpo_block">
          <MoonlitSky />
        </div>
        <div className="xpo_container xpo_relative xpo_z-10 xpo_mx-auto">

          <CartPage />
          
          
          {/* Cross-Sell Section */}
          <div className="xpo_mt-12">
            <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">
                {__('You might also like', 'site-core')}
              </h2>

              <ProductCatalogue tools={false} endpoint={`products?dir=cart/crosssales`} filters={{per_page: 4}} loadMore={false} card_bg="" maxPaginations={4} />
              
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

export default PageBody;