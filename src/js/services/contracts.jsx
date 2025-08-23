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
  const [pagination, setPagination] = useState({totalItems: 0, totalPages: 0});

  const fetch_data = async () => {
    setLoading(true);
    axios.get(`/wp-json/sitecore/v1/services/agreements`, {params: {...filters}})
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
                className="xpo_p-2 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-markethia-100 xpo_text-markethia-800"
            >
                <Eye className="xpo_inline xpo_w-4 xpo_h-4 xpo_cursor-pointer"/>
            </button>
        )
    }
    
    return (
      <span className="xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-gray-100 xpo_text-gray-800">
        Pending
      </span>
    );
  };

  return (
    <div>
      <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_overflow-hidden">
        {/* Header */}
        <div className="xpo_px-6 xpo_py-4 xpo_bg-gray-50 xpo_border-b xpo_border-gray-200">
          <div className="xpo_flex xpo_justify-between xpo_items-center">
            <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">Contracts</h2>
            
            <div className="xpo_flex xpo_gap-3 xpo_items-center">
              {/* Search Bar */}
              <div className="xpo_relative xpo_w-80">
                <div className="xpo_absolute xpo_inset-y-0 xpo_left-0 xpo_pl-3 xpo_flex xpo_items-center xpo_pointer-events-none">
                  <Search className="xpo_h-5 xpo_w-5 xpo_text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  placeholder="Search contracts..."
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value, page: 1}))}
                  className="xpo_block xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_leading-5 xpo_bg-white xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_placeholder-gray-400 focus:xpo_ring-1 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="xpo_overflow-x-auto">
          <table className="xpo_min-w-full xpo_divide-y xpo_divide-gray-200">
            <thead className="xpo_bg-gray-50">
              <tr>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: 'id', order: prev.order_by == 'id' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  ID <SortIcon field="id" />
                </th>
                <th 
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                  onClick={() => setFilters(prev => ({...prev, order_by: 'title', order: prev.order_by == 'title' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                >
                  Client <SortIcon field="title" />
                </th>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  Business <SortIcon field="_type" />
                </th>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  Industry <SortIcon field="_type" />
                </th>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: '_type', order: prev.order_by == '_type' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  Referance <SortIcon field="_type" />
                </th>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: '_status', order: prev.order_by == '_status' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  Sign <SortIcon field="_status" />
                </th>
                <th 
                  onClick={() => setFilters(prev => ({...prev, order_by: 'created_at', order: prev.order_by == 'created_at' ? prev.order : prev.order == 'ASC' ? 'DESC' : 'ASC'}))}
                  className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider xpo_cursor-pointer hover:xpo_bg-gray-100"
                >
                  Time <SortIcon field="created_at" />
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
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="xpo_px-6 xpo_py-12 xpo_text-center xpo_text-gray-500">
                    {filters.search ? 'No contracts found matching your search.' : 'No contracts found.'}
                  </td>
                </tr>
              ) : (
                contracts.map((agreement) => (
                  <tr key={agreement.id} className="hover:xpo_bg-gray-50">
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-900">
                      #{agreement.id}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                      <div className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{agreement.record.fullName}</div>
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                      {agreement.record.businessName || '-'}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
                      {agreement.record.businessIndustry || '-'}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                      {agreement.referrer ? (
                        <a target="_blank" href={agreement.referrer} title="Visit Site">{agreement.referrer.substr(8).substr(0, 5)}..{agreement.referrer.substr(-8)}</a>
                      ) : '-'}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                      {getStatusBadge(agreement)}
                    </td>
                    <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-sm xpo_text-gray-500">
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

export default ServiceContracts;

const AgreementDetails = ({ agreement }) => {
    return (
        <div className="lg:xpo_min-w-[800px]">
            <h3 className="xpo_text-2xl xpo_mb-5 xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2">
                <FileText className="xpo_w-6 xpo_h-6" /> Agreement Preview
            </h3>

            <iframe width="100%" height="500px" title="Document Preview" src={agreement.signature.url} className="xpo_border-0 xpo_rounded-lg xpo_mb-6" />

            <div className="xpo_space-y-4">
                <h4 className="xpo_text-xl xpo_font-semibold">Agreement Details</h4>
                <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <User className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Full Name:</span>
                        <span>{agreement.record.fullName}</span>
                    </div>

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <Mail className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Email:</span>
                        <span>{agreement.record.email}</span>
                    </div>

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <Phone className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Phone:</span>
                        <span>{agreement.record.phone}</span>
                    </div>

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <Building2 className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Business:</span>
                        <span>{agreement.record.businessName}</span>
                    </div>

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <Building2 className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Industry:</span>
                        <span>{agreement.record.businessIndustry}</span>
                    </div>

                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                        <Calendar className="xpo_w-5 xpo_h-5" />
                        <span className="xpo_font-medium">Created At:</span>
                        <span>{agreement.created_at}</span>
                    </div>
                </div>

                {agreement.services?.length && (
                    <div className="xpo_space-y-4">
                        <h4 className="xpo_text-xl xpo_font-semibold">Services Included</h4>
                        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
                            {agreement.services.map(service => (
                                <div key={service.id} className="xpo_flex xpo_items-center xpo_gap-2">
                                    <CheckCircle className="xpo_w-5 xpo_h-5" />
                                    <a target="_blank" href={service.url} className="xpo_font-medium">{sprintf('%s (#%d)', service.title, Number(service.id))}</a>
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

