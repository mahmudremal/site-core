import { CheckCircle, Package, Truck, CreditCard, ArrowLeft, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { useCurrency } from '../hooks/useCurrency';
import { useLocale } from '../hooks/useLocale';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { notify } from '@functions';
import PaymentComponent from '../components/cart/PaymentComponent';

export default function PageBody() {
  return (
    <div>
      <SiteHeader />
      <div className="xpo_bg-scwhite-50 xpo_relative xpo_min-h-screen xpo_py-8">
        <div className="xpo_container xpo_mx-auto">
          <SharedPayment />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export const SharedPayment = () => {
  const { __ } = useLocale();
  const { money, currency: appCurrency } = useCurrency();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    api.get(`/orders/${orderId}`)
      .then(res => res.data)
      .then(data => {
        if (data && data.status === 'draft') {
          setOrder(data);
        } else {
          notify.error(__('Order is not available for payment', 'site-core'));
        }
      })
      .catch(err => notify.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePaymentSuccess = async (paymentInfo) => {
    setProcessing(true);
    try {
      await api.post(`/orders/${order.id}/complete`, { paymentInfo });
      notify.success(__('Payment successful! Order confirmed.', 'site-core'));
      window.location.href = '/order-confirmation?orderId=' + order.id;
    } catch (err) {
      notify.error(err.response?.data?.message || __('Payment completion failed', 'site-core'));
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentFailed = (error) => {
    notify.error(error.message || __('Payment failed', 'site-core'));
  };

  if (loading) {
    return (
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_min-h-96">
        <Loader2 className="xpo_w-8 xpo_h-8 xpo_animate-spin xpo_text-scprimary" />
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="xpo_text-center xpo_py-12">
        <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{__('Payment link not valid', 'site-core')}</h1>
        <Link to="/" className="xpo_mt-4 xpo_inline-block xpo_text-scprimary xpo_hover:underline">
          {__('Continue Shopping', 'site-core')}
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity)), 0);
  const shipping = parseFloat(order.shipping || 0);
  const tax = parseFloat(order.tax || 0);
  const total = parseFloat(order.total || 0);

  const customerData = {
    name: `${order.billing_address?.firstName || ''} ${order.billing_address?.lastName || ''}`.trim() || order.billing_address?.name || 'Customer',
    email: order.billing_address?.email || '',
    phone: order.billing_address?.phone || '',
    address: order.billing_address?.address || ''
  };

  return (
    <div className="xpo_max-w-4xl xpo_mx-auto xpo_px-4">
      <div className="xpo_mb-8">
        <Link to="/" className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-600 hover:xpo_text-gray-900 xpo_transition-colors">
          <ArrowLeft className="xpo_w-5 xpo_h-5" />
          <span>{__('Back to Home', 'site-core')}</span>
        </Link>
      </div>

      <div className="xpo_text-center xpo_mb-8">
        <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-4">{__('Complete Payment', 'site-core')}</h1>
        <p className="xpo_text-lg xpo_text-gray-600">{__('You are paying for order #')} <span className="xpo_font-semibold">{order.id}</span></p>
        <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-2">
          {__('Amount due:')} <span className="xpo_font-bold xpo_text-scprimary">{money(total)}</span>
        </p>
      </div>

      <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-8 xpo_mb-8">
        <div className="lg:xpo_col-span-2">
          <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_mb-6">
            <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6 xpo_flex xpo_items-center xpo_gap-3">
              <Package className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
              {__('Order Items', 'site-core')}
            </h2>
            <div className="xpo_space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="xpo_flex xpo_gap-4 xpo_items-center xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-lg">
                  <div className="xpo_w-16 xpo_h-16 xpo_bg-gray-100 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
                    <Package className="xpo_w-8 xpo_h-8 xpo_text-gray-500" />
                  </div>
                  <div className="xpo_flex-1">
                    <h3 className="xpo_font-medium xpo_text-gray-900 xpo_text-sm">{item.product_name}</h3>
                    <p className="xpo_text-gray-600 xpo_text-sm">Qty: {item.quantity} × {money(item.price)}</p>
                  </div>
                  <div className="xpo_text-right">
                    <p className="xpo_font-medium">{money(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
            <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6 xpo_flex xpo_items-center xpo_gap-3">
              <User className="xpo_w-6 xpo_h-6 xpo_text-gray-700" />
              {__('Recipient Information', 'site-core')}
            </h2>
            <div className="xpo_space-y-3">
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <Mail className="xpo_w-5 xpo_h-5 xpo_text-gray-500" />
                <span className="xpo_text-gray-600">{customerData.email}</span>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <Phone className="xpo_w-5 xpo_h-5 xpo_text-gray-500" />
                <span className="xpo_text-gray-600">{customerData.phone}</span>
              </div>
              <div className="xpo_flex xpo_items-start xpo_gap-3">
                <MapPin className="xpo_w-5 xpo_h-5 xpo_text-gray-500 xpo_mt-1" />
                <div>
                  <p className="xpo_text-gray-900 xpo_font-medium">{customerData.name}</p>
                  <p className="xpo_text-gray-600 xpo_text-sm">{customerData.address}</p>
                  <p className="xpo_text-gray-600 xpo_text-sm">{order.shipping_address?.city || order.billing_address?.city}, {order.shipping_address?.zipCode || order.billing_address?.zipCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_sticky xpo_top-8">
          <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 xpo_mb-6">{__('Payment Summary', 'site-core')}</h2>
          
          <div className="xpo_space-y-3 xpo_mb-6 xpo_border-t xpo_border-gray-200 xpo_pt-6">
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span className="xpo_font-medium">{money(subtotal)}</span>
            </div>
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Shipping', 'site-core')}</span>
              <span className="xpo_font-medium">{shipping === 0 ? __('Free', 'site-core') : money(shipping)}</span>
            </div>
            <div className="xpo_flex xpo_justify-between xpo_text-sm">
              <span className="xpo_text-gray-600">{__('Tax', 'site-core')}</span>
              <span className="xpo_font-medium">{money(tax)}</span>
            </div>
          </div>
          
          <div className="xpo_border-t xpo_border-gray-200 xpo_pt-4 xpo_mb-6">
            <div className="xpo_flex xpo_justify-between xpo_text-lg xpo_font-bold">
              <span className="xpo_text-gray-900">{__('Total', 'site-core')}</span>
              <span className="xpo_text-gray-900">{money(total)}</span>
            </div>
          </div>

          <div className="xpo_bg-scwhite/70 xpo_rounded-2xl xpo_border xpo_border-gray-200 xpo_p-4 xpo_mb-4">
            <PaymentComponent
              method={order.payment_method || 'card'}
              orderId={order.id}
              amount={total}
              currency={order.currency || appCurrency}
              customerData={customerData}
              onSuccess={handlePaymentSuccess}
              onFailed={handlePaymentFailed}
            />
          </div>

          {processing && (
            <div className="xpo_text-center xpo_p-4">
              <Loader2 className="xpo_w-6 xpo_h-6 xpo_animate-spin xpo_mx-auto xpo_mb-2" />
              <p className="xpo_text-sm xpo_text-gray-600">{__('Finalizing order...', 'site-core')}</p>
            </div>
          )}

          <div className="xpo_text-center xpo_mt-4 xpo_text-xs xpo_text-gray-500">
            <p>{__('Secure payment powered by Stripe, PayPal, and more')}</p>
          </div>
        </div>
      </div>

      <div className="xpo_text-center xpo_mb-8">
        <Link
          to="/"
          className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_text-gray-600 hover:xpo_text-gray-900 xpo_transition-colors"
        >
          {__('Or continue shopping without paying', 'site-core')}
        </Link>
      </div>
    </div>
  );
};
