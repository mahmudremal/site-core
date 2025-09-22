import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Share2, Grid, List, Filter, Search, Star, TrendingUp, Clock, Tag, ArrowUpDown, X, Plus, Minus, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';
import { usePopup } from '../hooks/usePopup';
import { sleep, notify } from '@functions';

export default function WishlistPage() {
  const { setPopup } = usePopup();
  const [viewMode, setViewMode] = useState('grid');
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
      <div className="xpo_w-full xpo_max-w-md">
        <div className="xpo_flex xpo_justify-between xpo_items-center xpo_mb-4">
          <h3 className="xpo_text-lg xpo_font-bold xpo_text-gray-900">Share Wishlist</h3>
          <button onClick={() => setPopup(null)} className="xpo_p-1 hover:xpo_bg-gray-100 xpo_rounded">
            <X className="xpo_w-5 xpo_h-5" />
          </button>
        </div>
        <div className="xpo_space-y-4">
          <div className="xpo_bg-gray-50 xpo_rounded-lg xpo_p-3 xpo_flex xpo_items-center xpo_justify-between">
            <span className="xpo_text-sm xpo_text-gray-600 xpo_truncate">https://xpo.com/wishlist/shared/abc123</span>
            <button 
              onClick={() => {navigator.clipboard.writeText('https://xpo.com/wishlist/shared/abc123'); notify.success('Link copied!');}}
              className="xpo_text-blue-600 xpo_text-sm xpo_font-medium hover:xpo_text-blue-800"
            >
              Copy
            </button>
          </div>
          <div className="xpo_grid xpo_grid-cols-3 xpo_gap-3">
            <button className="xpo_p-3 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_text-center">
              <div className="xpo_text-blue-600 xpo_mb-1">📧</div>
              <span className="xpo_text-xs xpo_text-gray-600">Email</span>
            </button>
            <button className="xpo_p-3 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_text-center">
              <div className="xpo_text-green-600 xpo_mb-1">📱</div>
              <span className="xpo_text-xs xpo_text-gray-600">WhatsApp</span>
            </button>
            <button className="xpo_p-3 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_text-center">
              <div className="xpo_text-blue-500 xpo_mb-1">🐦</div>
              <span className="xpo_text-xs xpo_text-gray-600">Twitter</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WishlistStats = () => (
    <div className="xpo_grid xpo_grid-cols-2 md:xpo_grid-cols-4 xpo_gap-4 xpo_mb-6">
      <div className="xpo_bg-white xpo_rounded-xl xpo_p-4 xpo_border xpo_border-gray-200">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div>
            <p className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{wishlistItems.length}</p>
            <p className="xpo_text-sm xpo_text-gray-600">Total Items</p>
          </div>
          <Heart className="xpo_w-8 xpo_h-8 xpo_text-red-500" />
        </div>
      </div>
      
      <div className="xpo_bg-white xpo_rounded-xl xpo_p-4 xpo_border xpo_border-gray-200">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div>
            <p className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
              ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toFixed(0)}
            </p>
            <p className="xpo_text-sm xpo_text-gray-600">Total Value</p>
          </div>
          <Tag className="xpo_w-8 xpo_h-8 xpo_text-green-500" />
        </div>
      </div>
      
      <div className="xpo_bg-white xpo_rounded-xl xpo_p-4 xpo_border xpo_border-gray-200">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div>
            <p className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
              ${wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0).toFixed(0)}
            </p>
            <p className="xpo_text-sm xpo_text-gray-600">Savings</p>
          </div>
          <TrendingUp className="xpo_w-8 xpo_h-8 xpo_text-blue-500" />
        </div>
      </div>
      
      <div className="xpo_bg-white xpo_rounded-xl xpo_p-4 xpo_border xpo_border-gray-200">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div>
            <p className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">
              {wishlistItems.filter(item => !item.inStock).length}
            </p>
            <p className="xpo_text-sm xpo_text-gray-600">Out of Stock</p>
          </div>
          <Clock className="xpo_w-8 xpo_h-8 xpo_text-orange-500" />
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-3 xl:xpo_grid-cols-4 xpo_gap-6">
      {sortedItems.map((item) => (
        <div key={item.id} className="xpo_group xpo_bg-white xpo_rounded-xl xpo_border xpo_border-gray-200 xpo_overflow-hidden hover:xpo_shadow-lg xpo_transition-all xpo_duration-300 xpo_relative">
          {isSelectionMode && (
            <div className="xpo_absolute xpo_top-3 xpo_left-3 xpo_z-10">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelectItem(item.id)}
                className="xpo_w-5 xpo_h-5 xpo_text-blue-600 xpo_bg-white xpo_border-2 xpo_border-gray-300 xpo_rounded xpo_shadow-lg"
              />
            </div>
          )}
          
          <div className="xpo_relative">
            <img
              src={item.image}
              alt={item.name}
              className="xpo_w-full xpo_h-48 xpo_object-cover group-hover:xpo_scale-105 xpo_transition-transform xpo_duration-300"
            />
            
            {item.trending && (
              <div className="xpo_absolute xpo_top-3 xpo_right-3 xpo_bg-orange-500 xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded-full">
                TRENDING
              </div>
            )}
            
            {item.discount > 0 && (
              <div className="xpo_absolute xpo_top-10 xpo_right-3 xpo_bg-red-500 xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded-full">
                -{item.discount}%
              </div>
            )}
            
            <div className="xpo_absolute xpo_top-3 xpo_right-3 xpo_opacity-0 group-hover:xpo_opacity-100 xpo_transition-opacity xpo_bg-white xpo_rounded-full xpo_p-2 xpo_shadow-lg">
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="xpo_text-red-500 hover:xpo_text-red-700"
              >
                <X className="xpo_w-4 xpo_h-4" />
              </button>
            </div>
          </div>
          
          <div className="xpo_p-4">
            <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-2">
              <div className="xpo_flex-1 xpo_min-w-0">
                <p className="xpo_text-xs xpo_text-gray-500 xpo_mb-1">{item.brand}</p>
                <h3 className="xpo_font-semibold xpo_text-gray-900 xpo_text-sm xpo_truncate">{item.name}</h3>
              </div>
            </div>
            
            <div className="xpo_flex xpo_items-center xpo_mb-2">
              <div className="xpo_flex xpo_text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`xpo_w-3 xpo_h-3 ${i < Math.floor(item.rating) ? 'xpo_fill-current' : 'xpo_text-gray-200'}`} />
                ))}
              </div>
              <span className="xpo_text-xs xpo_text-gray-500 xpo_ml-1">({item.reviews})</span>
            </div>
            
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-3">
              <div>
                <span className="xpo_text-lg xpo_font-bold xpo_text-gray-900">${item.price}</span>
                {item.originalPrice > item.price && (
                  <span className="xpo_text-sm xpo_text-gray-500 xpo_line-through xpo_ml-2">${item.originalPrice}</span>
                )}
              </div>
              <div className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full ${
                item.inStock 
                  ? 'xpo_bg-green-100 xpo_text-green-800' 
                  : 'xpo_bg-red-100 xpo_text-red-800'
              }`}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
            
            {!item.inStock && item.expectedRestock && (
              <p className="xpo_text-xs xpo_text-orange-600 xpo_mb-3">
                Expected restock: {new Date(item.expectedRestock).toLocaleDateString()}
              </p>
            )}
            
            <div className="xpo_flex xpo_gap-2">
              <button
                onClick={() => addToCart(item)}
                disabled={!item.inStock}
                className={`xpo_flex-1 xpo_py-2 xpo_px-3 xpo_rounded-lg xpo_text-sm xpo_font-medium xpo_transition-colors ${
                  item.inStock
                    ? 'xpo_bg-black xpo_text-white hover:xpo_bg-gray-800'
                    : 'xpo_bg-gray-200 xpo_text-gray-500 xpo_cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                Add to Cart
              </button>
              
              <Link
                to={`/product/${item.id}`}
                className="xpo_p-2 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors"
              >
                <Eye className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="xpo_space-y-4">
      {sortedItems.map((item) => (
        <div key={item.id} className="xpo_bg-white xpo_rounded-xl xpo_border xpo_border-gray-200 xpo_p-6 hover:xpo_shadow-md xpo_transition-shadow">
          <div className="xpo_flex xpo_gap-6">
            {isSelectionMode && (
              <div className="xpo_flex xpo_items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  className="xpo_w-5 xpo_h-5 xpo_text-blue-600 xpo_bg-white xpo_border-2 xpo_border-gray-300 xpo_rounded"
                />
              </div>
            )}
            
            <div className="xpo_flex-shrink-0 xpo_relative">
              <img
                src={item.image}
                alt={item.name}
                className="xpo_w-32 xpo_h-32 xpo_object-cover xpo_rounded-lg"
              />
              {item.trending && (
                <div className="xpo_absolute xpo_top-2 xpo_left-2 xpo_bg-orange-500 xpo_text-white xpo_text-xs xpo_font-bold xpo_px-2 xpo_py-1 xpo_rounded-full">
                  TRENDING
                </div>
              )}
            </div>
            
            <div className="xpo_flex-1 xpo_min-w-0">
              <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-3">
                <div>
                  <p className="xpo_text-sm xpo_text-gray-500">{item.brand}</p>
                  <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900">{item.name}</h3>
                </div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="xpo_p-2 xpo_text-gray-400 hover:xpo_text-red-500 hover:xpo_bg-gray-50 xpo_rounded-lg xpo_transition-colors"
                >
                  <X className="xpo_w-5 xpo_h-5" />
                </button>
              </div>
              
              <div className="xpo_flex xpo_items-center xpo_mb-3">
                <div className="xpo_flex xpo_text-yellow-400 xpo_mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`xpo_w-4 xpo_h-4 ${i < Math.floor(item.rating) ? 'xpo_fill-current' : 'xpo_text-gray-200'}`} />
                  ))}
                </div>
                <span className="xpo_text-sm xpo_text-gray-500">({item.reviews} reviews)</span>
              </div>
              
              <div className="xpo_flex xpo_flex-wrap xpo_gap-2 xpo_mb-4">
                {item.features.map((feature, index) => (
                  <span key={index} className="xpo_text-xs xpo_bg-gray-100 xpo_text-gray-600 xpo_px-2 xpo_py-1 xpo_rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
              
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_gap-4">
                  <div>
                    <span className="xpo_text-xl xpo_font-bold xpo_text-gray-900">${item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="xpo_text-sm xpo_text-gray-500 xpo_line-through xpo_ml-2">${item.originalPrice}</span>
                    )}
                  </div>
                  
                  <div className={`xpo_text-sm xpo_px-3 xpo_py-1 xpo_rounded-full ${
                    item.inStock 
                      ? 'xpo_bg-green-100 xpo_text-green-800' 
                      : 'xpo_bg-red-100 xpo_text-red-800'
                  }`}>
                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                
                <div className="xpo_flex xpo_gap-3">
                  <Link
                    to={`/product/${item.id}`}
                    className="xpo_p-2 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors"
                  >
                    <Eye className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
                  </Link>
                  
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.inStock}
                    className={`xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-medium xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2 ${
                      item.inStock
                        ? 'xpo_bg-black xpo_text-white hover:xpo_bg-gray-800'
                        : 'xpo_bg-gray-200 xpo_text-gray-500 xpo_cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="xpo_w-4 xpo_h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
              
              {!item.inStock && item.expectedRestock && (
                <p className="xpo_text-sm xpo_text-orange-600 xpo_mt-2">
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
      <div className="xpo_bg-gray-50 xpo_min-h-screen xpo_py-8">
        <div className="xpo_container xpo_mx-auto">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-8">
            <div>
              <h1 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900">My Wishlist</h1>
              <p className="xpo_text-gray-600 xpo_mt-1">Manage your favorite products and track price changes</p>
            </div>
            
            <div className="xpo_flex xpo_gap-3">
              <button
                onClick={shareWishlist}
                className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-200 xpo_rounded-lg hover:xpo_bg-white xpo_transition-colors"
              >
                <Share2 className="xpo_w-4 xpo_h-4" />
                Share
              </button>
              
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-medium xpo_transition-colors ${
                  isSelectionMode 
                    ? 'xpo_bg-blue-600 xpo_text-white' 
                    : 'xpo_border xpo_border-gray-200 hover:xpo_bg-white'
                }`}
              >
                <Check className="xpo_w-4 xpo_h-4" />
                {isSelectionMode ? 'Exit Selection' : 'Select Items'}
              </button>
            </div>
          </div>

          <WishlistStats />

          {isSelectionMode && selectedItems.length > 0 && (
            <div className="xpo_bg-white xpo_rounded-xl xpo_border xpo_border-blue-200 xpo_p-4 xpo_mb-6">
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                  <span className="xpo_font-medium xpo_text-gray-900">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={selectAllItems}
                    className="xpo_text-blue-600 xpo_text-sm hover:xpo_text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="xpo_text-gray-600 xpo_text-sm hover:xpo_text-gray-800"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="xpo_flex xpo_gap-3">
                  <button
                    onClick={removeSelectedItems}
                    className="xpo_px-4 xpo_py-2 xpo_text-red-600 xpo_border xpo_border-red-200 xpo_rounded-lg hover:xpo_bg-red-50 xpo_transition-colors"
                  >
                    Remove Selected
                  </button>
                  <button
                    onClick={addSelectedToCart}
                    className="xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_rounded-lg hover:xpo_bg-blue-700 xpo_transition-colors xpo_flex xpo_items-center xpo_gap-2"
                  >
                    <ShoppingCart className="xpo_w-4 xpo_h-4" />
                    Add Selected to Cart
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="xpo_bg-white xpo_rounded-xl xpo_border xpo_border-gray-200 xpo_p-6 xpo_mb-6">
            <div className="xpo_flex xpo_flex-col sm:xpo_flex-row xpo_gap-4">
              <div className="xpo_flex-1">
                <div className="xpo_relative">
                  <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="text"
                    placeholder="Search your wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-200 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent"
                  />
                </div>
              </div>

              <div className="xpo_flex xpo_gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-200 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent"
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
                  className="xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-200 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent"
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>

                <div className="xpo_flex xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`xpo_p-3 ${viewMode === 'grid' ? 'xpo_bg-gray-900 xpo_text-white' : 'xpo_bg-white xpo_text-gray-600 hover:xpo_bg-gray-50'}`}
                  >
                    <Grid className="xpo_w-5 xpo_h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`xpo_p-3 ${viewMode === 'list' ? 'xpo_bg-gray-900 xpo_text-white' : 'xpo_bg-white xpo_text-gray-600 hover:xpo_bg-gray-50'}`}
                  >
                    <List className="xpo_w-5 xpo_h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {sortedItems.length === 0 ? (
            <div className="xpo_text-center xpo_py-12">
              <div className="xpo_bg-white xpo_rounded-xl xpo_border xpo_border-gray-200 xpo_p-8">
                <Heart className="xpo_w-16 xpo_h-16 xpo_text-gray-300 xpo_mx-auto xpo_mb-4" />
                <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900 xpo_mb-2">
                  {searchQuery || filterCategory !== 'all' ? 'No items found' : 'Your wishlist is empty'}
                </h3>
                <p className="xpo_text-gray-600 xpo_mb-6">
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
                    className="xpo_px-6 xpo_py-3 xpo_bg-gray-900 xpo_text-white xpo_rounded-lg hover:xpo_bg-gray-800 xpo_transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/products"
                    className="xpo_inline-flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-gray-900 xpo_text-white xpo_rounded-lg hover:xpo_bg-gray-800 xpo_transition-colors"
                  >
                    <ExternalLink className="xpo_w-4 xpo_h-4" />
                    Browse Products
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6">
                <p className="xpo_text-gray-600">
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