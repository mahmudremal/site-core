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
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Warehouse', 'site-core') : __('Add New Warehouse', 'site-core')}
        </h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          {/* Warehouse Name */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Warehouse Name', 'site-core')} *
            </label>
            <div className="xpo_relative">
              <Warehouse className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                required
                type="text"
                value={formData.warehouse_title}
                onChange={(e) => setFormData(prev => ({ ...prev, warehouse_title: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('Enter warehouse name', 'site-core')}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Address', 'site-core')} *
            </label>
            <div className="xpo_relative">
              <MapPin className="xpo_absolute xpo_left-3 xpo_top-3 xpo_text-gray-400" size={18} />
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none xpo_resize-none"
                rows="3"
                placeholder={__('Enter warehouse address', 'site-core')}
              />
            </div>
          </div>

          {/* District and Coordinates Row */}
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
            {/* District */}
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                {__('District', 'site-core')}
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('Enter district', 'site-core')}
              />
            </div>

            {/* Coordinates */}
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                {__('Coordinates (Lat, Lon)', 'site-core')}
              </label>
              <input
                type="text"
                value={formData.latlon}
                onChange={(e) => setFormData(prev => ({ ...prev, latlon: e.target.value }))}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('23.7104, 90.4074', 'site-core')}
              />
            </div>
          </div>

          {/* Contact Numbers Row */}
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-4">
            {/* Contact Number */}
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                {__('Contact Number', 'site-core')}
              </label>
              <div className="xpo_relative">
                <Phone className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                  className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                  placeholder={__('01700000000', 'site-core')}
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                {__('WhatsApp Number', 'site-core')}
              </label>
              <div className="xpo_relative">
                <MessageSquare className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                  placeholder={__('01700000000', 'site-core')}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="xpo_flex xpo_gap-3 xpo_pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="xpo_flex-1 xpo_bg-blue-600 xpo_text-white xpo_py-2 xpo_px-4 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed"
            >
              {submitting ? __('Saving...', 'site-core') : (formData.id && formData.id !== 0 ? __('Update Warehouse', 'site-core') : __('Add Warehouse', 'site-core'))}
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
    <div className="xpo_max-w-6xl xpo_mx-auto xpo_p-6">
      {/* Header */}
      <div className="xpo_mb-6">
        {/* Back Button */}
        <div className="xpo_mb-4">
          <Link
            to="/vendors"
            className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_text-blue-600 hover:xpo_text-blue-700 xpo_transition-colors"
          >
            <ArrowLeft size={18} />
            {__('Back to Vendors', 'site-core')}
          </Link>
        </div>

        {/* Vendor Info */}
        {vendor && (
          <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_p-6 xpo_mb-6">
            <div className="xpo_flex xpo_items-start xpo_gap-4">
              <div className="xpo_flex-shrink-0">
                <div className="xpo_h-16 xpo_w-16 xpo_rounded-full xpo_bg-blue-100 xpo_flex xpo_items-center xpo_justify-center">
                  <Building className="xpo_h-8 xpo_w-8 xpo_text-blue-600" />
                </div>
              </div>
              <div className="xpo_flex-1">
                <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                  {vendor.business_name}
                </h1>
                <div className="xpo_flex xpo_flex-wrap xpo_gap-4 xpo_text-sm xpo_text-gray-600">
                  {vendor.business_website && (
                    <a target="_blank" rel="noopener noreferrer" href={vendor.business_website} className="xpo_flex xpo_items-center xpo_gap-1 hover:xpo_text-blue-600">
                      <Building size={14} />
                      {vendor.business_website}
                    </a>
                  )}
                  {vendor.business_email && (
                    <a href={`mailto:${vendor.business_email}`} className="xpo_flex xpo_items-center xpo_gap-1 hover:xpo_text-blue-600">
                      <Mail size={14} />
                      {vendor.business_email}
                    </a>
                  )}
                  {vendor.business_number && (
                    <a target="_blank" href={wa_phone_number(vendor.business_number)} className="xpo_flex xpo_items-center xpo_gap-1 hover:xpo_text-blue-600">
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
        <div className="xpo_flex xpo_justify-between xpo_items-center">
          <h2 className="xpo_text-xl xpo_font-bold xpo_text-gray-900">
            {__('Warehouses', 'site-core')}
          </h2>
          <button
            onClick={() => setPopup(<EditWarehouse />)}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
          >
            <Plus size={18} />
            {__('Add New Warehouse', 'site-core')}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-12">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-8 xpo_w-8 xpo_border-b-2 xpo_border-blue-600"></div>
          <span className="xpo_ml-3 xpo_text-gray-600">{__('Loading warehouses...', 'site-core')}</span>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="xpo_text-center xpo_py-12">
          <Warehouse className="xpo_mx-auto xpo_h-12 xpo_w-12 xpo_text-gray-400 xpo_mb-4" />
          <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">
            {__('No warehouses found', 'site-core')}
          </h3>
          <p className="xpo_text-gray-600 xpo_mb-4">
            {__('Get started by adding your first warehouse.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditWarehouse />)}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors xpo_mx-auto"
          >
            <Plus size={18} />
            {__('Add New Warehouse', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6">
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_overflow-hidden hover:xpo_shadow-lg xpo_transition-shadow">
              <div className="xpo_p-6">
                {/* Warehouse Header */}
                <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-4">
                  <div className="xpo_flex xpo_items-center xpo_gap-3">
                    <div className="xpo_flex-shrink-0 xpo_h-10 xpo_w-10 xpo_rounded-lg xpo_bg-blue-100 xpo_flex xpo_items-center xpo_justify-center">
                      <Warehouse className="xpo_h-5 xpo_w-5 xpo_text-blue-600" />
                    </div>
                    <div>
                      <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                        {warehouse.warehouse_title}
                      </h3>
                      {warehouse.district && (
                        <span className="xpo_text-sm xpo_text-gray-500">{warehouse.district}</span>
                      )}
                    </div>
                  </div>
                  <div className="xpo_flex xpo_gap-1">
                    <button title={__('Edit warehouse', 'site-core')} onClick={() => setPopup(<EditWarehouse data={warehouse} />)} className="xpo_p-1.5 xpo_text-gray-600 hover:xpo_text-blue-600 hover:xpo_bg-blue-50 xpo_rounded xpo_transition-colors">
                      <Edit size={14} />
                    </button>
                    <button title={__('Delete warehouse', 'site-core')} onClick={() => handleDeleteWarehouse(warehouse)} className="xpo_p-1.5 xpo_text-gray-600 hover:xpo_text-red-600 hover:xpo_bg-red-50 xpo_rounded xpo_transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Address */}
                {warehouse.address && (
                  <div className="xpo_flex xpo_items-start xpo_gap-2 xpo_mb-3">
                    <MapPin className="xpo_flex-shrink-0 xpo_text-gray-400 xpo_mt-0.5" size={14} />
                    <span className="xpo_text-sm xpo_text-gray-600 xpo_line-clamp-2">
                      {warehouse.address}
                    </span>
                  </div>
                )}

                {/* Contact Info */}
                <div className="xpo_space-y-2 xpo_mb-4">
                  {warehouse.contact_number && (
                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                      <Phone className="xpo_text-gray-400" size={14} />
                      <a href={`tel:${warehouse.contact_number}`} className="xpo_text-sm xpo_text-gray-600 hover:xpo_text-blue-600">
                        {warehouse.contact_number}
                      </a>
                    </div>
                  )}
                  {warehouse.whatsapp_number && (
                    <div className="xpo_flex xpo_items-center xpo_gap-2">
                      <MessageSquare className="xpo_text-gray-400" size={14} />
                      <a target="_blank" rel="noopener noreferrer" href={wa_phone_number(warehouse.whatsapp_number)} className="xpo_text-sm xpo_text-gray-600 hover:xpo_text-blue-600">
                        {warehouse.whatsapp_number}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="xpo_pt-4 xpo_border-t xpo_border-gray-200">
                  <Link to={`/vendors/${vendor_id}/warehouses/${warehouse.id}/products`} className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_w-full xpo_bg-gray-50 hover:xpo_bg-gray-100 xpo_text-gray-700 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_transition-colors">
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