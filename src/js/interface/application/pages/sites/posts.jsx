import React, { useState, useEffect } from 'react';
import { usePopup } from '@context/PopupProvider';
import { useLoading } from '@context/LoadingProvider';
import { useTranslation } from '@context/LanguageProvider';
import { Link } from '@common/link';
import { useParams } from 'react-router-dom';
import request from '@common/request';
import { home_url, strtotime } from '@functions';
import { ChevronsLeft, ChevronsRight, Eye } from "lucide-react";
import { get_site, store_rest } from '.';
import { sprintf } from 'sprintf-js';


export default function Posts() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { site_id, post_type } = useParams();
    const [posts, setPosts] = useState([]);
    const [site, setSite] = useState(null);
    // const { setLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [filters, setFilters] = useState({
        post_status: 'all',
        orderby: 'date',
        status: 'any',
        order: 'desc',
        per_page: 20,
        page: 1,
        s: ''
    });

    useEffect(() => {
        if (site) {return;}
        get_site(site_id)
        .then(s => {
            setSite(s);
            setLoading(true);
            request(store_rest(s, `/sitecore/v1/posts/${post_type}?${Object.entries(filters).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')}`), {headers: {'Content-Type': 'application/json'}})
            .then(res => setPosts(res?.list??res))
            .catch(err => request.error_notify(err, __))
            .finally(() => setLoading(false));
        })
        .catch(err => request.error_notify(err, __));
    }, [site, filters]);

    return (
        <div className="card xpo_p-0 radius-12">
            <div className="card-header">
                <div className="xpo_flex xpo_items-center xpo_justify-between">
                    <h5 className="card-title xpo_mb-0 xpo_capitalize">{sprintf(__('Post Type (%s)'), post_type)}</h5>
                    <div className="card-header-action">
                        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-4 xpo_w-full">
                            <div className="btn-group radius-8" role="group" aria-label="Default button group">
                                {[
                                    ['all', __('All')],
                                    ['pending', __('Pending')],
                                    ['published', __('Published')],
                                    ['draft', __('Draft')],
                                    ['trash', __('Trash')]
                                ].map(([key, label], index) => (
                                    <button key={index} type="button" className={ `btn btn-link xpo_text-secondary-light xpo_text-decoration-none xpo_p-2 px-4 hover:bg-transparent ${filters.post_status == key && 'text-primary'}` } onClick={() => setFilters(prev => ({...prev, post_status: key}))}>{label}</button>
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
                                <th>{__('Post title')}</th>
                                <th>{__('Last Update')}</th>
                                <th>{__('Total vists')}</th>
                                <th className="text-center">{__('See more')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                               <tr>
                                    <td colSpan={4} className="px-4 py-6 xpo_text-center">
                                        <p className="fw-medium">{__('Loading...')}</p>
                                    </td>
                                </tr>
                            ) : (
                                posts.length == 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6">
                                            <div className="alert alert-warning bg-warning-100 xpo_text-warning-600 bpost-warning-100 px-24 py-11 xpo_mb-0 fw-semibold xpo_text-lg radius-8" role="alert">
                                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_text-lg">
                                                    {__('No posts found!')} 
                                                </div>
                                                <p className="fw-medium xpo_text-warning-600 xpo_text-sm xpo_mt-8">{__('Create a new post on that site will be found here.')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : posts.map((post, index) => (
                                    <tr key={index}>
                                        <td><span dangerouslySetInnerHTML={{__html: post.title}}></span></td>
                                        <td>{strtotime(post.last_updated).format('DD MMM, YY: HH')}</td>
                                        <td>{post.last_updated}</td>
                                        <td className="text-center">
                                            <div className="xpo_flex xpo_items-center xpo_gap-10 xpo_justify-content-center">
                                                <Link to={ home_url(`/sites/${site_id}/posttypes/${post_type}/${post.ID}`) } className="bg-info-focus xpo_text-info-600 xpo_w-40-px xpo_h-40-px rounded-circle flex xpo_justify-center xpo_items-center">
                                                    <Eye className="icon xpo_text-xl" />
                                                </Link>
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