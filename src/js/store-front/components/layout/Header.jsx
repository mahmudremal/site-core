import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Search, ShoppingCart, User, Undo, Package, Heart, Clock, LogIn, Star, TrendingUp, Sun, Moon } from "lucide-react";
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
import LocationSelector from "../parts/header/LocationSelector";

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
      className="absolute z-30 w-full mt-2 bg-scwhite shadow-2xl rounded-lg border border-gray-200 max-h-96 overflow-hidden"
      role="listbox"
      aria-label={__('Search suggestions', 'site-core')}
    >
      <div className="p-3 border-b bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          {__('Search Suggestions', 'site-core')}
        </h4>
      </div>

      <div className="max-h-80 overflow-auto">
        {filteredSuggestions.map((item, idx) => (
          <div
            key={item.text}
            role="option"
            aria-selected={highlightedIndex === idx}
            onMouseDown={() => onSelect(item.text)}
            className={`group cursor-pointer px-4 py-3 border-b border-gray-100 flex items-center justify-between hover:bg-scaccent-50 transition-all duration-200 ${highlightedIndex === idx ? "bg-scaccent-50" : ""
              }`}
          >
            <div className="flex items-center gap-3">
              <Search size={14} className="text-gray-400" />
              <div dangerouslySetInnerHTML={{ __html: sprintf(__('%s %sin %s %s', 'site-core'), `<div class="text-sm text-gray-800 group-hover:text-scaccent-700">${item.text}</div>`, `<div class="text-xs text-gray-500">`, `</div>`) }}></div>
            </div>
            {item.trending && (
              <div className="flex items-center gap-1 px-2 py-1 bg-scaccent-100 rounded-full">
                <TrendingUp size={12} className="text-scaccent-500" />
                <span className="text-xs text-scaccent-600 font-medium">
                  {__('Trending', 'site-core')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
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
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-l-lg text-sm text-gray-700 font-medium transition-all duration-200 min-w-[160px] justify-between"
        aria-haspopup="listbox"
        aria-expanded="false"
      >
        <span className="truncate">{selectedCategory}</span>
        <ChevronDown size={16} />
      </button>
    )}>
      <div className="bg-scwhite min-w-[200px] max-h-80 overflow-auto">
        <div className="p-3 border-b bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700">
            {__('Browse Categories', 'site-core')}
          </h4>
        </div>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-scaccent-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedCategory === category
                ? "bg-scaccent-50 text-scaccent-700 font-medium"
                : "text-gray-700"
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
          className="flex items-center gap-2 text-sm hover:text-scaccent-300 transition-colors"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="font-medium">{currentLang.name}</span>
          <ChevronDown size={14} />
        </button>
      )}
      className="z-50 bg-scwhite dark:bg-scprimary border rounded shadow mt-2 p-2 min-w-[120px]"
    >
      <div className="rounded-lg min-w-[200px]">
        <div className="p-3 border-b">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-scwhite-700">{__('Choose Language', 'site-core')}</h4>
        </div>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageSelect(language.code)}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-scaccent-50 dark:hover:bg-scprimary transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3 ${currentLanguage === language.code
                ? "bg-scaccent-50 dark:bg-scprimary text-scprimary-700 dark:text-scaccent-700 font-medium"
                : "text-gray-700 dark:text-scwhite-700"
              }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage === language.code && (
              <span className="ml-auto text-scaccent-500">✓</span>
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
          className="flex items-center gap-2 text-sm hover:text-scaccent-300 transition-colors"
          aria-label="Account and Lists"
        >
          <User size={18} />
          <div className="text-left">
            <div className="text-xs leading-tight text-scprimary dark:text-gray-300">
              {isSignedIn ? sprintf(__('Hello, %s', 'site-core'), user?.display_name ?? 'Buddy') : __('Hello, sign in', 'site-core')}
            </div>
            <div className="font-semibold text-scprimary dark:text-scwhite">{__('Account & Lists', 'site-core')}</div>
          </div>
          <ChevronDown size={14} />
        </button>
      )}
      className="z-50 bg-scwhite dark:bg-scprimary border rounded shadow mt-2 p-2 min-w-[120px]"
    >
      <div className="min-w-[280px]">
        {!isSignedIn ? (
          <div className="p-4 border-b text-center flex flex-col gap-2">
            <Link to="/auth/signin" className="w-full bg-scaccent-400 hover:bg-scaccent-500 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors mb-2">
              <LogIn size={16} className="inline mr-2" />
              {__('Sign In', 'site-core')}
            </Link>
            <div className="text-xs text-gray-600">
              {__('New customer?', 'site-core')}
              <Link to="/auth/register" className="text-scaccent-600 hover:text-scaccent-700 ml-1">
                {__('Start here', 'site-core')}
              </Link>
            </div>
          </div>
        ) : null}

        <div className="p-2">
          <div className="mb-3 flex flex-col">
            <h4 className="text-sm font-semibold text-gray-700 px-2 py-2">
              {__('Your Lists', 'site-core')}
            </h4>
            <Link to="/my-bookmark" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Heart size={16} className="inline mr-3 text-gray-400" />
              {__('Create a List', 'site-core')}
            </Link>
            <Link to="/my-bookmark" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Search size={16} className="inline mr-3 text-gray-400" />
              {__('Find a List or Registry', 'site-core')}
            </Link>
          </div>

          <div className="border-t pt-3 flex flex-col">
            <h4 className="text-sm font-semibold text-gray-700 px-2 py-2">
              {__('Your Account', 'site-core')}
            </h4>
            <Link to="/clients-portal/my/overview" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <User size={16} className="inline mr-3 text-gray-400" />
              {__('Account', 'site-core')}
            </Link>
            <Link to="/orders/history" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Package size={16} className="inline mr-3 text-gray-400" />
              {__('Orders', 'site-core')}
            </Link>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Star size={16} className="inline mr-3 text-gray-400" />
              {__('Recommendations', 'site-core')}
            </button>
            <Link to="/history/products" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Clock size={16} className="inline mr-3 text-gray-400" />
              {__('Browsing History', 'site-core')}
            </Link>
            {/* <Link to="/watch/history" className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Heart size={16} className="inline mr-3 text-gray-400" />
              {__('Watchlist', 'site-core')}
            </Link>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Video size={16} className="inline mr-3 text-gray-400" />
              {__('Video Purchases & Rentals', 'site-core')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <BookOpen size={16} className="inline mr-3 text-gray-400" />
              {__('Kindle Unlimited', 'site-core')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Settings size={16} className="inline mr-3 text-gray-400" />
              {__('Content & Devices', 'site-core')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <ListOrdered size={16} className="inline mr-3 text-gray-400" />
              {__('Subscribe & Save Items', 'site-core')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Settings size={16} className="inline mr-3 text-gray-400" />
              {__('Memberships & Subscriptions', 'site-core')}
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 hover:bg-gray-50 dark:hover:bg-scprimary-700 rounded">
              <Music size={16} className="inline mr-3 text-gray-400" />
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
  const { loggedin } = useAuth();
  const { money } = useCurrency();
  const { setPopup } = usePopup();
  const [country, setCountry] = useState('BD');

  return (
    <div className="p-2 min-w-sm">
      <div className="text-gray-700 dark:text-scwhite-700 mb-4">
        <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sprintf(__('We\'re showing you items that ship to %sBangladesh%s. To see items that ship to a different country, change your delivery address.', 'site-core'), '<strong>', '</strong>') }}>
        </p>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-sm text-gray-700 dark:text-scwhite-700 transition-colors">
          {__('Dismiss', 'site-core')}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setPopup(
              <div className="p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-2">{__('Choose your location', 'site-core')}</h3>
                <p className="text-sm text-gray-600 dark:text-scwhite-600 mb-4">
                  {__('Delivery options and delivery speeds may vary for different locations', 'site-core')}
                </p>

                {!loggedin && (
                  <Link to="/auth/signin" className="w-full bg-scaccent-400 hover:bg-scaccent-500 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors mb-4">
                    {__('Sign in to see your addresses', 'site-core')}
                  </Link>
                )}

                <div className="text-center text-sm text-gray-500 dark:text-scwhite-500 mb-4">{__('or enter a zip code', 'site-core')}</div>

                <LocationSelector __={__} onChangeCountry={(countryCode) => setCountry(countryCode)} />

                <div className="text-center text-sm text-gray-500 dark:text-scwhite mb-4">{__('or ship outside the Bangladesh', 'site-core')}</div>

                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full border text-gray-500 dark:text-scwhite-300 bg-scwhite dark:bg-scprimary border-gray-300 dark:border-scwhite rounded px-3 py-2 text-sm mb-4"
                >
                  <option value="BD">Bangladesh</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CD">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="IN">India</option>
                  <option value="GR">Germany</option>
                  <option value="FR">France</option>
                </select>

                <button onClick={(e) => { e.preventDefault(); setPopup(null); }} className="w-full bg-scaccent-600 hover:bg-scaccent-700 text-scwhite py-2 px-4 rounded-lg font-medium transition-colors">{__('Done', 'site-core')}</button>
              </div>
            );
          }}
          className="bg-scaccent-600 hover:bg-scaccent-700 text-scwhite px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
        >
          {__('Change Address', 'site-core')}
        </button>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const { cart } = useCart();
  const { money } = useCurrency();
  const { loggedin } = useAuth();
  const { switchLanguage, __ } = useLocale();
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
    <header className="bg-scwhite dark:bg-scprimary bg-gradient-to-t from-scwhite-700 dark:from-scprimary-700 via-scwhite-600 dark:via-scprimary-600 to-scwhite-500 dark:to-scprimary-500 text-primary dark:text-scwhite">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <MoonlitMeadowLogo />
        </Link>

        {/* Delivery Location */}
        <Dropdown
          button={(
            <div className="flex items-center gap-1 text-sm cursor-pointer hover:text-scaccent-300 transition-colors hidden lg:flex">
              <MapPin size={18} />
              <div dangerouslySetInnerHTML={{ __html: sprintf(__('Deliver to %s%s%s', 'site-core'), '<strong>', __('Bangladesh', 'site-core'), '</strong>') }}></div>
              <ChevronDown size={14} />
            </div>
          )}
          className="z-50 bg-scwhite dark:bg-scprimary border rounded shadow mt-2 p-2 min-w-[120px]"
        >
          <DeliveryZonePicker />
        </Dropdown>

        {/* Search Section */}
        <div className="flex flex-1 items-center bg-scwhite rounded-lg shadow-md">
          {/* Categories Dropdown */}
          <CategoriesDropdown
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              aria-label={__('Search products', 'site-core')}
              ref={inputRef}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setAutocompleteVisible(true);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setAutocompleteVisible(true)}
              placeholder={sprintf(__('Search %s', 'site-core'), selectedCategory === "All Categories" ? "products" : selectedCategory)}
              className="w-full h-12 pl-4 pr-4 border-none outline-none text-gray-800 placeholder:text-gray-400"
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
          <button aria-label={__('Search', 'site-core')} className="h-12 w-12 bg-scaccent-400 hover:bg-scaccent-500 text-scwhite flex items-center justify-center transition-colors">
            <Search size={20} />
          </button>
        </div>

        {/* Theme Selector */}
        <button onClick={() => toggleTheme()} title={__('Toggle Light/Dark Mode', 'site-core')} className="cursor-pointer hover:text-scaccent-300 transition-colors">
          {theme == 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Language Selector */}
        <LanguageDropdown
          currentLanguage={currentLanguage}
          onLanguageSelect={(lang) => switchLanguage(lang).then(() => setCurrentLanguage(lang))}
        />

        {/* Account & Lists */}
        <AccountDropdown isSignedIn={isSignedIn} />

        {/* Returns & Orders */}
        <Link
          to="/orders/history"
          aria-label={__('Returns and Orders', 'site-core')}
          className="flex items-center gap-2 text-sm hover:text-scaccent-300 transition-colors"
        >
          <Undo size={18} />
          <div className="text-left text-scprimary dark:text-gray-300">
            <div className="text-xs leading-tight">{__('Returns', 'site-core')}</div>
            <div className="font-semibold">{__('& Orders', 'site-core')}</div>
          </div>
        </Link>

        {/* Cart */}
        <Link to="/carry" aria-label={__('Shopping Cart', 'site-core')} className="relative flex items-center gap-2 hover:text-scaccent-300 transition-colors">
          <div className="relative">
            <ShoppingCart size={28} />
            {cart?.cart_items?.length ? <span className="absolute -top-2 -right-2 bg-scaccent-500 text-scwhite text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ring-2 ring-gray-900">{cart?.cart_items?.length}</span> : null}
          </div>
          <span className="font-semibold text-sm">{__('Cart', 'site-core')}</span>
        </Link>
      </div>
    </header>
  );
}