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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-4">
        <div className="col-span-1">
            <label className="font-semibold text-gray-700">{label}</label>
            {help && <p className="text-sm text-gray-500 mt-1">{help}</p>}
        </div>
        <div className="col-span-2">
            {children}
        </div>
    </div>
);

const TextInput = ({ ...props }) => <input type="text" className="w-full p-2 border border-gray-300 rounded-md" {...props} />;

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

const Select = ({ children, ...props }) => <select className="w-full p-2 border border-gray-300 rounded-md" {...props}>{children}</select>;

const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors";
    const variants = {
        primary: "bg-blue-600 text-scwhite hover:bg-blue-700 disabled:bg-blue-400",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
        danger: "bg-red-600 text-scwhite hover:bg-red-700 disabled:bg-red-400",
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );
};

// Separate component definitions outside of main component
const GeneralTab = ({ meta, onMetaChange }) => (
    <div className="divide-y divide-gray-200">
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
        <div className="p-6">
            <h3 className="text-lg font-bold">{__('Confirm Deletion', 'site-core')}</h3>
            <p className="my-4">{message}</p>
            <div className="flex justify-end gap-4 mt-6">
                <Button variant="secondary" onClick={onCancel}>{__('Cancel', 'site-core')}</Button>
                <Button variant="danger" onClick={onConfirm}>{__('Confirm', 'site-core')}</Button>
            </div>
        </div>
    )
};

