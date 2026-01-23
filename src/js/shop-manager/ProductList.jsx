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
  const metadata = wooProduct?.metadata ?? {};
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMore, setShowMore] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (!showMore) return;
    if (warehouses.length) return;

    axios.get(rest_url(`/sitecore/v1/storemanager/product/warehouse/${product.product_id}`), { params: { exclude__ids: warehouse_id } })
      .then(res => res.data).then(res => setWarehouses(res.data)).catch(err =>
        notify.error(err?.response?.data?.message ?? err?.message)
      )
  }, [showMore]);

  const getProductImages = () => {
    const images = (wooProduct?.images ?? wooProduct?.metadata?.gallery).filter(i => i?.url ?? i?.src);
    if (!images?.length && wooProduct?.featured_image) return [{ src: wooProduct.featured_image, alt: wooProduct?.name ?? wooProduct?.title }];
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
      <div className="bg-white shadow-lg rounded-lg p-6 m-4 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <Link to={`/vendors/${vendor_id}/warehouses/${house.id}/products`} className="block text-center">
          <Warehouse className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{house.business_name}</h2>
          <p className="text-gray-600 text-sm mb-2">{house.warehouse_title}</p>
          <p className="text-gray-500 text-xs mb-2">{house.address}</p>
          <p className="text-gray-500 text-xs">Contact: <span className="font-medium">{house.contact_number}</span></p>
          <p className="text-gray-500 text-xs">WhatsApp: <span className="font-medium">{house.whatsapp_number}</span></p>
        </Link>
      </div>
    );
  };


  return (
    <div className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Images */}
        <div className="lg:w-1/2">
          {images.length > 0 ? (
            <div>
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[activeImageIndex]?.src}
                  alt={images[activeImageIndex]?.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gray-200 flex items-center justify-center hidden">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === activeImageIndex
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-500">{__('No image available', 'site-core')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {wooProduct?.name || (product?.post_title ?? wooProduct.title)}
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-${stockInfo.color}-100 text-${stockInfo.color}-800`}>
                <StockIcon size={14} />
                {stockInfo.status}
              </div>
              {wooProduct?.featured && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  <Star size={14} />
                  {__('Featured', 'site-core')}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          {wooProduct && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-green-600" size={20} />
                <h3 className="font-semibold text-gray-900">{__('Pricing', 'site-core')}</h3>
              </div>
              <div className="space-y-1">
                {(wooProduct.sale_price && wooProduct.sale_price !== wooProduct.regular_price) || (
                  metadata.sale_price && metadata.sale_price !== metadata.price
                ) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(wooProduct?.sale_price ?? metadata?.sale_price)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(wooProduct?.regular_price ?? metadata?.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(wooProduct?.regular_price ?? metadata.price)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Warehouse Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">{__('Warehouse Information', 'site-core')}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{__('Vendor:', 'site-core')}</span>
                <span className="text-sm font-medium text-gray-900">{product.business_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{__('Warehouse:', 'site-core')}</span>
                <span className="text-sm font-medium text-gray-900">{product.warehouse_title}</span>
              </div>
              {product.warehouse_address && (
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{product.warehouse_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          {wooProduct && (
            <div className="grid grid-cols-2 gap-4">
              {/* Stock Quantity */}
              {(wooProduct?.stock_quantity || metadata?.stock) && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{__('Stock', 'site-core')}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {wooProduct?.stock_quantity ? sprintf(__('%f units', 'site-core'), wooProduct.stock_quantity) : metadata?.stock}
                  </span>
                </div>
              )}

              {/* Weight */}
              {wooProduct.weight && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Weight size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{__('Weight', 'site-core')}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {wooProduct.weight} {wooProduct.weight_unit || 'kg'}
                  </span>
                </div>
              )}

              {/* SKU */}
              {wooProduct.sku && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{__('SKU', 'site-core')}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{wooProduct.sku}</span>
                </div>
              )}

              {/* Shipping Class */}
              {wooProduct.shipping_class && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{__('Shipping', 'site-core')}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{wooProduct.shipping_class}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {wooProduct?.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{__('Description', 'site-core')}</h3>
              <div
                className="text-sm text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: wooProduct.description }}
              />
            </div>
          )}

          {/* Short Description */}
          {wooProduct?.short_description && wooProduct.short_description !== wooProduct.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{__('Summary', 'site-core')}</h3>
              <div
                className="text-sm text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: wooProduct.short_description }}
              />
            </div>
          )}

          {/* Categories */}
          {wooProduct?.categories && wooProduct.categories.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{__('Categories', 'site-core')}</h3>
              <div className="flex flex-wrap gap-2">
                {wooProduct.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
              <h3 className="font-semibold text-gray-900 mb-2">{__('Tags', 'site-core')}</h3>
              <div className="flex flex-wrap gap-2">
                {wooProduct.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {!showMore ? (<button type="button" onClick={(e) => setShowMore(true)} className="flex gap-2 justify-center items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded w-full"><ChevronDown size={16} />Show More</button>) : (
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* [...Array(10).keys()].map(i => warehouses[0]) */}
            {warehouses.map((w, i) => <WarehouseCard key={i} data={{ ...w }} />)}
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
    axios.get(rest_url(`/sitecore/v1/storemanager/vendors/${vendor_id}${warehouse_id ? `/warehouses/${warehouse_id}` : ''}/products`), { params: { ...filters } })
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
        message={sprintf(__(`Are you sure you want to delete "%s"? This action cannot be undone.`, 'site-core'), product?.post_title ?? product.product.title)}
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
    const [filters, setFilters] = useState({ products: '', warehouses: '' });

    useEffect(() => {
      if (warehouse_id) return;
      if (warehouses.find(w => w.id == filters.warehouses)) return;
      const delay = setTimeout(() => {
        axios.get(rest_url(`/sitecore/v1/storemanager/autocomplete/warehouses`), { params: { vendor_id, warehouse_id, search: filters.warehouses } })
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
        axios.get(rest_url(`/sitecore/v1/storemanager/autocomplete/products`), { params: { vendor_id, warehouse_id, search: filters.products } })
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
        <h2 className="text-xl font-semibold mb-4 pr-8">
          {formData.id && formData.id !== 0 ? __('Edit Warehouse', 'site-core') : __('Add New Product', 'site-core')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {__('Product Name', 'site-core')} *
            </label>
            <div className="relative">
              <Boxes className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type="text"
                list="product-list"
                value={formData.product_id}
                onChange={(e) => setFilters(prev => ({ ...prev, products: e.target.value }))}
                // onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {__('Warehouse Name', 'site-core')} *
              </label>
              <div className="relative">
                <Warehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  list="warehouse-list"
                  value={formData.warehouse_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, warehouses: e.target.value }))}
                  // onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
                  className="w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={__('Enter warehouse name', 'site-core')}
                />
                <datalist id="warehouse-list">
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_title}</option>)}
                </datalist>
              </div>
            </div>
          )}

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

  const Pagination = () => {
    return (
      <div className="container mx-auto py-4">
        <div className="pagination flex items-center justify-between px-4">
          <div className="page_info text-sm text-gray-600">
            Page {filters.page} of {pagination.totalPage}
          </div>
          <div className="controls flex items-center space-x-2">
            <button
              type="button"
              className={`prev_btn flex items-center justify-center w-10 h-10 rounded-full ${filters.page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              onClick={() => filters.page > 1 && setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="pages flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPage) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`page_btn w-10 h-10 rounded-full ${filters.page === pageNumber ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setFilters({ ...filters, page: pageNumber })}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {pagination.totalPage > 5 && filters.page > 3 && (
                <span className="dots px-2">...</span>
              )}
              {pagination.totalPage > 5 && (
                <button
                  className={`page_btn w-10 h-10 rounded-full ${filters.page === pagination.totalPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setFilters({ ...filters, page: pagination.totalPage })}
                >
                  {pagination.totalPage}
                </button>
              )}
            </div>

            <button
              type="button"
              className={`next_btn flex items-center justify-center w-10 h-10 rounded-full ${filters.page === pagination.totalPage ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              onClick={() => filters.page < pagination.totalPage && setFilters({ ...filters, page: filters.page + 1 })}
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to={warehouse_id ? `/vendors/${vendor_id}` : '/vendors'}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            {warehouse_id ? __('Back to Warehouses', 'site-core') : __('Back to Vendors', 'site-core')}
          </Link>
        </div>

        {/* Breadcrumb Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {__('Products', 'site-core')}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {vendor && (
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    {vendor.business_name}
                  </span>
                )}
                {warehouse && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1">
                      <Package size={14} />
                      {warehouse.warehouse_title}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setPopup(<EditProduct />)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{__('Loading products...', 'site-core')}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {__('No products found', 'site-core')}
          </h3>
          <p className="text-gray-600 mb-4">
            {__('No products are available in this location.', 'site-core')}
          </p>
          <button
            onClick={() => setPopup(<EditProduct />)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus size={18} />
            {__('Add New Product', 'site-core')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const stockInfo = getStockStatus(product);
              const StockIcon = stockInfo.icon;
              const productImage = getProductImage(product);
              const productObj = product.product;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product?.post_title ?? productObj.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ display: productImage ? 'none' : 'flex' }}>
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>

                    {/* Stock Status Badge */}
                    <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${stockInfo.color}-100 text-${stockInfo.color}-800`}>
                      <StockIcon size={12} />
                      {stockInfo.status}
                    </div>

                    {/* Featured Badge */}
                    {productObj?.featured && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star size={12} />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product?.post_title ?? productObj.title}
                    </h3>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(product)}
                      </span>
                      {productObj?.sale_price && productObj.sale_price !== (productObj?.regular_price ?? productObj.price) && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${productObj?.regular_price ?? productObj.price}
                        </span>
                      )}
                    </div>

                    {/* Warehouse Info */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building size={14} className="text-gray-400" />
                        <span className="truncate">{product.business_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package size={14} className="text-gray-400" />
                        <span className="truncate">{product.warehouse_title}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPopup(<ProductDetailsPopup product={product} />)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye size={16} />
                        {__('Details', 'site-core')}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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