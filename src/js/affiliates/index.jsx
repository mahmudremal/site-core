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
        axios.get(rest_url('sitecore/v1/affiliates/links'), { params: { page: filters.page, per_page: filters.per_page, search: filters.search, sort_by: filters.sortBy, sort_order: filters.sortOrder } })
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
            <div className="block max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {__('Confirm Deletion', 'site-core')}
                </h3>
                <p className="text-gray-600 mb-6">
                    {__('Are you sure you want to delete this affiliate link? This action cannot be undone.', 'site-core')}
                </p>
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => setPopup(null)}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {__('Cancel', 'site-core')}
                    </button>
                    <button
                        onClick={() => sleep(10).then(() => setDeleting(true)).then(async () => await sleep(1500)).then(() => axios.delete(rest_url(`sitecore/v1/affiliates/link/${id}`)).then(() => { setPopup(null); fetchLinks(); }).catch(err => console.error('Error deleting link:', err))).finally(() => setDeleting(false))}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                    >
                        {deleting ? __('Deleting...', 'site-core') : __('Delete', 'site-core')}
                    </button>
                </div>
            </div>
        );
    };

    const ViewLink = ({ data = {} }) => {
        const [link, setLink] = useState({ ...data });
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
            <div className="block max-w-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {__('Link Details', 'site-core')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Shortcode', 'site-core')}
                        </label>
                        <code className="px-2 py-1 bg-gray-100 text-sm rounded font-mono">
                            {link.shortcode}
                        </code>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Destination URL', 'site-core')}
                        </label>
                        <a
                            href={link.link}
                            className="text-primary-600 underline whitespace-unset break-words"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {link.link.substring(0, 50)}{link.link.length > 50 ? '...' : ''}
                        </a>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Comments', 'site-core')}
                        </label>
                        <p className="text-gray-800 text-sm">{link.comments}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Created At:', 'site-core')}
                        </label>
                        <span className="text-gray-800 text-sm">{strtotime(link.created_at).format('DD MMM, YYYY hh:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Visits:', 'site-core')}
                        </label>
                        <span className="text-gray-800 text-sm">{link.visits}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Affiliate Link', 'site-core')}
                        </label>
                        <code className="px-2 py-1 bg-gray-100 text-sm rounded font-mono select-all" onClick={(e) => navigator.clipboard.writeText(link.url)}>
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
            <form className="block max-w-2xl" onSubmit={e => {
                e.preventDefault();
                axios.post(rest_url(`sitecore/v1/affiliates/link/${linkForm?.id}`), linkForm)
                    .then(() => setPopup(null))
                    .then(() => fetchLinks())
                    .catch(err => console.error('Error saving link:', err));
            }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {linkForm?.id != 0 ? __('Edit Link', 'site-core') : __('Add New Link', 'site-core')}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Title', 'site-core')}
                        </label>
                        <input
                            type="text"
                            value={linkForm.title}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder={__('Enter link title...', 'site-core')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Shortcode', 'site-core')}
                        </label>
                        <input
                            type="text"
                            value={linkForm.shortcode}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, shortcode: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="my-affiliate-link"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Destination URL', 'site-core')}
                        </label>
                        <input
                            type="url"
                            value={linkForm.link}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, link: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="https://example.com/affiliate-link"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {__('Comments', 'site-core')}
                        </label>
                        <textarea
                            rows="3"
                            value={linkForm.comments}
                            onChange={(e) => setLinkForm(prev => ({ ...prev, comments: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder={__('Optional notes about this link...', 'site-core')}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setPopup(null)}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {__('Cancel', 'site-core')}
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
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
        <div className="container mx-auto p-6 bg-white min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {__('Affiliate Links', 'site-core')}
                </h1>
                <p className="text-gray-600">
                    {__('Manage your affiliate links and track performance', 'site-core')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {__('All Links', 'site-core')}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder={__('Search links...', 'site-core')}
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="!pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setPopup(<EditLink data={{}} />)}
                                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {__('Add Link', 'site-core')}
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">{__('Sort by:', 'site-core')}</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="created_at">{__('Created Date', 'site-core')}</option>
                                        <option value="shortcode">{__('Shortcode', 'site-core')}</option>
                                        <option value="visits">{__('Visits', 'site-core')}</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">{__('Order:', 'site-core')}</label>
                                    <select
                                        value={filters.sortOrder}
                                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value="desc">{__('Descending', 'site-core')}</option>
                                        <option value="asc">{__('Ascending', 'site-core')}</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">{__('Per page:', 'site-core')}</label>
                                    <select
                                        value={filters.per_page}
                                        onChange={(e) => setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="flex items-center justify-center p-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {__('Shortcode', 'site-core')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {__('Destination', 'site-core')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {__('Visits', 'site-core')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {__('Created', 'site-core')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {__('Actions', 'site-core')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {links.map((link) => (
                                            <tr key={link.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <code className="px-2 py-1 bg-gray-100 text-sm rounded font-mono">
                                                            {link.shortcode}
                                                        </code>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {link.title || 0}
                                                    </p>
                                                    <div className="max-w-xs truncate">
                                                        <a
                                                            href={link.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary-600 hover:text-primary-800 hover:underline"
                                                        >
                                                            {link.link}
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {link.visits || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(link.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setPopup(<ViewLink data={{ ...link }} />)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title={__('View Details', 'site-core')}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setPopup(<EditLink data={{ ...link }} />)}
                                                            className="text-primary-600 hover:text-primary-800"
                                                            title={__('Edit Link', 'site-core')}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setPopup(<DeleteLink id={link.id} />)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title={__('Delete Link', 'site-core')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {sprintf(
                                        __('Showing %s to %s of %s results', 'site-core'),
                                        ((filters.page - 1) * filters.per_page) + 1,
                                        Math.min(filters.page * filters.per_page, pagination.total),
                                        pagination.total
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {__('Previous', 'site-core')}
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        {sprintf(__('Page %s of %s', 'site-core'), filters.page, pagination.totalPages)}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                                        disabled={filters.page === pagination.totalPages}
                                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {__('Next', 'site-core')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {__('Quick Stats', 'site-core')}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {__('Total Links', 'site-core')}
                                </span>
                                <span className="text-lg font-semibold text-gray-900">{pagination.total}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    {__('Total Visits', 'site-core')}
                                </span>
                                <span className="text-lg font-semibold text-gray-900">
                                    {links.reduce((sum, link) => sum + (parseInt(link.visits) || 0), 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {visits.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {__('Recent Visits', 'site-core')}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                IP Address
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                Device
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                OS
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                Browser
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                Location
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                                                Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {visits.map((visit) => (
                                            <tr key={visit.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{visit.ip_address}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{visit.device_type}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {visit.os_name} {visit.os_version}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {visit.browser_name} {visit.browser_version}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    <a href={`https://www.google.com/maps/@${visit.latlon},${16}z`} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">{visit.city}, {visit.country}</a>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-500">
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