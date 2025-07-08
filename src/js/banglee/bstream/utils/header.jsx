import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { __ } from '@js/utils';
import {
  Search as IconSearch,
  Mic as IconMic,
  Upload as IconUpload,
  Bell as IconNotifications,
  Settings as IconSettings
} from 'lucide-react';


const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Implement autocomplete logic here (async fetch or local suggestions)
    setSuggestions(value ? ['Suggestion 1', 'Suggestion 2', 'Suggestion 3'] : []);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      // Handle search submission with searchTerm
      console.log(searchTerm);
      setSuggestions([]);
    }
  };

  return (
    <header className="xpo_flex xpo_justify-between xpo_items-center xpo_bg-white xpo_shadow-md xpo_p-4">
      <div className="xpo_text-2xl xpo_font-bold">bStream</div>
      <div className="xpo_relative xpo_flex xpo_items-center xpo_w-1/2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-l-md"
          placeholder={__( 'Search')}
        />
        <button className="xpo_p-2 xpo_bg-gray-200 xpo_rounded-r-md">
          <IconSearch />
        </button>
        {suggestions.length > 0 && (
          <div className="xpo_absolute xpo_top-full xpo_left-0 xpo_right-0 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-md xpo_max-h-40 xpo_overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`xpo_p-2 xpo_cursor-pointer ${selectedIndex === index ? 'xpo_bg-gray-200' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  setSearchTerm(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="xpo_flex xpo_items-center xpo_space-x-4">
        <Link to="/upload">
          <IconUpload className="xpo_cursor-pointer" />
        </Link>
        <IconMic className="xpo_cursor-pointer" onClick={() => console.log('Mic activated')} />
        <IconNotifications className="xpo_cursor-pointer" />
        <IconSettings className="xpo_cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;