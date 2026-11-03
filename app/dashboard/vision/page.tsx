'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  Flame, 
  User, 
  Wind, 
  Eye, 
  Video, 
  Circle, 
  Sparkles, 
  AlertTriangle, 
  Maximize2 
} from 'lucide-react';

export default function VisionPage() {
  const [activeFeed, setActiveFeed] = useState<'optical' | 'thermal' | 'split'>('split');
  const [isRecording, setIsRecording] = useState(true);

  const detections = [
    {
      id: 'DET-9921',
      type: 'HUMAN',
      confidence: 98.4,
      timestamp: '14:04:12 (2m ago)',
      location: 'Section 4-C North Timbering',
      status: 'Bio-Thermal Signature Locked',
      color: 'text-brand-accent bg-brand-accent/10 border-brand-accent/30',
    },
    {
      id: 'DET-9920',
      type: 'SMOKE PLUME',
      confidence: 91.2,
      timestamp: '13:58:30 (8m ago)',
      location: 'Conveyor 2 Overpass',
      status: 'Low Density Aerosol',
      color: 'text-brand-warning bg-brand-warning/10 border-brand-warning/30',
    },
    {
      id: 'DET-9919',
      type: 'THERMAL ANOMALY',
      confidence: 87.5,
      timestamp: '13:52:14 (14m ago)',
      location: 'Crosscut Alpha Wall',
      status: 'Spontaneous Heating 38.4°C',
      color: 'text-brand-danger bg-brand-danger/10 border-brand-danger/30',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-danger animate-pulse"></span>
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">AI Vision & Thermal Perception</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            DUAL OPTICAL 1080p + 32x24 LWIR SENSOR // EDGE YOLOV8 RECOGNITION ACTIVE
          </p>
        </div>

        {/* Feed Switcher Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveFeed('optical')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              activeFeed === 'optical'
                ? 'bg-brand-accent/15 border-brand-accent text-brand-accent font-bold'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
          >
            HD OPTICAL
          </button>
          <button
            onClick={() => setActiveFeed('thermal')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              activeFeed === 'thermal'
                ? 'bg-brand-danger/15 border-brand-danger text-brand-danger font-bold'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
          >
            FLIR THERMAL
          </button>
          <button
            onClick={() => setActiveFeed('split')}
            className={`px-3 py-1.5 rounded border transition-colors ${
              activeFeed === 'split'
                ? 'bg-brand-accent border-brand-accent text-brand-bg font-bold shadow-cyan-subtle'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
            }`}
          >
            DUAL SPLIT
          </button>
        </div>
      </div>

      {/* Main Video Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Video Container */}
        <div className="lg:col-span-8 bg-brand-card border border-brand-border rounded-xl p-4 shadow-xl space-y-3">
          
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <span className="text-brand-primaryText font-bold">STREAM_01: SUB-SURFACE TURRET</span>
              <span className="text-brand-border">|</span>
              <span className="text-brand-danger flex items-center gap-1 font-bold">
                <Circle className="w-2.5 h-2.5 fill-current animate-ping" />
                <span>{isRecording ? 'REC 03:44:18' : 'STANDBY'}</span>
              </span>
            </div>
            <div className="text-[10px] text-brand-warning font-mono bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">
              SIMULATED TEST FEED
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-brand-border bg-black aspect-[16/9]">
            <Image
              src="/assets/t-rover.png"
              alt="Optical Video Feed"
              fill
              className={`object-cover filter contrast-110 ${
                activeFeed === 'thermal' ? 'hue-rotate-180 invert brightness-125' : ''
              }`}
            />
            <div className="absolute inset-0 scanlines pointer-events-none"></div>

            {/* AI Bounding Box Overlay for Human Target */}
            <div className="absolute top-[28%] left-[34%] border-2 border-brand-accent bg-brand-accent/10 rounded p-1.5 font-mono text-[10px] text-center shadow-lg">
              <div className="bg-brand-accent text-brand-bg font-bold px-1 py-0.5 rounded-sm flex justify-between gap-3 text-[9px]">
                <span>HUMAN TARGET</span>
                <span>98.4%</span>
              </div>
              <div className="text-brand-accent font-bold py-1">SURVIVOR CONFIRMED</div>
            </div>

            {/* Thermal Hotspot Box Overlay */}
            <div className="absolute top-[48%] right-[22%] border border-brand-danger bg-brand-danger/10 rounded p-1.5 font-mono text-[10px] text-center">
              <div className="bg-brand-danger text-white font-bold px-1 py-0.5 rounded-sm text-[9px]">
                SMOLDERING COAL (38°C)
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-brand-secondaryText pointer-events-none">
              <div className="bg-brand-bg/85 px-2.5 py-1 rounded border border-brand-border">
                FOV: 120° • EXPOSURE: AUTO • SHUTTER: 1/120s
              </div>
              <div className="bg-brand-bg/85 px-2.5 py-1 rounded border border-brand-border text-brand-primaryText">
                TARGET RANGE: 14.8 METERS
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Threat Detections & Confidence Log */}
        <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-sans text-base font-bold text-brand-primaryText">Neural Target Classifier</h3>
            <span className="font-mono text-xs text-brand-accent">3 DETECTIONS</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {detections.map((det) => (
              <div key={det.id} className="p-3.5 rounded-lg bg-brand-secondary/80 border border-brand-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${det.color}`}>
                    {det.type}
                  </span>
                  <span className="text-brand-primaryText font-bold">{det.confidence}%</span>
                </div>
                <div className="text-brand-primaryText font-medium text-xs">{det.status}</div>
                <div className="text-[10px] text-brand-secondaryText flex justify-between pt-1 border-t border-brand-border/60">
                  <span>{det.location}</span>
                  <span>{det.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-brand-bg border border-brand-border text-[11px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>FIRE STATUS:</span>
              <span className="text-brand-success font-bold">CLEARED (NO OPEN FLAME)</span>
            </div>
            <div className="flex justify-between">
              <span>SMOKE DETECTION:</span>
              <span className="text-brand-warning font-bold">LOW LEVEL CONCENTRATION</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

