'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import LiveCameraFeed from '@/components/dashboard/LiveCameraFeed';
import MissionMineMap from '@/components/dashboard/MissionMineMap';
import MissionKeyboardControls from '@/components/dashboard/MissionKeyboardControls';
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
  Compass
} from 'lucide-react';

export default function MissionControlPage() {
  const { telemetry } = useTelemetry();

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-3 sm:p-4 gap-3 bg-brand-bg overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP MISSION STATUS BAR (Compact One-Screen Strip)                      */}
      {/* ========================================================================= */}
      <section className="bg-brand-secondary border border-brand-border rounded-xl p-2.5 px-4 shrink-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* Mission Identity & Duration */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
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
            {/* Battery Level */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-bg border border-brand-border">
              <BatteryMedium className="w-3.5 h-3.5 text-brand-success" />
              <span className="text-brand-secondaryText">BATT:</span>
              <span className="text-brand-success font-semibold">
                {telemetry.rover.batteryVoltage.toFixed(1)}V ({telemetry.rover.batteryPercent}%)
              </span>
            </div>

            {/* 4 Connected ESP32s */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-bg border border-brand-border">
              <Cpu className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-brand-secondaryText">ESP32:</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success" title="ESP32-01 Drive"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success" title="ESP32-02 Sensors"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success" title="ESP32-03 Vision"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success" title="ESP32-04 DustCleaner"></span>
              </div>
              <span className="text-brand-success font-semibold text-[10px]">4/4 SYNC</span>
            </div>

            {/* DustCleaner Live Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-bg border border-brand-border">
              <Wind className="w-3.5 h-3.5 text-brand-warning" />
              <span className="text-brand-secondaryText">DUST:</span>
              <span className="text-brand-warning font-semibold">
                {telemetry.dustCleaner.status} ({telemetry.dustCleaner.blowerRpm} RPM)
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
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
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

      </section>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ENVIRONMENTAL SENSOR MINI-STRIP                                 */}
      {/* ========================================================================= */}
      <section className="bg-brand-secondary border border-brand-border rounded-xl p-2 px-3 shrink-0 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-brand-secondaryText text-[11px]">
            <Activity className="w-3.5 h-3.5 text-brand-accent" />
            <span className="font-semibold text-brand-primaryText">ATMOSPHERIC TELEMETRY:</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-4 w-full sm:w-auto">
            
            {/* CH4 */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">CH4:</span>
              <span className="font-bold text-brand-success">{telemetry.ch4.value}%</span>
            </div>

            {/* CO */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">CO:</span>
              <span className="font-bold text-brand-success">{telemetry.co.value} ppm</span>
            </div>

            {/* O2 */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">O2:</span>
              <span className="font-bold text-brand-success">{telemetry.o2.value}%</span>
            </div>

            {/* TEMP */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">TEMP:</span>
              <span className="font-bold text-brand-primaryText">{telemetry.temp.value}°C</span>
            </div>

            {/* PM10 */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">PM10:</span>
              <span className="font-bold text-brand-warning">{telemetry.pm10.value} µg</span>
            </div>

            {/* PRESSURE */}
            <div className="hidden sm:flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">BARO:</span>
              <span className="font-bold text-brand-primaryText">{telemetry.pressure.value} hPa</span>
            </div>

            {/* IMU */}
            <div className="hidden lg:flex items-center gap-1.5 bg-brand-bg px-2 py-1 rounded border border-brand-border">
              <Compass className="w-3 h-3 text-brand-accent" />
              <span className="text-brand-secondaryText text-[10px]">IMU:</span>
              <span className="font-bold text-brand-accent">P{telemetry.imu.pitchDeg}° R{telemetry.imu.rollDeg}°</span>
            </div>

          </div>

          <div className="hidden xl:flex items-center gap-2 text-[10px] text-brand-secondaryText pl-3 border-l border-brand-border">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
            <span>ATEX ZONE 1 INTRINSICALLY SAFE</span>
          </div>
        </div>
      </section>

    </div>
  );
}

