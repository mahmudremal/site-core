import { CreditCard, Truck, MapPin, User, Mail, Phone, Plus, Check, ArrowLeft, Package, Clock, Zap, Home, Building, Gift, Apple, Smartphone, Wallet, Edit, Loader2, Store } from 'lucide-react';
import { AddressListCardLoader } from '../components/skeletons/SkeletonLoader';
import CheckoutPageHelmet from '../components/helmets/CheckoutPageHelmet';
import MoonlitSky from '../components/backgrounds/MoonlitSky';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useCurrency } from '../hooks/useCurrency';
import { useLocale } from '../hooks/useLocale';
import { useTheme } from '../hooks/useTheme';
import { usePopup } from '../hooks/usePopup';
import { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { sleep, notify } from '@functions';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';

const deliveryMethods = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: '5-7 business days',
    price: 0,
    icon: Package
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: '2-3 business days',
    price: 9.99,
    icon: Clock
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Next business day',
    price: 24.99,
    icon: Zap
  }
];

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: Wallet
  },
  {
    id: 'apple',
    name: 'Apple Pay',
    description: 'Touch ID or Face ID',
    icon: Apple
  },
  {
    id: 'google',
    name: 'Google Pay',
    description: 'Pay with Google',
    icon: Smartphone
  }
];

