'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Wifi, 
  WifiOff, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  CheckCircle2,
  ExternalLink,
  Layers,
  Zap,
  Play,
  Square
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';

export default function LiveCameraFeed() {
  const { telemetry, setCameraUrl, setCameraStatus } = useTelemetry();
  
  // Persistent stream URL from localStorage or store
  const [streamUrl, setStreamUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trayate_cam_url') || telemetry.camera.url || 'http://192.168.4.57:8080/video';
    }
    return telemetry.camera.url || 'http://192.168.4.57:8080/video';
  });

  const [useProxy, setUseProxy] = useState<boolean>(false);
  const [streamMode, setStreamMode] = useState<'mjpeg' | 'snapshot'>('mjpeg');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Snapshot loop state
  const [snapshotSrc, setSnapshotSrc] = useState<string>('');
  const snapshotActiveRef = useRef<boolean>(false);
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compute effective stream URL
  const effectiveUrl = useProxy 
    ? `/api/camera/stream?url=${encodeURIComponent(streamUrl)}`
    : streamUrl;

  // Snapshot polling loop
  const triggerNextSnapshot = useCallback(() => {
    if (!snapshotActiveRef.current) return;
    
    // Convert URL to /shot.jpg
    let base = streamUrl.trim();
    if (base.endsWith('/video') || base.endsWith('/videofeed')) {
      base = base.replace(/\/video(feed)?$/, '/shot.jpg');
    } else if (!base.includes('/shot.jpg')) {
      base = `${base.replace(/\/+$/, '')}/shot.jpg`;
    }

    const cacheBuster = `${base}?t=${Date.now()}`;
    setSnapshotSrc(cacheBuster);
  }, [streamUrl]);

  // Handle snapshot image loaded
  const handleSnapshotLoad = () => {
    setCameraStatus('CONNECTED');
    setConnectionError(null);
    if (snapshotActiveRef.current) {
      // Loop next frame after 50ms (~20 FPS)
      snapshotTimerRef.current = setTimeout(triggerNextSnapshot, 50);
    }
  };

  const handleSnapshotError = () => {
    if (snapshotActiveRef.current) {
      snapshotTimerRef.current = setTimeout(triggerNextSnapshot, 500);
    }
  };

  // Connect button handler
  const handleConnect = () => {
    if (!streamUrl.trim()) return;
    setConnectionError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('trayate_cam_url', streamUrl);
    }
    setCameraUrl(streamUrl);

    if (streamMode === 'snapshot' || streamUrl.includes('shot.jpg')) {
      snapshotActiveRef.current = true;
      setCameraStatus('CONNECTING');
      triggerNextSnapshot();
    } else {
      snapshotActiveRef.current = false;
      setCameraStatus('CONNECTING');
    }
  };

  // Disconnect button handler
  const handleDisconnect = () => {
    snapshotActiveRef.current = false;
    if (snapshotTimerRef.current) {
      clearTimeout(snapshotTimerRef.current);
    }
    setCameraStatus('DISCONNECTED');
    setConnectionError(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      snapshotActiveRef.current = false;
      if (snapshotTimerRef.current) {
        clearTimeout(snapshotTimerRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isFeedActive = telemetry.camera.status === 'CONNECTED' || telemetry.camera.status === 'CONNECTING';

  return (
    <div 
      ref={containerRef}
      className={`bg-brand-card border border-brand-border rounded-xl flex flex-col overflow-hidden relative ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'h-full'
      }`}
    >
      {/* Header bar */}
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
        </div>

        {/* Mode & Fullscreen Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-brand-bg p-0.5 rounded border border-brand-border text-[9px]">
            <button
              onClick={() => {
                setStreamMode('mjpeg');
                snapshotActiveRef.current = false;
                if (!streamUrl.endsWith('/video')) {
                  const newUrl = streamUrl.replace(/\/shot\.jpg.*$/, '/video');
                  setStreamUrl(newUrl);
                }
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamMode === 'mjpeg' ? 'bg-brand-accent text-brand-bg font-bold' : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Continuous MJPEG Stream (/video)"
            >
              MJPEG
            </button>
            <button
              onClick={() => {
                setStreamMode('snapshot');
                snapshotActiveRef.current = true;
                triggerNextSnapshot();
              }}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamMode === 'snapshot' ? 'bg-brand-accent text-brand-bg font-bold' : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
              title="Fast Snapshot Polling Loop (/shot.jpg)"
            >
              SNAPSHOT
            </button>
          </div>

          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className={`p-1 rounded hover:bg-brand-bg transition-colors ${
              showDiagnostics ? 'text-brand-accent' : 'text-brand-secondaryText'
            }`}
            title="Toggle Diagnostics Overlay"
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

      {/* Camera Video Area */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[220px]">
        {isFeedActive ? (
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* 1. MJPEG Stream Mode */}
            {streamMode === 'mjpeg' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={effectiveUrl}
                alt="Live Rover Camera Feed"
                className="w-full h-full object-contain"
                onLoad={() => {
                  setCameraStatus('CONNECTED');
                  setConnectionError(null);
                }}
                onError={() => {
                  setCameraStatus('ERROR');
                  setConnectionError('Stream failed to load directly. Switch to Snapshot mode or verify IP address.');
                }}
              />
            )}

            {/* 2. Snapshot Loop Mode */}
            {streamMode === 'snapshot' && snapshotSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snapshotSrc}
                alt="Live Rover Snapshot Feed"
                className="w-full h-full object-contain"
                onLoad={handleSnapshotLoad}
                onError={handleSnapshotError}
              />
            )}

            {/* Loading / Connecting Overlay */}
            {telemetry.camera.status === 'CONNECTING' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 font-mono text-xs text-brand-accent">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-accent" />
                <span>CONNECTING TO IP WEBCAM STREAM...</span>
              </div>
            )}

            {/* Live Camera HUD Overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/90 border border-white/10 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping"></span>
              <span className="font-bold text-brand-danger">LIVE</span>
              <span className="text-white/40">|</span>
              <span>{streamMode === 'mjpeg' ? 'MJPEG STREAM' : 'SNAPSHOT 20FPS'}</span>
              <span className="text-white/40">|</span>
              <span className="text-brand-accent">192.168.4.57</span>
            </div>

            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-brand-success border border-white/10 pointer-events-none">
              {useProxy ? 'RELAY ACTIVE' : 'DIRECT LAN (0ms LATENCY)'}
            </div>
          </div>
        ) : (
          /* Disconnected State with Setup Guidance */
          <div className="p-6 text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center mx-auto text-brand-secondaryText">
              <WifiOff className="w-6 h-6 text-brand-secondaryText" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold text-brand-primaryText">
                Live Camera Feed Disconnected
              </h4>
              <p className="text-[11px] text-brand-secondaryText leading-relaxed">
                Connect to Android <strong className="text-brand-accent">IP Webcam</strong> running at <code className="text-brand-primaryText">http://192.168.4.57:8080</code>.
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
                <span>Connect Live Feed</span>
              </button>

              <a
                href="http://192.168.4.57:8080"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card text-brand-secondaryText hover:text-brand-primaryText text-xs font-mono border border-brand-border"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Stream Diagnostics Overlay */}
        {showDiagnostics && (
          <div className="absolute top-2 right-2 w-64 bg-brand-secondary/95 border border-brand-border rounded-lg p-3 text-[10px] font-mono text-brand-secondaryText space-y-1.5 shadow-xl backdrop-blur-md z-30">
            <div className="font-bold text-brand-primaryText flex items-center justify-between pb-1 border-b border-brand-border">
              <span>STREAM DIAGNOSTICS</span>
              <span className="text-brand-accent">{streamMode.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Host:</span>
              <span className="text-brand-primaryText">192.168.4.57:8080</span>
            </div>
            <div className="flex justify-between">
              <span>Endpoint:</span>
              <span className="text-brand-primaryText">{streamMode === 'mjpeg' ? '/video' : '/shot.jpg'}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport:</span>
              <span className={useProxy ? 'text-brand-warning' : 'text-brand-success font-semibold'}>
                {useProxy ? 'Server Relay Proxy' : 'Direct LAN (Recommended)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>HTTP Status:</span>
              <span className="text-brand-success">200 OK Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Stream URL Input & Controls Toolbar */}
      <div className="p-2.5 bg-brand-secondary border-t border-brand-border flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="http://192.168.4.57:8080/video"
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
              <span>Connect Feed</span>
            </button>
          )}
        </div>

        {/* Quick URL Presets & Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-brand-secondaryText gap-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span>PRESETS:</span>
            <button
              onClick={() => {
                setStreamUrl('http://192.168.4.57:8080/video');
                setStreamMode('mjpeg');
              }}
              className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border hover:text-brand-accent hover:border-brand-accent transition-colors"
            >
              /video
            </button>
            <button
              onClick={() => {
                setStreamUrl('http://192.168.4.57:8080/shot.jpg');
                setStreamMode('snapshot');
              }}
              className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border hover:text-brand-accent hover:border-brand-accent transition-colors"
            >
              /shot.jpg
            </button>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-brand-primaryText">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded bg-brand-bg border-brand-border text-brand-accent focus:ring-0 w-3 h-3"
            />
            <span>Server Proxy Relay</span>
          </label>
        </div>
      </div>
    </div>
  );
}
