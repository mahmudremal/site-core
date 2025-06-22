import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, home_route, rest_url, notify, sleep } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Check } from "lucide-react";
import { useCurrency } from "@context/CurrencyProvider";
import priceIcon from "@img/price-icon.png";
import receiptBanner from "@icons/receipt.svg";
import { useNavigate } from "react-router-dom";

export default function Packages({ viewType = 'list' }) {
    const { print_money } = useCurrency();
    const { __ } = useTranslation();
    const { setLoading } = useLoading();
    const { setPopup } = usePopup();
    const navigate = useNavigate();
    
    const [plans, setPlans] = useState([]);
    const [plan, setPlan] = useState(null);
    const [packages, setPackages] = useState([]);
    const [stores, setStores] = useState([]);
    

    const fetchPackages = async () => {
        setLoading(true);
        request(rest_url(`/sitecore/v1/contracts/packages`))
        .then(res => {
            setPackages(res);
            const sorted_plans = [...new Set(res.flatMap(item => Object.keys(item.pricing)))];
            setPlans(sorted_plans);
            setPlan(sorted_plans[0]);
        })
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        request(rest_url(`/sitecore/v1/stores?per_page=50`), {headers: {'Content-Type': 'application/json'}})
        .then(res => setStores(res?.list??[]))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')));
    }, []);


    return (
        <div className="card xpo_p-0 radius-12 overflow-hidden">
            <div className="card-header border-bottom bg-base py-16 px-24 xpo_flex xpo_justify-between xpo_gap-5">
                <div>
                    <h6 className="mb-0 xpo_text-lg">{__('Pricing Plan')}</h6>
                </div>
                <div>
                    <ul className="nav nav-pills button-tab pricing-tab xpo_justify-content-center xpo_m-0">
                        {plans.map((p, index) => 
                        <li className="nav-item" key={index}>
                            <button onClick={() => setPlan(p)} className={ `nav-link xpo_text-md rounded-pill xpo_text-secondary-light fw-medium ${plan == p && 'active'}` }>{__(p)}</button>
                        </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="card-body xpo_px-4 xpo_py-2">
                <div className="justify-content-center">
                    <div className="xpo_w-full">
                        <div className="xpo_grid xpo_gap-4 xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3">
                            {packages.map((pack, index) => 
                                <div className="pricing-plan-wrapper" key={index}>
                                    {/* scale-item */}
                                    <div className="pricing-plan position-relative radius-24 overflow-hidden border bg-lilac-100">
                                        <div className="xpo_flex xpo_items-center xpo_gap-16">
                                            <span className="w-72-px xpo_h-72-px xpo_flex xpo_justify-content-center xpo_items-center radius-16 bg-base">
                                                <img src={ priceIcon } alt={__('Price icon')} />
                                            </span>
                                            <div className="">
                                                <span className="fw-medium xpo_text-md xpo_text-secondary-light">{__(pack?.packagefor??'For individuals')}</span>
                                                <h6 className="mb-0">{__(pack?.name??'BASIC')}</h6>
                                            </div>
                                        </div>
                                        <p className="mt-16 xpo_mb-0 xpo_text-secondary-light xpo_mb-28">{__(pack?.shortdesc??'')}</p>
                                        {pack?.pricing?.[plan] && <h3 className="mb-24">{print_money(pack?.pricing?.[plan]??0)} <span className="fw-medium xpo_text-md xpo_text-secondary-light xpo_lowercase">/{plan}</span></h3>}
                                        <span className="mb-20 fw-medium">{__(pack?.list_title??'What’s included')}</span>
                                        <ul>
                                            {pack.list.map((itemTitle, itemIndex) => 
                                                <li className="xpo_flex xpo_items-center xpo_gap-16 xpo_mb-16" key={itemIndex}>
                                                    <span className="w-24-px xpo_h-24-px xpo_flex xpo_justify-content-center xpo_items-center bg-lilac-600 rounded-circle">
                                                        <Check className="text-white xpo_text-lg" />
                                                    </span>
                                                    <span className="text-secondary-light xpo_text-lg">{itemTitle}</span>
                                                </li>
                                            )}
                                        </ul>
                                        <button
                                            // to={ home_url( `/packages/${pack?.id}/${plan}/checkout` ) }
                                            className="bg-lilac-600 bg-hover-lilac-700 xpo_text-white xpo_text-center border border-lilac-600 xpo_text-sm btn-sm px-12 py-10 xpo_w-100 radius-8 xpo_mt-28"
                                            onClick={(e) => setPopup(<InvoiceGenerator pack={pack} plan={plan} stores={stores} __={__} />)}
                                        >{__('Get started')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}


const InvoiceGenerator = ({ pack, plan, stores, __ }) => {
    const [paymentLink, setPaymentLink] = useState(null);
    const [loading, setLoading] = useState(null);
    
    const handle_package_submit = async (e, pack, plan) => {
        e.preventDefault();
        setLoading(true);
        await sleep(1500); // Simulate loading delay
        const fdata = new FormData(e.target);
        const staticdata = {
            invoice_id: null,
            currency: 'AED',
            client_email: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            countryCode: '',
            client_phone: ''
        };
        Object.keys(staticdata).forEach(key => {
            fdata.append(key, staticdata[key]);
        });
        request(rest_url(`/sitecore/v1/contracts/packages/${pack.id}/${plan}/create`), {headers: {}, body: fdata, method: 'POST'})
        .then(res => {
            if (res?.invoice_id) {
                // setPopup(null);
                // navigate(home_route(`/invoices/${res.invoice_id}/checkout`));
                setPaymentLink(res?.invoice_link);
                notify.success(__('Invoice created successfully!'));
            }
        })
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
    }
    
    return (
        <div>
            {paymentLink ? (
                <div className="xpo_flex xpo_flex-col xpo_gap-4">
                    <div className="xpo_relative">
                        <img src={receiptBanner} alt={__('Receipt generated')} className="xpo_max-h-48" />
                        <div className="xpo_absolute xpo_w-full xpo_h-full xpo_top-0 xpo_left-0"></div>
                    </div>
                    <h6 className="text-center">{__('Payment link')}</h6>
                    <p className="text-center">{__('Click the button below to proceed to payment.')}</p>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary xpo_mt-2 xpo_animate-bounce xpo_w-full">{__('Proceed to payment')}</a>
                </div>
            ) : (
                <form onSubmit={(e) => handle_package_submit(e, pack, plan)}>
                    <div className="xpo_flex xpo_flex-col xpo_gap-3">
                        <h6>Select a store</h6>
                        <div className="xpo_block xpo_mt-6">
                            <ul className="list-group radius-8">
                                {stores.map((store, index) => (
                                    <li key={index} className={ `list-group-item border xpo_text-secondary-light xpo_p-16 xpo_text-white card ${stores.length == (index + 1) ? '' : 'border-bottom-0'}` }>
                                        <div className="form-check checked-warning xpo_flex xpo_items-center xpo_gap-2">
                                            <input className="form-check-input" type="radio" name="store" id={ `store_${index}` } value={store.id} />
                                            <label className="form-check-label line-height-1 fw-medium xpo_text-secondary-light" htmlFor={ `store_${index}` }>{store.store_title}</label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="xpo_flex align-items-start xpo_flex-column xpo_flex-wrap xpo_gap-3 xpo_mt-8">
                            <button className={`btn rounded-pill btn-success-100 xpo_text-success-600 radius-8 px-20 py-11 ${loading ? 'disabled:xpo_cursor-progress' : ''}`}>{loading ? __('Generating invoice...') : __('Create invoice')}</button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}