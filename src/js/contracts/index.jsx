import axios from 'axios';
import { Popup } from '@js/utils';
import { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, FileText, User, Building2, Mail, Phone, Calendar, Eye, CheckCircle } from 'lucide-react';
import { sprintf } from 'sprintf-js';

const ServiceContracts = () => {
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [filters, setFilters] = useState({
    page: 1, search: '', per_page: 10, order: 'DESC', order_by: 'id',
  });
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0 });

  const fetch_data = async () => {
    setLoading(true);
    axios.get(`/wp-json/sitecore/v1/services/agreements`, { params: { ...filters } })
      .then(res => {
        setPagination(prev => ({
          ...prev,
          totalItems: parseInt(res.headers.get('x-wp-total') || '0'),
          totalPages: parseInt(res.headers.get('x-wp-totalpages') || '0')
        }));
        setContracts(res.data);
        return res.data;
      })
      .catch(err => console.error('Error fetching contracts:', err))
      .finally(() => setLoading(false))

  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch_data();
    }, 1500);
    // 
    return () => clearTimeout(delay);
  }, [filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  const getStatusBadge = (agreement) => {
    const statusClasses = {
      active: '',
      inactive: ''
    };

    if (agreement?.signature) {
      return (
        <button
          type="button"
          onClick={() => setPopup(<AgreementDetails agreement={agreement} />)}
          className="p-2 rounded-full text-xs font-medium bg-agreements-100 text-agreements-800"
        >
          <Eye className="inline w-4 h-4 cursor-pointer" />
        </button>
      )
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Pending
      </span>
    );
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Contracts</h2>

            <div className="flex gap-3 items-center">
              {/* Search Bar */}
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  placeholder="Search contracts..."
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'id', order: prev.order_by == 'id' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  ID <SortIcon field="id" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'title', order: prev.order_by == 'title' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                >
                  Client <SortIcon field="title" />
                </th>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Business <SortIcon field="_type" />
                </th>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Industry <SortIcon field="_type" />
                </th>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Referance <SortIcon field="_type" />
                </th>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: '_status', order: prev.order_by == '_status' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Sign <SortIcon field="_status" />
                </th>
                <th
                  onClick={() => setFilters(prev => ({ ...prev, order_by: 'created_at', order: prev.order_by == 'created_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC' }))}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Time <SortIcon field="created_at" />
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
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {filters.search ? 'No contracts found matching your search.' : 'No contracts found.'}
                  </td>
                </tr>
              ) : (
                contracts.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{agreement.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agreement.record.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agreement.record.businessName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agreement.record.businessIndustry || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agreement.referrer ? (
                        <a target="_blank" href={agreement.referrer} title="Visit Site">{agreement.referrer.substr(8).substr(0, 5)}..{agreement.referrer.substr(-8)}</a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(agreement)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(agreement.updated_at)}
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

export default ServiceContracts;

const AgreementDetails = ({ agreement }) => {
  return (
    <div className="lg:min-w-[800px]">
      <h3 className="text-2xl mb-5 font-semibold flex items-center gap-2">
        <FileText className="w-6 h-6" /> Agreement Preview
      </h3>

      <iframe width="100%" height="500px" title="Document Preview" src={agreement.signature.url} className="border-0 rounded-lg mb-6" />

      <div className="space-y-4">
        <h4 className="text-xl font-semibold">Agreement Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="font-medium">Full Name:</span>
            <span>{agreement.record.fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email:</span>
            <span>{agreement.record.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span className="font-medium">Phone:</span>
            <span>{agreement.record.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Business:</span>
            <span>{agreement.record.businessName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Industry:</span>
            <span>{agreement.record.businessIndustry}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Created At:</span>
            <span>{agreement.created_at}</span>
          </div>
        </div>

        {agreement.services?.length && (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Services Included</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agreement.services.map(service => (
                <div key={service.id} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <a target="_blank" href={service.url} className="font-medium">{sprintf('%s (#%d)', service.title, Number(service.id))}</a>
                  {service?.price && <span>{service.price}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

