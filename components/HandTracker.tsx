import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { DisplayMode } from '../types';

interface HandTrackerProps {
  setMode: (mode: DisplayMode) => void;
  currentMode: DisplayMode;
  rotationInputRef: React.MutableRefObject<number>;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ setMode, currentMode, rotationInputRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [detectedGesture, setDetectedGesture] = useState<string>('None');
  const lastGestureTime = useRef<number>(0);
  
  // Track previous hand position for velocity
  const prevCentroidX = useRef<number | null>(null);

  // Ref to track current mode without triggering re-initialization effects
  const modeRef = useRef(currentMode);

  // Keep the ref in sync with the prop
  useEffect(() => {
    modeRef.current = currentMode;
  }, [currentMode]);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        startWebcam();
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
        setLoading(false);
      }
    };

    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
          }
          setLoading(false);
        } catch (err) {
          console.error("Error accessing webcam:", err);
          setLoading(false);
        }
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      // Ensure dimensions match
      if (video.videoWidth > 0 && video.videoHeight > 0) {
          if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
          if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      }

      let startTimeMs = performance.now();
      
      if (video.currentTime > 0 && !video.paused && !video.ended) {
          const results = handLandmarker.detectForVideo(video, startTimeMs);
          
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (results.landmarks && results.landmarks.length > 0) {
            for (const landmarks of results.landmarks) {
              drawConnectors(ctx, landmarks);
              drawLandmarks(ctx, landmarks);
              detectGesture(landmarks);
              detectMovement(landmarks);
            }
          } else {
             // Reset movement input if no hand detected
             prevCentroidX.current = null;
             rotationInputRef.current = 0;
          }
          ctx.restore();
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    // Calculate movement velocity
    const detectMovement = (landmarks: any[]) => {
        // Calculate centroid X (average of all points for stability)
        let sumX = 0;
        for (const p of landmarks) sumX += p.x;
        const currentCentroidX = sumX / landmarks.length;

        if (prevCentroidX.current !== null) {
            // Calculate delta
            // Note: Camera is mirrored via CSS scale-x-[-1].
            // MediaPipe: 0 is Left, 1 is Right (in source).
            // If I move my hand physically RIGHT:
            // - In source video, hand moves RIGHT (x increases).
            // - On mirrored screen, hand moves RIGHT.
            // So if x increases, we want positive rotation (Right).
            // However, due to mirroring confusion, let's just test relative delta.
            
            // Inverting delta because usually in 3D orbit, rotating "positive" moves camera left (world spins right).
            // We want natural feeling: Hand Right -> Tree spins Right (Counter Clockwise usually or Clockwise?)
            // Let's stick to: Move hand Right -> Tree spins Right.
            
            const delta = currentCentroidX - prevCentroidX.current;
            
            // Apply deadzone and sensitivity
            if (Math.abs(delta) > 0.002) {
                 // Invert sign here to match visual direction with orbit controls
                 // If I move Right (x increases), delta is positive. 
                 // We send positive to rotationRef.
                 rotationInputRef.current = -delta * 50; 
            } else {
                rotationInputRef.current = 0;
            }
        }
        
        prevCentroidX.current = currentCentroidX;
    };

    // Helper to draw skeleton
    const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
       const connections = HandLandmarker.HAND_CONNECTIONS;
       ctx.strokeStyle = '#10b981'; // Emerald Green
       ctx.lineWidth = 2;
       
       for (const connection of connections) {
          const start = landmarks[connection.start];
          const end = landmarks[connection.end];
          ctx.beginPath();
          ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
          ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
          ctx.stroke();
       }
    };

    const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
       ctx.fillStyle = '#fbbf24'; // Amber/Gold
       for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
          ctx.fill();
       }
    };

    const detectGesture = (landmarks: any[]) => {
        const wrist = landmarks[0];
        
        const isFingerExtended = (tipIdx: number, baseIdx: number) => {
             const tip = landmarks[tipIdx];
             const base = landmarks[baseIdx];
             const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
             const distBase = Math.hypot(base.x - wrist.x, base.y - wrist.y);
             return distTip > distBase * 1.5; 
        };

        const indexOpen = isFingerExtended(8, 5);
        const middleOpen = isFingerExtended(12, 9);
        const ringOpen = isFingerExtended(16, 13);
        const pinkyOpen = isFingerExtended(20, 17);

        const openCount = [indexOpen, middleOpen, ringOpen, pinkyOpen].filter(Boolean).length;

        const now = Date.now();
        if (now - lastGestureTime.current < 1000) return; 

        const currentModeValue = modeRef.current;

        if (openCount === 4) {
            setDetectedGesture('Open Hand');
            if (currentModeValue !== 'DISPERSED') {
                setMode('DISPERSED');
                lastGestureTime.current = now;
            }
        } else if (openCount === 0) {
            setDetectedGesture('Closed Fist');
            if (currentModeValue !== 'TREE') {
                setMode('TREE');
                lastGestureTime.current = now;
            }
        } else {
            setDetectedGesture('Tracking...');
        }
    };

    setupMediaPipe();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
      if (stream) {
          stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [setMode, rotationInputRef]); 

  return (
    <div className="relative w-full h-full bg-black/80 rounded-lg overflow-hidden border border-emerald-500/30">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-emerald-500 animate-pulse">
          INITIALIZING VISION...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-50 transform scale-x-[-1]"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
      />
      <div className="absolute bottom-1 left-1 text-[8px] font-mono text-emerald-400 bg-black/50 px-1 rounded">
         {detectedGesture}
      </div>
    </div>
  );
};