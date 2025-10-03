import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { MapPin, Package, Truck, Clock, CheckCircle, Phone, User, ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, iconSvg) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      ${iconSvg}
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const customerIcon = createCustomIcon('#ef4444', 
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  </svg>`
);

const deliveryIcon = createCustomIcon('#10b981',
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>`
);

// Component to update map view
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Component to animate marker
function AnimatedMarker({ position, icon, children }) {
  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
}

export default function OrderTracking() {
  const [trackingData, setTrackingData] = useState({
    orderId: 'ORD-12345',
    status: 'out_for_delivery',
    deliveryPerson: {
      name: 'Ahmed Hassan',
      phone: '+880 1712-345678',
      vehicle: 'Motorcycle'
    },
    customerLocation: {
      lat: 22.3569,
      lng: 91.7832,
      address: 'House 45, Road 12, Lakshmipur, Chittagong'
    },
    deliveryLocation: {
      lat: 22.3475,
      lng: 91.8123
    },
    estimatedTime: '15 mins',
    orderDetails: {
      items: 3,
      total: '৳2,450'
    }
  });

  const statusSteps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin }
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  // Simulate delivery movement
  useEffect(() => {
    let step = 0;
    const steps = 50;
    const startLat = 22.3475;
    const startLng = 91.8123;
    const endLat = trackingData.customerLocation.lat;
    const endLng = trackingData.customerLocation.lng;

    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval);
        setTrackingData(prev => ({ ...prev, status: 'delivered', estimatedTime: 'Delivered' }));
        return;
      }

      step++;
      const progress = step / steps;
      const newLat = startLat + (endLat - startLat) * progress;
      const newLng = startLng + (endLng - startLng) * progress;

      const remainingMins = Math.ceil(15 * (1 - progress));
      setTrackingData(prev => ({
        ...prev,
        deliveryLocation: { lat: newLat, lng: newLng },
        estimatedTime: remainingMins > 0 ? `${remainingMins} mins` : 'Arriving now'
      }));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const currentStatusIndex = getStatusIndex(trackingData.status);
  const mapCenter = [
    (trackingData.customerLocation.lat + trackingData.deliveryLocation.lat) / 2,
    (trackingData.customerLocation.lng + trackingData.deliveryLocation.lng) / 2
  ];

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_p-4">
      <div className="xpo_max-w-6xl xpo_mx-auto">
        {/* Header */}
        <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6 xpo_mb-6">
          <div className="xpo_flex xpo_items-center xpo_gap-4 xpo_mb-6">
            <button className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-gray-600 hover:xpo_text-gray-900 xpo_transition-colors">
              <ArrowLeft className="xpo_w-5 xpo_h-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <div>
              <h1 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">Track Your Order</h1>
              <p className="xpo_text-gray-600">Order ID: {trackingData.orderId}</p>
            </div>
            <div className="xpo_text-right">
              <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_text-blue-600 xpo_font-semibold">
                <Clock className="xpo_w-5 xpo_h-5" />
                <span>ETA: {trackingData.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_relative xpo_mt-8">
            <div className="xpo_absolute xpo_top-5 xpo_left-0 xpo_right-0 xpo_h-1 xpo_bg-gray-200">
              <div 
                className="xpo_h-full xpo_bg-blue-600 xpo_transition-all xpo_duration-500"
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              return (
                <div key={step.key} className="xpo_flex xpo_flex-col xpo_items-center xpo_relative xpo_z-10">
                  <div className={`xpo_w-10 xpo_h-10 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_transition-all xpo_duration-300 ${
                    isCompleted ? 'xpo_bg-blue-600 xpo_text-white' : 'xpo_bg-gray-200 xpo_text-gray-400'
                  }`}>
                    <Icon className="xpo_w-5 xpo_h-5" />
                  </div>
                  <span className={`xpo_mt-2 xpo_text-xs xpo_font-medium ${
                    isCompleted ? 'xpo_text-blue-600' : 'xpo_text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_gap-6">
          {/* Map */}
          <div className="lg:xpo_col-span-2">
            <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_overflow-hidden">
              <MapContainer 
                center={mapCenter}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Customer location marker */}
                <AnimatedMarker 
                  position={[trackingData.customerLocation.lat, trackingData.customerLocation.lng]}
                  icon={customerIcon}
                >
                  <Popup>
                    <div className="xpo_text-center">
                      <strong>Delivery Address</strong>
                      <p className="xpo_text-sm">{trackingData.customerLocation.address}</p>
                    </div>
                  </Popup>
                </AnimatedMarker>

                {/* Delivery person marker */}
                <AnimatedMarker 
                  position={[trackingData.deliveryLocation.lat, trackingData.deliveryLocation.lng]}
                  icon={deliveryIcon}
                >
                  <Popup>
                    <div className="xpo_text-center">
                      <strong>{trackingData.deliveryPerson.name}</strong>
                      <p className="xpo_text-sm">{trackingData.deliveryPerson.vehicle}</p>
                    </div>
                  </Popup>
                </AnimatedMarker>

                {/* Route line */}
                <Polyline
                  positions={[
                    [trackingData.deliveryLocation.lat, trackingData.deliveryLocation.lng],
                    [trackingData.customerLocation.lat, trackingData.customerLocation.lng]
                  ]}
                  pathOptions={{ 
                    color: '#3b82f6', 
                    weight: 4, 
                    opacity: 0.7,
                    dashArray: '10, 10'
                  }}
                />

                <MapUpdater center={mapCenter} zoom={13} />
              </MapContainer>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="xpo_space-y-6">
            {/* Delivery Person Info */}
            <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                <User className="xpo_w-5 xpo_h-5" />
                Delivery Person
              </h2>
              <div className="xpo_space-y-3">
                <div>
                  <p className="xpo_text-sm xpo_text-gray-600">Name</p>
                  <p className="xpo_font-medium xpo_text-gray-900">{trackingData.deliveryPerson.name}</p>
                </div>
                <div>
                  <p className="xpo_text-sm xpo_text-gray-600">Vehicle</p>
                  <p className="xpo_font-medium xpo_text-gray-900">{trackingData.deliveryPerson.vehicle}</p>
                </div>
                <button className="xpo_w-full xpo_bg-scprimary xpo_text-scwhite xpo_py-2 xpo_rounded-lg xpo_font-medium hover:xpo_bg-scprimary-800 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
                  <Phone className="xpo_w-4 xpo_h-4" />
                  Call {trackingData.deliveryPerson.phone}
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                <MapPin className="xpo_w-5 xpo_h-5" />
                Delivery Address
              </h2>
              <p className="xpo_text-gray-700">{trackingData.customerLocation.address}</p>
            </div>

            {/* Order Summary */}
            <div className="xpo_bg-scwhite xpo_rounded-2xl xpo_shadow-lg xpo_p-6">
              <h2 className="xpo_text-lg xpo_font-bold xpo_text-gray-900 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                <Package className="xpo_w-5 xpo_h-5" />
                Order Summary
              </h2>
              <div className="xpo_space-y-2">
                <div className="xpo_flex xpo_justify-between">
                  <span className="xpo_text-gray-600">Items</span>
                  <span className="xpo_font-medium">{trackingData.orderDetails.items}</span>
                </div>
                <div className="xpo_flex xpo_justify-between xpo_pt-2 xpo_border-t xpo_border-gray-200">
                  <span className="xpo_text-gray-600">Total</span>
                  <span className="xpo_font-bold xpo_text-lg">{trackingData.orderDetails.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}