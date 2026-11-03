'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
import DustCleanerCard from '@/components/DustCleanerCard';
import MineMapCanvas from '@/components/dashboard/MineMapCanvas';
import Link from 'next/link';
import Image from 'next/image';
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
  Clock
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { telemetry } = useTelemetry();

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Operational Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-brand-success uppercase">MISSION ACTIVE // COAL SEAM EXP-04</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-primaryText">Mine Rescue Operations Center</h2>
          <p className="text-xs text-brand-secondaryText">Sub-surface depth: -428.5m • Uplink: 54.2 Mbps • Ground mesh: Nominal</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/control"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs shadow-cyan-subtle transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Open Tele-Op Console</span>
          </Link>
          <Link
            href="/dashboard/monitoring"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-secondary hover:bg-brand-border text-brand-primaryText border border-brand-border font-semibold text-xs transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>View All Sensors</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Sub-Surface Gas Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard data={telemetry.ch4} />
        <SensorCard data={telemetry.co} />
        <SensorCard data={telemetry.o2} />
        <SensorCard data={telemetry.temp} />
      </div>

      {/* Main Grid: Mine Map Canvas & Mini Live Camera Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Mine Map */}
        <div className="lg:col-span-8">
          <MineMapCanvas />
        </div>

        {/* Right Column: Live Camera Stream Thumbnail & Rover Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Camera Widget */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-brand-primaryText font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-danger animate-ping"></span>
                <span>TURRET OPTICAL 01</span>
              </span>
              <Link href="/dashboard/vision" className="text-brand-accent hover:underline flex items-center gap-1">
                <span>Expand</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-brand-border bg-black aspect-[16/10]">
              <Image
                src="/assets/t-rover.png"
                alt="Turret Camera Feed"
                fill
                className="object-cover opacity-80 filter contrast-110"
              />
              <div className="absolute inset-0 scanlines pointer-events-none"></div>
              
              {/* Overlay AI Bounding Box */}
              <div className="absolute top-[25%] left-[30%] border border-brand-accent bg-brand-accent/15 px-2 py-1 rounded text-[9px] font-mono text-brand-accent">
                SURVIVOR #01 (98.4%)
              </div>

              <div className="absolute bottom-2 left-2 bg-brand-bg/85 px-2 py-0.5 rounded text-[9px] font-mono text-brand-secondaryText">
                1080p • 30 FPS • FLIR LWIR ON
              </div>
            </div>
          </div>

          {/* Quick Active Alerts Digest */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-brand-border">
              <span className="font-bold text-brand-primaryText">ACTIVE ALERTS (4)</span>
              <Link href="/dashboard/alerts" className="text-brand-accent hover:underline flex items-center gap-1">
                <span>All Alerts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 rounded bg-brand-secondary/80 border border-brand-border flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-accent mt-1 shrink-0"></span>
                <div>
                  <div className="text-brand-primaryText font-semibold text-[11px]">Human Detection: Survivor Acquired</div>
                  <div className="text-[10px] text-brand-secondaryText">Shaft-B // Section 4-C (2 mins ago)</div>
                </div>
              </div>

              <div className="p-2 rounded bg-brand-secondary/80 border border-brand-border flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-warning mt-1 shrink-0"></span>
                <div>
                  <div className="text-brand-primaryText font-semibold text-[11px]">Dust Concentration: 184 µg/m³ PM10</div>
                  <div className="text-[10px] text-brand-secondaryText">DustCleaner Auto-Scrub Initiated</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DustCleaner Live Widget on Overview */}
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

