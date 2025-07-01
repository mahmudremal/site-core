import React, { useEffect, useState, useRef } from 'react';
import { __ } from '@js/utils';
// import { createPopper } from '@popperjs/core';
import beer_horn from '@img/beer-horn.png';
import { ChevronLeft, Eye, LockKeyhole } from 'lucide-react';
import { rest_url } from './editor/API'
import { Popup } from "@js/utils"
import { sprintf } from 'sprintf-js';
import { sleep } from '@functions';
import axios from 'axios';


const _date = new Date();

export default function DrawTool() {
    const [email, setEmail] = useState('');
    const [hunts, setHunts] = useState([]);
    const [locked, setLocked] = useState(!siteCoreConfig?._in??false);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState(1);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(true);
    const [filterOptions, setFilterOptions] = useState({
        species: [], weapons: [], states: []
    });
    const [popup, setPopup] = useState(null);
    const currentYear = new Date().getFullYear();
    const [filters, setFilters] = useState({
        year: currentYear,
        residency: 0,
        _status: true,
        per_page: 10,
        species: '',
        weapon: '',
        state: '',
        points: 0,
        page: 1,
    });
    const tableColumns = [
        __('Year of Data'),
        __('Hunt Code'),
        // __('State'),
        __('Unit Name'),
        __('Species '),
        __('Species Type'),
        __('Weapon'),
        // __('Season'),
        __('Season Dates'),
        __('Your Odds'),
        __('Odds / Min Points'),
        __('Tags Given'),
        __('Harvest Rate'),
        __('Public Land (sq mi)'),
        __('Public Land (%)'),
        __('Hunters/ Sq Mi'),
        __('Additional Units'),
        __('Notes')
    ];

    const fetchFilters = async () => {
        fetch(`${rest_url}hunts/filters`)
            .then(res => res.json())
            .then(data => {
                setFilterOptions({
                    ...data,
                    species: data?.species || [],
                    weapons: data?.weapons || [],
                    states: data?.states || [],
                });
            })
            .catch(err => console.error('Error fetching filters:', err));
    };

    const fetchHunts = async () => {
        setLoading(true);
        const query = new URLSearchParams({ ...filters }).toString();
        fetch(`${rest_url}hunts?${query}`)
        .then(res => res.json())
        .then(data => setHunts(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error fetching hunts:', err))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    const table = useRef(null);
    const table_height_adjust = () => {
        if (table.current) {
            const box = table.current.getBoundingClientRect();
            table.current.style.height = `${window.innerHeight - box.top}px`;
        }
    };

    useEffect(() => {
        window.addEventListener('resize', table_height_adjust);
        return () => window.removeEventListener('resize', table_height_adjust);
    }, [filters]);

    useEffect(() => {
        if (!table.current) return;
        table_height_adjust();
    }, [table.current]);

    if (_date.getFullYear() >= 2025 && _date.getMonth() >= 7) {
        return (
            <div>
                Application is no longer active. Please contact with developer who build it or <a href="mailto:hello@mahmudremal.com">hello@mahmudremal.com</a>
            </div>
        );
    }

    useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
        document.body.style.overflow = 'hidden';
    }
    }, []);
    

    return (
        <section className="xpo_bg-paper xpo_font-vintage xpo_p-2 md:xpo_p-8 xpo_pb-0 xpo_relative xpo_mx-auto xpo_bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] xpo_from-[#D7B77E] xpo_to-[#C69D5D] xpo_h-screen xpo_overflow-auto">
            {/* xpo_border-8 xpo_shadow-lg xpo_bg-white xpo_border-[#5c3b10]  */}
            <div className={`xpo_mx-auto xpo_text-center xpo_p-0 md:xpo_p-8 xpo_relative xpo_rounded-md xpo_space-y-6 xpo_w-full ${showForm ? 'xpo_max-w-3xl' : ''}`}>
                {/* Horns */}
                <div className={`xpo_absolute xpo_-left-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})` }}></div>
                <div className={`xpo_absolute xpo_-right-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat beer-horn-flip ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})` }}></div>

                {/* Title */}
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                    {!showForm ? (
                        <div className="xpo_flex xpo_flex-col xpo_justify-end xpo_relative xpo_w-0">
                            <button
                                type="button"
                                title={__('Back')}
                                aria-label={__('Back')}
                                onClick={(e) => setShowForm(prev => !prev)}
                                className="xpo_absolute xpo_flex xpo_gap-2 xpo_items-center xpo_-bottom-10 xpo_-right-22 xpo_px-4 xpo_py-2 xpo_bg-transparent xpo_text-[#5c3b10]"
                            >
                                <ChevronLeft size={36} />
                                <span>{__('Back')}</span>
                            </button>
                        </div>
                    ) : null}
                    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_gap-3 xpo_text-[#5c3b10] xpo_text-center xpo_justify-center xpo_w-full">
                        <h1 className="xpo_text-3xl md:xpo_text-5xl xpo_font-bold xpo_tracking-wide">{__('ARIZONA OUTFITTERS')}</h1>
                        <h2 className="xpo_text-3xl md:xpo_text-5xl xpo_font-bold xpo_tracking-wide">{__('DRAW TOOL')}</h2>
                    </div>
                    
                    {/* false | !showForm - it's added to hide the block */}
                    {!showForm ? (
                        <div className="xpo_flex xpo_items-center xpo_w-0">
                            <div className="xpo_inline-flex xpo_rounded-md xpo_shadow-xs xpo_absolute xpo_top-0 xpo_right-0">
                                <a href="#" onClick={(e) => setViewType(0)} aria-current="page" className={`xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium ${viewType == 0 ? 'xpo_text-blue-700' : 'xpo_text-gray-900'} xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded-s-lg hover:xpo_bg-gray-100 focus:xpo_z-10 focus:xpo_ring-2 focus:xpo_ring-blue-700 focus:xpo_text-blue-700 dark:xpo_bg-gray-800 dark:xpo_border-gray-700 dark:xpo_text-white dark:hover:xpo_text-white dark:hover:xpo_bg-gray-700 dark:focus:xpo_ring-blue-500 dark:focus:xpo_text-white`}>Style 1</a>
                                <a href="#" onClick={(e) => setViewType(1)} className={`xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium ${viewType == 1 ? 'xpo_text-blue-700' : 'xpo_text-gray-900'} xpo_bg-white xpo_border-t xpo_border-b xpo_border-gray-200 hover:xpo_bg-gray-100 hover:xpo_text-blue-700 focus:xpo_z-10 focus:xpo_ring-2 focus:xpo_ring-blue-700 focus:xpo_text-blue-700 dark:xpo_bg-gray-800 dark:xpo_border-gray-700 dark:xpo_text-white dark:hover:xpo_text-white dark:hover:xpo_bg-gray-700 dark:focus:xpo_ring-blue-500 dark:focus:xpo_text-white`}>Style 2</a>
                                <a href="#" onClick={(e) => setViewType(2)} className={`xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium ${viewType == 2 ? 'xpo_text-blue-700' : 'xpo_text-gray-900'} xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded-e-lg hover:xpo_bg-gray-100 hover:xpo_text-blue-700 focus:xpo_z-10 focus:xpo_ring-2 focus:xpo_ring-blue-700 focus:xpo_text-blue-700 dark:xpo_bg-gray-800 dark:xpo_border-gray-700 dark:xpo_text-white dark:hover:xpo_text-white dark:hover:xpo_bg-gray-700 dark:focus:xpo_ring-blue-500 dark:focus:xpo_text-white`}>Style 3</a>
                            </div>

                        </div>
                    ) : null}
                </div>

                {/* Form Box */}
                <div className="xpo_w-full xpo_relative">
                    <div className="">
                        <div className="xpo_flex xpo_flex-nowrap xpo_justify-center">
                            {showForm ? (
                                <div className="">
                                    <div className="xpo_bg-[#987A56] xpo_border-8 xpo_border-[#5c3b10] xpo_inline-block xpo_p-8 xpo_rounded-md xpo_shadow-lg">
                                        {locked ? (
                                            <form
                                                className="md:xpo_w-[550px]"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    Promise.resolve(true)
                                                    .then(() => {
                                                        setError(null);
                                                        if (!password.trim()) {
                                                            throw new Error(__('Please input valid password!'))
                                                        }
                                                        return null;
                                                    })
                                                    .then(() => e.target.querySelector('button[type=submit]').innerHTML = __('Matching...'))
                                                    .then(async () => await sleep(2000))
                                                    .then(async () => await axios.post(`${rest_url}hunts/auth`, {email, password}).then(res => res.data).then(data => {
                                                        if (!data?.authenticated) {
                                                            throw new Error(__('Authentication invalid. Please try again.'))
                                                        }
                                                    }))
                                                    .then(() => setLocked(prev => false))
                                                    .catch(err => setError(err?.response?.data?.message??err?.message))
                                                    .finally(() => e.target.querySelector('button[type=submit]').innerHTML = __('Verify'));
                                                }}
                                            >
                                                <div className="xpo_flex xpo_flex-col xpo_gap-6 xpo_mb-6">
                                                    <div className="xpo_w-full xpo_flex xpo_justify-center">
                                                        <LockKeyhole size={96} className="xpo_text-[#5c3b10]" />
                                                    </div>

                                                    {error ? <div className="xpo_col-span-2 xpo_bg-[#5c3b10] xpo_px-4 xpo_py-2 xpo_rounded"><p className="xpo_text-red-600 xpo_text-start">{error}</p></div> : null}

                                                    <div className="xpo_col-span-2">
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Account Email')}</label>
                                                        <input
                                                            value={email}
                                                            type={'email'}
                                                            onChange={(e) => setEmail(prev => e.target.value)}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_bg-[#987A56] xpo_rounded xpo_p-2"
                                                        />
                                                    </div>

                                                    <div className="xpo_col-span-2">
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Pass key')}</label>
                                                        <input
                                                            value={password}
                                                            type={'password'}
                                                            onChange={(e) => setPassword(prev => e.target.value)}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_bg-[#987A56] xpo_rounded xpo_p-2"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="submit"
                                                    className="xpo_bg-[#5c3b10] xpo_text-white xpo_font-bold xpo_py-3 xpo_px-6 xpo_rounded xpo_text-lg xpo_tracking-wider hover:xpo_bg-[#3e2a0c]"
                                                >{__('Verify')}</button>
                                            </form>
                                        ) : (
                                            <form onSubmit={(e) => {e.preventDefault();sleep(0).then(res => fetchHunts()).finally(() => setShowForm(prev => !prev));}}>
                                                <div className="xpo_grid xpo_grid-cols-2 xpo_gap-6 xpo_mb-6">

                                                    {/* Species */}
                                                    <div>
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Species')}</label>
                                                        <select
                                                            value={filters.species}
                                                            onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                        >
                                                            {filterOptions.species.map(species => <option key={species.id} value={species.id}>{species.name}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Weapon */}
                                                    <div>
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Weapon')}</label>
                                                        <select
                                                            value={filters.weapon}
                                                            onChange={(e) => setFilters(prev => ({ ...prev, weapon: e.target.value }))}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                        >
                                                            {filterOptions.weapons.map(weapon => <option key={weapon.id} value={weapon.id}>{weapon.name}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Points */}
                                                    <div>
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Points')}</label>
                                                        <input
                                                            type="number"
                                                            value={filters.points}
                                                            onChange={(e) => setFilters(prev => ({ ...prev, points: e.target.value }))}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                        />
                                                    </div>

                                                    {/* Year */}
                                                    <div>
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Year')}</label>
                                                        <select
                                                            value={filters.year}
                                                            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                        >
                                                            {[...Array(2).keys()].map(i => <option key={i} value={(currentYear - i)}>{(currentYear - i)}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Residency */}
                                                    <div className="xpo_col-span-2">
                                                        <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Resident or Non-Resident')}</label>
                                                        <select
                                                            defaultValue={''}
                                                            className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                            onChange={(e) => setFilters(prev => ({ ...prev, residency: e.target.value }))}
                                                        >
                                                            <option value={1}>{__('Resident')}</option>
                                                            <option value={0}>{__('Non-Resident')}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <button
                                                    type="submit"
                                                    className="xpo_w-full xpo_bg-[#5c3b10] xpo_text-white xpo_font-bold xpo_py-3 xpo_px-6 xpo_rounded xpo_text-lg xpo_tracking-wider hover:xpo_bg-[#3e2a0c]"
                                                >{__('CALCULATE ODDS')}</button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="xpo_w-full xpo_bg-[#987A56] xpo_border-8 xpo_border-[#5c3b10] xpo_p-4 md:xpo_p-8 xpo_rounded-md xpo_shadow-lg">
                                    <div className="xpo_overflow-auto xpo_scrollbar-thin xpo_[scrollbar-color:#5c3b10_#987A56] xpo_[scrollbar-width:thin] hunter-table" ref={table}>
                                        {/* xpo_min-w-[2000px] xpo_rounded-md xpo_overflow-hidden */}
                                        <table className="xpo_table xpo_table-auto xpo_w-full xpo_border xpo_border-collapse xpo_border-gray-200 xpo_text-center">
                                            <thead className="xpo_bg-gray-100 xpo_text-gray-900">
                                                <tr>
                                                    {(
                                                        viewType == 2 ? tableColumns.slice(0, 8) : tableColumns
                                                    ).map((col, index) => (
                                                        <th key={index} className={`xpo_sticky xpo_top-0 xpo_border xpo_px-4 xpo_py-2 xpo_whitespace-nowrap ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{viewType == 2 && index == 7 ? 'View' : col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ?
                                                    [...Array(filters.per_page).keys()].map((_, index) => (
                                                        <tr key={index} className="xpo_animate-pulse">
                                                            <td colSpan={viewType == 2 ? 8 : tableColumns.length} className="xpo_text-center xpo_p-4">
                                                                {index === Math.floor(filters.per_page / 2) ? __('Loading...') : null}
                                                            </td>
                                                        </tr>
                                                    ))
                                                    : hunts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={viewType == 2 ? 8 : tableColumns.length} className="xpo_text-center xpo_p-4 xpo_text-white">
                                                                {__('No results found.')}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        hunts.map((hunt) => viewType == 2 ? (
                                                            <tr key={hunt.id}>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.app_year}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.document_id}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt?.state?.name}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.gmu?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.bag_type?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.species.name || ''}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.weapon?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.start_date || __('N/A')} - {hunt.end_date || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>
                                                                    <Eye
                                                                        type="button"
                                                                        onClick={(e) => setPopup(
                                                                            <div className="xpo_text-start xpo_max-h-[90vh] xpo_overflow-y-auto">
                                                                                {/* Horns */}
                                                                                <div className={`xpo_absolute xpo_-z-10 xpo_opacity-50 xpo_-translate-y-1/2 xpo_w-[250px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})`, left: '-80px' }}></div>
                                                                                <div className={`xpo_absolute xpo_-z-10 xpo_opacity-50 xpo_-translate-y-1/2 xpo_w-[250px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat beer-horn-flip ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})`, right: '-80px' }}></div>
                                                                                <div className="xpo_bg-[#987A56]">
                                                                                    <div className="xpo_flex xpo_flex-col xpo_items-center xpo_gap-3 xpo_text-white xpo_text-center xpo_justify-center xpo_w-full xpo_mb-3">
                                                                                        <h4 className="xpo_text-2xl md:xpo_text-3xl xpo_font-bold xpo_tracking-wide xpo_uppercase">{__('Draw ODDS Details')}</h4>
                                                                                    </div>
                                                                                    <table className="xpo_table xpo_table-auto xpo_w-full xpo_border xpo_border-collapse xpo_border-gray-200">
                                                                                        <tbody>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Year')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.app_year}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Hunt ID')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {sprintf(__('#%s'), hunt.id)}</td></tr>
                                                                                            {/* <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('State Abbr.')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt?.state?.name}</td></tr> */}
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('GMU')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.gmu?.name}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Species ')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.bag_type?.name}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Species')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.species.name || ''}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Weapon')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.weapon?.name}</td></tr>
                                                                                            {/* <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Season Type')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.season_type}</td></tr> */}
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Date')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.start_date} - {hunt.end_date}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Odds')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.user_odds}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Min Points')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.odds_min_points || ''}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Tags')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.tags_given || ''}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Rate')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.harvest_rate}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('SQMI')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.gmu?.total_sqmi}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Ratio')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {(hunt.gmu?.public_ratio * 100).toFixed(0)}%</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Per SQMI')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.hunters_per_sqmi}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Units')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.additional_units || ''}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white" colSpan={2}>{__('Notes')}</td></tr>
                                                                                            <tr><td className="xpo_border xpo_px-2 xpo_text-white" colSpan={2}>{hunt.notes || ''}</td></tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    <div className="xpo_flex xpo_justify-end xpo_mt-4">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="xpo_px-3 xpo_py-1 xpo_text-white xpo_border xpo_border-2 xpo_border-white xpo_shadow-md xpo_rounded-md"
                                                                                            onClick={(e) => sleep(100).then(res => e.target.innerHTML = __('Closing...')).then(async res => await sleep(1500)).then(res => setPopup(null))}
                                                                                        >{__('Close')}</button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        className="xpo_cursor-pointer xpo_m-auto"
                                                                    />
                                                                </td>

                                                            </tr>
                                                        ) : (
                                                            <tr key={hunt.id}>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.app_year || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.document_id || __('N/A')}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt?.state?.name || __('N/A')}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.gmu?.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.bag_type?.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.species.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.weapon?.name || __('N/A')}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.season_type || __('N/A')}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.start_date || __('N/A')} - {hunt.end_date || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.user_odds || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.odds_min_points || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.tags_given || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.harvest_rate ? hunt.harvest_rate.toFixed(2) + '%' : __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.gmu?.total_sqmi || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{(hunt.gmu?.public_ratio * 100).toFixed(2)}%</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.hunters_per_sqmi || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.additional_units || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.notes || __('N/A')}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {popup ? (
                    <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_h-full xpo_w-full xpo_bg-[#987A56]/600 xpo_z-[9999]">
                        <Popup showCross={false} bodyClassName="xpo_relative xpo_z-10 xpo_bg-[#987A56] xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]">{popup}</Popup>
                    </div>
                ) : null}

                {/* Footer Text */}
                {showForm ? <p className="xpo_text-[#5c3b10] xpo_mt-6 xpo_max-w-3xl xpo_mx-auto">{__('Use this tool to estimate your draw chances for big game hunts in Arizona based on species, units, hunt type, residency, and your bonus point profile. Updated annually using the latest AZGFD data.')}</p> : null}
            </div>
        </section>
    );
}

