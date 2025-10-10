import { useState, useEffect, useCallback } from 'react';
import { Play, StopCircle, Loader2, Download, Plus, Edit2, Trash2, Search, Eye, ExternalLink } from 'lucide-react';
import { rest_url, sleep, home_url, strtotime } from "@functions";
import { Popup, __ } from '@js/utils';
import axios from 'axios';
import { sprintf } from 'sprintf-js';

const Affiliates = () => {
    const [links, setLinks] = useState([]);
    const [visits, setVisits] = useState([]);
    const [popup, setPopup] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    // Filters state
    const [filters, setFilters] = useState({
        page: 1,
        search: '',
        per_page: 10,
        sortOrder: 'desc',
        sortBy: 'created_at'
    });

    const fetchLinks = () => {
        setLoading(true);
        axios.get(rest_url('sitecore/v1/affiliates/links'), { params: {page: filters.page, per_page: filters.per_page, search: filters.search, sort_by: filters.sortBy, sort_order: filters.sortOrder} })
        .then(res => {
            setLinks(res.data);
            setPagination(prev => ({
                ...prev,
                total: parseInt(res.headers['x-wp-total'] ?? '0'),
                totalPages: parseInt(res.headers['x-wp-totalpages'] ?? '1')
            }));
        })
        .finally(() => setLoading(false));
    };


    const DeleteLink = ({ id = 0 }) => {
        const [deleting, setDeleting] = useState(null);
    
        return (
            <div className="xpo_block xpo_max-w-2xl">
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-4">
                    {__('Confirm Deletion', 'site-core')}
                </h3>
                <p className="xpo_text-gray-600 xpo_mb-6">
                    {__('Are you sure you want to delete this affiliate link? This action cannot be undone.', 'site-core')}
                </p>
                <div className="xpo_flex xpo_items-center xpo_justify-end xpo_gap-3">
                    <button
                        onClick={() => setPopup(null)}
                        className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-600 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_hover:xpo_bg-gray-50"
                    >
                        {__('Cancel', 'site-core')}
                    </button>
                    <button
                        onClick={() => sleep(10).then(() => setDeleting(true)).then(async () => await sleep(1500)).then(() => axios.delete(rest_url(`sitecore/v1/affiliates/link/${id}`)).then(() => {setPopup(null);fetchLinks();}).catch(err => console.error('Error deleting link:', err))).finally(() => setDeleting(false))}
                        className="xpo_px-4 xpo_py-2 xpo_bg-red-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_hover:xpo_bg-red-700"
                    >
                        {deleting ? __('Deleting...', 'site-core') : __('Delete', 'site-core')}
                    </button>
                </div>
            </div>
        );
    };

    const ViewLink = ({ data = {} }) => {
        const [link, setLink] = useState({...data});
        const [linkLoading, setLinkLoading] = useState(null);

        useEffect(() => {
            setLinkLoading(true);
            axios.get(rest_url(`sitecore/v1/affiliates/link/${link?.id}`))
            .then(res => setLink(res.data.link))
            .catch(err => console.error("Error fetching the link:", err))
            .finally(() => setLinkLoading(false));
        }, [link.id]);

        if (linkLoading) {
            return <div>Loading...</div>;
        }
    
        return (
            <div className="xpo_block xpo_max-w-2xl">
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-4">
                    {__('Link Details', 'site-core')}
                </h3>
                <div className="xpo_space-y-4">
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Shortcode', 'site-core')}
                        </label>
                        <code className="xpo_px-2 xpo_py-1 xpo_bg-gray-100 xpo_text-sm xpo_rounded xpo_font-mono">
                            {link.shortcode}
                        </code>
                    </div>
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Destination URL', 'site-core')}
                        </label>
                        <a
                            href={link.link}
                            className="xpo_text-primary-600 xpo_underline xpo_whitespace-unset xpo_break-words"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {link.link.substring(0, 50)}{link.link.length > 50 ? '...' : ''}
                        </a>
                    </div>
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Comments', 'site-core')}
                        </label>
                        <p className="xpo_text-gray-800 xpo_text-sm">{link.comments}</p>
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_gap-3">
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Created At:', 'site-core')}
                        </label>
                        <span className="xpo_text-gray-800 xpo_text-sm">{strtotime(link.created_at).format('DD MMM, YYYY hh:mm A')}</span>
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_gap-3">
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Visits:', 'site-core')}
                        </label>
                        <span className="xpo_text-gray-800 xpo_text-sm">{link.visits}</span>
                    </div>
                    <div className="xpo_flex xpo_items-center xpo_gap-3">
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Affiliate Link', 'site-core')}
                        </label>
                        <code className="xpo_px-2 xpo_py-1 xpo_bg-gray-100 xpo_text-sm xpo_rounded xpo_font-mono xpo_select-all" onClick={(e) => navigator.clipboard.writeText(link.url)}>
                            {link.url}
                        </code>
                    </div>
                </div>
            </div>
        );
    };

    const EditLink = ({ data = {} }) => {
        const [linkForm, setLinkForm] = useState({ id: 0, data: '', comments: '', shortcode: '', ...data });

        return (
            <form className="xpo_block xpo_max-w-2xl" onSubmit={e => {
                e.preventDefault();
                axios.post(rest_url(`sitecore/v1/affiliates/link/${linkForm?.id}`), linkForm)
                .then(() => setPopup(null))
                .then(() => fetchLinks())
                .catch(err => console.error('Error saving link:', err));
            }}>
                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-4">
                    {linkForm?.id != 0 ? __('Edit Link', 'site-core') : __('Add New Link', 'site-core')}
                </h3>
                <div className="xpo_space-y-4">
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Title', 'site-core')}
                        </label>
                        <input
                            type="text"
                            value={linkForm.title}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, title: e.target.value }))}
                            className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent"
                            placeholder={__('Enter link title...', 'site-core')}
                        />
                    </div>
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Shortcode', 'site-core')}
                        </label>
                        <input
                            type="text"
                            value={linkForm.shortcode}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, shortcode: e.target.value }))}
                            className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent"
                            placeholder="my-affiliate-link"
                        />
                    </div>
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Destination URL', 'site-core')}
                        </label>
                        <input
                            type="url"
                            value={linkForm.link}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, link: e.target.value }))}
                            className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent"
                            placeholder="https://example.com/affiliate-link"
                        />
                    </div>
                    <div>
                        <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                            {__('Comments', 'site-core')}
                        </label>
                        <textarea
                            rows="3"
                            value={linkForm.comments}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, comments: e.target.value }))}
                            className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent xpo_resize-none"
                            placeholder={__('Optional notes about this link...', 'site-core')}
                        />
                    </div>
                </div>
                <div className="xpo_flex xpo_items-center xpo_justify-end xpo_gap-3 xpo_mt-6">
                    <button
                        type="button"
                        onClick={() => setPopup(null)}
                        className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-600 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_hover:xpo_bg-gray-50"
                    >
                        {__('Cancel', 'site-core')}
                    </button>
                    <button
                        type="submit"
                        className="xpo_px-4 xpo_py-2 xpo_bg-primary-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_hover:xpo_bg-primary-700"
                    >
                        {linkForm?.id != 0 ? __('Update', 'site-core') : __('Create', 'site-core')}
                    </button>
                </div>
            </form>
        );
    };

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    useEffect(() => {
        axios.get(rest_url('sitecore/v1/affiliates/visits')).then(res => res.data).then(res => setVisits(res)).catch(err => console.error('Error fetching visits:', err));
    }, []);

    // Handle pagination and sorting changes
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchLinks();
        }, 1000);
        return () => clearTimeout(delay);
    }, [filters]);

    return (
        <div className="xpo_container xpo_mx-auto xpo_p-6 xpo_bg-white xpo_min-h-screen">
            <div className="xpo_mb-8">
                <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                    {__('Affiliate Links', 'site-core')}
                </h1>
                <p className="xpo_text-gray-600">
                    {__('Manage your affiliate links and track performance', 'site-core')}
                </p>
            </div>

            <div className="xpo_grid xpo_grid-cols-1 xpo_lg:xpo_grid-cols-3 xpo_gap-6">
                <div className="xpo_lg:xpo_col-span-2">
                    <div className="xpo_bg-white xpo_overflow-hidden xpo_rounded-lg xpo_shadow-sm xpo_border xpo_border-gray-200">
                        <div className="xpo_p-6 xpo_border-b xpo_border-gray-200">
                            <div className="xpo_flex xpo_flex-col xpo_sm:xpo_flex-row xpo_sm:xpo_items-center xpo_sm:xpo_justify-between xpo_gap-4 xpo_mb-4">
                                <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">
                                    {__('All Links', 'site-core')}
                                </h2>
                                <div className="xpo_flex xpo_items-center xpo_gap-3">
                                    <div className="xpo_relative">
                                        <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-4 xpo_h-4" />
                                        <input
                                            type="text"
                                            placeholder={__('Search links...', 'site-core')}
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="!xpo_pl-10 xpo_pr-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:border-transparent xpo_w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setPopup(<EditLink data={{}} />)}
                                        className="xpo_inline-flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-primary-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_hover:xpo_bg-primary-700 xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-primary-500 xpo_focus:ring-offset-2"
                                    >
                                        <Plus className="xpo_w-4 xpo_h-4 xpo_mr-2" />
                                        {__('Add Link', 'site-core')}
                                    </button>
                                </div>
                            </div>
                        
                            {/* Filters */}
                            <div className="xpo_flex xpo_items-center xpo_gap-4">
                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                    <label className="xpo_text-sm xpo_text-gray-600">{__('Sort by:', 'site-core')}</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="xpo_text-sm xpo_border xpo_border-gray-300 xpo_rounded xpo_px-2 xpo_py-1"
                                    >
                                        <option value="created_at">{__('Created Date', 'site-core')}</option>
                                        <option value="shortcode">{__('Shortcode', 'site-core')}</option>
                                        <option value="visits">{__('Visits', 'site-core')}</option>
                                    </select>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                    <label className="xpo_text-sm xpo_text-gray-600">{__('Order:', 'site-core')}</label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                        className="xpo_text-sm xpo_border xpo_border-gray-300 xpo_rounded xpo_px-2 xpo_py-1"
                                    >
                                        <option value="desc">{__('Descending', 'site-core')}</option>
                                        <option value="asc">{__('Ascending', 'site-core')}</option>
                                    </select>
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                    <label className="xpo_text-sm xpo_text-gray-600">{__('Per page:', 'site-core')}</label>
                                    <select
                                        value={filters.per_page}
                                        onChange={(e) => setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
                                        className="xpo_text-sm xpo_border xpo_border-gray-300 xpo_rounded xpo_px-2 xpo_py-1"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="xpo_overflow-x-auto">
                            {loading ? (
                                <div className="xpo_flex xpo_items-center xpo_justify-center xpo_p-12">
                                    <Loader2 className="xpo_w-8 xpo_h-8 xpo_animate-spin xpo_text-primary-600" />
                                </div>
                            ) : (
                                <table className="xpo_w-full">
                                    <thead className="xpo_bg-gray-50">
                                        <tr>
                                            <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                                                {__('Shortcode', 'site-core')}
                                            </th>
                                            <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                                                {__('Destination', 'site-core')}
                                            </th>
                                            <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                                                {__('Visits', 'site-core')}
                                            </th>
                                            <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                                                {__('Created', 'site-core')}
                                            </th>
                                            <th className="xpo_px-6 xpo_py-3 xpo_text-right xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                                                {__('Actions', 'site-core')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="xpo_bg-white xpo_divide-y xpo_divide-gray-200">
                                        {links.map((link) => (
                                            <tr key={link.id} className="xpo_hover:xpo_bg-gray-50">
                                                <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                                                    <div className="xpo_flex xpo_items-center">
                                                        <code className="xpo_px-2 xpo_py-1 xpo_bg-gray-100 xpo_text-sm xpo_rounded xpo_font-mono">
                                                            {link.shortcode}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td className="xpo_px-6 xpo_py-4">
                                                    <p className="xpo_text-sm xpo_text-gray-500 xpo_truncate">
                                                        {link.title || 0}
                                                    </p>
                                                    <div className="xpo_max-w-xs xpo_truncate">
                                                        <a
                                                            href={link.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="xpo_text-primary-600 xpo_hover:xpo_text-primary-800 xpo_hover:xpo_underline"
                                                        >
                                                            {link.link}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                                                    <span className="xpo_inline-flex xpo_items-center xpo_px-2.5 xpo_py-0.5 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-green-100 xpo_text-green-800">
                                                        {link.visits || 0}
                                                    </span>
                                                </td>
                                                <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                                                    {new Date(link.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-right xpo_text-sm xpo_font-medium">
                                                    <div className="xpo_flex xpo_items-center xpo_justify-end xpo_gap-2">
                                                        <button
                                                            onClick={() => setPopup(<ViewLink data={{...link}} />)}
                                                            className="xpo_text-gray-400 xpo_hover:xpo_text-gray-600"
                                                            title={__('View Details', 'site-core')}
                                                        >
                                                            <Eye className="xpo_w-4 xpo_h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setPopup(<EditLink data={{...link}} />)}
                                                            className="xpo_text-primary-600 xpo_hover:xpo_text-primary-800"
                                                            title={__('Edit Link', 'site-core')}
                                                        >
                                                            <Edit2 className="xpo_w-4 xpo_h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setPopup(<DeleteLink id={link.id} />)}
                                                            className="xpo_text-red-600 xpo_hover:xpo_text-red-800"
                                                            title={__('Delete Link', 'site-core')}
                                                        >
                                                            <Trash2 className="xpo_w-4 xpo_h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="xpo_px-6 xpo_py-3 xpo_border-t xpo_border-gray-200 xpo_flex xpo_items-center xpo_justify-between">
                                <div className="xpo_text-sm xpo_text-gray-600">
                                    {sprintf(
                                        __('Showing %s to %s of %s results', 'site-core'),
                                        ((filters.page - 1) * filters.per_page) + 1,
                                        Math.min(filters.page * filters.per_page, pagination.total),
                                        pagination.total
                                    )}
                                </div>
                                <div className="xpo_flex xpo_items-center xpo_gap-2">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                        className="xpo_px-3 xpo_py-1 xpo_text-sm xpo_text-gray-600 xpo_border xpo_border-gray-300 xpo_rounded xpo_hover:xpo_bg-gray-50 xpo_disabled:xpo_opacity-50 xpo_disabled:xpo_cursor-not-allowed"
                                    >
                                        {__('Previous', 'site-core')}
                                    </button>
                                    <span className="xpo_text-sm xpo_text-gray-600">
                                        {sprintf(__('Page %s of %s', 'site-core'), filters.page, pagination.totalPages)}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                        disabled={filters.page === pagination.totalPages}
                                        className="xpo_px-3 xpo_py-1 xpo_text-sm xpo_text-gray-600 xpo_border xpo_border-gray-300 xpo_rounded xpo_hover:xpo_bg-gray-50 xpo_disabled:xpo_opacity-50 xpo_disabled:xpo_cursor-not-allowed"
                                    >
                                        {__('Next', 'site-core')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="xpo_space-y-6">
                    <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_border xpo_border-gray-200 xpo_p-6">
                        <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-4">
                            {__('Quick Stats', 'site-core')}
                        </h3>
                        <div className="xpo_space-y-4">
                            <div className="xpo_flex xpo_items-center xpo_justify-between">
                                <span className="xpo_text-sm xpo_text-gray-600">
                                    {__('Total Links', 'site-core')}
                                </span>
                                <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{pagination.total}</span>
                            </div>
                            <div className="xpo_flex xpo_items-center xpo_justify-between">
                                <span className="xpo_text-sm xpo_text-gray-600">
                                    {__('Total Visits', 'site-core')}
                                </span>
                                <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                                    {links.reduce((sum, link) => sum + (parseInt(link.visits) || 0), 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {visits.length > 0 && (
                        <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_border xpo_border-gray-200">
                            <div className="xpo_p-6 xpo_border-b xpo_border-gray-200">
                                <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                                    {__('Recent Visits', 'site-core')}
                                </h3>
                            </div>
                            <div className="xpo_overflow-x-auto">
                                <table className="xpo_min-w-full xpo_divide-y xpo_divide-gray-200">
                                    <thead className="xpo_bg-gray-50">
                                        <tr>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                IP Address
                                            </th>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                Device
                                            </th>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                OS
                                            </th>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                Browser
                                            </th>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                Location
                                            </th>
                                            <th className="xpo_px-4 xpo_py-3 xpo_text-right xpo_text-xs xpo_font-medium xpo_text-gray-500">
                                                Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="xpo_bg-white xpo_divide-y xpo_divide-gray-100">
                                        {visits.map((visit) => (
                                            <tr key={visit.id}>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-gray-900">{visit.ip_address}</td>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-gray-700">{visit.device_type}</td>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-gray-700">
                                                    {visit.os_name} {visit.os_version}
                                                </td>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-gray-700">
                                                    {visit.browser_name} {visit.browser_version}
                                                </td>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-gray-700">
                                                    <a href={`https://www.google.com/maps/@${visit.latlon},${16}z`} className="xpo_text-primary-600 xpo_hover:xpo_underline" target="_blank" rel="noopener noreferrer">{visit.city}, {visit.country}</a>
                                                </td>
                                                <td className="xpo_px-4 xpo_py-3 xpo_text-sm xpo_text-right xpo_text-gray-500">
                                                    {new Date(visit._time).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    
                </div>
            </div>

            {/* Popup component */}
            {popup ? <Popup onClose={() => setPopup(null)}>{popup}</Popup> : null}
        </div>
    );
};

export default Affiliates;