const SeoTab = ({ meta, onMetaChange }) => {
    return (
        <div className="divide-y divide-gray-200">
            <FormField label={__('SEO Title', 'site-core')} help={__('The title that appears in search engine results', 'site-core')}>
                <TextInput
                    value={meta.seo_title || ''}
                    onChange={e => onMetaChange('seo_title', e.target.value)}
                    placeholder={__('Enter SEO title', 'site-core')}
                />
            </FormField>
            <FormField label={__('SEO Description', 'site-core')} help={__('The description that appears in search engine results', 'site-core')}>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                    value={meta.seo_description || ''}
                    onChange={e => onMetaChange('seo_description', e.target.value)}
                    placeholder={__('Enter SEO description', 'site-core')}
                    maxLength="160"
                />
                <p className="text-xs text-gray-500 mt-1">
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
                    className="w-full p-2 border border-gray-300 rounded-md h-20"
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
        <div className="divide-y divide-gray-200">
            <FormField label={__('Specifications', 'site-core')} help={__('Add product specifications')}>
                {specifications.map((spec, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                            placeholder={__('Label', 'site-core')}
                            value={spec.label}
                            onChange={e => handleSpecChange(index, 'label', e.target.value)}
                        />
                        <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-md"
                            placeholder={__('Value', 'site-core')}
                            value={spec.value}
                            onChange={e => handleSpecChange(index, 'value', e.target.value)}
                        />
                        <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => removeSpecification(index)}
                            aria-label={__('Remove specification', 'site-core')}
                        >
                            &times;
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-blue-600 text-scwhite rounded-md hover:bg-blue-700"
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
        <div className="divide-y divide-gray-200">
            <FormField label={__('Product Gallery', 'site-core')} help={__('Add product gallery images')}>
                {gallery.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-4">
                        <div className="w-24 h-24 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
                            {item.url ? (
                                <img src={item.url} alt="" className="object-cover w-full h-full" />
                            ) : (
                                <span className="text-gray-400">{__('No image', 'site-core')}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder={__('Image URL', 'site-core')}
                                value={item.url}
                                onChange={(e) => handleUrlChange(index, e.target.value)}
                            />
                        </div>
                        <button
                            type="button"
                            className="bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300"
                            onClick={() => openMediaLibrary(index)}
                            aria-label={__('Select from media library', 'site-core')}
                        >
                            {__('Select')}
                        </button>
                        <button
                            type="button"
                            className="text-red-600 hover:text-red-800 text-2xl font-bold"
                            onClick={() => removeGalleryItem(index)}
                            aria-label={__('Remove gallery image', 'site-core')}
                        >
                            &times;
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-blue-600 text-scwhite rounded-md hover:bg-blue-700"
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
                    res.data.map(i => ({ id: Number(i.id), name: i.business_name, email: i.business_email, website: i.business_website, penalty: i.penalty_score }))
                ))
                .catch(err => console.log(err?.message)).finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delay);
    }, [search]);

    const reloadWarehousesList = (vendor) => {
        setLoading(true);
        axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor.id}/warehouses`), { params: { include_ids: selectedVendors } })
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
        <div className="space-y-6">
            {/* Vendor Search */}
            <FormField label={__('Search Vendors', 'site-core')} help={__('Search and select vendors for shipping', 'site-core')}>
                <div className="relative">
                    <TextInput
                        value={search}
                        onFocus={e => setAutocomShown(true)}
                        onChange={e => setSearch(e.target.value)}
                        onBlur={e => setTimeout(() => { setAutocomShown(false); }, 1500)}
                        placeholder={__('Type to search vendors...', 'site-core')}
                    />
                    {loading && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                    )}
                    {autocomShown && vendors.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-scwhite border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {vendors.map(vendor => (
                                <div
                                    key={vendor.id}
                                    onClick={() => handleVendorSelect(vendor)}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${selectedVendors.some(vid => vid === vendor.id) ? 'bg-blue-50 text-blue-700' : ''
                                        }`}
                                >
                                    <div className="font-medium">{vendor.name}</div>
                                    <div className="text-sm text-gray-500">{vendor.email}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </FormField>

            {/* Selected Vendors */}
            {selectedVendors.length > 0 && (
                <FormField label={__('Selected Vendors', 'site-core')}>
                    <div className="space-y-2">
                        {selectedVendors.map((vid, index) => {
                            const vendor = vendors.find(v => v.id == vid);
                            if (!vendor) return <div key={index}>Vendor ID #{vid}</div>;
                            return (
                                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div>
                                        <div className="font-medium text-blue-800">{vendor.name}</div>
                                        <div className="text-sm text-blue-600">{vendor.email}</div>
                                    </div>
                                    <button
                                        onClick={() => handleVendorRemove(vendor.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
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
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {warehouses.map(warehouse => {
                            const isSelected = selectedWarehouses.some(w => w === warehouse.id);
                            const vendor = selectedVendors.find(v => v.id === warehouse.vendor_id);

                            return (
                                <div
                                    key={warehouse.id}
                                    onClick={() => handleWarehouseToggle(warehouse)}
                                    className={`p-3 border rounded-md cursor-pointer transition-colors ${isSelected
                                            ? 'bg-green-50 border-green-300 text-green-800'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{warehouse.name}</div>
                                            <div className="text-sm text-gray-600">{vendor?.name}</div>
                                            <div className="text-xs text-gray-500">{warehouse.address}</div>
                                        </div>
                                        <div className={`w-4 h-4 border-2 rounded ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                            }`}>
                                            {isSelected && <div className="w-full h-full text-scwhite text-xs flex items-center justify-center">✓</div>}
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
    <div className="p-6 bg-gray-50 rounded-md">
        {sprintf(__(`"%s" tab content goes here.`, 'site-core'), label)}
    </div>
);

export default function ProductMetaBox({ product_id = null }) {

    window.createScProduct = (productPayload, ajaxUrl = '/wp-admin/admin-ajax.php') => {
        axios.get(ajaxUrl, { params: { action: 'create_sc_product', payload: productPayload } })
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
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-1.5 rounded-lg">
            <div className="flex flex-col md:grid md:grid-cols-[1fr_5fr] gap-6">
                {/* Tabs Navigation */}
                <div className="w-full">
                    <ul className="space-y-1">
                        {tabs.filter(tab => !tab?.condition || tab.condition()).map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-md text-left font-medium ${activeTab === tab.id ? 'bg-scwhite text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tab Content */}
                <div className="w-full bg-scwhite p-6 rounded-lg shadow-sm">
                    {renderTabContent()}
                </div>
            </div>

            {/* Save Button Footer */}
            <div className="flex justify-end p-4 mt-4 border-t border-gray-200">
                <Button onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? __('Saving...', 'site-core') : __('Save Changes', 'site-core')}
                </Button>
            </div>

            {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
        </div>
    );
}
