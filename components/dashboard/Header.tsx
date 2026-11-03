'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import { 
  Radio, 
  Database, 
  Bell, 
  User, 
  AlertOctagon, 
  Wifi, 
  Activity,
  CheckCircle2,
  Info
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
  const { telemetry, triggerEStop, resetEStop } = useTelemetry();

  return (
    <header className="h-16 px-6 bg-brand-secondary/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between sticky top-0 z-40">
      
      {/* Title & Path */}
      <div>
        <h1 className="text-base font-bold text-brand-primaryText flex items-center gap-2">
          <span>{title}</span>
          {telemetry.connections.isDemo && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-warning/15 border border-brand-warning/40 text-brand-warning font-bold">
              DEMO DATA // SIMULATOR ACTIVE
            </span>
          )}
        </h1>
        <p className="text-xs text-brand-secondaryText hidden sm:block">{subtitle}</p>
      </div>

      {/* Connectivity & Actions */}
      <div className="flex items-center gap-3 font-mono text-xs">
        
        {/* Rover Link */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded bg-brand-bg border border-brand-border">
          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
          <span className="text-brand-secondaryText">ROVER:</span>
          <span className="text-brand-success font-semibold">ONLINE ({telemetry.rover.latencyMs}ms)</span>
        </div>

        {/* MQTT Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-brand-bg border border-brand-border">
          <Radio className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-brand-secondaryText">MQTT:</span>
          <span className="text-brand-accent font-semibold">CONNECTED</span>
        </div>

        {/* Supabase Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-brand-bg border border-brand-border">
          <Database className="w-3.5 h-3.5 text-brand-success" />
          <span className="text-brand-secondaryText">SUPABASE:</span>
          <span className="text-brand-success font-semibold">SYNCED</span>
        </div>

        {/* E-Stop Trigger / Indicator */}
        {telemetry.rover.eStopTriggered ? (
          <button
            onClick={resetEStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-danger text-white font-bold text-xs animate-pulse shadow-danger-glow"
            title="Emergency Stop is currently ENGAGED. Click to Reset."
          >
            <AlertOctagon className="w-4 h-4" />
            <span>RESET E-STOP</span>
          </button>
        ) : (
          <button
            onClick={triggerEStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-danger/20 border border-brand-danger text-brand-danger hover:bg-brand-danger hover:text-white font-bold text-xs transition-colors"
            title="Immediate Hardware Emergency Stop"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>E-STOP</span>
          </button>
        )}

        {/* Alerts Notification Icon */}
        <Link 
          href="/dashboard/alerts"
          className="relative p-2 rounded bg-brand-bg border border-brand-border text-brand-secondaryText hover:text-brand-primaryText hover:border-brand-accent transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-danger text-white text-[9px] font-bold flex items-center justify-center">
            4
          </span>
        </Link>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
          <div className="w-8 h-8 rounded-full bg-brand-card border border-brand-border flex items-center justify-center text-brand-accent">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-brand-primaryText leading-none">OPERATOR 04</div>
            <div className="text-[10px] text-brand-secondaryText font-mono mt-0.5">LEVEL 3 CERT</div>
          </div>
        </div>

      </div>

    </header>
  );
}

