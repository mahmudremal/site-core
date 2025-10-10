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
          className={`${size} ${
            i < fullStars
              ? 'xpo_text-yellow-400 xpo_fill-yellow-400'
              : i === fullStars && hasHalfStar
              ? 'xpo_text-yellow-400 xpo_fill-yellow-400'
              : 'xpo_text-gray-300'
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
      <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center">
        <div className="xpo_text-center">
          <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-indigo-600 xpo_mx-auto"></div>
          <p className="xpo_mt-4 xpo_text-gray-600">Loading vendor store...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center">
        <div className="xpo_text-center">
          <Store className="xpo_w-16 xpo_h-16 xpo_text-gray-400 xpo_mx-auto xpo_mb-4" />
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-2">Store Not Found</h2>
          <p className="xpo_text-gray-600">The vendor store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50">
      {/* Vendor Header */}
      <div className="xpo_relative">
        {/* Banner Image */}
        <div className="xpo_h-64 md:xpo_h-80 xpo_bg-gradient-to-r xpo_from-indigo-600 xpo_to-purple-600 xpo_relative xpo_overflow-hidden">
          {vendor.banner && (
            <img
              src={vendor.banner}
              alt={vendor.name}
              className="xpo_w-full xpo_h-full xpo_object-cover xpo_opacity-30"
            />
          )}
          <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-40"></div>
        </div>

        {/* Vendor Info Overlay */}
        <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_right-0 xpo_bg-gradient-to-t xpo_from-black xpo_via-black/70 xpo_to-transparent xpo_p-6">
          <div className="xpo_container xpo_mx-auto">
            <div className="xpo_flex xpo_flex-col md:xpo_flex-row xpo_items-start md:xpo_items-end xpo_space-y-4 md:xpo_space-y-0 md:xpo_space-x-6">
              {/* Logo */}
              <div className="xpo_flex-shrink-0">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="xpo_w-24 xpo_h-24 md:xpo_w-32 md:xpo_h-32 xpo_rounded-full xpo_border-4 xpo_border-white xpo_shadow-lg xpo_object-cover"
                />
              </div>

              {/* Vendor Details */}
              <div className="xpo_flex-1 xpo_text-white">
                <h1 className="xpo_text-2xl md:xpo_text-4xl xpo_font-bold xpo_mb-2">
                  {vendor.name}
                </h1>
                <div className="xpo_flex xpo_flex-wrap xpo_items-center xpo_space-x-6 xpo_text-sm md:xpo_text-base">
                  <div className="xpo_flex xpo_items-center xpo_space-x-1">
                    {renderStars(vendor.rating)}
                    <span className="xpo_ml-2">{vendor.rating}</span>
                    <span className="xpo_text-gray-300">({vendor.reviews_count.toLocaleString()} reviews)</span>
                  </div>
                  <div className="xpo_flex xpo_items-center xpo_space-x-1">
                    <Users className="xpo_w-4 xpo_h-4" />
                    <span>{vendor.followers.toLocaleString()} followers</span>
                  </div>
                  <div className="xpo_flex xpo_items-center xpo_space-x-1">
                    <Package className="xpo_w-4 xpo_h-4" />
                    <span>{vendor.total_products} products</span>
                  </div>
                  <div className="xpo_flex xpo_items-center xpo_space-x-1">
                    <Calendar className="xpo_w-4 xpo_h-4" />
                    <span>Since {vendor.founded_year}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="xpo_flex xpo_space-x-3">
                <button
                  onClick={handleFollowToggle}
                  className={`xpo_px-6 xpo_py-2 xpo_rounded-lg xpo_font-semibold xpo_transition-colors ${
                    isFollowing
                      ? 'xpo_bg-gray-600 xpo_text-white hover:xpo_bg-gray-700'
                      : 'xpo_bg-indigo-600 xpo_text-white hover:xpo_bg-indigo-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Store'}
                </button>
                <button className="xpo_bg-white xpo_text-gray-800 xpo_px-6 xpo_py-2 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-gray-100 xpo_transition-colors">
                  <MessageCircle className="xpo_w-4 xpo_h-4 xpo_inline xpo_mr-2" />
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="xpo_container xpo_mx-auto xpo_px-4 xpo_py-8">
        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-4 xpo_gap-8">
          {/* Sidebar */}
          <div className="lg:xpo_col-span-1">
            {/* Vendor Info Card */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mb-6">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4 xpo_text-gray-800">Store Information</h3>
              
              <div className="xpo_space-y-3 xpo_text-sm">
                {vendor.contact.address && (
                  <div className="xpo_flex xpo_items-start xpo_space-x-2">
                    <MapPin className="xpo_w-4 xpo_h-4 xpo_text-gray-500 xpo_mt-0.5 xpo_flex-shrink-0" />
                    <span className="xpo_text-gray-600">{vendor.contact.address}</span>
                  </div>
                )}
                
                {vendor.contact.phone && (
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Phone className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                    <span className="xpo_text-gray-600">{vendor.contact.phone}</span>
                  </div>
                )}
                
                {vendor.contact.email && (
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Mail className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                    <span className="xpo_text-gray-600">{vendor.contact.email}</span>
                  </div>
                )}
                
                {vendor.contact.website && (
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Globe className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />
                    <a href={vendor.contact.website} className="xpo_text-indigo-600 hover:xpo_underline" target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mb-6">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4 xpo_text-gray-800">Performance Stats</h3>
              
              <div className="xpo_space-y-4">
                <div className="xpo_flex xpo_justify-between xpo_items-center">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <TrendingUp className="xpo_w-4 xpo_h-4 xpo_text-green-500" />
                    <span className="xpo_text-sm xpo_text-gray-600">Total Sales</span>
                  </div>
                  <span className="xpo_font-semibold">{vendor.stats.total_sales.toLocaleString()}</span>
                </div>
                
                <div className="xpo_flex xpo_justify-between xpo_items-center">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <MessageCircle className="xpo_w-4 xpo_h-4 xpo_text-blue-500" />
                    <span className="xpo_text-sm xpo_text-gray-600">Response Rate</span>
                  </div>
                  <span className="xpo_font-semibold">{vendor.stats.response_rate}%</span>
                </div>
                
                <div className="xpo_flex xpo_justify-between xpo_items-center">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Truck className="xpo_w-4 xpo_h-4 xpo_text-orange-500" />
                    <span className="xpo_text-sm xpo_text-gray-600">Shipping Time</span>
                  </div>
                  <span className="xpo_font-semibold">{vendor.stats.shipping_time}</span>
                </div>
                
                <div className="xpo_flex xpo_justify-between xpo_items-center">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Shield className="xpo_w-4 xpo_h-4 xpo_text-purple-500" />
                    <span className="xpo_text-sm xpo_text-gray-600">Return Policy</span>
                  </div>
                  <span className="xpo_font-semibold">{vendor.stats.return_policy}</span>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mb-6">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4 xpo_text-gray-800">Certifications</h3>
              <div className="xpo_space-y-2">
                {vendor.certifications.map((cert, index) => (
                  <div key={index} className="xpo_flex xpo_items-center xpo_space-x-2">
                    <Award className="xpo_w-4 xpo_h-4 xpo_text-green-500" />
                    <span className="xpo_text-sm xpo_text-gray-600">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-4 xpo_text-gray-800">Categories</h3>
              <div className="xpo_space-y-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`xpo_w-full xpo_text-left xpo_px-3 xpo_py-2 xpo_rounded-md xpo_text-sm xpo_transition-colors ${
                    filterCategory === 'all'
                      ? 'xpo_bg-indigo-100 xpo_text-indigo-700'
                      : 'hover:xpo_bg-gray-100 xpo_text-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {vendor.categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setFilterCategory(category.toLowerCase())}
                    className={`xpo_w-full xpo_text-left xpo_px-3 xpo_py-2 xpo_rounded-md xpo_text-sm xpo_transition-colors ${
                      filterCategory === category.toLowerCase()
                        ? 'xpo_bg-indigo-100 xpo_text-indigo-700'
                        : 'hover:xpo_bg-gray-100 xpo_text-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:xpo_col-span-3">
            {/* About Section */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mb-8">
              <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-4 xpo_text-gray-800">About {vendor.name}</h2>
              <p className="xpo_text-gray-600 xpo_leading-relaxed">{vendor.description}</p>
            </div>

            {/* Products Section */}
            <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_overflow-hidden">
              {/* Products Header */}
              <div className="xpo_p-6 xpo_border-b xpo_border-gray-200">
                <div className="xpo_flex xpo_flex-col md:xpo_flex-row md:xpo_items-center xpo_justify-between xpo_space-y-4 md:xpo_space-y-0">
                  <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800">Products</h2>
                  
                  {/* Search and Controls */}
                  <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_space-y-2 sm:xpo_space-y-0 sm:xpo_space-x-4">
                    {/* Search */}
                    <div className="xpo_relative">
                      <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="xpo_pl-10 xpo_pr-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-indigo-500 focus:xpo_border-transparent"
                      />
                    </div>
                    
                    {/* Sort */}
                    <div className="xpo_relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="xpo_appearance-none xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 xpo_pr-8 focus:xpo_ring-2 focus:xpo_ring-indigo-500 focus:xpo_border-transparent"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest</option>
                      </select>
                      <ChevronDown className="xpo_absolute xpo_right-2 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400 xpo_pointer-events-none" />
                    </div>
                    
                    {/* View Mode */}
                    <div className="xpo_flex xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`xpo_p-2 ${
                          viewMode === 'grid'
                            ? 'xpo_bg-indigo-100 xpo_text-indigo-600'
                            : 'xpo_bg-white xpo_text-gray-600 hover:xpo_bg-gray-50'
                        }`}
                      >
                        <Grid3X3 className="xpo_w-4 xpo_h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`xpo_p-2 ${
                          viewMode === 'list'
                            ? 'xpo_bg-indigo-100 xpo_text-indigo-600'
                            : 'xpo_bg-white xpo_text-gray-600 hover:xpo_bg-gray-50'
                        }`}
                      >
                        <List className="xpo_w-4 xpo_h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              <div className="xpo_p-6">
                {productsLoading ? (
                  <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="xpo_animate-pulse">
                        <div className="xpo_bg-gray-300 xpo_h-48 xpo_rounded-lg xpo_mb-4"></div>
                        <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_mb-2"></div>
                        <div className="xpo_h-4 xpo_bg-gray-300 xpo_rounded xpo_w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid'
                      ? 'xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 lg:xpo_grid-cols-3 xpo_gap-6'
                      : 'xpo_space-y-4'
                  }>
                    {products?.length && products.map((product) => (
                      <div
                        key={product.id}
                        className={
                          viewMode === 'grid'
                            ? 'xpo_group xpo_cursor-pointer xpo_transition-transform hover:xpo_scale-105'
                            : 'xpo_flex xpo_items-center xpo_space-x-4 xpo_p-4 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_shadow-md xpo_transition-shadow'
                        }
                      >
                        {/* Product Image */}
                        <div className={
                          viewMode === 'grid'
                            ? 'xpo_relative xpo_overflow-hidden xpo_rounded-lg xpo_bg-gray-200 xpo_aspect-square'
                            : 'xpo_flex-shrink-0'
                        }>
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className={
                              viewMode === 'grid'
                                ? 'xpo_w-full xpo_h-full xpo_object-cover group-hover:xpo_scale-110 xpo_transition-transform xpo_duration-300'
                                : 'xpo_w-24 xpo_h-24 xpo_object-cover xpo_rounded-lg'
                            }
                          />
                          
                          {/* Grid Mode Overlay */}
                          {viewMode === 'grid' && (
                            <div className="xpo_absolute xpo_top-2 xpo_right-2 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-opacity">
                              <button className="xpo_bg-white xpo_p-2 xpo_rounded-full xpo_shadow-lg xpo_mb-2 hover:xpo_bg-gray-50">
                                <Heart className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className={viewMode === 'grid' ? 'xpo_p-4' : 'xpo_flex-1'}>
                          <h3 className={`xpo_font-semibold xpo_text-gray-800 xpo_mb-2 ${
                            viewMode === 'grid' ? 'xpo_text-lg' : 'xpo_text-base'
                          }`}>
                            {product.title}
                          </h3>
                          
                          <div className="xpo_flex xpo_items-center xpo_space-x-1 xpo_mb-2">
                            {renderStars(product.average_rating)}
                            <span className="xpo_text-sm xpo_text-gray-600">
                              ({product.reviews_count})
                            </span>
                          </div>
                          
                          <div className="xpo_flex xpo_items-center xpo_justify-between">
                            <div>
                              <span className="xpo_text-lg xpo_font-bold xpo_text-indigo-600">
                                ${product.metadata.sale_price}
                              </span>
                              {product.metadata.price !== product.metadata.sale_price && (
                                <span className="xpo_text-sm xpo_text-gray-500 xpo_line-through xpo_ml-2">
                                  ${product.metadata.price}
                                </span>
                              )}
                            </div>
                            
                            {viewMode === 'list' && (
                              <div className="xpo_flex xpo_space-x-2">
                                <button className="xpo_bg-gray-100 xpo_p-2 xpo_rounded-lg hover:xpo_bg-gray-200 xpo_transition-colors">
                                  <Heart className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                                </button>
                                <button className="xpo_bg-indigo-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg hover:xpo_bg-indigo-700 xpo_transition-colors">
                                  <ShoppingCart className="xpo_w-4 xpo_h-4 xpo_inline xpo_mr-2" />
                                  Add to Cart
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Stock Status */}
                          <div className="xpo_mt-2">
                            <span className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full ${
                              product.in_stock
                                ? 'xpo_bg-green-100 xpo_text-green-700'
                                : 'xpo_bg-red-100 xpo_text-red-700'
                            }`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!productsLoading && products.length > 0 && (
                  <div className="xpo_flex xpo_justify-center xpo_mt-8">
                    <div className="xpo_flex xpo_space-x-2">
                      <button className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-600 hover:xpo_bg-gray-50 xpo_disabled:opacity-50 xpo_disabled:cursor-not-allowed" disabled>
                        Previous
                      </button>
                      <button className="xpo_px-4 xpo_py-2 xpo_bg-indigo-600 xpo_text-white xpo_rounded-lg">
                        1
                      </button>
                      <button className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-600 hover:xpo_bg-gray-50">
                        2
                      </button>
                      <button className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-600 hover:xpo_bg-gray-50">
                        3
                      </button>
                      <button className="xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-gray-600 hover:xpo_bg-gray-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!productsLoading && products.length === 0 && (
                  <div className="xpo_text-center xpo_py-12">
                    <Package className="xpo_w-16 xpo_h-16 xpo_text-gray-400 xpo_mx-auto xpo_mb-4" />
                    <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800 xpo_mb-2">No Products Found</h3>
                    <p className="xpo_text-gray-600">
                      {searchQuery
                        ? `No products match "${searchQuery}"`
                        : filterCategory !== 'all'
                        ? `No products in "${filterCategory}" category`
                        : 'This vendor has no products yet'
                      }
                    </p>
                    {(searchQuery || filterCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                        }}
                        className="xpo_mt-4 xpo_text-indigo-600 hover:xpo_underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="xpo_mt-8 xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
            <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800">Customer Reviews</h2>
            <div className="xpo_flex xpo_items-center xpo_space-x-4">
              <div className="xpo_flex xpo_items-center xpo_space-x-2">
                <div className="xpo_flex xpo_items-center">
                  {renderStars(vendor.rating, 'w-5 h-5')}
                </div>
                <span className="xpo_text-lg xpo_font-semibold">{vendor.rating}</span>
                <span className="xpo_text-gray-600">({vendor.reviews_count.toLocaleString()} reviews)</span>
              </div>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="xpo_space-y-6">
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
              <div key={index} className="xpo_border-b xpo_border-gray-200 xpo_pb-6 last:xpo_border-b-0 last:xpo_pb-0">
                <div className="xpo_flex xpo_items-start xpo_space-x-4">
                  <div className="xpo_flex-shrink-0">
                    <div className="xpo_w-10 xpo_h-10 xpo_bg-indigo-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center">
                      <span className="xpo_text-indigo-600 xpo_font-semibold">
                        {review.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="xpo_flex-1">
                    <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-2">
                      <h4 className="xpo_font-semibold xpo_text-gray-800">{review.author}</h4>
                      <div className="xpo_flex xpo_items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="xpo_text-sm xpo_text-gray-500">{review.date}</span>
                    </div>
                    <p className="xpo_text-gray-600 xpo_leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="xpo_text-center xpo_mt-6">
            <button className="xpo_text-indigo-600 xpo_font-semibold hover:xpo_underline">
              View All Reviews
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="xpo_mt-8 xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-6">
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800 xpo_mb-6">Frequently Asked Questions</h2>
          
          <div className="xpo_space-y-4">
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
              <div key={index} className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4">
                <button className="xpo_w-full xpo_text-left xpo_flex xpo_justify-between xpo_items-center">
                  <h3 className="xpo_font-semibold xpo_text-gray-800">{faq.question}</h3>
                  <ChevronDown className="xpo_w-5 xpo_h-5 xpo_text-gray-500" />
                </button>
                <div className="xpo_mt-2 xpo_text-gray-600">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="xpo_mt-8 xpo_bg-gradient-to-r xpo_from-indigo-600 xpo_to-purple-600 xpo_rounded-lg xpo_p-8 xpo_text-center xpo_text-white">
          <h2 className="xpo_text-2xl xpo_font-bold xpo_mb-4">Have Questions?</h2>
          <p className="xpo_text-indigo-100 xpo_mb-6">
            Our customer support team is here to help you with any questions about our products or services.
          </p>
          <div className="xpo_flex xpo_justify-center xpo_space-x-4">
            <button className="xpo_bg-white xpo_text-indigo-600 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-gray-100 xpo_transition-colors">
              <MessageCircle className="xpo_w-5 xpo_h-5 xpo_inline xpo_mr-2" />
              Send Message
            </button>
            <button className="xpo_bg-indigo-500 xpo_text-white xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-indigo-400 xpo_transition-colors">
              <Phone className="xpo_w-5 xpo_h-5 xpo_inline xpo_mr-2" />
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPage;