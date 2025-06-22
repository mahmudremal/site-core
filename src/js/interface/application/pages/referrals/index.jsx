import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url, strtotime } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Trash2, SquarePen, Eye, Search, ChevronsLeft, ChevronsRight, Mail, Globe, LocateOffIcon } from 'lucide-react';
import { sprintf } from 'sprintf-js';
// import { useParams } from "react-router";
import ReferralShareBox from "@components/element/ReferralShareBox";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

const Referrals = ({ filters = 'any' }) => {
    // const { filters = 'any' } = useParams();
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [status, setStatus] = useState(filters);

    const fetchReferrals = async () => {
        setLoading(true);
        const url = rest_url(`/sitecore/v1/referrals?page=${page}&s=${search}&status=${status}&per_page=${perPage}`);
        try {
            const res = await request(url);
            setReferrals(res?.list??[]);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        } catch (error) {
            console.error("Error fetching referrals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [page, perPage, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchReferrals();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="card xpo_p-0 radius-12 shadow-none xpo_p-0">
            <div className="card-header border-bottom bg-base py-16 px-24 flex xpo_items-center xpo_flex-wrap xpo_gap-3 xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-3">
                    <span className="text-md fw-medium xpo_text-secondary-light xpo_mb-0">{__('Show')}</span>
                    <select
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                        {PER_PAGE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>

                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="bg-base xpo_h-40-px xpo_w-auto"
                            name="search"
                            placeholder={__('Search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit"><Search className="icon" /></button>
                    </form>

                    <select
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card-body xpo_p-24">
                <div className="table-responsive scroll-sm">
                    {loading ? (
                        <div className="text-center py-20">{__('Loading...')}</div>
                    ) : (
                        <table className="table bordered-table sm-table xpo_mb-0">
                            <thead>
                                <tr>
                                    <th>{__('S.L')}</th>
                                    <th>{__('Join Date')}</th>
                                    <th>{__('Referrer ID')}</th>
                                    <th>{__('User ID')}</th>
                                    <th className="text-center">{__('Status')}</th>
                                    <th className="text-center">{__('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.length > 0 ? referrals.map((referral, index) => (
                                    <tr key={index}>
                                        <td>{(page - 1) * perPage + index + 1}</td>
                                        <td>{strtotime(referral.join_date).format('DD MMM YYYY')}</td>
                                        <td>{referral.id}</td>
                                        <td>{referral.display_name } #{referral.user_id}</td>
                                        <td className="text-center">
                                            {referral.converted == true || referral.verified == true ? (
                                                <span className="bg-success-focus xpo_text-success-600 border border-success-main px-24 py-4 radius-4 fw-medium xpo_text-sm">{__('Active')}</span>
                                            ) : (
                                                <span className="bg-neutral-200 xpo_text-neutral-600 border border-neutral-400 px-24 py-4 radius-4 fw-medium xpo_text-sm">{__('Inactive')}</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <Link to={ home_url(`/referrals/${referral.id}/view`) } className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center" ><Eye className="icon xpo_text-xl" /></Link>
                                                {/* <button
                                                    className="bg-success-focus xpo_text-success-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<div>Hello from popup!</div>)}
                                                ><SquarePen className="icon" /></button>
                                                <button
                                                    className="bg-danger-focus xpo_text-danger-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<div>Hello from popup!</div>)}
                                                ><Trash2 className="icon" /></button> */}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center">{__('No referrals found')}</td></tr>
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

export default function ReferralsScreen({ filters = 'any' }) {
    return (
        <div className="xpo_grid xpo_gap-4 md:xpo_grid-cols-4 md:xpo_grid-rows-3">
            <div className="md:xpo_col-span-3 md:xpo_row-span-3 sm:xpo_col-span-4">
                <div className="card xpo_h-100 radius-8 border-0">
                    <div className="card-body xpo_p-24">
                        <Referrals filters={filters} />
                    </div>
                </div>
            </div>
            <div className="md:xpo_col-span-1 sm:xpo_col-span-4">
                <div className="card xpo_h-100 radius-8 border-0">
                    <div className="card-body xpo_p-24">
                        <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-between">
                            <h6 className="mb-2 fw-bold xpo_text-lg">Campaigns</h6>
                        </div>
                        
                        <div className="mt-3">
                            <ReferralShareBox />
                        </div>

                    </div>
                </div>
            </div>
            <div className="md:xpo_col-span-1 sm:xpo_col-span-2">
                <div className="card xpo_h-100 radius-8 border-0">
                    <div className="card-body xpo_p-24">
                        <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-between">
                            <h6 className="mb-2 fw-bold xpo_text-lg">Campaigns</h6>
                            <div className="">
                                <select className="form-select form-select-sm xpo_w-auto bg-base border xpo_text-secondary-light">
                                    <option>Yearly</option>
                                    <option>Monthly</option>
                                    <option>Weekly</option>
                                    <option>Today</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-3">
                        
                            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-3 xpo_mb-12">
                                <div className="xpo_flex xpo_items-center">
                                    <span className="text-xxl line-height-1 flex align-content-center xpo_flex-shrink-0 xpo_text-orange">
                                        <Mail className="icon" />
                                    </span>
                                    <span className="text-primary-light fw-medium xpo_text-sm ps-12">Email</span>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                    <div className="w-100 xpo_max-w-66 ms-auto">
                                        <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                            <div className="progress-bar bg-orange rounded-pill" style={{width: '80%'}}></div>
                                        </div>
                                    </div>
                                    <span className="text-secondary-light font-xs fw-semibold">80%</span>
                                </div>
                            </div>
                            
                            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-3 xpo_mb-12">
                                <div className="xpo_flex xpo_items-center">
                                    <span className="text-xxl line-height-1 flex align-content-center xpo_flex-shrink-0 xpo_text-success-main">
                                        <Globe className="icon" />
                                    </span>
                                    <span className="text-primary-light fw-medium xpo_text-sm ps-12">Website</span>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                    <div className="w-100 xpo_max-w-66 ms-auto">
                                        <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                            <div className="progress-bar bg-success-main rounded-pill" style={{width: '60%'}}></div>
                                        </div>
                                    </div>
                                    <span className="text-secondary-light font-xs fw-semibold">60%</span>
                                </div>
                            </div>
                            
                            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-3 xpo_mb-12">
                                <div className="xpo_flex xpo_items-center">
                                    <span className="text-xxl line-height-1 flex align-content-center xpo_flex-shrink-0 xpo_text-info-main">
                                        <iconify-icon icon="fa6-brands:square-facebook" className="icon" />
                                    </span>
                                    <span className="text-primary-light fw-medium xpo_text-sm ps-12">Facebook</span>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                    <div className="w-100 xpo_max-w-66 ms-auto">
                                        <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                            <div className="progress-bar bg-info-main rounded-pill" style={{width: '49%'}}></div>
                                        </div>
                                    </div>
                                    <span className="text-secondary-light font-xs fw-semibold">49%</span>
                                </div>
                            </div>
                            
                            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-3">
                                <div className="xpo_flex xpo_items-center">
                                    <span className="text-xxl line-height-1 flex align-content-center xpo_flex-shrink-0 xpo_text-indigo">
                                        <LocateOffIcon className="icon" />
                                    </span>
                                    <span className="text-primary-light fw-medium xpo_text-sm ps-12">Email</span>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_w-100">
                                    <div className="w-100 xpo_max-w-66 ms-auto">
                                        <div className="progress progress-sm rounded-pill" role="progressbar" aria-label="Success example" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                            <div className="progress-bar bg-indigo rounded-pill" style={{width: '70%'}}></div>
                                        </div>
                                    </div>
                                    <span className="text-secondary-light font-xs fw-semibold">70%</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
            <div className="md:xpo_col-span-1 sm:xpo_col-span-2">
                <div className="card xpo_h-100 radius-8 border-0 overflow-hidden">
                    <div className="card-body xpo_p-24">
                        <div className="xpo_flex xpo_items-center xpo_flex-wrap xpo_gap-2 xpo_justify-between">
                            <h6 className="mb-2 fw-bold xpo_text-lg">Customer Overview</h6>
                            <div className="">
                                <select className="form-select form-select-sm xpo_w-auto bg-base border xpo_text-secondary-light">
                                    <option>Yearly</option>
                                    <option>Monthly</option>
                                    <option>Weekly</option>
                                    <option>Today</option>
                                </select>
                            </div>
                        </div>

                        <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_mt-3"> 
                            <ul className="xpo_flex-shrink-0">
                                <li className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-28">
                                    <span className="w-12-px xpo_h-12-px rounded-circle bg-success-main"></span>
                                    <span className="text-secondary-light xpo_text-sm fw-medium">Total: 500</span>
                                </li>
                                <li className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-28">
                                    <span className="w-12-px xpo_h-12-px rounded-circle bg-warning-main"></span>
                                    <span className="text-secondary-light xpo_text-sm fw-medium">New: 500</span>
                                </li>
                                <li className="xpo_flex xpo_items-center xpo_gap-2">
                                    <span className="w-12-px xpo_h-12-px rounded-circle bg-primary-600"></span>
                                    <span className="text-secondary-light xpo_text-sm fw-medium">Active: 1500</span>
                                </li>
                            </ul>
                            <div id="donutChart" className="xpo_flex-grow-1 apexcharts-tooltip-z-none title-style circle-none"></div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}