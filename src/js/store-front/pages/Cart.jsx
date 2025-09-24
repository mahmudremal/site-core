import { useState } from 'react';
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

const defaultItems = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 199.99,
    originalPrice: 249.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    color: "Matte Black",
    size: "One Size"
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    price: 349.99,
    originalPrice: 399.99,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
    color: "Gray",
    size: "Medium"
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    price: 299.99,
    originalPrice: 329.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    color: "Space Gray",
    size: "42mm"
  }
];

export default function CartPage() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { cart, add_to_cart, remove_cart } = useCart();
  const [cartItems, setCartItems] = useState(cart?.cart_items??{cart_items: []});

  const [crossSellItems] = useState([
    {
      id: 101,
      name: "Premium Phone Case",
      price: 29.99,
      originalPrice: 39.99,
      image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=200&h=200&fit=crop",
      rating: 4.8,
      reviews: 156
    },
    {
      id: 102,
      name: "Wireless Charging Pad",
      price: 49.99,
      originalPrice: 59.99,
      image: "https://images.unsplash.com/photo-1609792858004-21c9aab89cec?w=200&h=200&fit=crop",
      rating: 4.6,
      reviews: 89
    },
    {
      id: 103,
      name: "Bluetooth Speaker",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop",
      rating: 4.9,
      reviews: 234
    },
    {
      id: 104,
      name: "Cable Organizer Set",
      price: 19.99,
      originalPrice: 24.99,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop",
      rating: 4.7,
      reviews: 67
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    const newItem = {
      ...item,
      quantity: 1,
      color: "Default",
      size: "One Size"
    };
    setCartItems(items => [...items, newItem]);
  };

  const subtotal = cart.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cart.cart_items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div>
      <SiteHeader />
      <CartPageHelmet />
      <Butterflies count={5} />
      <div className="xpo_min-h-screen xpo_relative xpo_py-8">
        <div className="xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>
        <div className="xpo_container xpo_relative xpo_z-10 xpo_mx-auto">
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
                  {cart.cart_items.map((item, iIndex) => (
                    <div key={iIndex} className="xpo_bg-scwhite/70 xpo_border xpo_border-gray-200 xpo_rounded-xl xpo_p-4 hover:xpo_shadow-md xpo_transition-shadow">
                      <div className="xpo_flex xpo_gap-4">
                        <div className="xpo_flex-shrink-0">
                          <img
                            src={item?.product?.featured_image || (item?.product?.metadata?.gallery??[]).find(i => i.url)?.url} alt={item.product_name}
                            className="xpo_w-20 xpo_h-20 xpo_object-cover xpo_rounded-lg"
                          />
                        </div>
                        
                        <div className="xpo_flex-1 xpo_min-w-0">
                          <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_text-sm xpo_mb-1">
                            {item.product_name}
                          </h3>
                          <div className="xpo_flex xpo_gap-4 xpo_text-xs xpo_text-gray-500 xpo_mb-2">
                            <span>{sprintf(__('Color: %s', 'site-core'), item.color)}</span>
                            <span>{sprintf(__('Size: %s', 'site-core'), item.size)}</span>
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
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="xpo_p-2 hover:xpo_bg-gray-50 xpo_transition-colors"
                                >
                                  <Minus className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                                </button>
                                <span className="xpo_px-3 xpo_py-2 xpo_text-sm xpo_font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="xpo_p-2 hover:xpo_bg-gray-50 xpo_transition-colors"
                                >
                                  <Plus className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                                </button>
                              </div>
                              
                              <button onClick={() => remove_cart({ item })} className="xpo_p-2 xpo_text-red-500 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors">
                                <X className="xpo_w-4 xpo_h-4" />
                              </button>
                              
                              <button className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-red-500 hover:xpo_bg-gray-50 xpo_rounded-lg xpo_transition-colors">
                                <Heart className="xpo_w-4 xpo_h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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

          {/* Cross-Sell Section */}
          <div className="xpo_mt-12">
            <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">
                {__('You might also like', 'site-core')}
              </h2>

              <ProductCatalogue tools={false} endpoint={`products?dir=cart/crosssales`} filters={{per_page: 4}} loadMore={false} card_bg="" />
              
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};
