import React, { useState } from 'react';
import { CreditCard, Truck, MapPin, User, Mail, Phone, Plus, Check, ArrowLeft, Package, Clock, Zap, Home, Building, Gift, Apple, Smartphone, Wallet, X, Edit } from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { sleep, notify } from '@functions';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet';
import CheckoutPageHelmet from '../components/helmets/CheckoutPageHelmet';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import MoonlitSky from '../components/backgrounds/MoonlitSky';

export default function CheckoutPage() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { setPopup } = usePopup();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

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

  const orderItems = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      price: 349.99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop"
    }
  ];

  const savedAddresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      zipCode: 1236,
      address: '123 Main Street, Apt 4B',
      city: 'New York, NY 10001',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      name: 'John Doe',
      zipCode: 1237,
      address: '456 Business Ave, Suite 200',
      city: 'New York, NY 10002',
      phone: '+1 (555) 987-6543',
      isDefault: false
    }
  ];

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

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedDelivery = deliveryMethods.find(method => method.id === selectedDeliveryMethod);
  const shipping = selectedDelivery ? selectedDelivery.price : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const AddressEditModal = ({ data = {} }) => {
    const [address, setAddress] = useState(data);
    const [saving, setSaving] = useState(null);
    
    return (
      <div className="xpo_w-full">
        <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-4">
          <h3 className="xpo_text-lg xpo_font-bold xpo_text-gray-900">{data?.id ? __('Edit Address', 'site-core') : __('Add New Address', 'site-core')}</h3>
          <button
            onClick={() => setPopup(false)}
            className="xpo_p-1 hover:xpo_bg-scwhite-100 xpo_rounded"
          >
            <X className="xpo_w-5 xpo_h-5" />
          </button>
        </div>
        <div className="xpo_space-y-4">
          <input
            type="text"
            placeholder={__('Full Name', 'site-core')}
            defaultValue={address?.name}
            onChange={(e) => setAddress(prev => ({...prev, name: e.target.value}))}
            className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
          />
          <input
            type="text"
            defaultValue={address?.address}
            placeholder={__('Address', 'site-core')}
            onChange={(e) => setAddress(prev => ({...prev, address: e.target.value}))}
            className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
          />
          <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
            <input
              type="text"
              defaultValue={address?.city}
              placeholder={__('City', 'site-core')}
              onChange={(e) => setAddress(prev => ({...prev, city: e.target.value}))}
              className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
            />
            <input
              type="text"
              defaultValue={address?.zipCode}
              placeholder={__('ZIP Code', 'site-core')}
              onChange={(e) => setAddress(prev => ({...prev, zipCode: e.target.value}))}
              className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
            />
          </div>
          <input
            type="tel"
            defaultValue={address?.phone}
            placeholder={__('Phone Number', 'site-core')}
            onChange={(e) => setAddress(prev => ({...prev, phone: e.target.value}))}
            className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
          />
          <div className="xpo_flex xpo_gap-3">
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="xpo_flex-1 xpo_py-3 xpo_px-4 xpo_border xpo_border-gray-300 xpo_text-gray-700 xpo_rounded-lg hover:xpo_bg-scwhite-50"
            >
              {__('Cancel', 'site-core')}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => {
                setSaving(true);
                sleep(2000).then(() => {
                  api.post('checkout/addresses', address).then(res => res.data)
                  .catch(err => notify.error(err)).finally(() => setSaving(false));
                })
              }}
              className={`xpo_flex-1 xpo_py-3 xpo_px-4 ${saving ? 'xpo_bg-scwhite-200' : 'xpo_bg-scprimary'} xpo_text-scwhite xpo_rounded-lg hover:xpo_bg-scwhite-800`}
            >
              {saving ? __('Saving...', 'site-core') : __('Save Address', 'site-core')}
            </button>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div>
      <SiteHeader />
      <CheckoutPageHelmet />
      <div className="xpo_bg-scwhite-50 xpo_relative xpo_min-h-screen xpo_py-8">
        <div className="xpo_absolute xpo_h-full xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>
        <div className="xpo_container xpo_relative xpo_z-10 xpo_mx-auto">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-8">
            <Link to="/carry" className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-600 hover:xpo_text-gray-900 xpo_transition-colors">
              <ArrowLeft color="white" className="xpo_w-5 xpo_h-5" />
              <span className="xpo_font-medium xpo_text-scwhite">{__('Back to Cart', 'site-core')}</span>
            </Link>
            <button
              onClick={() => setIsLoggedIn(prev => !prev)}
              className="xpo_text-sm xpo_text-scwhite-600 hover:xpo_text-scwhite-800"
            >
              {isLoggedIn ? 'Logout (Demo)' : 'Login (Demo)'}
            </button>
          </div>

          <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-8">
            <div className="lg:xpo_col-span-2 xpo_space-y-6">
              
              {!isLoggedIn && (
                <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
                  <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-6">
                    <User className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
                    <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">{__('Contact Information', 'site-core')}</h2>
                  </div>

                  <div className="xpo_space-y-4">
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={__('Email address', 'site-core')}
                        className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                      />
                    </div>

                    <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={__('First name', 'site-core')}
                        className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={__('Last name', 'site-core')}
                        className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                      />
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={__('Phone number', 'site-core')}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                    />

                    <div className="xpo_flex xpo_items-center">
                      <input
                        id="newsletter"
                        type="checkbox"
                        name="newsletter"
                        onChange={handleInputChange}
                        checked={formData.newsletter}
                        className="xpo_h-4 xpo_w-4 xpo_text-scprimary focus:xpo_ring-scprimary xpo_border-gray-300 xpo_rounded"
                      />
                      <label htmlFor="newsletter" className="xpo_ml-2 xpo_text-sm xpo_text-gray-600">
                        {__('Subscribe to our newsletter for updates and offers', 'site-core')}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-6">
                  <MapPin className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
                  <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">
                    {isLoggedIn ? __('Delivery Address', 'site-core') : __('Shipping Address', 'site-core')}
                  </h2>
                </div>

                {isLoggedIn ? (
                  <div className="xpo_space-y-4">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`xpo_border-2 xpo_rounded-lg xpo_p-4 xpo_cursor-pointer xpo_transition-all ${
                          selectedDeliveryAddress === address.id
                            ? 'xpo_border-scprimary xpo_bg-scwhite-50'
                            : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                        }`}
                        onClick={() => setSelectedDeliveryAddress(address.id)}
                      >
                        <div className="xpo_flex xpo_items-start xpo_justify-between">
                          <div className="xpo_flex xpo_items-start xpo_gap-3">
                            <div className="xpo_mt-1">
                              {address.type === 'Home' ? (
                                <Home className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
                              ) : (
                                <Building className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                                <span className="xpo_font-medium xpo_text-gray-900">{address.type}</span>
                                {address.isDefault && (
                                  <span className="xpo_text-xs xpo_bg-scaccent-100 xpo_text-scaccent-800 xpo_px-2 xpo_py-1 xpo_rounded-full">
                                    {__('Default', 'site-core')}
                                  </span>
                                )}
                              </div>
                              <p className="xpo_text-sm xpo_text-gray-600">{address.name}</p>
                              <p className="xpo_text-sm xpo_text-gray-600">{address.address}</p>
                              <p className="xpo_text-sm xpo_text-gray-600">{address.city}</p>
                              <p className="xpo_text-sm xpo_text-gray-600">{address.phone}</p>
                            </div>
                          </div>
                          <button className="xpo_p-1 hover:xpo_bg-scwhite-100 xpo_rounded" onClick={(e) => {e.preventDefault();e.stopPropagation();setPopup(<AddressEditModal data={address} />);}}>
                            <Edit className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={(e) => {e.preventDefault();e.stopPropagation();setPopup(<AddressEditModal />);}}
                      className="xpo_w-full xpo_border-2 xpo_border-dashed xpo_border-gray-300 xpo_rounded-lg xpo_p-4 xpo_text-gray-600 hover:xpo_border-gray-400 hover:xpo_text-gray-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                    >
                      <Plus className="xpo_w-5 xpo_h-5" />
                      {__('Add New Address', 'site-core')}
                    </button>
                  </div>
                ) : (
                  <div className="xpo_space-y-4">
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={__('Street address', 'site-core')}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                    />

                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder={__('Apartment, suite, etc. (optional)', 'site-core')}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                    />

                    <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder={__('City', 'site-core')}
                        className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                      />
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder={__('ZIP Code', 'site-core')}
                        className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-scprimary focus:xpo_border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-6">
                  <Truck className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
                  <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">{__('Delivery Method', 'site-core')}</h2>
                </div>

                <div className="xpo_space-y-3">
                  {deliveryMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`xpo_border-2 xpo_rounded-lg xpo_p-4 xpo_cursor-pointer xpo_transition-all ${
                          selectedDeliveryMethod === method.id
                            ? 'xpo_border-scprimary xpo_bg-scwhite-50'
                            : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                        }`}
                        onClick={() => setSelectedDeliveryMethod(method.id)}
                      >
                        <div className="xpo_flex xpo_items-center xpo_justify-between">
                          <div className="xpo_flex xpo_items-center xpo_gap-3">
                            <Icon className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
                            <div>
                              <p className="xpo_font-medium xpo_text-gray-900">{method.name}</p>
                              <p className="xpo_text-sm xpo_text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          <span className="xpo_font-medium xpo_text-gray-900">
                            {method.price === 0 ? __('Free', 'site-core') : money(method.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-6">
                  <CreditCard className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
                  <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">{__('Payment Method', 'site-core')}</h2>
                </div>

                <div className="xpo_space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`xpo_border-2 xpo_rounded-lg xpo_p-4 xpo_cursor-pointer xpo_transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'xpo_border-scprimary xpo_bg-scwhite-50'
                            : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="xpo_flex xpo_items-center xpo_gap-3">
                          <Icon className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
                          <div>
                            <p className="xpo_font-medium xpo_text-gray-900">{method.name}</p>
                            <p className="xpo_text-sm xpo_text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_sticky xpo_top-8">
                <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">{__('Order Summary', 'site-core')}</h2>
                
                <div className="xpo_space-y-4 xpo_mb-6">
                  {orderItems.map((item) => (
                    <div key={item.id} className="xpo_flex xpo_gap-3">
                      <div className="xpo_relative">
                        <img
                          alt={item.name}
                          src={item.image}
                          className="xpo_w-16 xpo_h-16 xpo_object-cover xpo_rounded-lg"
                        />
                        <div className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_bg-scwhite-900 xpo_text-scwhite xpo_text-xs xpo_rounded-full xpo_w-5 xpo_h-5 xpo_flex xpo_items-center xpo_justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="xpo_flex-1">
                        <h3 className="xpo_font-medium xpo_text-gray-900 xpo_text-sm">{item.name}</h3>
                        <p className="xpo_text-gray-600 xpo_text-sm">{money(item.price, item.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="xpo_space-y-3 xpo_mb-6 xpo_border-t xpo_border-gray-200 xpo_pt-6">
                  <div className="xpo_flex xpo_justify-between xpo_text-sm">
                    <span className="xpo_text-gray-600">{__('Subtotal', 'site-core')}</span>
                    <span className="xpo_font-medium">{money(subtotal)}</span>
                  </div>
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
                
                <button className="xpo_w-full xpo_bg-scprimary xpo_text-scwhite xpo_py-4 xpo_px-4 xpo_rounded-xl xpo_font-medium hover:xpo_bg-scprimary-800 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                  <Check className="xpo_w-5 xpo_h-5" />
                  {__('Complete Order', 'site-core')}
                </button>

                <div className="xpo_mt-4 xpo_text-center">
                  <p className="xpo_text-xs xpo_text-gray-500">
                    {__('By completing your order, you agree to our Terms of Service and Privacy Policy', 'site-core')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};
