import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search, ShoppingCart, Menu, User, ListOrdered, Undo, Package, Heart, Clock, BookOpen, Music, Video, Settings, LogIn, UserPlus, Star, TrendingUp, Sun, Moon } from "lucide-react";
import { Dropdown } from '@banglee/core';
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useTheme } from "../../hooks/useTheme";
import { usePopup } from "../../hooks/usePopup";
import { useLocale } from "../../hooks/useLocale";
import { useCurrency } from "../../hooks/useCurrency";
import { sprintf } from "sprintf-js";
import MoonlitMeadowLogo from "../backgrounds/MoonlitMeadowLogo";
import { useAuth } from "../../hooks/useAuth";

const sampleSuggestions = [
  { text: "Wireless Headphones", category: "Electronics", trending: true },
  { text: "Men's Running Shoes", category: "Sports", trending: false },
  { text: "Organic Green Tea", category: "Food", trending: false },
  { text: "Bluetooth Speakers", category: "Electronics", trending: true },
  { text: "Fitness Tracker", category: "Sports", trending: false },
  { text: "4K Smart TV", category: "Electronics", trending: true },
  { text: "Children's Books", category: "Books", trending: false },
  { text: "Gaming Laptop", category: "Electronics", trending: true }
];

const categories = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Books & Media",
  "Health & Beauty",
  "Automotive",
  "Baby & Kids",
  "Food & Grocery"
];

