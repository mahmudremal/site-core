import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User, Settings, Store, ShoppingBag, Heart, Package, CreditCard, Bell, Shield, MapPin, LogOut, ChevronRight, Activity, BarChart3, Users, TrendingUp, DollarSign, Eye, Calendar, Phone, Mail, Camera, Edit3 } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import { useTheme } from '../hooks/useTheme';
import { sprintf } from 'sprintf-js';
import MoonlitSky from '../components/backgrounds/MoonlitSky';
import SiteHeader from '../components/layout/Header';
import SiteFooter from '../components/layout/Footer';

// Tab components (these would be separate files in your actual implementation)
const AccountOverview = ({ userStats, recentOrders }) => {
  const { __ } = useLocale();
  const { money } = useCurrency();

  return (
    <>
      <div className="xpo_space-y-6">
        {/* Stats Grid */}
        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 lg:xpo_grid-cols-4 xpo_gap-6">
          <div className="xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-blue-600 xpo_rounded-lg xpo_p-6 xpo_text-white">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <div>
                <p className="xpo_text-blue-100 xpo_text-sm">{__('Total Orders', 'site-core')}</p>
                <p className="xpo_text-2xl xpo_font-bold">{userStats?.totalOrders || 0}</p>
              </div>
              <ShoppingBag className="xpo_w-8 xpo_h-8 xpo_text-blue-200" />
            </div>
          </div>

          <div className="xpo_bg-gradient-to-r xpo_from-green-500 xpo_to-green-600 xpo_rounded-lg xpo_p-6 xpo_text-white">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <div>
                <p className="xpo_text-green-100 xpo_text-sm">{__('Total Spent', 'site-core')}</p>
                <p className="xpo_text-2xl xpo_font-bold">{money(userStats?.totalSpent || 0)}</p>
              </div>
              <DollarSign className="xpo_w-8 xpo_h-8 xpo_text-green-200" />
            </div>
          </div>

          <div className="xpo_bg-gradient-to-r xpo_from-purple-500 xpo_to-purple-600 xpo_rounded-lg xpo_p-6 xpo_text-white">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <div>
                <p className="xpo_text-purple-100 xpo_text-sm">{__('Wishlist Items', 'site-core')}</p>
                <p className="xpo_text-2xl xpo_font-bold">{userStats?.wishlistCount || 0}</p>
              </div>
              <Heart className="xpo_w-8 xpo_h-8 xpo_text-purple-200" />
            </div>
          </div>

          <div className="xpo_bg-gradient-to-r xpo_from-orange-500 xpo_to-orange-600 xpo_rounded-lg xpo_p-6 xpo_text-white">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <div>
                <p className="xpo_text-orange-100 xpo_text-sm">{__('Active Stores', 'site-core')}</p>
                <p className="xpo_text-2xl xpo_font-bold">{userStats?.activeStores || 0}</p>
              </div>
              <Store className="xpo_w-8 xpo_h-8 xpo_text-orange-200" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_gap-6">
          {/* Recent Orders */}
          <div className="xpo_bg-white/70 xpo_rounded-lg xpo_shadow-lg xpo_p-6">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">{__('Recent Orders', 'site-core')}</h3>
              <Link to="/clients-portal/my/orders" className="xpo_text-blue-600 hover:xpo_text-blue-800 xpo_text-sm">
                {__('View All', 'site-core')}
              </Link>
            </div>
            <div className="xpo_space-y-3">
              {recentOrders?.slice(0, 3).map((order, index) => (
                <div key={index} className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 xpo_bg-gray-50 xpo_rounded-lg">
                  <div>
                    <p className="xpo_font-medium xpo_text-sm">#{order.id}</p>
                    <p className="xpo_text-xs xpo_text-gray-600">{order.date}</p>
                  </div>
                  <div className="xpo_text-right">
                    <p className="xpo_font-semibold xpo_text-sm">{money(order.total)}</p>
                    <span className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full ${
                      order.status === 'delivered' 
                        ? 'xpo_bg-green-100 xpo_text-green-700'
                        : order.status === 'processing'
                        ? 'xpo_bg-yellow-100 xpo_text-yellow-700'
                        : 'xpo_bg-blue-100 xpo_text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="xpo_bg-white/70 xpo_rounded-lg xpo_shadow-lg xpo_p-6">
            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800 xpo_mb-4">{__('Quick Actions', 'site-core')}</h3>
            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-3">
              <Link to="/clients-portal/my/profile" className="xpo_flex xpo_flex-col xpo_items-center xpo_p-4 xpo_bg-blue-50 xpo_rounded-lg hover:xpo_bg-blue-100 xpo_transition-colors">
                <User className="xpo_w-6 xpo_h-6 xpo_text-blue-600 xpo_mb-2" />
                <span className="xpo_text-sm xpo_font-medium">{__('Edit Profile', 'site-core')}</span>
              </Link>
              <Link to="/clients-portal/my/orders" className="xpo_flex xpo_flex-col xpo_items-center xpo_p-4 xpo_bg-green-50 xpo_rounded-lg hover:xpo_bg-green-100 xpo_transition-colors">
                <Package className="xpo_w-6 xpo_h-6 xpo_text-green-600 xpo_mb-2" />
                <span className="xpo_text-sm xpo_font-medium">{__('My Orders', 'site-core')}</span>
              </Link>
              <Link to="/clients-portal/my/wishlist" className="xpo_flex xpo_flex-col xpo_items-center xpo_p-4 xpo_bg-purple-50 xpo_rounded-lg hover:xpo_bg-purple-100 xpo_transition-colors">
                <Heart className="xpo_w-6 xpo_h-6 xpo_text-purple-600 xpo_mb-2" />
                <span className="xpo_text-sm xpo_font-medium">{__('Wishlist', 'site-core')}</span>
              </Link>
              <Link to="/clients-portal/my/stores" className="xpo_flex xpo_flex-col xpo_items-center xpo_p-4 xpo_bg-orange-50 xpo_rounded-lg hover:xpo_bg-orange-100 xpo_transition-colors">
                <Store className="xpo_w-6 xpo_h-6 xpo_text-orange-600 xpo_mb-2" />
                <span className="xpo_text-sm xpo_font-medium">{__('My Stores', 'site-core')}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AccountPage = () => {
  const { section = 'overview' } = useParams();
  const navigate = useNavigate();
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { theme } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Mock user data - replace with actual API calls
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setUser({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          address: '123 Main St, City, State 12345',
          member_since: '2022-01-15',
          verified: true
        });
        
        setUserStats({
          totalOrders: 42,
          totalSpent: 1245.50,
          wishlistCount: 15,
          activeStores: 2
        });
        
        setRecentOrders([
          { id: '12345', date: '2024-01-15', total: 89.99, status: 'delivered' },
          { id: '12346', date: '2024-01-10', total: 156.00, status: 'processing' },
          { id: '12347', date: '2024-01-05', total: 45.50, status: 'shipped' }
        ]);
        
        setLoading(false);
      }, 1000);
    };

    fetchUserData();
  }, []);

  const menuItems = [
    {
      key: 'overview',
      label: __('Overview', 'site-core'),
      icon: Activity,
      description: __('Account summary and quick actions', 'site-core')
    },
    {
      key: 'profile',
      label: __('Profile', 'site-core'),
      icon: User,
      description: __('Personal information and settings', 'site-core')
    },
    {
      key: 'orders',
      label: __('Orders', 'site-core'),
      icon: Package,
      description: __('Order history and tracking', 'site-core'),
      badge: userStats?.totalOrders || 0
    },
    {
      key: 'wishlist',
      label: __('Wishlist', 'site-core'),
      icon: Heart,
      description: __('Saved items and favorites', 'site-core'),
      badge: userStats?.wishlistCount || 0
    },
    {
      key: 'stores',
      label: __('My Stores', 'site-core'),
      icon: Store,
      description: __('Manage your vendor stores', 'site-core'),
      badge: userStats?.activeStores || 0
    },
    {
      key: 'addresses',
      label: __('Addresses', 'site-core'),
      icon: MapPin,
      description: __('Shipping and billing addresses', 'site-core')
    },
    {
      key: 'payment',
      label: __('Payment Methods', 'site-core'),
      icon: CreditCard,
      description: __('Manage payment options', 'site-core')
    },
    {
      key: 'notifications',
      label: __('Notifications', 'site-core'),
      icon: Bell,
      description: __('Email and push notification settings', 'site-core')
    },
    {
      key: 'security',
      label: __('Security', 'site-core'),
      icon: Shield,
      description: __('Password and security settings', 'site-core')
    },
    {
      key: 'settings',
      label: __('Settings', 'site-core'),
      icon: Settings,
      description: __('Account preferences', 'site-core')
    }
  ];

  const handleMenuClick = (key) => {
    navigate(`/clients-portal/my/${key}`);
  };

  const handleSignOut = () => {
    // Add sign out logic
    console.log('Signing out...');
  };

  if (loading) {
    return (
      <div>
        <SiteHeader />
        <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_items-center xpo_justify-center">
          <div className="xpo_text-center">
            <div className="xpo_animate-spin xpo_rounded-full xpo_h-12 xpo_w-12 xpo_border-b-2 xpo_border-blue-600 xpo_mx-auto"></div>
            <p className="xpo_mt-4 xpo_text-gray-600">{__('Loading account...', 'site-core')}</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />
      
      <div className="xpo_relative xpo_min-h-screen">
        <div className="xpo_absolute xpo_inset-0 xpo_z-0 xpo_pointer-events-none xpo_select-none">
          <MoonlitSky />
        </div>

        <div className="xpo_relative xpo_z-10 xpo_min-h-screen xpo_bg-gray-50/80">
          <div className="xpo_max-w-7xl xpo_mx-auto xpo_px-4 xpo_py-8">
            
            {/* Page Header */}
            <div className="xpo_bg-white/70 xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_mb-8">
              <div className="xpo_flex xpo_flex-col md:xpo_flex-row xpo_items-start md:xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_space-x-4 xpo_mb-4 md:xpo_mb-0">
                  <div className="xpo_relative">
                    <img
                      src={user?.avatar}
                      alt={`${user?.first_name} ${user?.last_name}`}
                      className="xpo_w-16 xpo_h-16 xpo_rounded-full xpo_object-cover xpo_border-4 xpo_border-white xpo_shadow-lg"
                    />
                    {user?.verified && (
                      <div className="xpo_absolute xpo_-bottom-1 xpo_-right-1 xpo_bg-green-500 xpo_rounded-full xpo_p-1">
                        <Shield className="xpo_w-3 xpo_h-3 xpo_text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-800">
                      {sprintf(__('Welcome back, %s!', 'site-core'), user?.first_name)}
                    </h1>
                    <p className="xpo_text-gray-600">{user?.email}</p>
                    <p className="xpo_text-sm xpo_text-gray-500">
                      {sprintf(__('Member since %s', 'site-core'), new Date(user?.member_since).getFullYear())}
                    </p>
                  </div>
                </div>
                
                <div className="xpo_flex xpo_space-x-3">
                  <Link 
                    to="/clients-portal/my/profile" 
                    className="xpo_bg-blue-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-medium hover:xpo_bg-blue-700 xpo_transition-colors"
                  >
                    <Edit3 className="xpo_w-4 xpo_h-4 xpo_inline xpo_mr-2" />
                    {__('Edit Profile', 'site-core')}
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="xpo_bg-gray-600 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-medium hover:xpo_bg-gray-700 xpo_transition-colors"
                  >
                    <LogOut className="xpo_w-4 xpo_h-4 xpo_inline xpo_mr-2" />
                    {__('Sign Out', 'site-core')}
                  </button>
                </div>
              </div>
            </div>

            <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-4 xpo_gap-8">
              
              {/* Sidebar Menu */}
              <div className="lg:xpo_col-span-1">
                <div className="xpo_bg-white/70 xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_sticky xpo_top-8">
                  <nav className="xpo_space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = section === item.key;
                      
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleMenuClick(item.key)}
                          className={`xpo_w-full xpo_flex xpo_items-center xpo_justify-between xpo_px-4 xpo_py-3 xpo_rounded-lg xpo_text-left xpo_transition-all xpo_group ${
                            isActive
                              ? 'xpo_bg-blue-100 xpo_text-blue-700 xpo_border-l-4 xpo_border-blue-500'
                              : 'xpo_text-gray-700 hover:xpo_bg-gray-100 hover:xpo_text-gray-900'
                          }`}
                        >
                          <div className="xpo_flex xpo_items-center xpo_space-x-3">
                            <Icon className={`xpo_w-5 xpo_h-5 ${isActive ? 'xpo_text-blue-600' : 'xpo_text-gray-500 group-hover:xpo_text-gray-700'}`} />
                            <div>
                              <div className="xpo_font-medium">{item.label}</div>
                              <div className="xpo_text-xs xpo_text-gray-500 xpo_hidden lg:xpo_block">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          
                          <div className="xpo_flex xpo_items-center xpo_space-x-2">
                            {item.badge && (
                              <span className={`xpo_text-xs xpo_px-2 xpo_py-1 xpo_rounded-full xpo_font-medium ${
                                isActive 
                                  ? 'xpo_bg-blue-200 xpo_text-blue-800' 
                                  : 'xpo_bg-gray-200 xpo_text-gray-600'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className={`xpo_w-4 xpo_h-4 xpo_transition-transform ${
                              isActive ? 'xpo_text-blue-600 xpo_rotate-90' : 'xpo_text-gray-400 group-hover:xpo_text-gray-600'
                            }`} />
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:xpo_col-span-3">
                <div className="xpo_bg-white/70 xpo_rounded-lg xpo_shadow-lg xpo_p-6 xpo_min-h-96">
                  {section === 'overview' && (
                    <AccountOverview 
                      userStats={userStats}
                      recentOrders={recentOrders}
                    />
                  )}
                  
                  {section !== 'overview' && (
                    <div className="xpo_text-center xpo_py-12">
                      <div className="xpo_text-gray-400 xpo_mb-4">
                        {menuItems.find(item => item.key === section)?.icon && 
                          (() => {
                            const Icon = menuItems.find(item => item.key === section).icon;
                            return <Icon className="xpo_w-16 xpo_h-16 xpo_mx-auto" />;
                          })()
                        }
                      </div>
                      <h3 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-2">
                        {menuItems.find(item => item.key === section)?.label}
                      </h3>
                      <p className="xpo_text-gray-600 xpo_mb-4">
                        {menuItems.find(item => item.key === section)?.description}
                      </p>
                      <p className="xpo_text-sm xpo_text-gray-500">
                        {__('This section is under development. Individual components will be created for each tab.', 'site-core')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default AccountPage;