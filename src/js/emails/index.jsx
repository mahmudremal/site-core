import React, { useState, useEffect, Suspense } from 'react';
import { Search, Edit, Trash2, ChevronUp, ChevronDown, PlusIcon, FileText, Layers, Settings2, Loader2 } from 'lucide-react';
import { BuilderProvider, useBuilder } from './context';
import { ElementPreview } from './renderer';
import { Sidebar } from './sidebar';
import { Header } from './header';
import axios from 'axios';
import { HashRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Popup } from '@js/utils';
import TemplateRelations from './relations';

export const EmptyState = ({
  Icon = null,
  show_buttons = true,
  title = 'Start Building Your Email',
  subtitle = 'Select elements from the sidebar to start creating your email template. Drag and drop to arrange your content exactly how you want it.'
}) => {
  if (!Icon) Icon = FileText;
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        {show_buttons && <div className="flex items-center justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Choose Template
          </button>
          <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
            Start from Scratch
          </button>
        </div>}
      </div>
    </div>
  );
}

export const EmailBuilder = () => {
  const {
    template,
    isLoading
  } = useBuilder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex p-0">
          {!template?.elements?.length ? <ElementPreview /> : <ElementPreview />}
        </div>
      </div>
    </div>
  );
};

export const EmailBuilderEditor = () => {
  const { id: template_id } = useParams();
  useEffect(() => {
    const notices = document.querySelectorAll('#wpbody-content > .notice');
    notices.forEach(notice => notice.remove());
    // 
    return () => notices.forEach(notice => notice.remove());
  }, []);

  return (
    <BuilderProvider id={template_id}>
      <div className="fixed top-0 left-0 w-full h-screen z-[9999999999]">
        <EmailBuilder />
      </div>
    </BuilderProvider>
  );
};

