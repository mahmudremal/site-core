import React, { useState } from 'react';
import { CreditCard, Truck, MapPin, User, Mail, Phone, Lock, Calendar, Eye, EyeOff, Check, Shield, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import CheckoutPageHelmet from '../components/helmets/CheckoutPageHelmet';

export default function CheckoutPage() {
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
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false,
    sameAsShipping: true,
    newsletter: true
  });

  const [showCvv, setShowCvv] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setFormData(prev => ({ ...prev, expiryDate: value }));
  };

  return (
    <div className="xpo_bg-gray-50 xpo_min-h-screen xpo_py-8">
      <CheckoutPageHelmet />
      <div className="xpo_max-w-7xl xpo_mx-auto xpo_px-4 xpo_sm:px-6 xpo_lg:px-8">
        <div className="xpo_flex xpo_items-center xpo_mb-8">
          <button className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-600 xpo_hover:text-gray-900 xpo_transition-colors">
            <ArrowLeft className="xpo_w-5 xpo_h-5" />
            <span className="xpo_font-medium">Back to Cart</span>
          </button>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 xpo_lg:grid-cols-2 xpo_gap-8">
          <div className="xpo_space-y-8">
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-6">
                <div className={`xpo_w-8 xpo_h-8 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center ${currentStep >= 1 ? 'xpo_bg-black xpo_text-white' : 'xpo_bg-gray-200 xpo_text-gray-500'}`}>
                  <User className="xpo_w-4 xpo_h-4" />
                </div>
                <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">Contact Information</h2>
              </div>

              <div className="xpo_space-y-4">
                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Email address
                  </label>
                  <div className="xpo_relative">
                    <Mail className="xpo_absolute xpo_left-3 xpo_top-3 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Phone number
                  </label>
                  <div className="xpo_relative">
                    <Phone className="xpo_absolute xpo_left-3 xpo_top-3 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="xpo_flex xpo_items-center">
                  <input
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="xpo_h-4 xpo_w-4 xpo_text-black xpo_focus:ring-black xpo_border-gray-300 xpo_rounded"
                  />
                  <label htmlFor="newsletter" className="xpo_ml-2 xpo_text-sm xpo_text-gray-600">
                    Subscribe to our newsletter for updates and offers
                  </label>
                </div>
              </div>
            </div>

            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-6">
                <div className={`xpo_w-8 xpo_h-8 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center ${currentStep >= 2 ? 'xpo_bg-black xpo_text-white' : 'xpo_bg-gray-200 xpo_text-gray-500'}`}>
                  <MapPin className="xpo_w-4 xpo_h-4" />
                </div>
                <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">Shipping Address</h2>
              </div>

              <div className="xpo_space-y-4">
                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      <option value="NY">New York</option>
                      <option value="CA">California</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                    </select>
                  </div>
                </div>

                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="xpo_mt-6 xpo_p-4 xpo_bg-blue-50 xpo_rounded-lg">
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                  <Truck className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
                  <div>
                    <p className="xpo_font-medium xpo_text-blue-900">Free Standard Shipping</p>
                    <p className="xpo_text-sm xpo_text-blue-700">Delivery in 5-7 business days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-6">
                <div className={`xpo_w-8 xpo_h-8 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center ${currentStep >= 3 ? 'xpo_bg-black xpo_text-white' : 'xpo_bg-gray-200 xpo_text-gray-500'}`}>
                  <CreditCard className="xpo_w-4 xpo_h-4" />
                </div>
                <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">Payment Information</h2>
              </div>

              <div className="xpo_space-y-4">
                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Card number
                  </label>
                  <div className="xpo_relative">
                    <CreditCard className="xpo_absolute xpo_left-3 xpo_top-3 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    <div className="xpo_absolute xpo_right-3 xpo_top-3 xpo_flex xpo_gap-1">
                      <img src="https://js.stripe.com/v3/fingerprinted/img/visa-729c05c240c4bdb47b03ac81d9945bfe.svg" alt="Visa" className="xpo_w-8 xpo_h-5" />
                      <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="xpo_w-8 xpo_h-5" />
                    </div>
                  </div>
                </div>

                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      Expiry date
                    </label>
                    <div className="xpo_relative">
                      <Calendar className="xpo_absolute xpo_left-3 xpo_top-3 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                      CVV
                    </label>
                    <div className="xpo_relative">
                      <Lock className="xpo_absolute xpo_left-3 xpo_top-3 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                      <input
                        type={showCvv ? "text" : "password"}
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="xpo_w-full xpo_pl-10 xpo_pr-10 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                        placeholder="123"
                        maxLength="4"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="xpo_absolute xpo_right-3 xpo_top-3 xpo_text-gray-400 xpo_hover:text-gray-600"
                      >
                        {showCvv ? <EyeOff className="xpo_w-5 xpo_h-5" /> : <Eye className="xpo_w-5 xpo_h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Name on card
                  </label>
                  <input
                    type="text"
                    name="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={handleInputChange}
                    className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-black xpo_focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div className="xpo_flex xpo_items-center">
                  <input
                    id="saveCard"
                    name="saveCard"
                    type="checkbox"
                    checked={formData.saveCard}
                    onChange={handleInputChange}
                    className="xpo_h-4 xpo_w-4 xpo_text-black xpo_focus:ring-black xpo_border-gray-300 xpo_rounded"
                  />
                  <label htmlFor="saveCard" className="xpo_ml-2 xpo_text-sm xpo_text-gray-600">
                    Save card for future purchases
                  </label>
                </div>
              </div>

              <div className="xpo_mt-6 xpo_p-4 xpo_bg-green-50 xpo_rounded-lg">
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                  <Shield className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
                  <div>
                    <p className="xpo_font-medium xpo_text-green-900">Secure Payment</p>
                    <p className="xpo_text-sm xpo_text-green-700">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_sticky xpo_top-8">
              <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">Order Summary</h2>
              
              <div className="xpo_space-y-4 xpo_mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="xpo_flex xpo_gap-3">
                    <div className="xpo_relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="xpo_w-16 xpo_h-16 xpo_object-cover xpo_rounded-lg"
                      />
                      <div className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_bg-gray-900 xpo_text-white xpo_text-xs xpo_rounded-full xpo_w-5 xpo_h-5 xpo_flex xpo_items-center xpo_justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="xpo_flex-1">
                      <h3 className="xpo_font-medium xpo_text-gray-900 xpo_text-sm">{item.name}</h3>
                      <p className="xpo_text-gray-600 xpo_text-sm">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="xpo_space-y-3 xpo_mb-6 xpo_border-t xpo_border-gray-200 xpo_pt-6">
                <div className="xpo_flex xpo_justify-between xpo_text-sm">
                  <span className="xpo_text-gray-600">Subtotal</span>
                  <span className="xpo_font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="xpo_flex xpo_justify-between xpo_text-sm">
                  <span className="xpo_text-gray-600">Shipping</span>
                  <span className="xpo_font-medium xpo_text-green-600">Free</span>
                </div>
                <div className="xpo_flex xpo_justify-between xpo_text-sm">
                  <span className="xpo_text-gray-600">Tax</span>
                  <span className="xpo_font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="xpo_border-t xpo_border-gray-200 xpo_pt-4 xpo_mb-6">
                <div className="xpo_flex xpo_justify-between">
                  <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">Total</span>
                  <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button className="xpo_w-full xpo_bg-black xpo_text-white xpo_py-4 xpo_px-4 xpo_rounded-xl xpo_font-medium xpo_hover:bg-gray-800 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                <Check className="xpo_w-5 xpo_h-5" />
                Complete Order
              </button>

              <div className="xpo_mt-4 xpo_text-center">
                <p className="xpo_text-xs xpo_text-gray-500">
                  By completing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

