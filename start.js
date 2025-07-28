const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Store connected devices and their data
// const devices = new Map();
// const detections = new Map();

// // Utility functions for GPS calculations
// class LocationCalculator {
//   // Convert degrees to radians
//   static toRadians(degrees) {
//     return degrees * (Math.PI / 180);
//   }

//   // Calculate distance between two GPS coordinates (Haversine formula)
//   static calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371000; // Earth's radius in meters
//     const dLat = this.toRadians(lat2 - lat1);
//     const dLon = this.toRadians(lon2 - lon1);
    
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
    
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c; // Distance in meters
//   }

//   // Calculate bearing between two points
//   static calculateBearing(lat1, lon1, lat2, lon2) {
//     const dLon = this.toRadians(lon2 - lon1);
//     const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
//     const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
//               Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
    
//     let bearing = Math.atan2(y, x);
//     bearing = (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees
//     return bearing;
//   }

//   // Triangulate object position using multiple device positions and distances
//   static triangulatePosition(deviceData) {
//     if (deviceData.length < 2) return null;

//     // Use weighted least squares trilateration
//     let sumX = 0, sumY = 0, totalWeight = 0;

//     // Convert GPS to cartesian coordinates for calculation
//     const cartesianPoints = deviceData.map(d => ({
//       x: d.gps.longitude * 111320 * Math.cos(this.toRadians(d.gps.latitude)),
//       y: d.gps.latitude * 110540,
//       distance: d.estimatedDistance,
//       weight: 1 / (d.estimatedDistance + 1) // Higher weight for closer devices
//     }));

//     // Simple trilateration using circles intersection
//     if (deviceData.length >= 3) {
//       return this.trilaterateThreePoints(cartesianPoints);
//     } else {
//       // Use two points method
//       return this.bilaterateFromBearing(deviceData);
//     }
//   }

//   static trilaterateThreePoints(points) {
//     const [p1, p2, p3] = points;
    
//     // Calculate intersection of three circles
//     const A = 2 * (p2.x - p1.x);
//     const B = 2 * (p2.y - p1.y);
//     const C = p1.distance * p1.distance - p2.distance * p2.distance - p1.x * p1.x + p2.x * p2.x - p1.y * p1.y + p2.y * p2.y;
//     const D = 2 * (p3.x - p2.x);
//     const E = 2 * (p3.y - p2.y);
//     const F = p2.distance * p2.distance - p3.distance * p3.distance - p2.x * p2.x + p3.x * p3.x - p2.y * p2.y + p3.y * p3.y;
    
//     const denominator = A * E - B * D;
//     if (Math.abs(denominator) < 0.0001) return null;
    
//     const x = (C * E - F * B) / denominator;
//     const y = (A * F - D * C) / denominator;
    
//     // Convert back to GPS coordinates
//     const latitude = y / 110540;
//     const longitude = x / (111320 * Math.cos(this.toRadians(latitude)));
    
//     return { latitude, longitude };
//   }

//   static bilaterateFromBearing(deviceData) {
//     if (deviceData.length < 2) return null;
    
//     const [d1, d2] = deviceData;
//     const bearing1 = d1.cameraAngle || 0;
//     const bearing2 = d2.cameraAngle || 0;
    
//     // Calculate intersection point using bearing and distance
//     const lat1 = this.toRadians(d1.gps.latitude);
//     const lon1 = this.toRadians(d1.gps.longitude);
//     const bearing1Rad = this.toRadians(bearing1);
//     const distance1 = d1.estimatedDistance;
    
//     // Calculate object position from first device
//     const objLat = Math.asin(Math.sin(lat1) * Math.cos(distance1/6371000) + 
//                             Math.cos(lat1) * Math.sin(distance1/6371000) * Math.cos(bearing1Rad));
//     const objLon = lon1 + Math.atan2(Math.sin(bearing1Rad) * Math.sin(distance1/6371000) * Math.cos(lat1),
//                                     Math.cos(distance1/6371000) - Math.sin(lat1) * Math.sin(objLat));
    
//     return {
//       latitude: objLat * 180 / Math.PI,
//       longitude: objLon * 180 / Math.PI
//     };
//   }
// }

// // Calculate accuracy based on device spread and distance consistency
// function calculateAccuracy(detections) {
//   if (detections.length < 2) return 0;
  
//   // Calculate spread of devices
//   let minLat = Math.min(...detections.map(d => d.gps.latitude));
//   let maxLat = Math.max(...detections.map(d => d.gps.latitude));
//   let minLon = Math.min(...detections.map(d => d.gps.longitude));
//   let maxLon = Math.max(...detections.map(d => d.gps.longitude));
  
//   let spread = Math.sqrt(Math.pow(maxLat - minLat, 2) + Math.pow(maxLon - minLon, 2));
  
//   // Higher spread generally means better triangulation
//   let accuracyScore = Math.min(spread * 1000, 100); // Convert to percentage
  
//   return accuracyScore;
// }

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log(`Device connected: ${socket.id}`);

