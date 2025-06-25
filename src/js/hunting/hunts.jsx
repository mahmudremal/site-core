import React, { useEffect, useState, useRef } from 'react';
import { __ } from '@js/utils';
// import { createPopper } from '@popperjs/core';
import beer_horn from '@img/beer-horn.png';
import { ChevronLeft } from 'lucide-react';


// export default 
// function Hunts({ params }) {
//     const [hunts, setHunts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [filterOptions, setFilterOptions] = useState({
//         species: [],
//         weapons: [],
//         states: [],
//     });
//     const [filters, setFilters] = useState({
//         per_page: 10,
//         species: '',
//         weapon: '',
//         state: '',
//         points: 0,
//         page: 1,
//     });

//     const fetchFilters = async () => {
//         fetch('https://core.agency.local/wp-json/sitecore/v1/hunts/filters')
//             .then(res => res.json())
//             .then(data => {
//                 setFilterOptions({
//                     ...data,
//                     species: data?.species || [],
//                     weapons: data?.weapons || [],
//                     states: data?.states || [],
//                 });
//             })
//             .catch(err => console.error('Error fetching filters:', err));
//     };

//     const fetchHunts = async () => {
//         setLoading(true);
//         const query = new URLSearchParams({ ...filters }).toString();
//         fetch(`https://core.agency.local/wp-json/sitecore/v1/hunts?${query}`)
//             .then(res => res.json())
//             .then(data => setHunts(Array.isArray(data) ? data : []))
//             .catch(err => console.error('Error fetching hunts:', err))
//             .finally(() => setLoading(false));
//     };

//     useEffect(() => {
//         fetchFilters();
//     }, []);

//     useEffect(() => {
//         const delayDebounce = setTimeout(() => {
//             fetchHunts();
//         }, 500);
//         // Cleanup function to clear the timeout
//         return () => clearTimeout(delayDebounce);
//     }, [filters]);

//     return (
//         <div className="xpo_p-4 xpo_space-y-6 xpo_h-screen xpo_overflow-y-auto">
//             {/* <h2 className="xpo_text-xl xpo_font-semibold xpo_text-center">{__('Hunts')}</h2> */}

//             {/* Filters */}
//             <div className="xpo_flex xpo_flex-wrap xpo_gap-4 xpo_justify-center">

//                 <SpeciesMegaMenu
//                     value={null}
//                     label={__('Select Species')}
//                     options={filterOptions.species}
//                     onChange={(v) => setFilters(prev => ({ ...prev, species: v }))}
//                 />

//                 <Dropdown
//                     value={null}
//                     label={__('Select State')}
//                     options={filterOptions.states}
//                     onChange={(v) => setFilters(prev => ({ ...prev, state: v }))}
//                 />

//                 <Dropdown
//                     value={null}
//                     label={__('Select Weapon')}
//                     options={filterOptions.weapons}
//                     onChange={(v) => setFilters(prev => ({ ...prev, weapon: v }))}
//                 />

