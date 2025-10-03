import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, CreditCard, Wallet, Apple, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import api from '../../services/api';
import { notify } from '@functions';

const SSL_CONFIG = {
  store_id: 'your_ssl_store_id',
  store_passwd: 'your_ssl_store_pass',
  currency: 'BDT',
};

const loadApplePayScript = () => {
  if (!window.ApplePaySession) {
    const script = document.createElement('script');
    script.src = 'https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js';
    document.head.appendChild(script);
  }
};

const loadGooglePayScript = () => {
  if (!window.google) {
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    document.head.appendChild(script);
  }
};

const loadSSLCommerzScript = () => {
  if (!window.SSLCOMMERZ) {
    const script = document.createElement('script');
    script.src = 'https://seamless-epay.sslcommerz.com/embed.min.js';
    document.head.appendChild(script);
  }
};

const CardPaymentForm = ({ orderId, onSuccess, onFailed }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post(`/payments/card/initiate/${orderId}`);
      const { client_secret } = data;

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'Customer Name' },
        },
      });

      if (error) {
        setError(error.message);
        onFailed({ reason: 'card_error', message: error.message });
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess({ paymentId: paymentIntent.id, amount: paymentIntent.amount, status: 'succeeded' });
      }
    } catch (err) {
      setError(err.message);
      onFailed({ reason: 'network_error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="xpo_space-y-6">
      <div className="xpo_p-4 xpo_bg-scwhite/50 dark:xpo_bg-scwhite-900/30 xpo_border xpo_border-gray-200 dark:xpo_border-scwhite-700 xpo_rounded-xl">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#374151',
                '::placeholder': {
                  color: '#9CA3AF',
                },
              },
              invalid: {
                color: '#EF4444',
              },
            },
          }}
        />
      </div>
      {error && (
        <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_p-3 xpo_bg-red-50 dark:xpo_bg-red-900/20 xpo_border xpo_border-red-200 dark:xpo_border-red-800 xpo_rounded-lg">
          <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-red-600 dark:xpo_text-red-400 xpo_flex-shrink-0" />
          <p className="xpo_text-sm xpo_text-red-600 dark:xpo_text-red-400">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="xpo_w-full xpo_bg-gradient-to-r xpo_from-scprimary xpo_to-scprimary-700 xpo_text-scwhite xpo_py-4 xpo_rounded-xl xpo_font-medium xpo_shadow-lg xpo_shadow-scprimary/30 hover:xpo_shadow-xl hover:xpo_shadow-scprimary/40 xpo_transition-all disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="xpo_w-5 xpo_h-5" />
            <span>Pay Securely</span>
          </>
        )}
      </button>
    </form>
  );
};

