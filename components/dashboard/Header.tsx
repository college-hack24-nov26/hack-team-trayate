'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import { 
  Radio, 
  Database, 
  Bell, 
  Volume2, 
  VolumeX, 
  AlertOctagon, 
  Wifi, 
  Clock, 
  Cpu, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({ 
  title = 'Command Centre Overview', 
  subtitle = 'Mission telemetry, live sensor feeds and rover teleoperation' 
}: HeaderProps) {
  const { 
    telemetry, 
    triggerEStop, 
    resetEStop, 
    setHardwareMode, 
    toggleSoundMute 
  } = useTelemetry();

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 px-6 bg-brand-secondary/95 backdrop-blur-md border-b border-brand-border flex items-center justify-between sticky top-0 z-40">
      
      {/* Title & Mission Status Badge */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold text-brand-primaryText">
              {title}
            </h1>

            {/* Hardware vs Simulator Mode Toggle */}
            <button
              onClick={() => setHardwareMode(telemetry.hardwareMode === 'SIMULATOR' ? 'LIVE_HARDWARE' : 'SIMULATOR')}
              title="Click to toggle between Demo Simulator and Live ESP32 Hardware packets"
              className={`text-xs font-sans px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                telemetry.hardwareMode === 'SIMULATOR'
                  ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning font-medium hover:bg-brand-warning/25'
                  : 'bg-brand-success/15 border-brand-success/40 text-brand-success font-medium hover:bg-brand-success/25'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${telemetry.hardwareMode === 'SIMULATOR' ? 'bg-brand-warning' : 'bg-brand-success animate-pulse'}`}></span>
              <span>{telemetry.hardwareMode === 'SIMULATOR' ? 'Simulator Mode' : 'Live Hardware'}</span>
            </button>
          </div>
          <p className="text-xs text-brand-secondaryText hidden sm:block">{subtitle}</p>
        </div>

        {/* Mission ID & Timer Strip */}
        <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-brand-border text-xs">
          <div className="flex items-center gap-1.5 text-brand-secondaryText">
            <span className="text-brand-accent font-mono font-medium">{telemetry.mission.id}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-bg border border-brand-border text-brand-primaryText">
            <Clock className="w-3.5 h-3.5 text-brand-accent" />
            <span className="font-mono">{formatDuration(telemetry.mission.elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Right Controls & Interlocks */}
      <div className="flex items-center gap-3 text-xs">
        
        {/* Rover Latency */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border">
          <span className={`w-2 h-2 rounded-full ${
            telemetry.rover.connectivity === 'ONLINE' ? 'bg-brand-success animate-pulse' : 'bg-brand-danger'
          }`}></span>
          <span className="text-brand-secondaryText">Rover:</span>
          <span className={`${
            telemetry.rover.connectivity === 'ONLINE' ? 'text-brand-success' : 'text-brand-danger'
          } font-medium`}>
            {telemetry.rover.connectivity === 'ONLINE' ? 'Online' : 'Offline'} (<span className="font-mono">{telemetry.rover.latencyMs}ms</span>)
          </span>
        </div>

        {/* MQTT Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border">
          <Radio className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-brand-secondaryText">MQTT:</span>
          <span className="text-brand-accent font-medium">Active</span>
        </div>

        {/* Supabase Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border">
          <Database className={`w-3.5 h-3.5 ${telemetry.connections.supabase ? 'text-brand-success' : 'text-brand-secondaryText'}`} />
          <span className="text-brand-secondaryText">Cloud:</span>
          <span className={`${telemetry.connections.supabase ? 'text-brand-success font-medium' : 'text-brand-secondaryText'}`}>
            {telemetry.connections.supabase ? 'Supabase Sync' : 'Local Only'}
          </span>
        </div>

        {/* Sound Alarm Mute / Unmute Toggle */}
        <button
          onClick={toggleSoundMute}
          className={`p-2 rounded-lg border transition-colors ${
            telemetry.soundMuted 
              ? 'bg-brand-bg border-brand-border text-brand-secondaryText hover:text-brand-primaryText' 
              : 'bg-brand-card border-brand-border text-brand-accent hover:border-brand-accent'
          }`}
          title={telemetry.soundMuted ? 'Sound Alarms Muted (Click to Unmute)' : 'Sound Alarms Active (Click to Mute)'}
        >
          {telemetry.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Alert Bell */}
        <Link 
          href="/dashboard/alerts"
          className="relative p-2 rounded-lg bg-brand-bg border border-brand-border text-brand-secondaryText hover:text-brand-primaryText transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-danger text-[9px] font-bold text-white flex items-center justify-center">
            4
          </span>
        </Link>

        {/* Emergency Stop Switch */}
        {telemetry.rover.eStopTriggered ? (
          <button
            onClick={resetEStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-danger text-white border border-brand-danger font-semibold text-xs hover:bg-red-600 transition-all shadow-md animate-pulse"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Reset E-Stop</span>
          </button>
        ) : (
          <button
            onClick={triggerEStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-card hover:bg-brand-danger/20 text-brand-danger border border-brand-danger/40 hover:border-brand-danger font-semibold text-xs transition-all"
            title="Emergency Motor Kill (Spacebar or Click)"
          >
            <AlertOctagon className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency Stop</span>
          </button>
        )}

      </div>
    </header>
  );
}
