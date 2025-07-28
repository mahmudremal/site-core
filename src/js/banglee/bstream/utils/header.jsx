import React, { useState } from 'react';
import { Menu, Search, Mic, Clapperboard, Bell, User } from 'lucide-react';
import { __ } from '@js/utils';
import { Link } from 'react-router-dom';
import { home_route, Dropdown } from '@banglee/core';


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'kanaksarwarNEWS premiering now:',
      link: '#',
      description: '"BDR মণ্ডল: BDR সদরের দপ্তরে নিউজপোর্টালের একটিপুরী খুশি হয়েছে!"',
      channel: 'kanaksarwarNEWS',
      time: '23 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Taw Haa Tv uploaded:',
      link: '#',
      description: 'দোয়ার কায়েদে গোপন আসন | আব্দুর রশিদ',
      channel: 'Taw Haa Tv',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 3,
      title: 'Tafsir Mahfil CHP uploaded:',
      link: '#',
      description: 'মহান বিদ্যের কোন অজানাব তোমার পছন্দ!',
      channel: 'Allama Sayede I CHP',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      title: 'ISLAMER TANE uploaded:',
      link: '#',
      description: 'বর্ষবরণের কেবিনে সিক্রেট সহ সিআইডি!',
      channel: 'Abu Tara Adnan',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className="xpo_bg-white xpo_top-0 xpo_left-0 xpo_right-0 xpo_z-50 xpo_border-b xpo_border-gray-200">
      <div className="xpo_flex xpo_items-center xpo_justify-between xpo_px-4 xpo_h-14">
        
        {/* Left section - Menu and Logo */}
        <div className="xpo_flex xpo_items-center xpo_space-x-4">
          <button className="xpo_p-2 xpo_hover:bg-gray-100 xpo_rounded-full xpo_transition-colors">
            <Menu className="xpo_w-6 xpo_h-6" />
          </button>
          <Link to={home_route('bstream', '/')} className="xpo_flex xpo_items-center xpo_space-x-1 xpo_select-none xpo_cursor-pointer">
            <div className="xpo_bg-red-600 xpo_text-white xpo_px-2 xpo_py-1 xpo_rounded xpo_text-sm xpo_font-bold">
              {__('Video', 'site-core')}
            </div>
            <span className="xpo_text-xl xpo_font-medium xpo_text-gray-900">
              {__('Stream', 'site-core')}
            </span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="xpo_flex-1 xpo_max-w-2xl xpo_mx-8">
          <form onSubmit={handleSearch} className="xpo_flex">
            <div className="xpo_flex xpo_flex-1 xpo_border xpo_border-gray-300 xpo_rounded-l-full xpo_focus-within:border-primary-500">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={__('Search', 'site-core')}
                className="xpo_flex-1 xpo_px-4 xpo_py-2 xpo_bg-transparent xpo_outline-none xpo_text-gray-900 xpo_placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="xpo_px-6 xpo_py-2 xpo_bg-gray-50 xpo_border xpo_border-l-0 xpo_border-gray-300 xpo_rounded-r-full xpo_hover:bg-gray-100 xpo_transition-colors"
            >
              <Search className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
            </button>
            <button
              type="button"
              className="xpo_ml-4 xpo_p-2 xpo_bg-gray-100 xpo_hover:bg-gray-200 xpo_rounded-full xpo_transition-colors"
              title={__('Search with voice', 'site-core')}
            >
              <Mic className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
            </button>
          </form>
        </div>

        {/* Right section - Actions and Profile */}
        <div className="xpo_flex xpo_items-center xpo_space-x-2">
          <Link
            to={home_route('bstream', '/upload')}
            className="xpo_p-2 xpo_hover:bg-gray-100 xpo_rounded-full xpo_transition-colors"
            title={__('Create', 'site-core')}
          >
            <Clapperboard className="xpo_w-6 xpo_h-6 xpo_text-gray-600" />
          </Link>
          <Dropdown button={(
            <button type="button" title={__('Notifications', 'site-core')} className="xpo_p-2 xpo_hover:bg-gray-100 xpo_rounded-full xpo_transition-colors xpo_relative">
              <Bell className="xpo_w-6 xpo_h-6 xpo_text-gray-600" />
              {notifications.some(n => n?.read === false) && <span className="xpo_absolute xpo_top-1 xpo_right-1 xpo_w-2 xpo_h-2 xpo_bg-red-600 xpo_rounded-full"></span>}
            </button>
          )}>
            <NotificationDropdown notifications={notifications} />
          </Dropdown>
          <button
            className="xpo_p-1 xpo_hover:bg-gray-100 xpo_rounded-full xpo_transition-colors"
            title={__('Account', 'site-core')}
          >
            <div className="xpo_w-8 xpo_h-8 xpo_bg-purple-600 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center">
              <User className="xpo_w-5 xpo_h-5 xpo_text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

const NotificationDropdown = ({ notifications }) => {
  return (
    <div className="xpo_min-w-96 xpo_max-h-screen xpo_overflow-y-auto xpo_p-4 xpo_z-50">
      <h3 className="xpo_font-bold xpo_text-xl xpo_mb-2">Notifications</h3>
      <div className="xpo_space-y-2">
        {notifications.map((noti, index) => (
          <Link key={index} to={home_route('bstream', noti.link)} className={`xpo_block xpo_p-2 hover:xpo_bg-gray-100 xpo_cursor-pointer ${noti.read ? 'xpo_text-gray-500' : 'xpo_bg-gray-100'} ${index == notifications.length - 1 ? '' : 'xpo_border-b xpo_border-gray-200'}`}>
            <h4 className="xpo_font-semibold">{noti.title}</h4>
            <p className="xpo_text-sm xpo_text-gray-600">{noti.description}</p>
            <span className="xpo_text-xs xpo_text-gray-500">{noti.channel} | {noti.time}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
