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
import PaymentComponent from '../components/cart/PaymentComponent';

export default function PageBody() {
  return (
    <div>
      <SiteHeader />
      <div className="xpo_container xpo_relative xpo_mx-auto xpo_px-4 xpo_py-8 xpo_z-10">
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
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_min-h-96">
        <div className="xpo_animate-spin xpo_w-8 xpo_h-8 xpo_border-4 xpo_border-scprimary xpo_border-t-transparent xpo_rounded-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="xpo_text-center xpo_py-12">
        <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scwhite-600">{__('Order not found', 'site-core')}</h1>
        <Link to="/" className="xpo_mt-4 xpo_inline-block xpo_text-scprimary hover:xpo_underline">
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
    <div className="xpo_container xpo_mx-auto xpo_px-4">
      <div className="xpo_mb-8">
        <Link to="/" className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-600 dark:xpo_text-scwhite-600 hover:xpo_text-gray-900 dark:hover:xpo_text-scwhite-900 xpo_transition-colors">
          <ArrowLeft className="xpo_w-5 xpo_h-5" />
          <span>{__('Back to Home', 'site-core')}</span>
        </Link>
      </div>

      <div className="xpo_text-center xpo_mb-12">
        <div className="xpo_mx-auto xpo_w-20 xpo_h-20 xpo_bg-green-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mb-4">
          <CheckCircle className="xpo_w-12 xpo_h-12 xpo_text-green-600" />
        </div>
        <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scwhite-600 xpo_mb-2">{__('Order Confirmed!', 'site-core')}</h1>
        <p className="xpo_text-lg xpo_text-gray-600 dark:xpo_text-scwhite-600">{__('Thank you for your purchase. Your order has been confirmed.')}</p>
        <p className="xpo_text-sm xpo_text-gray-500 dark:xpo_text-scwhite-600 xpo_mt-2">
          {__('Order ID:')} <span className="xpo_font-semibold xpo_text-gray-900 dark:xpo_text-scwhite-600">#{order.id}</span>
        </p>
      </div>

      <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-8 xpo_mb-12">
        <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
          <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scprimary-600 xpo_mb-6 xpo_flex xpo_items-center xpo_gap-3">
            <Package className="xpo_w-6 xpo_h-6" />
            {__('Order Details', 'site-core')}
          </h2>
          <div className="xpo_space-y-4">
            {order.items.map((item, itemIndex) => (
              <div key={itemIndex} className="xpo_flex xpo_justify-between xpo_items-center xpo_border-b xpo_border-gray-200 xpo_pb-4 last:xpo_border-b-0 last:xpo_pb-0">
                <div>
                  <p className="xpo_text-md xpo_text-gray-900 dark:xpo_text-scprimary-600">{item?.title??item.product_name}</p>
                  <p className="xpo_text-sm xpo_text-gray-600">{sprintf(__('Qty: %d'), item.quantity || 1)}</p>
                </div>
                <p className="xpo_font-medium">{money(item.price * item.quantity || 1)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
          <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scprimary-600 xpo_mb-6 xpo_flex xpo_items-center xpo_gap-3">
            <Truck className="xpo_w-6 xpo_h-6" />
            {__('Delivery Information', 'site-core')}
          </h2>
          <div className="xpo_space-y-3">
            <p className="xpo_text-gray-900 dark:xpo_text-scwhite-600 xpo_font-medium">{order.shipping_data?.name || `${order.billing_address?.firstName || ''} ${order.billing_address?.lastName || ''}`}</p>
            <p className="xpo_text-gray-600">{order.shipping_data?.address || order.billing_address?.address || ''}</p>
            <p className="xpo_text-gray-600">{order.shipping_data?.city || order.billing_address?.city || ''}, {order.shipping_data?.zipCode || order.billing_address?.zipCode || ''}</p>
            <p className="xpo_text-gray-600">{order.shipping_data?.phone || order.billing_address?.phone || ''}</p>
            <p className="xpo_text-sm xpo_text-gray-500 dark:xpo_text-scprimary-500 xpo_mt-2">
              {__('Estimated delivery: 5-7 business days', 'site-core')}
            </p>
          </div>
        </div>
      </div>

      <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_mb-8">
        <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scprimary-600 xpo_mb-6">{__('Payment Summary', 'site-core')}</h2>
        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-8">
          <div className="xpo_w-full xpo_p-4 xpo_border xpo_border-2 xpo_rounded-2xl">
            <div className="xpo_flex xpo_justify-between">
              <span className="xpo_text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="xpo_flex xpo_justify-between">
              <span className="xpo_text-gray-600">{__('Shipping', 'site-core')}</span>
              <span>{money(shipping)}</span>
            </div>
            <div className="xpo_flex xpo_justify-between">
              <span className="xpo_text-gray-600">{__('Tax', 'site-core')}</span>
              <span>{money(tax)}</span>
            </div>
            <div className="xpo_border-t xpo_border-gray-200 xpo_pt-3 xpo_flex xpo_justify-between xpo_text-lg xpo_font-bold">
              <span>{__('Total', 'site-core')}</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <div className="xpo_w-full xpo_p-4 xpo_border xpo_border-2 xpo_rounded-2xl">
            <PaymentBlock order={order} />
          </div>
        </div>
        <div className="xpo_text-center xpo_mt-6 xpo_text-sm xpo_text-gray-500 dark:xpo_text-scprimary-600">
          <p>{__('Paid with:', 'site-core')} <span className="xpo_font-medium xpo_capitalize xpo_text-gray-900 dark:xpo_text-scprimary-600">{order.payment_method}</span></p>
        </div>
      </div>

      <div className="xpo_text-center">
        <Link to="/collections/special" className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_bg-scprimary xpo_text-scwhite xpo_px-8 xpo_py-3 xpo_rounded-xl xpo_font-medium hover:xpo_bg-scprimary-800 xpo_transition-colors dark:xpo_border dark:xpo_border-2 xpo_border-solid xpo_border-scwhite">
          <Home className="xpo_w-5 xpo_h-5" />
          {__('Continue Shopping', 'site-core')}
        </Link>
      </div>

      <div className="xpo_mt-12 xpo_text-center xpo_text-sm xpo_text-gray-500 dark:xpo_text-scwhite-500">
        <p>{__('You will receive an order confirmation email with all details shortly.')}</p>
        <p className="xpo_mt-2">{__('Need help? Contact our support team anytime.')}</p>
      </div>
    </div>
  );
};

const PaymentBlock = ({ order = {} }) => {
  return (
    <div>
      {/* Payment Block */}
      <PaymentComponent
        method={'card'}
        // method={order.payment_method}
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
      />
    </div>
  )
}