//   // Register device with GPS location
//   socket.on('register-device', (data) => {
//     devices.set(socket.id, {
//       id: socket.id,
//       name: data.deviceName || `Device-${socket.id.substr(0, 5)}`,
//       gps: data.gps,
//       capabilities: data.capabilities || ['camera', 'gps'],
//       status: 'connected',
//       battery: data.battery || null,
//       lastSeen: Date.now()
//     });

//     console.log(`Device registered: ${data.deviceName} at ${data.gps.latitude}, ${data.gps.longitude}`);
    
//     // Broadcast updated device list
//     io.emit('devices-updated', Array.from(devices.values()));
//   });

//   // Handle object detection data
//   socket.on('object-detected', (data) => {
//     const device = devices.get(socket.id);
//     if (!device) return;

//     const detection = {
//       deviceId: socket.id,
//       deviceName: device.name,
//       objectType: data.objectType,
//       confidence: data.confidence,
//       boundingBox: data.boundingBox,
//       timestamp: Date.now(),
//       gps: device.gps,
//       estimatedDistance: data.estimatedDistance,
//       cameraAngle: data.cameraAngle || 0,
//       imageData: data.imageData // Base64 encoded image
//     };

//     // Store detection
//     if (!detections.has(data.objectId)) {
//       detections.set(data.objectId, []);
//     }
//     detections.get(data.objectId).push(detection);

//     console.log(`Object detected by ${device.name}: ${data.objectType} at distance ${data.estimatedDistance}m`);

//     // Calculate object location if we have multiple detections
//     const objectDetections = detections.get(data.objectId);
//     if (objectDetections.length >= 2) {
//       const calculatedLocation = LocationCalculator.triangulatePosition(objectDetections);
      
//       if (calculatedLocation) {
//         const locationResult = {
//           objectId: data.objectId,
//           objectType: data.objectType,
//           location: calculatedLocation,
//           confidence: objectDetections.reduce((avg, d) => avg + d.confidence, 0) / objectDetections.length,
//           detectedBy: objectDetections.map(d => d.deviceName),
//           timestamp: Date.now(),
//           accuracy: calculateAccuracy(objectDetections)
//         };

//         // Broadcast calculated location to all devices
//         io.emit('object-location-calculated', locationResult);
//         console.log(`Object location calculated: ${calculatedLocation.latitude}, ${calculatedLocation.longitude}`);
//       }
//     }

//     // Broadcast detection to all devices
//     io.emit('object-detection', detection);
//   });

//   // Handle GPS updates
//   socket.on('gps-update', (data) => {
//     const device = devices.get(socket.id);
//     if (device) {
//       device.gps = data.gps;
//       device.lastSeen = Date.now();
//       io.emit('devices-updated', Array.from(devices.values()));
//     }
//   });

//   // Handle device status updates
//   socket.on('device-status', (data) => {
//     const device = devices.get(socket.id);
//     if (device) {
//       device.status = data.status;
//       device.battery = data.battery;
//       device.lastSeen = Date.now();
//       io.emit('devices-updated', Array.from(devices.values()));
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(`Device disconnected: ${socket.id}`);
//     devices.delete(socket.id);
//     io.emit('devices-updated', Array.from(devices.values()));
//   });

//   // Get current connected devices
//   socket.on('get-devices', () => {
//     socket.emit('devices-updated', Array.from(devices.values()));
//   });

//   // Clear all detections (admin function)
//   socket.on('clear-detections', () => {
//     detections.clear();
//     io.emit('detections-cleared');
//   });

//   // Simulate object detection for testing
//   socket.on('simulate-detection', () => {
//     const device = devices.get(socket.id);
//     if (!device) return;

//     const objectTypes = ['person', 'car', 'bicycle', 'dog', 'cat'];
//     const randomObject = objectTypes[Math.floor(Math.random() * objectTypes.length)];
    
//     const simulatedDetection = {
//       objectId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       objectType: randomObject,
//       confidence: 0.7 + Math.random() * 0.3,
//       boundingBox: {
//         x: Math.random() * 640,
//         y: Math.random() * 480,
//         width: 50 + Math.random() * 100,
//         height: 80 + Math.random() * 150
//       },
//       estimatedDistance: 5 + Math.random() * 50,
//       cameraAngle: Math.random() * 360,
//       imageData: 'simulated_image_data'
//     };

//     // Emit the simulated detection
//     socket.emit('object-detected', simulatedDetection);
//     console.log(`Simulated detection: ${randomObject} by ${device.name}`);
//   });

//   // Handle ping for connection testing
//   socket.on('ping', (callback) => {
//     if (callback) callback('pong');
//   });
// });

// // REST API endpoints
// app.get('/api/devices', (req, res) => {
//   res.json(Array.from(devices.values()));
// });

// app.get('/api/detections', (req, res) => {
//   const allDetections = [];
//   for (let [objectId, objectDetections] of detections) {
//     allDetections.push({
//       objectId,
//       detections: objectDetections
//     });
//   }
//   res.json(allDetections);
// });

