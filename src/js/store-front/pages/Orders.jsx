import { useEffect, useState } from 'react';
import { ChevronDown, Package, MapPin, Phone, User, Truck, CheckCircle, Clock, AlertCircle, ArrowLeft, X, RefreshCw, CreditCard, Star } from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { sleep, notify } from '@functions';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import { sprintf } from 'sprintf-js';
import { useAuth } from '../hooks/useAuth';
import { Dropdown } from '@banglee/core';
import OrdersPageHelmet from '../components/helmets/OrdersPageHelmet';
import api from '../services/api';

const ReturnsOrdersPage = () => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { setPopup } = usePopup();
  const { loggedin } = useAuth();
  const { purpose = 'history' } = useParams();
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // const orders = [
  //   {
  //     id: 'XPO-2024-001',
  //     date: '2024-09-15',
  //     status: 'completed',
  //     deliveredDate: '2024-09-18',
  //     total: 549.98,
  //     tax: 44.00,
  //     shipping: 0,
  //     items: [
  //       {
  //         id: 1,
  //         name: "Premium Wireless Headphones",
  //         price: 199.99,
  //         quantity: 1,
  //         image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"
  //       },
  //       {
  //         id: 2,
  //         name: "Ergonomic Office Chair",
  //         price: 349.99,
  //         quantity: 1,
  //         image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop"
  //       }
  //     ],
  //     deliveryMethod: 'Standard Delivery',
  //     deliveryAddress: {
  //       name: 'John Doe',
  //       address: '123 Main Street, Apt 4B',
  //       city: 'New York, NY 10001',
  //       phone: '+1 (555) 123-4567'
  //     }
  //   },
  //   {
  //     id: 'XPO-2024-002',
  //     date: '2024-09-12',
  //     status: 'fulfilled',
  //     total: 299.99,
  //     tax: 24.00,
  //     shipping: 9.99,
  //     items: [
  //       {
  //         id: 3,
  //         name: "Smart Fitness Watch",
  //         price: 299.99,
  //         quantity: 1,
  //         image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop"
  //       }
  //     ],
  //     deliveryMethod: 'Express Delivery',
  //     deliveryAddress: {
  //       name: 'John Doe',
  //       address: '123 Main Street, Apt 4B',
  //       city: 'New York, NY 10001',
  //       phone: '+1 (555) 123-4567'
  //     },
  //     trackingInfo: {
  //       currentLocation: {
  //         lat: 40.7128,
  //         lon: -74.0060,
  //         address: 'Distribution Center, Brooklyn, NY'
  //       },
  //       deliveryBoy: {
  //         name: 'Mike Johnson',
  //         phone: '+1 (555) 987-1234'
  //       },
  //       mapLink: 'https://maps.google.com/?q=40.7128,-74.0060'
  //     }
  //   },
  //   {
  //     id: 'XPO-2024-003',
  //     date: '2024-09-10',
  //     status: 'processing',
  //     total: 199.99,
  //     tax: 16.00,
  //     shipping: 0,
  //     items: [
  //       {
  //         id: 4,
  //         name: "Wireless Charging Pad",
  //         price: 49.99,
  //         quantity: 1,
  //         image: "https://images.unsplash.com/photo-1609792858004-21c9aab89cec?w=100&h=100&fit=crop"
  //       }
  //     ],
  //     deliveryMethod: 'Standard Delivery',
  //     deliveryAddress: {
  //       name: 'John Doe',
  //       address: '123 Main Street, Apt 4B',
  //       city: 'New York, NY 10001',
  //       phone: '+1 (555) 123-4567'
  //     }
  //   }
  // ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100',
          label: 'Pending',
          message: 'Your order has been received and is waiting to be processed.'
        };
      case 'processing':
        return {
          icon: RefreshCw,
          color: 'text-scaccent-600 bg-scaccent-100',
          label: 'Processing',
          message: 'We are preparing your order for shipment. This usually takes 1-2 business days.',
          attachment: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&h=200&fit=crop'
        };
      case 'fulfilled':
        return {
          icon: Truck,
          color: 'text-purple-600 bg-purple-100',
          label: 'Fulfilled',
          message: 'Your order has been shipped and is on its way to you!'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          label: 'Completed',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-100',
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
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-scwhite">{__('Order Tracking', 'site-core')}</h3>
        </div>

        <div className="bg-scwhite/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{sprintf(__('Order #%s', 'site-core'), order.order_number)}</h4>
              <p className="text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{statusInfo.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{__('Total:', 'site-core')}</span>
              <span className="font-semibold ml-1">{money(order.total_amount)}</span>
            </div>
            <div>
              <span className="text-gray-600">{__('Tax:', 'site-core')}</span>
              <span className="font-semibold ml-1">{money(order.tax_amount)}</span>
            </div>
            <div>
              <span className="text-gray-600">{__('Shipping:', 'site-core')}</span>
              <span className="font-semibold ml-1">{order.shipping === 0 ? __('Free', 'site-core') : money(order.shipping)}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h5 className="font-semibold text-gray-900 dark:text-scwhite mb-3">{__('Delivery Address', 'site-core')}</h5>
          <div className="bg-scwhite/70 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{order.shipping_data.name}</p>
                <p className="text-sm text-gray-600">{order.shipping_data.address}</p>
                <p className="text-sm text-gray-600">{order.shipping_data.city}</p>
                <p className="text-sm text-gray-600">{order.shipping_data.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-scwhite/70 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h6 className="font-semibold text-gray-900 mb-2">{statusInfo.label}</h6>
              <p className="text-gray-600 mb-4">{statusInfo.message}</p>

              {statusInfo.attachment && (
                <img src={statusInfo.attachment} alt={__('Order processing', 'site-core')} className="w-full h-32 object-cover rounded-lg mb-4" />
              )}

              {order.status === 'fulfilled' && order.trackingInfo && (
                <div className="space-y-4">
                  <div className="bg-scaccent-50 rounded-lg p-4">
                    <h6 className="font-semibold text-scaccent-900 mb-2">{__('Current Location', 'site-core')}</h6>
                    <p className="text-sm text-scaccent-700 mb-2">{order.trackingInfo.currentLocation.address}</p>
                    <a target="_blank" rel="noopener noreferrer" href={order.trackingInfo.mapLink} className="inline-flex items-center gap-2 text-sm text-scaccent-600 hover:text-scaccent-800">
                      <MapPin className="w-4 h-4" />
                      {__('View on Google Maps', 'site-core')}
                    </a>
                  </div>

                  <div className="bg-scwhite/50 rounded-lg p-4">
                    <h6 className="font-semibold text-gray-900 mb-2">{__('Delivery Contact', 'site-core')}</h6>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{order.trackingInfo.deliveryBoy.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{order.trackingInfo.deliveryBoy.phone}</span>
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
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isReturn ? __('Return Request', 'site-core') : __('Refund Request', 'site-core')}
            </h3>
          </div>

          <div className="bg-scwhite/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">{sprintf(__('Order #%s', 'site-core'), order.id)}</h4>
                <p className="text-sm text-gray-600">{sprintf(__('Placed on %s', 'site-core'), new Date(order.created_at).toLocaleDateString())}</p>
                {order.deliveredDate && (
                  <p className="text-sm text-gray-600">{sprintf(__('Delivered on %s', 'site-core'), new Date(order.deliveredDate).toLocaleDateString())}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-600">{__('Total:', 'site-core')}</span>
                <span className="font-semibold ml-1">{money(order.total_amount)}</span>
              </div>
              <div>
                <span className="text-gray-600">{__('Delivery:', 'site-core')}</span>
                <span className="font-semibold ml-1">{order.deliveryMethod}</span>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-scwhite/70 rounded-lg p-3">
                  <img
                    alt={item.name} src={item.image}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{item.name}</h5>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">{sprintf(__('Qty: %s', 'site-core'), item.quantity)}</span>
                      <span className="font-semibold text-gray-900">{money(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-red-600 text-scwhite py-4 px-6 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            {isReturn ? __('I want to get Return', 'site-core') : __('I want to get Refund', 'site-core')}
          </button>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-gray-900">
                {isReturn ? __('Select Items to Return', 'site-core') : __('Select Items to Refund', 'site-core')}
              </h3>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedItems.includes(item.id)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handleItemToggle(item.id)}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      className="w-5 h-5 text-red-600 rounded"
                    />
                  </div>
                  <img
                    alt={item.name} src={item.image}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">{sprintf(__('Quantity: %s', 'site-core'), item.quantity)}</span>
                      <span className="font-semibold text-gray-900">{money(item.price, item.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isReturn ? __('Reason for Return (Optional)', 'site-core') : __('Reason for Refund (Optional)', 'site-core')}
            </label>
            <textarea
              rows={4}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={isReturn ? __('Please tell us why you want to return these items...', 'site-core') : __('Please tell us why you want to refund these items...', 'site-core')}
            />
          </div>

          <button
            onClick={handleRefundSubmit}
            disabled={selectedItems.length === 0 || submitting}
            className={`w-full py-4 px-6 rounded-xl font-medium transition-colors ${selectedItems.length === 0 || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-scwhite hover:bg-red-700'
              }`}
          >
            {submitting ? __('Submitting Request...', 'site-core') : isReturn ? __('Submit Return Request', 'site-core') : __('Submit Refund Request', 'site-core')}
          </button>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{__('Request Submitted!', 'site-core')}</h3>
            <p className="text-gray-600">
              {__("I got your request. Shortly we'll review your request and further details will be sent to your email/phone SMS.", 'site-core')}
            </p>
          </div>

          <button
            onClick={() => setPopup(null)}
            className="w-full bg-gray-900 text-scwhite py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
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
      <div className="bg-scwhite/70 rounded-2xl shadow-lg p-8 text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 bg-scaccent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-scaccent-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{__('Track Your Order', 'site-core')}</h2>
          <p className="text-gray-600">{__('Enter your order ID to track your package', 'site-core')}</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            defaultValue={trackingOrderId}
            onChange={(e) => setTrackingOrderId(e.target.value)}
            placeholder={__('Enter Order ID (e.g., XPO-2024-001)', 'site-core')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-scaccent-500 focus:border-transparent"
          />

          <button
            onClick={handleTrackOrder}
            disabled={!trackingOrderId.trim() || submitting}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${!trackingOrderId.trim() || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-scaccent-600 text-scwhite hover:bg-scaccent-700'
              }`}
          >
            {submitting ? __('Tracking...', 'site-core') : __('Track Order', 'site-core')}
          </button>
        </div>
      </div>
    );
  };

  const OrdersTable = () => {
    return (
      <div className="bg-scwhite/70 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-700 uppercase tracking-wide">
            <div className="col-span-3">{__('Order Details', 'site-core')}</div>
            <div className="col-span-2">{__('Date', 'site-core')}</div>
            <div className="col-span-2">{__('Status', 'site-core')}</div>
            <div className="col-span-2">{__('Items', 'site-core')}</div>
            <div className="col-span-2">{__('Total', 'site-core')}</div>
            <div className="col-span-1">{__('Actions', 'site-core')}</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const daysSinceDelivery = getDaysSinceDelivery(order.deliveredDate);
            const canReturn = order.status === 'completed' && daysSinceDelivery <= 7;
            const canRefund = order.status !== 'completed';
            const canTrack = order.status !== 'completed';

            return (
              <div key={order.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-scaccent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-scaccent-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order?.order_number || ''}</h3>
                        <p className="text-sm text-gray-500">{order?.shipping_method || ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-sm">
                      <p className="text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                      {order.delivered_date && (
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3" />
                          {new Date(order.delivered_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <img
                            key={item.id}
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-md object-cover border-2 border-white shadow-sm"
                            style={{ zIndex: order.items.length - index }}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items.length === 1
                          ? __('1 item', 'site-core')
                          : sprintf(__('%s items', 'site-core'), order.items.length || '-')
                        }
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">{money(order.total_amount)}</p>
                      <p className="text-sm text-gray-500">
                        {__('Tax:', 'site-core')} {money(order.tax_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <Dropdown
                      button={
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      }
                    >
                      <div className="py-1 min-w-[160px]">
                        <button
                          onClick={() => setPopup(<TrackingModal order={order} />)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          {__('View Details', 'site-core')}
                        </button>

                        {canTrack && (
                          <button
                            onClick={() => setPopup(<TrackingModal order={order} />)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Truck className="w-4 h-4" />
                            {__('Track Order', 'site-core')}
                          </button>
                        )}

                        {(canRefund || canReturn) && (
                          <div className="border-t border-gray-100 my-1"></div>
                        )}

                        {canRefund && (
                          <button
                            onClick={() => setPopup(<RefundModal order={order} />)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            {__('Request Refund', 'site-core')}
                          </button>
                        )}

                        {canReturn && (
                          <button
                            onClick={() => setPopup(<RefundModal order={order} />)}
                            className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            {__('Request Return', 'site-core')}
                          </button>
                        )}

                        {order.status === 'completed' && (
                          <>
                            <div className="border-t border-gray-100 my-1"></div>
                            <Link to={`/reviews/${order.id}/`} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              {__('Rate Order', 'site-core')}
                            </Link>
                          </>
                        )}
                      </div>
                    </Dropdown>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{__('No Orders Found', 'site-core')}</h3>
            <p className="text-gray-600 mb-6">{__("You haven't placed any orders yet.", 'site-core')}</p>
            <Link
              to="/collections/special"
              className="inline-flex items-center gap-2 bg-scaccent-600 text-scwhite px-6 py-3 rounded-lg font-medium hover:bg-scaccent-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              {__('Start Shopping', 'site-core')}
            </Link>
          </div>
        )}
      </div>
    );
  };


  useEffect(() => {
    const delay = setTimeout(() => {
      api.get('orders').then(res => res.data)
        .then(data => setOrders(data))
        .catch(err => notify.error(err))
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delay);
  }, []);


  if (loading) {
    return (
      <div>Loading...</div>
    )
  }


  if (!loggedin) {
    return (
      <div className="py-12">
        <OrderTrackingForm />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <OrdersTable />

      {/* {orders.length === 0 && (
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{__('No Orders Found', 'site-core')}</h3>
          <p className="text-gray-600 mb-6">{__("You haven't placed any orders yet.", 'site-core')}</p>
          <Link 
            to="/collections/special"
            className="inline-flex items-center gap-2 bg-scaccent-600 text-scwhite px-6 py-3 rounded-lg font-medium hover:bg-scaccent-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            {__('Start Shopping', 'site-core')}
          </Link>
        </div>
      )} */}
    </div>
  );
};

export default function PageBody() {
  const { __ } = useLocale();
  return (
    <div>
      <SiteHeader />
      <div className="container relative m-auto z-10 pb-12 min-h-screen">
        <div className="flex items-center justify-between pt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-scwhite">{__('Returns & Orders', 'site-core')}</h1>
        </div>

        <OrdersPageHelmet />

        <ReturnsOrdersPage />

      </div>
      <SiteFooter />
    </div>

  )
}
