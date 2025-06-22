import React, { useEffect, useState } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url, strtotime } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useCurrency } from "@context/CurrencyProvider";
import { useTranslation } from '@context/LanguageProvider';
import { Trash2, SquarePen, Eye, Plus, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { sprintf } from 'sprintf-js';


const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

export default function AIJobs({  }) {
    const { print_money } = useCurrency();
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('any');
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await request(rest_url(`/sitecore/v1/tasks?page=${page}&s=${search}&status=${status}&per_page=${perPage}`));
            setJobs(res?.list??[]);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page, perPage, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
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
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                        defaultValue={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                    >
                        {PER_PAGE_OPTIONS.map(opt => (
                            <option key={opt} defaultValue={opt}>{opt}</option>
                        ))}
                    </select>

                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="bg-base xpo_h-40-px xpo_w-auto"
                            name="search"
                            placeholder={__('Search')}
                            defaultValue={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit"><Search className="icon" /></button>
                    </form>

                    <select
                        className="form-select form-select-sm xpo_w-auto ps-12 py-6 radius-12 xpo_h-40-px"
                        defaultValue={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt} defaultValue={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <Link to={ home_url('/jobs/0/view') } className="btn btn-primary xpo_text-sm btn-sm px-12 py-12 radius-8 flex xpo_items-center xpo_gap-2">
                    <Plus className="icon xpo_text-xl line-height-1" />
                    {__('Add New Invoice')}
                </Link>
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
                                    <th>{__('Invoice')}</th>
                                    <th>{__('Email')}</th>
                                    <th>{__('Issue Date')}</th>
                                    <th>{__('Amount')}</th>
                                    <th className="text-center">{__('Status')}</th>
                                    <th className="text-center">{__('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.length > 0 ? jobs.map((job, index) => (
                                    <tr key={job.id}>
                                        <td>{(page - 1) * perPage + index + 1}</td>
                                        <td>
                                            <Link to={ home_url(`/jobs/${job.job_id}/view`) } className="text-primary-600">#{job.job_id}</Link>
                                        </td>
                                        <td>{job.client_email}</td>
                                        <td>{strtotime(job.created_at).format('DD MMM YYYY')}</td>
                                        <td>{print_money(job.total, job.currency)}</td>
                                        <td className="text-center">
                                            <span
                                                className={ `border ${job.status === 'paid' ? 'bg-success-focus xpo_text-success-600 border-success-main xpo_text-success-main' : 'bg-warning-focus xpo_text-warning-600 border-warning-main xpo_text-warning-main'} px-24 py-4 radius-4 fw-medium xpo_text-sm capitalize` }
                                            >{__(job.status)}</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <a
                                                    href={ job.status === 'paid' ? '#' : home_url(`../job/${job.job_id}/pay`) }
                                                    className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center" target="_blank"
                                                    onClick={(e) => {
                                                        if (job.status === 'paid') {
                                                            e.preventDefault();
                                                            setPopup(
                                                                <div className="text-center">
                                                                    <h4>{__('Invoice has been paid!')}</h4>
                                                                    <p>{__('Please find below your job issued by automattic system.')}</p>
                                                                </div>
                                                            );
                                                        }
                                                    }}
                                                ><Eye className="icon xpo_text-xl" /></a>
                                                <Link
                                                    to={ home_url(`/jobs/${job.job_id}/view`) }
                                                    className="bg-success-focus xpo_text-success-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                ><SquarePen className="icon" /></Link>
                                                <button
                                                    className="bg-danger-focus xpo_text-danger-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"
                                                    onClick={() => setPopup(<div>{__('Once an job generated, its not possible to delete permanently!')}</div>)}
                                                ><Trash2 className="icon" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="8" className="text-center">{__('No jobs found')}</td></tr>
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
                        {page > 1 && (
                            <li key="prev" className="page-item">
                                <button onClick={() => handlePageChange(page - 1)} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
                            </li>
                        )}
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className="page-item">
                                <button
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`page-link ${page === i + 1 ? 'bg-primary-600 xpo_text-white' : 'bg-neutral-200'}`}
                                >{i + 1}</button>
                            </li>
                        ))}
                        {page < totalPages && (
                            <li key="next" className="page-item">
                                <button onClick={() => handlePageChange(page + 1)} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
                            </li>
                        )}
                        
                    </ul>
                </div>
            </div>
        </div>
    );
}



