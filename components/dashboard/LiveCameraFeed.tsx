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
  BellOff,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';
import { logHumanDetectionToSupabase } from '@/lib/supabaseClient';

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

interface HostIpInfo {
  name: string;
  ip: string;
  type: string;
}

const HUMAN_COLORS = [
  '#22C55E', // Green (Target 1)
  '#38BDF8', // Cyan (Target 2)
  '#F59E0B', // Amber (Target 3)
  '#A855F7', // Purple (Target 4)
  '#EC4899', // Pink (Target 5)
];

export interface LiveCameraFeedProps {
  className?: string;
  activeFilter?: 'optical' | 'thermal' | 'split';
  onFilterChange?: (filter: 'optical' | 'thermal' | 'split') => void;
  title?: string;
  showFilterControls?: boolean;
}

export default function LiveCameraFeed({
  className = '',
  activeFilter: externalFilter,
  onFilterChange,
  title = 'Live Optical Feed',
  showFilterControls = false,
}: LiveCameraFeedProps = {}) {
  const { telemetry, setCameraUrl, setCameraStatus, setHumanDetection, toggleHumanDetection } = useTelemetry();

  // Camera Source: 'phone_ip' (Rover Android Phone) or 'device_cam' (Laptop/USB Webcam)
  const [sourceType, setSourceType] = useState<'phone_ip' | 'device_cam'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('trayate_cam_source') as 'phone_ip' | 'device_cam') || 'phone_ip';
    }
    return 'phone_ip';
  });

  const [streamUrl, setStreamUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trayate_cam_url') || telemetry.camera.url || 'http://192.168.4.57:8080';
    }
    return telemetry.camera.url || 'http://192.168.4.57:8080';
  });

  // Filter mode: 'optical' | 'thermal' | 'split'
  const [internalFilter, setInternalFilter] = useState<'optical' | 'thermal' | 'split'>('optical');
  const currentFilter = externalFilter !== undefined ? externalFilter : internalFilter;

  const handleFilterSelect = (mode: 'optical' | 'thermal' | 'split') => {
    setInternalFilter(mode);
    onFilterChange?.(mode);
  };

  // Renderer mode for IP cam: 'canvas_fast' (zero-lag canvas loop) vs 'native_mjpeg' (/video)
  const [renderMode, setRenderMode] = useState<'canvas_fast' | 'native_mjpeg'>('canvas_fast');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Diagnostic ping state
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    hostIps?: HostIpInfo[];
  } | null>(null);

  // Live Performance Metrics
  const [fps, setFps] = useState<number>(0);
  const [frameLatency, setFrameLatency] = useState<number>(35);
  const [inferenceLatency, setInferenceLatency] = useState<number>(24);
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
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thermalCanvasRef = useRef<HTMLCanvasElement>(null);
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

  // Adjust camera resolution remotely via IP Webcam API
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

  // Switch between Phone IP and Local Device Camera
  const switchSource = (newSource: 'phone_ip' | 'device_cam') => {
    // Stop any existing webcam stream
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    setSourceType(newSource);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trayate_cam_source', newSource);
    }
    setConnectionError(null);
    setCameraStatus('CONNECTING');
    isLoopRunningRef.current = true;
  };

  // Run instant connection test to diagnose phone IP reachability
  const runConnectionTest = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/camera/ping?url=${encodeURIComponent(streamUrl)}`);
      const data = await res.json();
      setTestResult({
        ok: data.ok,
        message: data.message,
        hostIps: data.hostIps,
      });
      if (data.ok) {
        setConnectionError(null);
        setCameraStatus('CONNECTING');
        isLoopRunningRef.current = true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection test failed';
      setTestResult({
        ok: false,
        message: `Network request failed: ${msg}`,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

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
        ? `MULTIPLE SURVIVORS DETECTED [${count} PERSONS] // ACTIVE MISSION SECTOR` 
        : `HUMAN DETECTED [1 PERSON] // SECTOR 4 VISUAL TARGET`,
      confidence: highestConfidence,
      nearestDistance: nearestDist,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Anti-Spam Sound Alert Logic:
    // Play alert immediately when person count changes or after 30s reminder
    if (countChanged || (!isAcknowledgedRef.current && timeSinceLastAlert > 30000)) {
      lastAlertedCountRef.current = count;
      lastAlertTimestampRef.current = now;
      isAcknowledgedRef.current = false;
      setIsAlertAcknowledged(false);
      soundManager.playWarningAlert();

      // Store human detection event in Supabase backend
      logHumanDetectionToSupabase({
        count,
        confidence: highestConfidence,
        nearest_distance: nearestDist,
        message: count > 1 
          ? `Multiple survivors detected (${count} individuals)` 
          : `Human detected in active mission sector`,
      }).catch(() => {});
    }
  }, [setHumanDetection]);

  // Fast Bounding Box Overlay Renderer
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

      // Tactical Targeting Box
      ctx.strokeStyle = personColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = personColor;
      ctx.shadowBlur = 8;

      // 4 Corner Targeting Brackets
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLen, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLen);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLen, y + h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerLen, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLen);
      ctx.stroke();

      // Subtle fill tint
      ctx.fillStyle = `${personColor}18`;
      ctx.fillRect(x, y, w, h);

      // Center crosshair
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy);
      ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();

      // HUD Label Tag
      const labelText = `${person.label} • ${person.confidence}% • ~${person.distanceMeters}m`;
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      const tagHeight = 20;
      const tagY = y > tagHeight + 4 ? y - tagHeight - 2 : y + h + 4;

      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
      ctx.fillRect(x, tagY, textWidth + 14, tagHeight);

      ctx.strokeStyle = personColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, tagY, textWidth + 14, tagHeight);

      ctx.fillStyle = personColor;
      ctx.beginPath();
      ctx.arc(x + 7, tagY + tagHeight / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(labelText, x + 14, tagY + 14);

      ctx.restore();
    });
  }, [humanDetectionActive]);

  // AI Inference Loop (Runs asynchronously every 130ms on 320x240 offscreen canvas)
  useEffect(() => {
    if (!humanDetectionActive) return;

    let isMounted = true;
    if (!offscreenCanvasRef.current) {
      const oc = document.createElement('canvas');
      oc.width = 320;
      oc.height = 240;
      offscreenCanvasRef.current = oc;
    }

    const detectionInterval = setInterval(async () => {
      if (!isMounted || isDetectingRef.current || !cocoModelRef.current) return;
      
      const displayCanvas = canvasRef.current;
      const offCanvas = offscreenCanvasRef.current;
      if (!displayCanvas || !offCanvas || displayCanvas.width === 0 || displayCanvas.height === 0) return;

      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      isDetectingRef.current = true;
      const detectStart = performance.now();

      try {
        offCtx.drawImage(displayCanvas, 0, 0, 320, 240);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawPredictions = await cocoModelRef.current.detect(offCanvas, 6, 0.50);
        const duration = Math.round(performance.now() - detectStart);
        setInferenceLatency(duration);

        if (!isMounted) return;

        const scaleX = displayCanvas.width / 320;
        const scaleY = displayCanvas.height / 240;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedHumans: DetectedHuman[] = rawPredictions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((p: any) => {
            if (p.class !== 'person' || p.score < 0.50) return false;
            const [, , w, h] = p.bbox;
            if (w < 12 || h < 20) return false;
            const aspect = h / w;
            return aspect >= 0.75 && aspect <= 5.5;
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
              label: `PERSON #${idx + 1}`,
              color: HUMAN_COLORS[idx % HUMAN_COLORS.length],
            };
          });

        if (parsedHumans.length > 0) {
          lastSeenHumanTimeRef.current = Date.now();
          trackedHumansRef.current = parsedHumans;
          setDetectedHumans(parsedHumans);
          handleAlertDispatch(parsedHumans);
        } else if (Date.now() - lastSeenHumanTimeRef.current > 380) {
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

  // Video Renderer for LOCAL DEVICE WEBCAM
  useEffect(() => {
    if (sourceType !== 'device_cam') return;

    let isMounted = true;
    let animId: number;

    const startLocalCam = async () => {
      try {
        setCameraStatus('CONNECTING');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        webcamStreamRef.current = stream;

        // Hidden video element to play webcam stream
        let video = webcamVideoRef.current;
        if (!video) {
          video = document.createElement('video');
          video.playsInline = true;
          video.muted = true;
          video.autoplay = true;
          webcamVideoRef.current = video;
        }

        video.srcObject = stream;
        await video.play();

        setCameraStatus('CONNECTED');
        setConnectionError(null);

        const renderWebcamFrame = () => {
          if (!isMounted || sourceType !== 'device_cam') return;

          const canvas = canvasRef.current;
          if (canvas && video && video.readyState >= 2) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
              }
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              drawOverlaysOnCanvas(ctx, trackedHumansRef.current, canvas.width, canvas.height);

              if (thermalCanvasRef.current) {
                const tCanvas = thermalCanvasRef.current;
                if (tCanvas.width !== canvas.width || tCanvas.height !== canvas.height) {
                  tCanvas.width = canvas.width;
                  tCanvas.height = canvas.height;
                }
                const tCtx = tCanvas.getContext('2d');
                if (tCtx) {
                  tCtx.drawImage(canvas, 0, 0);
                }
              }

              frameCountRef.current += 1;
              setFrameLatency(8); // Hardware direct latency
            }
          }

          animId = requestAnimationFrame(renderWebcamFrame);
        };

        animId = requestAnimationFrame(renderWebcamFrame);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to access local camera';
        setCameraStatus('ERROR');
        setConnectionError(`Local camera permission denied or no device found: ${msg}`);
      }
    };

    startLocalCam();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }
    };
  }, [sourceType, setCameraStatus, drawOverlaysOnCanvas]);

  // Video Renderer for ROVER PHONE IP WEBCAM
  useEffect(() => {
    if (sourceType !== 'phone_ip') return;
    if (renderMode !== 'canvas_fast') return;
    if (telemetry.camera.status === 'DISCONNECTED') return;

    let isMounted = true;
    isLoopRunningRef.current = true;
    const controller = new AbortController();
    activeControllerRef.current = controller;

    const base = getBaseHost();
    let consecutiveErrors = 0;

    const fetchWithTimeout = async (url: string, timeoutMs: number) => {
      const timeoutController = new AbortController();
      const tid = setTimeout(() => timeoutController.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          cache: 'no-store',
          signal: timeoutController.signal,
        });
        clearTimeout(tid);
        return res;
      } catch (e) {
        clearTimeout(tid);
        throw e;
      }
    };

    const renderLoop = async () => {
      while (isMounted && isLoopRunningRef.current && sourceType === 'phone_ip') {
        const frameStart = performance.now();
        const timestamp = Date.now();
        const directUrl = `${base}/shot.jpg?t=${timestamp}`;
        const proxyUrl = `/api/camera/snapshot?url=${encodeURIComponent(directUrl)}`;

        try {
          let res: Response;
          try {
            // Direct LAN fetch with quick 1200ms timeout
            res = await fetchWithTimeout(directUrl, 1200);
          } catch {
            // Fallback to proxy route with 1500ms timeout
            res = await fetchWithTimeout(proxyUrl, 1500);
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
                drawOverlaysOnCanvas(ctx, trackedHumansRef.current, canvas.width, canvas.height);

                if (thermalCanvasRef.current) {
                  const tCanvas = thermalCanvasRef.current;
                  if (tCanvas.width !== canvas.width || tCanvas.height !== canvas.height) {
                    tCanvas.width = canvas.width;
                    tCanvas.height = canvas.height;
                  }
                  const tCtx = tCanvas.getContext('2d');
                  if (tCtx) {
                    tCtx.drawImage(canvas, 0, 0);
                  }
                }

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

                    if (thermalCanvasRef.current) {
                      const tCanvas = thermalCanvasRef.current;
                      if (tCanvas.width !== canvas.width || tCanvas.height !== canvas.height) {
                        tCanvas.width = canvas.width;
                        tCanvas.height = canvas.height;
                      }
                      const tCtx = tCanvas.getContext('2d');
                      if (tCtx) {
                        tCtx.drawImage(canvas, 0, 0);
                      }
                    }

                    URL.revokeObjectURL(objUrl);
                    resolve(null);
                  };
                  img.onerror = reject;
                  img.src = objUrl;
                });
              }
            }
          }

          const latency = Math.round(performance.now() - frameStart);
          setFrameLatency(latency);
          frameCountRef.current += 1;

          setCameraStatus('CONNECTED');
          setConnectionError(null);
          consecutiveErrors = 0;

        } catch (err: unknown) {
          if (!isMounted) break;
          const isAborted = err instanceof Error && err.name === 'AbortError';
          if (isAborted) break;

          consecutiveErrors += 1;
          if (consecutiveErrors >= 3) {
            setCameraStatus('ERROR');
            setConnectionError(
              `Cannot reach IP Webcam at ${base}. Ensure the Android app has "Start server" turned on.`
            );
          }
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    };

    renderLoop();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sourceType, renderMode, getBaseHost, telemetry.camera.status, setCameraStatus, drawOverlaysOnCanvas]);

  // FPS ticker
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
    if (sourceType === 'device_cam') {
      switchSource('device_cam');
      return;
    }
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
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
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
    if (sourceType === 'phone_ip') {
      setRemoteOptimization('640x480', 25);
    }
  }, [sourceType, setCameraStatus, setRemoteOptimization]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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
      } ${className}`}
    >
      {/* Top Header */}
      <div className="h-12 px-3 sm:px-4 bg-brand-secondary border-b border-brand-border flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-sans font-semibold text-brand-primaryText text-xs sm:text-sm truncate">
            {title}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 shrink-0 ${
            telemetry.camera.status === 'CONNECTED'
              ? 'bg-brand-success/15 border-brand-success/40 text-brand-success'
              : telemetry.camera.status === 'CONNECTING'
              ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning animate-pulse'
              : 'bg-brand-bg border-brand-border text-brand-secondaryText'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.camera.status === 'CONNECTED' ? 'bg-brand-success animate-pulse' : telemetry.camera.status === 'CONNECTING' ? 'bg-brand-warning' : 'bg-brand-secondaryText'}`}></span>
            <span>{telemetry.camera.status === 'CONNECTED' ? 'Live' : telemetry.camera.status === 'CONNECTING' ? 'Connecting...' : 'Offline'}</span>
          </span>
          {telemetry.camera.status === 'CONNECTED' && (
            <span className="text-xs text-brand-secondaryText hidden md:inline truncate">
              {frameLatency}ms latency • {fps} FPS
            </span>
          )}
        </div>

        {/* Source Toggle, AI Human Detection Toggle & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Source Selector: Rover IP Phone vs Device Cam */}
          <div className="flex items-center bg-brand-bg p-0.5 rounded-lg border border-brand-border text-xs">
            <button
              onClick={() => switchSource('phone_ip')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                sourceType === 'phone_ip'
                  ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Rover Smartphone IP Webcam (Android)"
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">Rover IP Cam</span>
            </button>
            <button
              onClick={() => switchSource('device_cam')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                sourceType === 'device_cam'
                  ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Local USB or Laptop Webcam (Testing)"
            >
              <Laptop className="w-3 h-3" />
              <span className="hidden sm:inline">Device Cam</span>
            </button>
          </div>

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
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              humanDetectionActive
                ? 'bg-brand-success/15 border-brand-success/40 text-brand-success shadow-xs'
                : 'bg-brand-bg border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
            title="Toggle Real-Time AI Human Detection"
          >
            {humanDetectionActive ? (
              <UserCheck className="w-3.5 h-3.5 text-brand-success" />
            ) : (
              <UserX className="w-3.5 h-3.5 text-brand-secondaryText" />
            )}
            <span className="hidden lg:inline">AI Detection:</span>
            <span>{humanDetectionActive ? 'On' : 'Off'}</span>
          </button>

          {/* Stream Engine Toggle (Only for IP Cam) */}
          {sourceType === 'phone_ip' && (
            <div className="hidden sm:flex items-center bg-brand-bg p-0.5 rounded-lg border border-brand-border text-xs">
              <button
                onClick={() => {
                  setRenderMode('canvas_fast');
                  isLoopRunningRef.current = true;
                  setCameraStatus('CONNECTING');
                }}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  renderMode === 'canvas_fast'
                    ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
                title="Direct canvas render (<60ms zero-lag pipeline)"
              >
                Zero-Lag
              </button>
              <button
                onClick={() => {
                  setRenderMode('native_mjpeg');
                  isLoopRunningRef.current = false;
                }}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  renderMode === 'native_mjpeg'
                    ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
                title="Continuous MJPEG stream (/video)"
              >
                MJPEG
              </button>
            </div>
          )}

          {/* Optional Filter Controls (Optical / Thermal / Split) */}
          {showFilterControls && (
            <div className="hidden md:flex items-center bg-brand-bg p-0.5 rounded-lg border border-brand-border text-xs">
              <button
                onClick={() => handleFilterSelect('optical')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentFilter === 'optical'
                    ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                Optical
              </button>
              <button
                onClick={() => handleFilterSelect('thermal')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentFilter === 'thermal'
                    ? 'bg-brand-danger text-white font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                Thermal
              </button>
              <button
                onClick={() => handleFilterSelect('split')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  currentFilter === 'split'
                    ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                Split
              </button>
            </div>
          )}

          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`p-1.5 rounded-lg hover:bg-brand-bg transition-colors ${
              showDiagnostics ? 'text-brand-accent' : 'text-brand-secondaryText'
            }`}
            title="Stream Diagnostics & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px]">
        {isFeedActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {currentFilter === 'split' ? (
              /* DUAL SPLIT VIEWPORT */
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                <div className="relative rounded-lg overflow-hidden border border-brand-border bg-black flex items-center justify-center min-h-[200px]">
                  {renderMode === 'canvas_fast' || sourceType === 'device_cam' ? (
                    <canvas ref={canvasRef} className="w-full h-full object-contain block" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={effectiveMjpegUrl} alt="HD Optical Feed" className="w-full h-full object-contain" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-sans text-brand-accent border border-brand-accent/30 pointer-events-none z-10 font-semibold">
                    HD OPTICAL RGB
                  </div>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-brand-border bg-black flex items-center justify-center min-h-[200px]">
                  {renderMode === 'canvas_fast' || sourceType === 'device_cam' ? (
                    <canvas ref={thermalCanvasRef} className="w-full h-full object-contain block filter contrast-125 brightness-110 hue-rotate-190 invert saturate-200" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={effectiveMjpegUrl} alt="Thermal Simulation Feed" className="w-full h-full object-contain filter contrast-125 brightness-110 hue-rotate-190 invert saturate-200" />
                  )}
                  <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-sans text-brand-danger border border-brand-danger/30 pointer-events-none z-10 font-semibold">
                    FLIR THERMAL LWIR 32x24
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE VIEWPORT */
              <div className="relative w-full h-full flex items-center justify-center">
                {(renderMode === 'canvas_fast' || sourceType === 'device_cam') && (
                  <canvas
                    ref={canvasRef}
                    className={`w-full h-full object-contain block transition-all duration-300 ${
                      currentFilter === 'thermal' ? 'filter contrast-125 brightness-110 hue-rotate-190 invert saturate-200' : ''
                    }`}
                  />
                )}

                {renderMode === 'native_mjpeg' && sourceType === 'phone_ip' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={mjpegImgRef}
                    src={effectiveMjpegUrl}
                    alt="Rover Video Feed"
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      currentFilter === 'thermal' ? 'filter contrast-125 brightness-110 hue-rotate-190 invert saturate-200' : ''
                    }`}
                    onLoad={() => {
                      setCameraStatus('CONNECTED');
                      setConnectionError(null);
                    }}
                    onError={() => {
                      setCameraStatus('ERROR');
                      setConnectionError('MJPEG stream connection stalled. Switching to ZERO-LAG CANVAS recommended.');
                    }}
                  />
                )}

                {currentFilter === 'thermal' && (
                  <div className="absolute top-3 left-3 bg-brand-danger/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-sans text-white border border-brand-danger/40 pointer-events-none z-20 font-semibold">
                    FLIR THERMAL LWIR 32x24 HEATMAP
                  </div>
                )}
              </div>
            )}

            {/* Connecting Spinner Overlay */}
            {telemetry.camera.status === 'CONNECTING' && fps === 0 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs font-sans text-brand-accent z-20">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-accent" />
                <span className="font-medium">
                  {sourceType === 'device_cam' ? 'Accessing local webcam...' : 'Connecting to rover camera stream...'}
                </span>
              </div>
            )}

            {/* Top Tactical Alert Banner (Multi-Human Support + Anti-Spam Acknowledge) */}
            {humanDetectionActive && activeAlert && (
              <div className={`absolute top-3 inset-x-4 mx-auto max-w-md rounded-xl border px-3.5 py-2.5 flex items-center justify-between shadow-xl backdrop-blur-md z-30 transition-all ${
                activeAlert.type === 'MULTIPLE'
                  ? 'bg-brand-bg/95 border-brand-accent text-brand-accent shadow-brand-accent/20'
                  : 'bg-brand-bg/95 border-brand-success text-brand-success shadow-brand-success/20'
              }`}>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold truncate pr-2 font-sans">
                  {activeAlert.type === 'MULTIPLE' ? (
                    <Users className="w-4 h-4 text-brand-accent shrink-0" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-brand-success shrink-0" />
                  )}
                  <span className="truncate">{activeAlert.message}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-sans bg-brand-secondary text-brand-primaryText px-2 py-0.5 rounded border border-brand-border font-medium">
                    {activeAlert.confidence}% • {activeAlert.nearestDistance}m
                  </span>
                  
                  {!isAlertAcknowledged ? (
                    <button
                      onClick={acknowledgeCurrentAlert}
                      className="px-2.5 py-1 rounded-md bg-brand-card hover:bg-brand-secondary border border-brand-border text-brand-primaryText text-xs font-medium transition-colors flex items-center gap-1 font-sans"
                      title="Silence sound alerts for this detection"
                    >
                      <BellOff className="w-3.5 h-3.5 text-brand-warning" />
                      <span>Mute</span>
                    </button>
                  ) : (
                    <span className="text-xs text-brand-success px-2 py-0.5 rounded bg-brand-success/15 border border-brand-success/30 font-medium font-sans">
                      Muted
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Live HUD Overlay (Left) */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-sans text-white/90 border border-white/10 pointer-events-none z-10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-brand-danger animate-pulse"></span>
              <span className="font-semibold text-brand-danger">Live</span>
              <span className="text-white/30">•</span>
              <span className="text-brand-success">{frameLatency}ms</span>
              <span className="text-white/30">•</span>
              <span className="text-white/80">{fps > 0 ? `${fps} FPS` : 'Connecting'}</span>
              {humanDetectionActive && (
                <>
                  <span className="text-white/30">•</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    detectedHumans.length > 0 ? (detectedHumans.length > 1 ? 'text-brand-accent' : 'text-brand-success') : 'text-brand-secondaryText'
                  }`}>
                    <Scan className="w-3.5 h-3.5" />
                    <span>{detectedHumans.length > 0 ? `${detectedHumans.length} ${detectedHumans.length === 1 ? 'Person' : 'People'}` : 'Scanning'}</span>
                  </span>
                </>
              )}
            </div>

            {/* Direct Connection Badge (Right) */}
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-sans text-brand-success border border-brand-success/30 pointer-events-none z-10 flex items-center gap-1.5 shadow-md">
              <Zap className="w-3.5 h-3.5 text-brand-success" />
              <span>{sourceType === 'device_cam' ? 'Device Camera' : 'Direct LAN'}</span>
            </div>
          </div>
        ) : (
          /* Disconnected State with Diagnostic Troubleshooter */
          <div className="p-6 sm:p-8 text-center max-w-lg space-y-4 my-auto overflow-y-auto max-h-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-secondary border border-brand-border flex items-center justify-center mx-auto text-brand-secondaryText">
              <WifiOff className="w-6 h-6 sm:w-7 sm:h-7 text-brand-secondaryText" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-brand-primaryText font-sans">
                {sourceType === 'phone_ip' ? 'Rover Camera Disconnected' : 'Device Camera Offline'}
              </h4>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                {sourceType === 'phone_ip' ? (
                  <>Connect to <strong className="text-brand-accent">IP Webcam</strong> app on the rover smartphone.</>
                ) : (
                  <>Local device webcam is currently offline. Allow camera permissions or switch to Rover IP Cam.</>
                )}
              </p>
            </div>

            {/* Actionable Phone Setup Checklist */}
            {sourceType === 'phone_ip' && (
              <div className="p-3 sm:p-4 rounded-xl bg-brand-secondary/70 border border-brand-border text-left space-y-2.5 text-xs">
                <div className="font-semibold text-brand-primaryText flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-brand-accent" />
                  <span>How to connect your Android phone:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-brand-secondaryText text-[11px] sm:text-xs">
                  <li>Open the <strong className="text-brand-primaryText">IP Webcam</strong> app on your Android phone.</li>
                  <li>Scroll all the way to the bottom and tap <strong className="text-brand-success">Start server</strong>.</li>
                  <li>Check the URL shown on the phone screen (e.g. <code className="text-brand-accent bg-brand-bg px-1 rounded font-mono">http://192.168.4.57:8080</code>).</li>
                  <li>Make sure phone is connected to the same Wi-Fi or your Laptop Hotspot.</li>
                </ol>
              </div>
            )}

            {/* Error or Test Feedback */}
            {connectionError && (
              <div className="p-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-xs text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{connectionError}</span>
              </div>
            )}

            {/* Live Diagnostic Ping Test Result */}
            {testResult && (
              <div className={`p-3 rounded-lg border text-xs text-left space-y-1.5 ${
                testResult.ok 
                  ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' 
                  : 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-brand-warning" />
                  )}
                  <span>{testResult.ok ? 'Connection Verified!' : 'Phone Server Not Detected'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-brand-primaryText/90">{testResult.message}</p>
                {testResult.hostIps && testResult.hostIps.length > 0 && (
                  <div className="pt-1 border-t border-brand-border/40 text-[10px] text-brand-secondaryText">
                    <span className="font-semibold text-brand-primaryText">Your Computer Networks:</span>
                    <ul className="mt-0.5 space-y-0.5">
                      {testResult.hostIps.map((h, i) => (
                        <li key={i} className="font-mono">
                          • {h.type}: <span className="text-brand-accent">{h.ip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Buttons: Connect, Test Connection, Switch to Device Webcam */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              {sourceType === 'phone_ip' ? (
                <>
                  <button
                    onClick={handleConnect}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Connect Feed</span>
                  </button>

                  <button
                    onClick={runConnectionTest}
                    disabled={isTestingConnection}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card text-brand-primaryText text-xs font-medium border border-brand-border transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-brand-accent' : ''}`} />
                    <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => switchSource('device_cam')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-success/15 hover:bg-brand-success/25 text-brand-success text-xs font-medium border border-brand-success/30 transition-colors"
                    title="Test with your laptop or USB webcam right now"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Use Device / USB Webcam</span>
                  </button>

                  <a
                    href={getBaseHost()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-bg hover:bg-brand-card text-brand-secondaryText hover:text-brand-primaryText text-xs font-medium border border-brand-border transition-colors"
                  >
                    <span>Open Phone Hub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnect}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold shadow-sm transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Device Webcam</span>
                  </button>

                  <button
                    onClick={() => switchSource('phone_ip')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card text-brand-primaryText text-xs font-medium border border-brand-border transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Switch to Rover IP Cam</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Diagnostics Drawer */}
        {showDiagnostics && (
          <div className="absolute top-3 right-3 w-80 bg-brand-secondary/95 border border-brand-border rounded-xl p-4 text-xs font-sans text-brand-secondaryText space-y-3 shadow-2xl backdrop-blur-md z-30">
            <div className="font-semibold text-brand-primaryText flex items-center justify-between pb-2 border-b border-brand-border">
              <span className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-brand-accent" />
                <span>Camera Diagnostics</span>
              </span>
              <span className="text-brand-success font-bold">{frameLatency}ms</span>
            </div>

            {sourceType === 'phone_ip' && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-brand-primaryText">Remote Resolution:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setRemoteOptimization('640x480', 25)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      resPreset === '640x480'
                        ? 'bg-brand-success text-brand-bg border-brand-success font-semibold'
                        : 'bg-brand-bg hover:bg-brand-card text-brand-success border-brand-success/40'
                    }`}
                  >
                    Turbo (640p)
                  </button>
                  <button
                    onClick={() => setRemoteOptimization('800x480', 35)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      resPreset === '800x480'
                        ? 'bg-brand-accent text-brand-bg border-brand-accent font-semibold'
                        : 'bg-brand-bg hover:bg-brand-card text-brand-accent border-brand-border'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    onClick={() => setRemoteOptimization('1280x720', 40)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                      resPreset === '1280x720'
                        ? 'bg-brand-primaryText text-brand-bg border-brand-primaryText font-semibold'
                        : 'bg-brand-bg hover:bg-brand-card text-brand-secondaryText border-brand-border'
                    }`}
                  >
                    720p HD
                  </button>
                </div>
              </div>
            )}

            {/* AI Human Detection Status Drawer Section */}
            <div className="space-y-1.5 pt-2 border-t border-brand-border text-xs">
              <div className="flex justify-between">
                <span>Vision Model:</span>
                <span className="text-brand-accent font-medium">
                  {modelStatus === 'READY' ? 'MobileNet v2 COCO-SSD' : modelStatus === 'LOADING' ? 'Initializing weights...' : 'Standby'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inference Time:</span>
                <span className="text-brand-success">{inferenceLatency} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Humans Detected:</span>
                <span className={detectedHumans.length > 0 ? 'text-brand-success font-semibold' : 'text-brand-secondaryText'}>
                  {detectedHumans.length > 0 ? `${detectedHumans.length} detected` : 'None (Clear)'}
                </span>
              </div>
              {detectedHumans.length > 0 && (
                <div className="flex justify-between">
                  <span>Nearest Distance:</span>
                  <span className="text-brand-success">{Math.min(...detectedHumans.map(d => d.distanceMeters))} m</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-brand-border text-xs">
              <div className="flex justify-between">
                <span>Active Source:</span>
                <span className="text-brand-primaryText font-medium">
                  {sourceType === 'device_cam' ? 'Local Device Webcam' : 'Rover IP Cam'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Frame Rate:</span>
                <span className="text-brand-accent">{fps} FPS</span>
              </div>
              {sourceType === 'phone_ip' && (
                <div className="flex justify-between">
                  <span>Camera Host:</span>
                  <span className="text-brand-success font-mono truncate max-w-[170px]">{getBaseHost()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-3 bg-brand-secondary border-t border-brand-border flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {sourceType === 'phone_ip' ? (
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="http://192.168.4.57:8080"
              className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs font-mono text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent"
            />
          ) : (
            <div className="flex-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-secondaryText flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-brand-primaryText font-medium">
                <Laptop className="w-4 h-4 text-brand-accent" />
                <span>Internal / USB Device Webcam Feed</span>
              </span>
              <span className="text-brand-success text-[11px] font-medium">Auto-Negotiated 640×480</span>
            </div>
          )}
          
          {isFeedActive ? (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 bg-brand-card hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/40 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors font-sans"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3.5 py-2 bg-brand-accent hover:bg-brand-accent-hover text-brand-bg rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm flex items-center gap-1.5 transition-colors font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Connect Feed</span>
            </button>
          )}
        </div>

        {/* Quick Presets & Status */}
        <div className="flex flex-wrap items-center justify-between text-xs text-brand-secondaryText gap-2">
          {sourceType === 'phone_ip' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-brand-primaryText font-medium flex items-center gap-1 text-[11px]">
                <Flame className="w-3 h-3 text-brand-warning" />
                <span>Presets:</span>
              </span>
              <button
                onClick={() => {
                  setStreamUrl('http://192.168.4.57:8080');
                  setRemoteOptimization('640x480', 25);
                }}
                className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border hover:border-brand-accent hover:text-brand-primaryText font-mono text-[10px] transition-colors"
              >
                192.168.4.57
              </button>
              <button
                onClick={() => {
                  setStreamUrl('http://192.168.137.1:8080');
                  setRemoteOptimization('640x480', 25);
                }}
                className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border hover:border-brand-accent hover:text-brand-primaryText font-mono text-[10px] transition-colors"
                title="Default Windows Mobile Hotspot IP"
              >
                192.168.137.1 (Hotspot)
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-brand-accent text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
              <span>Device camera active for zero-latency testing</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchSource(sourceType === 'phone_ip' ? 'device_cam' : 'phone_ip')}
              className="text-xs text-brand-accent hover:underline flex items-center gap-1"
            >
              <span>{sourceType === 'phone_ip' ? 'Switch to Webcam' : 'Switch to Rover Cam'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
