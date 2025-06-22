import React, { useEffect, useState } from "react";
import Payouts from ".";
import request from "@common/request";
import { rest_url } from "@functions";
import { useLoading } from "@context/LoadingProvider";
import { usePopup } from "@context/PopupProvider";
import { useTranslation } from "@context/LanguageProvider";
import { HandCoins, Wallet, BanknoteArrowDown, UsersRound } from "lucide-react";

export default function PayoutsScreen({ filters = 'any' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { setLoading } = useLoading();
    
    const [balance, setBalance] = useState(0);
    const [refBalance, setRefBalance] = useState(0);
    const [withdrawable, setWithdrawable] = useState(0);
    const [paymentsToDate, setPaymentsToDate] = useState(0);

    useEffect(() => {
        setLoading(true);
        request(rest_url(`/sitecore/v1/finance/account`))
        .then(account => {
            if (account?.balance) {setBalance(account.balance);}
            if (account?.withdrawable) {setWithdrawable(account.withdrawable);}
            if (account?.referral_earn) {setRefBalance(account.referral_earn);}
            if (account?.payments_to_date) {setPaymentsToDate(account.payments_to_date);}
        })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, []);
    // 
    return (
        <div className="xpo_flex xpo_flex-col xpo_gap-4">
            <div className="xpo_grid xpo_gap-4 grid-cols-2 md:xpo_grid-cols-4">
                <div>
                    <div className="card-body xpo_p-5 bg-base border xpo_h-100 flex xpo_flex-column xpo_justify-content-center border-end-0">
                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-1 xpo_mb-8">
                            <div>
                                <span className="mb-12 xpo_w-44-px xpo_h-44-px xpo_text-primary-600 bg-primary-light border border-primary-light-white xpo_flex-shrink-0 flex xpo_justify-content-center xpo_items-center radius-8 h6 xpo_mb-12">
                                    <Wallet className="icon" />
                                </span>
                                <span className="mb-1 fw-medium xpo_text-secondary-light xpo_text-md">{__('Balance')}</span>
                                <h6 className="fw-semibold xpo_text-primary-light xpo_mb-1">{balance.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+200</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border xpo_h-100 flex xpo_flex-column xpo_justify-content-center border-end-0">
                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-1 xpo_mb-8">
                            <div>
                                <span className="mb-12 xpo_w-44-px xpo_h-44-px xpo_text-yellow bg-yellow-light border border-yellow-light-white xpo_flex-shrink-0 flex xpo_justify-content-center xpo_items-center radius-8 h6 xpo_mb-12">
                                    <UsersRound absoluteStrokeWidth className="icon" />
                                </span>
                                <span className="mb-1 fw-medium xpo_text-secondary-light xpo_text-md">{__('Refferrals')}</span>
                                <h6 className="fw-semibold xpo_text-primary-light xpo_mb-1">{refBalance.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={false}>+$0</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border xpo_h-100 flex xpo_flex-column xpo_justify-content-center border-end-0">
                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-1 xpo_mb-8">
                            <div>
                                <span className="mb-12 xpo_w-44-px xpo_h-44-px xpo_text-lilac bg-lilac-light border border-lilac-light-white xpo_flex-shrink-0 flex xpo_justify-content-center xpo_items-center radius-8 h6 xpo_mb-12">
                                    <BanknoteArrowDown className="icon" />  
                                </span>
                                <span className="mb-1 fw-medium xpo_text-secondary-light xpo_text-md">{__('Withdrawable')}</span>
                                <h6 className="fw-semibold xpo_text-primary-light xpo_mb-1">{withdrawable.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+$1k</Badge>
                    </div>
                </div>
                <div>
                    <div className="card-body xpo_p-5 bg-base border xpo_h-100 flex xpo_flex-column xpo_justify-content-center">
                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_justify-between xpo_gap-1 xpo_mb-8">
                            <div>
                                <span className="mb-12 xpo_w-44-px xpo_h-44-px xpo_text-pink bg-pink-light border border-pink-light-white xpo_flex-shrink-0 flex xpo_justify-content-center xpo_items-center radius-8 h6 xpo_mb-12">
                                    <HandCoins className="icon" />  
                                </span>
                                <span className="mb-1 fw-medium xpo_text-secondary-light xpo_text-md">{__('Payments to date')}</span>
                                <h6 className="fw-semibold xpo_text-primary-light xpo_mb-1">{paymentsToDate.toFixed(2)}</h6>
                            </div>
                        </div>
                        <Badge before={'Increase by'} after={'this week'} positive={true}>+$10k</Badge>
                    </div>
                </div>
            </div>
            <div className="block">
                <Payouts filters={filters} maxAmount={withdrawable} />
            </div>
        </div>
    );
}

const Badge = ({children, before = '', after = '', positive = true}) => {
    return (
        <p className="text-sm xpo_mb-0">
            {before}
            <span className={ `${positive ? 'bg-success-focus xpo_text-success-main' : 'bg-danger-focus xpo_text-danger-main'} px-1 rounded-2 fw-medium xpo_text-sm` }>{children}</span>
            {after}
        </p>
    )
}