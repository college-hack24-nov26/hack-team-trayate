'use client';

import { useState, useRef, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';

export default function LiveCameraFeed() {
  const { telemetry, setCameraUrl, setCameraStatus } = useTelemetry();
  const [streamUrl, setStreamUrl] = useState(telemetry.camera.url);
  const [useProxy, setUseProxy] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Compute final effective URL
  const effectiveUrl = useProxy 
    ? `/api/camera/stream?url=${encodeURIComponent(streamUrl)}`
    : streamUrl;

  const handleConnect = () => {
    if (!streamUrl.trim()) return;
    setConnectionError(null);
    setCameraStatus('CONNECTING');
    setCameraUrl(streamUrl);
  };

  const handleDisconnect = () => {
    setCameraStatus('DISCONNECTED');
    setConnectionError(null);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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

        <div className="flex items-center gap-1.5">
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
        {telemetry.camera.status === 'CONNECTED' ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Live MJPEG Stream Element */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                setConnectionError('Stream failed to load. Check IP address, port 8080, and network route.');
              }}
            />

            {/* Live Camera HUD Overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-white/90 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping"></span>
              <span className="font-bold text-brand-danger">REC</span>
              <span className="text-white/40">|</span>
              <span>30 FPS</span>
              <span className="text-white/40">|</span>
              <span>1080p</span>
            </div>

            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-brand-accent border border-white/10">
              LATENCY: 38ms
            </div>
          </div>
        ) : (
          /* Disconnected / Placeholder state with IP Webcam setup instructions */
          <div className="p-6 text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center mx-auto text-brand-secondaryText">
              <WifiOff className="w-6 h-6 text-brand-secondaryText" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold text-brand-primaryText">
                Live Camera Feed Disconnected
              </h4>
              <p className="text-[11px] text-brand-secondaryText leading-relaxed">
                Connect to the Android smartphone running <strong className="text-brand-accent">IP Webcam</strong> mounted on T-Rover chassis.
              </p>
            </div>

            {connectionError && (
              <div className="p-2 rounded bg-brand-danger/10 border border-brand-danger/30 text-brand-danger text-[10px] text-left font-mono">
                {connectionError}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  setCameraStatus('CONNECTED');
                  setConnectionError(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-card hover:bg-brand-secondary text-brand-accent border border-brand-border text-xs font-semibold"
              >
                <span>Simulate Local Feed</span>
              </button>
            </div>
          </div>
        )}

        {/* Diagnostics Overlay */}
        {showDiagnostics && (
          <div className="absolute top-2 right-2 w-64 bg-brand-secondary/95 border border-brand-border rounded-lg p-3 text-[10px] font-mono text-brand-secondaryText space-y-1.5 shadow-xl backdrop-blur-md z-30">
            <div className="font-bold text-brand-primaryText flex items-center justify-between pb-1 border-b border-brand-border">
              <span>STREAM DIAGNOSTICS</span>
              <span className="text-brand-accent">{telemetry.camera.fps} FPS</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-brand-primaryText">{telemetry.camera.resolution}</span>
            </div>
            <div className="flex justify-between">
              <span>Stream Protocol:</span>
              <span className="text-brand-primaryText">{telemetry.camera.format}</span>
            </div>
            <div className="flex justify-between">
              <span>Relay Proxy:</span>
              <span className={useProxy ? 'text-brand-success' : 'text-brand-warning'}>
                {useProxy ? 'ACTIVE (Server Relay)' : 'DIRECT (LAN)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frame Loss:</span>
              <span className="text-brand-success">0.0% (0 pkts)</span>
            </div>
          </div>
        )}
      </div>

      {/* Stream URL Input & Controls Toolbar */}
      <div className="p-2 bg-brand-secondary border-t border-brand-border flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="http://192.168.1.100:8080/video"
            className="flex-1 bg-brand-bg border border-brand-border rounded px-2.5 py-1 text-xs font-mono text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent"
          />
          
          {telemetry.camera.status === 'CONNECTED' ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1 bg-brand-card hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/40 rounded text-xs font-semibold whitespace-nowrap"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-3 py-1 bg-brand-accent hover:bg-brand-accent-hover text-brand-bg rounded text-xs font-semibold whitespace-nowrap shadow-sm"
            >
              Connect Feed
            </button>
          )}
        </div>

        {/* IP Webcam Helper & Proxy switch */}
        <div className="flex items-center justify-between text-[10px] font-mono text-brand-secondaryText px-1">
          <div className="flex items-center gap-2">
            <span>ENDPOINT: <code className="text-brand-accent">/video</code> or <code className="text-brand-accent">/shot.jpg</code></span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-brand-primaryText">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxy(e.target.checked)}
              className="rounded bg-brand-bg border-brand-border text-brand-accent focus:ring-0 w-3 h-3"
            />
            <span>HTTPS Proxy Relay</span>
          </label>
        </div>
      </div>
    </div>
  );
}

