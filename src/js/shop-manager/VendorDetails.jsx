import axios from 'axios';
import { sprintf } from 'sprintf-js';
import { __, Popup } from '@js/utils';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { rest_url, notify } from '@functions';
import {
  Plus,
  Edit,
  Trash2,
  Warehouse,
  MapPin,
  Phone,
  MessageSquare,
  ArrowLeft,
  AlertTriangle,
  Package,
  Building,
  Mail
} from 'lucide-react';
import { ConfirmDialog } from './VendorList';
import { wa_phone_number } from './helpers';

export default function VendorDetails() {
  const { vendor_id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vendor details and warehouses in parallel
        const [vendorRes, warehousesRes] = await Promise.all([
          axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}`)),
          axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}/warehouses`))
        ]);

        if (vendorRes.data?.success) {
          setVendor(vendorRes.data.data);
        }

        if (warehousesRes.data?.success) {
          setWarehouses(warehousesRes.data.data);
        }
      } catch (err) {
        console.error(err?.response?.data?.message ?? err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendor_id]);

  const EditWarehouse = ({ data = {} }) => {
    const [formData, setFormData] = useState({
      id: 0,
      warehouse_title: '',
      address: '',
      latlon: '',
      district: '',
      contact_number: '',
      whatsapp_number: '',
      ...data
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const response = await axios.post(
          rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}/warehouses/${formData?.id || 0}`),
          formData
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message ?? 'Failed to save warehouse.');
        }

        // Update warehouses list
        setWarehouses(prev => {
          if (formData.id && formData.id !== 0) {
            // Update existing warehouse
            return prev.map(w => w.id === formData.id ? { ...w, ...formData } : w);
          } else {
            // Add new warehouse
            const newWarehouse = { ...formData, id: response.data.data.id };
            return [newWarehouse, ...prev];
          }
        });

        notify.success(__('Warehouse saved successfully!', 'site-core'));
        setPopup(null);
      } catch (err) {
        notify.error(err?.response?.data?.message ?? err?.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Warehouse', 'site-core') : __('Add New Warehouse', 'site-core')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warehouse Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Warehouse Name', 'site-core')} *
            </label>
            <div className="relative">
              <Warehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="text"
                value={formData.warehouse_title}
                onChange={(e) => setFormData(prev => ({ ...prev, warehouse_title: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('Enter warehouse name', 'site-core')}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Address', 'site-core')} *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows="3"
                placeholder={__('Enter warehouse address', 'site-core')}
              />
            </div>
          </div>

          {/* District and Coordinates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {__('District', 'site-core')}
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('Enter district', 'site-core')}
              />
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {__('Coordinates (Lat, Lon)', 'site-core')}
              </label>
              <input
                type="text"
                value={formData.latlon}
                onChange={(e) => setFormData(prev => ({ ...prev, latlon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={__('23.7104, 90.4074', 'site-core')}
              />
            </div>
          </div>

          {/* Contact Numbers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {__('Contact Number', 'site-core')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={__('01700000000', 'site-core')}
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {__('WhatsApp Number', 'site-core')}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={__('01700000000', 'site-core')}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? __('Saving...', 'site-core') : (formData.id && formData.id !== 0 ? __('Update Warehouse', 'site-core') : __('Add Warehouse', 'site-core'))}
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

  const handleDeleteWarehouse = async (warehouse) => {
    setPopup(
      <ConfirmDialog
        title={__('Delete Warehouse', 'site-core')}
        message={sprintf(__(`Are you sure you want to delete "%s"? This action cannot be undone.`, 'site-core'), warehouse.warehouse_title)}
        onConfirm={async () => {
          try {
            await axios.delete(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}/warehouses/${warehouse.id}`));
            setWarehouses(prev => prev.filter(w => w.id !== warehouse.id));
            notify.success(__('Warehouse deleted successfully!', 'site-core'));
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
      <div className="mb-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            {__('Back to Vendors', 'site-core')}
          </Link>
        </div>

        {/* Vendor Info */}
        {vendor && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {vendor.business_name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {vendor.business_website && (
                    <a target="_blank" rel="noopener noreferrer" href={vendor.business_website} className="flex items-center gap-1 hover:text-blue-600">
                      <Building size={14} />
                      {vendor.business_website}
                    </a>
                  )}
                  {vendor.business_email && (
                    <a href={`mailto:${vendor.business_email}`} className="flex items-center gap-1 hover:text-blue-600">
                      <Mail size={14} />
                      {vendor.business_email}
                    </a>
                  )}
                  {vendor.business_number && (
                    <a target="_blank" href={wa_phone_number(vendor.business_number)} className="flex items-center gap-1 hover:text-blue-600">
                      <Phone size={14} />
                      {vendor.business_number}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warehouses Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {__('Warehouses', 'site-core')}
          </h2>
          <button
            onClick={() => setPopup(<EditWarehouse />)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            {__('Add New Warehouse', 'site-core')}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{__('Loading warehouses...', 'site-core')}</span>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-12">
          <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {__('No warehouses found', 'site-core')}
          </h3>
          <p className="text-gray-600 mb-4">
            {__('Get started by adding your first warehouse.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditWarehouse />)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus size={18} />
            {__('Add New Warehouse', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Warehouse Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Warehouse className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {warehouse.warehouse_title}
                      </h3>
                      {warehouse.district && (
                        <span className="text-sm text-gray-500">{warehouse.district}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button title={__('Edit warehouse', 'site-core')} onClick={() => setPopup(<EditWarehouse data={warehouse} />)} className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit size={14} />
                    </button>
                    <button title={__('Delete warehouse', 'site-core')} onClick={() => handleDeleteWarehouse(warehouse)} className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Address */}
                {warehouse.address && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="flex-shrink-0 text-gray-400 mt-0.5" size={14} />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {warehouse.address}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {warehouse.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={14} />
                      <a href={`tel:${warehouse.contact_number}`} className="text-sm text-gray-600 hover:text-blue-600">
                        {warehouse.contact_number}
                      </a>
                    </div>
                  )}
                  {warehouse.whatsapp_number && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="text-gray-400" size={14} />
                      <a target="_blank" rel="noopener noreferrer" href={wa_phone_number(warehouse.whatsapp_number)} className="text-sm text-gray-600 hover:text-blue-600">
                        {warehouse.whatsapp_number}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Link to={`/vendors/${vendor_id}/warehouses/${warehouse.id}/products`} className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                    <Package size={16} />
                    {__('View Products', 'site-core')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
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