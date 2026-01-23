import { CheckCircle, Package, Truck, CreditCard, ArrowLeft, Home } from 'lucide-react';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useCurrency } from '../hooks/useCurrency';
import { useLocale } from '../hooks/useLocale';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { notify } from '@functions';
import { sprintf } from 'sprintf-js';
// import PaymentComponent from '../components/cart/PaymentComponent';

export default function PageBody() {
  return (
    <div>
      <SiteHeader />
      <div className="container relative mx-auto px-4 py-8 z-10">
        <OrderConfirmation />
      </div>
      <SiteFooter />
    </div>
  )
}

export const OrderConfirmation = () => {
  const { __ } = useLocale();
  const { order_id } = useParams();
  const { money, currency } = useCurrency();
  const { theme } = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order_id) {
      api.get(`/orders/${order_id}`)
        .then(res => res.data)
        .then(data => setOrder(data))
        .catch(err => notify.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [order_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-4 border-scprimary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-scwhite-600">{__('Order not found', 'site-core')}</h1>
        <Link to="/" className="mt-4 inline-block text-scprimary hover:underline">
          {__('Continue Shopping', 'site-core')}
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const shipping = parseFloat(order.shipping || 0);
  const tax = parseFloat(order.tax || 0);
  const total = parseFloat(order.total || 0);

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-scwhite-600 hover:text-gray-900 dark:hover:text-scwhite-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>{__('Back to Home', 'site-core')}</span>
        </Link>
      </div>

      <div className="text-center mb-12">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-scwhite-600 mb-2">{__('Order Confirmed!', 'site-core')}</h1>
        <p className="text-lg text-gray-600 dark:text-scwhite-600">{__('Thank you for your purchase. Your order has been confirmed.', 'site-core')}</p>
        <p className="text-sm text-gray-500 dark:text-scwhite-600 mt-2">
          {__('Order ID:', 'site-core')} <span className="font-semibold text-gray-900 dark:text-scwhite-600">#{order.id}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-scprimary-600 mb-6 flex items-center gap-3">
            <Package className="w-6 h-6" />
            {__('Order Details', 'site-core')}
          </h2>
          <div className="space-y-4">
            {order.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex justify-between items-center border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="text-md text-gray-900 dark:text-scprimary-600">{item?.title ?? item.product_name}</p>
                  <p className="text-sm text-gray-600">{sprintf(__('Qty: %d', 'site-core'), item.quantity || 1)}</p>
                </div>
                <p className="font-medium">{money(item.price * item.quantity || 1)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-scprimary-600 mb-6 flex items-center gap-3">
            <Truck className="w-6 h-6" />
            {__('Delivery Information', 'site-core')}
          </h2>
          <div className="space-y-3">
            <p className="text-gray-900 dark:text-scwhite-600 font-medium">{order.shipping_data?.name || `${order.billing_address?.firstName || ''} ${order.billing_address?.lastName || ''}`}</p>
            <p className="text-gray-600">{order.shipping_data?.address || order.billing_address?.address || ''}</p>
            <p className="text-gray-600">{order.shipping_data?.city || order.billing_address?.city || ''}, {order.shipping_data?.zipCode || order.billing_address?.zipCode || ''}</p>
            <p className="text-gray-600">{order.shipping_data?.phone || order.billing_address?.phone || ''}</p>
            <p className="text-sm text-gray-500 dark:text-scprimary-500 mt-2">
              {__('Estimated delivery: 5-7 business days', 'site-core')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-scwhite/70 rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-scprimary-600 mb-6">{__('Payment Summary', 'site-core')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="w-full p-4 border border-2 rounded-2xl">
            <div className="flex justify-between">
              <span className="text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{__('Shipping', 'site-core')}</span>
              <span>{money(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{__('Tax', 'site-core')}</span>
              <span>{money(tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
              <span>{__('Total', 'site-core')}</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <div className="w-full p-4 border border-2 rounded-2xl">
            <PaymentBlock order={order} />
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-scprimary-600">
          <p>{__('Paid with:', 'site-core')} <span className="font-medium capitalize text-gray-900 dark:text-scprimary-600">{order.payment_method}</span></p>
        </div>
      </div>

      <div className="text-center">
        <Link to="/collections/special" className="inline-flex items-center gap-2 bg-scprimary text-scwhite px-8 py-3 rounded-xl font-medium hover:bg-scprimary-800 transition-colors dark:border dark:border-2 border-solid border-scwhite">
          <Home className="w-5 h-5" />
          {__('Continue Shopping', 'site-core')}
        </Link>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-scwhite-500">
        <p>{__('You will receive an order confirmation email with all details shortly.', 'site-core')}</p>
        <p className="mt-2">{__('Need help? Contact our support team anytime.', 'site-core')}</p>
      </div>
    </div>
  );
};

const PaymentBlock = ({ order = {} }) => {
  return (
    <div>
      {/* Payment Block */}
      {/* <PaymentComponent
        method={order.payment_method}
        orderId={order.id}
        amount={order.total_amount}
        currency={order.currency}
        // customerData={{
        //   name: `${order.firstName} ${order.lastName}`,
        //   email: order.email,
        //   phone: order.phone,
        //   address: order.address
        // }}
        // onSuccess={(paymentInfo) => {
        //   api.post(`/orders/${orderRes.data.id}/complete`, { paymentInfo })
        //   .then(() => {
        //     notify.success(__('Order placed successfully!', 'site-core'));
        //     window.location.href = '/order-confirmation';
        //   })
        //   .catch(err => notify.error(err))
        //   .finally(() => setPopup(null));
        // }}
        // onFailed={(error) => {
        //   notify.error(error.message || __('Payment failed', 'site-core'));
        //   setPopup(null);
        // }}
      /> */}
    </div>
  )
}