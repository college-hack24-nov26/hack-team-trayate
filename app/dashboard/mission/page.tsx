'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTelemetry } from '@/lib/telemetryStore';
import LiveCameraFeed from '@/components/dashboard/LiveCameraFeed';
import MissionKeyboardControls from '@/components/dashboard/MissionKeyboardControls';
import { 
  Ruler, 
  Radar, 
  Flame, 
  Wind, 
  Thermometer, 
  Droplets, 
  Map, 
  ArrowUpRight, 
  Activity, 
  Cpu,
  RotateCcw
} from 'lucide-react';
import { sendServoAngleCommand } from '@/lib/esp32Service';

export default function MissionControlPage() {
  const { telemetry, setPhysicalServoAngle } = useTelemetry();
  const [activeTab, setActiveTab] = useState<'proximity' | 'atmosphere'>('proximity');
  const [isServoPending, setIsServoPending] = useState(false);

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

  const handleQuickAngle = async (targetAngle: number) => {
    if (isServoPending) return;
    setIsServoPending(true);
    try {
      const res = await sendServoAngleCommand(targetAngle);
      if (res.success) {
        await setPhysicalServoAngle(res.angle);
      }
    } finally {
      setIsServoPending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto select-none">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-warning opacity-75'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                esp32_01_connected ? 'bg-brand-success' : 'bg-brand-warning'
              }`}></span>
            </span>
            <h2 className="font-sans font-bold text-base text-brand-primaryText">
              Mission Control & Teleoperation
            </h2>
          </div>

          <span className="text-brand-border hidden sm:inline">|</span>

          <span className="text-xs text-brand-secondaryText hidden sm:inline font-mono">
            ID: <strong className="text-brand-accent">{telemetry.mission.id}</strong>
          </span>
        </div>

        {/* Link to Dedicated 2D Mine Map */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-brand-secondaryText">
            <Cpu className="w-3.5 h-3.5 text-brand-accent" />
            <span>ESP32-01:</span>
            <span className={esp32_01_connected ? 'text-brand-success font-medium' : 'text-brand-warning font-medium'}>
              {esp32_01_connected ? `Online (${latencyMs}ms)` : 'Offline'}
            </span>
          </div>

          <Link
            href="/dashboard/map"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-elevated border border-brand-border text-brand-secondaryText hover:text-brand-primaryText text-xs font-medium transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-brand-accent" />
            <span>Open 2D Mine Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2-Column Workstation: Left (Camera) + Right (Controls & Sensors) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Live Mobile Camera Feed (7 cols on lg, spacious) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="h-[520px] sm:h-[580px] lg:h-[680px]">
            <LiveCameraFeed />
          </div>
        </div>

        {/* Right Column: Controls & Sensor Telemetry (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* 1. Rover Keyboard & Directional Controls */}
          <MissionKeyboardControls />

          {/* 2. Live Physical Sensor Telemetry Card */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
            
            {/* Header & Sensor Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-accent" />
                <h3 className="font-sans font-semibold text-sm text-brand-primaryText">
                  Live Hardware Telemetry
                </h3>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-brand-bg p-0.5 rounded-lg border border-brand-border text-xs">
                <button
                  onClick={() => setActiveTab('proximity')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'proximity'
                      ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                      : 'text-brand-secondaryText hover:text-brand-primaryText'
                  }`}
                >
                  Proximity & Radar
                </button>
                <button
                  onClick={() => setActiveTab('atmosphere')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'atmosphere'
                      ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                      : 'text-brand-secondaryText hover:text-brand-primaryText'
                  }`}
                >
                  Gas & Environment
                </button>
              </div>
            </div>

            {/* TAB 1: Obstacle Distance & SG90 Servo Scanner */}
            {activeTab === 'proximity' ? (
              <div className="space-y-4">
                
                {/* Distance Readout Card */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-brand-secondaryText font-medium block">
                        Ultrasonic Obstacle Distance
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-2xl sm:text-3xl font-mono font-bold ${
                          distanceStatus === 'DANGER' ? 'text-brand-danger animate-pulse' :
                          distanceStatus === 'WARNING' ? 'text-brand-warning' : 'text-brand-primaryText'
                        }`}>
                          {distance !== null ? distance.toFixed(1) : '--.-'}
                        </span>
                        <span className="text-xs text-brand-secondaryText font-medium">cm</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    distanceStatus === 'DANGER' ? 'bg-brand-danger/15 border-brand-danger/40 text-brand-danger font-semibold' :
                    distanceStatus === 'WARNING' ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning font-semibold' :
                    'bg-brand-success/15 border-brand-success/40 text-brand-success'
                  }`}>
                    {distanceStatus === 'DANGER' ? 'Obstacle Imminent' :
                     distanceStatus === 'WARNING' ? 'Proximity Warning' :
                     distanceStatus === 'NO_ECHO' ? 'Open Corridor' : 'Path Clear'}
                  </span>
                </div>

                {/* Servo Scanner Pan Controls */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-secondaryText font-medium flex items-center gap-1.5">
                      <Radar className="w-4 h-4 text-brand-accent" />
                      <span>Servo Pan Angle</span>
                    </span>
                    <span className="font-mono font-bold text-brand-accent text-sm">
                      {servoAngle}°
                    </span>
                  </div>

                  {/* Preset Angle Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                    {[0, 45, 90, 135, 180].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => handleQuickAngle(deg)}
                        disabled={isServoPending || !esp32_01_connected}
                        className={`py-1.5 rounded-lg border font-semibold transition-all ${
                          servoAngle === deg
                            ? 'bg-brand-accent text-brand-bg border-brand-accent'
                            : 'bg-brand-bg border-brand-border text-brand-primaryText hover:border-brand-accent/50'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-brand-secondaryText pt-1">
                    <span>0° (Left)</span>
                    <button
                      onClick={() => handleQuickAngle(90)}
                      disabled={isServoPending || !esp32_01_connected}
                      className="text-brand-accent hover:underline flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Center to 90°</span>
                    </button>
                    <span>180° (Right)</span>
                  </div>
                </div>

              </div>
            ) : (
              /* TAB 2: Atmospheric & Environmental Sensors */
              <div className="grid grid-cols-2 gap-3">
                
                {/* MQ-4 Gas Sensor */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondaryText font-medium">
                    <Flame className="w-3.5 h-3.5 text-brand-warning" />
                    <span>MQ-4 Gas Sensor</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-brand-warning">
                      {mq4_raw !== null ? mq4_raw : '--'}
                    </span>
                    <span className="text-[11px] text-brand-secondaryText">ADC Raw</span>
                  </div>
                </div>

                {/* MQ-135 Air Quality Sensor */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondaryText font-medium">
                    <Wind className="w-3.5 h-3.5 text-brand-accent" />
                    <span>MQ-135 Air Quality</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-brand-accent">
                      {mq135_raw !== null ? mq135_raw : '--'}
                    </span>
                    <span className="text-[11px] text-brand-secondaryText">ADC Raw</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondaryText font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-brand-danger" />
                    <span>Temperature</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-brand-primaryText">
                      {temperature !== null ? `${temperature.toFixed(1)}°` : '--'}
                    </span>
                    <span className="text-[11px] text-brand-secondaryText">C</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className="p-3.5 rounded-xl bg-brand-secondary border border-brand-border space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondaryText font-medium">
                    <Droplets className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Humidity</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-brand-primaryText">
                      {humidity !== null ? `${humidity.toFixed(1)}%` : '--'}
                    </span>
                    <span className="text-[11px] text-brand-secondaryText">RH</span>
                  </div>
                </div>

              </div>
            )}

            {/* Hardware Status Strip */}
            <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs text-brand-secondaryText">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${esp32_01_connected ? 'bg-brand-success' : 'bg-brand-warning'}`}></span>
                <span>ESP32-01: <code className="font-mono text-brand-primaryText">192.168.137.71</code></span>
              </span>
              <span>ESP32-02: <code className="font-mono text-brand-primaryText">192.168.137.221</code></span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
