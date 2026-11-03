'use client';

import { useState } from 'react';
import HardwareConnectionPanel from '@/components/dashboard/HardwareConnectionPanel';
import { initialDevices, ESP32Device } from '@/lib/devicesData';
import { 
  Cpu, 
  Wifi, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw,
  Layers,
  Zap,
  Terminal,
  ShieldCheck
} from 'lucide-react';

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<ESP32Device[]>(initialDevices);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-accent" />
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">
              Distributed ESP32 Device & Hardware Connection Management
            </h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            LOCAL WI-FI HOTSPOT TOPOLOGY // REAL HARDWARE INTEGRATION // RTOS CONTROLLERS
          </p>
        </div>

        {/* Global Cluster Summary */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-brand-success/15 border border-brand-success/30 text-brand-success flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ESP32-01: ONLINE (192.168.137.71)</span>
          </div>
        </div>
      </div>

      {/* Primary Hardware Connection Panel (3x ESP32 DevKits) */}
      <HardwareConnectionPanel />

      {/* Subsystems & Diagnostic Telemetry Cards */}
      <div className="space-y-3 pt-2">
        <h3 className="font-sans font-bold text-sm text-brand-primaryText flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-accent" />
          <span>Detailed Board Subsystems & Diagnostics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((device) => {
            const isOnline = device.status === 'ONLINE';

            return (
              <div 
                key={device.id}
                className={`bg-brand-card border rounded-xl p-5 shadow-xl space-y-4 transition-all ${
                  isOnline ? 'border-brand-border hover:border-brand-accent/40' : 'border-brand-border/60'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mt-0.5">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans text-sm font-bold text-brand-primaryText">{device.name}</h4>
                        <span className="font-mono text-xs font-bold text-brand-accent px-1.5 py-0.2 rounded bg-brand-secondary border border-brand-border">
                          {device.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-secondaryText mt-0.5 leading-relaxed">{device.role}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    isOnline 
                      ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
                      : 'bg-brand-secondary text-brand-secondaryText border-brand-border'
                  }`}>
                    {device.status}
                  </span>
                </div>

                {/* Subsystems list */}
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-brand-secondaryText uppercase">Connected Subsystems:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {device.subsystems.map((sub, i) => (
                      <span 
                        key={i} 
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-secondary text-brand-primaryText border border-brand-border"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Firmware & Hardware Bus Info */}
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-brand-secondaryText pt-2 border-t border-brand-border">
                  <div>
                    <span className="block text-[9px]">FIRMWARE</span>
                    <strong className="text-brand-primaryText">{device.firmwareVersion}</strong>
                  </div>
                  <div>
                    <span className="block text-[9px]">HEAP MEMORY</span>
                    <strong className="text-brand-success">{device.freeHeapKb} KB FREE</strong>
                  </div>
                  <div>
                    <span className="block text-[9px]">CORE VOLTAGE</span>
                    <strong className="text-brand-accent">{device.voltage} V</strong>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
