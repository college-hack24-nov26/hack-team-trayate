'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { Activity, ShieldCheck, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function LiveMonitoringPage() {
  const { telemetry } = useTelemetry();
  const [timeWindow, setTimeWindow] = useState<'15m' | '1h' | '6h' | '24h'>('1h');

  // Multi-Gas Historical Timeseries Data for Recharts
  const historicalGasData = [
    { time: '13:00', ch4: 0.10, co: 6, o2: 20.9, temp: 23.8, pm10: 85 },
    { time: '13:10', ch4: 0.11, co: 7, o2: 20.8, temp: 23.9, pm10: 82 },
    { time: '13:20', ch4: 0.12, co: 8, o2: 20.8, temp: 24.1, pm10: 76 },
    { time: '13:30', ch4: 0.45, co: 12, o2: 20.7, temp: 24.3, pm10: 184 },
    { time: '13:40', ch4: 0.28, co: 9, o2: 20.8, temp: 24.2, pm10: 92 },
    { time: '13:50', ch4: 0.14, co: 8, o2: 20.8, temp: 24.2, pm10: 68 },
    { time: '14:00', ch4: telemetry.ch4.value, co: telemetry.co.value, o2: telemetry.o2.value, temp: telemetry.temp.value, pm10: telemetry.pm10.value },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Status & Live Hardware Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-pulse"></span>
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">Sub-Surface Atmospheric Monitoring</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            CALIBRATED MULTI-CHANNEL TRANSDUCER ARRAY // FREQUENCY: 100Hz // SUPABASE STREAMING
          </p>
        </div>

        {/* DEMO DATA CLEAR NOTICE */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-brand-warning/15 border border-brand-warning/40 text-brand-warning font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>HARDWARE DEMO STREAM ACTIVE (LIVE JITTER APPLIED)</span>
          </div>
        </div>
      </div>

      {/* 8 Individual Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard data={telemetry.ch4} />
        <SensorCard data={telemetry.co} />
        <SensorCard data={telemetry.co2} />
        <SensorCard data={telemetry.o2} />
        <SensorCard data={telemetry.temp} />
        <SensorCard data={telemetry.humidity} />
        <SensorCard data={telemetry.pm25} />
        <SensorCard data={telemetry.pm10} />
      </div>

      {/* Recharts Large Historical Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Hazardous Gases Trend (CH4 % and CO ppm) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">Methane (CH4) & Carbon Monoxide (CO) Timeline</h3>
              <p className="font-mono text-xs text-brand-secondaryText">CH4 Lower Explosive Limit (LEL) Target &lt; 1.00%</p>
            </div>
            <span className="font-mono text-xs text-brand-accent bg-brand-secondary px-2.5 py-1 rounded border border-brand-border">
              WINDOW: {timeWindow}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalGasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ch4Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="coGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1520', borderColor: '#243244', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="ch4" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#ch4Grad)" name="CH4 (% VOL)" />
                <Area type="monotone" dataKey="co" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#coGrad)" name="CO (PPM)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-brand-secondaryText pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-accent"></span> CH4 (% VOL)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-warning"></span> CO (PPM)</span>
            </div>
            <span>MQTT QoS-1 SYNCHRONIZED</span>
          </div>
        </div>

        {/* Graph 2: Coal Dust & Particulate Concentration (PM10) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">Coal Dust Suppression Trend (PM10)</h3>
              <p className="font-mono text-xs text-brand-secondaryText">DustCleaner active extraction impact at 13:30</p>
            </div>
            <span className="font-mono text-xs text-brand-success bg-brand-secondary px-2.5 py-1 rounded border border-brand-border">
              -77% DUST DROP
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalGasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1520', borderColor: '#243244', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="pm10" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#pmGrad)" name="PM10 (µg/m³)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-brand-secondaryText pt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-success"></span> PM10 COAL DUST (µg/m³)</span>
            <span>THRESHOLD SAFE: &lt; 150 µg/m³</span>
          </div>
        </div>

      </div>

    </div>
  );
}

