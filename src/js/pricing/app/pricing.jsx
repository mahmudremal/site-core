import React, { useEffect, useRef, useState } from 'react';
// import { Check, Package } from 'lucide-react';
import { sprintf } from 'sprintf-js';
import { Link } from 'react-router-dom';
import logo from '@img/logo.png';

const Pricing = ({ }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plan, setPlan] = useState(null);
  const [packages, setPackages] = useState([]);
  const [successUrl, setSuccessUrl] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    fetch(`${location.origin}/wp-json/sitecore/v1/contracts/packages`)
    .then(r => {
      if (r.ok) {
        return r.json();
      } else {
        return Promise.reject(r);
      }
    })
    .then(res => {
      setPackages(res);
      const sorted_plans = ['Monthly', 'Yearly']; // [...new Set(res.flatMap(item => Object.keys(item.pricing)))];
      setPlans(sorted_plans);
      setPlan(sorted_plans[0]);
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (successUrl) {
      location.href = successUrl;
      // const win = window.open(successUrl, '_blank', 'width=600,height=800');
      // const checkClosed = setInterval(() => {
      //   if (win?.closed) {clearInterval(checkClosed);}
      // }, 500);
    }
  }, [successUrl]);

  const __ = (text) => text;

  const handleGetStarted = async (e, packId) => {
    e.preventDefault();
  
    setLoading(true);
  
    try {
      const res = await fetch(`${location.origin}/wp-json/sitecore/v1/contracts/packages/${packId}/${plan}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: null,
          currency: 'AED',
          client_email: '',
          first_name: '',
          middle_name: '',
          last_name: '',
          countryCode: '',
          client_phone: ''
        })
      });
  
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
  
      const data = await res.json();
  
      if (data?.invoice_link) {
        setSuccessUrl(data.invoice_link);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="relative overflow-hidden bg-white dark:bg-dark flex xpo_flex-col xpo_gap-5">
      <div className="w-full xpo_h-24 border-b border-solid py-2">
        <div className="relative flex xpo_justify-center">
          <img className="h-20 xpo_w-auto" src={ logo } alt={__('Logo')} />
          <div className="absolute xpo_h-full xpo_w-full top-0 left-0"></div>
        </div>
      </div>
      <div className="container mx-auto">
        <div className="-mx-4 flex xpo_flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto xpo_max-w-[510px] xpo_text-center">
              <span className="mb-2 block xpo_text-lg font-semibold xpo_text-primary">{__('Pricing Table')}</span>
              <h2 className="mb-3 xpo_text-3xl font-bold leading-[1.208] xpo_text-dark dark:text-white sm:text-4xl md:text-[40px]">{__('Our Pricing Plan')}</h2>
              <p className="text-base xpo_text-body-color dark:text-dark-6">
                {__('Choose the best plan for your business. Change plans as you grow.')}
              </p>
            </div>
          </div>
        </div>
  
        <div className="mb-6 xpo_text-center">
          <div className="mb-5 flex xpo_justify-center">
            <span className="xpo_flex xpo_items-center">
              <span className="inline-block whitespace-nowrap xpo_text-xs leading-4 font-semibold tracking-wide bg-primary-100 xpo_text-primary-600 rounded-full py-2 px-4">{
                sprintf(
                  __('Save %f%%'),
                  (((12 * 1) - (1 * 10)) / (12 * 1) * 100).toFixed(1)
                )
              }</span>
              <svg className="w-16 xpo_h-11 scale-x-[-1]" viewBox="0 0 65 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.0964 4.02732C39.5251 4.74637 37.1135 5.87152 34.9795 7.36979C34.0529 8.02188 33.2561 8.68389 32.5982 9.38799C32.5386 9.38153 32.482 9.38579 32.4118 9.38233C30.1332 9.37225 27.711 10.2114 25.0194 11.9465C20.4292 14.906 16.7212 19.2023 14.2904 24.3897C12.0636 29.1502 11.0911 34.265 11.4596 39.2591L7.6368 36.04L6.83225 37.0047L12.587 41.8449L16.9956 35.7576L15.9819 35.024L13.1146 38.9812C12.4253 28.9566 17.4523 18.8014 25.9225 13.3583C27.861 12.1112 29.6087 11.3798 31.2299 11.146C30.6487 12.083 30.2872 13.0624 30.1426 14.0738C29.9087 15.7573 30.5083 17.6123 31.7101 18.8943C32.6977 19.9474 33.9541 20.4744 35.2551 20.3764C36.5669 20.2755 37.7738 19.5103 38.5629 18.2841C39.4661 16.8873 39.6838 15.1043 39.1492 13.6472C38.4686 11.7917 36.7603 10.3508 34.6701 9.73325C35.0524 9.40674 35.4806 9.07896 35.9331 8.75591C42.0235 4.51004 50.3771 3.60724 57.2293 6.46459L57.8719 4.92101C54.237 3.40628 50.175 2.84314 46.1137 3.2738C44.7513 3.40049 43.4035 3.6618 42.0964 4.02732ZM37.5828 14.2008C37.9503 15.1845 37.7787 16.3883 37.1605 17.3586C36.9123 17.7517 36.3954 18.3817 35.5811 18.6094C35.4419 18.6483 35.2889 18.6795 35.1406 18.6863C34.3594 18.743 33.5726 18.4082 32.933 17.7318C32.0791 16.8263 31.6418 15.4691 31.8087 14.2898C31.9645 13.1944 32.4639 12.1301 33.2993 11.1106C35.286 11.3987 36.9819 12.5889 37.5828 14.2008Z" fill="#9CA3AF" />
              </svg>
            </span>
          </div>
          <div className="tabs">
            <div className="xpo_flex xpo_justify-center xpo_items-center bg-gray-100 rounded-full xpo_p-1.5 xpo_max-w-sm mx-auto">
              {plans.map((p, index) => 
                <button key={index} onClick={() => setPlan(p)} className={ `inline-block xpo_w-1/2 xpo_text-center transition-all duration-500 rounded-full xpo_text-gray-400 font-semibold py-3 px-3 lg:px-11 tab-active:bg-primary-600 tab-active:rounded-full tab-active:text-white tablink whitespace-nowrap active ${plan == p ? 'text-white bg-primary-600' : 'hover:text-primary-600'}` } role="tab">{sprintf('Bill %s', p)}</button>
              )}
            </div>
          </div>
        </div>
  
        <div className="-mx-4 flex xpo_flex-wrap xpo_justify-center">
          <div className="-mx-4 flex xpo_flex-wrap">
            {packages.map((pack, index) => 
              <PricingCard
                key={index}
                type={ __(pack?.name??'Basic') }
                price={ pack?.pricing?.[plan]??0 }
                subscription={ plan }
                description={ __(pack?.shortdesc??'') }
                // buttonText={ __(sprintf('Choose %s', pack?.name??'package')) }
                buttonText={ (pack?.pricing?.[plan]??0) > 0 ? __('Subscribe Now') : __('Lets talk') }
                handleGetStarted={ handleGetStarted }
                pack={ pack }
                link={ (pack?.pricing?.[plan]??0) > 0 ? null : 'https://wa.me/shahadat.co.uk' }
              >
                {pack.list.map((itemTitle, itemIndex) => 
                  <List key={itemIndex}>{itemTitle}</List>
                )}
              </PricingCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
  
};

export default Pricing;

const PricingCard = ({ children, description, price, type, subscription, buttonText, active, handleGetStarted, pack, link }) => {
  return (
    <>
      <div className="w-full px-4 md:w-1/2 lg:w-1/4">
        <div className="relative z-10 xpo_mb-10 overflow-hidden rounded-[10px] border-2 border-stroke bg-white px-8 py-10 shadow-pricing dark:border-dark-3 dark:bg-dark-2 sm:p-12 lg:px-6 lg:py-10 xl:p-[50px]">
          <span className="mb-3 block xpo_text-lg font-semibold xpo_text-primary">
            {type}
          </span>
          {price > 0 ? 
          <h2 className="mb-5 xpo_text-[42px] font-bold xpo_text-dark dark:text-white">
            {price} <span className="text-base font-medium xpo_text-body-color dark:text-dark-6">/ {subscription}</span>
          </h2> : null }
          <p className="mb-8 border-b border-stroke xpo_pb-8 xpo_text-base xpo_text-body-color dark:border-dark-3 dark:text-dark-6">
            {description}
          </p>
          <div className="mb-9 flex xpo_flex-col xpo_gap-[14px]">{children}</div>
          {link ? (
            <a
              href={ link }
              target="_blank"
              className={` ${
                active
                  ? "block xpo_w-full rounded-md border border-primary bg-primary xpo_p-3 xpo_text-center xpo_text-base font-medium xpo_text-white transition hover:bg-opacity-90"
                  : "block xpo_w-full rounded-md border border-stroke bg-transparent xpo_p-3 xpo_text-center xpo_text-base font-medium xpo_text-primary transition hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3"
              } `}
            >{buttonText}</a>
          ) : (
            <button
              onClick={(e) => handleGetStarted(e, pack.id)}
              className={` ${
                active
                  ? "block xpo_w-full rounded-md border border-primary bg-primary xpo_p-3 xpo_text-center xpo_text-base font-medium xpo_text-white transition hover:bg-opacity-90"
                  : "block xpo_w-full rounded-md border border-stroke bg-transparent xpo_p-3 xpo_text-center xpo_text-base font-medium xpo_text-primary transition hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3"
              } `}
            >{buttonText}</button>
          )}
          <div>
            <span className="absolute right-0 top-7 z-[-1]">
              <svg width={77} height={172} viewBox="0 0 77 172" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx={86} cy={86} r={86} fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient id="paint0_linear" x1={86} y1={0} x2={86} y2={172} gradientUnits="userSpaceOnUse">
                    <stop className="stop-primary" stopOpacity="0.09" />
                    <stop offset={1} stopColor="#C4C4C4" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="absolute right-4 top-4 z-[-1]">
              <svg width={41} height={89} viewBox="0 0 41 89" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="38.9138" cy="87.4849" r="1.42021" transform="rotate(180 38.9138 87.4849)" className="fill-primary" />
                <circle cx="38.9138" cy="74.9871" r="1.42021" transform="rotate(180 38.9138 74.9871)" className="fill-primary" />
                <circle cx="38.9138" cy="62.4892" r="1.42021" transform="rotate(180 38.9138 62.4892)" className="fill-primary" />
                <circle cx="38.9138" cy="38.3457" r="1.42021" transform="rotate(180 38.9138 38.3457)" className="fill-primary" />
                <circle cx="38.9138" cy="13.634" r="1.42021" transform="rotate(180 38.9138 13.634)" className="fill-primary" />
                <circle cx="38.9138" cy="50.2754" r="1.42021" transform="rotate(180 38.9138 50.2754)" className="fill-primary" />
                <circle cx="38.9138" cy="26.1319" r="1.42021" transform="rotate(180 38.9138 26.1319)" className="fill-primary" />
                <circle cx="38.9138" cy="1.42021" r="1.42021" transform="rotate(180 38.9138 1.42021)" className="fill-primary" />
                <circle cx="26.4157" cy="87.4849" r="1.42021" transform="rotate(180 26.4157 87.4849)" className="fill-primary" />
                <circle cx="26.4157" cy="74.9871" r="1.42021" transform="rotate(180 26.4157 74.9871)" className="fill-primary" />
                <circle cx="26.4157" cy="62.4892" r="1.42021" transform="rotate(180 26.4157 62.4892)" className="fill-primary" />
                <circle cx="26.4157" cy="38.3457" r="1.42021" transform="rotate(180 26.4157 38.3457)" className="fill-primary" />
                <circle cx="26.4157" cy="13.634" r="1.42021" transform="rotate(180 26.4157 13.634)" className="fill-primary" />
                <circle cx="26.4157" cy="50.2754" r="1.42021" transform="rotate(180 26.4157 50.2754)" className="fill-primary" />
                <circle cx="26.4157" cy="26.1319" r="1.42021" transform="rotate(180 26.4157 26.1319)" className="fill-primary" />
                <circle cx="26.4157" cy="1.4202" r="1.42021" transform="rotate(180 26.4157 1.4202)" className="fill-primary" />
                <circle cx="13.9177" cy="87.4849" r="1.42021" transform="rotate(180 13.9177 87.4849)" className="fill-primary" />
                <circle cx="13.9177" cy="74.9871" r="1.42021" transform="rotate(180 13.9177 74.9871)" className="fill-primary" />
                <circle cx="13.9177" cy="62.4892" r="1.42021" transform="rotate(180 13.9177 62.4892)" className="fill-primary" />
                <circle cx="13.9177" cy="38.3457" r="1.42021" transform="rotate(180 13.9177 38.3457)" className="fill-primary" />
                <circle cx="13.9177" cy="13.634" r="1.42021" transform="rotate(180 13.9177 13.634)" className="fill-primary" />
                <circle cx="13.9177" cy="50.2754" r="1.42021" transform="rotate(180 13.9177 50.2754)" className="fill-primary" />
                <circle cx="13.9177" cy="26.1319" r="1.42021" transform="rotate(180 13.9177 26.1319)" className="fill-primary" />
                <circle cx="13.9177" cy="1.42019" r="1.42021" transform="rotate(180 13.9177 1.42019)" className="fill-primary" />
                <circle cx="1.41963" cy="87.4849" r="1.42021" transform="rotate(180 1.41963 87.4849)" className="fill-primary" />
                <circle cx="1.41963" cy="74.9871" r="1.42021" transform="rotate(180 1.41963 74.9871)" className="fill-primary" />
                <circle cx="1.41963" cy="62.4892" r="1.42021" transform="rotate(180 1.41963 62.4892)" className="fill-primary" />
                <circle cx="1.41963" cy="38.3457" r="1.42021" transform="rotate(180 1.41963 38.3457)" className="fill-primary" />
                <circle cx="1.41963" cy="13.634" r="1.42021" transform="rotate(180 1.41963 13.634)" className="fill-primary" />
                <circle cx="1.41963" cy="50.2754" r="1.42021" transform="rotate(180 1.41963 50.2754)" className="fill-primary" />
                <circle cx="1.41963" cy="26.1319" r="1.42021" transform="rotate(180 1.41963 26.1319)" className="fill-primary" />
                <circle cx="1.41963" cy="1.4202" r="1.42021" transform="rotate(180 1.41963 1.4202)" className="fill-primary" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
const List = ({ children }) => {
  return (
    <p className="text-base xpo_text-body-color dark:text-dark-6">{children}</p>
  );
};


