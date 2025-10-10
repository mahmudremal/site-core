const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const broadcasters = new Set();
const receivers = new Set();

app.get('/', (req, res) => {
  res.json({
    message: 'PeerJS Signaling Server',
    broadcasters: Array.from(broadcasters),
    receivers: Array.from(receivers)
  });
});

app.post('/register/broadcaster', (req, res) => {
  const { peerId } = req.body;
  broadcasters.add(peerId);
  console.log(`Broadcaster registered: ${peerId}`);
  res.json({ success: true, peerId, message: 'Broadcaster registered' });
});

app.post('/register/receiver', (req, res) => {
  const { peerId } = req.body;
  receivers.add(peerId);
  console.log(`Receiver registered: ${peerId}`);
  res.json({ success: true, peerId, broadcasters: Array.from(broadcasters) });
});

app.get('/broadcasters', (req, res) => {
  res.json({ broadcasters: Array.from(broadcasters) });
});

app.post('/unregister', (req, res) => {
  const { peerId } = req.body;
  broadcasters.delete(peerId);
  receivers.delete(peerId);
  console.log(`Peer unregistered: ${peerId}`);
  res.json({ success: true });
});

const options = {
  key: fs.readFileSync(path.join(__dirname, 'storage', 'certificates', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'storage', 'certificates', 'cert.pem')),
};

const server = https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/',
  allow_discovery: true
});

peerServer.on('connection', (client) => {
  console.log(`Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  const peerId = client.getId();
  console.log(`Peer disconnected: ${peerId}`);
  broadcasters.delete(peerId);
  receivers.delete(peerId);
});

app.use('/peerjs', peerServer);

console.log(`PeerJS server started on HTTPS port ${PORT}`);
console.log(`PeerJS path: /peerjs`);
