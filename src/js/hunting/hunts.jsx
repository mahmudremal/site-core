import React, { useEffect, useState, useRef } from 'react';
import { __ } from '@js/utils';
// import { createPopper } from '@popperjs/core';
import beer_horn from '@img/beer-horn.png';
import { ChevronLeft, CircleUser, Eye, LockKeyhole, ChevronDown, X } from 'lucide-react';
import { rest_url } from './editor/API'
import { Popup } from "@js/utils"
import { sprintf } from 'sprintf-js';
import { sleep, strtotime } from '@functions';
import axios from 'axios';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRange } from 'react-date-range';

import { Dropdown } from '@banglee/core';

import InlineIcons from './icons';


function MyDateRange({ onChange }) {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  return (
    <DateRange
      months={2}
      ranges={dateRange}
      direction="horizontal"
      onChange={item => {
        onChange(item.selection);
        setDateRange([item.selection]);
      }}
      showSelectionPreview={true}
      moveRangeOnFirstSelection={false}
      preventSnapRefocus={true}
    />
  );
}

const _date = new Date();

const currentYear = new Date().getFullYear();
const defFilters = {
    year: currentYear,
    is_resident: -1,
    per_page: 50,
    species: '',
    _status: 1,
    weapon: '',
    state: '',
    points: 0,
    units: '',
    page: 1,
};

