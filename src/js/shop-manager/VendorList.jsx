import axios from 'axios';
import { sprintf } from 'sprintf-js';
import { __, Popup } from '@js/utils';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { rest_url, notify } from '@functions';
import { Plus, Edit, Trash2, Building, Globe, Mail, Phone, User, X, AlertTriangle, Eye } from 'lucide-react';



// Confirmation Dialog
export const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="text-red-500" size={48} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {__('Cancel', 'site-core')}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {__('Delete', 'site-core')}
        </button>
      </div>
    </div>
  );
};

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      axios.get(rest_url('/sitecore/v1/storemanager/vendors'))
        .then(res => res.data)
        .then(res => {
          if (!res?.success) {
            throw new Error(res?.message ?? 'Vendor list empty');
          }
          return res;
        })
        .then(res => setVendors(res.data))
        .catch(err => console.error(
          err?.response?.data?.message ?? err?.message
        ))
        .finally(() => setLoading(false));
    };

    fetchVendors();
  }, []);

  const EditVendor = ({ data = {} }) => {
    const [formData, setFormData] = useState({
      id: 0,
      business_name: '',
      business_website: '',
      business_number: '',
      business_email: '',
      business_socials: '[]',
      ...data
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      axios.post(rest_url(`/sitecore/v1/storemanager/vendors/${formData?.id || 0}`), formData)
        .then(res => res.data)
        .then(res => {
          if (!res?.success) {
            throw new Error(res?.message ?? 'Failed to save vendor.');
          }
          return res;
        })
        .then(res => {
          // Update vendors list
          setVendors(prev => {
            if (formData.id && formData.id !== 0) {
              // Update existing vendor
              return prev.map(v => v.id === formData.id ? { ...v, ...formData } : v);
            } else {
              // Add new vendor
              const newVendor = { ...formData, id: res.data.id };
              return [newVendor, ...prev];
            }
          });

          notify.success(__('Vendor saved successfully!', 'site-core'));
          setPopup(null);
        })
        .catch(err => notify.error(err?.response?.data?.message ?? err?.message))
        .finally(() => setSubmitting(false));
    };

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Vendor', 'site-core') : __('Add New Vendor', 'site-core')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Vendor Name', 'site-core')} *
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('Enter vendor name', 'site-core')}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Website', 'site-core')}
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="url"
                value={formData.business_website}
                onChange={(e) => setFormData(prev => ({ ...prev, business_website: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('https://example.com', 'site-core')}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Phone', 'site-core')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                value={formData.business_number}
                onChange={(e) => setFormData(prev => ({ ...prev, business_number: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('contact@vendor.com', 'site-core')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Email', 'site-core')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData(prev => ({ ...prev, business_email: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('info@example.com', 'site-core')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? __('Saving...', 'site-core') : (formData.id && formData.id !== 0 ? __('Update Vendor', 'site-core') : __('Add Vendor', 'site-core'))}
            </button>
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {__('Cancel', 'site-core')}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleDeleteVendor = async (vendor) => {
    setPopup(
      <ConfirmDialog
        title={__('Delete Vendor', 'site-core')}
        message={sprintf(__(`Are you sure you want to delete "%s"? This action cannot be undone.`, 'site-core'), vendor.business_name)}
        onConfirm={async () => {
          try {
            await axios.delete(rest_url(`/sitecore/v1/storemanager/vendors/${vendor.id}`));
            setVendors(prev => prev.filter(v => v.id !== vendor.id));
            notify.success(__('Vendor deleted successfully!', 'site-core'));
            setPopup(null);
          } catch (err) {
            notify.error(err?.response?.data?.message ?? err?.message);
          }
        }}
        onCancel={() => setPopup(null)}
      />
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {__('Vendors', 'site-core')}
        </h1>
        <button
          onClick={() => setPopup(<EditVendor />)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          {__('Add New Vendor', 'site-core')}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{__('Loading vendors...', 'site-core')}</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {__('No vendors found', 'site-core')}
          </h3>
          <p className="text-gray-600 mb-4">
            {__('Get started by adding your first vendor.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditVendor />)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus size={18} />
            {__('Add New Vendor', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {__('Name', 'site-core')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {__('Website', 'site-core')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {__('Contact', 'site-core')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {__('Actions', 'site-core')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/vendors/${vendor.id}`} className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.business_name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.business_website ? (
                      <a
                        href={vendor.business_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {vendor.business_website}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {vendor.business_number && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone size={14} className="text-gray-400" />
                          <a href={`tel:${vendor.business_number}`} className="hover:text-blue-600">
                            {vendor.business_number}
                          </a>
                        </div>
                      )}
                      {vendor.business_email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} className="text-gray-400" />
                          <a href={`mailto:${vendor.business_email}`} className="hover:text-blue-600">
                            {vendor.business_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setPopup(<EditVendor data={vendor} />)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={__('Edit vendor', 'site-core')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={__('Delete vendor', 'site-core')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <Popup onClose={() => setPopup(null)}>
          {popup}
        </Popup>
      )}
    </div>
  );
}