export default function CheckoutPage() {
  return (
    <div>
      <SiteHeader />
      <div className="bg-scwhite-50 relative min-h-screen py-8">
        <div className="fixed max-h-screen z-[-1] inset-0 pointer-events-none select-none hidden dark:block">
          <MoonlitSky />
        </div>
        <div className="container relative z-10 mx-auto">
          <CheckoutPageBody />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export const CheckoutPageBody = () => {
  const { __ } = useLocale();
  const { cart } = useCart();
  const { theme } = useTheme();
  const { money } = useCurrency();
  const { setPopup } = usePopup();
  const { loggedin, setLoggedin, user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('standard');
  const [processing, setProcessing] = useState(null);
  const [addressLoading, setAddressLoading] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    newsletter: true
  });

  // Group cart items by seller/vendor for multi-vendor display
  const groupedCartItems = useMemo(() => {
    const groups = {};
    cart.cart_items.forEach(item => {
      const sellerId = item.seller_id || 'unknown'; // Assume item has seller_id; fallback to 'unknown'
      const sellerName = item.seller_name || 'Unknown Seller'; // Assume item has seller_name
      if (!groups[sellerId]) {
        groups[sellerId] = {
          sellerName,
          items: [],
          subtotal: 0
        };
      }
      const itemTotal = parseFloat(item.price) * parseFloat(item.quantity);
      groups[sellerId].items.push(item);
      groups[sellerId].subtotal += itemTotal;
    });
    return Object.values(groups);
  }, [cart.cart_items]);

  // Overall calculations (unified for multi-vendor)
  const subtotal = groupedCartItems.reduce((sum, group) => sum + group.subtotal, 0);
  const selectedDelivery = deliveryMethods.find(method => method.id === selectedDeliveryMethod);
  const shipping = selectedDelivery ? parseFloat(selectedDelivery.price) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!loggedin) return;
    if (savedAddresses?.length) return;
    setAddressLoading(true);
    const delay = setTimeout(() => {
      const { id: user_id = 0 } = user;
      api.get(`${user_id}/addresses`)
        .then(res => res.data)
        .then(data =>
          data?.length && setSavedAddresses(data)
        )
        .catch(err => notify.error(err))
        .finally(() => setAddressLoading(false));
    }, 1500);

    return () => clearTimeout(delay);
  }, [loggedin, user, savedAddresses.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const AddressEditModal = ({ data = null }) => {
    if (!data) data = { _order: 0, type: 'home', name: '', zipCode: '', address: '', city: '', phone: '', isDefault: 0 };
    const [address, setAddress] = useState({ ...data });
    const [saving, setSaving] = useState(null);

    const saveAddress = async () => {
      setSaving(true);
      try {
        const { id: user_id = 0 } = user;
        const { id: address_id = 0, ...addressData } = address;
        let response;
        if (address_id) {
          // Edit existing address (use PUT)
          response = await api.put(`${user_id}/address/${address_id}`, { addressData });
        } else {
          // Add new address (use POST)
          response = await api.post(`${user_id}/address`, { addressData });
        }
        const resData = response.data;
        if (resData?.id) {
          setSavedAddresses(prev => {
            if (address_id) {
              // Update existing
              return prev.map(a => a.id === address_id ? { id: resData.id, ...addressData } : a);
            } else {
              // Add new
              return [...prev, { id: resData.id, ...addressData }];
            }
          });
          notify.success(__('Address saved successfully', 'site-core'));
        }
      } catch (err) {
        notify.error(err);
      } finally {
        setSaving(false);
        setPopup(null);
      }
    };

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-scwhite">
            {data?.id ? __('Edit Address', 'site-core') : __('Add New Address', 'site-core')}
          </h3>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={__('Address Type', 'site-core')}
            value={address.type}
            onChange={(e) => setAddress(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <input
            type="text"
            value={address.name}
            placeholder={__('Address Name', 'site-core')}
            onChange={(e) => setAddress(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={address.zipCode}
              placeholder={__('Zip Code', 'site-core')}
              onChange={(e) => setAddress(prev => ({ ...prev, zipCode: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
            />
            <input
              type="text"
              value={address.address}
              placeholder={__('Full Address', 'site-core')}
              onChange={(e) => setAddress(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
            />
          </div>
          <input
            type="text" // Fixed: was 'tel'
            value={address.city}
            placeholder={__('City', 'site-core')}
            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <input
            type="tel"
            value={address.phone}
            placeholder={__('Phone Number', 'site-core')}
            onChange={(e) => setAddress(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-scwhite-50"
            >
              {__('Cancel', 'site-core')}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={saveAddress}
              className={`flex-1 py-3 px-4 ${saving ? 'bg-scwhite-200' : 'bg-scprimary'} text-scwhite rounded-lg hover:bg-scprimary-800`}
            >
              {saving ? __('Saving...', 'site-core') : __('Save Address', 'site-core')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const process_checkout = () => {
    setProcessing(true);
    // In a real app, this would submit the unified order (split into sub-orders per vendor backend-side)
    sleep(2000).then(() => {
      notify.success(__('Order placed successfully! Sub-orders created for each seller.', 'site-core'));
      setProcessing(false);
      // Redirect to order confirmation
    }).catch(() => setProcessing(false));
  };

  return (
    <>
      <CheckoutPageHelmet />
      <div className="flex items-center justify-between mb-8">
        <Link to="/carry" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft color={theme == 'dark' ? 'white' : 'black'} className="w-5 h-5" />
          <span className="font-medium text-gray-600 dark:text-scwhite">{__('Back to Cart', 'site-core')}</span>
        </Link>
        <button onClick={() => setLoggedin(prev => !prev)} className="text-sm text-scwhite-600 hover:text-scwhite-800">
          {loggedin ? 'Logout (Demo)' : 'Login (Demo)'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Section (unchanged) */}
          {!loggedin && (
            <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">{__('Contact Information', 'site-core')}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={__('Email address', 'site-core')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={__('First name', 'site-core')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={__('Last name', 'site-core')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={__('Phone number', 'site-core')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="newsletter"
                  type="checkbox"
                  name="newsletter"
                  onChange={handleInputChange}
                  checked={formData.newsletter}
                  className="h-4 w-4 text-scprimary focus:ring-scprimary border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                  {__('Subscribe to our newsletter for updates and offers', 'site-core')}
                </label>
              </div>
            </div>
            </div>
          )}

        {/* Shipping Address Section (unchanged) */}
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">
              {loggedin ? __('Delivery Address', 'site-core') : __('Shipping Address', 'site-core')}
            </h2>
          </div>

          {loggedin ? (
            <div className="space-y-4">
              {addressLoading ? (
                <AddressListCardLoader count={2} />
              ) : savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedDeliveryAddress === address.id
                      ? 'border-scprimary bg-scwhite-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedDeliveryAddress(address.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {address.type === 'Home' ? (
                          <Home className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Building className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{address.type}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-scaccent-100 text-scaccent-800 px-2 py-1 rounded-full">
                              {__('Default', 'site-core')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.address}</p>
                        <p className="text-sm text-gray-600">{address.city}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                      </div>
                    </div>
                    <button
                      className="p-1 hover:bg-scwhite-100 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPopup(<AddressEditModal data={address} />);
                      }}
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPopup(<AddressEditModal />);
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-scwhite" />
                {__('Add New Address', 'site-core')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={__('Street address', 'site-core')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
              />

              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                placeholder={__('Apartment, suite, etc. (optional)', 'site-core')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder={__('City', 'site-core')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                />
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder={__('ZIP Code', 'site-core')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Delivery Method Section (unchanged) */}
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">{__('Delivery Method', 'site-core')}</h2>
          </div>

          <div className="space-y-3">
            {deliveryMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedDeliveryMethod === method.id
                      ? 'border-scprimary bg-scwhite-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedDeliveryMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">
                      {method.price === 0 ? __('Free', 'site-core') : money(method.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Section (unchanged) */}
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">{__('Payment Method', 'site-core')}</h2>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                      ? 'border-scprimary bg-scwhite-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Summary Sidebar - Multi-Vendor Grouped */}
      <div>
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{__('Order Summary', 'site-core')}</h2>

          {/* Grouped Items by Vendor */}
          <div className="space-y-6 mb-6">
            {groupedCartItems.map((group, groupIndex) => (
              <div key={groupIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                  <Store className="w-4 h-4" />
                  <span>{group.sellerName} ({group.items.length} {group.items.length === 1 ? __('item', 'site-core') : __('items', 'site-core')})</span>
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <img
                          alt={item.product_name || item.product?.title}
                          src={item?.product?.featured_image || item.product?.metadata?.gallery?.find(i => i.url)?.url || '/placeholder-image.jpg'}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-scwhite-900 text-scwhite text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{item.product_name || item.product?.title}</h3>
                        <p className="text-gray-600 text-sm">{money(item.price, item.currency || item.product?.metadata?.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-900 mt-2">
                  <span>{__('Subtotal for', 'site-core')} {group.sellerName}:</span>
                  <span>{money(group.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Totals (unified) */}
          <div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
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
              <span className="text-lg font-bold text-gray-900 dark:text-scwhite">{__('Total', 'site-core')}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-scwhite">{money(total)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {__('Note: Order will be split into sub-orders per seller for fulfillment.', 'site-core')}
            </p>
          </div>

          <button
            onClick={process_checkout}
            disabled={processing}
            className="w-full bg-scprimary text-scwhite py-4 px-4 rounded-xl font-medium hover:bg-scprimary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {processing ? __('Processing...', 'site-core') : __('Complete Order', 'site-core')}
          </button>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {__('By completing your order, you agree to our Terms of Service and Privacy Policy', 'site-core')}
            </p>
          </div>
        </div>
      </div>
    </div >
    </>
  );
};
