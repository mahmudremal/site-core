
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Search, LoaderCircle, Mic, Camera, X } from 'lucide-react';
import { __ } from '@js/utils';

import { Dropdown, SearchBar, AppsList, ProfileBar } from '.';

const placeholderIcon = 'https://via.placeholder.com/40';

export default function SearchResults() {
    const { s: query } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({s: query});
    const [speaking, setSpeaking] = useState(null);

    useEffect(() => {
        if (!query) return;
        setLoading(true);
        axios.get(`/search/result?${new URLSearchParams(filters).toString()}`)
        .then(res => setResults(res.data.result || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, [query]);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (!filters.s) return;
            navigate(`/search/${filters.s}`);
        }, 1000);

        return () => clearTimeout(delay);
    }, [filters]);

    
    const ResultCard = ({ title, link, description, icon }) => (
        <div className="xpo_flex xpo_gap-4 xpo_items-start xpo_p-4 xpo_bg-white xpo_rounded-md xpo_shadow-sm hover:xpo_shadow-md transition-all">
            <img src={icon?.URL || placeholderIcon} alt="icon" className="xpo_w-10 xpo_h-10 xpo_object-contain xpo_rounded" />
            <div>
                <a href={link} className="xpo_text-blue-700 xpo_text-lg xpo_font-semibold hover:xpo_underline" target="_blank" rel="noreferrer">{title}</a>
                <p className="xpo_text-sm xpo_text-gray-600 mt-1">{description?.replace(/<[^>]+>/g, '')}</p>
                <p className="xpo_text-xs xpo_text-gray-400 mt-1">{link}</p>
            </div>
        </div>
    );
    
    return (
        <div className="xpo_min-h-screen xpo_bg-gray-100">
            <div className="xpo_relative xpo_w-full">
                
                <div className="xpo_px-4 lg:xpo_px-8 xpo_py-2 xpo_bg-white xpo_shadow-sm">
                    <div className="xpo_grid xpo_grid-cols-[300px_1fr_300px] xpo_items-center xpo_gap-3">
                        <div className="xpo_flex xpo_items-center xpo_gap-2">
                            <Link to={'/'} className="xpo_flex xpo_items-center xpo_gap-2">
                                {/* <img src={siteLogo} alt="Logo" className="xpo_h-10 xpo_object-contain xpo_rounded" /> */}
                                <div className="xpo_text-xl xpo_font-semibold">{__('Banglee')}</div>
                                <span className="xpo_font-thin xpo_text-xl">Search</span>
                            </Link>
                        </div>
                        <div className="xpo_relative xpo_w-full">
                            <div className="xpo_w-full xpo_flex xpo_justify-center xpo_items-center">
                                <div className="xpo_relative xpo_w-full xpo_max-w-3xl">
                                    <SearchBar filtersObj={[filters, setFilters]} setLoading={setLoading} />
                                    <div className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_-translate-y-1/2 xpo_text-gray-400">
                                        {loading ? <LoaderCircle className="xpo_animate-spin xpo_w-5 xpo_h-5" /> : <Search className="xpo_w-5 xpo_h-5" />}
                                    </div>
                                    <div className="xpo_absolute xpo_right-4 xpo_top-1/2 xpo_-translate-y-1/2 xpo_flex xpo_gap-2 xpo_items-center">
                                        {(window.SpeechRecognition || window.webkitSpeechRecognition) ? (
                                            <Dropdown button={(<Mic
                                                onClick={e => {
                                                    e.preventDefault();

                                                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

                                                    if (!SpeechRecognition) {
                                                        console.warn("Speech Recognition API is not supported in this browser.");
                                                        return;
                                                    }

                                                    const recognition = new SpeechRecognition();
                                                    recognition.lang = 'en-US';
                                                    recognition.continuous = false;
                                                    recognition.interimResults = false;

                                                    recognition.onresult = (event) => {
                                                        let finalTranscript = '';
                                                        console.log(event)
                                                        if (event?.results && event.results?.[0] && event.results[0]?.[0] && event.results[0][0]?.transcript) {
                                                            // setSpeaking(finalTranscript + event.results[0][0].transcript);
                                                        }
                                                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                                                            if (event.results[i].isFinal) {
                                                                finalTranscript += event.results[i][0].transcript;
                                                            }
                                                        }
                                                        console.log("Recognized Text:", finalTranscript);
                                                        setFilters(prev => ({...prev, s: finalTranscript}))
                                                    };

                                                    recognition.onerror = (event) => {
                                                        console.error("Speech Recognition Error:", event.error);
                                                        setSpeaking(null);
                                                    };

                                                    recognition.onend = () => {
                                                        console.log("Speech recognition ended.");
                                                        setSpeaking(null);
                                                    };

                                                    recognition.start();
                                                    console.log("Speech recognition started. Speak now!");
                                                    setSpeaking(true);
                                                }}
                                                className="xpo_w-5 xpo_h-5 xpo_cursor-pointer"
                                            />)}>
                                                <div className="xpo_whitespace-nowrap">
                                                    {__('Speak to search')}
                                                </div>
                                            </Dropdown>
                                        ) : null}
                                        <Dropdown button={(<Camera className="xpo_w-5 xpo_h-5 xpo_cursor-pointer" />)}>
                                            <div className="xpo_min-w-40">
                                                <label className="xpo_cursor-pointer xpo_text-sm xpo_text-blue-600">
                                                    Upload Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="xpo_hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                alert('Image uploaded: ' + file.name);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </Dropdown>
                                        <X className="xpo_w-5 xpo_h-5 xpo_cursor-pointer" onClick={e => setFilters(prev => ({...prev, s: ''}))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="xpo_flex xpo_items-center xpo_justify-end xpo_gap-4">
                            <Dropdown button={(<button className="xpo_text-sm hover:xpo_underline">{__('Apps')}</button>)}>
                                <AppsList />
                            </Dropdown>
                            <Dropdown button={(<div className="xpo_w-8 xpo_h-8 xpo_rounded-full xpo_bg-gray-300 xpo_cursor-pointer" />)}>
                                <ProfileBar />
                            </Dropdown>
                        </div>
                    </div>
                    <div className="xpo_flex xpo_gap-4 xpo_justify-center xpo_mt-4 xpo_text-sm xpo_text-gray-600">
                        {[__('All'), __('Images'), __('News'), __('Maps'), __('Videos'), __('Books'), __('Finance')].map(tab => (
                            <span key={tab} className="xpo_cursor-pointer hover:xpo_underline">{tab}</span>
                        ))}
                    </div>
                </div>

            </div>
            <div className="xpo_max-w-5xl xpo_mx-auto xpo_p-4 xpo_space-y-4">
                {loading && <p className="xpo_text-gray-500">Loading results...</p>}
                {!loading && results.length === 0 && <p className="xpo_text-gray-600">No results found for: <strong>{filters.s}</strong></p>}
                {results.map((item, idx) => (
                    <ResultCard key={idx} {...item} />
                ))}
            </div>
        </div>
    );
};



