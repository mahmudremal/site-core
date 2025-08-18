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
  Icon=null,
  show_buttons = true,
  title = 'Start Building Your Email',
  subtitle='Select elements from the sidebar to start creating your email template. Drag and drop to arrange your content exactly how you want it.'
}) => {
  if (!Icon) Icon = FileText;
  return (
    <div className="xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center">
      <div className="xpo_text-center xpo_max-w-md">
        <div className="xpo_w-24 xpo_h-24 xpo_border-2 xpo_border-dashed xpo_border-gray-200 xpo_rounded-2xl xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-6">
          <Icon size={32} className="xpo_text-gray-400" />
        </div>
        <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">{title}</h2>
        <p className="xpo_text-gray-600 xpo_mb-6">{subtitle}</p>
        {show_buttons && <div className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-4">
          <button className="xpo_px-6 xpo_py-3 xpo_bg-blue-600 hover:xpo_xpo_bg-blue-700 xpo_text-white xpo_rounded-lg xpo_font-medium xpo_transition-colors">
            Choose Template
          </button>
          <button className="xpo_px-6 xpo_py-3 xpo_border xpo_border-gray-300 hover:xpo_xpo_bg-gray-50 xpo_text-gray-700 xpo_rounded-lg xpo_font-medium xpo_transition-colors">
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
      <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-full xpo_bg-gray-50">
        <div className="xpo_text-center">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-500 xpo_mx-auto xpo_mb-4"></div>
          <p className="xpo_text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_flex xpo_flex-col xpo_h-full xpo_bg-gray-50">
      <Header />
      <div className="xpo_flex xpo_flex-1 xpo_overflow-hidden">
        <Sidebar />
        <div className="xpo_flex-1 xpo_flex xpo_p-0">
          {! template?.elements?.length ? <ElementPreview /> : <ElementPreview />}
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
      <div className="xpo_fixed xpo_top-0 xpo_left-0 xpo_w-full xpo_h-screen xpo_z-[9999999999]">
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
  const [pagination, setPagination] = useState({totalItems: 0, totalPages: 0});

  const fetch_data = async () => {
    setLoading(true);
    axios.get(`/wp-json/sitecore/v1/emails/templates`, {params: {...filters}})
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
      <ChevronUp className="xpo_w-4 xpo_h-4 xpo_inline xpo_ml-1" /> : 
      <ChevronDown className="xpo_w-4 xpo_h-4 xpo_inline xpo_ml-1" />;
  };

  const TableSkeleton = () => (
    <div className="xpo_animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="xpo_border-b xpo_border-gray-200">
          <div className="xpo_px-6 xpo_py-4 xpo_flex xpo_items-center xpo_space-x-4">
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-16"></div>
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_flex-1"></div>
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-20"></div>
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-24"></div>
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-24"></div>
            <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-24"></div>
            <div className="xpo_flex xpo_space-x-2">
              <div className="xpo_h-8 xpo_w-8 xpo_bg-gray-300 xpo_rounded"></div>
              <div className="xpo_h-8 xpo_w-8 xpo_bg-gray-300 xpo_rounded"></div>
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
      active: 'xpo_bg-green-100 xpo_text-green-800',
      inactive: 'xpo_bg-gray-100 xpo_text-gray-800',
      draft: 'xpo_bg-yellow-100 xpo_text-yellow-800'
    };
    
    return (
      <span className={`xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium ${statusClasses[status] || statusClasses.inactive}`}>
        {status || 'inactive'}
      </span>
    );
  };
  
  const EditEmailTemplateForm = ({ data = {} }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [_type, setType] = useState(data?._type??'template');
    const [title, setTitle] = useState(data?.title??'New Template');
    const [_status, setStatus] = useState(data?._status??'publish');

    const handleSubmit = (e) => {
      e.preventDefault();
      setSaving(true);
      const payload = {...data, title, _type, _status};
      axios.post(`/wp-json/sitecore/v1/emails/templates/${data?.id??0}`, payload)
      .then((res) => res.data).then((res) => {
        setTemplates(prev => (data?.id <= 0) ? [payload, ...prev] : prev.map(t => t.id == data.id ? payload : t));
        data?.id <= 0 ? navigate(`/${res.id}/edit`) : setPopup(null);
      }).catch((err) => console.error(err)).finally(() => setSaving(false));
    };

    const template_types = ['template', 'section', 'cta', 'header', 'footer', 'block', 'component'];
    const template_status = ['publish', 'draft', 'trash'];

    return (
      <div className="xpo_max-w-lg xpo_mx-auto">
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
          <FileText className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
          {data?.id <= 0 ? 'Create New Email Template' : 'Edit Email Template'}
        </h2>

        <form onSubmit={handleSubmit} className="xpo_space-y-5">
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
              Title
            </label>
            <div className="xpo_relative">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 xpo_outline-none" disabled={saving} />
              <FileText className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-4 xpo_h-4" />
            </div>
          </div>

          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">Type</label>
            <div className="xpo_relative">
              <select value={_type} disabled={saving} onChange={(e) => setType(e.target.value)} className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 xpo_capitalize xpo_outline-none">
                {template_types.map((option, index) => <option key={index} value={option}>{option}</option>)}
              </select>
              <Layers className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-4 xpo_h-4" />
            </div>
          </div>

          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_mb-1">
              Status
            </label>
            <div className="xpo_relative">
              <select value={_status} disabled={saving} onChange={(e) => setStatus(e.target.value)} className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 xpo_capitalize xpo_outline-none">
                {template_status.map((status, index) => <option key={index} value={status}>{status}</option>)}
              </select>
              <Settings2 className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-4 xpo_h-4" />
            </div>
          </div>

          <div className={`xpo_mt-5 sm:xpo_mt-4 xpo_grid xpo_grid-cols-1 ${data?.id ? 'lg:xpo_grid-cols-[3fr_2fr]' : ''} xpo_gap-3`}>
            {data?.id && (
              <div className="xpo_flex xpo_w-full">
                <Link to={`/${data.id}/edit`} title="Edit template" className="xpo_relative xpo_inline-flex xpo_items-center xpo_justify-center xpo_w-full xpo_p-0.5 xpo_overflow-hidden xpo_text-sm xpo_font-medium xpo_text-gray-900 xpo_rounded-lg xpo_group xpo_bg-gradient-to-br xpo_from-cyan-500 xpo_to-blue-500 group-hover:xpo_from-cyan-500 group-hover:xpo_to-blue-500 hover:xpo_text-white dark:xpo_text-white focus:xpo_ring-4 focus:xpo_outline-none focus:xpo_ring-cyan-200 dark:focus:xpo_ring-cyan-800">
                  <span className="xpo_relative xpo_w-full xpo_text-center xpo_px-5 xpo_py-2.5 xpo_transition-all xpo_ease-in xpo_duration-75 xpo_bg-white dark:xpo_bg-gray-900 xpo_rounded-md group-hover:xpo_bg-transparent group-hover:dark:xpo_bg-transparent">
                    Edit template
                  </span>
                </Link>
              </div>
            )}
            
            <div className="xpo_w-full xpo_gap-3 sm:xpo_flex sm:xpo_flex-row-reverse">
              <button
                type="submit"
                disabled={saving}
                className="xpo_justify-center xpo_rounded-md xpo_border xpo_border-transparent xpo_shadow-sm xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-base xpo_font-medium xpo_text-white hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-offset-2 focus:xpo_ring-blue-500 sm:xpo_w-auto sm:xpo_text-sm disabled:xpo_opacity-50"
              >
                {saving ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => setPopup(null)} className="xpo_mt-3 xpo_justify-center xpo_rounded-md xpo_border xpo_border-gray-300 xpo_shadow-sm xpo_px-4 xpo_py-2 xpo_bg-white xpo_text-base xpo_font-medium xpo_text-gray-700 hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-offset-2 focus:xpo_ring-blue-500 sm:xpo_mt-0 sm:xpo_w-auto sm:xpo_text-sm">
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
      <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_overflow-hidden">
        {/* Header */}
        <div className="xpo_px-6 xpo_py-4 xpo_bg-gray-50 xpo_border-b xpo_border-gray-200">
          <div className="xpo_flex xpo_justify-between xpo_items-center">
            <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">Email Templates</h2>
            
            <div className="xpo_flex xpo_gap-3 xpo_items-center">
              {/* Search Bar */}
              <div className="xpo_relative xpo_w-80">
                <div className="xpo_absolute xpo_inset-y-0 xpo_left-0 xpo_pl-3 xpo_flex xpo_items-center xpo_pointer-events-none">
                  <Search className="xpo_h-5 xpo_w-5 xpo_text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  placeholder="Search templates..."
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
                  className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_leading-5 xpo_bg-white xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_placeholder-gray-400 focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
                />
              </div>
              <button
                title="Insert New"
                onClick={e => setPopup(<EditEmailTemplateForm />)}
                className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_w-8 xpo_h-8 xpo_rounded-full xpo_bg-green-100 xpo_text-green-600 hover:xpo_bg-green-200 xpo_transition-colors"
              >
                <PlusIcon className="xpo_h-4 xpo_w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="xpo_overflow-x-auto">
          <table className="xpo_min-w-full xpo_divide-y xpo_divide-gray-200">
            <thead className="xpo_bg-gray-50">
              <tr>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: 'id', order: prev.order_by == 'id' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  ID <SortIcon field="id" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: 'title', order: prev.order_by == 'title' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Title <SortIcon field="title" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Type <SortIcon field="_type" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: '_status', order: prev.order_by == '_status' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Status <SortIcon field="_status" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: 'created_at', order: prev.order_by == 'created_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Created <SortIcon field="created_at" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: 'updated_at', order: prev.order_by == 'updated_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Updated <SortIcon field="updated_at" />
                </th>
                <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="xpo_bg-white xpo_divide-y xpo_divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="xpo_text-center xpo_text-gray-500">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="xpo_px-6 xpo_py-12 xpo_text-center xpo_text-gray-500">
                    {filters.search ? 'No templates found matching your search.' : 'No templates found.'}
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:xpo_bg-gray-50">
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-900">
                      #{template.id}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                      <div className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{template.title}</div>
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                      {template._type || '-'}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                      {getStatusBadge(template._status)}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                      {formatDate(template.created_at)}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                      {formatDate(template.updated_at)}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_font-medium">
                      <div className="xpo_flex xpo_space-x-2">
                        <button
                          title="Edit template"
                          onClick={() => setPopup(<EditEmailTemplateForm data={template} />)}
                          className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_w-8 xpo_h-8 xpo_rounded-full xpo_bg-blue-100 xpo_text-blue-600 hover:xpo_bg-blue-200 xpo_transition-colors"
                        >
                          <Edit role="button" className="xpo_h-4 xpo_w-4" />
                        </button>
                        <button
                          onClick={() => setPopup(
                            <div className="xpo_inline-block xpo_align-bottom xpo_rounded-lg xpo_text-left xpo_overflow-hidden xpo_transform xpo_transition-all sm:xpo_align-middle sm:xpo_max-w-lg sm:xpo_w-full">
                                <div className="sm:xpo_flex sm:xpo_items-start">
                                    <div className="xpo_mx-auto xpo_flex-shrink-0 xpo_flex xpo_items-center xpo_justify-center xpo_h-12 xpo_w-12 xpo_rounded-full xpo_bg-red-100 sm:xpo_mx-0 sm:xpo_h-10 sm:xpo_w-10">
                                        <Trash2 className="xpo_h-6 xpo_w-6 xpo_text-red-600" />
                                    </div>
                                    <div className="xpo_mt-3 xpo_text-center sm:xpo_mt-0 sm:xpo_ml-4 sm:xpo_text-left">
                                        <h3 className="xpo_text-lg xpo_leading-6 xpo_font-medium xpo_text-gray-900">
                                            Delete Email Template
                                        </h3>
                                        <div className="xpo_mt-2">
                                            <p className="xpo_text-sm xpo_text-gray-500">
                                                Are you sure you want to delete "<span className="xpo_font-medium">{template?.title}</span>"? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="xpo_mt-5 sm:xpo_mt-4 sm:xpo_flex sm:xpo_flex-row-reverse">
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
                                        className="xpo_w-full xpo_inline-flex xpo_justify-center xpo_rounded-md xpo_border xpo_border-transparent xpo_shadow-sm xpo_px-4 xpo_py-2 xpo_bg-red-600 xpo_text-base xpo_font-medium xpo_text-white hover:xpo_bg-red-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-offset-2 focus:xpo_ring-red-500 sm:xpo_ml-3 sm:xpo_w-auto sm:xpo_text-sm disabled:xpo_opacity-50"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={() => setPopup(null)}
                                        className="xpo_mt-3 xpo_w-full xpo_inline-flex xpo_justify-center xpo_rounded-md xpo_border xpo_border-gray-300 xpo_shadow-sm xpo_px-4 xpo_py-2 xpo_bg-white xpo_text-base xpo_font-medium xpo_text-gray-700 hover:xpo_bg-gray-50 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-offset-2 focus:xpo_ring-blue-500 sm:xpo_mt-0 sm:xpo_w-auto sm:xpo_text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                          )}
                          className="xpo_inline-flex xpo_items-center xpo_justify-center xpo_w-8 xpo_h-8 xpo_rounded-full xpo_bg-red-100 xpo_text-red-600 hover:xpo_bg-red-200 xpo_transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="xpo_h-4 xpo_w-4" />
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
          <div className="xpo_px-6 xpo_py-4 xpo_bg-gray-50 xpo_border-t xpo_border-gray-200">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <div className="xpo_text-sm xpo_text-gray-700">
                Showing {((filters.page - 1) * filters.per_page) + 1} to {Math.min(filters.page * filters.per_page, pagination.totalItems)} of {pagination.totalItems} results
              </div>
              <div className="xpo_flex xpo_space-x-1">
                <button
                  onClick={() => setFilters(prev => ({...prev, page: Math.max(1, filters.page - 1)}))}
                  disabled={filters.page === 1}
                  className="xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 hover:xpo_bg-gray-50 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
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
                      onClick={() => setFilters(prev => ({...prev, page: Math.max(1, pageNum)}))}
                      className={`xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium ${
                        filters.page === pageNum
                          ? 'xpo_bg-blue-600 xpo_text-white'
                          : 'xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 hover:xpo_bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({...prev, page: Math.min(pagination.totalPages, filters.page + 1)}))}
                  className="xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_bg-white xpo_border xpo_border-gray-300 hover:xpo_bg-gray-50 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
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
      {/* <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_overflow-hidden"></div> */}
    </div>
  );
}

const EmailTemplatesHome = () => {
  return (
    <div className="xpo_grid md:xpo_grid-cols-[3fr_2fr] xpo_gap-3">
      <EmailTemplates />
      <TemplateRelations />
    </div>
  );
}

export default function Application() {
  return (
    <HashRouter>
      <Toaster />
      <Suspense fallback={<div className="xpo_text-center xpo_p-4">Loading...</div>}>
        <Routes>
          <Route path={'/'} element={<EmailTemplatesHome />} />
          <Route path={'/:id/edit'} element={<EmailBuilderEditor />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
