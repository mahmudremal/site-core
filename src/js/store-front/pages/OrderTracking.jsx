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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-scwhite rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
              <p className="text-gray-600">Order ID: {trackingData.orderId}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                <Clock className="w-5 h-5" />
                <span>ETA: {trackingData.estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="flex items-center justify-between relative mt-8">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-scwhite rounded-2xl shadow-lg overflow-hidden">
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
                    <div className="text-center">
                      <strong>Delivery Address</strong>
                      <p className="text-sm">{trackingData.customerLocation.address}</p>
                    </div>
                  </Popup>
                </AnimatedMarker>

                {/* Delivery person marker */}
                <AnimatedMarker
                  position={[trackingData.deliveryLocation.lat, trackingData.deliveryLocation.lng]}
                  icon={deliveryIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{trackingData.deliveryPerson.name}</strong>
                      <p className="text-sm">{trackingData.deliveryPerson.vehicle}</p>
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
          <div className="space-y-6">
            {/* Delivery Person Info */}
            <div className="bg-scwhite rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Delivery Person
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{trackingData.deliveryPerson.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-medium text-gray-900">{trackingData.deliveryPerson.vehicle}</p>
                </div>
                <button className="w-full bg-scprimary text-scwhite py-2 rounded-lg font-medium hover:bg-scprimary-800 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call {trackingData.deliveryPerson.phone}
                </button>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-scwhite rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h2>
              <p className="text-gray-700">{trackingData.customerLocation.address}</p>
            </div>

            {/* Order Summary */}
            <div className="bg-scwhite rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{trackingData.orderDetails.items}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-lg">{trackingData.orderDetails.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}