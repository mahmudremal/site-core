/**
 * This component is made for the product edit screen metabox. It is similar to the WooCommerce Product data metabox but with some differences.
 * All details are explained in the documentation ./GEMINI.md
 */
import { Trash2, Settings, Spline, Warehouse, Truck, Globe, Link, Cog, GripVertical, ChevronDown, ImagePlus, X, Save, Images, ListChecks, Split } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { __, Popup } from "@js/utils";
import { rest_url, notify } from "@functions";
import { sprintf } from "sprintf-js";
import axios from "axios";
import AttributesTab from './metabox/AttributesTab';
import VariationsTab from './metabox/VariationsTab';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';



const FormField = ({ label, help, children }) => (
    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-3 xpo_gap-4 xpo_items-start xpo_py-4">
        <div className="xpo_col-span-1">
            <label className="xpo_font-semibold xpo_text-gray-700">{label}</label>
            {help && <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-1">{help}</p>}
        </div>
        <div className="xpo_col-span-2">
            {children}
        </div>
    </div>
);

const TextInput = ({ ...props }) => <input type="text" className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md" {...props} />;

const Textarea = ({ value, onChange, ...props }) => {
    const [localValue, setLocalValue] = useState(value || '');

    // Update local value when prop changes
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    // Debounced onChange
    useEffect(() => {
        if (localValue === value) return;
        
        const delay = setTimeout(() => {
            onChange?.(localValue);
        }, 1500);
        
        return () => clearTimeout(delay);
    }, [localValue, onChange, value]);
    
    return (
        <CKEditor
            data={localValue}
            editor={ClassicEditor}
            onChange={(event, editor) => {
                const data = editor.getData();
                setLocalValue(data);
            }}
            onReady={editor => {
                if (editor.ui.view.editable.element) {
                    editor.ui.view.editable.element.style.minHeight = '200px';
                }
            }}
            {...props}
        />
    );
};

const Select = ({ children, ...props }) => <select className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md" {...props}>{children}</select>;

const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
    const baseClasses = "xpo_px-4 xpo_py-2 xpo_rounded-md xpo_font-semibold xpo_flex xpo_items-center xpo_gap-2 xpo_transition-colors";
    const variants = {
        primary: "xpo_bg-blue-600 xpo_text-scwhite hover:xpo_bg-blue-700 disabled:xpo_bg-blue-400",
        secondary: "xpo_bg-gray-200 xpo_text-gray-800 hover:xpo_bg-gray-300 disabled:xpo_bg-gray-100",
        danger: "xpo_bg-red-600 xpo_text-scwhite hover:xpo_bg-red-700 disabled:xpo_bg-red-400",
    };
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${disabled ? 'xpo_cursor-not-allowed' : 'xpo_cursor-pointer'}`}
        >
            {children}
        </button>
    );
};

// Separate component definitions outside of main component
const GeneralTab = ({ meta, onMetaChange }) => (
    <div className="xpo_divide-y xpo_divide-gray-200">
        <FormField label={__('Product Type', 'site-core')}>
            <Select value={meta.product_type} onChange={e => onMetaChange('product_type', e.target.value)}>
                <option value="simple">{__('Simple Product', 'site-core')}</option>
                <option value="variable">{__('Variable Product', 'site-core')}</option>
            </Select>
        </FormField>
        <FormField label={__('SKU', 'site-core')}>
            <TextInput value={meta.sku} onChange={e => onMetaChange('sku', e.target.value)} />
        </FormField>
        <FormField label={__('Price', 'site-core')}>
            <TextInput type="number" value={meta.price} onChange={e => onMetaChange('price', e.target.value)} />
        </FormField>
        <FormField label={__('Sale Price', 'site-core')}>
            <TextInput type="number" value={meta.sale_price} onChange={e => onMetaChange('sale_price', e.target.value)} />
        </FormField>
        <FormField label={__('Currency', 'site-core')}>
            <Select defaultValue={meta.currency} onChange={e => onMetaChange('currency', e.target.value)}>
                <option value="bdt">{__('BDT - Bangladeshi Taka', 'site-core')}</option>
                <option value="inr">{__('INR - Indian Rupee', 'site-core')}</option>
                <option value="usd">{__('USD - US Dollar', 'site-core')}</option>
                <option value="eur">{__('EUR - Euro', 'site-core')}</option>
            </Select>
        </FormField>
        <FormField label={__('Description', 'site-core')}>
            <Textarea value={meta.description} onChange={data => onMetaChange('description', data)} />
        </FormField>
        <FormField label={__('Short Description', 'site-core')}>
            <Textarea value={meta.short_description} onChange={data => onMetaChange('short_description', data)} />
        </FormField>
        {/* <FormField label={__('Product Status', 'site-core')}>
            <Select value={meta.status} onChange={e => onMetaChange('status', e.target.value)}>
                <option value="draft">{__('Draft', 'site-core')}</option>
                <option value="published">{__('Published', 'site-core')}</option>
                <option value="archived">{__('Archived', 'site-core')}</option>
            </Select>
        </FormField> */}
    </div>
);

const ConfirmDelete = ({ id, message = null, onConfirm, onCancel }) => {
    if (!message) message = __('Are you sure you want to delete this item? This action cannot be undone.', 'site-core');
    return (
        <div className="xpo_p-6">
            <h3 className="xpo_text-lg xpo_font-bold">{__('Confirm Deletion', 'site-core')}</h3>
            <p className="xpo_my-4">{message}</p>
            <div className="xpo_flex xpo_justify-end xpo_gap-4 xpo_mt-6">
                <Button variant="secondary" onClick={onCancel}>{__('Cancel', 'site-core')}</Button>
                <Button variant="danger" onClick={onConfirm}>{__('Confirm', 'site-core')}</Button>
            </div>
        </div>
    )
};

const SeoTab = ({ meta, onMetaChange }) => {
    return (
        <div className="xpo_divide-y xpo_divide-gray-200">
            <FormField label={__('SEO Title', 'site-core')} help={__('The title that appears in search engine results', 'site-core')}>
                <TextInput 
                    value={meta.seo_title || ''} 
                    onChange={e => onMetaChange('seo_title', e.target.value)}
                    placeholder={__('Enter SEO title', 'site-core')}
                />
            </FormField>
            <FormField label={__('SEO Description', 'site-core')} help={__('The description that appears in search engine results', 'site-core')}>
                <textarea 
                    className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_h-24"
                    value={meta.seo_description || ''} 
                    onChange={e => onMetaChange('seo_description', e.target.value)}
                    placeholder={__('Enter SEO description', 'site-core')}
                    maxLength="160"
                />
                <p className="xpo_text-xs xpo_text-gray-500 xpo_mt-1">
                    {(meta.seo_description || '').length}/160 {__('characters', 'site-core')}
                </p>
            </FormField>
            <FormField label={__('Focus Keywords', 'site-core')} help={__('Comma-separated keywords for SEO focus', 'site-core')}>
                <TextInput 
                    value={meta.seo_keywords || ''} 
                    onChange={e => onMetaChange('seo_keywords', e.target.value)}
                    placeholder={__('keyword1, keyword2, keyword3', 'site-core')}
                />
            </FormField>
            <FormField label={__('Open Graph Title', 'site-core')} help={__('Title for social media sharing', 'site-core')}>
                <TextInput 
                    value={meta.og_title || ''} 
                    onChange={e => onMetaChange('og_title', e.target.value)}
                    placeholder={__('Enter Open Graph title', 'site-core')}
                />
            </FormField>
            <FormField label={__('Open Graph Description', 'site-core')} help={__('Description for social media sharing', 'site-core')}>
                <textarea 
                    className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_h-20"
                    value={meta.og_description || ''} 
                    onChange={e => onMetaChange('og_description', e.target.value)}
                    placeholder={__('Enter Open Graph description', 'site-core')}
                />
            </FormField>
            <FormField label={__('Open Graph Image URL', 'site-core')} help={__('Image URL for social media sharing', 'site-core')}>
                <TextInput 
                    value={meta.og_image || ''} 
                    onChange={e => onMetaChange('og_image', e.target.value)}
                    placeholder={__('https://example.com/image.jpg', 'site-core')}
                />
            </FormField>
            <FormField label={__('Canonical URL', 'site-core')} help={__('Preferred URL for this product to avoid duplicate content', 'site-core')}>
                <TextInput 
                    value={meta.canonical_url || ''} 
                    onChange={e => onMetaChange('canonical_url', e.target.value)}
                    placeholder={__('https://example.com/canonical-url', 'site-core')}
                />
            </FormField>
        </div>
    );
};

const Specifications = ({ meta, onMetaChange }) => {
  const [specifications, setSpecifications] = useState(meta?.specifications ?? []);

  useEffect(() => {
    const delay = setTimeout(() => {
      onMetaChange('specifications', specifications);
    }, 1000);
    return () => clearTimeout(delay);
  }, [specifications]);

  const handleSpecChange = (index, field, value) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="xpo_divide-y xpo_divide-gray-200">
      <FormField label={__('Specifications', 'site-core')} help={__('Add product specifications')}>
        {specifications.map((spec, index) => (
          <div key={index} className="xpo_flex xpo_space-x-2 xpo_mb-2">
            <input
              type="text"
              className="xpo_flex-1 xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
              placeholder={__('Label', 'site-core')}
              value={spec.label}
              onChange={e => handleSpecChange(index, 'label', e.target.value)}
            />
            <input
              type="text"
              className="xpo_flex-1 xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
              placeholder={__('Value', 'site-core')}
              value={spec.value}
              onChange={e => handleSpecChange(index, 'value', e.target.value)}
            />
            <button
              type="button"
              className="xpo_text-red-600 xpo_hover:text-red-800"
              onClick={() => removeSpecification(index)}
              aria-label={__('Remove specification', 'site-core')}
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          className="xpo_mt-2 xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-scwhite xpo_rounded-md xpo_hover:bg-blue-700"
          onClick={addSpecification}
        >
          {__('Add Specification', 'site-core')}
        </button>
      </FormField>
    </div>
  );
};

const ProductGallery = ({ meta, onMetaChange }) => {
  const [gallery, setGallery] = useState(meta?.gallery ?? []);

  useEffect(() => {
    const delay = setTimeout(() => {
      onMetaChange('gallery', gallery);
    }, 1000);
    return () => clearTimeout(delay);
  }, [gallery]);

  const openMediaLibrary = (index) => {
    const frame = wp.media({
      title: __('Select or Upload Image', 'site-core'),
      button: {
        text: __('Use this image', 'site-core'),
      },
      multiple: false,
    });

    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      setGallery((prev) => {
        const updated = [...prev];
        updated[index] = { id: attachment.id, url: attachment.url };
        return updated;
      });
    });

    frame.open();
  };

  const handleUrlChange = (index, url) => {
    setGallery((prev) => {
      const updated = [...prev];
      updated[index] = { id: null, url };
      return updated;
    });
  };

  const addGalleryItem = () => {
    setGallery((prev) => [...prev, { id: null, url: '' }]);
  };

  const removeGalleryItem = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="xpo_divide-y xpo_divide-gray-200">
      <FormField label={__('Product Gallery', 'site-core')} help={__('Add product gallery images')}>
        {gallery.map((item, index) => (
          <div key={index} className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-4">
            <div className="xpo_w-24 xpo_h-24 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_flex xpo_items-center xpo_justify-center xpo_overflow-hidden">
              {item.url ? (
                <img src={item.url} alt="" className="xpo_object-cover xpo_w-full xpo_h-full" />
              ) : (
                <span className="xpo_text-gray-400">{__('No image', 'site-core')}</span>
              )}
            </div>
            <div className="xpo_flex-1">
              <input
                type="text"
                className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md"
                placeholder={__('Image URL', 'site-core')}
                value={item.url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
              />
            </div>
            <button
              type="button"
              className="xpo_bg-gray-200 xpo_px-3 xpo_py-2 xpo_rounded-md xpo_hover:bg-gray-300"
              onClick={() => openMediaLibrary(index)}
              aria-label={__('Select from media library', 'site-core')}
            >
              {__('Select')}
            </button>
            <button
              type="button"
              className="xpo_text-red-600 xpo_hover:text-red-800 xpo_text-2xl xpo_font-bold"
              onClick={() => removeGalleryItem(index)}
              aria-label={__('Remove gallery image', 'site-core')}
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          className="xpo_mt-2 xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-scwhite xpo_rounded-md xpo_hover:bg-blue-700"
          onClick={addGalleryItem}
        >
          {__('Add Gallery Image', 'site-core')}
        </button>
      </FormField>
    </div>
  );
};

const ShippingTab = ({ meta, onMetaChange }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [search, setSearch] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [autocomShown, setAutocomShown] = useState(null);
    const [selectedVendors, setSelectedVendors] = useState(meta.shipping_vendors || []);
    const [selectedWarehouses, setSelectedWarehouses] = useState(meta.shipping_warehouses || []);

    // Search for vendors with debounce
    useEffect(() => {
        // if (!search.trim()) return setVendors([]);

        const delay = setTimeout(() => {
            setLoading(true);
            axios.get(rest_url(`/sitecore/v1/storemanager/vendors`), { params: { q: search, include_ids: selectedVendors.map(Number) } })
            .then(res => res.data).then(res => setVendors(
                res.data.map(i => ({id: Number(i.id), name: i.business_name, email: i.business_email, website: i.business_website, penalty: i.penalty_score}))
            ))
            .catch(err => console.log(err?.message)).finally(() => setLoading(false));
        }, 500);
        
        return () => clearTimeout(delay);
    }, [search]);
    
    const reloadWarehousesList = (vendor) => {
        setLoading(true);
        axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor.id}/warehouses`), {params: {include_ids: selectedVendors}})
        .then(res => res.data).then(res => res.data).then(res => 
            setWarehouses(prev => [...prev, ...res.map(w => ({ ...w, id: Number(w.id), vendor_id: vendor.id }))])
        )
        .catch(err => console.log(err?.message)).then(() => setLoading(false));
    }

    const handleVendorSelect = useCallback(async (vendor) => {
        const isAlreadySelected = selectedVendors.some(v => v === vendor.id);
        if (isAlreadySelected) return;

        const newSelectedVendors = [...selectedVendors, vendor.id].map(Number);
        onMetaChange('shipping_vendors', newSelectedVendors);
        setSelectedVendors(newSelectedVendors);

        // Fetch warehouses for this vendor
        reloadWarehousesList(vendor);
    }, [selectedVendors, onMetaChange]);

    const handleVendorRemove = useCallback((vendorId) => {
        const newSelectedVendors = selectedVendors.filter(v => v !== vendorId);
        onMetaChange('shipping_vendors', newSelectedVendors);
        setSelectedVendors(newSelectedVendors);

        // Remove warehouses for this vendor
        setWarehouses(prev => prev.filter(w => w.vendor_id !== vendorId));

        // Remove selected warehouses for this vendor
        const newSelectedWarehouses = selectedWarehouses.filter(w => w.vendor_id !== vendorId);
        onMetaChange('shipping_warehouses', newSelectedWarehouses);
        setSelectedWarehouses(newSelectedWarehouses);
    }, [selectedVendors, warehouses, selectedWarehouses, onMetaChange]);

    const handleWarehouseToggle = useCallback((warehouse) => {
        const isSelected = selectedWarehouses.some(w => w === warehouse.id);
        let newSelectedWarehouses;
        
        if (isSelected) {
            newSelectedWarehouses = selectedWarehouses.filter(w => w !== warehouse.id);
        } else {
            newSelectedWarehouses = [...selectedWarehouses, warehouse.id];
        }
        
        setSelectedWarehouses(newSelectedWarehouses);
        onMetaChange('shipping_warehouses', newSelectedWarehouses.map(i => Number(i)));
    }, [selectedWarehouses, onMetaChange]);

    return (
        <div className="xpo_space-y-6">
            {/* Vendor Search */}
            <FormField label={__('Search Vendors', 'site-core')} help={__('Search and select vendors for shipping', 'site-core')}>
                <div className="xpo_relative">
                    <TextInput 
                        value={search} 
                        onFocus={e => setAutocomShown(true)}
                        onChange={e => setSearch(e.target.value)}
                        onBlur={e => setTimeout(() => {setAutocomShown(false);}, 1500)}
                        placeholder={__('Type to search vendors...', 'site-core')}
                    />
                    {loading && (
                        <div className="xpo_absolute xpo_right-3 xpo_top-3">
                            <div className="xpo_animate-spin xpo_w-4 xpo_h-4 xpo_border-2 xpo_border-blue-600 xpo_border-t-transparent xpo_rounded-full"></div>
                        </div>
                    )}
                    {autocomShown && vendors.length > 0 && (
                        <div className="xpo_absolute xpo_z-10 xpo_w-full xpo_mt-1 xpo_bg-scwhite xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-lg xpo_max-h-60 xpo_overflow-y-auto">
                            {vendors.map(vendor => (
                                <div 
                                    key={vendor.id}
                                    onClick={() => handleVendorSelect(vendor)}
                                    className={`xpo_p-3 xpo_cursor-pointer hover:xpo_bg-gray-50 xpo_border-b xpo_border-gray-100 last:xpo_border-b-0 ${
                                        selectedVendors.some(vid => vid === vendor.id) ? 'xpo_bg-blue-50 xpo_text-blue-700' : ''
                                    }`}
                                >
                                    <div className="xpo_font-medium">{vendor.name}</div>
                                    <div className="xpo_text-sm xpo_text-gray-500">{vendor.email}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FormField>

            {/* Selected Vendors */}
            {selectedVendors.length > 0 && (
                <FormField label={__('Selected Vendors', 'site-core')}>
                    <div className="xpo_space-y-2">
                        {selectedVendors.map((vid, index) => {
                            const vendor = vendors.find(v => v.id == vid);
                            if (!vendor) return <div key={index}>Vendor ID #{vid}</div>;
                            return (
                                <div key={index} className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 xpo_bg-blue-50 xpo_border xpo_border-blue-200 xpo_rounded-md">
                                    <div>
                                        <div className="xpo_font-medium xpo_text-blue-800">{vendor.name}</div>
                                        <div className="xpo_text-sm xpo_text-blue-600">{vendor.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleVendorRemove(vendor.id)}
                                        className="xpo_text-red-500 hover:xpo_text-red-700 xpo_transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </FormField>
            )}

            {/* Warehouses */}
            {warehouses.length > 0 && (
                <FormField label={__('Available Warehouses', 'site-core')} help={__('Select warehouses for shipping from selected vendors', 'site-core')}>
                    <div className="xpo_space-y-2 xpo_max-h-60 xpo_overflow-y-auto">
                        {warehouses.map(warehouse => {
                            const isSelected = selectedWarehouses.some(w => w === warehouse.id);
                            const vendor = selectedVendors.find(v => v.id === warehouse.vendor_id);
                            
                            return (
                                <div 
                                    key={warehouse.id}
                                    onClick={() => handleWarehouseToggle(warehouse)}
                                    className={`xpo_p-3 xpo_border xpo_rounded-md xpo_cursor-pointer xpo_transition-colors ${
                                        isSelected 
                                            ? 'xpo_bg-green-50 xpo_border-green-300 xpo_text-green-800' 
                                            : 'xpo_bg-gray-50 xpo_border-gray-200 hover:xpo_bg-gray-100'
                                    }`}
                                >
                                    <div className="xpo_flex xpo_items-center xpo_justify-between">
                                        <div>
                                            <div className="xpo_font-medium">{warehouse.name}</div>
                                            <div className="xpo_text-sm xpo_text-gray-600">{vendor?.name}</div>
                                            <div className="xpo_text-xs xpo_text-gray-500">{warehouse.address}</div>
                                        </div>
                                        <div className={`xpo_w-4 xpo_h-4 xpo_border-2 xpo_rounded ${
                                            isSelected ? 'xpo_bg-green-500 xpo_border-green-500' : 'xpo_border-gray-300'
                                        }`}>
                                            {isSelected && <div className="xpo_w-full xpo_h-full xpo_text-scwhite xpo_text-xs xpo_flex xpo_items-center xpo_justify-center">✓</div>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </FormField>
            )}
        </div>
    );
};

const PlaceholderTab = ({ label }) => (
    <div className="xpo_p-6 xpo_bg-gray-50 xpo_rounded-md">
        {sprintf(__(`"%s" tab content goes here.`, 'site-core'), label)}
    </div>
);

export default function ProductMetaBox({ product_id = null }) {

    window.createScProduct = (productPayload, ajaxUrl = '/wp-admin/admin-ajax.php') => {
        axios.get(ajaxUrl, {params: {action: 'create_sc_product', payload: productPayload}})
        .then(res => res.data)
        .then(res => console.log(res))
        .catch(err => console.log(err?.message));
    }
    
    
    const [activeTab, setActiveTab] = useState('general');
    const [variations, setVariations] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [popup, setPopup] = useState(null);
    const [meta, setMeta] = useState({
        sku: '',
        price: '',
        gallery: [],
        currency: 'bdt',
        sale_price: '',
        description: '',
        // status: 'draft',
        short_description: '',
        product_type: 'simple',
        // SEO fields
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
        canonical_url: '',
        specifications: [],
        // Shipping fields
        shipping_vendors: [],
        shipping_warehouses: [],
    });

    useEffect(() => {
        if (!product_id) {
            setLoading(false);
            return;
        }
        
        axios.get(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox`))
            .then(res => res.data)
            .then(res => {
                if (res) setMeta(prevMeta => ({
                    ...prevMeta,
                    // ...Object.entries(res).reduce((carry, [key, vals]) => {
                    //     carry[key] = vals[0] || vals;
                    //     return carry;
                    // }, {})
                    ...res
                }));
                return true;
            })
            .then(async () => {
                await axios.get(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox/variations`))
                .then(res => res.data)
                .then(res => setVariations(res));
            })
            .catch(err => console.log(err?.message))
            .finally(() => setLoading(false));
    }, [product_id]);

    const handleMetaChange = useCallback((key, value) => {
        setMeta(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleVariationsChange = useCallback((list) => {
        setVariations(list);
    }, []);

    const handleSave = useCallback(() => {
        setSaving(true);
        axios.post(rest_url(`/sitecore/v1/ecommerce/products/${product_id}/metabox`), { meta })
            .then(res => res.data)
            .then(res => {
                console.log('Saved!', res);
                // You can add a success toast/notification here
            })
            .catch(err => console.log('Failed to save', err?.message))
            .finally(() => setSaving(false));
    }, [meta, product_id]);

    const tabs = [
        { id: 'general', label: __('General', 'site-core'), icon: <Settings size={18} /> },
        { id: 'gallery', label: __('Gallery', 'site-core'), icon: <Images size={18} /> },
        { id: 'seo', label: __('SEO', 'site-core'), icon: <Globe size={18} /> },
        // { id: 'stock', label: __('Stock Management', 'site-core'), icon: <Warehouse size={18} /> },
        { id: 'variations', label: __('Variations', 'site-core'), icon: <Spline size={18} />, condition: () => meta.product_type == 'variable' },
        { id: 'attributes', label: __('Attributes', 'site-core'), icon: <Split size={18} />, condition: () => meta.product_type == 'variable' },
        { id: 'shipping', label: __('Shipping', 'site-core'), icon: <Truck size={18} /> },
        { id: 'specifications', label: __('Specifications', 'site-core'), icon: <ListChecks size={18} /> },
        // { id: 'linked', label: __('Linked Products', 'site-core'), icon: <Link size={18} /> },
        // { id: 'advanced', label: __('Advanced', 'site-core'), icon: <Cog size={18} /> },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': 
                return <GeneralTab meta={meta} onMetaChange={handleMetaChange} />;
            case 'variations': 
                return <VariationsTab meta={meta} product_id={product_id} variations={variations} attributes={attributes} onMetaChange={handleVariationsChange} />;
            case 'attributes': 
                return <AttributesTab product_id={product_id} attributes={attributes} setAttributes={setAttributes} />;
            case 'stock': 
                return <PlaceholderTab label="Stock Management" />;
            case 'shipping': 
                return <ShippingTab meta={meta} onMetaChange={handleMetaChange} />;
            case 'seo': 
                return <SeoTab meta={meta} onMetaChange={handleMetaChange} />;
            case 'specifications': 
                return <Specifications meta={meta} onMetaChange={handleMetaChange} />;
            case 'gallery': 
                return <ProductGallery meta={meta} onMetaChange={handleMetaChange} />;
            case 'linked': 
                return <PlaceholderTab label="Linked Products" />;
            case 'advanced': 
                return <PlaceholderTab label="Advanced" />;
            default: 
                return null;
        }
    };

    if (loading) {
        return (
            <div className="xpo_p-6">
                <div className="xpo_animate-pulse xpo_space-y-4">
                    <div className="xpo_h-8 xpo_bg-gray-200 xpo_rounded w-1/4"></div>
                    <div className="xpo_h-12 xpo_bg-gray-200 xpo_rounded"></div>
                    <div className="xpo_h-24 xpo_bg-gray-200 xpo_rounded"></div>
                    <div className="xpo_h-12 xpo_bg-gray-200 xpo_rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="xpo_bg-gray-50 xpo_p-1.5 xpo_rounded-lg">
            <div className="xpo_flex xpo_flex-col md:xpo_grid md:xpo_grid-cols-[1fr_5fr] xpo_gap-6">
                {/* Tabs Navigation */}
                <div className="xpo_w-full">
                    <ul className="xpo_space-y-1">
                        {tabs.filter(tab => !tab?.condition || tab.condition()).map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`xpo_w-full xpo_flex xpo_items-center xpo_gap-3 xpo_p-3 xpo_rounded-md xpo_text-left xpo_font-medium ${activeTab === tab.id ? 'xpo_bg-scwhite xpo_text-blue-600 xpo_shadow-sm' : 'xpo_text-gray-600 hover:xpo_bg-gray-100'}`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="xpo_w-full xpo_bg-scwhite xpo_p-6 xpo_rounded-lg xpo_shadow-sm">
                    {renderTabContent()}
                </div>
            </div>
            
            {/* Save Button Footer */}
            <div className="xpo_flex xpo_justify-end xpo_p-4 xpo_mt-4 xpo_border-t xpo_border-gray-200">
                <Button onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? __('Saving...', 'site-core') : __('Save Changes', 'site-core')}
                </Button>
            </div>

            {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
        </div>
    );
}
