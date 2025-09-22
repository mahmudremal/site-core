import axios from 'axios';
import { sprintf } from 'sprintf-js';
import { __, Popup } from '@js/utils';
import { useState, useEffect } from 'react';
import { ConfirmDialog } from './VendorList';
import { rest_url, notify } from '@functions';
import { Link, useParams } from 'react-router-dom';
import { Eye, Trash2, ArrowLeft, Package, Building, MapPin, DollarSign, Star, Tag, Box, Calendar, Globe, ShoppingCart, Truck, CheckCircle, XCircle, AlertTriangle, Info, Image as ImageIcon, Weight, Ruler, BarChart3, Plus, Warehouse, MessageSquare, Phone, Boxes, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Product Details Popup Component
const ProductDetailsPopup = ({ product }) => {
  const { vendor_id, warehouse_id = Number(product.warehouse_id) } = useParams();
  const wooProduct = product.product;
  const metadata = wooProduct?.metadata??{};
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMore, setShowMore] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (!showMore) return;
    if (warehouses.length) return;

    axios.get(rest_url(`/sitecore/v1/storemanager/product/warehouse/${product.product_id}`), {params: {exclude__ids: warehouse_id}})
    .then(res => res.data).then(res => setWarehouses(res.data)).catch(err => 
      notify.error(err?.response?.data?.message ?? err?.message)
    )
  }, [showMore]);
  
  const getProductImages = () => {
    const images = (wooProduct?.images??wooProduct?.metadata?.gallery).filter(i => i?.url??i?.src);
    if (!images?.length && wooProduct?.featured_image) return [{src: wooProduct.featured_image, alt: wooProduct?.name??wooProduct?.title}];
    return images.map(img => ({
      src: img?.src ?? img.url,
      alt: img?.alt ?? wooProduct.name
    }));
  };

  const getStockStatus = () => {
    if (!wooProduct) return { status: 'unknown', color: 'gray', icon: Info };
    
    if (wooProduct?.stock_status === 'instock') {
      return { status: 'In Stock', color: 'green', icon: CheckCircle };
    } else if (wooProduct?.stock_status === 'outofstock') {
      return { status: 'Out of Stock', color: 'red', icon: XCircle };
    } else {
      return { status: 'On Backorder', color: 'yellow', icon: AlertTriangle };
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const images = getProductImages();
  const stockInfo = getStockStatus();
  const StockIcon = stockInfo.icon;

const WarehouseCard = ({ data = {} }) => {
    const [house, setHouse] = useState({ ...data });

    return (
        <div className="xpo_bg-white xpo_shadow-lg xpo_rounded-lg xpo_p-6 xpo_m-4 xpo_transition-transform xpo_duration-300 xpo_hover:scale-105 xpo_hover:shadow-xl">
            <Link to={`/vendors/${vendor_id}/warehouses/${house.id}/products`} className="xpo_block xpo_text-center">
                <Warehouse className="xpo_w-16 xpo_h-16 xpo_mx-auto xpo_text-blue-600 xpo_mb-4" />
                <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-2">{house.business_name}</h2>
                <p className="xpo_text-gray-600 xpo_text-sm xpo_mb-2">{house.warehouse_title}</p>
                <p className="xpo_text-gray-500 xpo_text-xs xpo_mb-2">{house.address}</p>
                <p className="xpo_text-gray-500 xpo_text-xs">Contact: <span className="xpo_font-medium">{house.contact_number}</span></p>
                <p className="xpo_text-gray-500 xpo_text-xs">WhatsApp: <span className="xpo_font-medium">{house.whatsapp_number}</span></p>
            </Link>
        </div>
    );
};


  return (
    <div className="xpo_max-w-4xl xpo_max-h-[90vh] xpo_overflow-y-auto xpo_flex xpo_flex-col xpo_gap-6">
      <div className="xpo_flex xpo_flex-col lg:xpo_flex-row xpo_gap-6">
        {/* Product Images */}
        <div className="lg:xpo_w-1/2">
          {images.length > 0 ? (
            <div>
              {/* Main Image */}
              <div className="xpo_aspect-square xpo_bg-gray-100 xpo_rounded-lg xpo_overflow-hidden xpo_mb-4">
                <img
                  src={images[activeImageIndex]?.src}
                  alt={images[activeImageIndex]?.alt}
                  className="xpo_w-full xpo_h-full xpo_object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="xpo_w-full xpo_h-full xpo_bg-gray-200 xpo_flex xpo_items-center xpo_justify-center xpo_hidden">
                  <ImageIcon className="xpo_w-16 xpo_h-16 xpo_text-gray-400" />
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="xpo_flex xpo_gap-2 xpo_overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`xpo_flex-shrink-0 xpo_w-16 xpo_h-16 xpo_rounded-lg xpo_overflow-hidden xpo_border-2 xpo_transition-colors ${
                        index === activeImageIndex 
                          ? 'xpo_border-blue-500' 
                          : 'xpo_border-gray-200 hover:xpo_border-gray-300'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="xpo_w-full xpo_h-full xpo_object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="xpo_aspect-square xpo_bg-gray-100 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
              <div className="xpo_text-center">
                <ImageIcon className="xpo_w-16 xpo_h-16 xpo_text-gray-400 xpo_mx-auto xpo_mb-2" />
                <span className="xpo_text-gray-500">{__('No image available', 'site-core')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:xpo_w-1/2 xpo_space-y-6">
          {/* Header */}
          <div>
            <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
              {wooProduct?.name || (product?.post_title??wooProduct.title)}
            </h2>
            <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-4">
              <div className={`xpo_flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-sm xpo_bg-${stockInfo.color}-100 xpo_text-${stockInfo.color}-800`}>
                <StockIcon size={14} />
                {stockInfo.status}
              </div>
              {wooProduct?.featured && (
                <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-sm xpo_bg-yellow-100 xpo_text-yellow-800">
                  <Star size={14} />
                  {__('Featured', 'site-core')}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          {wooProduct && (
            <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-4">
              <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-2">
                <DollarSign className="xpo_text-green-600" size={20} />
                <h3 className="xpo_font-semibold xpo_text-gray-900">{__('Pricing', 'site-core')}</h3>
              </div>
              <div className="xpo_space-y-1">
                {(wooProduct.sale_price && wooProduct.sale_price !== wooProduct.regular_price) || (
                  metadata.sale_price && metadata.sale_price !== metadata.price
                ) ? (
                  <div className="xpo_flex xpo_items-center xpo_gap-2">
                    <span className="xpo_text-2xl xpo_font-bold xpo_text-green-600">
                      {formatPrice(wooProduct?.sale_price??metadata?.sale_price)}
                    </span>
                    <span className="xpo_text-lg xpo_text-gray-500 xpo_line-through">
                      {formatPrice(wooProduct?.regular_price??metadata?.price)}
                    </span>
                  </div>
                ) : (
                  <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
                    {formatPrice(wooProduct?.regular_price??metadata.price)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Warehouse Info */}
          <div className="xpo_bg-blue-50 xpo_rounded-lg xpo_p-4">
            <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-3">
              <Building className="xpo_text-blue-600" size={20} />
              <h3 className="xpo_font-semibold xpo_text-gray-900">{__('Warehouse Information', 'site-core')}</h3>
            </div>
            <div className="xpo_space-y-2">
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <Package size={16} className="xpo_text-gray-400" />
                <span className="xpo_text-sm xpo_text-gray-600">{__('Vendor:', 'site-core')}</span>
                <span className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{product.business_name}</span>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                <Building size={16} className="xpo_text-gray-400" />
                <span className="xpo_text-sm xpo_text-gray-600">{__('Warehouse:', 'site-core')}</span>
                <span className="xpo_text-sm xpo_font-medium xpo_text-gray-900">{product.warehouse_title}</span>
              </div>
              {product.warehouse_address && (
                <div className="xpo_flex xpo_items-start xpo_gap-2">
                  <MapPin size={16} className="xpo_text-gray-400 xpo_mt-0.5" />
                  <span className="xpo_text-sm xpo_text-gray-600">{product.warehouse_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          {wooProduct && (
            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
              {/* Stock Quantity */}
              {(wooProduct?.stock_quantity || metadata?.stock) && (
                <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                  <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                    <BarChart3 size={16} className="xpo_text-gray-600" />
                    <span className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Stock', 'site-core')}</span>
                  </div>
                  <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                    {wooProduct?.stock_quantity ? sprintf(__('%f units', 'site-core'), wooProduct.stock_quantity) : metadata?.stock}
                  </span>
                </div>
              )}

              {/* Weight */}
              {wooProduct.weight && (
                <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                  <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                    <Weight size={16} className="xpo_text-gray-600" />
                    <span className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Weight', 'site-core')}</span>
                  </div>
                  <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">
                    {wooProduct.weight} {wooProduct.weight_unit || 'kg'}
                  </span>
                </div>
              )}

              {/* SKU */}
              {wooProduct.sku && (
                <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                  <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                    <Tag size={16} className="xpo_text-gray-600" />
                    <span className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('SKU', 'site-core')}</span>
                  </div>
                  <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{wooProduct.sku}</span>
                </div>
              )}

              {/* Shipping Class */}
              {wooProduct.shipping_class && (
                <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                  <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_mb-1">
                    <Truck size={16} className="xpo_text-gray-600" />
                    <span className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Shipping', 'site-core')}</span>
                  </div>
                  <span className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{wooProduct.shipping_class}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {wooProduct?.description && (
            <div>
              <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('Description', 'site-core')}</h3>
              <div 
                className="xpo_text-sm xpo_text-gray-600 xpo_prose xpo_max-w-none"
                dangerouslySetInnerHTML={{ __html: wooProduct.description }}
              />
            </div>
          )}

          {/* Short Description */}
          {wooProduct?.short_description && wooProduct.short_description !== wooProduct.description && (
            <div>
              <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('Summary', 'site-core')}</h3>
              <div 
                className="xpo_text-sm xpo_text-gray-600 xpo_prose xpo_max-w-none"
                dangerouslySetInnerHTML={{ __html: wooProduct.short_description }}
              />
            </div>
          )}

          {/* Categories */}
          {wooProduct?.categories && wooProduct.categories.length > 0 && (
            <div>
              <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('Categories', 'site-core')}</h3>
              <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                {wooProduct.categories.map((category, index) => (
                  <span
                    key={index}
                    className="xpo_px-2 xpo_py-1 xpo_bg-blue-100 xpo_text-blue-800 xpo_rounded-full xpo_text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {wooProduct?.tags && wooProduct.tags.length > 0 && (
            <div>
              <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_mb-2">{__('Tags', 'site-core')}</h3>
              <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                {wooProduct.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="xpo_px-2 xpo_py-1 xpo_bg-gray-100 xpo_text-gray-700 xpo_rounded-full xpo_text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="xpo_flex xpo_flex-col lg:xpo_flex-row xpo_gap-6">
        {!showMore ? (<button type="button" onClick={(e) => setShowMore(true)} className="xpo_flex xpo_gap-2 xpo_justify-center xpo_items-center xpo_bg-gray-200 hover:xpo_bg-gray-300 xpo_text-gray-700 xpo_font-bold xpo_py-2 xpo_px-4 xpo_rounded xpo_w-full"><ChevronDown size={16} />Show More</button>) : (
          <div className="xpo_w-full xpo_grid md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-3">
            {/* [...Array(10).keys()].map(i => warehouses[0]) */}
            {warehouses.map((w, i) => <WarehouseCard key={i} data={{...w}} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProductList() {
  const { vendor_id, warehouse_id = null } = useParams();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const [filters, setFilters] = useState({
    page: 1, per_page: 12, search: ''
  });
  const [pagination, setPagination] = useState({
    totalPage: 1
  });

  useEffect(() => {
    axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}${warehouse_id ? `/warehouses/${warehouse_id}` : ''}/products`), {params: {...filters}})
    .then(res => {
      setPagination(prev => ({
        ...prev,
        totalItems: Number(res.headers.get('x-wp-total')),
        totalPage: Number(res.headers.get('x-wp-totalpages')),
      }));
      return res.data;
    })
    .then(res => setProducts(res.data))
    .catch(err => 
      notify.error(err?.response?.data?.message ?? err?.message)
    )
  }, [filters]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vendorRes, warehouseRes] = await Promise.all([
          axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}`)),
          warehouse_id ? axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}/warehouses/${warehouse_id}`)) : Promise.resolve(null)
        ]);

        if (vendorRes.data?.success) {
          setVendor(vendorRes.data.data);
        }

        if (warehouseRes?.data?.success) {
          setWarehouse(warehouseRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendor_id, warehouse_id]);

  const handleDeleteProduct = async (product) => {
    setPopup(
      <ConfirmDialog
        title={__('Delete Product', 'site-core')}
        message={sprintf(__(`Are you sure you want to delete "%s"? This action cannot be undone.`, 'site-core'), product?.post_title??product.product.title)}
        onConfirm={async () => {
          axios.delete(rest_url(`/sitecore/v1/storemanager/product/warehouse/${product.warehouse_id}/${product.product_id}`))
          .then(res => res.data)
          .then(res => setProducts(prev => prev.filter(p => p.id !== product.id)))
          .then(() => notify.success(__('Product deleted successfully!', 'site-core')))
          .then(() => setPopup(null))
          .catch(err => 
            notify.error(err?.response?.data?.message ?? err?.message)
          )
        }}
        onCancel={() => setPopup(null)}
      />
    );
  };

  const getProductImage = (product) => {
    // 
    const productObj = product?.product;
    if (productObj) {
      if (productObj?.featured_image) {
        return productObj.featured_image;
      }
      if (productObj?.images?.length) {
        return productObj.images[0]?.src || productObj.images[0]?.url;
      }
      const metadata = productObj?.metadata;
      if (metadata?.gallery?.length) {
        return metadata.gallery.find(i => i.url).url;
      }
    }
    return null;
  };

  const formatPrice = (product) => {
    if (!product.product) return 'N/A';
    const wooProduct = product.product;
    if (wooProduct.sale_price && wooProduct.sale_price !== wooProduct.regular_price) {
      return `$${wooProduct.sale_price}`;
    }
    return `$${wooProduct.regular_price || wooProduct.price || 'N/A'}`;
  };

  const getStockStatus = (product) => {
    if (!product.product) return { status: 'Unknown', color: 'gray', icon: Info };
    
    const stockStatus = product.product.stock_status;
    if (stockStatus === 'instock') {
      return { status: 'In Stock', color: 'green', icon: CheckCircle };
    } else if (stockStatus === 'outofstock') {
      return { status: 'Out of Stock', color: 'red', icon: XCircle };
    } else {
      return { status: 'Backorder', color: 'yellow', icon: AlertTriangle };
    }
  };

  const EditProduct = ({ data = {} }) => {
    const [formData, setFormData] = useState({
      id: 0,
      address: '',
      latlon: '',
      district: '',
      contact_number: '',
      warehouse_title: '',
      whatsapp_number: '',
      ...data
    });
    const [warehouses, setWarehouses] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [productsList, setProductsList] = useState([]);
    const [filters, setFilters] = useState({products: '', warehouses: ''});

    useEffect(() => {
      if (warehouse_id) return;
      if (warehouses.find(w => w.id == filters.warehouses)) return;
      const delay = setTimeout(() => {
        axios.get(rest_url(`/sitecore/v1/storemanager/autocomplete/warehouses`), {params: {vendor_id, warehouse_id, search: filters.warehouses}})
        .then(res => res.data).then(res => setWarehouses(res.data))
        .catch(err => notify.error(
          err?.response?.data?.message ?? err?.message
        ));
      }, 2000);

      return () => clearTimeout(delay);
    }, [filters.warehouses]);
    
    useEffect(() => {
      if (productsList.find(w => w.id == filters.products)) return;
      const delay = setTimeout(() => {
        axios.get(rest_url(`/sitecore/v1/storemanager/autocomplete/products`), {params: {vendor_id, warehouse_id, search: filters.products}})
        .then(res => res.data).then(res => setProductsList(res.data))
        .catch(err => notify.error(
          err?.response?.data?.message ?? err?.message
        ));
      }, 2000);

      return () => clearTimeout(delay);
    }, [filters.products]);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      axios.post(rest_url(`/sitecore/v1/storemanager/product/warehouse/${warehouse_id ? warehouse_id : filters.warehouses}/${filters.products}`), {})
      // axios.post(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}/warehouses/${warehouse_id}/products`), formData)
      .then(res => res.data)
      .then(res => {
        if (!res?.success) {
          throw new Error(res.data?.message ?? 'Failed to save warehouse.');
        }
        return res;
      })
      .then(res => {
        // Update products list
        setProducts(prev => {
          if (formData.id && formData.id !== 0) {
            // Update existing product
            return prev.map(w => w.id === formData.id ? { ...w, ...formData } : w);
          } else {
            // Add new product
            const newWarehouse = { ...formData, id: res.data.id };
            return [newWarehouse, ...prev];
          }
        });
        notify.success(__('Warehouse saved successfully!', 'site-core'));
        setPopup(null);
        return res;
      })
      .catch(err => 
        notify.error(err?.response?.data?.message ?? err?.message)
      )
      .finally(() => setSubmitting(false));
    };

    return (
      <div>
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Warehouse', 'site-core') : __('Add New Product', 'site-core')}
        </h2>
        
        <form onSubmit={handleSubmit} className="xpo_space-y-4">
          {/* Product Name */}
          <div>
            <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
              {__('Product Name', 'site-core')} *
            </label>
            <div className="xpo_relative">
              <Boxes className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
              <input
                required
                type="text"
                list="product-list"
                value={formData.product_id}
                onChange={(e) => setFilters(prev => ({...prev, products: e.target.value}))}
                // onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                placeholder={__('Enter product name', 'site-core')}
              />
              <datalist id="product-list">
                {productsList.map(p => <option key={p.id} value={p.id}>{p.product_title}</option>)}
              </datalist>
            </div>
          </div>
          
          {/* Warehouse Name */}
          {!warehouse_id && (
            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">
                {__('Warehouse Name', 'site-core')} *
              </label>
              <div className="xpo_relative">
                <Warehouse className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  list="warehouse-list"
                  value={formData.warehouse_id}
                  onChange={(e) => setFilters(prev => ({...prev, warehouses: e.target.value}))}
                  // onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
                  className="xpo_w-full !xpo_pl-10 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_outline-none"
                  placeholder={__('Enter warehouse name', 'site-core')}
                />
                <datalist id="warehouse-list">
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_title}</option>)}
                </datalist>
              </div>
            </div>
          )}

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

  const Pagination = () => {
    return (
      <div className="xpo_container xpo_mx-auto xpo_py-4">
        <div className="xpo_pagination xpo_flex xpo_items-center xpo_justify-between xpo_px-4">
          <div className="xpo_page_info xpo_text-sm xpo_text-gray-600">
            Page {filters.page} of {pagination.totalPage}
          </div>
          <div className="xpo_controls xpo_flex xpo_items-center xpo_space-x-2">
            <button 
              type="button"
              className={`xpo_prev_btn xpo_flex xpo_items-center xpo_justify-center xpo_w-10 xpo_h-10 xpo_rounded-full ${filters.page === 1 ? 'xpo_bg-gray-200 xpo_text-gray-400 xpo_cursor-not-allowed' : 'xpo_bg-blue-100 xpo_text-blue-600 hover:xpo_bg-blue-200'}`}
              onClick={() => filters.page > 1 && setFilters({...filters, page: filters.page - 1})}
              disabled={filters.page === 1}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="xpo_pages xpo_flex xpo_items-center xpo_space-x-1">
              {Array.from({length: Math.min(5, pagination.totalPage)}, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`xpo_page_btn xpo_w-10 xpo_h-10 xpo_rounded-full ${filters.page === pageNumber ? 'xpo_bg-blue-600 xpo_text-white' : 'xpo_bg-white xpo_text-gray-700 hover:xpo_bg-gray-100'}`}
                    onClick={() => setFilters({...filters, page: pageNumber})}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {pagination.totalPage > 5 && filters.page > 3 && (
                <span className="xpo_dots xpo_px-2">...</span>
              )}
              {pagination.totalPage > 5 && (
                <button
                  className={`xpo_page_btn xpo_w-10 xpo_h-10 xpo_rounded-full ${filters.page === pagination.totalPage ? 'xpo_bg-blue-600 xpo_text-white' : 'xpo_bg-white xpo_text-gray-700 hover:xpo_bg-gray-100'}`}
                  onClick={() => setFilters({...filters, page: pagination.totalPage})}
                >
                  {pagination.totalPage}
                </button>
              )}
            </div>

            <button 
              type="button"
              className={`xpo_next_btn xpo_flex xpo_items-center xpo_justify-center xpo_w-10 xpo_h-10 xpo_rounded-full ${filters.page === pagination.totalPage ? 'xpo_bg-gray-200 xpo_text-gray-400 xpo_cursor-not-allowed' : 'xpo_bg-blue-100 xpo_text-blue-600 hover:xpo_bg-blue-200'}`}
              onClick={() => filters.page < pagination.totalPage && setFilters({...filters, page: filters.page + 1})}
              disabled={filters.page === pagination.totalPage}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="xpo_max-w-6xl xpo_mx-auto xpo_p-6">
      {/* Header */}
      <div className="xpo_mb-6">
        {/* Back Button */}
        <div className="xpo_mb-4">
          <Link
            to={warehouse_id ? `/vendors/${vendor_id}` : '/vendors'}
            className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_text-blue-600 hover:xpo_text-blue-700 xpo_transition-colors"
          >
            <ArrowLeft size={18} />
            {warehouse_id ? __('Back to Warehouses', 'site-core') : __('Back to Vendors', 'site-core')}
          </Link>
        </div>

        {/* Breadcrumb Info */}
        <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_p-6 xpo_mb-6">
          <div className="xpo_flex xpo_items-center xpo_gap-4">
            <div className="xpo_flex-shrink-0">
              <div className="xpo_h-16 xpo_w-16 xpo_rounded-full xpo_bg-blue-100 xpo_flex xpo_items-center xpo_justify-center">
                <Package className="xpo_h-8 xpo_w-8 xpo_text-blue-600" />
              </div>
            </div>
            <div className="xpo_flex-1">
              <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                {__('Products', 'site-core')}
              </h1>
              <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-gray-600">
                {vendor && (
                  <span className="xpo_flex xpo_items-center xpo_gap-1">
                    <Building size={14} />
                    {vendor.business_name}
                  </span>
                )}
                {warehouse && (
                  <>
                    <span className="xpo_text-gray-400">•</span>
                    <span className="xpo_flex xpo_items-center xpo_gap-1">
                      <Package size={14} />
                      {warehouse.warehouse_title}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="xpo_flex-shrink-0">
              <button
                  onClick={() => setPopup(<EditProduct />)}
                  className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
                >
                  <Plus size={18} />
                  {__('Add New Product', 'site-core')}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_py-12">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-8 xpo_w-8 xpo_border-b-2 xpo_border-blue-600"></div>
          <span className="xpo_ml-3 xpo_text-gray-600">{__('Loading products...', 'site-core')}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="xpo_text-center xpo_py-12">
          <Package className="xpo_mx-auto xpo_h-12 xpo_w-12 xpo_text-gray-400 xpo_mb-4" />
          <h3 className="xpo_text-lg xpo_font-medium xpo_text-gray-900 xpo_mb-2">
            {__('No products found', 'site-core')}
          </h3>
          <p className="xpo_text-gray-600 xpo_mb-4">
            {__('No products are available in this location.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditProduct />)}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors xpo_mx-auto"
          >
            <Plus size={18} />
            {__('Add New Product', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="xpo_flex xpo_flex-col xpo_gap-3">
          <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xl:xpo_grid-cols-4 xpo_gap-6">
            {products.map(product => {
              const stockInfo = getStockStatus(product);
              const StockIcon = stockInfo.icon;
              const productImage = getProductImage(product);
              const productObj = product.product;

              return (
                <div key={product.id} className="xpo_bg-white xpo_rounded-lg xpo_shadow xpo_overflow-hidden hover:xpo_shadow-lg xpo_transition-shadow">
                  {/* Product Image */}
                  <div className="xpo_aspect-square xpo_bg-gray-100 xpo_relative xpo_overflow-hidden">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product?.post_title??productObj.title}
                        className="xpo_w-full xpo_h-full xpo_object-cover hover:xpo_scale-105 xpo_transition-transform xpo_duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="xpo_w-full xpo_h-full xpo_bg-gray-200 xpo_flex xpo_items-center xpo_justify-center" style={{display: productImage ? 'none' : 'flex'}}>
                      <Package className="xpo_w-16 xpo_h-16 xpo_text-gray-400" />
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className={`xpo_absolute xpo_top-3 xpo_left-3 xpo_flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-${stockInfo.color}-100 xpo_text-${stockInfo.color}-800`}>
                      <StockIcon size={12} />
                      {stockInfo.status}
                    </div>

                    {/* Featured Badge */}
                    {productObj?.featured && (
                      <div className="xpo_absolute xpo_top-3 xpo_right-3 xpo_flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_rounded-full xpo_text-xs xpo_font-medium xpo_bg-yellow-100 xpo_text-yellow-800">
                        <Star size={12} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="xpo_p-4">
                    <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-2 xpo_line-clamp-2">
                      {product?.post_title??productObj.title}
                    </h3>

                    {/* Price */}
                    <div className="xpo_mb-3">
                      <span className="xpo_text-xl xpo_font-bold xpo_text-green-600">
                        {formatPrice(product)}
                      </span>
                      {productObj?.sale_price && productObj.sale_price !== (productObj?.regular_price??productObj.price) && (
                        <span className="xpo_text-sm xpo_text-gray-500 xpo_line-through xpo_ml-2">
                          ${productObj?.regular_price??productObj.price}
                        </span>
                      )}
                    </div>

                    {/* Warehouse Info */}
                    <div className="xpo_space-y-1 xpo_mb-4">
                      <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-gray-600">
                        <Building size={14} className="xpo_text-gray-400" />
                        <span className="xpo_truncate">{product.business_name}</span>
                      </div>
                      <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm xpo_text-gray-600">
                        <Package size={14} className="xpo_text-gray-400" />
                        <span className="xpo_truncate">{product.warehouse_title}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="xpo_flex xpo_gap-2">
                      <button
                        onClick={() => setPopup(<ProductDetailsPopup product={product} />)}
                        className="xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_bg-blue-600 xpo_text-white xpo_px-3 xpo_py-2 xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors"
                      >
                        <Eye size={16} />
                        {__('Details', 'site-core')}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="xpo_p-2 xpo_text-gray-600 hover:xpo_text-red-600 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors"
                        title={__('Delete product', 'site-core')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination />
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