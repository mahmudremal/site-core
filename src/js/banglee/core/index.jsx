
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Plus, Clock, Bookmark, ShieldCheck, Globe, Settings, HelpCircle, SlidersHorizontal, Trash2 } from 'lucide-react';

import { createPopper } from '@popperjs/core';
import { __ } from '@js/utils';

export const Dropdown = ({ button, placement = 'bottom-end', className = 'xpo_z-50 xpo_bg-white xpo_border xpo_rounded xpo_shadow xpo_mt-2 xpo_p-2 xpo_min-w-[120px]', pclassName = 'xpo_relative', onOpen = null, onClose = null, children }) => {
    const [visible, setVisible] = useState(false);
    const btnRef = useRef();
    const popperRef = useRef();

    useEffect(() => {
        if (btnRef.current && popperRef.current) {
            createPopper(btnRef.current, popperRef.current, {
                placement: placement,
            });
        }
    }, [visible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popperRef.current && !popperRef.current.contains(event.target)) {
                setVisible(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const toggle = (e) => {
        e.preventDefault();
        if (visible) {onOpen && onOpen(e);}
        else {onClose && onClose(e);}
        setVisible(prev => !prev);
    }

    return (
        <div className={pclassName}>
            <div ref={btnRef} onClick={toggle}>{button}</div>
            {visible && (
                <div ref={popperRef} className={className}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const SearchBar = ({ filtersObj, setLoading }) => {
    const [filters, setFilters] = filtersObj;
    const [suggestions, setSuggestions] = useState([]);
    const [showList, setShowList] = useState(null);
    const inputRef = useRef();
    const listRef = useRef();

    useEffect(() => {
        if (inputRef.current && listRef.current) {
            createPopper(inputRef.current, listRef.current, {
                placement: 'bottom-end',
            });
        }
    }, [suggestions.length]);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (filters.s.trim()) {
                setLoading(true);
                axios.get(`/search/autocomplete?s=${filters.s}`)
                .then(res => setSuggestions(res.data))
                .catch(() => setSuggestions([]))
                .finally(() => setLoading(false));
            } else {
                setSuggestions([]);
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [filters.s]);
    
    return (
        <div className="xpo_relative">
            <input
                type="text"
                ref={inputRef}
                value={filters.s}
                onFocus={e => setShowList(true)}
                onBlur={e => setShowList(false)}
                placeholder={__('Search the web...')}
                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                onChange={e => setFilters(prev => ({...prev, s: e.target.value}))}
                className="xpo_w-full xpo_p-4 xpo_pl-12 xpo_pr-32 xpo_rounded-full xpo_border xpo_border-gray-300 xpo_shadow-inner xpo_text-lg focus:xpo_border-blue-500 xpo_outline-none"
            />
            {showList && suggestions.length > 0 && (
                <ul ref={listRef} className="xpo_absolute xpo_w-full xpo_max-w-3xl xpo_bg-white xpo_shadow xpo_rounded-md xpo_mt-2 xpo_text-left xpo_overflow-hidden">
                    {suggestions.map((item, idx) => (
                        <li key={idx} className="xpo_p-3 xpo_border-b xpo_border-gray-200 hover:xpo_bg-gray-50">
                            <Link to={`/search/${item}`} className="xpo_text-blue-600">{item}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}


export const AppsList = () => {
    const [apps, setApps] = useState([]);
    
    useEffect(() => {
    //   const delay = setTimeout(() => {
        setApps([
            {name: 'Meet', slug: 'meets', color: '#007E33', description: 'Real-time video meetings and conferencing.'},
            {name: 'Health', slug: 'healths', color: '#0284C7', description: 'Healthcare monitoring and wellness tools.'},
            {name: 'Tasks', slug: 'tasks', color: '#DC2626', description: 'Task management and personal productivity.'},
            {name: 'bStream', slug: 'bstream', color: '#B91C1C', description: 'Video streaming platform for creators.'},
            {name: 'AI', slug: 'ai', color: '#78350F', description: 'AI-powered tools and chat interfaces.'},
            {name: 'Mcp', slug: 'mcp', color: '#0F766E', description: 'Cloud Model context protocol for AI.'},
            {name: 'Agent', slug: 'agentika', color: '#0F766E', description: 'Agentic workspace driven by cloud ai.'},
            {name: 'Whatsapp', slug: 'whatsapp', color: '#075E54', description: 'Agentic whastapp bot application.'},
            {name: 'Crawler', slug: 'crawler', color: '#1D4ED8', description: 'Web Scraping crawler.'},
            {name: 'Docs', slug: 'docs', color: '#0F766E', description: 'Collaborative document editing and writing.'},
            {name: 'Sheets', slug: 'sheets', color: '#6D28D9', description: 'Spreadsheet creation and collaboration.'},
            {name: 'Drive', slug: 'drive', color: '#2563EB', description: 'Cloud storage and file sharing.'},
            {name: 'Mail', slug: 'mail', color: '#D97706', description: 'Email communication and inbox management.'},
            {name: 'Calendar', slug: 'calendar', color: '#BE123C', description: 'Event scheduling and reminders.'},
            {name: 'Photos', slug: 'photos', color: '#374151', description: 'Photo storage and visual memories.'},
            {name: 'News', slug: 'news', color: '#1D4ED8', description: 'Stay updated with latest headlines.'},
            {name: 'Ecommerce', slug: 'ecommerce', color: '#C2410C', description: 'Online shopping and digital marketplace.'},
            {name: 'Cloud', slug: 'cloud', color: '#0891B2', description: 'Cloud computing and app hosting.'},
            {name: 'Academy', slug: 'academy', color: '#0E7490', description: 'Learning resources and online courses.'},
            {name: 'Network', slug: 'network', color: '#047857', description: 'Social and professional networking.'}
        ]);
    //   }, 1000);
    //   return () => clearTimeout(delay);
    }, []);
    
    return (
        <div className="xpo_grid xpo_grid-cols-3 xpo_gap-4 xpo_p-4 xpo_w-72">
            {apps.map((app, index) => (
                <Link
                    key={index}
                    to={`/${app.slug}`}
                    className="xpo_flex xpo_flex-col xpo_items-center xpo_text-center xpo_space-y-2 hover:xpo_bg-gray-100 xpo_rounded-lg xpo_p-3 transition"
                >
                    <img
                        alt={app.name}
                        className="xpo_rounded-md"
                        // src={`https://placehold.co/64x64/${app.color.slice(1)}/ffffff?text=${app.name[0]}`}
                        src={`/image/generate?text=${app.name[0]}&width=64&height=64&bgColor=${app.color.slice(1)}&textColor=ffffff&format=svg`}
                    />
                    <span className="xpo_text-sm xpo_text-gray-700">{app.name}</span>
                </Link>
            ))}
        </div>
    );
}

export const ProfileBar = () => {
    const [loggedin, setLoggedin] = useState({
        name: 'Remal',
        email: 'bdcodehaxor@gmail.com',
        avatar: 'https://placehold.co/80x80/0EA5E9/ffffff?text=R',
    })

    if (!loggedin) return null;

    
    const ProfileItem = ({ icon, label, value, simple }) => (
        <div className={`xpo_flex xpo_items-center xpo_justify-between xpo_bg-white xpo_py-2 xpo_px-3 xpo_cursor-pointer xpo_rounded-lg xpo_shadow-sm ${simple ? 'xpo_text-sm' : 'xpo_text-base'} hover:xpo_bg-gray-50`}>
            <div className="xpo_flex xpo_items-center xpo_space-x-2">
                {icon}
                <span>{label}</span>
            </div>
            {value && <span className="xpo_text-xs xpo_text-gray-500">{value}</span>}
        </div>
    );

    return (
        <div className="xpo_w-80 xpo_bg-gray-100 xpo_rounded-2xl xpo_shadow-lg xpo_p-4 xpo_text-gray-800">
            <div className="xpo_flex xpo_justify-between xpo_items-center">
                <span className="xpo_text-sm">{loggedin.email}</span>
                <button className="xpo_text-xl xpo_font-light xpo_text-gray-500">×</button>
            </div>

            <div className="xpo_flex xpo_flex-col xpo_items-center xpo_my-4">
                <img
                    src={loggedin.avatar}
                    alt="Avatar"
                    className="xpo_w-20 xpo_h-20 xpo_rounded-full xpo_border xpo_border-white"
                />
                <p className="xpo_mt-2 xpo_text-lg xpo_font-medium">Hi, {loggedin.name}!</p>
                <button className="xpo_text-sm xpo_text-blue-600 xpo_mt-1 hover:xpo_underline">Manage your Account</button>
            </div>

            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-2 xpo_my-4">
                <button className="xpo_flex xpo_items-center xpo_justify-center xpo_bg-white xpo_py-2 xpo_rounded-lg xpo_shadow-sm hover:xpo_bg-gray-50">
                    <Plus size={16} className="xpo_mr-2" /> Add account
                </button>
                <button className="xpo_flex xpo_items-center xpo_justify-center xpo_bg-white xpo_py-2 xpo_rounded-lg xpo_shadow-sm hover:xpo_bg-gray-50">
                    <LogOut size={16} className="xpo_mr-2" /> Sign out
                </button>
            </div>

            <p className="xpo_text-xs xpo_text-gray-500 xpo_mb-2">More from Search</p>

            <div className="xpo_flex xpo_flex-col xpo_space-y-2">
                <ProfileItem icon={<Clock size={18} />} label="Search history" value="Saving" />
                <ProfileItem icon={<Trash2 size={18} />} label="Delete last 15 minutes" />
                <ProfileItem icon={<Bookmark size={18} />} label="Saves & Collections" />
                <ProfileItem icon={<SlidersHorizontal size={18} />} label="Search personalization" />
                <ProfileItem icon={<ShieldCheck size={18} />} label="SafeSearch" value="Blurring on" />
                <ProfileItem icon={<Globe size={18} />} label="Language" value="English" />
            </div>

            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-2 xpo_mt-4">
                <ProfileItem icon={<Settings size={18} />} label="More settings" simple />
                <ProfileItem icon={<HelpCircle size={18} />} label="Help" simple />
            </div>
        </div>
    );
};

export const NavMenu = () => {
    return (
        <header className="xpo_w-full xpo_flex xpo_justify-between xpo_items-center xpo_px-6 xpo_py-4">
            <div className="xpo_text-xl xpo_font-semibold">{__('Banglee')}</div>
            <div className="xpo_flex xpo_items-center xpo_space-x-4">
                <Dropdown button={(<button className="xpo_text-sm hover:xpo_underline">{__('Apps')}</button>)}>
                    <AppsList />
                </Dropdown>
                <Dropdown button={(<div className="xpo_w-8 xpo_h-8 xpo_rounded-full xpo_bg-gray-300 xpo_cursor-pointer" />)}>
                    <ProfileBar />
                </Dropdown>
            </div>
        </header>
    )
}

export const home_route = (namespace, path = null) => {
    if (!path) return `/${namespace}`;
    path = path.substring(0, 1) == '/' ? path.substring(1) : path;
    return `/${namespace}/${path}`;
}