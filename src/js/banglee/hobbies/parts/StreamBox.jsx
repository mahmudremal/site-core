import { useEffect, useRef } from "react";
import * as tf from '@tensorflow/tfjs';
import { X } from "lucide-react";

const StreamBox = ({ broadcasterId, stream, onDisconnect, objectDetectionEnabled, faceRecognitionEnabled, detectionInterval, cocoModel, faceDetector, faceRecognitionModel, modelsLoaded, registeredPersons }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const onLoadedMetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      startDetection();
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [objectDetectionEnabled, faceRecognitionEnabled, detectionInterval, modelsLoaded, registeredPersons, faceRecognitionModel]);

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

  const extractFaceEmbedding = async (video, box, model) => {
    if (!model) return null;
    // console.log(box)
    if (!box || box.width <= 0 || box.height <= 0) {
      // console.warn("Invalid face box dimensions:", box);
      return null;
    }
    
    try {
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = box.width;
      faceCanvas.height = box.height;
      const faceCtx = faceCanvas.getContext('2d');
      faceCtx.drawImage(video, box.xMin, box.yMin, box.width, box.height, 0, 0, box.width, box.height);
      
      const embedding = tf.tidy(() => {
        const inputTensor = tf.browser.fromPixels(faceCanvas)
          .resizeBilinear([112, 112])
          .toFloat()
          .sub(127.5)
          .div(128.0)
          .expandDims(0);
        
        const pred = model.predict(inputTensor);
        return pred.squeeze().div(pred.norm());
      });

      const embeddingData = await embedding.data();
      embedding.dispose();

      return Array.from(embeddingData);
    } catch (error) {
      console.error('Error extracting face embedding:', error);
      return null;
    }
  };

// 
const matchFace = async (video, box, model) => {
  if (registeredPersons.length === 0) return null;

  try {
    const embedding = await extractFaceEmbedding(video, box, model);
    if (!embedding) return null;

    let bestMatch = null;
    let bestScore = -1;
    const threshold = 0.8;

    for (const person of registeredPersons) {
      for (const personEmbedding of person.embeddings) {
        const storedEmbedding = Array.isArray(personEmbedding) ? personEmbedding : Object.values(personEmbedding);
        const similarity = cosineSimilarity(embedding, storedEmbedding);
        
        if (similarity > bestScore) {
          bestScore = similarity;
          if (similarity > threshold) {
            bestMatch = {
              name: person.name,
              confidence: similarity
            };
          }
        }
      }
    }

    return bestMatch;
  } catch (error) {
    return null;
  }
};


  const startDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    const detect = async () => {
      const now = Date.now();

      if (now - lastRunRef.current >= detectionInterval) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (objectDetectionEnabled && cocoModel && modelsLoaded.coco) {
          try {
            const predictions = await cocoModel.detect(video);
            predictions.forEach(pred => {
              const [x, y, width, height] = pred.bbox;
              
              ctx.strokeStyle = '#00ff80';
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);

              const label = `${pred.class} ${Math.round(pred.score * 100)}%`;
              ctx.font = 'bold 16px Arial';
              const textWidth = ctx.measureText(label).width;
              
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(x, y - 25, textWidth + 10, 25);
              
              ctx.fillStyle = '#00ff80';
              ctx.fillText(label, x + 5, y - 7);
            });
          } catch (error) {
            console.error('Object detection error:', error);
          }
        }


        if (faceRecognitionEnabled && faceDetector && modelsLoaded.face) {
            try {
                const faces = await faceDetector.estimateFaces(video);
                
                for (const face of faces) {
                    const box = face.box;
                    console.log('box', box)
                    
                    let label = 'Face Detected';
                    let color = '#ff6b35';
                    
                    if (registeredPersons.length > 0) {
                        try {
                            const match = await matchFace(video, box, faceRecognitionModel);
                            if (match) {
                                label = `${match.name} ${Math.round(match.confidence * 100)}%`;
                                color = '#00ff80';
                            } else {
                                label = 'Unknown Person';
                                color = '#ff3333';
                            }
                        } catch (err) {
                            label = 'Face Detected';
                        }
                    }
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);

                    ctx.font = 'bold 16px Arial';
                    const textWidth = ctx.measureText(label).width;
                    
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(box.xMin, box.yMin - 25, textWidth + 10, 25);
                    
                    ctx.fillStyle = color;
                    ctx.fillText(label, box.xMin + 5, box.yMin - 7);
                }
            } catch (error) {
            }
        }


        lastRunRef.current = now;
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    detect();
  };

  return (
    <div className="xpo_bg-gray-100 xpo_rounded-lg xpo_p-4 xpo_shadow-lg">
      <h3 className="xpo_text-purple-600 xpo_font-semibold xpo_mb-3 xpo_text-sm">
        Broadcaster: {broadcasterId.substring(0, 16)}...
      </h3>

      <div className="xpo_relative xpo_bg-black xpo_rounded-lg xpo_overflow-hidden xpo_mb-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="xpo_w-full xpo_block"
        />
        <canvas
          ref={canvasRef}
          className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_pointer-events-none"
        />
      </div>

      <button
        onClick={onDisconnect}
        className="xpo_w-full xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-red-600 xpo_text-white xpo_rounded-lg xpo_font-semibold hover:xpo_bg-red-700 xpo_transition-colors"
      >
        <X className="xpo_w-4 xpo_h-4" />
        Disconnect
      </button>
    </div>
  );
};

export default StreamBox;