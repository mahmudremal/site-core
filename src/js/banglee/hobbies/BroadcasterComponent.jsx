import { Video, VideoOff, Mic, MicOff, Send, Upload, Eye, EyeOff, Radio, Users, Wifi } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

export default function BroadcasterComponent() {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [connections, setConnections] = useState(new Map());
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const localStreamRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const connectionsRef = useRef(new Map());

  const SERVER_URL = 'localhost:3000';

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer({
      host: 'localhost',
      port: 3000,
      path: '/airsoft',
      debug: 2,
      secure: true
    });

    newPeer.on('open', (id) => {
      console.log('My peer ID is:', id);
      setPeerId(id);
      setIsConnected(true);
      registerBroadcaster(id);
    });

    newPeer.on('connection', (conn) => {
      console.log('Receiver connected:', conn.peer);
      setupConnection(conn);
    });

    newPeer.on('call', (call) => {
      console.log('Answering call from:', call.peer);
      if (localStreamRef.current) {
        call.answer(localStreamRef.current);
      }
    });

    newPeer.on('error', (err) => {
      console.error('PeerJS error:', err);
      alert('Connection error: ' + err.message);
    });

    setPeer(newPeer);

    return () => {
      if (newPeer) {
        newPeer.destroy();
      }
      stopBroadcast();
    };
  }, []);

  // Register as broadcaster
  const registerBroadcaster = async (peerId) => {
    try {
      await fetch(`https://${SERVER_URL}/airsoft/register/broadcaster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId })
      });
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  // Setup data connection
  const setupConnection = (conn) => {
    connectionsRef.current.set(conn.peer, conn);
    setConnections(new Map(connectionsRef.current));

    conn.on('open', () => {
      console.log('Data connection opened with:', conn.peer);
      conn.send({ type: 'welcome', message: 'Connected to broadcaster' });
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      connectionsRef.current.delete(conn.peer);
      setConnections(new Map(connectionsRef.current));
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      connectionsRef.current.delete(conn.peer);
      setConnections(new Map(connectionsRef.current));
    });
  };

  // Start broadcasting
  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsBroadcasting(true);
      console.log('Broadcasting started');
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Could not access camera/microphone: ' + err.message);
    }
  };

  // Stop broadcasting
  const stopBroadcast = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setIsBroadcasting(false);
    console.log('Broadcasting stopped');
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };

  // Send message
  const sendMessage = () => {
    const text = message.trim();
    if (!text) {
      alert('Please enter a message');
      return;
    }

    const messageData = {
      type: 'text',
      content: text,
      timestamp: new Date().toISOString()
    };

    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(messageData);
      }
    });

    setMessage('');
    console.log('Message sent to all receivers');
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      sendFile(file);
    }
  };

  // Send file
  const sendFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = {
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: e.target.result,
        timestamp: new Date().toISOString()
      };

      connectionsRef.current.forEach((conn) => {
        if (conn.open) {
          conn.send(fileData);
        }
      });

      setTimeout(() => {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gradient-to-br xpo_from-purple-600 xpo_via-indigo-600 xpo_to-blue-700 xpo_p-4 md:xpo_p-8">
      <div className="xpo_max-w-6xl xpo_mx-auto xpo_bg-white xpo_rounded-2xl xpo_shadow-2xl xpo_overflow-hidden">
        {/* Header */}
        <div className="xpo_bg-gradient-to-r xpo_from-purple-600 xpo_to-indigo-600 xpo_p-6 xpo_text-white">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_flex-wrap xpo_gap-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <Radio className="xpo_w-8 xpo_h-8 xpo_animate-pulse" />
              <h1 className="xpo_text-3xl xpo_font-bold">Broadcaster</h1>
            </div>
            <div className="xpo_flex xpo_items-center xpo_gap-2">
              <Wifi className={`xpo_w-5 xpo_h-5 ${isConnected ? 'xpo_text-green-300' : 'xpo_text-red-300'}`} />
              <span className={`xpo_px-4 xpo_py-2 xpo_rounded-full xpo_text-sm xpo_font-semibold ${isConnected ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="xpo_mt-4 xpo_text-center xpo_opacity-90">
            <p className="xpo_text-sm">Peer ID: <span className="xpo_font-mono xpo_font-bold">{peerId}</span></p>
          </div>
        </div>

        {/* Video Preview Section */}
        <div className="xpo_p-6 xpo_bg-gray-50">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_flex xpo_items-center xpo_gap-2">
              <Video className="xpo_w-5 xpo_h-5" />
              Video Preview
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-gray-200 xpo_text-gray-700 xpo_rounded-lg xpo_font-medium xpo_transition-all xpo_duration-300 hover:xpo_bg-gray-300 hover:xpo_shadow-md"
            >
              {showPreview ? <EyeOff className="xpo_w-4 xpo_h-4" /> : <Eye className="xpo_w-4 xpo_h-4" />}
              {showPreview ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showPreview && (
            <div className="xpo_relative xpo_bg-black xpo_rounded-xl xpo_overflow-hidden xpo_shadow-lg xpo_aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="xpo_w-full xpo_h-full xpo_object-cover"
              />
              {!isBroadcasting && (
                <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center xpo_justify-center xpo_bg-gray-900 xpo_bg-opacity-80">
                  <p className="xpo_text-white xpo_text-lg">No broadcast active</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="xpo_p-6 xpo_bg-white">
          <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-4">Controls</h2>
          <div className="xpo_grid xpo_grid-cols-2 md:xpo_grid-cols-4 xpo_gap-3">
            <button
              onClick={startBroadcast}
              disabled={isBroadcasting}
              className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-4 xpo_py-3 xpo_bg-gradient-to-r xpo_from-green-500 xpo_to-emerald-600 xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_scale-100"
            >
              <Radio className="xpo_w-4 xpo_h-4" />
              Start
            </button>
            <button
              onClick={stopBroadcast}
              disabled={!isBroadcasting}
              className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-4 xpo_py-3 xpo_bg-gradient-to-r xpo_from-red-500 xpo_to-rose-600 xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_scale-100"
            >
              <Radio className="xpo_w-4 xpo_h-4" />
              Stop
            </button>
            <button
              onClick={toggleVideo}
              disabled={!isBroadcasting}
              className={`xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-4 xpo_py-3 ${videoEnabled ? 'xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-cyan-600' : 'xpo_bg-gradient-to-r xpo_from-gray-500 xpo_to-gray-600'} xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_scale-100`}
            >
              {videoEnabled ? <Video className="xpo_w-4 xpo_h-4" /> : <VideoOff className="xpo_w-4 xpo_h-4" />}
              {videoEnabled ? 'Video On' : 'Video Off'}
            </button>
            <button
              onClick={toggleAudio}
              disabled={!isBroadcasting}
              className={`xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-4 xpo_py-3 ${audioEnabled ? 'xpo_bg-gradient-to-r xpo_from-purple-500 xpo_to-pink-600' : 'xpo_bg-gradient-to-r xpo_from-gray-500 xpo_to-gray-600'} xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:hover:xpo_scale-100`}
            >
              {audioEnabled ? <Mic className="xpo_w-4 xpo_h-4" /> : <MicOff className="xpo_w-4 xpo_h-4" />}
              {audioEnabled ? 'Mic On' : 'Mic Off'}
            </button>
          </div>
        </div>

        {/* Messaging Section */}
        <div className="xpo_p-6 xpo_bg-gray-50">
          <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
            <Send className="xpo_w-5 xpo_h-5" />
            Send Message
          </h2>
          <div className="xpo_flex xpo_gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="xpo_flex-1 xpo_px-4 xpo_py-3 xpo_border-2 xpo_border-gray-300 xpo_rounded-lg focus:xpo_outline-none focus:xpo_border-purple-500 xpo_transition-colors"
            />
            <button
              onClick={sendMessage}
              className="xpo_px-6 xpo_py-3 xpo_bg-gradient-to-r xpo_from-purple-600 xpo_to-indigo-600 xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 xpo_flex xpo_items-center xpo_gap-2"
            >
              <Send className="xpo_w-4 xpo_h-4" />
              Send
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="xpo_p-6 xpo_bg-white">
          <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
            <Upload className="xpo_w-5 xpo_h-5" />
            Send File
          </h2>
          <div className="xpo_flex xpo_items-center xpo_gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="xpo_hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="xpo_px-6 xpo_py-3 xpo_bg-gradient-to-r xpo_from-blue-500 xpo_to-cyan-600 xpo_text-white xpo_rounded-lg xpo_font-semibold xpo_cursor-pointer xpo_transition-all xpo_duration-300 hover:xpo_shadow-lg hover:xpo_scale-105 xpo_flex xpo_items-center xpo_gap-2"
            >
              <Upload className="xpo_w-4 xpo_h-4" />
              Choose File
            </label>
            {selectedFile && (
              <span className="xpo_text-gray-600 xpo_text-sm">
                {selectedFile.name} - Sent!
              </span>
            )}
          </div>
        </div>

        {/* Connections */}
        <div className="xpo_p-6 xpo_bg-gradient-to-r xpo_from-gray-50 xpo_to-gray-100">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <h2 className="xpo_text-xl xpo_font-semibold xpo_text-gray-800 xpo_flex xpo_items-center xpo_gap-2">
              <Users className="xpo_w-5 xpo_h-5" />
              Connected Receivers
            </h2>
            <span className="xpo_px-4 xpo_py-2 xpo_bg-purple-600 xpo_text-white xpo_rounded-full xpo_font-bold xpo_text-lg">
              {connections.size}
            </span>
          </div>
          {connections.size > 0 ? (
            <div className="xpo_space-y-2">
              {Array.from(connections.keys()).map((peerId) => (
                <div
                  key={peerId}
                  className="xpo_flex xpo_items-center xpo_gap-3 xpo_px-4 xpo_py-3 xpo_bg-white xpo_rounded-lg xpo_shadow-sm xpo_border-l-4 xpo_border-green-500"
                >
                  <div className="xpo_w-2 xpo_h-2 xpo_bg-green-500 xpo_rounded-full xpo_animate-pulse" />
                  <span className="xpo_text-gray-700 xpo_font-medium xpo_font-mono xpo_text-sm">
                    {peerId}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="xpo_text-center xpo_py-8 xpo_text-gray-500">
              <Users className="xpo_w-12 xpo_h-12 xpo_mx-auto xpo_mb-2 xpo_opacity-50" />
              <p>No receivers connected yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}