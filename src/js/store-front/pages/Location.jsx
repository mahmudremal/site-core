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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Location</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* GPS Location Button */}
          <button
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoadingGPS ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city or address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                >
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{location.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {searchQuery.length > 0 && suggestions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Location Demo
        </h1>

        <button
          onClick={() => setIsPopupOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <MapPin className="w-5 h-5" />
          Select Location
        </button>

        {selectedLocation && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-900 mb-2">Selected Location:</p>
            <p className="text-green-700">{selectedLocation.name}</p>
            <p className="text-sm text-green-600 mt-1">
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