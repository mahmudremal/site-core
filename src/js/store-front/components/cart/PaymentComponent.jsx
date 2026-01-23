import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, CreditCard, Wallet, Apple, Smartphone, CheckCircle, AlertCircle, DollarSignIcon } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-scwhite/50 dark:bg-scwhite-900/30 border border-gray-200 dark:border-scwhite-700 rounded-xl">
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
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-scprimary to-scprimary-700 text-scwhite py-4 rounded-xl font-medium shadow-lg shadow-scprimary/30 hover:shadow-xl hover:shadow-scprimary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
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
    <div className="space-y-4">
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
      <div className="p-6 bg-gray-50 dark:bg-scwhite-900/30 rounded-xl text-center">
        <Apple className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">Apple Pay is not available on this device</p>
      </div>
    );
  }

  return (
    <button
      onClick={startPayment}
      disabled={loading}
      className="w-full bg-black text-scwhite py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Apple className="w-6 h-6" />
      )}
      <span className="text-lg">{loading ? 'Processing...' : 'Pay with Apple Pay'}</span>
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
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-scprimary" />
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-scwhite text-gray-900 border-2 border-gray-300 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Smartphone className="w-6 h-6 text-blue-600" />
      )}
      <span className="text-lg">{loading ? 'Processing...' : 'Pay with Google Pay'}</span>
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
        cus_name: customerData?.name || '',
        cus_email: customerData?.email || '',
        cus_phone: customerData?.phone || '',
        cus_add1: customerData?.address || '',
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
      setLoading(false);
      setError(err.message);
      // onFailed({ reason: 'sslcommerz_init_error', message: err.message });
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-600 dark:text-red-400" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-scprimary" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting to SSLCommerz payment gateway...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait</p>
      </div>
    </div>
  );
};

const PaymentComponent = ({ method, orderId, amount, currency, customerData, onSuccess, onFailed }) => {
  const stripePromise = useRef(null);

  useEffect(() => {
    stripePromise.current = loadStripe('pk_test_your_stripe_publishable_key_here');
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
      case 'cod': return 'Cash On Delivery (COD)';
      default: return 'Payment';
    }
  };

  const renderPaymentMethod = () => {
    switch (method) {
      case 'card':
        return (
          <Elements stripe={stripePromise.current}>
            <CardPaymentForm orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
          </Elements>
        );
      case 'paypal':
        return <PayPalPayment orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'apple':
        return <ApplePayPayment orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'google':
        return <GooglePayPayment orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'sslcommerz':
        return <SSLCommerzPayment customerData={customerData} orderId={orderId} amount={amount} currency={currency} onSuccess={onSuccess} onFailed={onFailed} />;
      case 'cod':
        return (
          <div className="p-6 bg-scaccent-50 dark:bg-scaccent-900/20 rounded-xl text-center">
            <DollarSignIcon className="w-12 h-12 mx-auto mb-3 text-scaccent-600" />
            <p className="text-scaccent-600">Pay upon delivery</p>
          </div>
        );
      default:
        return (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-600" />
            <p className="text-red-600">Unsupported payment method {method}</p>
          </div>
        );
    }
  };

  const Icon = getMethodIcon();

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-scwhite-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-scprimary/10 rounded-xl">
            <Icon className="w-6 h-6 text-scprimary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-scprimary">{getMethodName()}</h3>
            <p className="text-sm text-gray-600 dark:text-scprimary-600">Complete your payment securely</p>
          </div>
        </div>
        {/* <button 
          onClick={() => onFailed({ reason: 'cancelled', message: 'Payment cancelled' })} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-scwhite-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button> */}
      </div>

      <div className="mb-6">
        {renderPaymentMethod()}
      </div>

      <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-900 flex-shrink-0" />
        <p className="text-sm text-blue-900 dark:text-blue-900">Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default PaymentComponent;