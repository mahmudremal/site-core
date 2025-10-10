import React, { useState, useEffect, useRef } from 'react';
import { Upload, User, Trash2, X } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

const FaceRegistration = ({ onPersonsUpdate, embeddings = [], savePersonData = () => {} }) => {
  const [personName, setPersonName] = useState('');
  const [registeredPersons, setRegisteredPersons] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetector, setFaceDetector] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  const fileInputRef = useRef(null);
  const faceEmbeddingsRef = useRef(embeddings);

  useEffect(() => {
    initModel();
  }, []);

  const initModel = async () => {
    try {
      await tf.setBackend('webgl');
      await tf.ready();
      
      const detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      );
      setFaceDetector(detector);
      setModelLoaded(true);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const extractFaceEmbedding = async (imageElement) => {
    const faces = await faceDetector.estimateFaces(imageElement);
    if (faces.length === 0) return null;

    const face = faces[0];
    const box = face.box;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const faceWidth = box.width;
    const faceHeight = box.height;
    canvas.width = 128;
    canvas.height = 128;
    
    ctx.drawImage(
      imageElement,
      box.xMin, box.yMin, faceWidth, faceHeight,
      0, 0, 128, 128
    );
    
    const imageData = ctx.getImageData(0, 0, 128, 128);
    const tensor = tf.browser.fromPixels(imageData)
      .toFloat()
      .div(255.0)
      .expandDims(0);
    
    const flattened = tensor.reshape([1, -1]);
    const normalized = tf.div(
      flattened,
      tf.norm(flattened, 'euclidean', 1, true).add(1e-6)
    );
    
    const embedding = await normalized.array();
    
    tensor.dispose();
    flattened.dispose();
    normalized.dispose();
    
    return embedding[0];
  };

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const registerPerson = async () => {
    if (!personName.trim()) {
      alert('Please enter a person name');
      return;
    }

    if (!fileInputRef.current?.files?.length) {
      alert('Please select at least one image');
      return;
    }

    if (!modelLoaded || !faceDetector) {
      alert('Face detection model is still loading');
      return;
    }

    setIsProcessing(true);

    try {
      const files = Array.from(fileInputRef.current.files);
      const embeddings = [];

      for (const file of files) {
        const img = await loadImage(file);
        const embedding = await extractFaceEmbedding(img);
        
        if (embedding) {
          embeddings.push(embedding);
        }
      }

      if (embeddings.length === 0) {
        alert('No faces detected in the provided images');
        setIsProcessing(false);
        return;
      }

      const personData = {
        name: personName.trim(),
        embeddings: embeddings,
        id: Date.now()
      };

      faceEmbeddingsRef.current.push(personData);
      setRegisteredPersons(prev => [...prev, personData]);

      await savePersonData(personData);
      
      if (onPersonsUpdate) {
        onPersonsUpdate(faceEmbeddingsRef.current);
      }

      alert(`Successfully registered ${personName.trim()} with ${embeddings.length} face sample(s)`);
      
      setPersonName('');
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error registering person:', error);
      alert('Error: ' + error.message);
    }

    setIsProcessing(false);
  };

  const deletePerson = (personId) => {
    faceEmbeddingsRef.current = faceEmbeddingsRef.current.filter(p => p.id !== personId);
    setRegisteredPersons(prev => prev.filter(p => p.id !== personId));
    
    if (onPersonsUpdate) {
      onPersonsUpdate(faceEmbeddingsRef.current);
    }
  };

  const cosineSimilarity = (a, b) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const matchFace = async (imageElement) => {
    if (!faceDetector || faceEmbeddingsRef.current.length === 0) {
      return null;
    }

    const embedding = await extractFaceEmbedding(imageElement);
    if (!embedding) return null;

    let bestMatch = null;
    let bestScore = -1;
    const threshold = 0.6;

    for (const person of faceEmbeddingsRef.current) {
      for (const personEmbedding of person.embeddings) {
        const similarity = cosineSimilarity(embedding, personEmbedding);
        
        if (similarity > bestScore && similarity > threshold) {
          bestScore = similarity;
          bestMatch = {
            name: person.name,
            confidence: similarity
          };
        }
      }
    }

    return bestMatch;
  };

  useEffect(() => {
    window.faceRegistration = {
      matchFace: matchFace,
      getRegisteredPersons: () => faceEmbeddingsRef.current
    };
  }, [faceDetector]);

  return (
    <div className="xpo_bg-white xpo_rounded-lg xpo_shadow-lg p-6">
      <h2 className="xpo_text-2xl xpo_font-bold xpo_text-purple-600 xpo_mb-4 xpo_flex xpo_items-center gap-2">
        <User className="xpo_w-6 xpo_h-6" />
        Face Registration
      </h2>

      <div className={`xpo_mb-4 xpo_p-3 xpo_rounded-lg xpo_text-sm xpo_font-medium ${
        modelLoaded ? ' xpo_bg-green-100 xpo_text-green-800' : ' xpo_bg-yellow-100 xpo_text-yellow-800'
      }`}>
        {modelLoaded ? '✓ Model Loaded' : '⏳ Loading Model...'}
      </div>

      <div className="xpo_space-y-4 mb-6">
        <div>
          <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
            Person Name
          </label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="xpo_w-full xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent"
          />
        </div>

        <div>
          <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
            Face Images (Multiple recommended)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="xpo_w-full xpo_px-4 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_text-sm"
          />
          <p className="xpo_text-xs xpo_text-gray-500 xpo_mt-1">
            Tip: Upload 3-5 images with different angles for better accuracy
          </p>
        </div>

        <button
          onClick={registerPerson}
          disabled={isProcessing || !modelLoaded}
          className={`xpo_w-full xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-6 xpo_py-3 xpo_rounded-lg xpo_font-semibold xpo_transition-colors ${
            isProcessing || !modelLoaded
              ? ' xpo_bg-gray-400 xpo_cursor-not-allowed'
              : ' xpo_bg-purple-600 hover:xpo_bg-purple-700 xpo_text-white'
          }`}
        >
          <Upload className="xpo_w-5 xpo_h-5" />
          {isProcessing ? 'Processing...' : 'Register Person'}
        </button>
      </div>

      {registeredPersons.length > 0 && (
        <div className="xpo_border-t xpo_border-gray-200 xpo_pt-4">
          <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800 xpo_mb-3">
            Registered Persons ({registeredPersons.length})
          </h3>
          <div className="xpo_space-y-2">
            {registeredPersons.map(person => (
              <div
                key={person.id}
                className="xpo_flex xpo_items-center xpo_justify-between xpo_p-3 xpo_bg-gray-50 xpo_rounded-lg xpo_border xpo_border-gray-200"
              >
                <div className="xpo_flex xpo_items-center xpo_gap-3">
                  <User className="xpo_xpo_w-5 xpo_xpo_h-5 xpo_text-purple-600" />
                  <div>
                    <div className="xpo_font-semibold xpo_text-gray-800">{person.name}</div>
                    <div className="xpo_text-xs xpo_text-gray-500">
                      {person.embeddings.length} face sample(s)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deletePerson(person.id)}
                  className="xpo_p-2 xpo_text-red-600 hover:xpo_bg-red-50 xpo_rounded-lg xpo_transition-colors"
                >
                  <Trash2 className="xpo_w-4 xpo_h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">How to use:</h4>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Enter the person's name</li>
          <li>Select 3-5 clear face images from different angles</li>
          <li>Click "Register Person"</li>
          <li>The system will now recognize this person in video streams</li>
        </ol>
      </div>
    </div>
  );
};

export default FaceRegistration;
