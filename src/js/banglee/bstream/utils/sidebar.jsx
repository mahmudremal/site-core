import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { __ } from '@js/utils';
import { home_route } from '@banglee/core';
import Header from './header';
import {
  Home as IconHome,
  Compass as IconExplore,
  MonitorPlay as IconShorts,
  Rss as IconSubscriptions,
  Library as IconLibrary,
  History as IconHistory,
  Video as IconYourVideos,
  Clock as IconWatchLater,
  ThumbsUp as IconLiked,
  TrendingUp as IconTrending,
  ShoppingCart as IconShopping,
  Music as IconMusic,
  Gamepad2 as IconGaming,
  Newspaper as IconNews,
  Volleyball as IconSports,
  BookOpen as IconLearning,
  MoreHorizontal as IconMore,
  Settings as IconSettings,
  Flag as IconReport,
  HelpCircle as IconHelp,
  MessageSquare as IconFeedback
} from 'lucide-react';

const Sidebar = ({ children }) => {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="xpo_w-full xpo_h-screen xpo_grid xpo_grid-cols-1 xpo_gap-0">
            <div className="xpo_w-full xpo_sticky xpo_top-0 xpo_self-start xpo_z-10">
                <Header />
            </div>
            <div className="xpo_grid xpo_grid-cols-[300px_1fr]">
                <div className="xpo_bg-white xpo_shadow-lg xpo_h-full xpo_p-4">
                    <div className="xpo_space-y-2 xpo_sticky xpo_top-0 xpo_self-start">
                        <div className="xpo_space-y-1">
                            <Link to={home_route('bstream', '/')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconHome className="xpo_mr-2" /> {__( 'Home')}
                            </Link>
                            <Link to={home_route('bstream', '/explore')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconExplore className="xpo_mr-2" /> {__( 'Explore')}
                            </Link>
                            <Link to={home_route('bstream', '/shorts')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconShorts className="xpo_mr-2" /> {__( 'Shorts')}
                            </Link>
                            <Link to={home_route('bstream', '/subscriptions')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconSubscriptions className="xpo_mr-2" /> {__( 'Subscriptions')}
                            </Link>
                        </div>
                        <hr className="xpo_my-4" />
                        <div className="xpo_space-y-1">
                            <h2 className="xpo_text-lg xpo_font-semibold">{__( 'You')}</h2>
                            <Link to={home_route('bstream', '/library')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconLibrary className="xpo_mr-2" /> {__( 'Library')}
                            </Link>
                            <Link to={home_route('bstream', '/history')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconHistory className="xpo_mr-2" /> {__( 'History')}
                            </Link>
                            <Link to={home_route('bstream', '/your-videos')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconYourVideos className="xpo_mr-2" /> {__( 'Your Videos')}
                            </Link>
                            <Link to={home_route('bstream', '/watch-later')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconWatchLater className="xpo_mr-2" /> {__( 'Watch Later')}
                            </Link>
                            <Link to={home_route('bstream', '/liked')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconLiked className="xpo_mr-2" /> {__( 'Liked Videos')}
                            </Link>
                        </div>
                        <hr className="xpo_my-4" />
                        <div className="xpo_space-y-1">
                            <h2 className="xpo_text-lg xpo_font-semibold">{__( 'Explore')}</h2>
                            <Link to={home_route('bstream', '/trending')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconTrending className="xpo_mr-2" /> {__( 'Trending')}
                            </Link>
                            <Link to={home_route('bstream', '/shopping')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconShopping className="xpo_mr-2" /> {__( 'Shopping')}
                            </Link>
                            <Link to={home_route('bstream', '/music')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconMusic className="xpo_mr-2" /> {__( 'Music')}
                            </Link>
                        </div>
                        {!showMore ? (
                            <button  onClick={() => setShowMore(prev => !prev)}  className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconMore className="xpo_mr-2" /> {__( 'Show more')}
                            </button>
                        ) : null}
                        {showMore && (
                        <div className="xpo_space-y-1">
                            <Link to={home_route('bstream', '/gaming')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconGaming className="xpo_mr-2" /> {__( 'Gaming')}
                            </Link>
                            <Link to={home_route('bstream', '/news')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconNews className="xpo_mr-2" /> {__( 'News')}
                            </Link>
                            <Link to={home_route('bstream', '/sports')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconSports className="xpo_mr-2" /> {__( 'Sports')}
                            </Link>
                            <Link to={home_route('bstream', '/learning')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconLearning className="xpo_mr-2" /> {__( 'Learning')}
                            </Link>
                            <Link to={home_route('bstream', '/more')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconMore className="xpo_mr-2" /> {__( 'More')}
                            </Link>
                            <Link to={home_route('bstream', '/settings')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconSettings className="xpo_mr-2" /> {__( 'Settings')}
                            </Link>
                            <Link to={home_route('bstream', '/report-history')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconReport className="xpo_mr-2" /> {__( 'Report History')}
                            </Link>
                            <Link to={home_route('bstream', '/help')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconHelp className="xpo_mr-2" /> {__( 'Help')}
                            </Link>
                            <Link to={home_route('bstream', '/feedback')} className="xpo_flex xpo_items-center xpo_w-full xpo_p-2 hover:xpo_bg-gray-100">
                                <IconFeedback className="xpo_mr-2" /> {__( 'Send Feedback')}
                            </Link>
                        </div>
                        )}
                    </div>
                </div>
                <div className="xpo_sticky xpo_top-0 xpo_self-start">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;