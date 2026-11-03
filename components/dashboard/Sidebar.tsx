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
  ArrowLeft
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'GENERAL',
      links: [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/monitoring', label: 'Live Monitoring', icon: Activity },
        { href: '/dashboard/map', label: 'Mine Map', icon: Map },
      ],
    },
    {
      title: 'OPERATIONS',
      links: [
        { href: '/dashboard/control', label: 'Rover Control', icon: Gamepad2 },
        { href: '/dashboard/vision', label: 'Camera & Vision', icon: Camera },
        { href: '/dashboard/alerts', label: 'Alerts & Events', icon: AlertTriangle, badge: '4' },
      ],
    },
    {
      title: 'INTELLIGENCE',
      links: [
        { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      links: [
        { href: '/dashboard/devices', label: 'Device Management', icon: Cpu, badge: '4/4' },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-brand-secondary border-r border-brand-border flex flex-col justify-between shrink-0 h-screen sticky top-0">
      
      {/* Top Branding */}
      <div>
        <div className="h-16 px-5 border-b border-brand-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent group-hover:border-brand-accent">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-base text-brand-primaryText leading-none">TRAYATE</span>
              <span className="font-mono text-[8px] text-brand-accent uppercase tracking-widest mt-0.5">COMMAND CENTRE</span>
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

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold text-brand-secondaryText/70 tracking-widest uppercase mb-1">
                {section.title}
              </div>
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-accent/15 text-brand-accent font-semibold border border-brand-accent/30 shadow-cyan-subtle'
                        : 'text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-card'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-brand-accent text-brand-bg'
                          : 'bg-brand-card border border-brand-border text-brand-secondaryText'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sub-surface Status Indicator */}
      <div className="p-4 border-t border-brand-border bg-brand-bg/50">
        <div className="flex items-center justify-between text-xs font-mono text-brand-secondaryText">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
            <span className="text-brand-primaryText font-semibold">T-ROVER 01</span>
          </div>
          <span className="text-brand-accent font-bold">SHAFT-B</span>
        </div>
        <div className="text-[10px] font-mono text-brand-secondaryText/80 mt-1 flex justify-between">
          <span>DEPTH: -428.5m</span>
          <span>BATTERY: 94%</span>
        </div>
      </div>

    </aside>
  );
}

