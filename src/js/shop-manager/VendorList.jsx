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
    <div className="xpo_text-center">
      <div className="xpo_flex xpo_justify-center xpo_mb-4">
        <AlertTriangle className="xpo_text-red-500" size={48} />
      </div>
      <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-2">{title}</h3>
      <p className="xpo_text-gray-600 xpo_mb-6">{message}</p>
      <div className="xpo_flex xpo_gap-3 xpo_justify-center">
        <button
          onClick={onCancel}
          className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-700 hover:xpo_bg-gray-50 xpo_transition-colors"
        >
          {__('Cancel', 'site-core')}
        </button>
        <button
          onClick={onConfirm}
          className="xpo_px-4 xpo_py-2 xpo_bg-red-600 xpo_text-white xpo_rounded-lg hover:xpo_bg-red-700 xpo_transition-colors"
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
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Vendor', 'site-core') : __('Add New Vendor', 'site-core')}
        </h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          {/* Vendor Name */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Vendor Name', 'site-core')} *
            </label>
            <div className="xpo_relative">
              <Building className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                required
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('Enter vendor name', 'site-core')}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Website', 'site-core')}
            </label>
            <div className="xpo_relative">
              <Globe className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                type="url"
                value={formData.business_website}
                onChange={(e) => setFormData(prev => ({ ...prev, business_website: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('https://example.com', 'site-core')}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Phone', 'site-core')}
            </label>
            <div className="xpo_relative">
              <Phone className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                type="tel"
                value={formData.business_number}
                onChange={(e) => setFormData(prev => ({ ...prev, business_number: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('contact@vendor.com', 'site-core')}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Email', 'site-core')}
            </label>
            <div className="xpo_relative">
              <Mail className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData(prev => ({ ...prev, business_email: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('info@example.com', 'site-core')}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="xpo_flex xpo_gap-3 xpo_pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="xpo_flex-1 xpo_bg-blue-600 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
            >
              {submitting ? __('Saving...', 'site-core') : (formData.id && formData.id !== 0 ? __('Update Vendor', 'site-core') : __('Add Vendor', 'site-core'))}
            </button>
            <button
              type="button"
              onClick={() => setPopup(null)}
              className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-700 hover:xpo_bg-gray-50 xpo_transition-colors"
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
    <div className="xpo_max-w-6xl xpo_mx-auto xpo_p-6">
      {/* Header */}
      <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-6">
        <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
          {__('Vendors', 'site-core')}
        </h1>
        <button
          onClick={() => setPopup(<EditVendor />)}
          className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
        >
          <Plus size={18} />
          {__('Add New Vendor', 'site-core')}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-12">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-8 xpo_w-8 xpo_border-b-2 xpo_border-blue-600"></div>
          <span className="xpo_ml-3 xpo_text-gray-600">{__('Loading vendors...', 'site-core')}</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="xpo_text-center xpo_py-12">
          <Building className="xpo_mx-auto xpo_h-12 xpo_w-12 xpo_text-gray-400 xpo_mb-4" />
          <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">
            {__('No vendors found', 'site-core')}
          </h3>
          <p className="xpo_text-gray-600 xpo_mb-4">
            {__('Get started by adding your first vendor.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditVendor />)}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors xpo_mx-auto"
          >
            <Plus size={18} />
            {__('Add New Vendor', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_overflow-hidden">
          <table className="xpo_min-w-full xpo_divide-y xpo_divide-gray-200">
            <thead className="xpo_bg-gray-50">
              <tr>
                <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                  {__('Name', 'site-core')}
                </th>
                <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                  {__('Website', 'site-core')}
                </th>
                <th className="xpo_px-6 xpo_py-3 xpo_text-left xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                  {__('Contact', 'site-core')}
                </th>
                <th className="xpo_px-6 xpo_py-3 xpo_text-right xpo_text-xs xpo_font-medium xpo_text-gray-500 xpo_uppercase xpo_tracking-wider">
                  {__('Actions', 'site-core')}
                </th>
              </tr>
            </thead>
            <tbody className="xpo_bg-white xpo_divide-y xpo_divide-gray-200">
              {vendors.map(vendor => (
                <tr key={vendor.id} className="hover:xpo_bg-gray-50 xpo_transition-colors">
                  <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                    <Link to={`/vendors/${vendor.id}`} className="xpo_flex xpo_items-center">
                      <div className="xpo_flex-shrink-0 xpo_h-10 xpo_w-10">
                        <div className="xpo_h-10 xpo_w-10 xpo_rounded-full xpo_bg-blue-100 xpo_flex xpo_items-center xpo_justify-center">
                          <Building className="xpo_h-5 xpo_w-5 xpo_text-blue-600" />
                        </div>
                      </div>
                      <div className="xpo_ml-4">
                        <div className="xpo_text-sm xpo_font-medium xpo_text-gray-900">
                          {vendor.business_name}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                    {vendor.business_website ? (
                      <a
                        href={vendor.business_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="xpo_text-blue-600 hover:xpo_text-blue-900 xpo_text-sm"
                      >
                        {vendor.business_website}
                      </a>
                    ) : (
                      <span className="xpo_text-gray-400 xpo_text-sm">—</span>
                    )}
                  </td>
                  <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap">
                    <div className="xpo_text-sm xpo_text-gray-900">
                      {vendor.business_number && (
                        <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_mb-1">
                          <Phone size={14} className="xpo_text-gray-400" />
                          <a href={`tel:${vendor.business_number}`} className="hover:xpo_text-blue-600">
                            {vendor.business_number}
                          </a>
                        </div>
                      )}
                      {vendor.business_email && (
                        <div className="xpo_flex xpo_items-center xpo_gap-1">
                          <Mail size={14} className="xpo_text-gray-400" />
                          <a href={`mailto:${vendor.business_email}`} className="hover:xpo_text-blue-600">
                            {vendor.business_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="xpo_px-6 xpo_py-4 xpo_whitespace-nowrap xpo_text-right xpo_text-sm xpo_font-medium">
                    <div className="xpo_flex xpo_justify-end xpo_gap-2">
                      <button
                        onClick={() => setPopup(<EditVendor data={vendor} />)}
                        className="xpo_p-2 xpo_text-gray-600 hover:xpo_text-blue-600 hover:xpo_bg-blue-50 xpo_rounded-lg xpo_transition-colors"
                        title={__('Edit vendor', 'site-core')}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor)}
                        className="xpo_p-2 xpo_text-gray-600 hover:xpo_text-red-600 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors"
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