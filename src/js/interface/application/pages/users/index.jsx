
import React, { useEffect, useState, useRef } from "react";
import { Link } from '@common/link';
import request from "@common/request";
import { home_url, rest_url, strtotime } from "@functions";
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Trash2, SquarePen, Eye, Plus, Search, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { sprintf } from 'sprintf-js';
import { UserCard } from "@components/element/usercard";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];
const STATUS_OPTIONS = ["any", "active", "inactive"];

export default function Users({ viewType = 'list' }) {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('any');
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [gridView, setGridView] = useState(viewType == 'grid');

    const fetchUsers = async () => {
        setLoading(true);
        const url = rest_url(`/sitecore/v1/users?page=${page}&s=${search}&status=${status}&per_page=${perPage}`);
        try {
            const res = await request(url);
            const sortedUsers = (res?.list??[]).map(r => ({
                id: r.id,
                email: r.email,
                name: `${r.first_name} ${r.last_name}`,
                join_date: parseInt(r.meta?.['wp_user-settings-time']?.join('') || 0),
                department: 'N/A',
                designation: 'N/A',
                status: 'active',
                avater: r.avater
            }))
            setUsers(sortedUsers || []);
            setTotalPages(res.totalPages || 1);
            setTotalEntries(res.total || 0);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, perPage, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
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

                <Link to={ home_url('/users/0/edit') } className="btn btn-primary xpo_text-sm btn-sm px-12 py-12 radius-8 flex xpo_items-center xpo_gap-2">
                    <Plus className="icon xpo_text-xl line-height-1" />
                    {__('Add New User')}
                </Link>
            </div>

            <div className="card-body xpo_p-24">
                <div className="table-responsive scroll-sm">
                    {loading ? (
                        <div className="text-center py-20">{__('Loading...')}</div>
                    ) : (
                        gridView ? (
                            <div className="row">
                                {users.length > 0 ? users.map((user, index) => (
                                    <div key={index} className="col-xxl-3 col-md-6 user-grid-card">
                                        <UserCard user={user} index={index} />
                                    </div>
                                )) : (
                                    <p>{__('No users found')}</p>
                                )}
                            </div>
                        ) : (
                            <table className="table bordered-table sm-table xpo_mb-0">
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
                                    {users.length > 0 ? users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td>{(page - 1) * perPage + index + 1}</td>
                                            <td>{strtotime(user.join_date).format('DD MMM YYYY')}</td>
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
                                                    <Link to={ home_url(`/users/${user.id}/view`) } className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center" ><Eye className="icon xpo_text-xl" /></Link>
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
                                        <tr><td colSpan="8" className="text-center">{__('No users found')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )
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

