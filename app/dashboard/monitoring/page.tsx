'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
import PhysicalSensorGrid from '@/components/dashboard/PhysicalSensorGrid';
import LiveHardwareCharts from '@/components/dashboard/LiveHardwareCharts';
import HardwareConnectionPanel from '@/components/dashboard/HardwareConnectionPanel';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  Compass, 
  Gauge, 
  BatteryMedium, 
  Wind,
  WifiOff,
  Cpu
} from 'lucide-react';
import { useState } from 'react';

export default function LiveMonitoringPage() {
  const { telemetry, setHardwareMode } = useTelemetry();
  const [activeTab, setActiveTab] = useState<'hardware' | 'charts' | 'connection'>('hardware');

  const isLiveHardware = telemetry.hardwareMode === 'LIVE_HARDWARE';

  return (
    <div className="space-y-6">
      
      {/* Top Status & Stream Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              telemetry.physicalHardware.esp32_01_connected ? 'bg-brand-success animate-pulse' : 'bg-brand-warning'
            }`}></span>
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">
              Real-Time Hardware Telemetry & Sensor Monitoring
            </h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            ESP32-01 DEV-KIT // TRANSDUCER RAW ADC & SENSIRION BUS // FREQUENCY: 1000ms
          </p>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 bg-brand-secondary p-1 rounded-lg border border-brand-border font-mono text-xs">
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'hardware'
                ? 'bg-brand-card text-brand-accent border border-brand-border shadow-sm'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            Live Sensors & Servo
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'charts'
                ? 'bg-brand-card text-brand-accent border border-brand-border shadow-sm'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            Telemetry Charts
          </button>

          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'connection'
                ? 'bg-brand-card text-brand-accent border border-brand-border shadow-sm'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            Hardware Topology
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'hardware' && (
        <div className="space-y-6">
          <PhysicalSensorGrid />
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          <LiveHardwareCharts />
        </div>
      )}

      {activeTab === 'connection' && (
        <div className="space-y-6">
          <HardwareConnectionPanel />
        </div>
      )}

    </div>
  );
}
