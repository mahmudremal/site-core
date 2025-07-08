
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { __ } from '@js/utils';
import { sprintf } from 'sprintf-js';

import { NavMenu } from '.';


export default function SearchHome() {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ s: '' });

    useEffect(() => {
        const delay = setTimeout(() => {
            if (!filters.s.trim()) return;
            navigate(`/search/${filters.s}`);
        }, 1000);

        return () => clearTimeout(delay);
    }, [filters]);

    return (
        <div className="xpo_min-h-screen xpo_flex xpo_flex-col xpo_items-center xpo_justify-between xpo_bg-white xpo_text-gray-800">
            {/* Navigation */}
            <NavMenu />

            {/* Main */}
            <main className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_flex-1">
                {/* Placeholder logo */}
                <div className="xpo_text-5xl xpo_font-semibold xpo_mb-6">{__('Banglee')}</div>
                <div className="xpo_w-full xpo_max-w-xl">
                    <div className="xpo_flex xpo_items-center xpo_border xpo_border-gray-300 xpo_rounded-full xpo_pl-5 xpo_pr-4 xpo_py-2 xpo_shadow-sm hover:xpo_shadow-md transition">
                        <Search className="xpo_text-gray-500" size={18} />
                        <input
                            type="text"
                            className="xpo_flex-1 xpo_bg-transparent xpo_outline-none xpo_pl-3 xpo_text-base"
                            placeholder="Search..."
                            value={filters.s}
                            onChange={(e) => setFilters({ ...filters, s: e.target.value })}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="xpo_w-full xpo_text-center xpo_text-sm xpo_text-gray-500 xpo_py-6">
                {sprintf(__('© %d Banglee Inc. All rights reserved.'), new Date().getFullYear())}
            </footer>
        </div>
    );
}
