import { useState } from 'react';
import { Package, MapPin, Phone, User, Calendar, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, X, RefreshCw, CreditCard, Star } from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { sleep, notify } from '@functions';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import { sprintf } from 'sprintf-js';
import MoonlitSky from '../components/backgrounds/MoonlitSky';

export default function ReturnsOrdersPage() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { purpose = 'history' } = useParams();
  const { setPopup } = usePopup();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');

  const orders = [
    {
      id: 'XPO-2024-001',
      date: '2024-09-15',
      status: 'completed',
      deliveredDate: '2024-09-18',
      total: 549.98,
      tax: 44.00,
      shipping: 0,
      items: [
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
          quantity: 1,
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop"
        }
      ],
      deliveryMethod: 'Standard Delivery',
      deliveryAddress: {
        name: 'John Doe',
        address: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        phone: '+1 (555) 123-4567'
      }
    },
    {
      id: 'XPO-2024-002',
      date: '2024-09-12',
      status: 'fulfilled',
      total: 299.99,
      tax: 24.00,
      shipping: 9.99,
      items: [
        {
          id: 3,
          name: "Smart Fitness Watch",
          price: 299.99,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop"
        }
      ],
      deliveryMethod: 'Express Delivery',
      deliveryAddress: {
        name: 'John Doe',
        address: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        phone: '+1 (555) 123-4567'
      },
      trackingInfo: {
        currentLocation: {
          lat: 40.7128,
          lon: -74.0060,
          address: 'Distribution Center, Brooklyn, NY'
        },
        deliveryBoy: {
          name: 'Mike Johnson',
          phone: '+1 (555) 987-1234'
        },
        mapLink: 'https://maps.google.com/?q=40.7128,-74.0060'
      }
    },
    {
      id: 'XPO-2024-003',
      date: '2024-09-10',
      status: 'processing',
      total: 199.99,
      tax: 16.00,
      shipping: 0,
      items: [
        {
          id: 4,
          name: "Wireless Charging Pad",
          price: 49.99,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1609792858004-21c9aab89cec?w=100&h=100&fit=crop"
        }
      ],
      deliveryMethod: 'Standard Delivery',
      deliveryAddress: {
        name: 'John Doe',
        address: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        phone: '+1 (555) 123-4567'
      }
    }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: Clock, 
          color: 'xpo_text-yellow-600 xpo_bg-yellow-100', 
          label: 'Pending',
          message: 'Your order has been received and is waiting to be processed.'
        };
      case 'processing':
        return { 
          icon: RefreshCw, 
          color: 'xpo_text-blue-600 xpo_bg-blue-100', 
          label: 'Processing',
          message: 'We are preparing your order for shipment. This usually takes 1-2 business days.',
          attachment: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop'
        };
      case 'fulfilled':
        return { 
          icon: Truck, 
          color: 'xpo_text-purple-600 xpo_bg-purple-100', 
          label: 'Fulfilled',
          message: 'Your order has been shipped and is on its way to you!'
        };
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'xpo_text-green-600 xpo_bg-green-100', 
          label: 'Completed',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!'
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'xpo_text-gray-600 xpo_bg-gray-100', 
          label: 'Unknown' 
        };
    }
  };

  const getDaysSinceDelivery = (deliveredDate) => {
    if (!deliveredDate) return null;
    const delivered = new Date(deliveredDate);
    const now = new Date();
    const diffTime = Math.abs(now - delivered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const TrackingModal = ({ order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="xpo_w-full xpo_max-w-2xl">
        <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-6">
          <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">{__('Order Tracking', 'site-core')}</h3>
        </div>

        <div className="xpo_bg-gray-50 xpo_rounded-xl xpo_p-4 xpo_mb-6">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <div>
              <h4 className="xpo_font-semibold xpo_text-gray-900">{sprintf(__('Order #%d', 'site-core'), order.id)}</h4>
              <p className="xpo_text-sm xpo_text-gray-600">Placed on {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className={`xpo_flex xpo_items-center xpo_gap-2 xpo_px-3 xpo_py-2 xpo_rounded-full ${statusInfo.color}`}>
              <StatusIcon className="xpo_w-4 xpo_h-4" />
              <span className="xpo_text-sm xpo_font-medium">{statusInfo.label}</span>
            </div>
          </div>

          <div className="xpo_grid xpo_grid-cols-3 xpo_gap-4 xpo_text-sm">
            <div>
              <span className="xpo_text-gray-600">{__('Total:', 'site-core')}</span>
              <span className="xpo_font-semibold xpo_ml-1">{money(order.total)}</span>
            </div>
            <div>
              <span className="xpo_text-gray-600">{__('Tax:', 'site-core')}</span>
              <span className="xpo_font-semibold xpo_ml-1">{money(order.tax)}</span>
            </div>
            <div>
              <span className="xpo_text-gray-600">{__('Shipping:', 'site-core')}</span>
              <span className="xpo_font-semibold xpo_ml-1">{order.shipping === 0 ? __('Free', 'site-core') : money(order.shipping)}</span>
            </div>
          </div>
        </div>

        <div className="xpo_mb-6">
          <h5 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-3">{__('Delivery Address', 'site-core')}</h5>
          <div className="xpo_bg-scwhite xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4">
            <div className="xpo_flex xpo_items-start xpo_gap-3">
              <MapPin className="xpo_w-5 xpo_h-5 xpo_text-gray-400 xpo_mt-0.5" />
              <div>
                <p className="xpo_font-medium xpo_text-gray-900">{order.deliveryAddress.name}</p>
                <p className="xpo_text-sm xpo_text-gray-600">{order.deliveryAddress.address}</p>
                <p className="xpo_text-sm xpo_text-gray-600">{order.deliveryAddress.city}</p>
                <p className="xpo_text-sm xpo_text-gray-600">{order.deliveryAddress.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="xpo_bg-scwhite xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-6">
          <div className="xpo_flex xpo_items-start xpo_gap-4">
            <div className={`xpo_p-3 xpo_rounded-full ${statusInfo.color}`}>
              <StatusIcon className="xpo_w-6 xpo_h-6" />
            </div>
            <div className="xpo_flex-1">
              <h6 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{statusInfo.label}</h6>
              <p className="xpo_text-gray-600 xpo_mb-4">{statusInfo.message}</p>

              {statusInfo.attachment && (
                <img src={statusInfo.attachment} alt={__('Order processing', 'site-core')} className="xpo_w-full xpo_h-32 xpo_object-cover xpo_rounded-lg xpo_mb-4" />
              )}

              {order.status === 'fulfilled' && order.trackingInfo && (
                <div className="xpo_space-y-4">
                  <div className="xpo_bg-blue-50 xpo_rounded-lg xpo_p-4">
                    <h6 className="xpo_font-semibold xpo_text-blue-900 xpo_mb-2">{__('Current Location', 'site-core')}</h6>
                    <p className="xpo_text-sm xpo_text-blue-700 xpo_mb-2">{order.trackingInfo.currentLocation.address}</p>
                    <a target="_blank" rel="noopener noreferrer" href={order.trackingInfo.mapLink} className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-blue-600 hover:xpo_text-blue-800">
                      <MapPin className="xpo_w-4 xpo_h-4" />
                      {__('View on Google Maps', 'site-core')}
                    </a>
                  </div>

                  <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-4">
                    <h6 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('Delivery Contact', 'site-core')}</h6>
                    <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                      <User className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                      <span className="xpo_text-sm xpo_text-gray-700">{order.trackingInfo.deliveryBoy.name}</span>
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                      <Phone className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                      <span className="xpo_text-sm xpo_text-gray-700">{order.trackingInfo.deliveryBoy.phone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RefundModal = ({ order }) => {
    const [step, setStep] = useState(1);
    const [selectedItems, setSelectedItems] = useState([]);
    const [refundReason, setRefundReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleItemToggle = (itemId) => {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    };

    const handleRefundSubmit = async () => {
      setSubmitting(true);
      await sleep(2000);
      setStep(3);
      setSubmitting(false);
    };

    const isReturn = order.status === 'completed' && getDaysSinceDelivery(order.deliveredDate) <= 7;

    if (step === 1) {
      return (
        <div className="xpo_w-full xpo_max-w-2xl">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-6">
            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">
              {isReturn ? __('Return Request', 'site-core') : __('Refund Request', 'site-core')}
            </h3>
          </div>

          <div className="xpo_bg-gray-50 xpo_rounded-xl xpo_p-6 xpo_mb-6">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
              <div>
                <h4 className="xpo_font-semibold xpo_text-gray-900">{sprintf(__('Order #%s', 'site-core'), order.id)}</h4>
                <p className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Placed on %s', 'site-core'), new Date(order.date).toLocaleDateString())}</p>
                {order.deliveredDate && (
                  <p className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Delivered on %s', 'site-core'), new Date(order.deliveredDate).toLocaleDateString())}</p>
                )}
              </div>
            </div>

            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_text-sm xpo_mb-4">
              <div>
                <span className="xpo_text-gray-600">{__('Total:', 'site-core')}</span>
                <span className="xpo_font-semibold xpo_ml-1">{money(order.total)}</span>
              </div>
              <div>
                <span className="xpo_text-gray-600">{__('Delivery:', 'site-core')}</span>
                <span className="xpo_font-semibold xpo_ml-1">{order.deliveryMethod}</span>
              </div>
            </div>

            <div className="xpo_space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="xpo_flex xpo_gap-3 xpo_bg-scwhite xpo_rounded-lg xpo_p-3">
                  <img
                    alt={item.name} src={item.image}
                    className="xpo_w-12 xpo_h-12 xpo_object-cover xpo_rounded-lg"
                  />
                  <div className="xpo_flex-1">
                    <h5 className="xpo_font-medium xpo_text-gray-900 xpo_text-sm">{item.name}</h5>
                    <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mt-1">
                      <span className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Qty: %d', 'site-core'), item.quantity)}</span>
                      <span className="xpo_font-semibold xpo_text-gray-900">{money(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="xpo_w-full xpo_bg-red-600 xpo_text-scwhite xpo_py-4 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_bg-red-700 xpo_transition-colors"
          >
            {isReturn ? __('I want to get Return', 'site-core') : __('I want to get Refund', 'site-core')}
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="xpo_w-full xpo_max-w-2xl">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-6">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <button
                onClick={() => setStep(1)}
                className="xpo_p-1 hover:xpo_bg-gray-100 xpo_rounded"
              >
                <ArrowLeft className="xpo_w-5 xpo_h-5" />
              </button>
              <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">
                {isReturn ? __('Select Items to Return', 'site-core') : __('Select Items to Refund', 'site-core')}
              </h3>
            </div>
          </div>

          <div className="xpo_space-y-4 xpo_mb-6">
            {order.items.map((item) => (
              <div 
                key={item.id} 
                className={`xpo_border-2 xpo_rounded-lg xpo_p-4 xpo_cursor-pointer xpo_transition-all ${
                  selectedItems.includes(item.id)
                    ? 'xpo_border-red-500 xpo_bg-red-50'
                    : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                }`}
                onClick={() => handleItemToggle(item.id)}
              >
                <div className="xpo_flex xpo_gap-4">
                  <div className="xpo_flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="xpo_w-5 xpo_h-5 xpo_text-red-600 xpo_rounded"
                    />
                  </div>
                  <img
                    alt={item.name} src={item.image}
                    className="xpo_w-16 xpo_h-16 xpo_object-cover xpo_rounded-lg"
                  />
                  <div className="xpo_flex-1">
                    <h5 className="xpo_font-medium xpo_text-gray-900">{item.name}</h5>
                    <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mt-2">
                      <span className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Quantity: %d', 'site-core'), item.quantity)}</span>
                      <span className="xpo_font-semibold xpo_text-gray-900">{money(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="xpo_mb-6">
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
              {isReturn ? __('Reason for Return (Optional)', 'site-core') : __('Reason for Refund (Optional)', 'site-core')}
            </label>
            <textarea
              rows={4}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-red-500 xpo_focus:border-transparent"
              placeholder={isReturn ? __('Please tell us why you want to return these items...', 'site-core') : __('Please tell us why you want to refund these items...', 'site-core')}
            />
          </div>

          <button
            onClick={handleRefundSubmit}
            disabled={selectedItems.length === 0 || submitting}
            className={`xpo_w-full xpo_py-4 xpo_px-6 xpo_rounded-xl xpo_font-medium xpo_transition-colors ${
              selectedItems.length === 0 || submitting
                ? 'xpo_bg-gray-300 xpo_text-gray-500 xpo_cursor-not-allowed'
                : 'xpo_bg-red-600 xpo_text-scwhite hover:xpo_bg-red-700'
            }`}
          >
            {submitting ? __('Submitting Request...', 'site-core') : isReturn ? __('Submit Return Request', 'site-core') : __('Submit Refund Request', 'site-core')}
          </button>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="xpo_w-full xpo_max-w-md xpo_text-center">
          <div className="xpo_mb-6">
            <div className="xpo_w-16 xpo_h-16 xpo_bg-green-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
              <CheckCircle className="xpo_w-8 xpo_h-8 xpo_text-green-600" />
            </div>
            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">{__('Request Submitted!', 'site-core')}</h3>
            <p className="xpo_text-gray-600">
              {__("I got your request. Shortly we'll review your request and further details will be sent to your email/phone SMS.", 'site-core')}
            </p>
          </div>

          <button
            onClick={() => setPopup(null)}
            className="xpo_w-full xpo_bg-gray-900 xpo_text-scwhite xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-800 xpo_transition-colors"
          >
            {__('Close', 'site-core')}
          </button>
        </div>
      );
    }
  };

  const OrderTrackingForm = () => {
    const [submitting, setSubmitting] = useState(false);

    const handleTrackOrder = async () => {
      if (!trackingOrderId.trim()) return;
      
      setSubmitting(true);
      await sleep(1500);
      
      const order = orders.find(o => o.id.toLowerCase() === trackingOrderId.toLowerCase());
      if (order) {
        setPopup(<TrackingModal order={order} />);
      } else {
        notify.error('Order not found. Please check your order ID.');
      }
      setSubmitting(false);
    };

    return (
      <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-8 xpo_text-center xpo_max-w-md xpo_mx-auto">
        <div className="xpo_mb-6">
          <div className="xpo_w-16 xpo_h-16 xpo_bg-blue-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
            <Package className="xpo_w-8 xpo_h-8 xpo_text-blue-600" />
          </div>
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">{__('Track Your Order', 'site-core')}</h2>
          <p className="xpo_text-gray-600">{__('Enter your order ID to track your package', 'site-core')}</p>
        </div>

        <div className="xpo_space-y-4">
          <input
            type="text"
            value={trackingOrderId}
            onChange={(e) => setTrackingOrderId(e.target.value)}
            placeholder={__('Enter Order ID (e.g., XPO-2024-001)', 'site-core')}
            className="xpo_w-full xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-blue-500 xpo_focus:border-transparent"
          />

          <button
            onClick={handleTrackOrder}
            disabled={!trackingOrderId.trim() || submitting}
            className={`xpo_w-full xpo_py-3 xpo_px-6 xpo_rounded-lg xpo_font-medium xpo_transition-colors ${
              !trackingOrderId.trim() || submitting
                ? 'xpo_bg-gray-300 xpo_text-gray-500 xpo_cursor-not-allowed'
                : 'xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700'
            }`}
          >
            {submitting ? __('Tracking...', 'site-core') : __('Track Order', 'site-core')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SiteHeader />
      <div className="xpo_relative xpo_min-h-screen">
        <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_m-auto">
          <MoonlitSky />
        </div>
        <div className="xpo_container xpo_relative xpo_m-auto xpo_z-10 xpo_pb-12">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-8">
            <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900">Returns & Orders</h1>
            <button
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              className="xpo_text-sm xpo_text-scwhite-600 hover:xpo_text-scwhite-800"
            >
              {isLoggedIn ? 'Logout (Demo)' : 'Login (Demo)'}
            </button>
          </div>

          {!isLoggedIn ? (
            <OrderTrackingForm />
          ) : (
            <div className="xpo_space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const daysSinceDelivery = getDaysSinceDelivery(order.deliveredDate);
                const canReturn = order.status === 'completed' && daysSinceDelivery <= 7;
                const canRefund = order.status !== 'completed';
                const canTrack = order.status !== 'completed';

                return (
                  <div key={order.id} className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
                    <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
                      <div>
                        <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{sprintf(__('Order #%s', 'site-core'), order.id)}</h3>
                        <p className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Placed on %s', 'site-core'), new Date(order.date).toLocaleDateString())}</p>
                        {order.deliveredDate && (
                          <p className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Delivered on %s', 'site-core'), new Date(order.deliveredDate).toLocaleDateString())}</p>
                        )}
                      </div>
                      <div className="xpo_flex xpo_items-center xpo_gap-3">
                        <div className={`xpo_flex xpo_items-center xpo_gap-2 xpo_px-3 xpo_py-2 xpo_rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="xpo_w-4 xpo_h-4" />
                          <span className="xpo_text-sm xpo_font-medium">{statusInfo.label}</span>
                        </div>
                        <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">{money(order.total)}</span>
                      </div>
                    </div>

                    <div className="xpo_space-y-3 xpo_mb-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="xpo_flex xpo_gap-4 xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                          <img
                            alt={item.name} src={item.image}
                            className="xpo_w-16 xpo_h-16 xpo_object-cover xpo_rounded-lg"
                          />
                          <div className="xpo_flex-1">
                            <h4 className="xpo_font-medium xpo_text-gray-900">{item.name}</h4>
                            <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mt-1">
                              <span className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Qty: %d', 'site-core'), item.quantity)}</span>
                              <span className="xpo_font-semibold xpo_text-gray-900">{money(item.price, item.currency)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="xpo_flex xpo_gap-3 xpo_justify-end">
                      {canTrack && (
                        <button
                          onClick={() => setPopup(<TrackingModal order={order} />)}
                          className="xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-scwhite xpo_rounded-lg xpo_font-medium hover:xpo_bg-blue-700 xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2"
                        >
                          <Truck className="xpo_w-4 xpo_h-4" />
                          {__('Track', 'site-core')}
                        </button>
                      )}
                      
                      {canRefund && (
                        <button
                          onClick={() => setPopup(<RefundModal order={order} />)}
                          className="xpo_px-4 xpo_py-2 xpo_bg-red-600 xpo_text-scwhite xpo_rounded-lg xpo_font-medium hover:xpo_bg-red-700 xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2"
                        >
                          <CreditCard className="xpo_w-4 xpo_h-4" />
                          {__('Refund', 'site-core')}
                        </button>
                      )}
                      
                      {canReturn && (
                        <button
                          onClick={() => setPopup(<RefundModal order={order} />)}
                          className="xpo_px-4 xpo_py-2 xpo_bg-orange-600 xpo_text-scwhite xpo_rounded-lg xpo_font-medium hover:xpo_bg-orange-700 xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2"
                        >
                          <Package className="xpo_w-4 xpo_h-4" />
                          {__('Return', 'site-core')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-12 xpo_text-center">
                  <div className="xpo_w-16 xpo_h-16 xpo_bg-gray-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-4">
                    <Package className="xpo_w-8 xpo_h-8 xpo_text-gray-400" />
                  </div>
                  <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('No Orders Found', 'site-core')}</h3>
                  <p className="xpo_text-gray-600 xpo_mb-6">{__("You haven't placed any orders yet.", 'site-core')}</p>
                  <Link 
                    to="/collections/special"
                    className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-scwhite xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-medium hover:xpo_bg-blue-700 xpo_transition-colors"
                  >
                    <Package className="xpo_w-4 xpo_h-4" />
                    {__('Start Shopping', 'site-core')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};