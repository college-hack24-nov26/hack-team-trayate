'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Crosshair, 
  MapPin, 
  AlertTriangle, 
  Compass, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface TunnelSegment {
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  isEvacRoute?: boolean;
}

interface Zone {
  name: string;
  type: 'danger' | 'restricted' | 'rescue' | 'portal';
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Obstacle {
  id: string;
  label: string;
  x: number;
  y: number;
  severity: 'warning' | 'critical';
}

export default function MissionMineMap() {
  const { telemetry } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState(1.1);
  const [pan, setPan] = useState({ x: -20, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Pre-calibrated mine layout segments
  const tunnels: TunnelSegment[] = [
    // Surface Portal to Main Haulage Drift
    { name: 'Portal Incline', x1: 60, y1: 80, x2: 160, y2: 120, width: 34, isEvacRoute: true },
    // Main Haulage Drift (Major east-west trunk)
    { name: 'Main Haulage Drift', x1: 160, y1: 120, x2: 560, y2: 120, width: 38, isEvacRoute: true },
    // Crosscut 1 (Connecting to Refuge Chamber)
    { name: 'Crosscut 1', x1: 240, y1: 120, x2: 240, y2: 260, width: 28, isEvacRoute: true },
    // Crosscut 2
    { name: 'Crosscut 2', x1: 340, y1: 120, x2: 340, y2: 260, width: 28, isEvacRoute: false },
    // Sub-Drift South
    { name: 'Sub-Drift South', x1: 240, y1: 260, x2: 520, y2: 260, width: 30, isEvacRoute: false },
    // Crosscut 3 (Leading to Longwall Extraction Face)
    { name: 'Crosscut 3', x1: 440, y1: 120, x2: 440, y2: 260, width: 26, isEvacRoute: false },
    // Return Airway (Hazardous exhaust corridor)
    { name: 'Return Airway', x1: 160, y1: 40, x2: 560, y2: 40, width: 24, isEvacRoute: false },
    // Ventilation Bleeder
    { name: 'Vent Bleeder', x1: 440, y1: 40, x2: 440, y2: 120, width: 20, isEvacRoute: false },
  ];

  const zones: Zone[] = [
    { name: 'PORTAL 01 (SURFACE)', type: 'portal', x: 20, y: 60, w: 70, h: 44 },
    { name: 'REFUGE CHAMBER (LIFE SUPPORT)', type: 'rescue', x: 190, y: 280, w: 100, h: 50 },
    { name: 'LONGWALL FACE ALPHA', type: 'restricted', x: 480, y: 100, w: 90, h: 44 },
    { name: 'RETURN AIRWAY (HIGH CH4)', type: 'danger', x: 300, y: 25, w: 120, h: 32 },
  ];

  const obstacles: Obstacle[] = [
    { id: 'OBS-1', label: 'Roof Fall Debris (35cm)', x: 380, y: 120, severity: 'warning' },
    { id: 'OBS-2', label: 'Thermal Anomaly (68°C)', x: 470, y: 260, severity: 'critical' },
  ];

  // Draw Mine Canvas
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // HiDPI resolution handling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Apply pan & zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    // 1. Background Grid (Subtle Technical Matrix)
    ctx.strokeStyle = '#162231';
    ctx.lineWidth = 1;
    const gridSize = 40;
    const mapW = 800;
    const mapH = 450;

    for (let x = 0; x < mapW; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapH);
      ctx.stroke();
    }
    for (let y = 0; y < mapH; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapW, y);
      ctx.stroke();
    }

    // 2. Render Mine Tunnel Corridors
    tunnels.forEach((t) => {
      // Tunnel Rock Perimeter (Outer wall)
      ctx.strokeStyle = '#243244';
      ctx.lineWidth = t.width + 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();

      // Tunnel Interior Excavated Void
      ctx.strokeStyle = '#0D1520';
      ctx.lineWidth = t.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();

      // Evacuation Route Highlight (Green illumination line)
      if (t.isEvacRoute) {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(t.x1, t.y1);
        ctx.lineTo(t.x2, t.y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Tunnel Labels
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    tunnels.forEach((t) => {
      const midX = (t.x1 + t.x2) / 2;
      const midY = (t.y1 + t.y2) / 2 - (t.width / 2 + 6);
      ctx.fillText(t.name.toUpperCase(), midX - 25, midY);
    });

    // 3. Render Special Zones
    zones.forEach((z) => {
      let fillColor = 'rgba(56, 189, 248, 0.08)';
      let strokeColor = '#38BDF8';

      if (z.type === 'danger') {
        fillColor = 'rgba(239, 68, 68, 0.15)';
        strokeColor = '#EF4444';
      } else if (z.type === 'restricted') {
        fillColor = 'rgba(245, 158, 11, 0.12)';
        strokeColor = '#F59E0B';
      } else if (z.type === 'rescue') {
        fillColor = 'rgba(34, 197, 94, 0.15)';
        strokeColor = '#22C55E';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeRect(z.x, z.y, z.w, z.h);

      ctx.fillStyle = strokeColor;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(z.name, z.x + 6, z.y + 16);
    });

    // 4. Render Detected Obstacles
    obstacles.forEach((obs) => {
      ctx.fillStyle = obs.severity === 'critical' ? '#EF4444' : '#F59E0B';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(obs.label, obs.x + 10, obs.y + 3);
    });

    // 5. Rover Movement Trail (Breadcrumbs)
    if (telemetry.rover.trail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      telemetry.rover.trail.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Live Rover Marker (T-Rover with Heading Cone)
    const { x, y } = telemetry.rover.position;
    const headingRad = (telemetry.rover.headingDeg * Math.PI) / 180;

    // Orientation Heading Vision Cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 42, headingRad - 0.4, headingRad + 0.4);
    ctx.closePath();
    ctx.fill();

    // Rover Chassis Body
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(headingRad);

    // Chassis Box
    ctx.fillStyle = '#111B27';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.fillRect(-12, -8, 24, 16);
    ctx.strokeRect(-12, -8, 24, 16);

    // 6 Wheels (3 per side)
    ctx.fillStyle = '#0EA5E9';
    [-8, 0, 8].forEach((wx) => {
      ctx.fillRect(wx - 2, -11, 4, 3);
      ctx.fillRect(wx - 2, 8, 4, 3);
    });

    // Direction Nose Indicator
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(7, -4);
    ctx.lineTo(7, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Rover Label & Coordinates
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(`T-ROVER [${x}, ${y}]`, x - 30, y - 18);

    ctx.restore();
  }, [telemetry.rover, pan, scale, tunnels, zones, obstacles]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const centerOnRover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setPan({
      x: rect.width / 2 - telemetry.rover.position.x * scale,
      y: rect.height / 2 - telemetry.rover.position.y * scale,
    });
  };

  const resetView = () => {
    setScale(1.1);
    setPan({ x: -20, y: 10 });
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col h-full overflow-hidden relative">
      
      {/* Map Header Toolbar */}
      <div className="h-10 px-3 bg-brand-secondary border-b border-brand-border flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-brand-accent" />
          <span className="font-sans font-semibold text-brand-primaryText text-[11px] sm:text-xs">
            SUB-SURFACE 2D MINE GRID
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-bg border border-brand-border text-brand-secondaryText">
            LEVEL -428m
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            className="p-1 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="p-1 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={centerOnRover}
            className="p-1 rounded text-brand-secondaryText hover:text-brand-accent hover:bg-brand-bg transition-colors"
            title="Center on Rover"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div 
        className="relative flex-1 bg-brand-bg cursor-grab active:cursor-grabbing overflow-hidden min-h-[220px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Map Legend & Positioning Mode Pill */}
        <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2 bg-brand-card/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-brand-border text-[9px] font-mono text-brand-secondaryText pointer-events-none">
          <span className="flex items-center gap-1 text-brand-success">
            <span className="w-2 h-0.5 bg-brand-success inline-block"></span>
            EVAC ROUTE
          </span>
          <span className="text-brand-border">|</span>
          <span className="flex items-center gap-1 text-brand-danger">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-danger inline-block"></span>
            DANGER ZONE
          </span>
          <span className="text-brand-border">|</span>
          <span className="flex items-center gap-1 text-brand-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-warning inline-block"></span>
            RESTRICTED
          </span>
          <span className="text-brand-border">|</span>
          <span className="text-brand-accent font-semibold">
            ROVER: {telemetry.rover.position.x}, {telemetry.rover.position.y} ({telemetry.rover.headingDeg}°)
          </span>
        </div>

        {/* Realism underground non-GPS note */}
        <div className="absolute top-2 left-2 hidden sm:flex items-center gap-1.5 bg-brand-card/90 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-brand-secondaryText border border-brand-border pointer-events-none">
          <Info className="w-3 h-3 text-brand-accent" />
          <span>ESTIMATED DEAD-RECKONING + RF BEACONS (NO UNDERGROUND GPS)</span>
        </div>
      </div>
    </div>
  );
}

