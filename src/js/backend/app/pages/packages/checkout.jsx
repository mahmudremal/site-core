import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { BriefcaseBusiness, Check, ChevronDown, ChevronRight, Loader, Package, Play, X } from "lucide-react";
import { useParams } from "react-router-dom";
import CreditCard from "@components/element/CreditCard";
import { useCurrency } from "@context/CurrencyProvider";

export default function Checkout() {
    const { print_money } = useCurrency();
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { setLoading } = useLoading();
    const [doing, setDoing] = useState(null);
    const { package_id, pricing_plan } = useParams();
    const [pricing, setPricing] = useState({});
    const [methodOpen, setMethodOpen] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [gateways, setGateways] = useState([]);
    const [selectedGateWay, setSelectedGateWay] = useState(null);
    const [currency, setCurrency] = useState('USD');
    const [showCardForm, setShowCardForm] = useState(null);
    const [storedCards, setstoredCards] = useState([]);
    const [allowProceed, setAllowProceed] = useState(true);
    
    const fetchThings = async () => {
        setLoading(true);
        try {
            request(rest_url(`/sitecore/v1/contracts/packages/${package_id}`)).then(packs => setPricing(packs));
            request(rest_url(`/sitecore/v1/payment/gateways`)).then(data => Object.keys(data).map(k => ({id: k, ...data[k]}))).then(data => {
                setGateways(data);
                setSelectedGateWay(0);
            });
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThings();
    }, []);

    useEffect(() => {
        if (!gateways[selectedGateWay]?.id) {return;}
        setMethodOpen(false);
        request(rest_url(`/sitecore/v1/payment/switch/${gateways[selectedGateWay]?.id}`)).then(data => {
            if (!data) {return;}
            switch (data?.type) {
                case 'card':
                    const cards = data?.cards;
                    const customer_id = data?.customer_id;
                    setShowCardForm(atob(`${data?.pk}=`));
                    setAllowProceed(false);
                    setstoredCards(cards?.length ? cards : []);
                    break;
                default:
                    setShowCardForm(false);
                    setAllowProceed(true);
                    setstoredCards([]);
                    break;
            }
        }).catch(err => console.error(err));
    }, [selectedGateWay]);

    const handle_checkout = () => {
        setDoing(true);
        request(rest_url('/sitecore/v1/payment/create'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                package_id, pricing_plan,
                starting: startDate, currency,
                gateway: gateways[selectedGateWay]?.id??'',
                card: allowProceed?.selected
            })
        })
        .then(data => {
            if (data?.errors) {
                console.error(data?.errors);
                return;
            }
            const transactionId = data.id;
            const paymentUrl = data.transaction?.url;

            if (!paymentUrl) {return;}
        
            const handlePayment = () => {
                const win = window.open(paymentUrl, '_blank', 'width=600,height=800');
        
                const checkClosed = setInterval(() => {
                    if (win.closed) {
                        clearInterval(checkClosed);
        
                        // Verify transaction
                        request(rest_url(`/sitecore/v1/payment/verify/${gateways[selectedGateWay]?.id}/${transactionId}`))
                        .then(verify => {
                            if (verify?.success) {
                                setPopup(
                                    <div className="text-center xpo_p-8">
                                        <span className="w-100-px xpo_h-100-px bg-success-600 rounded-circle d-inline-flex xpo_justify-content-center xpo_items-center xpo_text-2xxl xpo_mb-32 xpo_text-white">
                                            <Check />
                                        </span>
                                        <h5 className="mb-8 xpo_text-2xl">{__('Payment Successful')}</h5>
                                        <p className="text-neutral-500 xpo_mb-0">{__('Thank you for your payment!')}</p>
                                    </div>
                                );
                            } else {
                                setPopup(
                                    <div className="text-center xpo_p-8">
                                        <span className="w-100-px xpo_h-100-px bg-danger-600 rounded-circle d-inline-flex xpo_justify-content-center xpo_items-center xpo_text-2xxl xpo_mb-32 xpo_text-white">
                                            <X />
                                        </span>
                                        <h5 className="mb-8 xpo_text-2xl">{__('Payment Failed')}</h5>
                                        <p className="text-neutral-500 xpo_mb-0">{__('The transaction could not be completed.')}</p>
                                    </div>
                                );
                            }
                        })
                        .catch(() => {
                            setPopup(
                                <div className="text-center xpo_p-8">
                                    <h5 className="mb-8 xpo_text-2xl">{__('Error')}</h5>
                                    <p className="text-neutral-500">{__('Failed to verify payment. Please try again.')}</p>
                                </div>
                            );
                        });
                    }
                }, 500);
            };
        
            // Initial success + Pay Now button
            setPopup(
                <div className="text-center xpo_p-8">
                    <span className="w-100-px xpo_h-100-px bg-success-600 rounded-circle d-inline-flex xpo_justify-content-center xpo_items-center xpo_text-2xxl xpo_mb-32 xpo_text-white">
                        <Check />
                    </span>
                    <h5 className="mb-8 xpo_text-2xl">{__('Your payment link was created successfully!')}</h5>
                    <p className="text-neutral-500 xpo_mb-0">
                        <span className="text-primary-600">{data.amount} {data.currency}</span> {__('Payment initiated.')}
                    </p>
                    <button
                        onClick={handlePayment}
                        className="btn btn-primary-600 xpo_mt-32 px-24"
                    >
                        {__('Pay now')}
                    </button>
                </div>
            );
        })
        
        .finally(() => setDoing(false))
    }

    return (
        <div className="row gy-4">
            <div className="col-xxl-9 col-lg-8">
                <div className="card xpo_p-0 radius-12">
                    <div className="card-body px-24 py-32">

                        <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_mb-24">
                            <div className="xpo_flex xpo_items-center">
                                <Package className="w-72-px xpo_h-72-px rounded-circle xpo_flex-shrink-0 me-12 overflow-hidden" />
                                <div className="xpo_flex-grow-1 xpo_flex xpo_flex-col">
                                    <h4 className="mb-4">{pricing?.name}</h4>
                                    <span className="text-md xpo_mb-0 fw-medium xpo_text-neutral-500 d-block">{pricing?.packagefor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="xpo_my-5">
                            <h6 className="mb-16">About</h6>
                            <p className="text-secondary-light">{pricing?.shortdesc??''}</p>
                        </div>
                        
                        <div className="border radius-12 xpo_p-24">
                            <h6 className="text-md xpo_mb-16">{pricing?.list_title??'What’s included'}</h6>
                            <div className="table-responsive scroll-sm">
                                <table className="table bordered-table rounded-table sm-table xpo_mb-0">
                                    <tbody>
                                        {(pricing?.list??[]).map((itemTitle, itemIndex) => 
                                            <tr key={itemIndex}>
                                                <td>
                                                    <h6 className="text-md xpo_mb-4 xpo_text-neutral-500">{itemTitle}</h6>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <div className="col-xxl-3 col-lg-4">
                <div className="card xpo_h-100">
                    <div className="card-body xpo_p-0">
                        <div className="p-24 border-bottom">
                            <div className="xpo_flex xpo_flex-col xpo_gap-5 xpo_justify-between">
                                <div>
                                    <div className="text-center xpo_mt-24">
                                        <h3 className="text-neutral-400 xpo_mb-16">{print_money((pricing?.pricing?.[pricing_plan]??0).toFixed(2))}</h3>
                                        <span className="text-neutral-500 xpo_text-sm">{__('You can upgrade/downgrade later.')}</span>
                                    </div>
                                    <div className="mt-24 border radius-8 position-relative">
                                        <div className="p-16 xpo_flex xpo_items-center border-bottom">
                                            <span className="text-neutral-500 fw-medium xpo_w-76-px border-end">{__("Date")}</span>
                                            <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_flex-grow-1 ps-16">
                                                <div className="xpo_w-full">
                                                    <div>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={startDate.toISOString().split('T')[0]}
                                                            onChange={(e) => setStartDate(new Date(e.target.value))}
                                                        ></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-16 xpo_flex xpo_items-center">
                                            <span className="text-neutral-500 fw-medium xpo_w-76-px border-end">{__('Pay with')}</span>
                                            <div className="xpo_flex xpo_items-center xpo_justify-content-between xpo_flex-grow-1 ps-16">
                                                <div className="xpo_relative xpo_select-none">
                                                    <div className="xpo_flex xpo_items-center xpo_gap-8">
                                                        <img src={gateways[selectedGateWay]?.icon??''} alt={gateways[selectedGateWay]?.title??''} className="w-24-px xpo_h-24-px rounded-circle xpo_flex-shrink-0 overflow-hidden" />
                                                        <div className="xpo_flex-grow-1 xpo_flex xpo_flex-col">
                                                            <span className="text-sm xpo_mb-0 fw-medium xpo_text-primary-light d-block">{gateways[selectedGateWay]?.title??''}</span>
                                                        </div>
                                                    </div>
                                                    <ul className={ `dropdown-menu xpo_translate-y-2.5 ${methodOpen && 'show'} ${gateways.length <= 1 && 'xpo_hidden'}` }>
                                                        {/* .filter((g, index) => index !== selectedGateWay) */}
                                                        {gateways.map((g, index) => 
                                                            index == selectedGateWay ? <li key={index} className="xpo_hidden"></li> : 
                                                            <li
                                                                key={index}
                                                                onClick={() => setSelectedGateWay(index)}
                                                                className="dropdown-item xpo_px-2 xpo_py-3 xpo_cursor-pointer rounded xpo_text-secondary-light bg-hover-neutral-200 xpo_text-hover-neutral-900"
                                                            >
                                                                <div className="xpo_flex xpo_items-center xpo_gap-8">
                                                                    <img src={ g?.icon??'' } alt="" className="w-24-px xpo_h-24-px rounded-circle xpo_flex-shrink-0 overflow-hidden" />
                                                                    <div className="xpo_flex-grow-1 xpo_flex xpo_flex-col">
                                                                        <span className="text-sm xpo_mb-0 fw-medium xpo_text-primary-light d-block">{g?.title??'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                                <ChevronDown
                                                    onClick={() => setMethodOpen(prev => !prev)}
                                                    className={ `text-md xpo_text-neutral-500 xpo_text-hover-primary-600 xpo_transition-all xpo_duration-300 xpo_ease-in-out ${methodOpen && 'xpo_rotate-180'} ${gateways.length <= 1 && 'xpo_hidden'}` }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {showCardForm && 
                                        <div className="mt-24 border radius-8 position-relative">
                                            <CreditCard store={[storedCards, setstoredCards]} pk={showCardForm} setAllowProceed={setAllowProceed} />
                                        </div>
                                    }
                                    <button
                                        type="button"
                                        disabled={doing || !allowProceed}
                                        onClick={handle_checkout}
                                        className="btn btn-primary xpo_text-sm btn-sm px-12 py-16 xpo_w-100 radius-8 xpo_mt-24 xpo_pb-8 xpo_flex xpo_gap-4 xpo_justify-center"
                                    >
                                        {doing && <Loader className="xpo_icon xpo_text-xl xpo_line-height-1 xpo_animate-spin" />}
                                        {__('Pay now')}
                                    </button>
                                </div>
                                <div>
                                    <div className="xpo_w-full">
                                        <div className="card xpo_h-100 radius-12 bg-gradient-danger xpo_text-center">
                                            <div className="card-body xpo_p-24">
                                                <div className="w-64-px xpo_h-64-px d-inline-flex xpo_items-center xpo_justify-content-center bg-danger-600 xpo_text-white xpo_mb-16 radius-12">
                                                    <BriefcaseBusiness className="h5 xpo_mb-0" /> 
                                                </div>
                                                <h6 className="mb-8">{__('Business Strategy')}</h6>
                                                <p className="card-text xpo_mb-8 xpo_text-secondary-light">{__('Businesses prioritizing trust, reliability, and professionalism are best positioned for lasting success. These core values cultivate strong relationships and a resilient reputation, driving long-term growth.')}</p>
                                                <Link to="#" className="btn xpo_text-danger-600 hover-text-danger px-0 py-10 d-inline-flex xpo_items-center xpo_gap-2">{__('Read More')} <ChevronRight className="text-xl" /></Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
