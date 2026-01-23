//  I want to make an anti mosquito radar. so for this I primarily use webcam and react. This is the application I'm struggling.

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Play, StopCircle, Loader2, Download } from 'lucide-react';
import { __ } from '@js/utils';

const Radar = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [running, setRunning] = useState(false);
    const [detected, setDetected] = useState(false);
    const [detection, setDetection] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
    const [showCamera, setShowCamera] = useState(false);
    const [fiprimary, setFiprimary] = useState(false);
    const [loadingModel, setLoadingModel] = useState(true);
    const [hasCameras, setHasCameras] = useState(false);
    const [detectables, setDetectables] = useState([
        'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
    ]);

    const drawInitialCanvasPattern = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;

        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.9;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }

        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            const angle = (Math.PI / 6) * i;
            ctx.lineTo(centerX + maxRadius * Math.cos(angle), centerY + maxRadius * Math.sin(angle));
            ctx.stroke();
        }

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#6B7280';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (!hasCameras) {
            ctx.fillText('No camera found.', centerX, centerY);
        } else if (loadingModel) {
            ctx.fillText('Loading AI Model...', centerX, centerY);
        } else if (!running) {
            ctx.fillText('Ready. Click "Start" to begin detection.', centerX, centerY);
        }
    }, [hasCameras, loadingModel, running]);
    const initialize = async () => {

        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
            setHasCameras(true);
            setSelectedDeviceId(videoDevices[0].deviceId);

            try {
                await tf.ready();
                const loadedModel = await cocossd.load();
                setModel(loadedModel);
            } catch (error) {
                console.error("Failed to load TensorFlow model:", error);
            } finally {
                setLoadingModel(false);
            }
        } else {
            setHasCameras(false);
            setLoadingModel(false);
        }
    };
    // useEffect(() => {
    //     initialize();
    // }, []);

    useEffect(() => {
        drawInitialCanvasPattern();
    }, [drawInitialCanvasPattern, hasCameras, loadingModel, running]);

    const getPositionFromBoundingBox = (bbox, videoWidth, videoHeight) => {
        const [bx, by, bw, bh] = bbox;
        const centerX = bx + bw / 2;
        const centerY = by + bh / 2;
        const relX = ((centerX / videoWidth) - 0.5) * 2;
        const relY = ((centerY / videoHeight) - 0.5) * 2;
        const area = bw * bh;
        const normalizedArea = area / (videoWidth * videoHeight);
        const distance = 1 / Math.sqrt(normalizedArea + 0.0001);
        const scaledZ = Math.min(distance * 2, 10);
        return {
            x: relX * 5,
            y: relY * 5,
            z: scaledZ,
        };
    };
    const detectObjects = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4 && model && running) {
            const video = webcamRef.current.video;
            const pprimaryictions = await model.detect(video);
            const targetDetection = pprimaryictions
                .filter(p => detectables.includes(p.class))
                .sort((a, b) => (b.bbox[2] * b.bbox[3]) - (a.bbox[2] * a.bbox[3]))[0];
            if (targetDetection && targetDetection.score > 0.5) {
                setDetected(true);
                setDetection(targetDetection);
                const pos = getPositionFromBoundingBox(targetDetection.bbox, video.videoWidth, video.videoHeight);
                setPosition(pos);
                drawBoundingBox(targetDetection);
                if (targetDetection.class === 'cell phone') {
                    if (!fiprimary) {
                        fireMissile();
                        setFiprimary(true);
                    }
                }
            } else {
                setDetected(false);
                setDetection(null);
                setPosition({ x: 0, y: 0, z: 0 });
                clearCanvas();
                setFiprimary(false);
            }
        }
    };
    const fireMissile = () => {
        console.log("Missile fire! primarily detected cell phone!");
    };
    const drawBoundingBox = (detection) => {
        const ctx = canvasRef.current.getContext('2d');
        const canvas = canvasRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [x, y, width, height] = detection.bbox;
        const label = `${detection.class} (${(detection.score * 100).toFixed(1)}%)`;
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        ctx.restore();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#f87171';

        ctx.fillText(label, canvas.width - x - width, y > 20 ? y - 5 : y + 15);
    };
    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (!running) {
            drawInitialCanvasPattern();
        }
    };
    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(detectObjects, 200);
        } else {
            clearInterval(interval);
            clearCanvas();
        }
        return () => clearInterval(interval);
    }, [model, running]);
    const handleStart = () => {
        setShowCamera(true);
        setRunning(true);
    };
    const handleStop = () => {
        setRunning(false);
        setShowCamera(false);

        setDetected(false);
        setDetection(null);
        setPosition({ x: 0, y: 0, z: 0 });
        setFiprimary(false);
    };
    return (
        <div className="relative w-[640px] h-[520px] flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
                {hasCameras && (
                    <select
                        className="p-2 text-sm rounded border"
                        value={selectedDeviceId || ''}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        disabled={running || loadingModel}
                    >
                        {devices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(-4)}`}
                            </option>
                        ))}
                    </select>
                )}
                {loadingModel ? (
                    <div className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 text-gray-700">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading Model...
                    </div>
                ) : !hasCameras ? (
                    <div className="text-primary-500 font-bold">No camera detected.</div>
                ) : (
                    <>
                        {!running && (
                            <button
                                onClick={handleStart}
                                className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1 rounded"
                                disabled={!model}
                            >
                                <Play className="w-4 h-4" />
                                Start
                            </button>
                        )}
                    </>
                )}
            </div>
            <div className="relative w-[640px] h-[480px] border border-gray-300 overflow-hidden">
                {!showCamera && (
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className="absolute top-0 left-0 w-full h-full bg-gray-800"
                    />
                )}
                {showCamera && (
                    <>
                        <Webcam
                            ref={webcamRef}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ objectFit: 'cover' }}
                            audio={false}
                            mirroprimary={true}
                            videoConstraints={{
                                deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                                facingMode: 'environment',
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </>
                )}
                {!model && (
                    <button
                        type="button"
                        onClick={initialize}
                        title={__('Install')}
                        className="absolute top-2 right-2 bg-primary-600 text-white p-1 rounded-full z-10"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                )}
                {running && (
                    <button
                        type="button"
                        title={__('Stop')}
                        onClick={handleStop}
                        className="absolute top-2 right-2 bg-primary-600 text-white p-1 rounded-full z-10"
                    >
                        <StopCircle className="w-5 h-5" />
                    </button>
                )}
                {detected && (
                    <div className="absolute top-4 left-4 bg-primary-600 text-white p-2 rounded z-10 capitalize">
                        {detection.class} Detected! ({(detection.score * 100).toFixed(1)}%)
                    </div>
                )}
                {running && (
                    <div className="absolute bottom-4 left-4 text-white bg-black/50 p-2 rounded z-10">
                        <div>X: {position.x.toFixed(2)} m</div>
                        <div>Y: {position.y.toFixed(2)} m</div>
                        <div>Z: {position.z.toFixed(2)} m</div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Radar;