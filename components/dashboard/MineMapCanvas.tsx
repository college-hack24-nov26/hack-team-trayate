'use client';

import { useEffect, useRef, useState } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  User, 
  Flame, 
  Compass,
  MapPin
} from 'lucide-react';

export default function MineMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { telemetry } = useTelemetry();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer Toggles
  const [showHazards, setShowHazards] = useState(true);
  const [showHumans, setShowHumans] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas sizing
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply pan and zoom
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // 1. Draw Sub-surface Background Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(36, 50, 68, 0.35)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = -200; x <= width + 200; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -200);
        ctx.lineTo(x, height + 200);
        ctx.stroke();
      }
      for (let y = -200; y <= height + 200; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-200, y);
        ctx.lineTo(width + 200, y);
        ctx.stroke();
      }
    }

    // 2. Draw Mine Corridors & Drift Shafts
    ctx.fillStyle = '#0D1520';
    ctx.strokeStyle = '#243244';
    ctx.lineWidth = 3;

    // Main shaft trunk
    ctx.fillRect(80, 120, 640, 70);
    ctx.strokeRect(80, 120, 640, 70);

    // Crosscut Alpha
    ctx.fillRect(200, 40, 70, 280);
    ctx.strokeRect(200, 40, 70, 280);

    // Crosscut Beta
    ctx.fillRect(480, 80, 70, 260);
    ctx.strokeRect(480, 80, 70, 260);

    // Drift 12 West
    ctx.fillRect(160, 280, 460, 65);
    ctx.strokeRect(160, 280, 460, 65);

    // 3. Draw Obstacles / Collapsed Timbering
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    
    // Rubble heap 1
    ctx.fillRect(380, 135, 45, 40);
    ctx.strokeRect(380, 135, 45, 40);
    
    // Rubble heap 2
    ctx.fillRect(210, 240, 50, 30);
    ctx.strokeRect(210, 240, 50, 30);

    // 4. Draw Gas Hazard Zones (Methane & Thermal Heatmap)
    if (showHazards) {
      // Methane pocket
      const radialGrad = ctx.createRadialGradient(510, 155, 10, 510, 155, 65);
      radialGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      radialGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(510, 155, 65, 0, Math.PI * 2);
      ctx.fill();

      // Fire Hotspot
      const fireGrad = ctx.createRadialGradient(235, 90, 5, 235, 90, 45);
      fireGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
      fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(235, 90, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Movement Trail
    if (showTrail && telemetry.rover.trail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(telemetry.rover.trail[0].x, telemetry.rover.trail[0].y);
      for (let i = 1; i < telemetry.rover.trail.length; i++) {
        ctx.lineTo(telemetry.rover.trail[i].x, telemetry.rover.trail[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Draw Human Detection Location
    if (showHumans) {
      const hX = 580;
      const hY = 310;
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(hX, hY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Outer sonar pulse
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hX, hY, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('SURVIVOR #01 [98.4%]', hX - 35, hY - 14);
    }

    // 7. Draw Rover Position & Heading
    const rX = telemetry.rover.position.x;
    const rY = telemetry.rover.position.y;

    // Outer glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.arc(rX, rY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Rover icon chassis
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(rX, rY, 9, 0, Math.PI * 2);
    ctx.fill();

    // Heading Pointer
    const headingRad = (telemetry.rover.headingDeg * Math.PI) / 180;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rX, rY);
    ctx.lineTo(rX + Math.cos(headingRad) * 16, rY + Math.sin(headingRad) * 16);
    ctx.stroke();

    // Rover label
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('T-ROVER 01', rX - 30, rY + 24);

    ctx.restore();
  }, [zoom, pan, showHazards, showHumans, showTrail, showGrid, telemetry]);

  // Mouse drag handlers for Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-4 sm:p-6 shadow-xl space-y-4">
      
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-accent" />
            <h3 className="font-sans text-base font-bold text-brand-primaryText">Sub-Surface LiDAR SLAM Mine Map</h3>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText">SHAFT-B // LOCALIZED ODOMETRY -428.5m</p>
        </div>

        {/* Layer Controls & Zoom Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          
          <button
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              showHazards
                ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
            title="Toggle Gas & Thermal Hazards"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>HAZARDS</span>
          </button>

          <button
            onClick={() => setShowHumans(!showHumans)}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              showHumans
                ? 'bg-brand-accent/15 border-brand-accent/40 text-brand-accent'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
            title="Toggle Survivor Pins"
          >
            <User className="w-3.5 h-3.5" />
            <span>SURVIVORS</span>
          </button>

          <button
            onClick={() => setShowTrail(!showTrail)}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              showTrail
                ? 'bg-brand-accent/15 border-brand-accent/40 text-brand-accent'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
            title="Toggle Movement Trail"
          >
            <span>TRAIL</span>
          </button>

          <div className="flex items-center gap-1 pl-2 border-l border-brand-border">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
              className="p-1.5 rounded bg-brand-secondary hover:bg-brand-bg border border-brand-border text-brand-primaryText"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              className="p-1.5 rounded bg-brand-secondary hover:bg-brand-bg border border-brand-border text-brand-primaryText"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded bg-brand-secondary hover:bg-brand-bg border border-brand-border text-brand-primaryText"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Interactive HTML5 Canvas Container */}
      <div className="relative rounded-lg overflow-hidden border border-brand-border bg-[#05080E] aspect-[16/9] w-full cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-brand-bg/90 backdrop-blur-md border border-brand-border px-3 py-2 rounded text-[10px] font-mono space-y-1 pointer-events-none">
          <div className="text-brand-secondaryText font-bold uppercase tracking-wider mb-0.5">MAP LEGEND</div>
          <div className="flex items-center gap-2 text-brand-primaryText">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent"></span>
            <span>T-Rover Position</span>
          </div>
          <div className="flex items-center gap-2 text-brand-primaryText">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-warning"></span>
            <span>Methane Caution Zone</span>
          </div>
          <div className="flex items-center gap-2 text-brand-primaryText">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-danger"></span>
            <span>Thermal / Collapsed Obstacle</span>
          </div>
        </div>

        {/* Coordinate Readout */}
        <div className="absolute top-3 right-3 bg-brand-bg/90 backdrop-blur-md border border-brand-border px-3 py-1.5 rounded text-[11px] font-mono text-brand-secondaryText pointer-events-none">
          LOCAL ODOR: <strong className="text-brand-primaryText">X: 340m, Y: 220m, Z: -428m</strong>
        </div>
      </div>

    </div>
  );
}

