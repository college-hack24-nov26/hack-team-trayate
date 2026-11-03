'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Flame,
  Radio
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'COMMAND & CONTROL',
      links: [
        { 
          href: '/dashboard/mission', 
          label: 'Start Mission', 
          icon: Gamepad2, 
          isPrimary: true,
          badge: 'LIVE' 
        },
        { href: '/dashboard', label: 'Operations Overview', icon: LayoutDashboard },
        { href: '/dashboard/monitoring', label: 'Live Monitoring', icon: Activity },
        { href: '/dashboard/map', label: 'Mine Map 2D', icon: Map },
        { href: '/dashboard/vision', label: 'Camera & Vision', icon: Camera },
      ],
    },
    {
      title: 'INTELLIGENCE & REPORTS',
      links: [
        { href: '/dashboard/alerts', label: 'Alerts & Reports', icon: AlertTriangle, badge: '4' },
        { href: '/dashboard/analytics', label: 'Historical Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'HARDWARE & SYSTEM',
      links: [
        { href: '/dashboard/devices', label: 'ESP32 Modules', icon: Cpu, badge: '4/4' },
        { href: '/dashboard/settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-brand-secondary border-r border-brand-border flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
      
      {/* Top Branding */}
      <div>
        <div className="h-16 px-5 border-b border-brand-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:border-brand-accent transition-colors">
              <Shield className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base text-brand-primaryText leading-none tracking-tight">TRAYATE</span>
              <span className="font-mono text-[9px] text-brand-accent uppercase tracking-widest mt-1">COMMAND CENTRE</span>
            </div>
          </Link>

          <Link 
            href="/" 
            className="text-brand-secondaryText hover:text-brand-primaryText p-1.5 rounded hover:bg-brand-bg transition-colors"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Prominent Quick "START MISSION" Banner */}
        <div className="p-3 pb-0">
          <Link
            href="/dashboard/mission"
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border font-semibold text-xs transition-all shadow-sm ${
              pathname === '/dashboard/mission'
                ? 'bg-brand-accent/20 border-brand-accent text-brand-accent shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                : 'bg-brand-accent/10 border-brand-accent/40 text-brand-accent hover:bg-brand-accent/15'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </span>
              <span className="tracking-wide">START MISSION</span>
            </div>
            <span className="font-mono text-[10px] bg-brand-accent/20 px-1.5 py-0.5 rounded text-brand-accent">
              W-A-S-D
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-brand-secondaryText/70 px-2 py-1">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-card text-brand-accent border-l-2 border-brand-accent font-semibold shadow-inner'
                          : 'text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-card/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-accent' : 'text-brand-secondaryText'}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                          link.badge === 'LIVE'
                            ? 'bg-brand-accent/20 border-brand-accent/50 text-brand-accent'
                            : 'bg-brand-bg border-brand-border text-brand-secondaryText'
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

      {/* Bottom Footer Telemetry Strip */}
      <div className="p-3 border-t border-brand-border bg-brand-bg/50">
        <div className="flex items-center justify-between text-[11px] font-mono text-brand-secondaryText">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-brand-success" />
            <span>ESP32-CORE</span>
          </div>
          <span className="text-brand-success font-semibold">100Hz LIVE</span>
        </div>
        <div className="mt-1 text-[10px] font-mono text-brand-secondaryText/60 truncate">
          TOPIC: trayate/rover/main
        </div>
      </div>

    </aside>
  );
}
