import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import {
  Navigation,
  MapPin,
  Clock,
  Phone,
  User,
  Package,
  CheckCircle,
  AlertCircle,
  Radio,
  Compass,
  Activity
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, iconSvg, pulse = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 44px; height: 44px; border-radius: 50%; border: 4px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; ${pulse ? 'animation: pulse 2s infinite;' : ''}">
      ${iconSvg}
    </div>
    ${pulse ? `<style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 ${color}80; }
        50% { box-shadow: 0 0 0 15px ${color}00; }
      }
    </style>` : ''}`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  });
};

const currentLocationIcon = createCustomIcon('#10b981',
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
    <circle cx="12" cy="12" r="8"></circle>
  </svg>`,
  true
);

const destinationIcon = createCustomIcon('#ef4444',
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  </svg>`
);

// Map updater component
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Routing component using OSRM
function RouteLayer({ start, end, onRouteCalculated }) {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!start || !end) return;

    // Fetch route from OSRM (Open Source Routing Machine)
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(coords);

          if (onRouteCalculated) {
            onRouteCalculated({
              distance: (route.distance / 1000).toFixed(2), // km
              duration: Math.ceil(route.duration / 60) // minutes
            });
          }
        }
      })
      .catch(err => console.error('Route calculation failed:', err));
  }, [start, end]);

  if (routeCoords.length === 0) return null;

  return (
    <Polyline
      positions={routeCoords}
      pathOptions={{
        color: '#3b82f6',
        weight: 6,
        opacity: 0.8
      }}
    />
  );
}

export default function DeliveryManTracker() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState({
    lat: 22.3569,
    lng: 91.7832,
    address: 'House 45, Road 12, Lakshmipur, Chittagong',
    customerName: 'Md. Karim',
    customerPhone: '+880 1712-345678'
  });
  const [orderId] = useState('ORD-12345');
  const [isTracking, setIsTracking] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [heading, setHeading] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState('picked_up'); // picked_up, on_the_way, arrived, delivered
  const watchIdRef = useRef(null);

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your device');
      return;
    }

    setIsTracking(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;

        const newLocation = {
          lat: latitude,
          lng: longitude
        };

        setCurrentLocation(newLocation);
        setAccuracy(Math.round(accuracy));
        setHeading(heading);
        setSpeed(speed ? (speed * 3.6).toFixed(1) : 0); // Convert m/s to km/h

        // Send location to backend
        sendLocationToBackend(newLocation, orderId);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enable GPS.');
      },
      options
    );
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Send location to backend API
  const sendLocationToBackend = async (location, orderId) => {
    try {
      // Replace with your actual API endpoint
      await fetch('/api/delivery/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          latitude: location.lat,
          longitude: location.lng,
          timestamp: new Date().toISOString(),
          status: deliveryStatus
        })
      });
    } catch (error) {
      console.error('Failed to send location:', error);
    }
  };

  // Get initial location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to demo location
          setCurrentLocation({
            lat: 22.3475,
            lng: 91.8123
          });
        }
      );
    } else {
      // Fallback to demo location
      setCurrentLocation({
        lat: 22.3475,
        lng: 91.8123
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleRouteCalculated = (info) => {
    setRouteInfo(info);
  };

  const handleDeliveryComplete = () => {
    setDeliveryStatus('delivered');
    stopTracking();
    alert('Delivery marked as complete!');
  };

  const mapCenter = currentLocation
    ? [(currentLocation.lat + destination.lat) / 2, (currentLocation.lng + destination.lng) / 2]
    : [destination.lat, destination.lng];

  const straightLineDistance = currentLocation
    ? calculateDistance(currentLocation.lat, currentLocation.lng, destination.lat, destination.lng)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Navigation className="w-6 h-6" />
                Delivery Navigation
              </h1>
              <p className="text-sm opacity-90">Order #{orderId}</p>
            </div>
            <div className="flex items-center gap-2">
              {isTracking ? (
                <div className="flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full animate-pulse">
                  <Radio className="w-4 h-4" />
                  <span className="text-sm font-medium">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-500 px-3 py-1 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Distance</p>
                <p className="text-lg font-bold text-gray-900">
                  {routeInfo ? `${routeInfo.distance} km` : straightLineDistance ? `~${straightLineDistance} km` : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">ETA</p>
                <p className="text-lg font-bold text-gray-900">
                  {routeInfo ? `${routeInfo.duration} min` : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Speed</p>
                <p className="text-lg font-bold text-gray-900">
                  {speed} km/h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Compass className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Accuracy</p>
                <p className="text-lg font-bold text-gray-900">
                  {accuracy > 0 ? `${accuracy}m` : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {currentLocation ? (
                <MapContainer
                  center={mapCenter}
                  zoom={14}
                  style={{ height: '500px', width: '100%' }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Current location */}
                  <Marker
                    position={[currentLocation.lat, currentLocation.lng]}
                    icon={currentLocationIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>Your Location</strong>
                        <p className="text-sm">Accuracy: {accuracy}m</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination */}
                  <Marker
                    position={[destination.lat, destination.lng]}
                    icon={destinationIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>{destination.customerName}</strong>
                        <p className="text-sm">{destination.address}</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route */}
                  <RouteLayer
                    start={[currentLocation.lat, currentLocation.lng]}
                    end={[destination.lat, destination.lng]}
                    onRouteCalculated={handleRouteCalculated}
                  />

                  <MapUpdater center={mapCenter} zoom={14} />
                </MapContainer>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting your location...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="mt-4 flex gap-4">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Navigation className="w-5 h-5" />
                  Start Navigation
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  Stop Navigation
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Details
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{destination.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900 text-sm">{destination.address}</p>
                </div>
                <a
                  href={`tel:${destination.customerPhone}`}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </a>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Delivery Status
              </h2>
              <div className="space-y-3">
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="picked_up">Picked Up</option>
                  <option value="on_the_way">On The Way</option>
                  <option value="arrived">Arrived</option>
                  <option value="delivered">Delivered</option>
                </select>

                {deliveryStatus !== 'delivered' && (
                  <button
                    onClick={handleDeliveryComplete}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>

            {/* GPS Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">GPS Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking</span>
                  <span className={`font-semibold ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {currentLocation && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitude</span>
                      <span className="font-mono text-gray-900">{currentLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitude</span>
                      <span className="font-mono text-gray-900">{currentLocation.lng.toFixed(6)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}