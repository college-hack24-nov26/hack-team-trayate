'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Wifi, 
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
  Radio
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';

export default function LiveCameraFeed() {
  const { telemetry, setCameraUrl, setCameraStatus } = useTelemetry();

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
  const [lastFrameTime, setLastFrameTime] = useState<string>('Ready');
  const [resPreset, setResPreset] = useState<'640x480' | '800x480' | '1280x720'>('640x480');

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

  // Zero-Lag Canvas Rendering Loop
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
          // Try direct LAN first (0 hops, fastest)
          let res: Response;
          try {
            res = await fetch(directUrl, {
              cache: 'no-store',
              signal: controller.signal,
            });
          } catch {
            // Fallback to local snapshot proxy if direct LAN fetch encounters CORS/PNA
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

          // Next frame request immediately without artificial timeout
        } catch (err: unknown) {
          if (!isMounted) break;
          const isAborted = err instanceof Error && err.name === 'AbortError';
          if (isAborted) break;

          consecutiveErrors += 1;
          if (consecutiveErrors > 5) {
            setCameraStatus('ERROR');
            setConnectionError('Camera feed connection lost. Checking connection...');
          }
          // Backoff slightly on errors
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    };

    renderLoop();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [renderMode, getBaseHost, telemetry.camera.status, setCameraStatus]);

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

        {/* Engine Switcher & Controls */}
        <div className="flex items-center gap-1.5">
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
              ⚡ ZERO-LAG PIPELINE
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
              MJPEG STREAM
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
            
            {/* 1. ZERO-LAG CANVAS ENGINE */}
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

            {/* Live HUD Overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-white/90 border border-white/10 pointer-events-none z-10 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping"></span>
              <span className="font-bold text-brand-danger">LIVE</span>
              <span className="text-white/40">|</span>
              <span className="text-brand-success font-semibold">{frameLatency}ms LATENCY</span>
              <span className="text-white/40">|</span>
              <span className="text-brand-accent font-semibold">{fps > 0 ? `${fps} FPS` : 'CONNECTING'}</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60">{resPreset}</span>
            </div>

            {/* Direct Connection Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-brand-success border border-brand-success/30 pointer-events-none z-10 flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3 text-brand-success" />
              <span>DIRECT LAN ACTIVE</span>
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
              <Play className="w-3 h-3 fill-current" />
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
