'use client';

import { useState } from 'react';
import LiveCameraFeed from '@/components/dashboard/LiveCameraFeed';
import { useTelemetry } from '@/lib/telemetryStore';
import { 
  User, 
  Flame, 
  Wind, 
  ShieldCheck, 
  Activity, 
  Radio,
  Eye,
  CheckCircle2,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';

export default function VisionPage() {
  const [activeFeed, setActiveFeed] = useState<'optical' | 'thermal' | 'split'>('split');
  const { telemetry } = useTelemetry();

  const humanDetection = telemetry.camera.humanDetection;
  const isHumanDetected = Boolean(humanDetection?.detected);
  const humanCount = humanDetection?.count || 0;
  const confidence = humanDetection?.confidence || 0;
  const distanceEst = humanDetection?.distanceEst || 0;

  const temp = telemetry.physicalHardware.temperature;
  const mq4 = telemetry.physicalHardware.mq4_raw;
  const mq135 = telemetry.physicalHardware.mq135_raw;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${telemetry.camera.status === 'CONNECTED' ? 'bg-brand-success' : 'bg-brand-warning'} animate-pulse`}></span>
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">AI Vision & Thermal Perception</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            IP CAM FEED // EDGE MOBILENET V2 COCO-SSD HUMAN DETECTION // {activeFeed.toUpperCase()} MODE
          </p>
        </div>

        {/* Feed Switcher Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveFeed('optical')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeFeed === 'optical'
                ? 'bg-brand-accent/20 border-brand-accent text-brand-accent font-bold shadow-xs'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            HD OPTICAL
          </button>
          <button
            onClick={() => setActiveFeed('thermal')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeFeed === 'thermal'
                ? 'bg-brand-danger/20 border-brand-danger text-brand-danger font-bold shadow-xs'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            FLIR THERMAL
          </button>
          <button
            onClick={() => setActiveFeed('split')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeFeed === 'split'
                ? 'bg-brand-accent text-brand-bg font-bold shadow-cyan-subtle'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            DUAL SPLIT
          </button>
        </div>
      </div>

      {/* Main Grid: Left Video / Right Neural Target Classifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Live IP Camera Feed with Selected Filter */}
        <div className="lg:col-span-8">
          <LiveCameraFeed 
            activeFilter={activeFeed}
            onFilterChange={setActiveFeed}
            title="IP Cam Live Perception Turret"
            showFilterControls={true}
          />
        </div>

        {/* Right Column: AI Threat Detections & Real-Time Classifier */}
        <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h3 className="font-sans text-base font-bold text-brand-primaryText">Neural Target Classifier</h3>
              <p className="text-[11px] text-brand-secondaryText">Edge MobileNet v2 COCO-SSD Telemetry</p>
            </div>
            <span className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
              isHumanDetected ? 'bg-brand-success/15 text-brand-success border border-brand-success/30' : 'bg-brand-secondary text-brand-secondaryText'
            }`}>
              {isHumanDetected ? `${humanCount} DETECTED` : 'SCANNING'}
            </span>
          </div>

          {/* Detections List */}
          <div className="space-y-3 font-mono text-xs">
            {isHumanDetected ? (
              <div className="p-3.5 rounded-lg bg-brand-secondary/80 border border-brand-success/40 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border text-brand-success bg-brand-success/10 border-brand-success/30 flex items-center gap-1">
                    {humanCount > 1 ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>{humanCount > 1 ? `MULTIPLE HUMANS (${humanCount})` : 'HUMAN TARGET'}</span>
                  </span>
                  <span className="text-brand-success font-bold">{confidence}% CONF</span>
                </div>
                <div className="text-brand-primaryText font-medium text-xs">
                  Bio-Thermal Human Form Confirmed
                </div>
                <div className="text-[10px] text-brand-secondaryText flex justify-between pt-1 border-t border-brand-border/60">
                  <span>EST. RANGE: {distanceEst}m</span>
                  <span>{humanDetection?.lastDetectedTime || 'Active Target'}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-brand-secondary/40 border border-brand-border space-y-1.5">
                <div className="flex items-center justify-between text-brand-secondaryText">
                  <span className="text-[11px] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                    <span>Optical FOV Clear</span>
                  </span>
                  <span className="text-[10px]">0 TARGETS</span>
                </div>
                <p className="text-[11px] text-brand-secondaryText leading-relaxed">
                  Real-time neural classifier running on IP Cam video stream. No trapped survivors in immediate field of view.
                </p>
              </div>
            )}

            {/* Environmental Threat Telemetry Target */}
            <div className="p-3.5 rounded-lg bg-brand-secondary/80 border border-brand-border space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  temp && temp > 45 
                    ? 'text-brand-danger bg-brand-danger/10 border-brand-danger/30' 
                    : 'text-brand-accent bg-brand-accent/10 border-brand-accent/30'
                }`}>
                  {temp && temp > 45 ? 'THERMAL HOTSPOT' : 'THERMAL PROFILE'}
                </span>
                <span className="text-brand-primaryText font-bold">
                  {temp ? `${temp.toFixed(1)}°C` : '26.4°C'}
                </span>
              </div>
              <div className="text-brand-primaryText font-medium text-xs">
                {temp && temp > 45 ? 'Sub-surface heat accumulation warning' : 'Normal shaft ambient temperature'}
              </div>
              <div className="text-[10px] text-brand-secondaryText flex justify-between pt-1 border-t border-brand-border/60">
                <span>ESP32-01 CORE SENSOR</span>
                <span>STATUS: NOMINAL</span>
              </div>
            </div>

            {/* Gas / Atmospheric Target */}
            <div className="p-3.5 rounded-lg bg-brand-secondary/80 border border-brand-border space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  mq135 && mq135 > 1500 
                    ? 'text-brand-warning bg-brand-warning/10 border-brand-warning/30' 
                    : 'text-brand-success bg-brand-success/10 border-brand-success/30'
                }`}>
                  {mq135 && mq135 > 1500 ? 'SMOKE / AEROSOL DETECTED' : 'AIR ATMOSPHERE'}
                </span>
                <span className="text-brand-primaryText font-bold">
                  {mq135 ? `RAW ${mq135}` : 'SAFE'}
                </span>
              </div>
              <div className="text-brand-primaryText font-medium text-xs">
                {mq4 && mq4 > 1200 ? 'Elevated Methane (CH4) gas detected' : 'Methane & toxic particulates within safe threshold'}
              </div>
              <div className="text-[10px] text-brand-secondaryText flex justify-between pt-1 border-t border-brand-border/60">
                <span>MULTI-GAS SNIFFER ARRAY</span>
                <span>CH4 RAW: {mq4 || 'LOW'}</span>
              </div>
            </div>
          </div>

          {/* Real-time Fire & Smoke Assessment */}
          <div className="p-3 rounded-lg bg-brand-bg border border-brand-border text-[11px] font-mono text-brand-secondaryText space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className={`w-3.5 h-3.5 ${temp && temp > 45 ? 'text-brand-danger' : 'text-brand-success'}`} />
                <span>FIRE STATUS:</span>
              </span>
              <span className={`font-bold ${temp && temp > 45 ? 'text-brand-danger' : 'text-brand-success'}`}>
                {temp && temp > 45 ? 'HEAT WARNING' : 'CLEARED (NO OPEN FLAME)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wind className={`w-3.5 h-3.5 ${mq135 && mq135 > 1500 ? 'text-brand-warning' : 'text-brand-success'}`} />
                <span>SMOKE PARTICULATE:</span>
              </span>
              <span className={`font-bold ${mq135 && mq135 > 1500 ? 'text-brand-warning' : 'text-brand-success'}`}>
                {mq135 && mq135 > 1500 ? 'ELEVATED PARTICLES' : 'NORMAL (SAFE AIR)'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
