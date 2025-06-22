import React, { useState, useEffect } from 'react';
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { useParams } from 'react-router-dom';
import request from '@common/request';
import { home_url, rest_url, notify, strtotime } from '@functions';
import { ChevronsLeft, ChevronsRight, Eye } from "lucide-react";
import { get_site, store_rest } from '.';
import { sprintf } from 'sprintf-js';

export default function Users() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { site_id } = useParams();
    const { loading, setLoading } = useLoading();
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [users, setUsers] = useState([]);
    const [site, setSite] = useState(null);
    const [filters, setFilters] = useState({
        user_type: 'all',
        userby: 'date',
        status: 'any',
        user: 'desc',
        per_page: 20,
        page: 1,
        s: ''
    });

    useEffect(() => {
        if (site) {return;}
        get_site(site_id)
        .then(s => setSite(s))
        .catch(err => request.error_notify(err, __))
        .finally(() => fetch_users());
    }, [site]);

    const userVariants = [
        {key: 'pending', label: __('Pending')},
        {key: 'fulfilled', label: __('Fulfilled')},
    ];

    const fetch_users = () => {
        if(!site) {return;}
        setLoading(true);
        request(store_rest(site, `/sitecore/v1/users?${Object.entries(filters).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')}`), {headers: {'Content-Type': 'application/json'}})
        .then(res => {
            setUsers(res?.list??[]);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        })
        .catch(err => request.error_notify(err, __))
        .finally(() => setLoading(false));
    }
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetch_users();
        }, 1000); // 1000ms = 1 second delay

        return () => clearTimeout(delayDebounce);
    }, [site, filters]);

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <h5 className="card-title xpo_mb-0">{__('Site users')}</h5>
                    <div className="card-header-action">
                        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-4 xpo_w-full">
                            <div className="btn-group radius-8" role="group" aria-label="Default button group">
                                {[
                                    ['all', __('All')],
                                    ['editor', __('Editor')],
                                    ['subscriber', __('Subscriber')],
                                    ['administrative', __('Administrative')]
                                ].map(([key, label], index) => (
                                    <button key={index} type="button" className={ `btn btn-link xpo_text-secondary-light xpo_text-decoration-none xpo_p-2 hover:bg-transparent ${filters.user_type == key && 'text-primary'}` } onClick={() => setFilters(prev => ({...prev, user_type: key}))}>{label}</button>
                                ))}
                            </div>
                            <div className="xpo_flex xpo_items-center">
                                <div className="form-group xpo_mb-0 me-3">
                                    <input type="text" className="form-control" placeholder={__('Search...')} value={filters.search} onChange={(e) => setFilters({ ...filters, s: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table basic-border-table xpo_mb-0">
                        <thead>
                            <tr>
                                <th>{__('S.L')}</th>
                                <th>{__('Join Date')}</th>
                                <th>{__('Name')}</th>
                                <th>{__('Email')}</th>
                                <th>{__('Department')}</th>
                                <th>{__('Designation')}</th>
                                <th className="text-center">{__('Status')}</th>
                                <th className="text-center">{__('Action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                               <tr>
                                    <td colSpan={8} className="px-4 py-6 xpo_text-center">
                                        <p className="fw-medium">{__('Loading...')}</p>
                                    </td>
                                </tr>
                            ) : (
                                users.length == 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-6">
                                            <div className="alert alert-warning bg-warning-100 xpo_text-warning-600 buser-warning-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8" role="alert">
                                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-lg">
                                                    {__('No users found!')} 
                                                </div>
                                                <p className="fw-medium xpo_text-warning-600 xpo_text-sm xpo_mt-8">{__('Create a new user to make purchase, to start a project or to do a thing here. Store is required to create before start with us.')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.map((user, index) => (
                                    <tr key={index}>
                                        <td>{(filters.page - 1) * filters.per_page + index + 1}</td>
                                        <td>{strtotime(user?.join_date??user?.data?.user_registered??0).format('DD MMM YYYY')}</td>
                                        <td>
                                            <div className="xpo_flex xpo_items-center xpo_gap-3">
                                                <div className="relative">
                                                    <img src={user.avater} alt="" className="w-40-px xpo_h-40-px rounded-circle" />
                                                    <div className="absolute top-0 start-0 end-0 bottom-0 xpo_w-full xpo_h-full"></div>
                                                </div>
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.department}</td>
                                        <td>{user.designation}</td>
                                        <td className="text-center">
                                            {user.status === 'active' ? (
                                                <span className="bg-success-focus xpo_text-success-600 border border-success-main px-24 py-4 radius-4 fw-medium xpo_text-sm">{__('Active')}</span>
                                            ) : (
                                                <span className="bg-neutral-200 xpo_text-neutral-600 border border-neutral-400 px-24 py-4 radius-4 fw-medium xpo_text-sm">{__('Inactive')}</span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <Link to={home_url(`/sites/${site_id}/users/${user?.ID}`)} className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center"><Eye className="icon xpo_text-xl" /></Link>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card-footer">
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_flex-wrap xpo_gap-2 xpo_mt-24">
                    <span>{sprintf(
                        __('Showing %d to %d of %d entries'),
                        (filters.page - 1) * filters.per_page + 1,
                        Math.min(filters.page * filters.per_page, totalEntries),
                        totalEntries
                    )}</span>
                    <ul className="pagination flex xpo_flex-wrap xpo_items-center xpo_gap-2 xpo_justify-content-center">
                        <li className="page-item">
                            <button onClick={() => setFilters(prev => ({...prev, page: filters.page - 1}))} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className="page-item">
                                <button
                                    onClick={() => setFilters(prev => ({...prev, page: i + 1}))}
                                    className={`page-link ${filters.page === i + 1 ? 'bg-primary-600 xpo_text-white' : 'bg-neutral-200'}`}
                                >
                                    {i + 1}
                                </button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button onClick={() => setFilters(prev => ({...prev, page: filters.page + 1}))} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}