export default function DrawTool() {
    const [email, setEmail] = useState('');
    const [hunts, setHunts] = useState([]);
    const [locked, setLocked] = useState(!siteCoreConfig?._in??false);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState(1);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterStyle, setFilterStyle] = useState(1);
    const [filterOptions, setFilterOptions] = useState({
        species: [], weapons: [], states: [], years: [], units: []
    });
    const [popup, setPopup] = useState(null);
    const [filters, setFilters] = useState(defFilters);
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const tableColumns = [
        // __('Year of Data'),
        __('Hunt Code'),
        // __('State'),
        __('Unit Name'),
        __('Species Type'),
        __('Species '),
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
            const { years = [] } = data;
            const _years = years.map(r => r.app_year);
            setFilterOptions({
                ...data,
                species: data?.species || [],
                weapons: data?.weapons || [],
                states: data?.states || [],
                years: _years,
            });
            defFilters.state = data.states.find(i => i?.abbreviation == 'AZ')?.id??defFilters.state;
            setFilters(prev => ({
                ...prev,
                year: _years?.[0]??prev.year,
                state: data.states.find(i => i?.abbreviation == 'AZ')?.id??''
            }));
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
        const delay = setTimeout(() => {
            fetchHunts();
        }, 1000);
        return () => clearTimeout(delay);
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
        // 
        return () => document.body.style.overflow = 'hidden';
    }, []);
    

    if (false) {
        return (
            <div class="xpo_h-screen xpo_w-screen xpo-flex xpo_justify-center xpo_content-center">
                <div className="xpo_max-w-md xpo_mx-auto xpo_bg-white xpo_rounded-lg xpo_shadow-md xpo_p-8 xpo_text-center xpo_relative">
                    <h2 className="xpo_text-2xl xpo_font-bold xpo_text-green-800 xpo_mb-4">
                        {__('Restricted Access')}
                    </h2>
                    <p className="xpo_text-green-700 xpo_mb-6">
                        {__('The Arizona Outfitters Draw Odds Tool is only available to members. Sign up for Membership to get full access instantly!')}
                    </p>
                    <button type="button" className="xpo_bg-blue-500 hover:xpo_bg-blue-600 xpo_text-white xpo_px-6 xpo_py-2 xpo_rounded xpo_inline-flex xpo_items-center xpo_gap-2 xpo_mx-auto xpo_mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="xpo_h-5 xpo_w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14v7m-4-4h8" />
                        </svg>
                        {__('Sign Up')}
                    </button>
                    <p className="xpo_text-sm xpo_text-gray-700 xpo_mb-6">
                        {__('Already an ALL PAID HUNT ARIZONA Member?')}{" "}
                        <a href="#" className="xpo_text-blue-600 hover:xpo_underline">
                        {__('Log in here.')}
                        </a>
                    </p>

                    <div className="xpo_text-left">
                        <h3 className="xpo_font-semibold xpo_text-green-900 xpo_mb-2">{__('Membership Benefits Include')}</h3>
                        <ul className="xpo_list-disc xpo_list-inside xpo_text-green-800 xpo_space-y-1">
                            <li>{__('Real-time draw odds calculations')}</li>
                            <li>{__('Historical trends and charts')}</li>
                            <li>{__('Expert hunting insights')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    

    return (
        <section className={`xpo_bg-paper xpo_font-vintage xpo_pb-0 xpo_pb-2 md:xpo_pb-4 xpo_relative xpo_mx-auto xpo_bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] xpo_from-[#D7B77E] xpo_to-[#C69D5D] ${showForm ? 'xpo_h-screen xpo_overflow-y-auto' : ''}`}>
            {/* xpo_border-8 xpo_shadow-lg xpo_bg-white xpo_border-[#5c3b10]  */}
            {filterStyle == 1 ? (
                <div>
                    <div className="xpo_flex xpo_flex-col">
                        <div className="xpo_grid xpo_grid-cols-[1fr_1fr_1fr] xpo_items-center xpo_space-x-4 xpo_p-3 xpo_border-bottom xpo_border-b-2 xpo_border-solid">
                            <div className="xpo_flex xpo_items-center xpo_space-x-4">
                                <span className="xpo_font-semibold xpo_text-xl">{__('Draw research tools')}</span>
                            </div>
                            <div className="xpo_flex xpo_space-x-2">
                                <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_bg-white xpo_shadow-lg xpo_p-3 xpo_rounded-lg">

                                    <Dropdown button={(<button type="button" placement="bottom-start" className="xpo_bg-gray-100 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm xpo_cursor-not-allowed">{sprintf(__('What? %s'), filterOptions.species.find(i => i.id == filters.species)?.name??__('Choose Species'))}</button>)}>
                                        <div className="xpo_p-2 md:xpo_p-3 xpo_flex xpo_flex-col xpo_min-w-[300px] md:xpo_min-w-[500px]">
                                            <div className="xpo_mb-4 xpo_space-y-3">
                                                <h5>{__('Select Species')}</h5>
                                                <span type="button" className="xpo_cursor-pointer xpo_text-start xpo_text-sm" onClick={e => setFilters(prev => ({...prev, species: ''}))}>{__('Clear Selection')}</span>
                                            </div>
                                            <div className="xpo_grid xpo_gap-2 xpo_grid-cols-3 md:xpo_grid-cols-4 xpo_leading-none">
                                                {filterOptions.species.map((s, i) => (
                                                    <div
                                                        key={i}
                                                        className={`xpo_flex xpo_flex-col xpo_cursor-pointer xpo_justify-center xpo_items-center xpo_text-center xpo_gap-2 xpo_p-2 xpo_rounded-md ${filters.species == s.id ? 'xpo_bg-[#987A56] xpo_text-white' : 'xpo_text-[#987A56]'}`}
                                                        onClick={e => setFilters(prev => ({...prev, species: s.id}))}
                                                    >
                                                        <svg width="30px" height="42px"><use xlinkHref={`#${s.name.replaceAll(' ', '-').toLowerCase()}`}></use></svg>
                                                        <span>{s.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Dropdown>
                                    <div className="xpo_relative">
                                        <button type="button" className="xpo_bg-gray-100 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm xpo_cursor-not-allowed">{sprintf(__('Where? %s'), filterOptions.states.find(i => i.id == filters.state)?.name??__('Choose States'))}</button>
                                    </div>
                                    <Dropdown button={(<button type="button" placement="bottom-end" className="xpo_bg-gray-100 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm xpo_cursor-not-allowed">{sprintf(__('How? %s'), filterOptions.weapons.find(i => i.id == filters.weapon)?.name??__('Choose Weapons'))}</button>)}>
                                        <div className="xpo_p-2 md:xpo_p-3 xpo_flex xpo_flex-col xpo_min-w-[300px] md:xpo_min-w-[500px]">
                                            <div className="xpo_mb-4 xpo_space-y-3">
                                                <h5>{__('Select Weapons')}</h5>
                                                <span type="button" className="xpo_cursor-pointer xpo_text-start xpo_text-sm" onClick={e => setFilters(prev => ({...prev, weapon: ''}))}>{__('Clear Selection')}</span>
                                            </div>
                                            <div className="xpo_grid xpo_gap-2 xpo_grid-cols-2 md:xpo_grid-cols-3 xpo_leading-none">
                                                {filterOptions.weapons.map((s, i) => (
                                                    <div
                                                        key={i}
                                                        className={`xpo_flex xpo_flex-col xpo_cursor-pointer xpo_justify-center xpo_items-center xpo_text-center xpo_gap-2 xpo_p-2 xpo_rounded-md ${filters.weapon.split(',').includes(s.id) ? 'xpo_bg-[#987A56] xpo_text-white' : 'xpo_text-[#987A56]'}`}
                                                        onClick={e => setFilters(prev => {
                                                            const prevs = prev.weapon.split(',').filter(i => i);
                                                            if (prevs.includes(s.id)) {
                                                                return {...prev, weapon: prevs.filter(i => i != s.id).join(',')};
                                                            }
                                                            prevs.push(s.id);
                                                            return {...prev, weapon: prevs.join(',')};
                                                        })}
                                                    >
                                                        <svg width="30px" height="42px"><use xlinkHref={`#${s.name.replaceAll(' ', '-').toLowerCase()}`}></use></svg>
                                                        <span>{s.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </Dropdown>
                                    
                                </div>
                                <span type="button" className="xpo_text-gray-500 xpo_underline xpo_flex xpo_items-center xpo_gap-2 xpo_cursor-pointer xpo_text-sm xpo_lowercase"
                                onClick={e => setFilters(prev => defFilters)}
                                >{__('Clear')}</span>
                            </div>
                            <div className="xpo_flex xpo_items-center xpo_justify-end">
                                {siteCoreConfig?.profiledash ? (
                                    <a target="_blank" title={__('View profile dashboard')} href={siteCoreConfig?.profiledash || '#'} className="xpo_flex xpo_gap-3 xpo_p-2 xpo_items-center xpo_rounded-lg xpo_border-2 xpo_border-gray-300">
                                        <CircleUser size="32" color="white" />
                                    </a>
                                ) : null}
                            </div>
                        </div>
                        <div className="xpo_p-4 xpo_space-y-3">
                            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_space-x-4">
                                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_space-x-4">
                                    <button
                                        onClick={e => setPopup(
                                            <div>
                                                <div className="xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center xpo_bg-black xpo_bg-opacity-40">
                                                    <div className="xpo_bg-white xpo_rounded-md xpo_shadow-lg xpo_max-h-[80vh] xpo_flex xpo_flex-col">
                                                        <div className="xpo_flex xpo_items-center xpo_justify-center xpo_relative xpo_border-b xpo_px-6 xpo_py-3">
                                                            <h2 className="xpo_font-semibold xpo_text-lg">Search By Unit</h2>
                                                            <X size={24} type="button" onClick={e => setPopup(null)} className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_z-10 xpo_cursor-pointer" />
                                                        </div>

                                                        <div className="xpo_overflow-y-auto xpo_px-6 xpo_py-4 xpo_flex-1">
                                                            <p className="xpo_font-semibold xpo_mb-3">{filterOptions.states.find(i => i.id == filters.state)?.name??__('Arizona')}</p>
                                                            <p className="xpo_mb-6 xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-700">🐾 {filterOptions.species.slice(0, 5).map(s => `${s.name} `)}</p>

                                                            <div className="xpo_grid xpo_grid-cols-4 xpo_gap-y-3 xpo_gap-x-6 xpo_text-gray-800">
                                                                {filterOptions.units.map((u, i) => (
                                                                    <label key={i} className="xpo_flex xpo_items-center xpo_space-x-2 xpo_cursor-pointer xpo_select-none">
                                                                        <input type="checkbox" className="xpo_accent-primary-400 xpo_cursor-pointer" checked={filters.units.split(',').find(unit => unit == u.name)} onChange={e => setFilters(prev => ({...prev, units: e.target.checked ? [...prev.units.split(',').filter(i => i), u.name].join(',') : prev.units.split(',').filter(i => i).filter(unit => unit != u.name).join(',')}))} />
                                                                        <span>{u.name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="xpo_flex xpo_justify-end xpo_items-center xpo_gap-8 xpo_p-4 xpo_border-t">
                                                            <button type="button" onClick={e => setFilters(prev => ({...prev, units: ''}))} className="xpo_text-black xpo_font-bold hover:xpo_underline">{__('Clear')}</button>
                                                            <button
                                                                type="button"
                                                                disabled={false}
                                                                className={`xpo_px-5 xpo_py-2 xpo_rounded xpo_text-white xpo_font-bold ${false ? "xpo_bg-primary-200 xpo_cursor-not-allowed" : "xpo_bg-primary-400 hover:xpo_bg-primary-500"}`}
                                                                onClick={e => setPopup(null)}
                                                            >{__('Apply')}</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        className="xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm"
                                    >
                                        {__('Search By Unit')}
                                    </button>
                                    <button
                                        className="xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm"
                                        onClick={e => setPopup(
<div className="xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center xpo_bg-black xpo_bg-opacity-40">
  <div className="xpo_bg-white xpo_rounded-md xpo_shadow-lg xpo_w-full xpo_max-w-3xl xpo_max-h-[95vh] xpo_overflow-hidden xpo_overflow-y-auto xpo_flex xpo_flex-col">
    <div className="xpo_flex xpo_justify-center xpo_items-center xpo_relative xpo_border-b xpo_py-4">
      <span className="xpo_text-lg xpo_font-semibold">{__('Filters')}</span>
      <X size={24} type="button" onClick={e => setPopup(null)} className="xpo_absolute xpo_top-2 xpo_right-2 xpo_z-10 xpo_cursor-pointer" />
    </div>

    <div className="xpo_p-6 xpo_space-y-8 xpo_flex-1">
      <div>
        <div className="xpo_text-sm xpo_mb-2 xpo_font-medium">{__('Season Dates')}</div>
        <div className="xpo_overflow-x-auto">
            <MyDateRange onChange={val => setFilters(prev => ({...prev, date_range: val.startDate.toDateString() +' to '+ val.endDate.toDateString()}))} />
        </div>
        
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4 xpo_hidden">
          <div>
            <div className="xpo_text-xs xpo_font-semibold">{__('Planned hunting dates')}</div>
            <div className="xpo_text-xs xpo_text-gray-500">
              {__('Includes hunts that historically occurred within ±12 days of the selected range')}
            </div>
          </div>
          
          <button className="xpo_flex xpo_items-center xpo_bg-gray-100 xpo_rounded xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-500 xpo_border xpo_border-gray-200">
            <span className="xpo_mr-2">📅</span> {__('Date range')}
          </button>
        </div>
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-6 xpo_hidden">
          <div>
            <div className="xpo_text-xs xpo_font-semibold">{__('Rut Activity')}</div>
            <div className="xpo_text-xs xpo_text-gray-500">
              {__('Show tags where season dates align with peak rut timing')}
            </div>
          </div>
          <div className="xpo_relative">
            <input type="checkbox" className="xpo_sr-only" />
            <div className="xpo_block xpo_w-10 xpo_h-6 xpo_rounded-full xpo_bg-gray-200"></div>
            <div className="xpo_absolute xpo_left-1 xpo_top-1 xpo_bg-white xpo_w-4 xpo_h-4 xpo_rounded-full xpo_shadow"></div>
          </div>
        </div>
      </div>

      <div className="xpo_hidden">
        <div className="xpo_text-sm xpo_mb-2 xpo_font-medium">Species Sex</div>
        <div className="xpo_flex xpo_space-x-6 xpo_mb-1 xpo_flex-wrap">
          <label className="xpo_flex xpo_items-center xpo_space-x-1">
            <input type="radio" name="species_sex" defaultChecked className="xpo_accent-black"/>
            <span className="xpo_font-semibold">All Sexes</span>
            <span className="xpo_text-xs xpo_text-gray-500">Show all tags</span>
          </label>
          <label className="xpo_flex xpo_items-center xpo_space-x-1">
            <input type="radio" name="species_sex" className="xpo_accent-black"/>
            <span className="xpo_font-semibold">Male Tags</span>
            <span className="xpo_text-xs xpo_text-gray-500">Shows only tags that include males</span>
          </label>
          <label className="xpo_flex xpo_items-center xpo_space-x-1">
            <input type="radio" name="species_sex" className="xpo_accent-black"/>
            <span className="xpo_font-semibold">Female Tags</span>
            <span className="xpo_text-xs xpo_text-gray-500">Show only tags that include females</span>
          </label>
          <label className="xpo_flex xpo_items-center xpo_space-x-1">
            <input type="radio" name="species_sex" className="xpo_accent-black"/>
            <span className="xpo_font-semibold">Either Sex Only</span>
            <span className="xpo_text-xs xpo_text-gray-500">Shows only either sex tags</span>
          </label>
        </div>
      </div>

      <div className="xpo_hidden">
        <div className="xpo_text-sm xpo_mb-2 xpo_font-medium">Special Hunt Options</div>
        
        <div className="xpo_flex xpo_items-center xpo_mb-4">
          <label className="xpo_mr-2 xpo_text-xs xpo_font-semibold">Veteran Hunts</label>
          <div className="xpo_flex xpo_items-center xpo_space-x-6">
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="veteran_hunt" defaultChecked className="xpo_accent-black"/>
              <span>Include</span>
            </label>
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="veteran_hunt" className="xpo_accent-black"/>
              <span>Exclude</span>
            </label>
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="veteran_hunt" className="xpo_accent-black"/>
              <span>Show Only</span>
            </label>
          </div>
        </div>

        <div className="xpo_flex xpo_items-center">
          <label className="xpo_mr-2 xpo_text-xs xpo_font-semibold">Youth Hunts</label>
          <div className="xpo_flex xpo_items-center xpo_space-x-6">
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="youth_hunt" defaultChecked className="xpo_accent-black"/>
              <span>Include</span>
            </label>
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="youth_hunt" className="xpo_accent-black"/>
              <span>Exclude</span>
            </label>
            <label className="xpo_flex xpo_items-center xpo_space-x-1">
              <input type="radio" name="youth_hunt" className="xpo_accent-black"/>
              <span>Show Only</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <div className="xpo_text-sm xpo_mb-2 xpo_font-medium">{__('Deciding Data')}</div>

        <div className="xpo_mb-4">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_text-xs">
            <span className="xpo_font-semibold">{__('Draw Odds')}</span>
            {filters?.draw_odds ? <span>{filters?.draw_odds}% <span className="xpo_inline-block xpo_w-24"></span> 100%</span> : null}
          </div>
          <input type="range" min="0" max="100" className="xpo_w-full xpo_mt-2" defaultValue={filters?.draw_odds??0} onChange={e => setFilters(prev => ({...prev, draw_odds: Number(e.target.value)}))} />
        </div>

        <div className="xpo_mb-4">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_text-xs">
            <span className="xpo_font-semibold">{__('Bonus Point')}</span>
            {filters?.points ? <span>{filters?.points} <span className="xpo_inline-block xpo_w-24"></span> 40</span> : null}
          </div>
          <input type="range" min="0" max="40" className="xpo_w-full xpo_mt-2" defaultValue={filters?.points??0} onChange={e => setFilters(prev => ({...prev, points: Number(e.target.value)}))} />
        </div>

        <div className="xpo_mb-4">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_text-xs">
            <span className="xpo_font-semibold">{__('Harvest Rate')}</span>
            {filters?.harvest_rate ? <span>{filters?.harvest_rate}% <span className="xpo_inline-block xpo_w-24"></span> 100%</span> : null}
          </div>
          <input type="range" min="0" max="100" className="xpo_w-full xpo_mt-2" defaultValue={filters?.harvest_rate??0} onChange={e => setFilters(prev => ({...prev, harvest_rate: Number(e.target.value)}))} />
        </div>

        <div className="xpo_mb-4">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_text-xs">
            <span className="xpo_font-semibold">{__('Public Land Ratio')}</span>
            {filters?.public_land_ratio ? <span>{filters?.public_land_ratio}% <span className="xpo_inline-block xpo_w-24"></span> 100%</span> : null}
          </div>
          <input type="range" min="0" max="100" className="xpo_w-full xpo_mt-2" defaultValue={filters?.public_land_ratio??0} onChange={e => setFilters(prev => ({...prev, public_land_ratio: Number(e.target.value)}))} />
        </div>

        <div className="">
          <div className="xpo_flex xpo_justify-between xpo_items-center xpo_text-xs">
            <span className="xpo_font-semibold">{__('Hunters Per Square Mile')}</span>
            {filters?.per_sqmi ? <span>{filters?.per_sqmi} <span className="xpo_inline-block xpo_w-24"></span> 50</span> : null}
          </div>
          <input type="range" min="0" max="50" className="xpo_w-full xpo_mt-2" defaultValue={filters?.per_sqmi??0} onChange={e => setFilters(prev => ({...prev, per_sqmi: Number(e.target.value)}))} />
        </div>
      </div>
    </div>

    <div className="xpo_border-t xpo_flex xpo_justify-end xpo_items-center xpo_gap-8 xpo_px-8 xpo_py-4">
        <button
            type="button"
            onClick={e => setFilters(prev => defFilters)}
            className="xpo_text-black xpo_font-bold hover:xpo_underline"
        >{__('Clear')}</button>
        <button
            type="button"
            onClick={e => setPopup(null)}
            className="xpo_px-6 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded xpo_font-bold hover:xpo_bg-primary-600"
        >
        {__('Apply')}
      </button>
    </div>
  </div>
</div>
                                        )}
                                    >
                                        {__('+ More Filters')}
                                    </button>
                                    <button
                                        className="xpo_relative xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm"
                                        onClick={e => setPopup(
                                            <div className="xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center xpo_bg-black xpo_bg-opacity-40">
                                                <div className="xpo_bg-white xpo_rounded-md xpo_shadow-lg xpo_w-full xpo_max-w-md xpo_p-6 xpo_relative xpo_flex xpo_flex-col">
                                                    <div className="xpo_flex xpo_justify-center xpo_items-center xpo_relative xpo_border-b xpo_pb-4">
                                                        <h2 className="xpo_text-lg xpo_font-semibold">{__('Share search')}</h2>
                                                        <X size={24} type="button" onClick={e => setPopup(null)} className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_z-10 xpo_cursor-pointer" />
                                                    </div>

                                                    <p className="xpo_mt-4 xpo_text-center xpo_text-sm xpo_text-gray-700">
                                                    {__('Your friends with Elite access will be able to view your list of search results (with filters applied).')}
                                                        <br />
                                                        {__('Those without Elite access may sign up for a free trial to view.')}
                                                    </p>

                                                    <div className="xpo_mt-6 xpo_flex xpo_items-center xpo_space-x-3">
                                                        <input
                                                            readOnly
                                                            type="text"
                                                            value={location.href}
                                                            className="xpo_flex-1 xpo_border xpo_border-gray-300 xpo_rounded xpo_px-4 xpo_py-2 xpo_text-sm xpo_select-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={e => 
                                                                sleep(100)
                                                                .then(res => navigator.clipboard.writeText(location.href))
                                                                .then(() => e.target.innerHTML = __('Copied'))
                                                                .then(async () => await sleep(2000))
                                                                .finally(() => e.target.innerHTML = __('Copy Link'))
                                                            }
                                                            className="xpo_bg-[#987A56] xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded xpo_text-sm xpo_font-semibold hover:xpo_bg-[#5c3b10]"
                                                        >{__('Copy Link')}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    >
                                        {__('Share')}
                                    </button>
                                </div>
                                <span className="xpo_text-gray-500 xpo_text-sm">{sprintf(__('%d results'), hunts.length)}</span>
                            </div>
                            {/* <div className="xpo_bg-yellow-100 xpo_p-3 xpo_rounded xpo_text-gray-700 xpo_text-sm xpo_flex xpo_justify-between">
                                {sprintf(__('Your residency is %s, and we will only show resident draw odds and tag quota for your residency state.'), filterOptions.states.find(i => i.id == filters.state)?.name??'Arizona')}
                                <X onClick={e => e.target.parentElement.remove()} />
                            </div> */}
                        </div>
                    </div>
                </div>
            ) : null}
            
            {/* xpo_space-y-6  */}
            <div className={`xpo_mx-auto xpo_text-center xpo_p-0 md:xpo_p-4 md:xpo_pt-0 xpo_relative xpo_rounded-md xpo_w-full ${showForm ? 'xpo_max-w-3xl' : ''}`}>
                {/* Horns */}
                {filterStyle == 0 ? (
                    <>
                        <div className={`xpo_absolute xpo_-left-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})` }}></div>
                        <div className={`xpo_absolute xpo_-right-14 xpo_-translate-y-1/2 xpo_w-[150px] xpo_h-full xpo_bg-center xpo_bg-contain xpo_bg-no-repeat beer-horn-flip ${showForm ? 'xpo_top-1/3' : 'xpo_top-1/2'}`} style={{ backgroundImage: `url(${beer_horn})` }}></div>
                    </>
                ) : null}

                {/* Title */}
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                    {filterStyle == 0 ? (
                        <>
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
                        </>
                    ) : null}
                    
                    {/* false | !showForm - it's added to hide the block */}
                    {false ? (
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
                                filterStyle == 0 ?
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
                                                                {[{id: null, name: __('Select a species')}, ...filterOptions.species].map((species, i) => <option key={i} value={species.id}>{species.name}</option>)}
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
                                                                {[{id: null, name: __('Select a weapon')}, ...filterOptions.weapons].map((weapon, i) => <option key={i} value={weapon.id}>{weapon.name}</option>)}
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
                                                                {filterOptions.years.map((year, i) => <option key={i} value={year}>{year}</option>)}
                                                            </select>
                                                        </div>

                                                        {/* Residency */}
                                                        <div className="xpo_col-span-2">
                                                            <label className="xpo_block xpo_text-[#5c3b10] xpo_font-bold xpo_mb-2 xpo_text-start">{__('Resident or Non-Resident')}</label>
                                                            <select
                                                                value={filters.is_resident}
                                                                className="xpo_w-full xpo_border xpo_border-[#5c3b10] xpo_rounded xpo_p-2"
                                                                onChange={(e) => setFilters(prev => ({ ...prev, is_resident: e.target.value }))}
                                                            >
                                                                <option value="-1">{__('Select Residency')}</option>
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
                                : null
                            ) : (
                                <div className="xpo_w-full xpo_bg-[#987A56] xpo_border-8 xpo_border-[#5c3b10] xpo_p-4 md:xpo_p-8 xpo_rounded-md xpo_shadow-lg">
                                    <div className="xpo_overflow-auto xpo_scrollbar-thin xpo_[scrollbar-color:#5c3b10_#987A56] xpo_[scrollbar-width:thin] hunter-table" ref={table}>
                                        {/* xpo_min-w-[2000px] xpo_rounded-md xpo_overflow-hidden */}
                                        <table className="xpo_table xpo_table-auto xpo_w-full xpo_border xpo_border-collapse xpo_border-gray-200 xpo_text-center">
                                            <thead className="">
                                                <tr>
                                                    {(
                                                        viewType == 2 ? tableColumns.slice(0, 8) : tableColumns
                                                    ).map((col, index) => (
                                                        <th key={index} className={`xpo_sticky xpo_top-0 xpo_border xpo_px-4 xpo_py-2 xpo_whitespace-nowrap xpo_bg-gray-100 xpo_text-gray-900 ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{viewType == 2 && index == 7 ? 'View' : col}</th>
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
                                                        hunts.map((hunt, hIndex) => viewType == 2 ? (
                                                            <tr key={hIndex}>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.app_year}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.document_id}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt?.state?.name}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.gmu?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.bag_type?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.species.name || ''}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.weapon?.name}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.start_date || __('N/A')} - {hunt.end_date || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.user_odds || __('N/A')}</td>
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
                                                                                            {/* <tr><td className="xpo_border xpo_px-2 xpo_text-white">{__('Year')}</td><td className="xpo_border xpo_px-2 xpo_text-white"> {hunt.app_year}</td></tr> */}
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
                                                            <tr key={hIndex}>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.app_year || __('N/A')}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.document_id || __('N/A')}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt?.state?.name || __('N/A')}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.gmu?.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.bag_type?.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.species.name || __('N/A')}</td>
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.weapon?.name || __('N/A')}</td>
                                                                {/* <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.season_type || __('N/A')}</td> */}
                                                                <td className={`xpo_border xpo_p-2 xpo_text-white ${viewType == 1 ? '!xpo_p-0 xpo_text-[12px]' : ''}`}>{hunt.start_date ? strtotime(hunt.start_date).format('MMM, DD') : __('N/A')} - {hunt.end_date ? strtotime(hunt.end_date).format('MMM, DD') : __('N/A')}</td>
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
                        <Popup showCross={false} onClose={() => setPopup(null)} bodyClassName="xpo_relative xpo_z-10 xpo_bg-[#987A56] xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]">{popup}</Popup>
                    </div>
                ) : null}

                {/* Footer Text */}
                {showForm && filterStyle == 0 ? <p className="xpo_text-[#5c3b10] xpo_mt-6 xpo_max-w-3xl xpo_mx-auto">{__('Use this tool to estimate your draw chances for big game hunts in Arizona based on species, units, hunt type, residency, and your bonus point profile. Updated annually using the latest AZGFD data.')}</p> : null}
            </div>
            
            <InlineIcons />

        </section>
    );
}