// app.get('/api/stats', (req, res) => {
//   const stats = {
//     connectedDevices: devices.size,
//     totalDetections: Array.from(detections.values()).reduce((sum, arr) => sum + arr.length, 0),
//     uniqueObjects: detections.size,
//     averageAccuracy: calculateAverageAccuracy(),
//     uptime: process.uptime()
//   };
//   res.json(stats);
// });

// app.get('/api/locations', (req, res) => {
//   const locations = [];
//   for (let [objectId, objectDetections] of detections) {
//     if (objectDetections.length >= 2) {
//       const calculatedLocation = LocationCalculator.triangulatePosition(objectDetections);
//       if (calculatedLocation) {
//         locations.push({
//           objectId,
//           objectType: objectDetections[0].objectType,
//           location: calculatedLocation,
//           accuracy: calculateAccuracy(objectDetections),
//           detectedBy: objectDetections.map(d => d.deviceName),
//           timestamp: Math.max(...objectDetections.map(d => d.timestamp))
//         });
//       }
//     }
//   }
//   res.json(locations);
// });

// // Calculate average accuracy for stats
// function calculateAverageAccuracy() {
//   const accuracies = [];
//   for (let [objectId, objectDetections] of detections) {
//     if (objectDetections.length >= 2) {
//       accuracies.push(calculateAccuracy(objectDetections));
//     }
//   }
//   return accuracies.length > 0 ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length : 0;
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     connectedDevices: devices.size
//   });
// });

// // Serve client interface - create a simple HTML page if no public folder exists
// app.get('/', (req, res) => {
//   const htmlPath = path.join(__dirname, 'public', 'index.html');
  
//   // Try to serve the HTML file, if it doesn't exist, serve a simple default
//   res.sendFile(htmlPath, (err) => {
//     if (err) {
//       res.send(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>Object Detection Server</title>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//                 body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
//                 .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
//                 h1 { color: #333; }
//                 .status { background: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0; }
//                 .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
//                 code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <h1>Object Detection Location System</h1>
//                 <div class="status">
//                     ✅ Server is running successfully!
//                 </div>
//                 <p>This is a multi-device object detection and location calculation system.</p>
                
//                 <h3>Available API Endpoints:</h3>
//                 <div class="endpoint">
//                     <strong>GET /api/devices</strong> - Get all connected devices
//                 </div>
//                 <div class="endpoint">
//                     <strong>GET /api/detections</strong> - Get all object detections
//                 </div>
//                 <div class="endpoint">
//                     <strong>GET /api/locations</strong> - Get calculated object locations
//                 </div>
//                 <div class="endpoint">
//                     <strong>GET /api/stats</strong> - Get system statistics
//                 </div>
//                 <div class="endpoint">
//                     <strong>GET /health</strong> - Health check endpoint
//                 </div>
                
//                 <h3>WebSocket Connection:</h3>
//                 <p>Connect to <code>ws://localhost:${PORT || 3000}</code> for real-time communication.</p>
                
//                 <h3>Setup Instructions:</h3>
//                 <ol>
//                     <li>Create a <code>public</code> folder in your project directory</li>
//                     <li>Add your HTML dashboard to <code>public/index.html</code></li>
//                     <li>Connect devices using Socket.IO client</li>
//                     <li>Start detecting objects and calculating locations!</li>
//                 </ol>
                
//                 <p><strong>Server Status:</strong> Running on port ${PORT || 3000}</p>
//                 <p><strong>Connected Devices:</strong> <span id="deviceCount">0</span></p>
                
//                 <script src="/socket.io/socket.io.js"></script>
//                 <script>
//                     const socket = io();
//                     socket.on('devices-updated', (devices) => {
//                         document.getElementById('deviceCount').textContent = devices.length;
//                     });
//                     socket.emit('get-devices');
//                 </script>
//             </div>
//         </body>
//         </html>
//       `);
//     }
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Endpoint not found' });
// });

// // Cleanup function for graceful shutdown
// function cleanup() {
//   console.log('\nShutting down server...');
  
//   // Close all socket connections
//   io.emit('server-shutdown', { message: 'Server is shutting down' });
  
//   // Clear intervals and timeouts
//   devices.clear();
//   detections.clear();
  
//   // Close server
//   server.close(() => {
//     console.log('Server closed successfully');
//     process.exit(0);
//   });
// }

// // Handle shutdown signals
// process.on('SIGINT', cleanup);
// process.on('SIGTERM', cleanup);

// // Start server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`🚀 Object Detection Server running on port ${PORT}`);
//   console.log(`📊 Dashboard: http://localhost:${PORT}`);
//   console.log(`🔗 API Base: http://localhost:${PORT}/api`);
//   console.log(`💓 Health Check: http://localhost:${PORT}/health`);
//   console.log(`📡 WebSocket: ws://localhost:${PORT}`);
//   console.log('\n✅ Server ready to accept device connections!');
// });

// // Export for testing or external use
// module.exports = { app, server, io, devices, detections, LocationCalculator };