const EmailTemplates = () => {
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [filters, setFilters] = useState({
    status: 'any', page: 1, search: '', per_page: 10, order: 'DESC', order_by: 'id',
  });
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0 });

  const fetch_data = async () => {
    setLoading(true);
    axios.get(`/wp-json/sitecore/v1/emails/templates`, { params: { ...filters } })
      .then(res => {
        setPagination(prev => ({
          ...prev,
          totalItems: parseInt(res.headers.get('x-wp-total') || '0'),
          totalPages: parseInt(res.headers.get('x-wp-totalpages') || '0')
        }));
        setTemplates(res.data);
        return res.data;
      })
      .catch(err => console.error('Error fetching templates:', err))
      .finally(() => setLoading(false))

  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch_data();
    }, 1500);
    // 
    return () => clearTimeout(delay);
  }, [filters]);


  const SortIcon = ({ field }) => {
    if (filters.order_by !== field) return null;
    return filters.order === 'ASC' ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const TableSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="border-b border-gray-200">
          <div className="px-6 py-4 flex items-center space-x-4">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-300 rounded flex-1"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
              <div className="h-8 w-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.inactive}`}>
        {status || 'inactive'}
      </span>
    );
  };

  const EditEmailTemplateForm = ({ data = {} }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [_type, setType] = useState(data?._type ?? 'template');
    const [title, setTitle] = useState(data?.title ?? 'New Template');
    const [_status, setStatus] = useState(data?._status ?? 'publish');

    const handleSubmit = (e) => {
      e.preventDefault();
      setSaving(true);
      const payload = { ...data, title, _type, _status };
      axios.post(`/wp-json/sitecore/v1/emails/templates/${data?.id ?? 0}`, payload)
        .then((res) => res.data).then((res) => {
          setTemplates(prev => (data?.id <= 0) ? [payload, ...prev] : prev.map(t => t.id == data.id ? payload : t));
          data?.id <= 0 ? navigate(`/${res.id}/edit`) : setPopup(null);
        }).catch((err) => console.error(err)).finally(() => setSaving(false));
    };

    const template_types = ['template', 'section', 'cta', 'header', 'footer', 'block', 'component'];
    const template_status = ['publish', 'draft', 'trash'];

    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {data?.id <= 0 ? 'Create New Email Template' : 'Edit Email Template'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <div className="relative">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" disabled={saving} />
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="relative">
              <select value={_type} disabled={saving} onChange={(e) => setType(e.target.value)} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 capitalize outline-none">
                {template_types.map((option, index) => <option key={index} value={option}>{option}</option>)}
              </select>
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Status
            </label>
            <div className="relative">
              <select value={_status} disabled={saving} onChange={(e) => setStatus(e.target.value)} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 capitalize outline-none">
                {template_status.map((status, index) => <option key={index} value={status}>{status}</option>)}
              </select>
              <Settings2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className={`mt-5 sm:mt-4 grid grid-cols-1 ${data?.id ? 'lg:grid-cols-[3fr_2fr]' : ''} gap-3`}>
            {data?.id && (
              <div className="flex w-full">
                <Link to={`/${data.id}/edit`} title="Edit template" className="relative inline-flex items-center justify-center w-full p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                  <span className="relative w-full text-center px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                    Edit template
                  </span>
                </Link>
              </div>
            )}

            <div className="w-full gap-3 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={saving}
                className="justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => setPopup(null)} className="mt-3 justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>

            <div className="flex gap-3 items-center">
              {/* Search Bar */}
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  placeholder="Search templates..."
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                title="Insert New"
                onClick={e => setPopup(<EditEmailTemplateForm />)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'id', order: prev.order_by == 'id' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  ID <SortIcon field="id" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'title', order: prev.order_by == 'title' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Title <SortIcon field="title" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Type <SortIcon field="_type" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_status', order: prev.order_by == '_status' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Status <SortIcon field="_status" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'created_at', order: prev.order_by == 'created_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Created <SortIcon field="created_at" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'updated_at', order: prev.order_by == 'updated_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Updated <SortIcon field="updated_at" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {filters.search ? 'No templates found matching your search.' : 'No templates found.'}
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{template.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template._type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(template._status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(template.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(template.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          title="Edit template"
                          onClick={() => setPopup(<EditEmailTemplateForm data={template} />)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        >
                          <Edit role="button" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setPopup(
                            <div className="inline-block align-bottom rounded-lg text-left overflow-hidden transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
                              <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                  <Trash2 className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Delete Email Template
                                  </h3>
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                      Are you sure you want to delete "<span className="font-medium">{template?.title}</span>"? This action cannot be undone.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                  type="button"
                                  disabled={deleting}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleting(true);
                                    axios.delete(`/wp-json/sitecore/v1/emails/templates/${template.id}`)
                                      .then(res => setTemplates(prev => prev.filter(t => t.id !== template.id)))
                                      .then(() => fetch_data()).catch(err => console.error('Error deleting template:', err))
                                      .finally(() => setDeleting(false))
                                  }}
                                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                  {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                  type="button"
                                  disabled={deleting}
                                  onClick={() => setPopup(null)}
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page - 1) * filters.per_page) + 1} to {Math.min(filters.page * filters.per_page, pagination.totalItems)} of {pagination.totalItems} results
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, filters.page - 1) }))}
                  disabled={filters.page === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, filters.page - 2)) + index;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, pageNum) }))}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${filters.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, filters.page + 1) }))}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup model */}
        {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
      </div>
      {/* <div className="bg-white shadow-lg rounded-lg overflow-hidden"></div> */}
    </div>
  );
}

const EmailTemplatesHome = () => {
  return (
    <div className="grid md:grid-cols-[3fr_2fr] gap-3">
      <EmailTemplates />
      <TemplateRelations />
    </div>
  );
}

export default function Application() {
  return (
    <HashRouter>
      <Toaster />
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <Routes>
          <Route path={'/'} element={<EmailTemplatesHome />} />
          <Route path={'/:id/edit'} element={<EmailBuilderEditor />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