const PayPalPayment = ({ orderId, onSuccess, onFailed }) => {
  const createOrder = async () => {
    try {
      const { data } = await api.post(`/payments/paypal/initiate/${orderId}`);
      return data.id;
    } catch (err) {
      onFailed({ reason: 'paypal_init_error', message: err.message });
      return null;
    }
  };

  const onApprove = async (data) => {
    try {
      const { data: captureData } = await api.post(`/payments/paypal/capture/${orderId}`, { orderID: data.orderID });
      onSuccess({ paymentId: captureData.id, amount: captureData.purchase_units[0].amount.value, status: 'succeeded' });
    } catch (err) {
      onFailed({ reason: 'paypal_capture_error', message: err.message });
    }
  };

  return (
    <div className="xpo_space-y-4">
      <PayPalScriptProvider options={{ 'client-id': 'your_paypal_client_id', currency: 'USD', intent: 'capture' }}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => onFailed({ reason: 'paypal_error', message: err.message })}
          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

const ApplePayPayment = ({ orderId, onSuccess, onFailed, amount, currency }) => {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    loadApplePayScript();
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setAvailable(true);
    }
  }, []);

  const startPayment = async () => {
    setLoading(true);
    try {
      const { data: merchantSession } = await api.post(`/payments/apple-pay/validate/${orderId}`);
      
      const appleSession = new window.ApplePaySession(3, {
        countryCode: 'BD',
        currencyCode: currency || 'BDT',
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        merchantCapabilities: ['supports3DS'],
        total: { 
          label: 'Your Store', 
          amount: amount.toString()
        },
      });

      appleSession.onvalidatemerchant = (event) => {
        event.completeMerchantValidation(merchantSession);
      };

      appleSession.onpaymentauthorized = async (event) => {
        try {
          const { data } = await api.post(`/payments/apple-pay/process/${orderId}`, { 
            paymentData: event.payment.paymentData,
            token: event.payment.token 
          });

          if (data.success) {
            event.completePayment(window.ApplePaySession.STATUS_SUCCESS);
            onSuccess({ paymentId: data.paymentId, status: 'succeeded', method: 'apple_pay' });
          } else {
            event.completePayment(window.ApplePaySession.STATUS_FAILURE);
            onFailed({ reason: 'apple_pay_declined', message: 'Payment was declined' });
          }
        } catch (err) {
          event.completePayment(window.ApplePaySession.STATUS_FAILURE);
          onFailed({ reason: 'apple_pay_error', message: err.message });
        }
      };

      appleSession.oncancel = () => {
        onFailed({ reason: 'cancelled', message: 'Payment cancelled by user' });
      };

      appleSession.begin();
    } catch (err) {
      onFailed({ reason: 'apple_pay_error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!available) {
    return (
      <div className="xpo_p-6 xpo_bg-gray-50 dark:xpo_bg-scwhite-900/30 xpo_rounded-xl xpo_text-center">
        <Apple className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-3 xpo_text-gray-400" />
        <p className="xpo_text-gray-600 dark:xpo_text-gray-400">Apple Pay is not available on this device</p>
      </div>
    );
  }

  return (
    <button
      onClick={startPayment}
      disabled={loading}
      className="xpo_w-full xpo_bg-black xpo_text-scwhite xpo_py-4 xpo_rounded-xl xpo_font-medium xpo_shadow-lg hover:xpo_shadow-xl xpo_transition-all disabled:xpo_opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_gap-3"
    >
      {loading ? (
        <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
      ) : (
        <Apple className="xpo_w-6 xpo_h-6" />
      )}
      <span className="xpo_text-lg">{loading ? 'Processing...' : 'Pay with Apple Pay'}</span>
    </button>
  );
};

const GooglePayPayment = ({ orderId, onSuccess, onFailed, amount, currency }) => {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState(null);

  useEffect(() => {
    loadGooglePayScript();
    const timer = setTimeout(() => {
      if (window.google && window.google.payments) {
        const client = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });
        setPaymentsClient(client);
        setLoaded(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    if (!paymentsClient) return;
    setLoading(true);

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe',
              gatewayMerchantId: 'your_merchant_id'
            }
          }
        }],
        merchantInfo: {
          merchantId: 'your_google_merchant_id',
          merchantName: 'Your Store'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toString(),
          currencyCode: currency || 'BDT',
          countryCode: 'BD'
        }
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      const { data } = await api.post(`/payments/google-pay/process/${orderId}`, { 
        paymentToken: paymentData.paymentMethodData.tokenizationData.token 
      });

      if (data.success) {
        onSuccess({ paymentId: data.paymentId, status: 'succeeded', method: 'google_pay' });
      } else {
        onFailed({ reason: 'google_pay_declined', message: 'Payment was declined' });
      }
    } catch (err) {
      if (err.statusCode !== 'CANCELED') {
        onFailed({ reason: 'google_pay_error', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="xpo_flex xpo_justify-center xpo_py-8">
        <Loader2 className="xpo_w-8 xpo_h-8 xpo_animate-spin xpo_text-scprimary" />
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="xpo_w-full xpo_bg-scwhite xpo_text-gray-900 xpo_border-2 xpo_border-gray-300 xpo_py-4 xpo_rounded-xl xpo_font-medium xpo_shadow-lg hover:xpo_shadow-xl xpo_transition-all disabled:xpo_opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_gap-3"
    >
      {loading ? (
        <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
      ) : (
        <Smartphone className="xpo_w-6 xpo_h-6 xpo_text-blue-600" />
      )}
      <span className="xpo_text-lg">{loading ? 'Processing...' : 'Pay with Google Pay'}</span>
    </button>
  );
};

const SSLCommerzPayment = ({ orderId, onSuccess, onFailed, amount, customerData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSSLCommerzScript();
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    try {
      const { data } = await api.post(`/payments/sslcommerz/initiate/${orderId}`, {
        total_amount: amount,
        currency: SSL_CONFIG.currency,
        cus_name: customerData?.name || 'Customer',
        cus_email: customerData?.email || 'customer@example.com',
        cus_add1: customerData?.address || 'Address',
        cus_phone: customerData?.phone || 'Phone',
      });

      if (data.GatewayPageURL) {
        window.location.href = data.GatewayPageURL;
      } else if (data.status === 'success' && window.SSLCOMMERZ) {
        window.SSLCOMMERZ.open({
          ...data,
          onSuccess: (response) => {
            if (response.status === 'VALID' || response.status === 'VALIDATED') {
              onSuccess({ 
                paymentId: response.tran_id, 
                amount: response.amount, 
                status: 'succeeded',
                method: 'sslcommerz'
              });
            }
          },
          onFailed: (response) => {
            onFailed({ reason: 'sslcommerz_failed', message: response.failedreason || 'Payment failed' });
          },
          onCancel: () => {
            onFailed({ reason: 'cancelled', message: 'Payment cancelled by user' });
          }
        });
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      onFailed({ reason: 'sslcommerz_init_error', message: err.message });
    }
  };

  if (error) {
    return (
      <div className="xpo_p-6 xpo_bg-red-50 dark:xpo_bg-red-900/20 xpo_rounded-xl xpo_text-center">
        <AlertCircle className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-3 xpo_text-red-600 dark:xpo_text-red-400" />
        <p className="xpo_text-red-600 dark:xpo_text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="xpo_space-y-6">
      <div className="xpo_text-center xpo_py-8">
        <Loader2 className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-4 xpo_animate-spin xpo_text-scprimary" />
        <p className="xpo_text-gray-600 dark:xpo_text-gray-400">Redirecting to SSLCommerz payment gateway...</p>
        <p className="xpo_text-sm xpo_text-gray-500 dark:xpo_text-gray-500 xpo_mt-2">Please wait</p>
      </div>
    </div>
  );
};

const PaymentComponent = ({ method, orderId, amount, currency, customerData, onSuccess, onFailed }) => {
  const stripePromise = useRef(null);

  useEffect(() => {
    // stripePromise.current = loadStripe('pk_test_your_stripe_publishable_key_here');
  }, []);
  
  const getMethodIcon = () => {
    switch (method) {
      case 'card': return CreditCard;
      case 'paypal': return Wallet;
      case 'apple': return Apple;
      case 'google': return Smartphone;
      default: return CreditCard;
    }
  };

  const getMethodName = () => {
    switch (method) {
      case 'card': return 'Card Payment';
      case 'paypal': return 'PayPal';
      case 'apple': return 'Apple Pay';
      case 'google': return 'Google Pay';
      case 'sslcommerz': return 'SSLCommerz';
      default: return 'Payment';
    }
  };

  const renderPaymentMethod = () => {
    switch (method) {
      case 'card':
        return (
          <Elements stripe={stripePromise.current}>
            <CardPaymentForm orderId={orderId} onSuccess={onSuccess} onFailed={onFailed} />
          </Elements>
        );
      case 'paypal':
        return <PayPalPayment orderId={orderId} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'apple':
        return <ApplePayPayment orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'google':
        return <GooglePayPayment orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'sslcommerz':
        return <SSLCommerzPayment orderId={orderId} amount={amount} customerData={customerData} onSuccess={onSuccess} onFailed={onFailed} />;
      default:
        return (
          <div className="xpo_p-6 xpo_bg-red-50 dark:xpo_bg-red-900/20 xpo_rounded-xl xpo_text-center">
            <AlertCircle className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-3 xpo_text-red-600" />
            <p className="xpo_text-red-600">Unsupported payment method</p>
          </div>
        );
    }
  };

  const Icon = getMethodIcon();

  return (
    <div className="xpo_w-full xpo_max-w-lg">
      <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6 xpo_pb-4 xpo_border-b xpo_border-gray-200 dark:xpo_border-scwhite-700">
        <div className="xpo_flex xpo_items-center xpo_gap-3">
          <div className="xpo_p-2 xpo_bg-scprimary/10 xpo_rounded-xl">
            <Icon className="xpo_w-6 xpo_h-6 xpo_text-scprimary" />
          </div>
          <div>
            <h3 className="xpo_text-xl xpo_font-bold xpo_text-gray-900 dark:xpo_text-scwhite">{getMethodName()}</h3>
            <p className="xpo_text-sm xpo_text-gray-600 dark:xpo_text-gray-400">Complete your payment securely</p>
          </div>
        </div>
        {/* <button 
          onClick={() => onFailed({ reason: 'cancelled', message: 'Payment cancelled' })} 
          className="xpo_p-2 hover:xpo_bg-gray-100 dark:hover:xpo_bg-scwhite-800 xpo_rounded-lg xpo_transition-colors"
        >
          <X className="xpo_w-5 xpo_h-5 xpo_text-gray-500 dark:xpo_text-gray-400" />
        </button> */}
      </div>

      <div className="xpo_mb-6">
        {renderPaymentMethod()}
      </div>

      <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_p-4 xpo_bg-blue-50 dark:xpo_bg-blue-900/20 xpo_border xpo_border-blue-200 dark:xpo_border-blue-800 xpo_rounded-xl">
        <CheckCircle className="xpo_w-5 xpo_h-5 xpo_text-blue-600 dark:xpo_text-blue-400 xpo_flex-shrink-0" />
        <p className="xpo_text-sm xpo_text-blue-900 dark:xpo_text-blue-300">Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default PaymentComponent;