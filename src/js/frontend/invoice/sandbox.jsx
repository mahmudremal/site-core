import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Sandbox = ({ publicKey = null, bgImage = '' }) => {
  const cardRef = useRef(null);
  const [tap, setTap] = useState(null);
  const [elements, setElements] = useState(null);
  const [card, setCard] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: 'ae',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceError, setInvoiceError] = useState(null);
  const [successUrl, setSuccessUrl] = useState(null);
  const [showCardForm, setShowCardForm] = useState(true);
  const [provider, setProvider] = useState('tap');
  const [popup, setPopup] = useState(null);

  const invoiceId = window.location.pathname.split('/')[2];

  useEffect(() => {
    axios.get(`/wp-json/sitecore/v1/invoice/${invoiceId}`)
      .then(res => {
        const data = res?.data ?? res;
        if (data && !data.code) {
          setInvoiceData(data);
          switch (data?.status) {
            case 'unpaid':
              // setInvoiceData(data);
              break;
            case 'void':
              setInvoiceError('Invoice voided');
              break;
            case 'expired':
              setInvoiceError('Invoice expired');
              break;
            case 'paid':
              setInvoiceError('Invoice has beed paid');
              break;
            default:
              break;
          }
        } else {
          setError(res.data.message || 'Failed to load invoice');
        }
      })
      .catch(() => setError('Failed to load invoice'));
  }, [invoiceId]);

  useEffect(() => {
    if (showCardForm && invoiceData) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js";
      script.async = true;
      document.body.appendChild(script);

      const tapScript = document.createElement("script");
      tapScript.src = "https://secure.gosell.io/js/sdk/tap.min.js";
      tapScript.async = true;
      tapScript.onload = initializeTap;
      document.body.appendChild(tapScript);

      return () => {
        document.body.removeChild(script);
        document.body.removeChild(tapScript);
      };
    }
  }, [showCardForm, invoiceData]);

  useEffect(() => {
    if (successUrl) {
      const win = window.open(successUrl, '_blank', 'width=600,height=800');
      const checkClosed = setInterval(() => {
        if (win?.closed) {
          clearInterval(checkClosed);
          // Verify transaction
          // request(rest_url(`/sitecore/v1/payment/verify/tap/${transactionId}`))
          // .then(verify => {
          //     if (verify?.success) {
          //         setPopup(
          //             <div className="text-center p-8">
          //                 <span className="w-100-px h-100-px bg-success-600 rounded-circle d-inline-flex justify-content-center items-center text-2xxl mb-32 text-white">
          //                     <Check />
          //                 </span>
          //                 <h5 className="mb-8 text-2xl">{__('Payment Successful')}</h5>
          //                 <p className="text-neutral-500 mb-0">{__('Thank you for your payment!')}</p>
          //             </div>
          //         );
          //     } else {
          //         setPopup(
          //             <div className="text-center p-8">
          //                 <span className="w-100-px h-100-px bg-danger-600 rounded-circle d-inline-flex justify-content-center items-center text-2xxl mb-32 text-white">
          //                     <X />
          //                 </span>
          //                 <h5 className="mb-8 text-2xl">{__('Payment Failed')}</h5>
          //                 <p className="text-neutral-500 mb-0">{__('The transaction could not be completed.')}</p>
          //             </div>
          //         );
          //     }
          // })
          // .catch(() => {
          //     setPopup(
          //         <div className="text-center p-8">
          //             <h5 className="mb-8 text-2xl">{__('Error')}</h5>
          //             <p className="text-neutral-500">{__('Failed to verify payment. Please try again.')}</p>
          //         </div>
          //     );
          // });
        }
      }, 500);
    }
  }, [successUrl]);

  const initializeTap = () => {
    if (!window.Tapjsli || !publicKey) {
      setError('Payment system is not initialized. Please refresh the page.');
      return;
    }

    try {
      const tapInstance = window.Tapjsli(publicKey);
      const elementsInstance = tapInstance.elements({
        currencyCode: invoiceData?.currency ?? 'SAR',
        locale: 'en',
      });

      const cardElement = elementsInstance.create(
        'card',
        {
          style: {
            base: {
              color: '#333',
              fontSize: '16px',
            },
          }
        },
        {
          currencyCode: ["KWD", "USD", "SAR"],
          labels: {
            cardNumber: "Card Number",
            expirationDate: "MM/YY",
            cvv: "CVV",
            cardHolder: "Card Holder Name"
          },
          TextDirection: 'ltr',
          paymentAllowed: 'all', // ['VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'MADA']
        }
      );

      // cardElement.mount(cardRef.current); it not working. it need valid selector
      cardElement.mount('#tap-element-container');
      setTap(tapInstance);
      setElements(elementsInstance);
      setCard(cardElement);
    } catch (err) {
      console.error('Tap initialization failed:', err);
      setError('Could not load card payment. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
      countryCode: country.countryCode
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessUrl(null);

    try {
      if (!card) {
        setError('Card form not initialized.');
        return;
      }
      const { id: tokenId, error: tokenError } = await createToken(card);
      if (tokenError) throw new Error(tokenError.message);

      const payload = {
        ...formData,
        cardToken: tokenId,
        provider
      };

      const response = await axios.post(`/wp-json/sitecore/v1/invoice/${invoiceId}/pay`, payload);

      if (response.data && response.data.payment_url) {
        setSuccessUrl(response.data.payment_url);
      } else {
        throw new Error('Unexpected response from server.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (error && !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'unset' }}>
      <div
        // id="bookContainer"
        // onClick={(event) => event.target.parentElement.classList.toggle('closed')}
        className="bg-white shadow-2xl rounded-xl max-w-3xl w-full flex flex-col md:flex-row"
      >
        {invoiceError ?
          <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
            <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-300 mb-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mt-1 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 5.07a10 10 0 1113.86 13.86A10 10 0 015.07 5.07z" />
                </svg>
                <span>{invoiceError}</span>
              </div>
            </div>
          </div>
          :
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6">Complete Your Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} />
                <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
              </div>
              <input className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} />
              <PhoneInput
                country={formData.countryCode}
                value={formData.phone}
                onChange={handlePhoneChange}
                containerClass="w-full"
                inputClass="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block !w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                enableSearch
              />
              <div>
                <label className="block mb-1 font-medium">Card Details</label>
                <div ref={cardRef} id="tap-element-container" className="p-3 border rounded bg-gray-50" />
              </div>
              {error && <div className="text-red-600">{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </form>

            {successUrl && (
              <div className="mt-4">
                <a href={successUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Click here to complete payment
                </a>
              </div>
            )}
          </div>
        }

        {invoiceData && (
          <div
            // id="rightPage"
            className="w-full md:w-1/2 bg-gray-50 p-8 border-l"
          >
            <h3 className="text-xl font-semibold mb-4">Invoice Summary</h3>
            <ul className="space-y-2">
              {(invoiceData.items ?? []).map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.label}</span>
                  <span>{item.price} {invoiceData.currency}</span>
                </li>
              ))}
            </ul>
            <div className="border-t mt-4 pt-4 text-right font-bold">
              Total: {invoiceData.total} {invoiceData.currency}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sandbox;
