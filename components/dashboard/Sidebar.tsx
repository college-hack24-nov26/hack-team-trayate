'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTelemetry } from '@/lib/telemetryStore';
import { 
  LayoutDashboard, 
  Activity, 
  Map, 
  Gamepad2, 
  Camera, 
  AlertTriangle, 
  BarChart3, 
  Cpu, 
  Settings, 
  Shield, 
  ArrowLeft,
  BatteryMedium,
  Database,
  Radio,
  Sliders,
  Sparkles,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { telemetry } = useTelemetry();

  const {
    esp32_01_connected,
    latencyMs
  } = telemetry.physicalHardware;

  const {
    connectivity: roverConnectivity,
    batteryVoltage,
    batteryPercent,
    eStopTriggered,
    mode: roverMode
  } = telemetry.rover;

  const isCloudSynced = telemetry.connections.supabase;

  const navSections = [
    {
      title: 'Command & Control',
      links: [
        { 
          href: '/dashboard', 
          label: 'Operations Overview', 
          icon: LayoutDashboard,
          badge: null
        },
        { 
          href: '/dashboard/monitoring', 
          label: 'Live Telemetry & Gauges', 
          icon: Activity,
          badge: esp32_01_connected ? 'Live' : null,
          badgeVariant: 'success' as const
        },
        { 
          href: '/dashboard/map', 
          label: 'Mine Map 2D', 
          icon: Map,
          badge: 'Level -420m',
          badgeVariant: 'neutral' as const
        },
        { 
          href: '/dashboard/vision', 
          label: 'Camera & Vision', 
          icon: Camera,
          badge: 'AI Active',
          badgeVariant: 'accent' as const
        },
        { 
          href: '/dashboard/control', 
          label: 'Diagnostics & Actuation', 
          icon: Sliders,
          badge: null
        },
      ],
    },
    {
      title: 'Intelligence & Reports',
      links: [
        { 
          href: '/dashboard/alerts', 
          label: 'Alerts & Incidents', 
          icon: AlertTriangle, 
          badge: '4',
          badgeVariant: 'warning' as const
        },
        { 
          href: '/dashboard/analytics', 
          label: 'Historical Analytics', 
          icon: BarChart3,
          badge: null
        },
      ],
    },
    {
      title: 'Hardware & System',
      links: [
        { 
          href: '/dashboard/devices', 
          label: 'ESP32 Hardware Nodes', 
          icon: Cpu, 
          badge: esp32_01_connected ? 'ESP32 Online' : 'Standby',
          badgeVariant: esp32_01_connected ? 'success' as const : 'neutral' as const
        },
        { 
          href: '/dashboard/settings', 
          label: 'System & Cloud Settings', 
          icon: Settings,
          badge: null
        },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-brand-secondary/95 border-r border-brand-border flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none backdrop-blur-md">
      
      {/* Top Branding & Main Navigation */}
      <div className="flex flex-col min-h-0 flex-1">
        
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-brand-border flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:border-brand-accent/80 group-hover:bg-brand-accent/10 transition-all duration-200 shadow-xs">
              <Shield className="w-5 h-5 text-brand-accent group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base text-brand-primaryText leading-tight tracking-tight flex items-center gap-1.5">
                <span>TRAYATE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
              </span>
              <span className="text-[10px] text-brand-secondaryText font-medium tracking-wide">
                Mine Safety & Rescue
              </span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="text-brand-secondaryText hover:text-brand-primaryText p-2 rounded-lg hover:bg-brand-elevated transition-colors"
            title="Exit to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Emergency Stop Alert Banner if Engaged */}
        {eStopTriggered && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-brand-danger/15 border border-brand-danger/40 flex items-center justify-between text-brand-danger animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>E-STOP ENGAGED</span>
            </div>
            <span className="text-[10px] bg-brand-danger text-white px-2 py-0.5 rounded-full font-bold">
              STOP
            </span>
          </div>
        )}

        {/* Hero Mission Control Action Card */}
        <div className="p-4 pb-2 shrink-0">
          <Link
            href="/dashboard/mission"
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 shadow-sm group ${
              pathname === '/dashboard/mission'
                ? 'bg-brand-accent/15 border-brand-accent/60 text-brand-primaryText shadow-lg shadow-brand-accent/10 ring-1 ring-brand-accent/30'
                : 'bg-brand-card hover:bg-brand-elevated border-brand-border hover:border-brand-accent/50 text-brand-primaryText'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                pathname === '/dashboard/mission'
                  ? 'bg-brand-accent text-brand-bg shadow-xs'
                  : 'bg-brand-secondary text-brand-accent group-hover:bg-brand-accent/20'
              }`}>
                <Gamepad2 className="w-4 h-4" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>Start Mission</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping"></span>
                </span>
                <span className="text-[11px] text-brand-secondaryText font-medium mt-0.5">
                  Cockpit & Teleoperation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-brand-bg/80 border border-brand-border/80 text-brand-secondaryText group-hover:text-brand-accent transition-colors">
                WASD
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 ${
                pathname === '/dashboard/mission' ? 'text-brand-accent' : 'text-brand-secondaryText'
              }`} />
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="px-4 py-2 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              
              {/* Section Header */}
              <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondaryText/60 px-3 py-1">
                {section.title}
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-accent/15 text-brand-accent font-semibold border border-brand-accent/30 shadow-xs'
                          : 'text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-elevated/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                          isActive 
                            ? 'text-brand-accent' 
                            : 'text-brand-secondaryText/80 group-hover:text-brand-accent'
                        }`} />
                        <span className="truncate">{link.label}</span>
                      </div>

                      {link.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 transition-colors ${
                          link.badgeVariant === 'success'
                            ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                            : link.badgeVariant === 'warning'
                            ? 'bg-brand-warning/15 border-brand-warning/30 text-brand-warning font-bold'
                            : link.badgeVariant === 'accent'
                            ? 'bg-brand-accent/15 border-brand-accent/30 text-brand-accent'
                            : 'bg-brand-bg/80 border-brand-border text-brand-secondaryText'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Reactive Hardware Status Footer Dock */}
      <div className="p-4 border-t border-brand-border bg-brand-bg/60 shrink-0 space-y-3">
        
        {/* Hardware Status Strip */}
        <div className="bg-brand-card/90 border border-brand-border/80 rounded-xl p-3 space-y-2.5 shadow-sm">
          
          {/* Row 1: ESP32 Hardware Status */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2 w-2`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-warning opacity-75'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  esp32_01_connected ? 'bg-brand-success' : 'bg-brand-warning'
                }`}></span>
              </span>
              <span className="font-medium text-brand-primaryText">
                ESP32 Hardware
              </span>
            </div>
            
            <span className={`text-[11px] font-mono font-medium ${
              esp32_01_connected ? 'text-brand-success' : 'text-brand-warning'
            }`}>
              {esp32_01_connected ? `${latencyMs}ms ping` : 'Offline'}
            </span>
          </div>

          {/* Row 2: Battery Gauge */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-brand-secondaryText">
              <span className="flex items-center gap-1.5">
                <BatteryMedium className="w-3.5 h-3.5 text-brand-success" />
                <span>Battery Level</span>
              </span>
              <span className="font-mono font-medium text-brand-primaryText">
                {batteryVoltage.toFixed(1)}V ({batteryPercent}%)
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border/50">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  batteryPercent > 40 ? 'bg-brand-success' : batteryPercent > 20 ? 'bg-brand-warning' : 'bg-brand-danger'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, batteryPercent))}%` }}
              ></div>
            </div>
          </div>

          {/* Row 3: Cloud Database Sync Status */}
          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-brand-secondaryText">
              <Database className={`w-3 h-3 ${isCloudSynced ? 'text-brand-success' : 'text-brand-secondaryText'}`} />
              <span>Cloud Database</span>
            </div>
            
            <span className={`font-medium ${isCloudSynced ? 'text-brand-success' : 'text-brand-secondaryText'}`}>
              {isCloudSynced ? 'Supabase Sync' : 'Local Standalone'}
            </span>
          </div>

        </div>

        {/* Minimal Firmware Info */}
        <div className="flex items-center justify-between px-1 text-[10px] text-brand-secondaryText/60 font-mono">
          <span>T-ROVER V2.4-IOT</span>
          <span>MODE: {roverMode}</span>
        </div>

      </div>

    </aside>
  );
}
