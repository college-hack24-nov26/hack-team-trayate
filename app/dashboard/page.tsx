'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
import MineMapCanvas from '@/components/dashboard/MineMapCanvas';
import Link from 'next/link';
import Image from 'next/image';
import { initialAlerts } from '@/lib/alertsData';
import { useState } from 'react';
import { 
  ArrowUpRight, 
  Activity, 
  ShieldAlert, 
  Gamepad2, 
  Camera, 
  AlertTriangle, 
  Cpu, 
  Wind, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  FileText, 
  LifeBuoy,
  Ruler,
  Radar,
  Flame
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { telemetry, toggleSoundMute } = useTelemetry();
  const [alerts, setAlerts] = useState(initialAlerts.slice(0, 5));

  const toggleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

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
    lastUpdated,
    latencyMs 
  } = telemetry.physicalHardware;

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL MISSION HERO STRIP                                      */}
      {/* ========================================================================= */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-warning opacity-75'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                esp32_01_connected ? 'bg-brand-success' : 'bg-brand-warning'
              }`}></span>
            </span>
            <span className="font-mono text-xs font-bold text-brand-success uppercase tracking-wider">
              MISSION ACTIVE // {telemetry.mission.id}
            </span>
            <span className="text-brand-border">|</span>
            <span className="font-mono text-xs text-brand-accent">
              ELAPSED: {formatDuration(telemetry.mission.elapsedSeconds)}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-primaryText tracking-tight">
            Mine Rescue Command & Operations Overview
          </h2>

          <p className="text-xs sm:text-sm text-brand-secondaryText max-w-2xl leading-relaxed">
            Real-time physical ESP32 telemetry, ultrasonic proximity scanning, bidirectional fly-by-wire controls, and explosion risk mitigation across Level -428m coal seam corridors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/mission"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-bold text-xs font-mono shadow-cyan-subtle transition-all active:scale-[0.98]"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>START MISSION (KEYBOARD COCKPIT)</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard/alerts"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-brand-secondary hover:bg-brand-border text-brand-primaryText border border-brand-border font-semibold text-xs font-mono transition-all"
          >
            <FileText className="w-4 h-4 text-brand-accent" />
            <span>DAILY REPORTS</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PHYSICAL HARDWARE LIVE TELEMETRY STRIP                                   */}
      {/* ========================================================================= */}
      <div className="bg-brand-secondary border border-brand-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-danger opacity-75'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              esp32_01_connected ? 'bg-brand-success' : 'bg-brand-danger'
            }`}></span>
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-brand-primaryText">
                ESP32-01 Sensor Module (192.168.137.71)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                esp32_01_connected
                  ? 'bg-brand-success/15 border-brand-success/40 text-brand-success'
                  : 'bg-brand-danger/15 border-brand-danger/40 text-brand-danger'
              }`}>
                {esp32_01_connected ? `LIVE HARDWARE (${latencyMs}ms)` : 'OFFLINE'}
              </span>
            </div>
            <span className="text-[10px] text-brand-secondaryText">
              HC-SR04 Ultrasonic • MQ-4 (RAW) • MQ-135 (RAW) • DHT22 Digital • SG90 Servo Scanner
            </span>
          </div>
        </div>

        {/* Live metric pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Distance */}
          <div className="bg-brand-bg px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-brand-secondaryText text-[10px]">DIST:</span>
            <span className={`font-bold ${
              distanceStatus === 'DANGER' ? 'text-brand-danger animate-pulse' :
              distanceStatus === 'WARNING' ? 'text-brand-warning' : 'text-brand-success'
            }`}>
              {distance !== null ? `${distance.toFixed(1)} cm` : '--'}
            </span>
          </div>

          {/* Servo */}
          <div className="bg-brand-bg px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-brand-secondaryText text-[10px]">SERVO:</span>
            <span className="font-bold text-brand-accent">{servoAngle}°</span>
          </div>

          {/* MQ-4 */}
          <div className="bg-brand-bg px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-brand-warning" />
            <span className="text-brand-secondaryText text-[10px]">MQ4:</span>
            <span className="font-bold text-brand-warning">{mq4_raw !== null ? mq4_raw : '--'} RAW</span>
          </div>

          {/* MQ-135 */}
          <div className="bg-brand-bg px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-brand-secondaryText text-[10px]">MQ135:</span>
            <span className="font-bold text-brand-accent">{mq135_raw !== null ? mq135_raw : '--'} RAW</span>
          </div>

          {/* Temp */}
          <div className="bg-brand-bg px-2.5 py-1 rounded border border-brand-border flex items-center gap-1.5">
            <span className="text-brand-secondaryText text-[10px]">TEMP:</span>
            <span className="font-bold text-brand-primaryText">{temperature !== null ? `${temperature.toFixed(1)}°C` : '--'}</span>
          </div>

          <Link
            href="/dashboard/monitoring"
            className="px-2.5 py-1 rounded bg-brand-card hover:bg-brand-bg text-brand-accent border border-brand-border text-[10px] font-semibold"
          >
            Details →
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HARDWARE SYSTEM STATUS STRIP                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        {/* Rover Online */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">T-ROVER STATUS</span>
            <div className="font-bold text-brand-success text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
              <span>{telemetry.rover.connectivity}</span>
            </div>
            <span className="text-[10px] text-brand-secondaryText">{telemetry.rover.latencyMs}ms Telemetry Latency</span>
          </div>
          <span className="text-xs text-brand-accent font-semibold">{telemetry.rover.batteryPercent}% BATT</span>
        </div>

        {/* ESP32 Boards Cluster */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">ESP32 CLUSTER</span>
            <div className="font-bold text-brand-primaryText text-sm flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-accent" />
              <span>3 DEVKITS</span>
            </div>
            <span className="text-[10px] text-brand-success">Sensor Online • Motor Ready</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-brand-success"></span>
        </div>

        {/* Camera Link */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">MOBILE CAMERA FEED</span>
            <div className="font-bold text-brand-primaryText text-sm flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-brand-accent" />
              <span>{telemetry.camera.status}</span>
            </div>
            <span className="text-[10px] text-brand-secondaryText">{telemetry.camera.format}</span>
          </div>
          <Link href="/dashboard/mission" className="text-brand-accent hover:underline text-[11px]">View</Link>
        </div>

        {/* AI Human Detection Status */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">AI HUMAN DETECTION</span>
            <div className="font-bold text-sm flex items-center gap-1.5 text-brand-primaryText">
              <UserCheck className="w-3.5 h-3.5 text-brand-success" />
              <span>{telemetry.camera.humanDetection?.detected ? 'Human Detected' : 'Sector Clear'}</span>
            </div>
            <span className="text-[10px] text-brand-secondaryText">Edge MobileNet v2 Model</span>
          </div>
          <Link href="/dashboard/vision" className="text-brand-accent hover:underline text-[11px]">View</Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY TRANSDUCER METRICS (4 CARDS)                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard data={telemetry.ch4} />
        <SensorCard data={telemetry.co} />
        <SensorCard data={telemetry.temp} />
        <SensorCard data={telemetry.humidity} />
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN COCKPIT OVERVIEW: MINE MAP & LATEST 5 ALERTS                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 2D Interactive Mine Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <MineMapCanvas />
        </div>

        {/* Right Column: Latest 5 Alerts & Operational Instructions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Latest 5 Alerts Card */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-warning" />
                <span className="font-bold text-brand-primaryText">LATEST SAFETY ALERTS</span>
              </div>
              <Link href="/dashboard/alerts" className="text-brand-accent hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {alerts.map((a) => (
                <div 
                  key={a.id}
                  className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 transition-colors ${
                    !a.acknowledged && a.severity === 'critical'
                      ? 'bg-brand-danger/10 border-brand-danger/40'
                      : 'bg-brand-secondary/70 border-brand-border'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                        a.severity === 'critical' ? 'bg-brand-danger text-white' : 'bg-brand-warning text-brand-bg'
                      }`}>
                        {a.severity}
                      </span>
                      <span className="font-sans font-bold text-brand-primaryText text-xs">{a.category}</span>
                    </div>
                    <div className="text-[10px] text-brand-secondaryText">{a.location} • {a.timestamp}</div>
                  </div>

                  <button
                    onClick={() => toggleAcknowledge(a.id)}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors shrink-0 ${
                      a.acknowledged
                        ? 'bg-brand-success/15 text-brand-success border border-brand-success/40'
                        : 'bg-brand-card text-brand-accent border border-brand-border hover:border-brand-accent'
                    }`}
                  >
                    {a.acknowledged ? 'ACKED' : 'ACK'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Important Mine Safety Instructions & Deadman Protocols */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-brand-border text-brand-accent">
              <LifeBuoy className="w-4 h-4" />
              <span className="font-bold font-sans text-sm text-brand-primaryText">Safety Directives & Protocols</span>
            </div>

            <ul className="space-y-2 text-[11px] text-brand-secondaryText list-disc pl-4 leading-relaxed">
              <li>
                <strong className="text-brand-primaryText">ESP32-01 Hardware Active:</strong> Live ultrasonic obstacle detection at <code className="text-brand-accent">192.168.137.71</code>.
              </li>
              <li>
                <strong className="text-brand-primaryText">Raw ADC Readings:</strong> MQ-4 and MQ-135 values are raw analog counts (0-4095). Never assume PPM without calibration.
              </li>
              <li>
                <strong className="text-brand-primaryText">Movement Deadman:</strong> Releasing keyboard keys (Arrow keys or WASD) or losing browser focus halts motion immediately.
              </li>
              <li>
                <strong className="text-brand-primaryText">Emergency Stop:</strong> SPACEBAR triggers instant safety latch and cuts motor commands.
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
