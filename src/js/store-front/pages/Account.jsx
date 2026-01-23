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
import { useAuth } from '../hooks/useAuth';
// Updated AccountPage component with your site's theme

const AccountOverview = ({ userStats, recentOrders }) => {
  const { __ } = useLocale();
  const { money } = useCurrency();

  return (
    <>
      <div className="space-y-8">
        {/* Stats Grid - Matching your site's gradient style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{__('Total Orders', 'site-core')}</p>
                <p className="text-3xl font-bold mt-2">{userStats?.totalOrders || 0}</p>
                <p className="text-blue-200 text-xs mt-1">+12% this month</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">{__('Total Spent', 'site-core')}</p>
                <p className="text-3xl font-bold mt-2">{money(userStats?.totalSpent || 0)}</p>
                <p className="text-emerald-200 text-xs mt-1">+8% this month</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{__('Wishlist Items', 'site-core')}</p>
                <p className="text-3xl font-bold mt-2">{userStats?.wishlistCount || 0}</p>
                <p className="text-purple-200 text-xs mt-1">+3 this week</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{__('Active Stores', 'site-core')}</p>
                <p className="text-3xl font-bold mt-2">{userStats?.activeStores || 0}</p>
                <p className="text-orange-200 text-xs mt-1">All verified</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Store className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{__('Recent Orders', 'site-core')}</h3>
              <Link
                to="/clients-portal/my/orders"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                {__('View All', 'site-core')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders?.slice(0, 3).map((order, index) => (
                <div key={index} className="bg-gray-700/30 backdrop-blur-sm border border-gray-600/40 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">#{order.id}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{money(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">{__('Quick Actions', 'site-core')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/clients-portal/my/profile"
                className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm rounded-xl p-4 text-center hover:from-blue-500/30 hover:to-purple-600/30 hover:border-blue-400/50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-white">{__('Edit Profile', 'site-core')}</span>
              </Link>

              <Link
                to="/clients-portal/my/orders"
                className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 backdrop-blur-sm rounded-xl p-4 text-center hover:from-emerald-500/30 hover:to-teal-600/30 hover:border-emerald-400/50 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/30 transition-colors">
                  <Package className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white">{__('My Orders', 'site-core')}</span>
              </Link>

              <Link
                to="/clients-portal/my/wishlist"
                className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-sm rounded-xl p-4 text-center hover:from-purple-500/30 hover:to-pink-600/30 hover:border-purple-400/50 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                  <Heart className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-white">{__('Wishlist', 'site-core')}</span>
              </Link>

              <Link
                to="/clients-portal/my/stores"
                className="bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30 backdrop-blur-sm rounded-xl p-4 text-center hover:from-orange-500/30 hover:to-amber-600/30 hover:border-orange-400/50 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-500/30 transition-colors">
                  <Store className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-sm font-medium text-white">{__('My Stores', 'site-core')}</span>
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
  const { logout } = useAuth();

  // State (same as before)
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Mock data (same as before)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
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
    logout();
    navigate(`/auth/bye`);
  };

  if (loading) {
    return (
      <div>
        <SiteHeader />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-400">{__('Loading account...', 'site-core')}</p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div>
      <SiteHeader />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8">

          {/* Enhanced Header */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                    <img
                      src={user?.avatar}
                      alt={`${user?.first_name} ${user?.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {user?.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-gray-900">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {sprintf(__('Welcome back, %s!', 'site-core'), user?.first_name)}
                  </h1>
                  <p className="text-gray-300 mb-1">{user?.email}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {sprintf(__('Member since %s', 'site-core'), new Date(user?.member_since).getFullYear())}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  to="/clients-portal/my/profile"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {__('Edit Profile', 'site-core')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 text-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-600/50 hover:text-white transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {__('Sign Out', 'site-core')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl sticky top-8">
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = section === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleMenuClick(item.key)}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-left transition-all group ${isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-gray-700/30 hover:text-white hover:border hover:border-gray-600/50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500/20' : 'bg-gray-700/50 group-hover:bg-gray-600/50'}`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500 hidden lg:block">
                              {item.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${isActive
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-gray-700/50 text-gray-400 border-gray-600/50'
                              }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-400 rotate-90' : 'text-gray-500 group-hover:text-gray-400'
                            }`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl min-h-96">
                {section === 'overview' && (
                  <AccountOverview
                    userStats={userStats}
                    recentOrders={recentOrders}
                  />
                )}

                {section !== 'overview' && (
                  <div className="text-center py-16">
                    <div className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-600/30 max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-600/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        {menuItems.find(item => item.key === section)?.icon &&
                          (() => {
                            const Icon = menuItems.find(item => item.key === section).icon;
                            return <Icon className="w-8 h-8 text-gray-400" />;
                          })()
                        }
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {menuItems.find(item => item.key === section)?.label}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {menuItems.find(item => item.key === section)?.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {__('This section is under development. Individual components will be created for each tab.', 'site-core')}
                      </p>
                    </div>
                  </div>
                )}
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