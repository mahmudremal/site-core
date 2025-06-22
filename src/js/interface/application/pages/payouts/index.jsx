
import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url, notify, strtotime, roles } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Trash2, SquarePen, Eye, Plus, Search, ChevronsLeft, ChevronsRight, CheckCircle, XCircle } from 'lucide-react';
import { sprintf } from 'sprintf-js';
import { useSettings } from "@context/SettingsProvider";
import { useCurrency } from "@context/CurrencyProvider";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

export default function Payouts({ maxAmount = 0, viewType = 'list' }) {
    const { __ } = useTranslation();
    const { print_money } = useCurrency();
    const { setPopup } = usePopup();
    const { settings } = useSettings();
    
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [status, setStatus] = useState('any');
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [userId, setUserId] = useState(settings?.user_id);

    const fetchTransections = async () => {
        setLoading(true);
        // request(rest_url(`/sitecore/v1/finance/transactions?user_id=${userId}&page=${page}&s=${search}&status=${status}&per_page=${perPage}`)) // for finance transections
        request(rest_url(`/sitecore/v1/payouts?user_id=${userId}&page=${page}&s=${search}&status=${status}&per_page=${perPage}`)) // for solid payout list
        .then(res => {
            setTransactions(res?.list??[]);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        })
        .catch(err => console.error("Error fetching transactions:", err))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTransections();
    }, [page, perPage, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchTransections();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 flex xpo_items-center xpo_flex-wrap xpo_gap-3 xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-3">
                    <span className="text-md fw-medium xpo_text-secondary-light xpo_mb-0">{__('Show')}</span>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                    >
                        {PER_PAGE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            name="search"
                            value={search}
                            placeholder={__('Search')}
                            className="bg-base xpo_h-40-px xpo_w-auto"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit"><Search className="icon" /></button>
                    </form>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => setPopup(<PayoutRequestForm maxAmount={maxAmount} />)}
                    className="btn btn-primary xpo_text-sm btn-sm px-12 py-12 radius-8 flex xpo_items-center xpo_gap-2"
                >
                    <Plus className="icon xpo_text-xl line-height-1" />
                    {__('Request a Payout')}
                </button>
            </div>

            <div className="card-body xpo_p-24">
                <div className="table-responsive scroll-sm">
                    {loading ? (
                        <div className="text-center py-20">{__('Loading...')}</div>
                    ) : (
                        <table className="table bordered-table sm-table xpo_mb-0">
                            <thead>
                                <tr>
                                    {/* <th>{__('S.L')}</th>
                                    <th>{__('Transection Date')}</th>
                                    <th>{__('Amount')}</th>
                                    <th>{__('Type')}</th>
                                    <th>{__('Reference')}</th>
                                    <th className="text-center">{__('Action')}</th> */}

                                    <th>{__('S.L')}</th>
                                    <th>{__('Created')}</th>
                                    <th>{__('Amount')}</th>
                                    <th>{__('Type')}</th>
                                    <th>{__('Status')}</th>
                                    <th className="text-center">{__('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions?.length > 0 ? transactions.map((item, index) => (
                                    // <tr key={item.id}>
                                    //     <td>{(page - 1) * perPage + index + 1}</td>
                                    //     <td>{strtotime(item.created_at).format('DD MMM YYYY')}</td>
                                    //     <td>{item.amount}</td>
                                    //     <td>{item.type}</td>
                                    //     <td>{item.reference}</td>
                                    //     <td className="text-center">
                                    //         <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                    //             <Link to={ home_url(`/transactions/${item.id}/view`) } className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center" ><Eye className="icon xpo_text-xl" /></Link>
                                    //             <button
                                    //                 className="bg-success-focus xpo_text-success-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                    //                 onClick={() => setPopup(<div>Hello from popup!</div>)}
                                    //             ><SquarePen className="icon" /></button>
                                    //             <button
                                    //                 className="bg-danger-focus xpo_text-danger-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                    //                 onClick={() => setPopup(<div>Hello from popup!</div>)}
                                    //             ><Trash2 className="icon" /></button>
                                    //         </div>
                                    //     </td>
                                    // </tr>
                                    <tr key={item.id}>
                                        <td>{(page - 1) * perPage + index + 1}</td>
                                        <td>{strtotime(item.created_at).format('DD MMM YYYY')}</td>
                                        <td>{print_money(item.amount, item.currency)}</td>
                                        <td className="capitalize">{item.method}</td>
                                        <td className="capitalize">{item.status}</td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <button
                                                    className="bg-success-focus xpo_text-success-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<ViewPayout item={item} setItems={setTransactions} />)}
                                                ><Eye className="icon xpo_text-xl" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="8" className="text-center">{__('No payment history found')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_flex-wrap xpo_gap-2 xpo_mt-24">
                    <span>{sprintf(
                        __('Showing %d to %d of %d entries'),
                        (page - 1) * perPage + 1,
                        Math.min(page * perPage, totalEntries),
                        totalEntries
                    )}</span>
                    <ul className="pagination flex xpo_flex-wrap xpo_items-center xpo_gap-2 xpo_justify-content-center">
                        <li className="page-item">
                            <button onClick={() => handlePageChange(page - 1)} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className="page-item">
                                <button
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`page-link ${page === i + 1 ? 'bg-primary-600 xpo_text-white' : 'bg-neutral-200'}`}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button onClick={() => handlePageChange(page + 1)} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}



function PayoutRequestForm({ maxAmount }) {
    const { __ } = useTranslation();
    const [form, setForm] = useState({
        method: '',
        comment: '',
        account_id: '',
        amount: 0,
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        request(rest_url('/sitecore/v1/payout/update'), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...form}),
        })
        .then(data => {
            if (data.success) {
                setSuccessMessage(__('Payout request submitted successfully!'));
                setForm(prev => ({...prev, amount: prev.amount, method: prev.method, comment: prev.comment}));
            } else {
                setErrorMessage(__('Failed to submit payout request: ') + data.message);
            }
        })
        .catch(err => {
            console.error('Error:', err);
            setErrorMessage(__('An error occurred while submitting the request. Please try again.'));
        })
        .finally(() => setLoading(false));
    };

    return (
        <div className="p-6 space-y-6 mx-auto xpo_w-[600px] xpo_max-w-full">
            <h5 className="text-lg font-semibold">{__('Request a Payout')}</h5>
            {successMessage && <div className="p-4 xpo_text-green-700 bg-green-100 border border-green-300 rounded">{successMessage}</div>}
            {errorMessage && <div className="p-4 xpo_text-red-700 bg-red-100 border border-red-300 rounded">{errorMessage}</div>}
    
            <form onSubmit={handleSubmit} className="xpo_flex xpo_flex-col xpo_gap-4">
                <div className="block">
                    <label className="xpo_flex xpo_gap-1xpo_items-center xpo_text-sm font-medium">
                        <span>{__('Amount')}</span>
                        {maxAmount ? <span>({__('Max')}: {maxAmount})</span> : null}
                    </label>
                    <input
                        required
                        type="number"
                        value={form.amount}
                        max={maxAmount}
                        placeholder={__('Enter amount')}
                        onChange={(e) => setForm(prev => ({...prev, amount: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 xpo_text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
    
                <div className="block">
                    <label className="block xpo_text-sm font-medium">{__('Payout Method')}</label>
                    <select
                        required
                        value={form.method}
                        onChange={(e) => setForm(prev => ({...prev, method: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 xpo_text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">{__('Select method')}</option>
                        <option value="bank">{__('Bank Transfer')}</option>
                        <option value="mobile">{__('Mobile Banking')}</option>
                        <option value="tap">{__('Tap')}</option>
                        <option value="stripe">{__('Stripe')}</option>
                        <option value="paypal">{__('PayPal')}</option>
                    </select>
                </div>
    
                <div className="block">
                    <label className="block xpo_text-sm font-medium">{__('Account number')}</label>
                    <input
                        required
                        type="text"
                        value={form.account_id}
                        placeholder={__('Enter account ID')}
                        onChange={(e) => setForm(prev => ({...prev, account_id: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 xpo_text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
    
                <div className="block">
                    <label className="block xpo_text-sm font-medium">{__('Note')}</label>
                    <textarea
                        rows="3"
                        value={form.comment}
                        placeholder={__('Optional message')}
                        onChange={(e) => setForm(prev => ({...prev, comment: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 xpo_text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
    
                <div className="xpo_flex xpo_justify-end xpo_gap-2">
                    <button
                        type="button"
                        className="px-4 py-2 xpo_text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                        onChange={(e) => setForm(prev => ({...prev, amount: maxAmount, method: '', comment: '', account_id: ''}))}
                    >
                        {__('Cancel')}
                    </button>
                    <button
                        type="submit"
                        className={`px-4 py-2 xpo_text-sm rounded-lg bg-primary-500 hover:bg-primary-600 xpo_text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? __('Submitting...') : __('Submit Request')}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ViewPayout({ item, setItems }) {
    const { __ } = useTranslation();
    const { print_money } = useCurrency();
    const [loading, setLoading] = useState(null);
    const { id, user_id, status, currency, amount, method, account_id, created_at, updated_at, approved_at, approved_by, comment } = item;

    const maskString = (s) => {
        if (!s) return s;
        const len = s?.length;
        if (len <= 4) return s;
        else if (len <= 8) return s.slice(0, 2) + '***' + s.slice(-2);
        else {
            const mid = Math.floor(len / 2);
            return s.slice(0, 4) + '***' + s.slice(mid, mid + 2) + '***' + s.slice(-4);
        }
    }


    const handleStatusChange = (event) => {
        event.preventDefault();
        const selected = event.target.value;
        const sure = selected === 'approved' ? confirm(__('Are you sure about this? This status might be an element of financial transection.')) : true;
        if (sure) {
            request(rest_url(`/sitecore/v1/payouts/${id}/${selected}`), {method: "POST", body: JSON.stringify({sure})})
            .then(data => {
                console.log(data);
                if (data?.new_status) {
                    setItems(list => list.map(l => l.id == id ? {...l, status: data.new_status} : l));
                    notify.success(__('Status updated successfully!'));
                }
            })
            .catch(err => notify.error(err?.response?.message??__('An error occurred while updating the status. Please try again.')))
            .finally(() => setLoading(false));
        }
    }
    
    return (
        <div className="mx-auto xpo_w-96">
            <h6>{__('Payout Details')}</h6>
            <div className="space-y-3">
                <div className="border-b xpo_pb-2">
                    <p className="text-lg font-medium">{__('Payout ID:')} <span className="font-normal">#{id}</span></p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('User ID:')}</strong><span>{user_id}</span>
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Amount:')}</strong><span>{print_money(amount, currency)}</span>
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Method:')}</strong><span>{method}</span>
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Account:')}</strong><span onMouseEnter={(e) => e.target.innerHTML = account_id} onMouseLeave={(e) => e.target.innerHTML = maskString(account_id)}>{maskString(account_id)}</span>
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Status:')} </strong> 
                        {status === "approved" ? (
                            <span className="text-success-main xpo_mb-0 capitalize"> {status}</span>
                        ) : (
                            (roles.has_ability('project_manager') && status === 'pending') ? (
                                <select defaultChecked={status} onChange={handleStatusChange}>
                                    <option value="approved">{__('Pending')}</option>
                                    <option value="approved">{__('Approved')}</option>
                                    <option value="declined">{__('Declined')}</option>
                                </select>
                            ) : <span className={ `mb-0 capitalize ${status === 'declined' ? 'text-danger-main' : 'text-warning-main'}` }> {__(status)}</span>
                        )}
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Created At:')}</strong><span>{strtotime(created_at).format('DD MMM YYYY HH:mm')}</span>
                    </p>
                    <p className="text-sm flex xpo_gap-1xpo_items-center">
                        <strong className="font-medium">{__('Updated At:')}</strong><span>{strtotime(updated_at).format('DD MMM YYYY HH:mm')}</span>
                    </p>
                    {approved_at && (
                        <p className="text-sm flex xpo_gap-1xpo_items-center">
                            <strong className="font-medium">{__('Approved At:')}</strong><span>{strtotime(approved_at).format('DD MMM YYYY HH:mm')} ({sprintf('Approved by User ID: %d', approved_by)})</span>
                        </p>
                    )}
                    {comment.trim() === '' &&
                        <p className="text-sm block">
                            <strong className="font-medium block">{__('Comment:')}</strong>
                            <p>{comment}</p>
                        </p>
                    }
                </div>
            </div>
        </div>
    );
}

