import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { __ } from '@js/utils';
import { useEffect, useState } from 'react';

export default function Search404() {
    const [filters, setFilters] = useState({s: ''});
    const [loading, setLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!filters.s) {return;}
        const delay = setTimeout(() => {
            navigate(`/search/${filters.s}`);
        }, 1000);
        
        return () => clearTimeout(delay);
    }, [filters])
    
    
    return (
        <div className="xpo_min-h-screen xpo_flex xpo_flex-col xpo_justify-center xpo_items-center xpo_bg-white xpo_text-gray-800 xpo_p-8">
            {/* Logo Placeholder */}
            <div className="xpo_text-4xl xpo_font-bold xpo_text-primary-600 mb-6">Banglee</div>

            {/* 404 Message */}
            <h1 className="xpo_text-6xl xpo_font-bold xpo_mb-4">404</h1>
            <p className="xpo_text-xl xpo_text-gray-600 xpo_mb-6">{__("Oops! The page you're looking for can't be found.")}</p>

            {/* Search Box */}
            <div className="xpo_w-full xpo_max-w-xl xpo_mb-6">
                <div className="xpo_flex xpo_items-center xpo_border xpo_border-gray-300 xpo_rounded-full xpo_pl-5 xpo_pr-4 xpo_py-2 xpo_shadow-sm hover:xpo_shadow-md transition">
                    <Search className="xpo_text-gray-500" size={18} />
                    <input
                        type="text"
                        value={filters.s}
                        placeholder={__('Search again...')}
                        onChange={e => setFilters(prev => ({...prev, s: e.target.value}))}
                        className="xpo_flex-1 xpo_bg-transparent xpo_outline-none xpo_pl-3 xpo_text-base"
                    />
                </div>
            </div>

            {/* Go Home Button */}
            <Link
                to="/"
                className="xpo_inline-block xpo_bg-primary-600 xpo_text-white xpo_py-2 xpo_px-6 xpo_rounded-full hover:xpo_bg-primary-700 transition"
            >
                {__('Go to Homepage')}
            </Link>
        </div>
    );
}
