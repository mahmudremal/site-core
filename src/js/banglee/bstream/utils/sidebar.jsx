import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { __ } from '@js/utils';
import { home_route } from '@banglee/core';
import Header from './header';
import { Home, Compass, MonitorPlay, Rss, Library, History, Video, Clock, ThumbsUp, TrendingUp, ShoppingCart, Music, Gamepad2, Newspaper, Trophy, BookOpen, ChevronDown, ChevronRight, Settings, Flag, HelpCircle, MessageSquare, Users, Play } from 'lucide-react';

const Sidebar = ({ children, isCollapsed = false, onToggleCollapse }) => {
    const [showMore, setShowMore] = useState(false);
    const [showSubscriptions, setShowSubscriptions] = useState(false);
    const location = useLocation();

    // Sidebar navigation items configuration
    const primaryItems = [
        { icon: Home, label: __('Home'), path: '/', isActive: location.pathname === home_route('bstream', '/') },
        { icon: Compass, label: __('Explore'), path: '/explore', isActive: location.pathname === home_route('bstream', '/explore') },
        { icon: MonitorPlay, label: __('Shorts'), path: '/shorts', isActive: location.pathname === home_route('bstream', '/shorts') },
        { icon: Rss, label: __('Subscriptions'), path: '/subscriptions', isActive: location.pathname === home_route('bstream', '/subscriptions') }
    ];

    const libraryItems = [
        { icon: Library, label: __('Library'), path: '/library', isActive: location.pathname === home_route('bstream', '/library') },
        { icon: History, label: __('History'), path: '/history', isActive: location.pathname === home_route('bstream', '/history') },
        { icon: Video, label: __('Your Videos'), path: '/your-videos', isActive: location.pathname === home_route('bstream', '/your-videos') },
        { icon: Clock, label: __('Watch Later'), path: '/watch-later', isActive: location.pathname === home_route('bstream', '/watch-later') },
        { icon: ThumbsUp, label: __('Liked Videos'), path: '/liked', isActive: location.pathname === home_route('bstream', '/liked') }
    ];

    const exploreItems = [
        { icon: TrendingUp, label: __('Trending'), path: '/trending', isActive: location.pathname === home_route('bstream', '/trending') },
        { icon: ShoppingCart, label: __('Shopping'), path: '/shopping', isActive: location.pathname === home_route('bstream', '/shopping') },
        { icon: Music, label: __('Music'), path: '/music', isActive: location.pathname === home_route('bstream', '/music') }
    ];

    const moreItems = [
        { icon: Gamepad2, label: __('Gaming'), path: '/gaming', isActive: location.pathname === home_route('bstream', '/gaming') },
        { icon: Newspaper, label: __('News'), path: '/news', isActive: location.pathname === home_route('bstream', '/news') },
        { icon: Trophy, label: __('Sports'), path: '/sports', isActive: location.pathname === home_route('bstream', '/sports') },
        { icon: BookOpen, label: __('Learning'), path: '/learning', isActive: location.pathname === home_route('bstream', '/learning') }
    ];

    const settingsItems = [
        { icon: Settings, label: __('Settings'), path: '/settings', isActive: location.pathname === home_route('bstream', '/settings') },
        { icon: Flag, label: __('Report History'), path: '/report-history', isActive: location.pathname === home_route('bstream', '/report-history') },
        { icon: HelpCircle, label: __('Help'), path: '/help', isActive: location.pathname === home_route('bstream', '/help') },
        { icon: MessageSquare, label: __('Send Feedback'), path: '/feedback', isActive: location.pathname === home_route('bstream', '/feedback') }
    ];

    // Sample subscriptions data (in real app, fetch from API)
    const subscriptions = [
        { id: 1, name: 'Tech Channel', avatar: '/avatars/tech.jpg', isLive: true },
        { id: 2, name: 'Gaming Pro', avatar: '/avatars/gaming.jpg', isLive: false },
        { id: 3, name: 'Music Vibes', avatar: '/avatars/music.jpg', isLive: false },
        { id: 4, name: 'News Today', avatar: '/avatars/news.jpg', isLive: true }
    ];

    const SidebarLink = ({ icon: Icon, label, path, isActive, badge, onClick }) => {
        const baseClasses = "xpo_flex xpo_items-center xpo_w-full xpo_p-2 xpo_rounded-lg xpo_transition-all xpo_duration-200 xpo_group";
        const activeClasses = isActive 
            ? "xpo_bg-gray-100 xpo_text-red-600 xpo_font-medium" 
            : "hover:xpo_bg-gray-50 xpo_text-gray-700 hover:xpo_text-gray-900";

        const content = (
            <>
                <Icon 
                    size={20} 
                    className={`xpo_mr-3 xpo_transition-colors ${isActive ? 'xpo_text-red-600' : 'xpo_text-gray-600 group-hover:xpo_text-gray-900'}`} 
                />
                {!isCollapsed && (
                    <span className="xpo_text-sm xpo_truncate xpo_flex-1">{label}</span>
                )}
                {!isCollapsed && badge && (
                    <span className="xpo_ml-auto xpo_bg-red-600 xpo_text-white xpo_text-xs xpo_rounded-full xpo_px-2 xpo_py-1">
                        {badge}
                    </span>
                )}
            </>
        );

        if (onClick) {
            return (
                <button onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
                    {content}
                </button>
            );
        }

        return (
            <Link to={home_route('bstream', path)} className={`${baseClasses} ${activeClasses}`}>
                {content}
            </Link>
        );
    };

    const SectionDivider = () => (
        <hr className="xpo_my-4 xpo_border-gray-200" />
    );

    const SectionTitle = ({ title }) => (
        !isCollapsed && <h3 className="xpo_text-sm xpo_font-semibold xpo_text-gray-900 xpo_px-3 xpo_py-2 xpo_uppercase xpo_tracking-wide">{title}</h3>
    );

    const SubscriptionItem = ({ subscription }) => (
        <Link 
            to={home_route('bstream', `/channel/${subscription.id}`)} 
            className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 xpo_rounded-lg hover:xpo_bg-gray-50 xpo_transition-colors xpo_group"
        >
            <div className="xpo_relative xpo_mr-3">
                <div className="xpo_w-6 xpo_h-6 xpo_bg-gray-300 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center">
                    <Users size={14} className="xpo_text-gray-600" />
                </div>
                {subscription.isLive && (
                    <div className="xpo_absolute -xpo_bottom-1 -xpo_right-1 xpo_w-3 xpo_h-3 xpo_bg-red-600 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center">
                        <Play size={8} className="xpo_text-white xpo_fill-current" />
                    </div>
                )}
            </div>
            {!isCollapsed && (
                <span className="xpo_text-sm xpo_text-gray-700 xpo_truncate group-hover:xpo_text-gray-900">
                    {subscription.name}
                </span>
            )}
        </Link>
    );

    return (
        <div className="xpo_w-full xpo_h-screen xpo_flex xpo_flex-col">
            <div className="xpo_w-full xpo_sticky xpo_top-0 xpo_z-10 xpo_bg-white xpo_border-b xpo_border-gray-200">
                <Header onToggleSidebar={onToggleCollapse} />
            </div>

            {/* Main Content */}
            <div className={`xpo_flex xpo_flex-1 xpo_overflow-hidden ${isCollapsed ? '' : ''}`}>
                {/* Sidebar */}
                <div className={`xpo_bg-white xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col xpo_transition-all xpo_duration-300 ${
                    isCollapsed ? 'xpo_w-16' : 'xpo_w-64'
                }`}>
                    <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-3 xpo_space-y-1">
                        {/* Primary Navigation */}
                        {primaryItems.map((item) => (
                            <SidebarLink key={item.path} {...item} />
                        ))}

                        <SectionDivider />

                        {/* Library Section */}
                        <SectionTitle title={__('You')} />
                        {libraryItems.map((item) => (
                            <SidebarLink key={item.path} {...item} />
                        ))}

                        {/* Subscriptions Section */}
                        {!isCollapsed && (
                            <>
                                <SectionDivider />
                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_px-3 xpo_py-2">
                                    <h3 className="xpo_text-sm xpo_font-semibold xpo_text-gray-900 xpo_uppercase xpo_tracking-wide">
                                        {__('Subscriptions')}
                                    </h3>
                                    <button 
                                        onClick={() => setShowSubscriptions(!showSubscriptions)}
                                        className="xpo_p-1 xpo_rounded hover:xpo_bg-gray-100"
                                    >
                                        {showSubscriptions ? (
                                            <ChevronDown size={16} className="xpo_text-gray-600" />
                                        ) : (
                                            <ChevronRight size={16} className="xpo_text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {showSubscriptions && subscriptions.map((sub) => (
                                    <SubscriptionItem key={sub.id} subscription={sub} />
                                ))}
                            </>
                        )}

                        <SectionDivider />

                        {/* Explore Section */}
                        <SectionTitle title={__('Explore')} />
                        {exploreItems.map((item) => (
                            <SidebarLink key={item.path} {...item} />
                        ))}

                        {/* More Section */}
                        {!showMore ? (
                            <SidebarLink 
                                icon={ChevronRight}
                                label={__('Show more')}
                                onClick={() => setShowMore(true)}
                            />
                        ) : (
                            <>
                                <SidebarLink 
                                    icon={ChevronDown}
                                    label={__('Show less')}
                                    onClick={() => setShowMore(false)}
                                />
                                {moreItems.map((item) => (
                                    <SidebarLink key={item.path} {...item} />
                                ))}
                            </>
                        )}

                        <SectionDivider />

                        {/* Settings Section */}
                        {settingsItems.map((item) => (
                            <SidebarLink key={item.path} {...item} />
                        ))}

                        {/* Footer */}
                        {!isCollapsed && (
                            <div className="xpo_px-3 xpo_py-4 xpo_text-xs xpo_text-gray-500 xpo_space-y-1">
                                <p>© 2025 BStream</p>
                                <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('About')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Press')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Copyright')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Contact')}</Link>
                                </div>
                                <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Creators')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Advertise')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Developers')}</Link>
                                </div>
                                <div className="xpo_flex xpo_flex-wrap xpo_gap-2">
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Terms')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Privacy')}</Link>
                                    <Link to={home_route('bstream', '/#')} className="hover:xpo_text-gray-700">{__('Safety')}</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xpo_flex-1 xpo_overflow-hidden xpo_bg-gray-50">
                    <div className="xpo_h-full xpo_overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;