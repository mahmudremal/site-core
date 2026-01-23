import { CreditCard, Truck, MapPin, User, Mail, Phone, Plus, Check, ArrowLeft, Package, Clock, Zap, Home, Building, Gift, Apple, Smartphone, Wallet, Edit, Loader2, Shield, Box } from 'lucide-react';
import { AddressListCardLoader } from '../components/skeletons/SkeletonLoader';
import CheckoutPageHelmet from '../components/helmets/CheckoutPageHelmet';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useCurrency } from '../hooks/useCurrency';
import { useLocale } from '../hooks/useLocale';
import { useTheme } from '../hooks/useTheme';
import { usePopup } from '../hooks/usePopup';
import { useEffect, useState } from 'react';
import { sleep, notify } from '@functions';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentComponent from '../components/cart/PaymentComponent';


/*
### 4. **Add Payment Info**

**Trigger:** When user selects or enters payment info.

```js
window.dataLayer.push({
  'event': 'add_payment_info',
  'ecommerce': {
    'payment_type': 'Credit Card'
  }
});

clarity('event', 'add_payment_info');
```
*/


export default function PageBody() {
  return (
    <div>
      <SiteHeader />
      <div className="container relative z-10 mx-auto pt-8 pb-16">
        <CheckoutPage />
      </div>
      <SiteFooter />
    </div>
  );
};

