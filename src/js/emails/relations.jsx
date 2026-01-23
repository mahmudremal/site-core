import axios from 'axios';
import { Popup } from '@js/utils';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2, ChevronUp, ChevronDown, PlusIcon, FileText, Layers, Settings2 } from 'lucide-react';

const TemplateRelations = () => {
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [relations, setRelations] = useState([]);
  const [filters, setFilters] = useState({
    page: 1, search: '', per_page: 10, order: 'DESC', order_by: 'id',
  });
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0 });

  const fetch_data = async () => {
    setLoading(true);
    axios.get(`/wp-json/sitecore/v1/emails/relations`, { params: { ...filters } })
      .then(res => {
        setPagination(prev => ({
          ...prev,
          totalItems: parseInt(res.headers.get('x-wp-total') || '0'),
          totalPages: parseInt(res.headers.get('x-wp-totalpages') || '0')
        }));
        setRelations(res.data);
        return res.data;
      })
      .catch(err => console.error('Error fetching relations:', err))
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

  const EditRelatesForm = ({ data = {} }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [_type, setType] = useState(data?._type ?? 'template');
    const [title, setTitle] = useState(data?.title ?? '');
    const [_status, setStatus] = useState(data?._status ?? 'publish');
    const [formData, setFormData] = useState({
      id: 0, template_id: '', email_id: '', attachments: '{}', ...data
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      setSaving(true);
      console.log(formData.attachments)
      axios.post(`/wp-json/sitecore/v1/emails/relations/${formData?.id ?? 0}`, { ...formData })
        .then((res) => res.data).then((res) => {
          setRelations(prev => (data?.id <= 0) ? [formData, ...prev] : prev.map(t => t.id == data.id ? formData : t));
          data?.id <= 0 ? navigate(`/${res.id}/edit`) : setPopup(null);
        }).catch((err) => console.error(err)).finally(() => setSaving(false));
    };

    useEffect(() => {
      const delay = setTimeout(() => {
        axios.post(`/wp-json/sitecore/v1/emails/autocomplete/templates`, { search: formData.title, category: 'templates' })
          .then(res => res.data)
          .then(res => setTemplates(res))
          .catch(err => console.error(err))
      }, 1500);

      return () => clearTimeout(delay);
    }, [formData.title]);

    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {data?.id <= 0 ? 'Create New Email Relations' : 'Edit Email Relations'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title
            </label>
            <div className="relative">
              <input type="text" disabled={saving} value={formData.template_id} list="template-suggestions" onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <datalist id="template-suggestions">
                {templates.map(({ value, label }, i) => <option key={i} value={value}>{label}</option>)}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Key</label>
            <div className="relative">
              <input value={formData.email_id} disabled={saving} onChange={(e) => setFormData(prev => ({ ...prev, email_id: e.target.value }))} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 capitalize outline-none" />
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Status
            </label>
            <div className="relative">
              <textarea disabled={saving} defaultValue={formData.attachments} onChange={(e) => setFormData(prev => ({ ...prev, attachments: e.target.value }))} className="w-full !pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 capitalize outline-none"></textarea>
              <Settings2 className="absolute left-3 top-5 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <div className={`mt-5 sm:mt-4 grid grid-cols-1 ${data?.id ? 'lg:grid-cols-[3fr_2fr]' : ''} gap-3`}>
            {data?.id && (
              <div className="flex w-full">
                {/* <Link to={`/${data.id}/edit`} title="Edit template" className="relative inline-flex items-center justify-center w-full p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
                  <span className="relative w-full text-center px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                    Edit template
                  </span>
                </Link> */}
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
            <h2 className="text-xl font-semibold text-gray-900">Email Relations</h2>

            <div className="flex gap-3 items-center">
              {/* Search Bar */}
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  placeholder="Search relations..."
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                title="Insert New"
                onClick={e => setPopup(<EditRelatesForm />)}
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
                  Template <SortIcon field="created_at" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : relations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {filters.search ? 'No relations found matching your search.' : 'No relations found.'}
                  </td>
                </tr>
              ) : (
                relations.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{template.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.email_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template._type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(template._status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {template.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          title="Edit template"
                          onClick={() => setPopup(<EditRelatesForm data={template} />)}
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
                                    Delete Email Relations
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
                                    axios.delete(`/wp-json/sitecore/v1/emails/relations/${template.id}`)
                                      .then(res => setRelations(prev => prev.filter(t => t.id !== template.id)))
                                      .then(() => fetch_data()).then(() => setPopup(null))
                                      .catch(err => console.error('Error deleting template:', err))
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

export default TemplateRelations;
