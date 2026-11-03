'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
import DustCleanerCard from '@/components/DustCleanerCard';
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
  AlertOctagon,
  Volume2,
  VolumeX,
  FileText,
  LifeBuoy
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

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. TOP OPERATIONAL MISSION HERO STRIP                                      */}
      {/* ========================================================================= */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
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
            Real-time multi-sensor telemetry, bidirectional fly-by-wire teleoperation, and automated explosion risk mitigation across Level -428m coal seam corridors.
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
      {/* 2. SYSTEM HEALTH & ESP32 HARDWARE STRIP                                    */}
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

        {/* ESP32 Module Health */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">CONNECTED ESP32s</span>
            <div className="font-bold text-brand-primaryText text-sm flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-accent" />
              <span>4 OF 4 ONLINE</span>
            </div>
            <span className="text-[10px] text-brand-success">Locomotion, Env, Cam, Dust</span>
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

        {/* DustCleaner State */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-brand-secondaryText text-[10px]">DUSTCLEANER CORE</span>
            <div className="font-bold text-brand-warning text-sm flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-brand-warning" />
              <span>{telemetry.dustCleaner.status}</span>
            </div>
            <span className="text-[10px] text-brand-secondaryText">{telemetry.dustCleaner.blowerRpm} RPM // AUTO</span>
          </div>
          <span className="text-xs text-brand-warning font-semibold">{telemetry.dustCleaner.filterLifePercent}% HEPA</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIMARY GAS SENSORS (4 CARDS)                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard data={telemetry.ch4} />
        <SensorCard data={telemetry.co} />
        <SensorCard data={telemetry.o2} />
        <SensorCard data={telemetry.temp} />
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN COCKPIT OVERVIEW: MINE MAP & CAMERA & LATEST 5 ALERTS             */}
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
                <strong className="text-brand-primaryText">ATEX Zone 1 Compliance:</strong> Never bypass methane limits. Automatic rover halt triggers when CH4 &gt; 1.00% VOL.
              </li>
              <li>
                <strong className="text-brand-primaryText">Deadman Watchdog:</strong> Movement keys must remain depressed. Releasing W-A-S-D stops motors instantly (&lt;50ms).
              </li>
              <li>
                <strong className="text-brand-primaryText">Independent Cutoff:</strong> The ESP32 locomotion board maintains a local 600ms heartbeat timer that disconnects the H-bridge if packet loss occurs.
              </li>
              <li>
                <strong className="text-brand-primaryText">Dust Mitigation:</strong> Keep DustCleaner in AUTO mode during corridor penetration to prevent coal aerosol ignition.
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. DUSTCLEANER DETAILED WIDGET                                             */}
      {/* ========================================================================= */}
      <div>
        <DustCleanerCard 
          status={telemetry.dustCleaner.status}
          mode={telemetry.dustCleaner.mode}
          pm25={telemetry.pm25.value}
          pm10={telemetry.pm10.value}
        />
      </div>

    </div>
  );
}
