import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Search, Loader2 } from 'lucide-react';

const LocationPopup = ({ isOpen, onClose, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Mock autocomplete data - replace with your actual API
  const mockLocations = [
    { id: 1, name: 'New York, NY, USA', lat: 40.7128, lng: -74.0060 },
    { id: 2, name: 'Los Angeles, CA, USA', lat: 34.0522, lng: -118.2437 },
    { id: 3, name: 'Chicago, IL, USA', lat: 41.8781, lng: -87.6298 },
    { id: 4, name: 'Houston, TX, USA', lat: 29.7604, lng: -95.3698 },
    { id: 5, name: 'Phoenix, AZ, USA', lat: 33.4484, lng: -112.0740 },
    { id: 6, name: 'Philadelphia, PA, USA', lat: 39.9526, lng: -75.1652 },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      // Simulate API call - replace with actual geocoding API
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleGPSLocation = () => {
    setIsLoadingGPS(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          name: 'Current Location',
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setIsLoadingGPS(false);
        onLocationSelect(location);
        onClose();
      },
      (err) => {
        setIsLoadingGPS(false);
        setError('Unable to retrieve your location. Please check your permissions.');
      }
    );
  };

  const handleSelectLocation = (location) => {
    onLocationSelect(location);
    onClose();
    setSearchQuery('');
    setSuggestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="xpo_fixed xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
      {/* Backdrop */}
      <div 
        className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-50 xpo_backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="xpo_relative xpo_bg-white xpo_rounded-2xl xpo_shadow-2xl xpo_w-full xpo_max-w-md xpo_max-h-[90vh] xpo_overflow-hidden">
        {/* Header */}
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_p-6 xpo_border-b xpo_border-gray-200">
          <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-900">Select Location</h2>
          <button
            onClick={onClose}
            className="xpo_p-2 xpo_rounded-full xpo_hover:bg-gray-100 xpo_transition-colors"
          >
            <X className="xpo_w-5 xpo_h-5 xpo_text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="xpo_p-6 xpo_space-y-4">
          {/* GPS Location Button */}
          <button
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
            className="xpo_w-full xpo_flex xpo_items-center xpo_justify-center xpo_gap-3 xpo_px-4 xpo_py-3 xpo_bg-blue-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-blue-700 xpo_transition-colors xpo_font-medium disabled:xpo_bg-blue-400 disabled:xpo_cursor-not-allowed"
          >
            {isLoadingGPS ? (
              <>
                <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <Navigation className="xpo_w-5 xpo_h-5" />
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="xpo_p-3 xpo_bg-red-50 xpo_border xpo_border-red-200 xpo_rounded-lg xpo_text-red-700 xpo_text-sm">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="xpo_relative xpo_flex xpo_items-center xpo_gap-4">
            <div className="xpo_flex-1 xpo_h-px xpo_bg-gray-200" />
            <span className="xpo_text-sm xpo_text-gray-500 xpo_font-medium">OR</span>
            <div className="xpo_flex-1 xpo_h-px xpo_bg-gray-200" />
          </div>

          {/* Search Input */}
          <div className="xpo_relative">
            <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city or address"
              className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent"
            />
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="xpo_max-h-64 xpo_overflow-y-auto xpo_border xpo_border-gray-200 xpo_rounded-lg">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="xpo_w-full xpo_flex xpo_items-center xpo_gap-3 xpo_px-4 xpo_py-3 xpo_hover:bg-gray-50 xpo_transition-colors xpo_text-left xpo_border-b xpo_border-gray-100 last:xpo_border-b-0"
                >
                  <MapPin className="xpo_w-5 xpo_h-5 xpo_text-gray-400 xpo_flex-shrink-0" />
                  <span className="xpo_text-gray-700">{location.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {searchQuery.length > 0 && suggestions.length === 0 && (
            <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
              No locations found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage
export default function Location() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-100 xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
      <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg xpo_p-8 xpo_max-w-md xpo_w-full">
        <h1 className="xpo_text-2xl xpo_font-bold xpo_mb-4 xpo_text-gray-900">
          Location Demo
        </h1>
        
        <button
          onClick={() => setIsPopupOpen(true)}
          className="xpo_w-full xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_bg-blue-600 xpo_text-white xpo_rounded-lg xpo_hover:bg-blue-700 xpo_transition-colors xpo_font-medium"
        >
          <MapPin className="xpo_w-5 xpo_h-5" />
          Select Location
        </button>

        {selectedLocation && (
          <div className="xpo_mt-6 xpo_p-4 xpo_bg-green-50 xpo_border xpo_border-green-200 xpo_rounded-lg">
            <p className="xpo_font-medium xpo_text-green-900 xpo_mb-2">Selected Location:</p>
            <p className="xpo_text-green-700">{selectedLocation.name}</p>
            <p className="xpo_text-sm xpo_text-green-600 xpo_mt-1">
              Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      <LocationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}