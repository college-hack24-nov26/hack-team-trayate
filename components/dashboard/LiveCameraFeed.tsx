'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  WifiOff, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Sliders, 
  Zap, 
  Gauge,
  Play, 
  Square,
  ExternalLink,
  Flame,
  UserCheck,
  UserX,
  Scan,
  Users,
  BellOff
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';

interface DetectedHuman {
  bbox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
  distanceMeters: number;
  id: number;
  label: string;
  color: string;
}

interface ActiveHumanAlert {
  type: 'SINGLE' | 'MULTIPLE';
  count: number;
  message: string;
  confidence: number;
  nearestDistance: number;
  timestamp: string;
}

const HUMAN_COLORS = [
  '#22C55E', // Green (Target 1)
  '#38BDF8', // Cyan (Target 2)
  '#F59E0B', // Amber (Target 3)
  '#A855F7', // Purple (Target 4)
  '#EC4899', // Pink (Target 5)
];

export default function LiveCameraFeed() {
  const { telemetry, setCameraUrl, setCameraStatus, setHumanDetection, toggleHumanDetection } = useTelemetry();

  const [streamUrl, setStreamUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trayate_cam_url') || telemetry.camera.url || 'http://192.168.4.57:8080';
    }
    return telemetry.camera.url || 'http://192.168.4.57:8080';
  });

  // Renderer mode: 'canvas_fast' (zero-lag canvas loop) vs 'native_mjpeg' (/video)
  const [renderMode, setRenderMode] = useState<'canvas_fast' | 'native_mjpeg'>('canvas_fast');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Live Performance Metrics
  const [fps, setFps] = useState<number>(0);
  const [frameLatency, setFrameLatency] = useState<number>(45);
  const [inferenceLatency, setInferenceLatency] = useState<number>(24);
  const [lastFrameTime, setLastFrameTime] = useState<string>('Ready');
  const [resPreset, setResPreset] = useState<'640x480' | '800x480' | '1280x720'>('640x480');

  // AI Human Detection State
  const [humanDetectionActive, setHumanDetectionActive] = useState<boolean>(true);
  const [detectedHumans, setDetectedHumans] = useState<DetectedHuman[]>([]);
  const [activeAlert, setActiveAlert] = useState<ActiveHumanAlert | null>(null);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<'LOADING' | 'READY' | 'STANDBY'>('LOADING');

  // Decoupled refs for high-performance zero-lag rendering
  const trackedHumansRef = useRef<DetectedHuman[]>([]);
  const lastSeenHumanTimeRef = useRef<number>(0);
  const isDetectingRef = useRef<boolean>(false);
  const lastAlertedCountRef = useRef<number>(0);
  const lastAlertTimestampRef = useRef<number>(0);
  const isAcknowledgedRef = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cocoModelRef = useRef<any>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(Date.now());
  const isLoopRunningRef = useRef<boolean>(true);
  const activeControllerRef = useRef<AbortController | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mjpegImgRef = useRef<HTMLImageElement>(null);

  // Extract base host from URL (e.g., http://192.168.4.57:8080)
  const getBaseHost = useCallback(() => {
    try {
      const clean = streamUrl.trim().replace(/\/video\/?$/, '').replace(/\/shot\.jpg\/?$/, '');
      const parsed = new URL(clean.startsWith('http') ? clean : `http://${clean}`);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return 'http://192.168.4.57:8080';
    }
  }, [streamUrl]);

  // Adjust camera resolution remotely via IP Webcam API for instant lag elimination
  const setRemoteOptimization = useCallback(async (res: '640x480' | '800x480' | '1280x720' = '640x480', quality: number = 25) => {
    const base = getBaseHost();
    setResPreset(res);
    try {
      await fetch(`${base}/settings/video_size?set=${res}`, { method: 'POST', mode: 'no-cors' });
      await fetch(`${base}/settings/photo_size?set=${res}`, { method: 'POST', mode: 'no-cors' });
      await fetch(`${base}/settings/quality?set=${quality}`, { method: 'POST', mode: 'no-cors' });
    } catch {
      // Ignored: Best effort optimization
    }
  }, [getBaseHost]);

  // Dynamic High-Accuracy Neural Network Loader (TensorFlow.js + MobileNet v2 COCO-SSD)
  useEffect(() => {
    let isCancelled = false;

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initDetector = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (!win.tf) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
        }
        if (!win.cocoSsd) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        }

        if (isCancelled) return;

        if (win.cocoSsd) {
          // Load MobileNet v2 for maximum human detection accuracy
          const loadedModel = await win.cocoSsd.load({ base: 'mobilenet_v2' });
          if (!isCancelled) {
            cocoModelRef.current = loadedModel;
            setModelStatus('READY');
          }
        }
      } catch {
        if (!isCancelled) {
          setModelStatus('STANDBY');
        }
      }
    };

    initDetector();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Process Alerts with Multi-Human Detection & Anti-Spam Debounce
  const handleAlertDispatch = useCallback((humans: DetectedHuman[]) => {
    const count = humans.length;

    if (count === 0) {
      lastAlertedCountRef.current = 0;
      isAcknowledgedRef.current = false;
      setIsAlertAcknowledged(false);
      setActiveAlert(null);
      setHumanDetection({
        detected: false,
        count: 0,
        confidence: 0,
        distanceEst: 0,
      });
      return;
    }

    const highestConfidence = Math.max(...humans.map((h) => h.confidence));
    const nearestDist = Math.min(...humans.map((h) => h.distanceMeters));

    setHumanDetection({
      detected: true,
      count,
      confidence: highestConfidence,
      distanceEst: nearestDist,
    });

    const now = Date.now();
    const countChanged = count !== lastAlertedCountRef.current;
    const timeSinceLastAlert = now - lastAlertTimestampRef.current;

    // Build the visual alert banner
    setActiveAlert({
      type: count > 1 ? 'MULTIPLE' : 'SINGLE',
      count,
      message: count > 1 
        ? `MULTIPLE HUMANS DETECTED [${count} PERSONS] // ACTIVE RESCUE ZONE` 
        : `HUMAN LIFE DETECTED [1 PERSON] // SECTOR 4 VISUAL TARGET`,
      confidence: highestConfidence,
      nearestDistance: nearestDist,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Anti-Spam Sound Alert Logic:
    // 1. If human count changes (e.g. 0 -> 1, or 1 -> 2, or 2 -> 3), play alert immediately!
    // 2. If same count remains, DO NOT SPAM! Silent while operator observes, with 30s gentle reminder.
    if (countChanged || (!isAcknowledgedRef.current && timeSinceLastAlert > 30000)) {
      lastAlertedCountRef.current = count;
      lastAlertTimestampRef.current = now;
      isAcknowledgedRef.current = false;
      setIsAlertAcknowledged(false);
      soundManager.playWarningAlert();
    }
  }, [setHumanDetection]);

  // Fast Bounding Box Overlay Renderer (Runs synchronously with zero lag on frame draw)
  const drawOverlaysOnCanvas = useCallback((
    ctx: CanvasRenderingContext2D, 
    humans: DetectedHuman[], 
    width: number, 
    height: number
  ) => {
    if (!humanDetectionActive || humans.length === 0) return;

    humans.forEach((person) => {
      const [x, y, w, h] = person.bbox;
      const cornerLen = Math.max(14, Math.min(26, w * 0.22));
      const personColor = person.color || '#22C55E';

      ctx.save();

      // Cybernetic High-Visibility Targeting Box
      ctx.strokeStyle = personColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = personColor;
      ctx.shadowBlur = 9;

      // 4 Corner Targeting Brackets
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLen, y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLen, y + h);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();

      // Translucent target highlight
      ctx.fillStyle = personColor === '#22C55E' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(x, y, w, h);

      // Center Aim Reticle
      const cx = x + w / 2;
      const cy = y + h * 0.35; // Head / torso center
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();

      // Cybernetic Telemetry Tag Header
      const labelText = `${person.label} [${person.confidence}% CONF]`;
      const distText = `EST. DISTANCE: ${person.distanceMeters}m`;
      ctx.font = 'bold 11px monospace';
      const textWidth = Math.max(ctx.measureText(labelText).width, ctx.measureText(distText).width);
      const tagHeight = 32;
      const tagY = Math.max(0, y - tagHeight - 4);

      ctx.fillStyle = 'rgba(8, 13, 20, 0.94)';
      ctx.strokeStyle = personColor;
      ctx.lineWidth = 1.2;
      ctx.fillRect(x, tagY, textWidth + 14, tagHeight);
      ctx.strokeRect(x, tagY, textWidth + 14, tagHeight);

      ctx.fillStyle = personColor;
      ctx.fillText(labelText, x + 6, tagY + 13);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText(distText, x + 6, tagY + 26);

      ctx.restore();
    });

    // Scanner Watermark overlay
    ctx.save();
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.fillText(`AI MULTI-TARGET SURVIVOR DETECTION // TRACKING ${humans.length} ACTIVE TARGETS`, 12, height - 12);
    ctx.restore();
  }, [humanDetectionActive]);

  // Independent Decoupled AI Human Detection Worker Loop (Runs every 130ms on off-screen 320x240 canvas)
  useEffect(() => {
    if (!humanDetectionActive) {
      trackedHumansRef.current = [];
      setDetectedHumans([]);
      setActiveAlert(null);
      return;
    }

    let isMounted = true;

    // Initialize 320x240 off-screen canvas once for ultra-fast MobileNet SSD inference
    if (!offscreenCanvasRef.current && typeof document !== 'undefined') {
      const oc = document.createElement('canvas');
      oc.width = 320;
      oc.height = 240;
      offscreenCanvasRef.current = oc;
    }

    const detectionInterval = setInterval(async () => {
      if (!isMounted || isDetectingRef.current || !cocoModelRef.current || !canvasRef.current) {
        return;
      }

      const displayCanvas = canvasRef.current;
      const offCanvas = offscreenCanvasRef.current;
      if (!offCanvas || displayCanvas.width === 0 || displayCanvas.height === 0) return;

      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      isDetectingRef.current = true;
      const detectStart = performance.now();

      try {
        // Fast blit display canvas frame into 320x240 offscreen canvas
        offCtx.drawImage(displayCanvas, 0, 0, 320, 240);

        // Run MobileNet SSD inference on 320x240 (Takes ~20-30ms instead of 250ms!)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawPredictions = await cocoModelRef.current.detect(offCanvas, 6, 0.50);
        const duration = Math.round(performance.now() - detectStart);
        setInferenceLatency(duration);

        if (!isMounted) return;

        const scaleX = displayCanvas.width / 320;
        const scaleY = displayCanvas.height / 240;

        // Filter for persons with valid physical aspect ratio
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedHumans: DetectedHuman[] = rawPredictions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((p: any) => {
            if (p.class !== 'person' || p.score < 0.50) return false;
            const [, , w, h] = p.bbox;
            if (w < 12 || h < 20) return false;
            const aspect = h / w;
            return aspect >= 0.75 && aspect <= 5.5; // Natural human silhouette ratio
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any, idx: number) => {
            const sx = Math.round(p.bbox[0] * scaleX);
            const sy = Math.round(p.bbox[1] * scaleY);
            const sw = Math.round(p.bbox[2] * scaleX);
            const sh = Math.round(p.bbox[3] * scaleY);
            const relHeight = sh / displayCanvas.height;
            const dist = Math.max(0.6, Math.min(8.0, Number((1.7 / Math.max(0.18, relHeight * 1.5)).toFixed(1))));

            return {
              bbox: [sx, sy, sw, sh] as [number, number, number, number],
              confidence: Math.round(p.score * 100),
              distanceMeters: dist,
              id: idx + 1,
              label: `HUMAN #${idx + 1}`,
              color: HUMAN_COLORS[idx % HUMAN_COLORS.length],
            };
          });

        if (parsedHumans.length > 0) {
          lastSeenHumanTimeRef.current = Date.now();
          trackedHumansRef.current = parsedHumans;
          setDetectedHumans(parsedHumans);
          handleAlertDispatch(parsedHumans);
        } else if (Date.now() - lastSeenHumanTimeRef.current > 380) {
          // Decay bounding box after 380ms of no detection to prevent flickering
          trackedHumansRef.current = [];
          setDetectedHumans([]);
          handleAlertDispatch([]);
        }
      } catch {
        // Ignored
      } finally {
        isDetectingRef.current = false;
      }
    }, 130);

    return () => {
      isMounted = false;
      clearInterval(detectionInterval);
    };
  }, [humanDetectionActive, handleAlertDispatch]);

  // Main Zero-Lag Video Rendering Loop (Decoupled: NEVER blocked on AI inference)
  useEffect(() => {
    if (renderMode !== 'canvas_fast') return;
    if (telemetry.camera.status === 'DISCONNECTED') return;

    let isMounted = true;
    isLoopRunningRef.current = true;
    const controller = new AbortController();
    activeControllerRef.current = controller;

    const base = getBaseHost();
    let consecutiveErrors = 0;

    const renderLoop = async () => {
      while (isMounted && isLoopRunningRef.current) {
        const frameStart = performance.now();
        const timestamp = Date.now();
        const directUrl = `${base}/shot.jpg?t=${timestamp}`;
        const proxyUrl = `/api/camera/snapshot?url=${encodeURIComponent(directUrl)}`;

        try {
          let res: Response;
          try {
            res = await fetch(directUrl, {
              cache: 'no-store',
              signal: controller.signal,
            });
          } catch {
            res = await fetch(proxyUrl, {
              cache: 'no-store',
              signal: controller.signal,
            });
          }

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const blob = await res.blob();
          if (!isMounted) break;

          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              if ('createImageBitmap' in window) {
                const bitmap = await createImageBitmap(blob);
                if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
                  canvas.width = bitmap.width;
                  canvas.height = bitmap.height;
                }
                ctx.drawImage(bitmap, 0, 0);

                // Render current tracked humans immediately with zero frame stall
                drawOverlaysOnCanvas(ctx, trackedHumansRef.current, canvas.width, canvas.height);
                bitmap.close();
              } else {
                const objUrl = URL.createObjectURL(blob);
                const img = new Image();
                await new Promise((resolve, reject) => {
                  img.onload = () => {
                    if (canvas.width !== img.width || canvas.height !== img.height) {
                      canvas.width = img.width;
                      canvas.height = img.height;
                    }
                    ctx.drawImage(img, 0, 0);
                    drawOverlaysOnCanvas(ctx, trackedHumansRef.current, canvas.width, canvas.height);
                    URL.revokeObjectURL(objUrl);
                    resolve(null);
                  };
                  img.onerror = reject;
                  img.src = objUrl;
                });
              }
            }
          }

          // Latency & Metrics Update
          const latency = Math.round(performance.now() - frameStart);
          setFrameLatency(latency);
          frameCountRef.current += 1;
          setLastFrameTime(new Date().toLocaleTimeString());
          setCameraStatus('CONNECTED');
          setConnectionError(null);
          consecutiveErrors = 0;

        } catch (err: unknown) {
          if (!isMounted) break;
          const isAborted = err instanceof Error && err.name === 'AbortError';
          if (isAborted) break;

          consecutiveErrors += 1;
          if (consecutiveErrors > 5) {
            setCameraStatus('ERROR');
            setConnectionError('Camera feed connection lost. Checking connection...');
          }
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    };

    renderLoop();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [renderMode, getBaseHost, telemetry.camera.status, setCameraStatus, drawOverlaysOnCanvas]);

  // FPS calculation ticker
  useEffect(() => {
    const fpsInterval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastFpsTimeRef.current) / 1000;
      if (deltaSec >= 1) {
        setFps(Math.round(frameCountRef.current / deltaSec));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }
    }, 1000);
    return () => clearInterval(fpsInterval);
  }, []);

  // Connect handler
  const handleConnect = () => {
    if (!streamUrl.trim()) return;
    setConnectionError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trayate_cam_url', streamUrl);
    }
    setCameraUrl(streamUrl);
    setCameraStatus('CONNECTING');
    isLoopRunningRef.current = true;
    setRemoteOptimization('640x480', 25);
  };

  // Disconnect handler
  const handleDisconnect = () => {
    isLoopRunningRef.current = false;
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    setCameraStatus('DISCONNECTED');
    setConnectionError(null);
    setFps(0);
    setDetectedHumans([]);
    setActiveAlert(null);
  };

  // Auto-connect on mount
  useEffect(() => {
    setCameraStatus('CONNECTING');
    isLoopRunningRef.current = true;
    setRemoteOptimization('640x480', 25);
  }, [setCameraStatus, setRemoteOptimization]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Operator Acknowledge Alert Handler (Silences repeat alerts for current event)
  const acknowledgeCurrentAlert = () => {
    soundManager.playClickTone();
    isAcknowledgedRef.current = true;
    setIsAlertAcknowledged(true);
  };

  const isFeedActive = telemetry.camera.status === 'CONNECTED' || telemetry.camera.status === 'CONNECTING';
  const effectiveMjpegUrl = `${getBaseHost()}/video`;

  return (
    <div 
      ref={containerRef}
      className={`bg-brand-card border border-brand-border rounded-xl flex flex-col overflow-hidden relative ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'h-full'
      }`}
    >
      {/* Top Header */}
      <div className="h-10 px-3 bg-brand-secondary border-b border-brand-border flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-brand-accent" />
          <span className="font-sans font-semibold text-brand-primaryText text-[11px] sm:text-xs">
            ROVER OPTICAL FEED
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
            telemetry.camera.status === 'CONNECTED'
              ? 'bg-brand-success/15 border-brand-success/40 text-brand-success'
              : telemetry.camera.status === 'CONNECTING'
              ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning animate-pulse'
              : 'bg-brand-bg border-brand-border text-brand-secondaryText'
          }`}>
            {telemetry.camera.status}
          </span>
          {telemetry.camera.status === 'CONNECTED' && (
            <span className="text-[10px] text-brand-success font-semibold hidden sm:inline">
              ⚡ {frameLatency}ms LAG
            </span>
          )}
        </div>

        {/* Engine Switcher, AI Human Detection Toggle & Controls */}
        <div className="flex items-center gap-1.5">
          
          {/* AI Human Detection Toggle Button */}
          <button
            onClick={() => {
              const next = !humanDetectionActive;
              setHumanDetectionActive(next);
              toggleHumanDetection(next);
              if (!next) {
                trackedHumansRef.current = [];
                setDetectedHumans([]);
                setActiveAlert(null);
              }
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold transition-all ${
              humanDetectionActive
                ? 'bg-brand-success/20 border-brand-success/50 text-brand-success shadow-xs'
                : 'bg-brand-bg border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
            title="Toggle Real-Time AI Human Detection on Camera Feed"
          >
            {humanDetectionActive ? (
              <UserCheck className="w-3 h-3 text-brand-success animate-pulse" />
            ) : (
              <UserX className="w-3 h-3 text-brand-secondaryText" />
            )}
            <span className="hidden sm:inline">AI HUMAN DETECT:</span>
            <span>{humanDetectionActive ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-0.5 bg-brand-bg p-0.5 rounded border border-brand-border text-[9px]">
            <button
              onClick={() => {
                setRenderMode('canvas_fast');
                isLoopRunningRef.current = true;
                setCameraStatus('CONNECTING');
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                renderMode === 'canvas_fast'
                  ? 'bg-brand-success text-brand-bg font-bold shadow-sm'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Ultra-Low Latency Canvas Pipeline (<70ms real-time delay)"
            >
              ⚡ ZERO-LAG
            </button>
            <button
              onClick={() => {
                setRenderMode('native_mjpeg');
                isLoopRunningRef.current = false;
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                renderMode === 'native_mjpeg'
                  ? 'bg-brand-accent text-brand-bg font-bold'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Continuous MJPEG Stream (/video)"
            >
              MJPEG
            </button>
          </div>

          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`p-1 rounded hover:bg-brand-bg transition-colors ${
              showDiagnostics ? 'text-brand-accent' : 'text-brand-secondaryText'
            }`}
            title="Stream Diagnostics & Latency Tuner"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[220px]">
        {isFeedActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* 1. ZERO-LAG CANVAS ENGINE WITH HUMAN DETECTION */}
            {renderMode === 'canvas_fast' && (
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
              />
            )}

            {/* 2. NATIVE MJPEG STREAM ENGINE */}
            {renderMode === 'native_mjpeg' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={mjpegImgRef}
                src={effectiveMjpegUrl}
                alt="Native Rover MJPEG Feed"
                className="w-full h-full object-contain"
                onLoad={() => {
                  setCameraStatus('CONNECTED');
                  setConnectionError(null);
                }}
                onError={() => {
                  setCameraStatus('ERROR');
                  setConnectionError('MJPEG stream stalled. Switching to ZERO-LAG PIPELINE recommended.');
                }}
              />
            )}

            {/* Connecting Spinner Overlay */}
            {telemetry.camera.status === 'CONNECTING' && fps === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 font-mono text-xs text-brand-accent">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-accent" />
                <span>CONNECTING ULTRA-LOW LATENCY STREAM...</span>
              </div>
            )}

            {/* Top Tactical Alert Banner (Multi-Human Support + Anti-Spam Acknowledge) */}
            {humanDetectionActive && activeAlert && (
              <div className={`absolute top-2 inset-x-3 mx-auto max-w-lg rounded-lg border-2 px-3 py-2 flex items-center justify-between shadow-2xl backdrop-blur-md z-30 transition-all ${
                activeAlert.type === 'MULTIPLE'
                  ? 'bg-brand-bg/95 border-brand-accent text-brand-accent shadow-[0_0_20px_rgba(56,189,248,0.35)]'
                  : 'bg-brand-bg/95 border-brand-success text-brand-success shadow-[0_0_15px_rgba(34,197,94,0.3)]'
              }`}>
                <div className="flex items-center gap-2 font-mono text-xs font-bold truncate pr-2">
                  {activeAlert.type === 'MULTIPLE' ? (
                    <Users className="w-4 h-4 text-brand-accent shrink-0 animate-bounce" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-brand-success shrink-0 animate-pulse" />
                  )}
                  <span className="truncate">{activeAlert.message}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] bg-brand-secondary text-brand-primaryText px-2 py-0.5 rounded border border-brand-border">
                    {activeAlert.confidence}% CONF • {activeAlert.nearestDistance}m
                  </span>
                  
                  {!isAlertAcknowledged ? (
                    <button
                      onClick={acknowledgeCurrentAlert}
                      className="px-2 py-0.5 rounded bg-brand-card hover:bg-brand-secondary border border-brand-border text-brand-primaryText text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                      title="Silence repeat alerts for this event"
                    >
                      <BellOff className="w-3 h-3 text-brand-warning" />
                      <span>Mute Alert</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-brand-success px-1.5 py-0.5 rounded bg-brand-success/15 border border-brand-success/30 font-semibold">
                      ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Live HUD Overlay (Left) */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-white/90 border border-white/10 pointer-events-none z-10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping"></span>
              <span className="font-bold text-brand-danger">LIVE</span>
              <span className="text-white/40">|</span>
              <span className="text-brand-success font-semibold">{frameLatency}ms LAG</span>
              <span className="text-white/40">|</span>
              <span className="text-brand-accent font-semibold">{fps > 0 ? `${fps} FPS` : 'CONNECTING'}</span>
              {humanDetectionActive && (
                <>
                  <span className="text-white/40">|</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    detectedHumans.length > 0 ? (detectedHumans.length > 1 ? 'text-brand-accent' : 'text-brand-success') : 'text-brand-secondaryText'
                  }`}>
                    <Scan className="w-3 h-3" />
                    <span>{detectedHumans.length > 0 ? `${detectedHumans.length} ${detectedHumans.length === 1 ? 'HUMAN' : 'HUMANS'}` : 'AI SCANNING'}</span>
                  </span>
                </>
              )}
            </div>

            {/* Direct Connection Badge (Right) */}
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-brand-success border border-brand-success/30 pointer-events-none z-10 flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3 text-brand-success" />
              <span>DIRECT LAN (0 HOPS)</span>
            </div>
          </div>
        ) : (
          /* Disconnected State */
          <div className="p-6 text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center mx-auto text-brand-secondaryText">
              <WifiOff className="w-6 h-6 text-brand-secondaryText" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold text-brand-primaryText">
                Rover Optical Feed Offline
              </h4>
              <p className="text-[11px] text-brand-secondaryText leading-relaxed">
                Connect to <strong className="text-brand-accent">IP Webcam</strong> on T-Rover chassis at <code className="text-brand-primaryText">http://192.168.4.57:8080</code>.
              </p>
            </div>

            {connectionError && (
              <div className="p-2 rounded bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-[10px] text-left font-mono">
                {connectionError}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold font-mono shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Connect Zero-Lag Feed</span>
              </button>

              <a
                href={getBaseHost()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card text-brand-secondaryText hover:text-brand-primaryText text-xs font-mono border border-brand-border"
              >
                <span>Camera Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Diagnostics & Remote Resolution Tuning Drawer */}
        {showDiagnostics && (
          <div className="absolute top-2 right-2 w-80 bg-brand-secondary/95 border border-brand-border rounded-lg p-3 text-[10px] font-mono text-brand-secondaryText space-y-2.5 shadow-2xl backdrop-blur-md z-30">
            <div className="font-bold text-brand-primaryText flex items-center justify-between pb-1 border-b border-brand-border">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-brand-accent" />
                <span>LATENCY OPTIMIZER & RESOLUTION</span>
              </span>
              <span className="text-brand-success font-bold">{frameLatency}ms</span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] uppercase text-brand-primaryText font-bold">1-Click Latency Modes:</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setRemoteOptimization('640x480', 25)}
                  className={`p-1.5 rounded border text-[9px] font-bold transition-colors ${
                    resPreset === '640x480'
                      ? 'bg-brand-success text-brand-bg border-brand-success'
                      : 'bg-brand-bg hover:bg-brand-card text-brand-success border-brand-success/40'
                  }`}
                  title="640x480 @ Quality 25 - Lowest possible latency (<50ms)"
                >
                  ⚡ TURBO (640x480)
                </button>
                <button
                  onClick={() => setRemoteOptimization('800x480', 35)}
                  className={`p-1.5 rounded border text-[9px] font-bold transition-colors ${
                    resPreset === '800x480'
                      ? 'bg-brand-accent text-brand-bg border-brand-accent'
                      : 'bg-brand-bg hover:bg-brand-card text-brand-accent border-brand-border'
                  }`}
                >
                  BALANCED
                </button>
                <button
                  onClick={() => setRemoteOptimization('1280x720', 40)}
                  className={`p-1.5 rounded border text-[9px] font-bold transition-colors ${
                    resPreset === '1280x720'
                      ? 'bg-brand-primaryText text-brand-bg border-brand-primaryText'
                      : 'bg-brand-bg hover:bg-brand-card text-brand-secondaryText border-brand-border'
                  }`}
                >
                  720p HD
                </button>
              </div>
            </div>

            {/* AI Human Detection Status Drawer Section */}
            <div className="space-y-1 pt-1.5 border-t border-brand-border text-[9px]">
              <div className="flex justify-between">
                <span>AI Neural Network:</span>
                <span className="text-brand-accent font-bold">
                  {modelStatus === 'READY' ? 'MobileNet v2 COCO-SSD' : modelStatus === 'LOADING' ? 'Initializing weights...' : 'Standby'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AI Inference Time:</span>
                <span className="text-brand-success font-bold">{inferenceLatency} ms (Async Worker)</span>
              </div>
              <div className="flex justify-between">
                <span>Human Targets Acquired:</span>
                <span className={detectedHumans.length > 0 ? 'text-brand-success font-bold' : 'text-brand-secondaryText'}>
                  {detectedHumans.length > 0 ? `${detectedHumans.length} INDIVIDUAL(S)` : '0 (SECTOR CLEAR)'}
                </span>
              </div>
              {detectedHumans.length > 0 && (
                <div className="flex justify-between">
                  <span>Nearest Distance:</span>
                  <span className="text-brand-success font-bold">{Math.min(...detectedHumans.map(d => d.distanceMeters))} m</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-1 border-t border-brand-border text-[9px]">
              <div className="flex justify-between">
                <span>Active Pipeline:</span>
                <span className="text-brand-primaryText font-bold">
                  {renderMode === 'canvas_fast' ? 'Direct Canvas Loop (Zero Buffer)' : 'MJPEG Stream'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Direct Frame Latency:</span>
                <span className="text-brand-success font-bold">{frameLatency} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Frame Rate:</span>
                <span className="text-brand-accent font-bold">{fps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span>Direct LAN Host:</span>
                <span className="text-brand-success font-mono">{getBaseHost()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Received:</span>
                <span className="text-white/70">{lastFrameTime}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-2.5 bg-brand-secondary border-t border-brand-border flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="http://192.168.4.57:8080"
            className="flex-1 bg-brand-bg border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent"
          />
          
          {isFeedActive ? (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-1.5 bg-brand-card hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/40 rounded text-xs font-semibold font-mono whitespace-nowrap flex items-center gap-1"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3.5 py-1.5 bg-brand-accent hover:bg-brand-accent-hover text-brand-bg rounded text-xs font-semibold font-mono whitespace-nowrap shadow-sm flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Connect Live Feed</span>
            </button>
          )}
        </div>

        {/* Quick Optimization Buttons */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-brand-secondaryText gap-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-brand-primaryText font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 text-brand-warning" />
              <span>LOW LATENCY PRESETS:</span>
            </span>
            <button
              onClick={() => setRemoteOptimization('640x480', 25)}
              className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-success/50 text-brand-success hover:bg-brand-success hover:text-brand-bg transition-colors font-bold"
              title="Set camera to 640x480 for ultra-low latency"
            >
              ⚡ 640x480 Turbo (Instant)
            </button>
            <button
              onClick={() => setRemoteOptimization('800x480', 35)}
              className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border hover:border-brand-accent hover:text-brand-accent transition-colors"
            >
              800x480 Balanced
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-brand-success flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>DIRECT LAN ACTIVE</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
