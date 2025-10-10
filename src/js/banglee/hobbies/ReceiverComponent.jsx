import React, { useState, useEffect, useRef } from 'react';
import { Video, Wifi, WifiOff, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceDetection from '@tensorflow-models/face-detection';
import FaceRegistration from './parts/FaceRegistration';
import StreamBox from './parts/StreamBox';
import * as faceapi from 'face-api.js';
import Peer from 'peerjs';
import axios from 'axios';

const ReceiverComponent = () => {
  const [peerId, setPeerId] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [broadcasters, setBroadcasters] = useState([]);
  const [activeStreams, setActiveStreams] = useState(new Map());
  const [objectDetectionEnabled, setObjectDetectionEnabled] = useState(true);
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(true);
  const [detectionInterval, setDetectionInterval] = useState(1000);
  const [modelsLoaded, setModelsLoaded] = useState({ coco: false, face: false });
  const [registeredPersons, setRegisteredPersons] = useState([]);
  const [showRegistration, setShowRegistration] = useState(false);

  const peerRef = useRef(null);
  const cocoModelRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const faceRecognitionModelRef = useRef(null);

  const savePersonData = async (personData) => {
    try {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(personData.embeddings)], { type: 'application/json' });
      for (const key in personData) {
        if (key !== 'embeddings') formData.append(key, personData[key]);
      }
      formData.append('embeddings', blob, 'embeddings.json');
      await axios.post(`/airsoft/update/face`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error uploading embeddings:', error);
    }
  };


  useEffect(() => {
    const initModels = async () => {
      try {
        await tf.setBackend('cpu'); // cpu || webgl 
        await tf.ready();
        
        const cocoModel = await cocoSsd.load({modelUrl: '/models/ssdlite_mobilenet_v2/model.json'});
        cocoModelRef.current = cocoModel;
        setModelsLoaded(prev => ({ ...prev, coco: true }));

        const detector = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: 'tfjs',
            // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection'
          }
        );
        faceDetectorRef.current = detector;

        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/faceapi');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models/faceapi');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models/faceapi');

        const faceModel = await tf.loadGraphModel('/models/mobilenet_v2_1.0_224/model.json');
        faceRecognitionModelRef.current = faceModel;

        setModelsLoaded(prev => ({ ...prev, face: true }));
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    initModels();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      axios.get(`/airsoft/list/face`).then(res => res.data)
      .then(data => data?.persons?.length && setRegisteredPersons(data.persons))
      .catch(err => {});
    }, 1000);
  
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    const peer = new Peer({
      host: 'localhost',
      port: 3000,
      secure: true,
      path: '/airsoft',
      debug: 2
    });

    peer.on('open', (id) => {
      setPeerId(id);
      setIsConnected(true);
      registerReceiver(id);
      loadBroadcasters();
    });

    peer.on('error', () => setIsConnected(false));
    peer.on('disconnected', () => setIsConnected(false));

    peer.on('call', async (call) => {
      const silentStream = await createSilentStream();
      call.answer(silentStream);

      call.on('stream', (stream) => {
        setActiveStreams(prev => new Map(prev).set(call.peer, { call, stream }));
        loadBroadcasters();
      });

      call.on('close', () => removeStream(call.peer));
      call.on('error', () => removeStream(call.peer));
    });

    peerRef.current = peer;

    return () => peer.destroy();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadBroadcasters, 5000);
    return () => clearInterval(interval);
  }, []);

  const registerReceiver = async (peerId) => {
    try {
      await fetch(`/airsoft/register/receiver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerId })
      });
    } catch (error) {
      console.error('Error registering receiver:', error);
    }
  };

  const loadBroadcasters = async () => {
    try {
      const res = await fetch(`/airsoft/broadcasters`);
      const data = await res.json();
      setBroadcasters(data.broadcasters || []);
    } catch (error) {
      console.error('Error loading broadcasters:', error);
    }
  };

  const createSilentStream = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const canvasStream = canvas.captureStream();

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.0001;
    oscillator.connect(gainNode);
    gainNode.connect(destination);
    oscillator.start();

    return new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks()
    ]);
  };

  const connectToBroadcaster = async (broadcasterId) => {
    if (activeStreams.has(broadcasterId)) return;

    try {
      const silentStream = await createSilentStream();
      const call = peerRef.current.call(broadcasterId, silentStream);

      call.on('stream', (remoteStream) => {
        setActiveStreams(prev => new Map(prev).set(broadcasterId, { call, stream: remoteStream }));
        loadBroadcasters();
      });

      call.on('close', () => removeStream(broadcasterId));
      call.on('error', () => removeStream(broadcasterId));
    } catch (error) {
      alert('Failed to connect: ' + error.message);
    }
  };

  const removeStream = (broadcasterId) => {
    setActiveStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(broadcasterId);
      return newMap;
    });
    loadBroadcasters();
  };

  const disconnectFromBroadcaster = (broadcasterId) => {
    const streamData = activeStreams.get(broadcasterId);
    if (streamData?.call) streamData.call.close();
    removeStream(broadcasterId);
  };

  const handlePersonsUpdate = (persons) => {
    setRegisteredPersons(persons);
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gradient-to-br xpo_from-purple-500 xpo_to-pink-500 xpo_p-5">
      <div className="xpo_container xpo_mx-auto xpo_bg-white xpo_rounded-2xl xpo_shadow-2xl xpo_p-8">
        <div className="xpo_text-center xpo_mb-6">
          <h1 className="xpo_text-3xl xpo_font-bold xpo_text-pink-600 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
            <Video className="xpo_w-8 xpo_h-8" />
            Advanced Receiver - Object Detection & Face Recognition
          </h1>
        </div>

        <div className={` xpo_text-center xpo_p-3 xpo_rounded-lg xpo_mb-5 xpo_font-semibold ${
          isConnected ? ' xpo_bg-green-100 xpo_text-green-800' : ' xpo_bg-red-100 xpo_text-red-800'
        }`}>
          <span className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-2">
            {isConnected ? <Wifi className="xpo_w-5 xpo_h-5" /> : <WifiOff className="xpo_w-5 xpo_h-5" />}
            {isConnected ? 'Connected to Server' : 'Disconnected'}
          </span>
        </div>

        <div className="xpo_text-center xpo_text-gray-600 xpo_mb-6 xpo_text-sm">
          Your Peer ID: <strong>{peerId}</strong>
        </div>

        <div className="xpo_mb-6">
          <button
            onClick={() => setShowRegistration(prev => !prev)}
            className="xpo_w-full xpo_px-6 xpo_py-3 xpo_bg-indigo-600 xpo_text-white xpo_rounded-lg xpo_font-semibold hover:xpo_bg-indigo-700 xpo_transition-colors"
          >
            {showRegistration ? 'Hide' : 'Show'} Face Registration Panel
          </button>
        </div>

        {showRegistration && (
          <div className="xpo_mb-8">
            <FaceRegistration onPersonsUpdate={handlePersonsUpdate} embeddings={registeredPersons} savePersonData={savePersonData} />
          </div>
        )}

        <div className="xpo_mb-8">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-4">
            <h2 className="xpo_text-2xl xpo_font-bold xpo_text-pink-600">Available Broadcasters</h2>
            <button
              onClick={loadBroadcasters}
              className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-purple-600 xpo_text-white xpo_rounded-lg xpo_font-semibold hover:xpo_bg-purple-700 xpo_transition-colors"
            >
              <RefreshCw className="xpo_w-4 xpo_h-4" />
              Refresh
            </button>
          </div>

          <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 md:xpo_grid-cols-3 lg:xpo_grid-cols-4 xpo_gap-4">
            {broadcasters.length === 0 ? (
              <div className="xpo_col-span-full xpo_text-center xpo_text-gray-500 xpo_py-8">
                No broadcasters available
              </div>
            ) : (
              broadcasters.map(id => (
                <div
                  key={id}
                  onClick={() => !activeStreams.has(id) && connectToBroadcaster(id)}
                  className={` xpo_p-4 xpo_rounded-lg xpo_text-white xpo_font-semibold xpo_text-center xpo_transition-all xpo_cursor-pointer ${
                    activeStreams.has(id)
                      ? ' xpo_bg-gradient-to-br xpo_from-green-500 xpo_to-green-600'
                      : ' xpo_bg-gradient-to-br xpo_from-purple-600 xpo_to-indigo-600 hover:xpo_shadow-lg hover:xpo_-translate-y-1'
                  }`}
                >
                  <Wifi className="xpo_w-5 xpo_h-5 xpo_mx-auto xpo_mb-2" />
                  {id.substring(0, 12)}...
                  {activeStreams.has(id) && <div className="xpo_text-xs xpo_mt-1">(Connected)</div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xpo_bg-gray-50 xpo_p-5 xpo_rounded-lg xpo_mb-6">
          <div className="xpo_flex xpo_flex-wrap xpo_gap-4 xpo_items-center">
            <div className="xpo_flex xpo_items-center xpo_gap-2">
              <span className="xpo_text-sm xpo_font-medium">Object Detection:</span>
              <button
                onClick={() => setObjectDetectionEnabled(!objectDetectionEnabled)}
                className={` xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-semibold xpo_transition-colors ${
                  objectDetectionEnabled ? ' xpo_bg-green-600 xpo_text-white' : ' xpo_bg-gray-400 xpo_text-white'
                }`}
              >
                {objectDetectionEnabled ? <Eye className="xpo_w-4 xpo_h-4" /> : <EyeOff className="xpo_w-4 xpo_h-4" />}
                {objectDetectionEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="xpo_flex xpo_items-center xpo_gap-2">
              <span className="xpo_text-sm xpo_font-medium">Face Recognition:</span>
              <button
                onClick={() => setFaceRecognitionEnabled(!faceRecognitionEnabled)}
                className={` xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_font-semibold xpo_transition-colors ${
                  faceRecognitionEnabled ? ' xpo_bg-green-600 xpo_text-white' : ' xpo_bg-gray-400 xpo_text-white'
                }`}
              >
                {faceRecognitionEnabled ? <Eye className="xpo_w-4 xpo_h-4" /> : <EyeOff className="xpo_w-4 xpo_h-4" />}
                {faceRecognitionEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="xpo_flex xpo_items-center xpo_gap-2 xpo_ml-auto">
              <span className="xpo_text-sm xpo_font-medium">Interval (ms):</span>
              <input
                type="number"
                value={detectionInterval}
                onChange={(e) => setDetectionInterval(parseInt(e.target.value) || 1000)}
                className="xpo_w-24 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm"
                min="100"
                step="100"
              />
            </div>
          </div>

          <div className="xpo_mt-3 xpo_p-3 xpo_bg-white xpo_rounded-lg xpo_border xpo_border-gray-200">
            <div className="xpo_text-sm">
              <span className="xpo_font-medium">Status: </span>
              <span className={modelsLoaded.coco ? 'xpo_text-green-600' : 'xpo_text-red-600'}>
                Objects {modelsLoaded.coco ? '✓' : '✗'}
              </span>
              <span className="xpo_mx-2">|</span>
              <span className={modelsLoaded.face ? 'xpo_text-green-600' : 'xpo_text-red-600'}>
                Faces {modelsLoaded.face ? '✓' : '✗'}
              </span>
              <span className="xpo_mx-2">|</span>
              <span className="xpo_text-purple-600">
                Known Persons: {registeredPersons.length}
              </span>
            </div>
          </div>
        </div>

        <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-2 xpo_gap-6">
          {Array.from(activeStreams.entries()).map(([broadcasterId, streamData]) => (
            <StreamBox
              key={broadcasterId}
              broadcasterId={broadcasterId}
              stream={streamData.stream}
              onDisconnect={() => disconnectFromBroadcaster(broadcasterId)}
              objectDetectionEnabled={objectDetectionEnabled}
              faceRecognitionEnabled={faceRecognitionEnabled}
              detectionInterval={detectionInterval}
              cocoModel={cocoModelRef.current}
              faceDetector={faceDetectorRef.current}
              faceRecognitionModel={faceRecognitionModelRef.current}
              modelsLoaded={modelsLoaded}
              registeredPersons={registeredPersons}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceiverComponent;