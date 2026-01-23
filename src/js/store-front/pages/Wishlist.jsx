import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Share2, Grid, List, Filter, Search, Star, TrendingUp, Clock, Tag, ArrowUpDown, X, Plus, Minus, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { usePopup } from '../hooks/usePopup';
import { sleep, notify } from '@functions';

export default function WishlistPage() {
  const { setPopup } = usePopup();
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      brand: "AudioTech",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      category: "Electronics",
      rating: 4.8,
      reviews: 2847,
      inStock: true,
      dateAdded: "2024-09-15",
      discount: 20,
      features: ["Noise Cancelling", "30h Battery", "Wireless"],
      trending: true,
      priceHistory: [
        { date: "2024-09-01", price: 249.99 },
        { date: "2024-09-10", price: 229.99 },
        { date: "2024-09-15", price: 199.99 }
      ]
    },
    {
      id: 2,
      name: "Ergonomic Office Chair",
      brand: "ComfortPro",
      price: 349.99,
      originalPrice: 399.99,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
      category: "Furniture",
      rating: 4.6,
      reviews: 1523,
      inStock: true,
      dateAdded: "2024-09-12",
      discount: 12,
      features: ["Lumbar Support", "Adjustable Height", "Breathable Mesh"],
      trending: false
    },
    {
      id: 3,
      name: "Smart Fitness Watch",
      brand: "FitTech",
      price: 299.99,
      originalPrice: 329.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      category: "Electronics",
      rating: 4.7,
      reviews: 3241,
      inStock: false,
      dateAdded: "2024-09-08",
      discount: 9,
      features: ["Heart Rate Monitor", "GPS", "Waterproof"],
      trending: true,
      expectedRestock: "2024-09-25"
    },
    {
      id: 4,
      name: "Professional Coffee Maker",
      brand: "BrewMaster",
      price: 189.99,
      originalPrice: 219.99,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
      category: "Kitchen",
      rating: 4.9,
      reviews: 892,
      inStock: true,
      dateAdded: "2024-09-05",
      discount: 14,
      features: ["Programmable", "Thermal Carafe", "Auto-Clean"],
      trending: false
    },
    {
      id: 5,
      name: "Wireless Charging Station",
      brand: "PowerHub",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://images.unsplash.com/photo-1609792858004-21c9aab89cec?w=400&h=400&fit=crop",
      category: "Electronics",
      rating: 4.5,
      reviews: 1847,
      inStock: true,
      dateAdded: "2024-09-03",
      discount: 20,
      features: ["Fast Charging", "Multiple Devices", "LED Indicator"],
      trending: false
    },
    {
      id: 6,
      name: "Designer Desk Lamp",
      brand: "LightCraft",
      price: 129.99,
      originalPrice: 159.99,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      category: "Furniture",
      rating: 4.4,
      reviews: 674,
      inStock: true,
      dateAdded: "2024-09-01",
      discount: 19,
      features: ["Adjustable Arm", "LED", "Touch Control"],
      trending: false
    }
  ]);

  const categories = ['all', 'Electronics', 'Furniture', 'Kitchen'];

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'dateAdded':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const removeFromWishlist = (itemId) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId));
    setSelectedItems(selected => selected.filter(id => id !== itemId));
    notify.success('Item removed from wishlist');
  };

  const addToCart = async (item) => {
    await sleep(500);
    notify.success(`${item.name} added to cart`);
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(sortedItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const addSelectedToCart = async () => {
    const selectedProducts = wishlistItems.filter(item => selectedItems.includes(item.id));
    await sleep(1000);
    notify.success(`${selectedProducts.length} items added to cart`);
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const removeSelectedItems = () => {
    setWishlistItems(items => items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsSelectionMode(false);
    notify.success('Selected items removed from wishlist');
  };

  const shareWishlist = () => {
    setPopup(
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Share Wishlist</h3>
          <button onClick={() => setPopup(null)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 truncate">https://xpo.com/wishlist/shared/abc123</span>
            <button
              onClick={() => { navigator.clipboard.writeText('https://xpo.com/wishlist/shared/abc123'); notify.success('Link copied!'); }}
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              Copy
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-blue-600 mb-1">📧</div>
              <span className="text-xs text-gray-600">Email</span>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-green-600 mb-1">📱</div>
              <span className="text-xs text-gray-600">WhatsApp</span>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
              <div className="text-blue-500 mb-1">🐦</div>
              <span className="text-xs text-gray-600">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WishlistStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <Heart className="w-8 h-8 text-red-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
          <Tag className="w-8 h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ${wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">Savings</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {wishlistItems.filter(item => !item.inStock).length}
            </p>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedItems.map((item) => (
        <div key={item.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 relative">
          {isSelectionMode && (
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelectItem(item.id)}
                className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded shadow-lg"
              />
            </div>
          )}

          <div className="relative">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {item.trending && (
              <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                TRENDING
              </div>
            )}

            {item.discount > 0 && (
              <div className="absolute top-10 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{item.discount}%
              </div>
            )}

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({item.reviews})</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900">${item.price}</span>
                {item.originalPrice > item.price && (
                  <span className="text-sm text-gray-500 line-through ml-2">${item.originalPrice}</span>
                )}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${item.inStock
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>

            {!item.inStock && item.expectedRestock && (
              <p className="text-xs text-orange-600 mb-3">
                Expected restock: {new Date(item.expectedRestock).toLocaleDateString()}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => addToCart(item)}
                disabled={!item.inStock}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${item.inStock
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </button>

              <Link
                to={`/product/${item.id}`}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex gap-6">
            {isSelectionMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded"
                />
              </div>
            )}

            <div className="flex-shrink-0 relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              {item.trending && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  TRENDING
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">{item.brand}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'fill-current' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({item.reviews} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.features.map((feature, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-xl font-bold text-gray-900">${item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">${item.originalPrice}</span>
                    )}
                  </div>

                  <div className={`text-sm px-3 py-1 rounded-full ${item.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/product/${item.id}`}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </Link>

                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${item.inStock
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {!item.inStock && item.expectedRestock && (
                <p className="text-sm text-orange-600 mt-2">
                  Expected restock: {new Date(item.expectedRestock).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <SiteHeader />
      <div className="min-h-screen py-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">Manage your favorite products and track price changes</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={shareWishlist}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isSelectionMode
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 hover:bg-white'
                  }`}
              >
                <Check className="w-4 h-4" />
                {isSelectionMode ? 'Exit Selection' : 'Select Items'}
              </button>
            </div>
          </div>

          <WishlistStats />

          {isSelectionMode && selectedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-blue-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={selectAllItems}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-gray-600 text-sm hover:text-gray-800"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={removeSelectedItems}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove Selected
                  </button>
                  <button
                    onClick={addSelectedToCart}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add Selected to Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>

                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {sortedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || filterCategory !== 'all' ? 'No items found' : 'Your wishlist is empty'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start adding products you love to keep track of them'}
                </p>
                {searchQuery || filterCategory !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Browse Products
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing {sortedItems.length} of {wishlistItems.length} items
                </p>
              </div>

              {viewMode === 'grid' ? <GridView /> : <ListView />}
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}