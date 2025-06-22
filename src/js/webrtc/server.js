// server.js
const http = require('http');
const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

const app = express();
const server = http.createServer(app);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/',
});

// Serve peer server under /peerjs
app.use('/peerjs', peerServer);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

peerServer.on('connection', (client) => {
  console.log(`Peer connected: ${client.id}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`Peer disconnected: ${client.id}`);
});

peerServer.on('error', (err, client) => {
  console.error(`Peer server error from client ${client?.id}:`, err);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