// Enhanced Search Autocomplete Component
function SearchAutocomplete({ searchTerm, visible, highlightedIndex, onSelect, autocompleteRef }) {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const filteredSuggestions = sampleSuggestions.filter((s) =>
    s.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!visible || !searchTerm || !filteredSuggestions.length) return null;

  return (
    <div
      ref={autocompleteRef}
      className="xpo_absolute xpo_z-30 xpo_w-full xpo_mt-2 xpo_bg-scwhite xpo_shadow-2xl xpo_rounded-lg xpo_border xpo_border-gray-200 xpo_max-h-96 xpo_overflow-hidden"
      role="listbox"
      aria-label="Search suggestions"
    >
      <div className="xpo_p-3 xpo_border-b xpo_bg-gray-50">
        <h4 className="xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
          {__('Search Suggestions', 'site-core')}
        </h4>
      </div>
      
      <div className="xpo_max-h-80 xpo_overflow-auto">
        {filteredSuggestions.map((item, idx) => (
          <div
            key={item.text}
            role="option"
            aria-selected={highlightedIndex === idx}
            onMouseDown={() => onSelect(item.text)}
            className={`xpo_group xpo_cursor-pointer xpo_px-4 xpo_py-3 xpo_border-b xpo_border-gray-100 xpo_flex xpo_items-center xpo_justify-between hover:xpo_bg-scaccent-50 xpo_transition-all xpo_duration-200 ${
              highlightedIndex === idx ? "xpo_bg-scaccent-50" : ""
            }`}
          >
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <Search size={14} className="xpo_text-gray-400" />
              <div dangerouslySetInnerHTML={{__html: sprintf(__('%s %sin %s %s', 'site-core'), `<div class="xpo_text-sm xpo_text-gray-800 group-hover:xpo_text-scaccent-700">${item.text}</div>`, `<div class="xpo_text-xs xpo_text-gray-500">`, `</div>`)}}></div>
            </div>
            {item.trending && (
              <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-2 xpo_py-1 xpo_bg-scaccent-100 xpo_rounded-full">
                <TrendingUp size={12} className="xpo_text-scaccent-500" />
                <span className="xpo_text-xs xpo_text-scaccent-600 xpo_font-medium">
                  {__('Trending', 'site-core')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="xpo_p-3 xpo_border-t xpo_bg-gray-50">
        <div className="xpo_text-xs xpo_text-gray-500 xpo_text-center">
          {__('Press Enter to search or click on a suggestion', 'site-core')}
        </div>
      </div>
    </div>
  );
}

function CategoriesDropdown({ selectedCategory, onCategorySelect }) {
  const { __ } = useLocale();
  const { money } = useCurrency();
  return (
    <Dropdown button={(
      <button
        className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-gray-100 hover:xpo_bg-gray-200 xpo_px-4 xpo_py-3 xpo_rounded-l-lg xpo_text-sm xpo_text-gray-700 xpo_font-medium xpo_transition-all xpo_duration-200 xpo_min-w-[160px] xpo_justify-between"
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <span className="xpo_truncate">{selectedCategory}</span>
        <ChevronDown size={16} />
      </button>
    )}>
      <div className="xpo_bg-scwhite xpo_shadow-lg xpo_rounded-lg xpo_border xpo_border-gray-200 xpo_min-w-[200px] xpo_max-h-80 xpo_overflow-auto">
        <div className="xpo_p-3 xpo_border-b xpo_bg-gray-50">
          <h4 className="xpo_text-sm xpo_font-semibold xpo_text-gray-700">
            {__('Browse Categories', 'site-core')}
          </h4>
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm hover:xpo_bg-scaccent-50 xpo_transition-colors xpo_border-b xpo_border-gray-100 last:xpo_border-b-0 ${
              selectedCategory === category
                ? "xpo_bg-scaccent-50 xpo_text-scaccent-700 xpo_font-medium"
                : "xpo_text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </Dropdown>
  );
}

function LanguageDropdown({ onLanguageSelect }) {
  const { money } = useCurrency();
  const { __, languages, locale: currentLanguage } = useLocale();
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[1];

  return (
    <Dropdown
      button={(
        <button
          aria-label={__('Language selector', 'site-core')}
          className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm hover:xpo_text-scaccent-300 xpo_transition-colors"
        >
          <span className="xpo_text-lg">{currentLang.flag}</span>
          <span className="xpo_font-medium">{currentLang.code.toUpperCase()}</span>
          <ChevronDown size={14} />
        </button>
      )}
      className="xpo_z-50 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_border xpo_rounded xpo_shadow xpo_mt-2 xpo_p-2 xpo_min-w-[120px]"
    >
      <div className="xpo_rounded-lg xpo_min-w-[200px]">
        <div className="xpo_p-3 xpo_border-b">
          <h4 className="xpo_text-sm xpo_font-semibold xpo_text-gray-700 dark:xpo_text-scwhite-700">{__('Choose Language', 'site-core')}</h4>
        </div>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageSelect(language.code)}
            className={`xpo_w-full xpo_text-left xpo_px-4 xpo_py-3 xpo_text-sm hover:xpo_bg-scaccent-50 dark:hover:xpo_bg-scprimary xpo_transition-colors xpo_border-b xpo_border-gray-100 last:xpo_border-b-0 xpo_flex xpo_items-center xpo_gap-3 ${
              currentLanguage === language.code
                ? "xpo_bg-scaccent-50 dark:xpo_bg-scprimary xpo_text-scprimary-700 dark:xpo_text-scaccent-700 xpo_font-medium"
                : "xpo_text-gray-700 dark:xpo_text-scwhite-700"
            }`}
          >
            <span className="xpo_text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage === language.code && (
              <span className="xpo_ml-auto xpo_text-scaccent-500">✓</span>
            )}
          </button>
        ))}
      </div>
    </Dropdown>
  );
}

function AccountDropdown({ isSignedIn }) {
  const { __ } = useLocale();
  const { user } = useAuth();
  return (
    <Dropdown
      button={(
        <button
          className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm hover:xpo_text-scaccent-300 xpo_transition-colors"
          aria-label="Account and Lists"
        >
          <User size={18} />
          <div className="xpo_text-left">
            <div className="xpo_text-xs xpo_leading-tight xpo_text-scprimary dark:xpo_text-gray-300">
              {isSignedIn ? sprintf(__('Hello, %s', 'site-core'), user?.display_name??'Buddy') : __('Hello, sign in', 'site-core')}
            </div>
            <div className="xpo_font-semibold xpo_text-scprimary dark:xpo_text-scwhite">{__('Account & Lists', 'site-core')}</div>
          </div>
          <ChevronDown size={14} />
        </button>
      )}
      className="xpo_z-50 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_border xpo_rounded xpo_shadow xpo_mt-2 xpo_p-2 xpo_min-w-[120px]"
    >
      <div className="xpo_min-w-[280px]">
        {!isSignedIn ? (
          <div className="xpo_p-4 xpo_border-b xpo_text-center xpo_flex xpo_flex-col xpo_gap-2">
            <Link to="/auth/signin" className="xpo_w-full xpo_bg-scaccent-400 hover:xpo_bg-scaccent-500 xpo_text-gray-900 xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-medium xpo_transition-colors xpo_mb-2">
              <LogIn size={16} className="xpo_inline xpo_mr-2" />
              {__('Sign In', 'site-core')}
            </Link>
            <div className="xpo_text-xs xpo_text-gray-600">
              {__('New customer?', 'site-core')} 
              <Link to="/auth/register" className="xpo_text-scaccent-600 hover:xpo_text-scaccent-700 xpo_ml-1">
                {__('Start here', 'site-core')}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="xpo_p-2">
          <div className="xpo_mb-3 xpo_flex xpo_flex-col">
            <h4 className="xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_px-2 xpo_py-2">
              {__('Your Lists', 'site-core')}
            </h4>
            <Link to="/my-bookmark" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Heart size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Create a List', 'site-core')}
            </Link>
            <Link to="/my-bookmark" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Search size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Find a List or Registry', 'site-core')}
            </Link>
          </div>

          <div className="xpo_border-t xpo_pt-3 xpo_flex xpo_flex-col">
            <h4 className="xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_px-2 xpo_py-2">
              {__('Your Account', 'site-core')}
            </h4>
            <Link to="/clients-portal/my/overview" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <User size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Account', 'site-core')}
            </Link>
            <Link to="/orders/history" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Package size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Orders', 'site-core')}
            </Link>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Star size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Recommendations', 'site-core')}
            </button>
            <Link to="/history/products" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Clock size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Browsing History', 'site-core')}
            </Link>
            {/* <Link to="/watch/history" className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Heart size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Watchlist', 'site-core')}
            </Link>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Video size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Video Purchases & Rentals', 'site-core')}
            </button>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <BookOpen size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Kindle Unlimited', 'site-core')}
            </button>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Settings size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Content & Devices', 'site-core')}
            </button>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <ListOrdered size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Subscribe & Save Items', 'site-core')}
            </button>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Settings size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Memberships & Subscriptions', 'site-core')}
            </button>
            <button className="xpo_w-full xpo_text-left xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 hover:xpo_bg-gray-50 dark:hover:xpo_bg-scprimary-700 xpo_rounded">
              <Music size={16} className="xpo_inline xpo_mr-3 xpo_text-gray-400" />
              {__('Music Library', 'site-core')}
            </button> */}
          </div>
        </div>
      </div>
    </Dropdown>
  );
}

function DeliveryZonePicker() {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const { setPopup } = usePopup();
  
  return (
    <div className="xpo_p-4 xpo_min-w-sm">
      <div className="xpo_text-gray-700 dark:xpo_text-scwhite-700 xpo_mb-4">
        <p className="xpo_text-sm xpo_leading-relaxed" dangerouslySetInnerHTML={{__html: sprintf(__('We\'re showing you items that ship to %sBangladesh%s. To see items that ship to a different country, change your delivery address.', 'site-core'), '<strong>', '</strong>')}}>
        </p>
      </div>
      <div className="xpo_flex xpo_gap-2">
        <button className="xpo_px-4 xpo_py-2 xpo_text-sm xpo_text-gray-700 dark:xpo_text-scwhite-700 xpo_transition-colors">
          {__('Dismiss', 'site-core')}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setPopup(
              <div className="xpo_p-6 xpo_rounded-lg xpo_max-w-md xpo_w-full">
                <h3 className="xpo_text-lg xpo_font-semibold xpo_mb-2">{__('Choose your location', 'site-core')}</h3>
                <p className="xpo_text-sm xpo_text-gray-600 dark:xpo_text-scwhite-600 xpo_mb-4">
                  {__('Delivery options and delivery speeds may vary for different locations', 'site-core')}
                </p>
                
                <button className="xpo_w-full xpo_bg-scaccent-400 hover:xpo_bg-scaccent-500 xpo_text-gray-900 xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-medium xpo_transition-colors xpo_mb-4">
                  {__('Sign in to see your addresses', 'site-core')}
                </button>
                
                <div className="xpo_text-center xpo_text-sm xpo_text-gray-500 dark:xpo_text-scwhite-500 xpo_mb-4">{__('or enter a US zip code', 'site-core')}</div>
                
                <div className="xpo_flex xpo_gap-2 xpo_mb-4">
                  <input 
                    type="text" 
                    placeholder={__('Enter ZIP code', 'site-core')}
                    className="xpo_flex-1 xpo_border xpo_border-gray-300 xpo_rounded xpo_px-3 xpo_py-2 xpo_text-sm"
                  />
                  <button className="xpo_bg-gray-200 hover:xpo_bg-gray-300 xpo_px-4 xpo_py-2 xpo_rounded xpo_text-sm xpo_transition-colors">
                    {__('Apply', 'site-core')}
                  </button>
                </div>
                
                <div className="xpo_text-center xpo_text-sm xpo_text-gray-500 dark:xpo_text-scwhite xpo_mb-4">{__('or ship outside the US', 'site-core')}</div>
                
                <select className="xpo_w-full xpo_border xpo_text-gray-300 dark:xpo_text-scwhite-300 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_border-gray-300 dark:xpo_border-scwhite xpo_rounded xpo_px-3 xpo_py-2 xpo_text-sm xpo_mb-4">
                  <option>Bangladesh</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>India</option>
                  <option>Germany</option>
                  <option>France</option>
                </select>
                
                <button onClick={(e) => {e.preventDefault();setPopup(null);}} className="xpo_w-full xpo_bg-scaccent-600 hover:xpo_bg-scaccent-700 xpo_text-scwhite xpo_py-2 xpo_px-4 xpo_rounded-lg xpo_font-medium xpo_transition-colors">{__('Done', 'site-core')}</button>
              </div>
            );
          }}
          className="xpo_bg-scaccent-600 hover:xpo_bg-scaccent-700 xpo_text-scwhite xpo_px-4 xpo_py-2 xpo_rounded xpo_text-sm xpo_font-medium xpo_transition-colors xpo_whitespace-nowrap"
        >
          {__('Change Address', 'site-core')}
        </button>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const { __ } = useLocale();
  const { cart } = useCart();
  const { money } = useCurrency();
  const { loggedin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSignedIn, setIsSignedIn] = useState(loggedin);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const filteredSuggestions = sampleSuggestions.filter((s) =>
    s.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!autocompleteVisible) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        setSearchTerm(filteredSuggestions[highlightedIndex].text);
        setAutocompleteVisible(false);
        setHighlightedIndex(-1);
      }
    } else if (e.key === "Escape") {
      setAutocompleteVisible(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target) &&
        event.target !== inputRef.current
      ) {
        setAutocompleteVisible(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAutocompleteSelect = (text) => {
    setSearchTerm(text);
    setAutocompleteVisible(false);
    setHighlightedIndex(-1);
  };

  return (
    <header className="xpo_bg-scwhite dark:xpo_bg-scprimary xpo_bg-gradient-to-t xpo_from-scwhite-700 dark:xpo_from-scprimary-700 xpo_via-scwhite-600 dark:xpo_via-scprimary-600 xpo_to-scwhite-500 dark:xpo_to-scprimary-500 xpo_text-primary dark:xpo_text-scwhite">
      <div className="xpo_container xpo_mx-auto xpo_flex xpo_items-center xpo_gap-4 xpo_px-4 xpo_py-3">
        {/* Logo */}
        <Link to="/" className="xpo_flex xpo_items-center xpo_gap-2 xpo_cursor-pointer">
          <MoonlitMeadowLogo />
        </Link>

        {/* Delivery Location */}
        <Dropdown
          button={(
            <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-sm xpo_cursor-pointer hover:xpo_text-scaccent-300 xpo_transition-colors">
              <MapPin size={18} />
              <div dangerouslySetInnerHTML={{__html: sprintf(__('Deliver to %s%s%s', 'site-core'), '<strong>', __('Bangladesh', 'site-core'), '</strong>')}}></div>
              <ChevronDown size={14} />
            </div>
          )}
          className="xpo_z-50 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_border xpo_rounded xpo_shadow xpo_mt-2 xpo_p-2 xpo_min-w-[120px]"
        >
          <DeliveryZonePicker />
        </Dropdown>

        {/* Search Section */}
        <div className="xpo_flex xpo_flex-1 xpo_items-center xpo_bg-scwhite xpo_rounded-lg xpo_overflow-hidden xpo_shadow-md">
          {/* Categories Dropdown */}
          <CategoriesDropdown 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Search Box */}
          <div className="xpo_relative xpo_flex-1">
            <input
              type="text"
              aria-label="Search products"
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setAutocompleteVisible(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setAutocompleteVisible(true)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${selectedCategory === "All Categories" ? "products" : selectedCategory}`}
              className="xpo_w-full xpo_h-12 xpo_pl-4 xpo_pr-4 xpo_border-none xpo_outline-none xpo_text-gray-800 placeholder:xpo_text-gray-400"
            />

            {/* Enhanced Autocomplete */}
            <SearchAutocomplete
              searchTerm={searchTerm}
              visible={autocompleteVisible}
              highlightedIndex={highlightedIndex}
              onSelect={handleAutocompleteSelect}
              autocompleteRef={autocompleteRef}
            />
          </div>

          {/* Search Button */}
          <button aria-label="Search" className="xpo_h-12 xpo_w-12 xpo_bg-scaccent-400 hover:xpo_bg-scaccent-500 xpo_text-scwhite xpo_flex xpo_items-center xpo_justify-center xpo_transition-colors">
            <Search size={20} />
          </button>
        </div>

        {/* Theme Selector */}
        <button onClick={() => toggleTheme()} title="Toggle Light/Dark Mode" className="xpo_cursor-pointer hover:xpo_text-scaccent-300 xpo_transition-colors">
          {theme == 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Selector */}
        <LanguageDropdown 
          currentLanguage={currentLanguage}
          onLanguageSelect={setCurrentLanguage}
        />

        {/* Account & Lists */}
        <AccountDropdown isSignedIn={isSignedIn} />

        {/* Returns & Orders */}
        <Link
          to="/orders/history"
          aria-label="Returns and Orders"
          className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-sm hover:xpo_text-scaccent-300 xpo_transition-colors"
        >
          <Undo size={18} />
          <div className="xpo_text-left xpo_text-scprimary dark:xpo_text-gray-300">
            <div className="xpo_text-xs xpo_leading-tight">Returns</div>
            <div className="xpo_font-semibold">& Orders</div>
          </div>
        </Link>

        {/* Cart */}
        <Link to="/carry" aria-label="Shopping Cart" className="xpo_relative xpo_flex xpo_items-center xpo_gap-2 hover:xpo_text-scaccent-300 xpo_transition-colors">
          <div className="xpo_relative">
            <ShoppingCart size={28} />
            {cart?.length ? <span className="xpo_absolute xpo_-top-2 xpo_-right-2 xpo_bg-scaccent-500 xpo_text-scwhite xpo_text-xs xpo_font-bold xpo_rounded-full xpo_w-6 xpo_h-6 xpo_flex xpo_items-center xpo_justify-center xpo_ring-2 xpo_ring-gray-900">{cart?.length}</span> : null}
          </div>
          <span className="xpo_font-semibold xpo_text-sm">Cart</span>
        </Link>
      </div>
    </header>
  );
}