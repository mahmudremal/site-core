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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
    <div className="xpo_min-h-screen xpo_bg-gray-50">
      {/* Header */}
      <div className="xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-blue-700 xpo_text-white xpo_p-4 xpo_shadow-lg">
        <div className="xpo_max-w-6xl xpo_mx-auto">
          <div className="xpo_flex xpo_items-center xpo_justify-between">
            <div>
              <h1 className="xpo_text-xl xpo_font-bold xpo_flex xpo_items-center xpo_gap-2">
                <Navigation className="xpo_w-6 xpo_h-6" />
                Delivery Navigation
              </h1>
              <p className="xpo_text-sm xpo_opacity-90">Order #{orderId}</p>
            </div>
            <div className="xpo_flex xpo_items-center xpo_gap-2">
              {isTracking ? (
                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-green-500 xpo_px-3 xpo_py-1 xpo_rounded-full xpo_animate-pulse">
                  <Radio className="xpo_w-4 xpo_h-4" />
                  <span className="xpo_text-sm xpo_font-medium">Live</span>
                </div>
              ) : (
                <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_bg-gray-500 xpo_px-3 xpo_py-1 xpo_rounded-full">
                  <AlertCircle className="xpo_w-4 xpo_h-4" />
                  <span className="xpo_text-sm xpo_font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="xpo_max-w-6xl xpo_mx-auto xpo_p-4">
        {/* Stats Cards */}
        <div className="xpo_grid xpo_grid-cols-2 lg:xpo_grid-cols-4 xpo_gap-4 xpo_mb-4">
          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-md xpo_p-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <div className="xpo_bg-blue-100 xpo_p-3 xpo_rounded-lg">
                <MapPin className="xpo_w-5 xpo_h-5 xpo_text-blue-600" />
              </div>
              <div>
                <p className="xpo_text-xs xpo_text-gray-600">Distance</p>
                <p className="xpo_text-lg xpo_font-bold xpo_text-gray-900">
                  {routeInfo ? `${routeInfo.distance} km` : straightLineDistance ? `~${straightLineDistance} km` : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-md xpo_p-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <div className="xpo_bg-green-100 xpo_p-3 xpo_rounded-lg">
                <Clock className="xpo_w-5 xpo_h-5 xpo_text-green-600" />
              </div>
              <div>
                <p className="xpo_text-xs xpo_text-gray-600">ETA</p>
                <p className="xpo_text-lg xpo_font-bold xpo_text-gray-900">
                  {routeInfo ? `${routeInfo.duration} min` : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-md xpo_p-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <div className="xpo_bg-purple-100 xpo_p-3 xpo_rounded-lg">
                <Activity className="xpo_w-5 xpo_h-5 xpo_text-purple-600" />
              </div>
              <div>
                <p className="xpo_text-xs xpo_text-gray-600">Speed</p>
                <p className="xpo_text-lg xpo_font-bold xpo_text-gray-900">
                  {speed} km/h
                </p>
              </div>
            </div>
          </div>

          <div className="xpo_bg-white xpo_rounded-xl xpo_shadow-md xpo_p-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <div className="xpo_bg-orange-100 xpo_p-3 xpo_rounded-lg">
                <Compass className="xpo_w-5 xpo_h-5 xpo_text-orange-600" />
              </div>
              <div>
                <p className="xpo_text-xs xpo_text-gray-600">Accuracy</p>
                <p className="xpo_text-lg xpo_font-bold xpo_text-gray-900">
                  {accuracy > 0 ? `${accuracy}m` : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-4">
          {/* Map */}
          <div className="lg:xpo_col-span-2">
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_overflow-hidden">
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
                      <div className="xpo_text-center">
                        <strong>Your Location</strong>
                        <p className="xpo_text-sm">Accuracy: {accuracy}m</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Destination */}
                  <Marker 
                    position={[destination.lat, destination.lng]}
                    icon={destinationIcon}
                  >
                    <Popup>
                      <div className="xpo_text-center">
                        <strong>{destination.customerName}</strong>
                        <p className="xpo_text-sm">{destination.address}</p>
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
                <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-96 xpo_bg-gray-100">
                  <div className="xpo_text-center">
                    <div className="xpo_animate-spin xpo_w-8 xpo_h-8 xpo_border-4 xpo_border-blue-600 xpo_border-t-transparent xpo_rounded-full xpo_mx-auto xpo_mb-4"></div>
                    <p className="xpo_text-gray-600">Getting your location...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="xpo_mt-4 xpo_flex xpo_gap-4">
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="xpo_flex-1 xpo_bg-green-600 xpo_text-white xpo_py-3 xpo_rounded-xl xpo_font-semibold xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_bg-green-700 xpo_transition-colors xpo_shadow-lg"
                >
                  <Navigation className="xpo_w-5 xpo_h-5" />
                  Start Navigation
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="xpo_flex-1 xpo_bg-red-600 xpo_text-white xpo_py-3 xpo_rounded-xl xpo_font-semibold xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_bg-red-700 xpo_transition-colors xpo_shadow-lg"
                >
                  <AlertCircle className="xpo_w-5 xpo_h-5" />
                  Stop Navigation
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="xpo_space-y-4">
            {/* Customer Info */}
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                <User className="xpo_w-5 xpo_h-5" />
                Customer Details
              </h2>
              <div className="xpo_space-y-3">
                <div>
                  <p className="xpo_text-sm xpo_text-gray-600">Name</p>
                  <p className="xpo_font-medium xpo_text-gray-900">{destination.customerName}</p>
                </div>
                <div>
                  <p className="xpo_text-sm xpo_text-gray-600">Address</p>
                  <p className="xpo_font-medium xpo_text-gray-900 xpo_text-sm">{destination.address}</p>
                </div>
                <a
                  href={`tel:${destination.customerPhone}`}
                  className="xpo_w-full xpo_bg-blue-600 xpo_text-white xpo_py-2 xpo_rounded-lg xpo_font-medium hover:xpo_bg-blue-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_mt-4"
                >
                  <Phone className="xpo_w-4 xpo_h-4" />
                  Call Customer
                </a>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                <Package className="xpo_w-5 xpo_h-5" />
                Delivery Status
              </h2>
              <div className="xpo_space-y-3">
                <select 
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_font-medium xpo_text-gray-900 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
                >
                  <option value="picked_up">Picked Up</option>
                  <option value="on_the_way">On The Way</option>
                  <option value="arrived">Arrived</option>
                  <option value="delivered">Delivered</option>
                </select>
                
                {deliveryStatus !== 'delivered' && (
                  <button
                    onClick={handleDeliveryComplete}
                    className="xpo_w-full xpo_bg-green-600 xpo_text-white xpo_py-3 xpo_rounded-lg xpo_font-semibold hover:xpo_bg-green-700 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                  >
                    <CheckCircle className="xpo_w-5 xpo_h-5" />
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>

            {/* GPS Status */}
            <div className="xpo_bg-white xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4">GPS Status</h2>
              <div className="xpo_space-y-2 xpo_text-sm">
                <div className="xpo_flex xpo_justify-between">
                  <span className="xpo_text-gray-600">Tracking</span>
                  <span className={`xpo_font-semibold ${isTracking ? 'xpo_text-green-600' : 'xpo_text-red-600'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {currentLocation && (
                  <>
                    <div className="xpo_flex xpo_justify-between">
                      <span className="xpo_text-gray-600">Latitude</span>
                      <span className="xpo_font-mono xpo_text-gray-900">{currentLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="xpo_flex xpo_justify-between">
                      <span className="xpo_text-gray-600">Longitude</span>
                      <span className="xpo_font-mono xpo_text-gray-900">{currentLocation.lng.toFixed(6)}</span>
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