//                 <div className="xpo_flex xpo_items-center xpo_gap-2">
//                     <label className="xpo_text-sm">{__('Points')}</label>
//                     <input
//                         min={0}
//                         step={0.1}
//                         type="number"
//                         name="points"
//                         value={filters.points}
//                         onChange={(e) => setFilters((prev) => ({ ...prev, points: Math.min(10, parseInt(e.target.value)) }))}
//                         className="xpo_border xpo_rounded xpo_p-2 xpo_w-[80px]"
//                     />
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="xpo_overflow-x-auto">
//                 <table className="xpo_table xpo_table-auto xpo_w-full xpo_border xpo_border-collapse xpo_border-gray-200 xpo_min-w-[2000px]">
//                     <thead className="xpo_bg-gray-100">
//                         <tr>
//                             {['Year of Data', 'Hunt Code', 'State', 'Unit Name', 'Species', 'Species Type', 'Weapon', 'Season', 'Season Dates', 'Your Odds', 'Odds / Min Points', 'Tags Given', 'Harvest Rate', 'Public Land (sq mi)', 'Public Land (%)', 'Hunters/ Sq Mi', 'Additional Units', 'Notes'].map((col, index) => (
//                                 <th key={col} className={`${[1, 3].includes(index) ? `xpo_sticky ${index == 1 ? 'xpo_left-0' : 'xpo_left-[100px]'} xpo_z-10 xpo_bg-white` : ''} xpo_border xpo_px-4 xpo_py-2`}>
//                                     {__(col)}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ?
//                             [...Array(filters.per_page).keys()].map((_, index) => (
//                                 <tr key={index} className="xpo_animate-pulse">
//                                     <td colSpan="18" className="xpo_text-center xpo_p-4">
//                                         {index === Math.floor(filters.per_page / 2) ? __('Loading...') : null}
//                                     </td>
//                                 </tr>
//                             ))
//                             : hunts.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="18" className="xpo_text-center xpo_p-4">
//                                         {__('No results found.')}
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 hunts.map((hunt) => (
//                                     <tr key={hunt.id}>
//                                         <td className="xpo_border xpo_p-2">{hunt.app_year}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.id}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.gmu?.state?.abbreviation}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.gmu?.name}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.bag_type?.name}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.species_type || ''}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.weapon?.name}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.season_type}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.start_date} - {hunt.end_date}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.user_odds}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.odds_min_points || ''}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.tags_given || ''}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.harvest_rate}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.gmu?.total_sqmi}</td>
//                                         <td className="xpo_border xpo_p-2">{(hunt.gmu?.public_ratio * 100).toFixed(0)}%</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.hunters_per_sqmi}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.additional_units || ''}</td>
//                                         <td className="xpo_border xpo_p-2">{hunt.notes || ''}</td>
//                                     </tr>
//                                 ))
//                             )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }


// const Dropdown = ({ label, options, value, onChange }) => {
//     const btnRef = useRef(null);
//     const menuRef = useRef(null);
//     const [show, setShow] = useState(false);
//     const [selected, setSelected] = useState({ id: value, name: label });

//     useEffect(() => {
//         if (show && btnRef.current && menuRef.current) {
//             createPopper(btnRef.current, menuRef.current, { placement: 'bottom-start' });
//         }
//     }, [show]);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) {
//                 setShow(null);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     return (
//         <div className={`xpo_relative xpo_select-none ${selected.id ? 'xpo_text-gray-400' : 'xpo_text-gray-200'}`}>
//             <button
//                 ref={btnRef}
//                 type="button"
//                 onClick={() => setShow(prev => !prev)}
//                 className="xpo_border xpo_rounded xpo_p-2 xpo_min-w-[150px] xpo_bg-white"
//             >{selected.name}</button>
//             {show && (
//                 <div ref={menuRef} className="xpo_absolute xpo_z-10 xpo_mt-2 xpo_bg-white xpo_shadow xpo_rounded xpo_border xpo_w-[220px] xpo_max-h-[300px] xpo_overflow-auto">
//                     {options.map((opt) => (
//                         <div
//                             key={opt.id}
//                             onClick={() => {
//                                 setSelected(opt);
//                                 onChange(opt.id);
//                                 setShow(false);
//                             }}
//                             className={`xpo_cursor-pointer xpo_p-2 hover:xpo_bg-gray-100 ${opt.id === selected.id ? 'xpo_bg-gray-200' : ''}`}
//                         >{opt.name}</div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// const SpeciesMegaMenu = ({ label, options, value, onChange }) => {
//     const btnRef = useRef(null);
//     const menuRef = useRef(null);
//     const [show, setShow] = useState(false);
//     const [selected, setSelected] = useState({ id: value, name: label });

//     useEffect(() => {
//         if (show && btnRef.current && menuRef.current) {
//             createPopper(btnRef.current, menuRef.current, { placement: 'bottom-start' });
//         }
//     }, [show]);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (menuRef.current && !menuRef.current.contains(event.target)) {
//                 setShow(null);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     return (
//         <div className="xpo_relative xpo_select-none">
//             <button
//                 ref={btnRef}
//                 type="button"
//                 onClick={() => setShow(prev => !prev)}
//                 className={`xpo_border xpo_rounded xpo_p-2 xpo_min-w-[150px] xpo_bg-white ${selected.id ? 'xpo_text-gray-400' : 'xpo_text-gray-200'}`}
//             >{selected?.name}</button>
//             {show && (
//                 <div ref={menuRef} className="xpo_absolute xpo_z-10 xpo_mt-2 xpo_bg-white xpo_shadow xpo_rounded xpo_border xpo_w-[600px] xpo_max-h-[400px] xpo_overflow-auto xpo_p-4">
//                     <div className="xpo_grid xpo_grid-cols-3 xpo_gap-2">
//                         {options.map((opt) => (
//                             <div
//                                 key={opt.id}
//                                 onClick={() => {
//                                     setSelected(opt);
//                                     onChange(opt.id);
//                                     setShow(false);
//                                 }}
//                                 className={`xpo_cursor-pointer xpo_p-2 xpo_border xpo_rounded hover:xpo_bg-gray-100 xpo_text-center ${opt.id === selected?.id ? 'xpo_text-gray-800' : 'xpo_text-gray-500'}`}
//                             >{opt.name}</div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };


export default function DrawTool() {
    const [hunts, setHunts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(true);
    const [filterOptions, setFilterOptions] = useState({
        species: [],
        weapons: [],
        states: [],
    });
    const currentYear = new Date().getFullYear();
    const [filters, setFilters] = useState({
        year: currentYear,
        residency: 0,
        per_page: 10,
        species: '',
        weapon: '',
        state: '',
        points: 0,
        page: 1,
    });

    const fetchFilters = async () => {
        fetch('https://core.agency.local/wp-json/sitecore/v1/hunts/filters')
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
        fetch(`https://core.agency.local/wp-json/sitecore/v1/hunts?${query}`)
            .then(res => res.json())
            .then(data => setHunts(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error fetching hunts:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchFilters();
    }, []);

    // useEffect(() => {
    //     const delayDebounce = setTimeout(() => {
    //         fetchHunts();
    //     }, 500);
    //     // Cleanup function to clear the timeout
    //     return () => clearTimeout(delayDebounce);
    // }, [filters]);

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


    return (
        <section className="xpo_bg-paper xpo_font-vintage xpo_p-2 md:xpo_p-8 xpo_pb-0 xpo_relative xpo_mx-auto xpo_bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] xpo_from-[#D7B77E] xpo_to-[#C69D5D] xpo_h-full">
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
                                aria-label={__('Back')}
                                title={__('Back')}
                                onClick={(e) => setShowForm(prev => !prev)}
                                className="xpo_absolute xpo_flex xpo_gap-2 xpo_items-center xpo_-bottom-10 xpo_-right-22 xpo_px-4 xpo_py-2 xpo_bg-transparent"
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
                </div>

                {/* Form Box */}
                <div className="xpo_w-full xpo_relative">
                    <div className="">
                        <div className="xpo_flex xpo_flex-nowrap xpo_justify-center">
                            {showForm ? (
                                <div className="">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            fetchHunts();
                                            setShowForm(prev => !prev);
                                        }}
                                        className="xpo_bg-[#987A56] xpo_border-8 xpo_border-[#5c3b10] xpo_inline-block xpo_p-8 xpo_rounded-md xpo_shadow-lg"
                                    >
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
                                                    {[...Array(5).keys()].map(i => <option key={i} value={(currentYear - i)}>{(currentYear - i)}</option>)}
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

                                        {/* Button */}
                                        <button
                                            type="submit"
                                            className="xpo_w-full xpo_bg-[#5c3b10] xpo_text-white xpo_font-bold xpo_py-3 xpo_px-6 xpo_rounded xpo_text-lg xpo_tracking-wider hover:xpo_bg-[#3e2a0c]"
                                        >{__('CALCULATE ODDS')}</button>
                                    </form>
                                </div>
                            ) : (
                                <div className="xpo_w-full xpo_bg-[#987A56] xpo_border-8 xpo_border-[#5c3b10] xpo_p-4 md:xpo_p-8 xpo_rounded-md xpo_shadow-lg">
                                    <div className="xpo_overflow-auto xpo_scrollbar-thin xpo_[scrollbar-color:#5c3b10_#987A56] xpo_[scrollbar-width:thin] hunter-table" ref={table}>
                                        {/* xpo_min-w-[2000px] xpo_rounded-md xpo_overflow-hidden */}
                                        <table className="xpo_table xpo_table-auto xpo_w-full xpo_border xpo_border-collapse xpo_border-gray-200">
                                            <thead className="xpo_bg-gray-100">
                                                <tr>
                                                    {[__('Year of Data'), __('Hunt Code'), __('State'), __('Unit Name'), __('Species'), __('Species Type'), __('Weapon'), __('Season'), __('Season Dates'), __('Your Odds'), __('Odds / Min Points'), __('Tags Given'), __('Harvest Rate'), __('Public Land (sq mi)'), __('Public Land (%)'), __('Hunters/ Sq Mi'), __('Additional Units'), __('Notes')].map((col, index) => (
                                                        <th key={index} className={`xpo_sticky xpo_top-0 xpo_border xpo_px-4 xpo_py-2 xpo_whitespace-nowrap xpo_bg-gray-100`}>{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ?
                                                    [...Array(filters.per_page).keys()].map((_, index) => (
                                                        <tr key={index} className="xpo_animate-pulse">
                                                            <td colSpan="18" className="xpo_text-center xpo_p-4">
                                                                {index === Math.floor(filters.per_page / 2) ? __('Loading...') : null}
                                                            </td>
                                                        </tr>
                                                    ))
                                                    : hunts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="18" className="xpo_text-center xpo_p-4">
                                                                {__('No results found.')}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        hunts.map((hunt) => (
                                                            <tr key={hunt.id}>
                                                                <td className="xpo_border xpo_p-2">{hunt.app_year}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.id}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.gmu?.state?.abbreviation}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.gmu?.name}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.bag_type?.name}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.species_type || ''}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.weapon?.name}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.season_type}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.start_date} - {hunt.end_date}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.user_odds}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.odds_min_points || ''}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.tags_given || ''}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.harvest_rate}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.gmu?.total_sqmi}</td>
                                                                <td className="xpo_border xpo_p-2">{(hunt.gmu?.public_ratio * 100).toFixed(0)}%</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.hunters_per_sqmi}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.additional_units || ''}</td>
                                                                <td className="xpo_border xpo_p-2">{hunt.notes || ''}</td>
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

                {/* Footer Text */}
                {showForm ? <p className="xpo_text-[#5c3b10] xpo_mt-6 xpo_max-w-3xl xpo_mx-auto">{__('Use this tool to estimate your draw chances for big game hunts in Arizona based on species, units, hunt type, residency, and your bonus point profile. Updated annually using the latest AZGFD data.')}</p> : null}
            </div>
        </section>
    );
}

