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
// import PaymentComponent from '../components/cart/PaymentComponent';

export default function PageBody() {
  return (
    <div>
      <SiteHeader />
      <div className="bg-scwhite-50 relative min-h-screen py-8">
        <div className="container mx-auto">
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
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-scprimary" />
      </div>
    );
  }

  if (!order || !orderId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">{__('Payment link not valid', 'site-core')}</h1>
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

  const customerData = {
    name: `${order.billing_address?.firstName || ''} ${order.billing_address?.lastName || ''}`.trim() || order.billing_address?.name || 'Customer',
    email: order.billing_address?.email || '',
    phone: order.billing_address?.phone || '',
    address: order.billing_address?.address || ''
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>{__('Back to Home', 'site-core')}</span>
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{__('Complete Payment', 'site-core')}</h1>
        <p className="text-lg text-gray-600">{__('You are paying for order #')} <span className="font-semibold">{order.id}</span></p>
        <p className="text-sm text-gray-500 mt-2">
          {__('Amount due:')} <span className="font-bold text-scprimary">{money(total)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-scwhite rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-gray-700" />
              {__('Order Items', 'site-core')}
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.product_name}</h3>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity} × {money(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{money(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-scwhite rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-gray-700" />
              {__('Recipient Information', 'site-core')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">{customerData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">{customerData.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-gray-900 font-medium">{customerData.name}</p>
                  <p className="text-gray-600 text-sm">{customerData.address}</p>
                  <p className="text-gray-600 text-sm">{order.shipping_address?.city || order.billing_address?.city}, {order.shipping_address?.zipCode || order.billing_address?.zipCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-scwhite rounded-2xl shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{__('Payment Summary', 'site-core')}</h2>

          <div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Subtotal', 'site-core')}</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Shipping', 'site-core')}</span>
              <span className="font-medium">{shipping === 0 ? __('Free', 'site-core') : money(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{__('Tax', 'site-core')}</span>
              <span className="font-medium">{money(tax)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">{__('Total', 'site-core')}</span>
              <span className="text-gray-900">{money(total)}</span>
            </div>
          </div>

          <div className="bg-scwhite/70 rounded-2xl border border-gray-200 p-4 mb-4">
            {/* <PaymentComponent
              method={order.payment_method || 'card'}
              orderId={order.id}
              amount={total}
              currency={order.currency || appCurrency}
              customerData={customerData}
              onSuccess={handlePaymentSuccess}
              onFailed={handlePaymentFailed}
            /> */}
          </div>

          {processing && (
            <div className="text-center p-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">{__('Finalizing order...', 'site-core')}</p>
            </div>
          )}

          <div className="text-center mt-4 text-xs text-gray-500">
            <p>{__('Secure payment powered by Stripe, PayPal, and more')}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {__('Or continue shopping without paying', 'site-core')}
        </Link>
      </div>
    </div>
  );
};