export const CheckoutPage = () => {
  const { __ } = useLocale();
  const { cart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { setPopup } = usePopup();
  const { money, currency } = useCurrency();
  const { loggedin, setLoggedin, user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('standard');
  const [processing, setProcessing] = useState(null);
  const [addressLoading, setAddressLoading] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [orderDraftID, setOrderDraftID] = useState(0);

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
    country: 'BD',
    newsletter: true
  });

  const deliveryMethods = [
    {
      id: 'standard',
      name: __('Standard Delivery', 'site-core'),
      description: __('5-7 business days', 'site-core'),
      price: 0,
      icon: Package,
      selected: false
    },
    {
      id: 'express',
      name: __('Express Delivery', 'site-core'),
      description: __('2-3 business days', 'site-core'),
      price: 9.99,
      icon: Clock,
      selected: true
    },
    {
      id: 'overnight',
      name: __('Overnight Delivery', 'site-core'),
      description: __('Next business day', 'site-core'),
      price: 24.99,
      icon: Zap,
      selected: false
    }
  ];

  const paymentMethods = [
    {
      id: 'cod',
      active: true,
      name: __('Cash on Delivery (COD)', 'site-core'),
      description: __('Pay upon delivery', 'site-core'),
      icon: Box
    },
    {
      id: 'card',
      active: true,
      name: __('Credit/Debit Card', 'site-core'),
      description: __('Visa, Mastercard, American Express', 'site-core'),
      icon: CreditCard
    },
    {
      id: 'paypal',
      active: false,
      name: __('PayPal', 'site-core'),
      description: __('Pay with your PayPal account', 'site-core'),
      icon: Wallet
    },
    {
      id: 'apple',
      active: false,
      name: __('Apple Pay', 'site-core'),
      description: __('Touch ID or Face ID', 'site-core'),
      icon: Apple
    },
    {
      id: 'google',
      active: false,
      name: __('Google Pay', 'site-core'),
      description: __('Pay with Google', 'site-core'),
      icon: Smartphone
    },
    {
      id: 'sslcommerz',
      active: true,
      name: __('SSLCommerz', 'site-core'),
      description: __('Pay with SSLCommerz gateway', 'site-core'),
      icon: Shield
    }
  ];

  useEffect(() => {
    if (!loggedin) return;
    if (savedAddresses?.length) return;
    setAddressLoading(true);
    const delay = setTimeout(() => {
      const { id: user_id = 0 } = user;
      api.get(`${user_id}/addresses`)
        .then(res => res.data)
        .then(data => {
          data?.length && setSavedAddresses(data)
          data?.length == 1 && setSelectedDeliveryAddress(data.find(a => a)?.id)
        })
        .catch(err => notify.error(err))
        .finally(() => setAddressLoading(false));
    }, 1500);

    return () => clearTimeout(delay);
  }, [loggedin]);

  const subtotal = cart.cart_items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const selectedDelivery = deliveryMethods.find(method => method.id === selectedDeliveryMethod);
  const shipping = selectedDelivery ? parseFloat(selectedDelivery.price) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-scwhite">{data?.id ? __('Edit Address', 'site-core') : __('Add New Address', 'site-core')}</h3>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder={__('Address Type', 'site-core')}
            defaultValue={address?.type}
            onChange={(e) => setAddress(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <input
            type="text"
            defaultValue={address?.name}
            placeholder={__('Address Name', 'site-core')}
            onChange={(e) => setAddress(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              defaultValue={address?.zipCode}
              placeholder={__('Zip Code', 'site-core')}
              onChange={(e) => setAddress(prev => ({ ...prev, zipCode: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
            />
            <input
              type="text"
              defaultValue={address?.address}
              placeholder={__('Full Address', 'site-core')}
              onChange={(e) => setAddress(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
            />
          </div>
          <input
            type="tel"
            defaultValue={address?.city}
            placeholder={__('City', 'site-core')}
            onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scprimary focus:border-transparent text-gray-600 dark:text-scprimary-400"
          />
          <input
            type="tel"
            defaultValue={address?.phone}
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
              onClick={(e) => {
                setSaving(true);
                sleep(2000).then(() => {
                  const { id: user_id = 0 } = user;
                  const { id: address_id = 0, ...addressData } = address;
                  api.post(`${user_id}/address/${address_id}`, { addressData })
                    .then(res => res.data).then(data => {
                      if (data?.id) {
                        setSavedAddresses(prev => [...prev, { id: data.id, ...addressData }]);
                      } else if (address_id && data?.success) {
                        setSavedAddresses(prev =>
                          prev.map(a => a.id == address_id ? { ...address } : a)
                        );
                      } else {
                        // 
                      }
                    })
                    .then(() => setPopup(null))
                    .catch(err => notify.error(err)).finally(() => setSaving(false));
                })
              }}
              className={`flex-1 py-3 px-4 ${saving ? 'bg-scwhite-200' : 'bg-scprimary'} text-scwhite rounded-lg hover:bg-scwhite-800`}
            >
              {saving ? __('Saving...', 'site-core') : __('Save Address', 'site-core')}
            </button>
          </div>
        </div>
      </div>
    )
  };

  // const process_checkout = (e) => {
  //   e.preventDefault();e.stopPropagation();
  //   setProcessing(true);
  //   let address = {...formData};
  //   if (loggedin && savedAddresses.some(a => a.id == selectedDeliveryAddress)) address = savedAddresses.find(a => a.id == selectedDeliveryAddress)
  //   api.post(`/checkout`, {
  //     billing: address,
  //     shipping: address,
  //     currency: currency,
  //     payment_method: selectedPaymentMethod
  //   })
  //   .then(res => res.data)
  //   .then(data => {
  //     if (data?.redirection) console.log(data?.redirection)
  //   })
  //   // .then(() => )
  //   .catch(err => notify.error(err))
  //   .finally(() => setProcessing(false));
  // }
  // 
  const process_checkout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProcessing(true);

    const address = loggedin && selectedDeliveryAddress
      ? savedAddresses.find(a => a.id == selectedDeliveryAddress)
      : formData;

    try {
      api.post(`orders/create-draft/${orderDraftID}`, {
        status: 'draft',
        billing: address,
        shipping: address,
        currency: currency,
        payment_method: selectedPaymentMethod,
        shipping_method: selectedDeliveryMethod
      })
        .then(res => res.data)
        .then(orderRes => {
          if (orderRes?.order_id) setOrderDraftID(orderRes?.order_id ?? 0);
          window?.dataLayer?.push?.({
            event: 'purchase',
            ecommerce: {
              transaction_id: orderRes?.order_id,
              value: total,
              currency: currency,
              items: cart.cart_items.map(item => ({
                item_name: item.product_name,
                item_id: item.product_data.metadata.sku,
                price: item.price,
                quantity: item.quantity
              }))
            }
          });
          window?.clarity?.('event', 'purchase');
          if (orderRes?.redirect_url) {
            sleep(1500).then(() => navigate(orderRes.redirect_url));
          }
          false && sleep(3000).then(() => {
            setPopup(
              <PaymentComponent
                method={selectedPaymentMethod}
                orderId={orderRes.data.id}
                currency={currency}
                amount={total}
                customerData={{
                  name: `${formData.firstName} ${formData.lastName}`,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address
                }}
                onSuccess={(paymentInfo) => {
                  api.post(`/orders/${orderRes.data.id}/complete`, { paymentInfo })
                    .then(() => {
                      notify.success(__('Order placed successfully!', 'site-core'));
                      window.location.href = '/order-confirmation';
                    })
                    .catch(err => notify.error(err))
                    .finally(() => setPopup(null));
                }}
                onFailed={(error) => {
                  notify.error(error.message || __('Payment failed', 'site-core'));
                  setPopup(null);
                }}
              />
            );
          });
          return orderRes;
        })
        .catch(err => notify.error(err.response?.data?.message || __('Failed to create order', 'site-core')))
        .finally(() => setProcessing(false));

    } catch (err) {
      ;
    } finally {
      ;
    }
  };

  useEffect(() => {
    if (total < 0) return;
    window?.dataLayer?.push?.({
      event: 'begin_checkout',
      ecommerce: {
        currency: currency?.toUpperCase?.(),
        value: total,
      }
    });
    window?.clarity?.('event', 'begin_checkout');
  }, []);


  return (
    <>
      <CheckoutPageHelmet />
      <div className="flex items-center justify-between mb-8">
        <Link to="/carry" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft color={theme == 'dark' ? 'white' : 'black'} className="w-5 h-5" />
          <span className="font-medium text-gray-600 dark:text-scwhite">{__('Back to Cart', 'site-core')}</span>
        </Link>
        {/* <button onClick={() => setLoggedin(prev => !prev)} className="text-sm text-scwhite-600 hover:text-scwhite-800">
          {loggedin ? 'Logout (Demo)' : 'Login (Demo)'}
        </button> */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

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
                      <button className="p-1 hover:bg-scwhite-100 rounded" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPopup(<AddressEditModal data={address} />); }}>
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPopup(<AddressEditModal />); }}
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

          <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">{__('Payment Method', 'site-core')}</h2>
            </div>

            <div className="space-y-3">
              {paymentMethods.filter(m => m.active).map((method) => {
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

        <div>
          <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{__('Order Summary', 'site-core')}</h2>

            <div className="space-y-4 mb-6">
              {cart.cart_items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative">
                    <img
                      alt={item.product_name || item.product_data?.title}
                      src={item?.product_data?.featured_image || (item?.product_data?.metadata?.gallery || []).find(i => i.url)?.url}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-scwhite-900 text-scwhite text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.product_name || item.product_data?.title}</h3>
                    <p className="text-gray-600 text-sm">{money(item.price, item.currency || item.product_data?.metadata?.currency)}</p>
                  </div>
                </div>
              ))}
            </div>

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
            </div>

            <button
              disabled={processing}
              onClick={process_checkout}
              className="w-full bg-scprimary text-scwhite py-4 px-4 rounded-xl font-medium hover:bg-scprimary-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {processing ? __('Processing...', 'site-core') : __('Confirm Order', 'site-core')}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {__('By completing your order, you agree to our Terms of Service and Privacy Policy', 'site-core')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
