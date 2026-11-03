'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import LiveCameraFeed from '@/components/dashboard/LiveCameraFeed';
import MissionMineMap from '@/components/dashboard/MissionMineMap';
import MissionKeyboardControls from '@/components/dashboard/MissionKeyboardControls';
import ServoScannerControl from '@/components/dashboard/ServoScannerControl';
import DistanceMonitorCard from '@/components/dashboard/DistanceMonitorCard';
import { 
  Radio, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  BatteryMedium, 
  Flame, 
  Wind, 
  Clock,
  Sparkles,
  Compass,
  Ruler,
  Radar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';

export default function MissionControlPage() {
  const { telemetry } = useTelemetry();
  const [showScannerModal, setShowScannerModal] = useState(false);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { 
    esp32_01_connected, 
    distance, 
    distanceStatus, 
    mq4_raw, 
    mq135_raw, 
    temperature, 
    humidity, 
    servoAngle,
    latencyMs 
  } = telemetry.physicalHardware;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-3 sm:p-4 gap-3 bg-brand-bg overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP MISSION STATUS BAR (Compact One-Screen Strip)                      */}
      {/* ========================================================================= */}
      <section className="bg-brand-secondary border border-brand-border rounded-xl p-2.5 px-4 shrink-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* Mission Identity & Hardware Sync */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-warning opacity-75'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  esp32_01_connected ? 'bg-brand-success' : 'bg-brand-warning'
                }`}></span>
              </span>
              <span className="font-sans font-bold text-brand-primaryText text-sm tracking-tight">
                MISSION ACTIVE
              </span>
            </div>

            <span className="text-brand-border">|</span>

            <div className="flex items-center gap-1.5 text-brand-accent font-semibold">
              <span>{telemetry.mission.id}</span>
            </div>

            <span className="text-brand-border">|</span>

            <div className="flex items-center gap-1 text-brand-secondaryText">
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-brand-primaryText font-bold">
                {formatDuration(telemetry.mission.elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Module Telemetry Badges */}
          <div className="flex items-center gap-3">
            
            {/* Physical ESP32-01 Hardware Ping */}
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] ${
              esp32_01_connected 
                ? 'bg-brand-success/15 border-brand-success/40 text-brand-success font-semibold' 
                : 'bg-brand-danger/15 border-brand-danger/40 text-brand-danger font-semibold'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${esp32_01_connected ? 'bg-brand-success animate-pulse' : 'bg-brand-danger'}`}></span>
              <span>ESP32-01: {esp32_01_connected ? `ONLINE (${latencyMs}ms)` : 'OFFLINE'}</span>
            </div>

            {/* Quick Servo Toggle Trigger */}
            <button
              onClick={() => setShowScannerModal(!showScannerModal)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-brand-card hover:bg-brand-bg text-brand-accent border border-brand-border text-[10px] font-semibold transition-colors"
            >
              <Radar className="w-3 h-3 text-brand-accent" />
              <span>SERVO: {servoAngle}°</span>
              {showScannerModal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Battery Level */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]">
              <BatteryMedium className="w-3.5 h-3.5 text-brand-success" />
              <span className="text-brand-secondaryText">BATT:</span>
              <span className="text-brand-success font-semibold">
                {telemetry.rover.batteryVoltage.toFixed(1)}V ({telemetry.rover.batteryPercent}%)
              </span>
            </div>

            {/* Mode Indicator */}
            <div className="px-2 py-0.5 rounded bg-brand-card border border-brand-border font-bold text-brand-primaryText text-[10px]">
              {telemetry.rover.mode}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRIMARY 3-COLUMN COCKPIT (Fits Screen Viewport)                       */}
      {/* ========================================================================= */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 relative">
        
        {/* Left Column: Live Mobile Camera Feed (IP Webcam) (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-[260px] flex flex-col">
          <LiveCameraFeed />
        </div>

        {/* Center Column: 2D Mine Map (5 cols) */}
        <div className="lg:col-span-5 h-full min-h-[260px] flex flex-col">
          <MissionMineMap />
        </div>

        {/* Right Column: Keyboard Movement & Speed Governor (3 cols) */}
        <div className="lg:col-span-3 h-full min-h-[260px] flex flex-col">
          <MissionKeyboardControls />
        </div>

        {/* Floating Servo Scanner Overlay if toggled */}
        {showScannerModal && (
          <div className="absolute top-2 left-2 z-40 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="relative">
              <button
                onClick={() => setShowScannerModal(false)}
                className="absolute top-2 right-2 text-brand-secondaryText hover:text-brand-primaryText z-50 p-1"
                aria-label="Close servo scanner"
              >
                ✕
              </button>
              <ServoScannerControl />
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 3. BOTTOM LIVE PHYSICAL SENSOR STRIP                                      */}
      {/* ========================================================================= */}
      <section className="bg-brand-secondary border border-brand-border rounded-xl p-2 px-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-brand-secondaryText text-[11px]">
            <Activity className="w-3.5 h-3.5 text-brand-accent" />
            <span className="font-semibold text-brand-primaryText">ESP32-01 LIVE TELEMETRY:</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3 w-full sm:w-auto">
            
            {/* DISTANCE */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
              distanceStatus === 'DANGER' ? 'bg-brand-danger/20 border-brand-danger text-brand-danger animate-pulse font-bold' :
              distanceStatus === 'WARNING' ? 'bg-brand-warning/15 border-brand-warning text-brand-warning font-bold' :
              'bg-brand-bg border-brand-border'
            }`}>
              <Ruler className="w-3 h-3 text-brand-accent" />
              <span className="text-[10px] text-brand-secondaryText">DIST:</span>
              <span className="font-bold text-brand-primaryText">
                {distance !== null ? `${distance.toFixed(1)} cm` : '--'}
              </span>
            </div>

            {/* SERVO ANGLE */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <Radar className="w-3 h-3 text-brand-accent" />
              <span className="text-brand-secondaryText text-[10px]">SERVO:</span>
              <span className="font-bold text-brand-accent">{servoAngle}°</span>
            </div>

            {/* MQ-4 (RAW ADC) */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <Flame className="w-3 h-3 text-brand-warning" />
              <span className="text-brand-secondaryText text-[10px]">MQ4:</span>
              <span className="font-bold text-brand-warning">
                {mq4_raw !== null ? mq4_raw : '--'} <span className="text-[9px] text-brand-secondaryText">RAW</span>
              </span>
            </div>

            {/* MQ-135 (RAW ADC) */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <Wind className="w-3 h-3 text-brand-accent" />
              <span className="text-brand-secondaryText text-[10px]">MQ135:</span>
              <span className="font-bold text-brand-accent">
                {mq135_raw !== null ? mq135_raw : '--'} <span className="text-[9px] text-brand-secondaryText">RAW</span>
              </span>
            </div>

            {/* TEMP */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">TEMP:</span>
              <span className="font-bold text-brand-primaryText">
                {temperature !== null ? `${temperature.toFixed(1)}°C` : '--'}
              </span>
            </div>

            {/* HUMIDITY */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">HUM:</span>
              <span className="font-bold text-brand-primaryText">
                {humidity !== null ? `${humidity.toFixed(1)}%` : '--'}
              </span>
            </div>

            {/* PROXIMITY STATUS */}
            <div className="hidden lg:flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">ECHO:</span>
              <span className={`font-bold text-[10px] ${
                distanceStatus === 'DANGER' ? 'text-brand-danger' :
                distanceStatus === 'WARNING' ? 'text-brand-warning' : 'text-brand-success'
              }`}>
                {distanceStatus}
              </span>
            </div>

          </div>

          <div className="hidden xl:flex items-center gap-2 text-[10px] text-brand-secondaryText pl-3 border-l border-brand-border">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
            <span>HOTSPOT 192.168.137.71</span>
          </div>
        </div>
      </section>

    </div>
  );
}
