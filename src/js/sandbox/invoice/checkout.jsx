import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import logo from '@img/logo.png';
import { CheckCircle, ChevronDown, Loader, LockKeyhole, X, XCircle } from 'lucide-react';
import { createPopper } from '@popperjs/core';
import { sprintf } from 'sprintf-js';

const rest_url = (path) => {
  const baseUrl = window.location.origin;
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return `${baseUrl}/wp-json/${path}`;
}

const Checkout = ({ config }) => {
  const { bg: bgImage, pbk: publicKey, middlename: showMiddleName, emirate: showEmirate, city: showCity, overview: showOverview, phonecode: defaultPhonecode } = config
  const [tap, setTap] = useState(null);
  const [elements, setElements] = useState(null);
  const [card, setCard] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [packagesList, setPackagesList] = useState([]);
  const [tapJSLoaded, setTapJSLoaded] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    middleName: showMiddleName ? '' : null,
    lastName: '',
    address: '',
    city: showCity ? '' : null,
    emirate: showEmirate ? '' : null,
    email: '',
    phone: '',
    countryCode: defaultPhonecode
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceError, setInvoiceError] = useState(null);
  const [successUrl, setSuccessUrl] = useState(null);
  const [showCardForm, setShowCardForm] = useState(true);
  const [provider, setProvider] = useState('tap');
  const [popup, setPopup] = useState(null);
  const [gateways, setGateways] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const invoiceId = window.location.pathname.split('/')[2];

  const __ = (text) => text;
  
  const get_item_price = (item) => {
    const [_package, _plan] = item.identifier !== false ? item.identifier.split('->') : [null, null];
    const _package_obj = packagesList.find(p => p.id == _package);
    const amount = (item.type === 'custom' ? item.price : _package_obj?.pricing[_plan]??0);
    return parseFloat(amount).toFixed(2);
  }

  const get_item_label = (item) => {
    const [_package, _plan] = item.identifier !== false ? item.identifier.split('->') : [null, null];
    const _package_obj = packagesList.find(p => p.id == _package);
    const label = item.type === 'custom' ? item.label : _package_obj?.name + ' - ' + _package_obj?.packagefor;
    return label;
  }

  useEffect(() => {
    axios.get(rest_url(`/sitecore/v1/invoice/${invoiceId}`))
      .then(res => {
        const data = res?.data??res;
        if (data && !data.code) {
          setInvoiceData(data);
          setForm(data);
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

  // useEffect(() => {
  //   if (showCardForm && invoiceData && !tapJSLoaded) {
  //     // 

  //     return () => {
  //       document.body.removeChild(script);
  //       document.body.removeChild(tapScript);
  //     };
  //   }
  // }, [showCardForm, invoiceData]);

  useEffect(() => {
    if (successUrl) {
      const win = window.open(successUrl, '_blank', 'width=600,height=800');
      const checkClosed = setInterval(() => {
        if (win?.closed) {
          clearInterval(checkClosed);return;
        }
        try {
          if (win?.location?.origin == location.origin && win?.document) {
            const button = win.document.querySelector('[data-payment-object]');
            if (button) {
              const record = JSON.parse(atob(button.dataset.paymentObject + '='));
              const payment = record?.payment??{};
              console.log(payment)
              setPaymentStatus(payment);
              win.close();
              if (payment?.success) {
                setInvoiceError(__('Invoice has beed paid'));
              }
            }
          }
        } catch (error) {
          console.error('Cross-origin access error:', error);
        }
      }, 500);
    }
  }, [successUrl]);

  useEffect(() => {
    axios.get(rest_url(`/sitecore/v1/payment/gateways`))
    .then(res => res.data)
    .then(list => setGateways(Object.keys(list).map(id => ({id, ...list[id]}))))
    .catch(() => setError(__('Failed to load invoice')));
    axios.get(rest_url(`/sitecore/v1/contracts/packages`))
    .then(res => res.data)
    .then(list => setPackagesList(list.filter(l => Object.keys(l?.pricing??[])?.length)))
    .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      document.body.style.overflow = window.innerWidth >= 768 ? 'hidden' : 'auto';
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const load_tap_js = (element) => {
    if (!window.Tapjsli || !publicKey) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js";
      script.async = true;
      document.body.appendChild(script);
      // 
      const tapScript = document.createElement("script");
      tapScript.src = "https://secure.gosell.io/js/sdk/tap.min.js";
      tapScript.async = true;
      tapScript.onload = () => initializeTap(element);
      document.body.appendChild(tapScript);
    } else {
      initializeTap(element);
    }
  }
  
  const initializeTap = (element = false) => {
    if (!element) {
      setError(__('Card not yet initialized. Please refresh the page.'));
      return;
    }
    
    if (!window.Tapjsli || !publicKey) {
      setError(__('Payment system is not initialized. Please refresh the page.'));
      return;
    }

    // try {
    const tapInstance = window.Tapjsli(publicKey);
    const elementsInstance = tapInstance.elements({currencyCode: invoiceData?.currency??'AED', locale: 'en'});

    const cardElement = elementsInstance.create(
      'card',
      {
        style: {
          base: {
            color: '#333',
            fontSize: '16px',

            // background: 'transparent',
            // boxShadow: 'none',
            // padding: '0',
            // iconColor: 'transparent',
            // color: '#000',
            // fontSize: '16px',
            // fontFamily: 'inherit',

          },
        }
      },
      {
        currencyCode: 'all',
        labels : {
          cardNumber: __('Card Number'),
          expirationDate: __('MM/YY'),
          cvv: __('CVV'),
          cardHolder: __('Card Holder Name')
        },
        TextDirection:'ltr',
        paymentAllowed: 'all',
      }
    );

    element.id = `tap-element-${Math.random().toString(36).substring(2, 15)}`;
    cardElement.mount(`#${element.id}`);
    setTap(tapInstance);
    setElements(elementsInstance);
    setCard(cardElement);

    if (false) {
      cardElement.addEventListener('change', function(event) {
        console.log(event)
        if(event.code == '200' ){
            jQuery("#tap-btn").trigger("click");
        }
        if(event.BIN){
          console.log(event.BIN)
        }
        if(event.loaded){
          console.log("UI loaded :"+event.loaded);
          console.log("current currency is :"+card.getCurrency())
        }
        var displayError = document.getElementById('error-handler');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      });
    }
    
    // } catch (err) {
    //   console.error('Tap initialization failed:', err);
    //   setError(__('Could not load card payment. Please try again.'));
    //   // setError(err?.message??__('Could not load card payment. Please try again.'));
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessUrl(null);

    try {
      const payload = {...form, provider};
      if (provider == 'tap') {
        if (!card) {
          setError('Card form not initialized.');
          return;
        }
        const { id: tokenId, error: tokenError } = await createToken(card);
        if (tokenError) throw new Error(tokenError.message);
        payload.cardToken = tokenId;
      }


      const response = await axios.post(rest_url(`/sitecore/v1/invoice/${invoiceId}/pay`), payload);

      if (response.data && response.data.payment_url) {
        setSuccessUrl(response.data.payment_url);
      } else {
        let message = __('Unexpected response from server.');
        const data = response?.data;
        if (data?.errors && data.errors?.length) {
          message = data.errors.map(e => `Error (${e.code}): ${e.description}`).join('<br />')
        }
        throw new Error(message);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || __('Payment failed'));
    } finally {
      setLoading(false);
    }
  };

  const isActiveProvider = (provdr) => {
    return provdr == provider;
  }

  if (error && !invoiceData) {
    return (
      <div className="min-h-screen flex xpo_items-center xpo_justify-center xpo_text-red-600 xpo_text-xl" dangerouslySetInnerHTML={{__html: error}}></div>
    );
  }

  return (
    <div className="bg-cover bg-center flex xpo_items-center xpo_justify-center" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'unset' }}>
      <div className="bg-white shadow-2xl xpo_w-full flex xpo_flex-col md:h-screen md:overflow-hidden">
        <div className="xpo_flex xpo_justify-center py-1 border-solid border-b-2 xpo_h-16">
          <div className="relative">
            <img className="h-full xpo_w-auto" src={ logo } alt={__('Logo')} />
            <div className="absolute xpo_h-full xpo_w-full top-0 left-0"></div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={ `grid grid-rows-1 grid-cols-1 md:xpo_grid-cols-2 xpo_w-screen xpo_h-full mx-auto overflow-auto` }>
          {invoiceError ?
            <div className="w-full xpo_h-full flex xpo_items-center xpo_justify-center bg-white sticky top-0">
              <div className="bg-red-100 xpo_text-red-800 xpo_p-4 rounded-lg border border-red-300 xpo_mb-4">
                <div className="xpo_flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 xpo_w-5 xpo_mt-1 xpo_mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 5.07a10 10 0 1113.86 13.86A10 10 0 015.07 5.07z" />
                  </svg>
                  <span>{invoiceError}</span>
                </div>
              </div>
            </div>
            :
            <div className="w-full xpo_h-full px-8 py-4 top-0">
              <h2 className="text-2xl font-bold xpo_mb-4">{__('Complete Your Payment')}</h2>
              <div className="xpo_flex xpo_flex-col xpo_gap-5">
                <div className="xpo_flex xpo_flex-col xpo_gap-4 py-3">
                  <div className="xpo_grid grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
                    <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('First Name')} required value={form.metadata?.first_name??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, first_name: e.target.value}}))} />
                    {showMiddleName && <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('Middle Name')} value={form.metadata?.middle_name??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, middle_name: e.target.value}}))} />}
                    <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('Last Name')} required value={form.metadata?.last_name??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, last_name: e.target.value}}))} />
                  </div>
                  
                  <div className="xpo_grid grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
                    <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('Address')} required value={form.metadata?.address??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, address: e.target.value}}))} />
                    {showCity && <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('City')} value={form.metadata?.city??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, city: e.target.value}}))} />}
                    {/* {showEmirate && <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={__('Emirate')} required value={form.metadata?.emirate??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, emirate: e.target.value}}))} />} */}
                    
                    {showEmirate && (
                      <div className="w-full">
                        <select className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={form.metadata?.emirate??''} onChange={(e) => setForm(prev => ({...prev, metadata: {...prev.metadata, emirate: e.target.value}}))}>
                          <option defaultValue="">{__('Select emirate')}</option>
                          <option value="abu-dhabi">{__('Abu Dhabi')}</option>
                          <option value="dubai">{__('Dubai')}</option>
                          <option value="sharjah">{__('Sharjah')}</option>
                          <option value="ajman">{__('Ajman')}</option>
                          <option value="umm-al-quwain">{__('Umm Al-Quwain')}</option>
                          <option value="ras-al-khaimah">{__('Ras Al Khaimah')}</option>
                          <option value="fujairah">{__('Fujairah')}</option>
                        </select>
                      </div>
                    )}

                  </div>
                  
                  <input className="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xpo_w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="email" placeholder={__('Email')} required value={form?.client_email??''} onChange={(e) => setForm(prev => ({...prev, client_email: e.target.value}))} />
                  <PhoneInput
                    value={form.metadata?.phone}
                    country={form.metadata?.phone_code}
                    onChange={(value, country) => setForm(prev => ({...prev, metadata: {...prev.metadata, phone: value, phone_code: country.countryCode}}))}
                    containerClass="w-full" inputClass="bg-gray-50 border border-gray-300 xpo_text-gray-900 xpo_text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block !w-full xpo_p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    enableSearch
                    inputProps={{
                      name: 'phone',
                      required: true
                    }}
                  />
                </div>

                <div className="p-3 rounded-3xl border border-solid flex xpo_flex-col xpo_gap-3">
                  {gateways.map((g, index) => (
                    <div key={index} className="px-3">
                      <h2>
                        <div
                          onClick={() => setProvider(isActiveProvider(g.id) ? null : g.id)}
                          className={`cursor-pointer flex xpo_items-center xpo_justify-between xpo_w-full py-2 font-medium rtl:text-right ${
                            isActiveProvider(g.id)
                              ? 'bg-white dark:bg-gray-900 xpo_text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-400'
                          } xpo_gap-3`}
                          aria-expanded="true"
                        >
                          <div className="xpo_flex xpo_flex-nowrap xpo_gap-5xpo_items-center">

                            <div className="inline-flex xpo_items-center">
                              <label className={ `flex xpo_items-center cursor-pointer relative rounded-[100%] border border-solid ${isActiveProvider(g.id) ? 'border-none' : null} overflow-hidden` }>
                                <input type="checkbox" checked={isActiveProvider(g.id)} onChange={() => {}} className="peer xpo_h-5 xpo_w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md checked:bg-primary" id="check3" />
                                <span className="absolute xpo_text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 xpo_w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <circle cx="10" cy="10" r="6" fill="currentColor" />
                                    <circle cx="10" cy="10" r="3" fill="white" />
                                  </svg>
                                </span>
                              </label>
                            </div>
                            <span>{g.title}</span>
                            <img src={g.icon} alt={g.title} className="w-auto xpo_h-6" />
                          </div>
                          <ChevronDown className={ `transition-all duration-300 ease-in-out xpo_w-5 xpo_h-5 shrink-0 ${isActiveProvider(g.id) ? 'rotate-180' : ''}` } />
                        </div>
                      </h2>
                      <div className={ `overflow-hidden transition-all duration-700 ease-in-out ${isActiveProvider(g.id) ? '' : 'h-0 hidden'}` }>
                        <div className="py-5 border-b border-gray-200 dark:border-gray-700">
                          <div className="mb-2 xpo_text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{__html: g.description}}></div>
                          {(g?.fields??[]).map((f, fIndex) => {
                            switch (f.type) {
                              case 'cards':
                                return <CardElement key={fIndex} className="p-3" onLoad={(elem) => load_tap_js(elem)} />;
                                break;
                              default:
                                return <div key={fIndex}></div>
                                break;
                            }
                          })}
                        </div>
                      </div>
                  </div>
                  ))}
                </div>
                
                <div className="hidden md:flex xpo_flex-col xpo_gap-5">
                  {error && <div className="text-red-600">{error}</div>}
                  <button
                    type="submit"
                    disabled={loading || ! provider}
                    className="w-full xpo_text-white flex xpo_gap-2 xpo_justify-center xpo_items-center bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg xpo_text-sm px-5 py-2.5 xpo_text-center me-2 xpo_mb-2 disabled:border-gray-200 disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {loading ? <Loader className="animate-spin" /> : <LockKeyhole />}
                    <span>{loading ? __('Processing...') : __('Pay Now')}</span>
                  </button>
                </div>
              </div>

              {successUrl && (
                <div className="mt-4">
                  <a href={successUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {__('Click here to complete payment')}
                  </a>
                </div>
              )}
            </div>
          }

          {(invoiceData && showOverview) && (
            <div className="w-full xpo_h-full bg-gray-50 px-8 py-4 border-l flex xpo_flex-col xpo_justify-between sticky top-0">
              <div className="">
                <h3 className="text-xl font-semibold xpo_mb-4">{__('Invoice Summary')}</h3>

                <div className="relative overflow-x-auto my-8">
                  <table className="w-full xpo_text-sm xpo_text-left rtl:text-right xpo_text-gray-500 dark:text-gray-400">
                    <thead className="text-xs xpo_text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">{__('Product name')}</th>
                        <th scope="col" className="px-6 py-3"  style={{ width: '200px' }}>{__('Price')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(invoiceData.items??[]).map((item, idx) => (
                      <tr key={idx} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row" className="px-6 py-4 font-medium xpo_text-gray-900 whitespace-nowrap dark:text-white">
                          {get_item_label(item)}
                        </th>
                        <td className="px-6 py-4" style={{ width: '200px' }}>
                          {get_item_price(item)} {invoiceData.currency}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td></td>
                        <th scope="col" className="px-6 py-3">{__('Total:')} {invoiceData.total} {invoiceData.currency}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>
              <div>
                <div className="xpo_flex md:hidden xpo_flex-col xpo_gap-5">
                  {error && <div className="text-red-600">{error}</div>}
                  <button
                    type="submit"
                    disabled={loading || ! provider}
                    className="w-full xpo_text-white flex xpo_gap-2 xpo_justify-center xpo_items-center bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg xpo_text-sm px-5 py-2.5 xpo_text-center me-2 xpo_mb-2 disabled:border-gray-200 disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {loading ? <Loader className="animate-spin" /> : <LockKeyhole />}
                    <span>{loading ? __('Processing...') : __('Pay Now')}</span>
                  </button>
                </div>
                {!invoiceError && <SharePopup url={location.href} title={__('Share payment link')} body={__('Ready to pay? Here\'s the link: \n%s')} __={__} />}
              </div>
            </div>
          )}
        </form>
      </div>
      {paymentStatus && <Popup payment={ paymentStatus } hide={() => {setPaymentStatus(null);setSuccessUrl(null)}} __={__} />}
    </div>
  );
};

export default Checkout;

const Popup = ({ payment = "success", hide = () => {}, __ }) => {
  const isSuccess = payment.success === true;

  return (
    <div className="fixed inset-0 bg-black/50 flex xpo_items-center xpo_justify-center z-50">
      <div className="bg-white rounded-2xl xpo_p-6 shadow-xl xpo_max-w-sm xpo_w-full xpo_text-center relative">
        <button
          type="button"
          onClick={hide}
          aria-label={__('Close')}
          className="absolute top-3 right-3 xpo_text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 xpo_h-5" />
        </button>
        
        {isSuccess ? (
          <CheckCircle className="text-green-500 xpo_w-12 xpo_h-12 mx-auto" />
        ) : (
          <XCircle className="text-red-500 xpo_w-12 xpo_h-12 mx-auto" />
        )}
        
        <h2 className="text-xl font-semibold xpo_mt-4">
          {isSuccess ? __('Payment Successful') : ((payment?.transection?.status) ? sprintf(__('Payment %s!'), payment.transection.status.toLowerCase()) : __('Payment Failed'))}
        </h2>
        
        <p className="text-sm xpo_text-gray-600 xpo_mt-2">
          {isSuccess
            ? __('Your transaction was completed successfully.')
            : __('Your payment was not successful. Please try again, or if you believe the payment went through, contact support.')}
        </p>
      </div>
    </div>
  );
};


const SharePopup = ({ url, title, body = '%s', __ }) => {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const popperInstanceRef = useRef(null);

  const handleNativeShare = () => {
    if (navigator?.share) {
      navigator.share({
        title: title,
        url: url
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && buttonRef.current && popupRef.current) {
      popperInstanceRef.current = createPopper(buttonRef.current, popupRef.current, {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 8] },
          },
          {
            name: 'preventOverflow',
            options: { padding: 8 },
          },
        ],
      });
    } else {
      if (popperInstanceRef.current?.destroy) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = null;
      }
    }
  }, [open]);

  return (
    <div className="relative">
      <button type="button" ref={buttonRef} onClick={() => setOpen(!open)} className="w-full flex xpo_gap-4 xpo_justify-center xpo_items-center px-4 py-2 bg-primary xpo_text-white rounded-lg shadow-md hover:bg-primary-700">
        <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2l0 64-112 0C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96l96 0 0 64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z" className="fill-white" />
        </svg>
        <span>{__('Share')}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 xpo_mt-2 bg-white border rounded-lg shadow-lg xpo_p-4 z-50 xpo_w-64" ref={popupRef}>
          <div className="xpo_flex xpo_flex-wrap xpo_gap-4">
            <button onClick={() => window.open(`fb-messenger://share?link=${encodeURIComponent(url)}`, '_blank')} className="w-10 xpo_h-10">
              <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M256.6 8C116.5 8 8 110.3 8 248.6c0 72.3 29.7 134.8 78.1 177.9 8.4 7.5 6.6 11.9 8.1 58.2A19.9 19.9 0 0 0 122 502.3c52.9-23.3 53.6-25.1 62.6-22.7C337.9 521.8 504 423.7 504 248.6 504 110.3 396.6 8 256.6 8zm149.2 185.1l-73 115.6a37.4 37.4 0 0 1 -53.9 9.9l-58.1-43.5a15 15 0 0 0 -18 0l-78.4 59.4c-10.5 7.9-24.2-4.6-17.1-15.7l73-115.6a37.4 37.4 0 0 1 53.9-9.9l58.1 43.5a15 15 0 0 0 18 0l78.4-59.4c10.4-8 24.1 4.5 17.1 15.6z" />
              </svg>
            </button>
            <button onClick={() => window.open(`https://twitter.com/messages/compose?recipient_id=USER_ID&text=${encodeURIComponent(`${sprintf(body, url)}`)}`, '_blank')} className="w-10 xpo_h-10">
              <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
            </button>
            <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(sprintf(body, url))}`, '_blank')} className="w-10 xpo_h-10">
              <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
            </button>
            <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(sprintf(body, url))}`)} className="w-10 xpo_h-10">
              <svg width={30} height={30} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
              </svg>
            </button>
          </div>
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="mt-4 xpo_text-primary-600 xpo_text-sm hover:underline block xpo_w-full xpo_text-center"
            >
              {__('Show all...')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};


const CardElement = ({ onLoad, className = '' }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current && divRef.current.hasAttribute('data-onload')) {
      onLoad(divRef.current);
    }
  }, []);

  return <div className={className} ref={divRef} data-onload="true"></div>;
}
