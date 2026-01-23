import { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Users,
  Package,
  Award,
  Filter,
  Grid3X3,
  List,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  Shield,
  Truck,
  MessageCircle,
  Calendar,
  TrendingUp,
  Store
} from 'lucide-react';

// Mock API for demonstration
const api = {
  get: (url) => {
    if (url.includes('vendors/')) {
      return Promise.resolve({
        data: {
          id: 123,
          name: "TechnoVibe Electronics",
          slug: "technovibe-electronics",
          logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=200&q=80",
          banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
          description: "Premium electronics and gadgets store specializing in cutting-edge technology. We've been serving customers worldwide since 2018 with authentic products and exceptional service.",
          rating: 4.8,
          reviews_count: 2847,
          followers: 15420,
          total_products: 486,
          founded_year: 2018,
          contact: {
            email: "info@technovibe.com",
            phone: "+1 (555) 123-4567",
            website: "https://technovibe.com",
            address: "1234 Tech Street, Silicon Valley, CA 94000"
          },
          stats: {
            total_sales: 45230,
            response_rate: 98,
            shipping_time: "1-2 days",
            return_policy: "30 days"
          },
          certifications: [
            "Verified Seller",
            "Premium Partner",
            "Fast Shipping"
          ],
          categories: ["Electronics", "Smartphones", "Laptops", "Accessories", "Gaming"]
        }
      });
    }

    if (url.includes('products')) {
      return Promise.resolve({
        data: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          title: `Premium Product ${i + 1}`,
          slug: `premium-product-${i + 1}`,
          thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=400&q=80`,
          metadata: {
            price: (Math.random() * 500 + 50).toFixed(0),
            sale_price: (Math.random() * 400 + 30).toFixed(0),
            sku: `PROD00${i + 1}`
          },
          average_rating: Math.random() * 2 + 3,
          reviews_count: Math.floor(Math.random() * 100),
          in_stock: Math.random() > 0.1
        }))
      });
    }
  }
};

const useParams = () => ({ vendor_slug: 'technovibe-electronics' });

const VendorPage = () => {
  const { vendor_slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await api.get(`vendors/${vendor_slug}`);
        setVendor(response.data);
      } catch (error) {
        console.error('Error fetching vendor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendor_slug) {
      fetchVendor();
    }
  }, [vendor_slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await api.get(`vendors/${vendor_slug}/products?page=${currentPage}&sort=${sortBy}&category=${filterCategory}&search=${searchQuery}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    if (vendor && !loading) {
      fetchProducts();
    }
  }, [vendor_slug, currentPage, sortBy, filterCategory, searchQuery, vendor, loading]);

  const renderStars = (rating, size = 'w-4 h-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size} ${i < fullStars
              ? 'text-yellow-400 fill-yellow-400'
              : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
        />
      );
    }
    return stars;
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // API call would go here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor store...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h2>
          <p className="text-gray-600">The vendor store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vendor Header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
          {vendor.banner && (
            <img
              src={vendor.banner}
              alt={vendor.name}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* Vendor Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>

              {/* Vendor Details */}
              <div className="flex-1 text-white">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {vendor.name}
                </h1>
                <div className="flex flex-wrap items-center space-x-6 text-sm md:text-base">
                  <div className="flex items-center space-x-1">
                    {renderStars(vendor.rating)}
                    <span className="ml-2">{vendor.rating}</span>
                    <span className="text-gray-300">({vendor.reviews_count.toLocaleString()} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{vendor.followers.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>{vendor.total_products} products</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Since {vendor.founded_year}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isFollowing
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  {isFollowing ? 'Following' : 'Follow Store'}
                </button>
                <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Vendor Info Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Store Information</h3>

              <div className="space-y-3 text-sm">
                {vendor.contact.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{vendor.contact.address}</span>
                  </div>
                )}

                {vendor.contact.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{vendor.contact.phone}</span>
                  </div>
                )}

                {vendor.contact.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{vendor.contact.email}</span>
                  </div>
                )}

                {vendor.contact.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={vendor.contact.website} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Stats</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Total Sales</span>
                  </div>
                  <span className="font-semibold">{vendor.stats.total_sales.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Response Rate</span>
                  </div>
                  <span className="font-semibold">{vendor.stats.response_rate}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Shipping Time</span>
                  </div>
                  <span className="font-semibold">{vendor.stats.shipping_time}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Return Policy</span>
                  </div>
                  <span className="font-semibold">{vendor.stats.return_policy}</span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Certifications</h3>
              <div className="space-y-2">
                {vendor.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterCategory === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  All Categories
                </button>
                {vendor.categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setFilterCategory(category.toLowerCase())}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filterCategory === category.toLowerCase()
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100 text-gray-600'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">About {vendor.name}</h2>
              <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Products Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <h2 className="text-2xl font-bold text-gray-800">Products</h2>

                  {/* Search and Controls */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={__('Search anything...', 'site-core')}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="featured">{__('Featured', 'site-core')}</option>
                        <option value="price-low">{__('Price: Low to High', 'site-core')}</option>
                        <option value="price-high">{__('Price: High to Low', 'site-core')}</option>
                        <option value="rating">{__('Highest Rated', 'site-core')}</option>
                        <option value="newest">{__('Newest', 'site-core')}</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* View Mode */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list'
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              <div className="p-6">
                {productsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {products?.length && products.map((product) => (
                      <div
                        key={product.id}
                        className={
                          viewMode === 'grid'
                            ? 'group cursor-pointer transition-transform hover:scale-105'
                            : 'flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'
                        }
                      >
                        {/* Product Image */}
                        <div className={
                          viewMode === 'grid'
                            ? 'relative overflow-hidden rounded-lg bg-gray-200 aspect-square'
                            : 'flex-shrink-0'
                        }>
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className={
                              viewMode === 'grid'
                                ? 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                : 'w-24 h-24 object-cover rounded-lg'
                            }
                          />

                          {/* Grid Mode Overlay */}
                          {viewMode === 'grid' && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="bg-white p-2 rounded-full shadow-lg mb-2 hover:bg-gray-50">
                                <Heart className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                          <h3 className={`font-semibold text-gray-800 mb-2 ${viewMode === 'grid' ? 'text-lg' : 'text-base'
                            }`}>
                            {product.title}
                          </h3>

                          <div className="flex items-center space-x-1 mb-2">
                            {renderStars(product.average_rating)}
                            <span className="text-sm text-gray-600">
                              ({product.reviews_count})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-indigo-600">
                                ${product.metadata.sale_price}
                              </span>
                              {product.metadata.price !== product.metadata.sale_price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ${product.metadata.price}
                                </span>
                              )}
                            </div>

                            {viewMode === 'list' && (
                              <div className="flex space-x-2">
                                <button className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Heart className="w-4 h-4 text-gray-600" />
                                </button>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                                  {__('Add to Cart', 'site-core')}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Stock Status */}
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${product.in_stock
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                              {product.in_stock ? __('In Stock', 'site-core') : __('Out of Stock', 'site-core')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!productsLoading && products.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        {__('Previous', 'site-core')}
                      </button>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                        1
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        3
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        {__('Next', 'site-core')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!productsLoading && products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? sprintf(__('No products match "%s"', 'site-core'), searchQuery)
                        : filterCategory !== 'all'
                          ? sprintf(__('No products in "%s" category', 'site-core'), filterCategory)
                          : __('This vendor has no products yet', 'site-core')
                      }
                    </p>
                    {(searchQuery || filterCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                        }}
                        className="mt-4 text-indigo-600 hover:underline"
                      >
                        {__('Clear filters', 'site-core')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{__('Customer Reviews', 'site-core')}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(vendor.rating, 'w-5 h-5')}
                </div>
                <span className="text-lg font-semibold">{vendor.rating}</span>
                <span className="text-gray-600">{sprintf(__('(%s reviews)', 'site-core'), vendor.reviews_count.toLocaleString())}</span>
              </div>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="space-y-6">
            {[
              {
                author: "Sarah Johnson",
                rating: 5,
                date: "2 weeks ago",
                comment: "Excellent service and fast shipping! The products arrived exactly as described and the quality is outstanding. Will definitely shop here again."
              },
              {
                author: "Mike Chen",
                rating: 4,
                date: "1 month ago",
                comment: "Good selection of products and competitive prices. Customer service was helpful when I had questions about my order."
              },
              {
                author: "Emily Rodriguez",
                rating: 5,
                date: "1 month ago",
                comment: "Amazing vendor! Quick responses to messages and the packaging was perfect. Highly recommend this store to anyone looking for quality electronics."
              }
            ].map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {review.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-800">{review.author}</h4>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button className="text-indigo-600 font-semibold hover:underline">
              {__('View All Reviews', 'site-core')}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{__('Frequently Asked Questions', 'site-core')}</h2>

          <div className="space-y-4">
            {[
              {
                question: "What are your shipping options?",
                answer: "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). Free shipping is available on orders over $100."
              },
              {
                question: "What is your return policy?",
                answer: "We accept returns within 30 days of purchase. Items must be in original condition with all packaging and accessories."
              },
              {
                question: "Do you offer warranty on products?",
                answer: "Yes, all products come with manufacturer warranty. Extended warranty options are available at checkout."
              },
              {
                question: "How can I track my order?",
                answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <button className="w-full text-left flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>
                <div className="mt-2 text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{__('Have Questions?', 'site-core')}</h2>
          <p className="text-indigo-100 mb-6">
            {__('Our customer support team is here to help you with any questions about our products or services.', 'site-core')}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              <MessageCircle className="w-5 h-5 inline mr-2" />
              {__('Send Message', 'site-core')}
            </button>
            <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-400 transition-colors">
              <Phone className="w-5 h-5 inline mr-2" />
              {__('Call Now', 'site-core')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPage;