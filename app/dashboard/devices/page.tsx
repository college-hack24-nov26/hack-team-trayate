'use client';

import { useState } from 'react';
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
  Terminal
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
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">Distributed ESP32 Device Management</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            4 ISOLATED RTOS CONTROLLERS // MQTT TOPIC BROADCASTING // REAL-TIME HEARTBEAT
          </p>
        </div>

        {/* Global Cluster Summary */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded bg-brand-success/15 border border-brand-success/30 text-brand-success flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>CLUSTER HEALTH: 4/4 ONLINE</span>
          </div>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => {
          const isOnline = device.status === 'ONLINE';

          return (
            <div 
              key={device.id}
              className={`bg-brand-card border rounded-xl p-6 shadow-xl space-y-5 transition-all ${
                isOnline ? 'border-brand-border hover:border-brand-accent/40' : 'border-brand-danger bg-brand-danger/5'
              }`}
            >
              
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-brand-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mt-0.5">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans text-base font-bold text-brand-primaryText">{device.name}</h3>
                      <span className="font-mono text-xs font-bold text-brand-accent px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">
                        {device.id}
                      </span>
                    </div>
                    <p className="text-xs text-brand-secondaryText mt-1 leading-relaxed">{device.role}</p>
                  </div>
                </div>

                {/* Connection Status Pill */}
                <div className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                  isOnline 
                    ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
                    : 'bg-brand-danger/10 text-brand-danger border-brand-danger/30 animate-pulse'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-brand-success animate-pulse' : 'bg-brand-danger'}`}></span>
                  <span>{device.status}</span>
                </div>
              </div>

              {/* Hardware & Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                
                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">MQTT TOPIC</span>
                  <span className="text-brand-accent font-semibold text-[11px] truncate block mt-0.5">
                    {device.mqttTopic}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">FIRMWARE</span>
                  <span className="text-brand-primaryText font-semibold text-[11px] block mt-0.5">
                    {device.firmwareVersion}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">CPU LOAD</span>
                  <span className="text-brand-primaryText font-semibold text-[11px] block mt-0.5">
                    {device.cpuLoadPercent}% (Free: {device.freeHeapKb}KB)
                  </span>
                </div>

                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">LAST HEARTBEAT</span>
                  <span className="text-brand-success font-semibold text-[11px] block mt-0.5">
                    {device.lastHeartbeat}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">BUS LATENCY</span>
                  <span className="text-brand-accent font-semibold text-[11px] block mt-0.5">
                    {device.lastDataReceived}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-brand-secondary/80 border border-brand-border">
                  <span className="text-[10px] text-brand-secondaryText block">RAIL VOLTAGE</span>
                  <span className="text-brand-primaryText font-semibold text-[11px] block mt-0.5">
                    {device.voltage} VDC
                  </span>
                </div>

              </div>

              {/* Subsystems List */}
              <div className="space-y-1.5 pt-2">
                <span className="font-mono text-[10px] text-brand-secondaryText uppercase tracking-wider block">
                  INTEGRATED HARDWARE BUS MODULES:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {device.subsystems.map((sub, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-primaryText">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

