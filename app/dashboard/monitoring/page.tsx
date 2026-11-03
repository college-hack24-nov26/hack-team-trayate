'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import SensorCard from '@/components/dashboard/SensorCard';
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
  WifiOff
} from 'lucide-react';
import { useState } from 'react';

export default function LiveMonitoringPage() {
  const { telemetry, setHardwareMode } = useTelemetry();
  const [timeWindow, setTimeWindow] = useState<'15m' | '1h' | '6h' | '24h'>('1h');

  // Timeseries data for Recharts
  const historicalGasData = [
    { time: '13:00', ch4: 0.10, co: 6, o2: 20.9, temp: 23.8, pm10: 85 },
    { time: '13:10', ch4: 0.11, co: 7, o2: 20.8, temp: 23.9, pm10: 82 },
    { time: '13:20', ch4: 0.12, co: 8, o2: 20.8, temp: 24.1, pm10: 76 },
    { time: '13:30', ch4: 0.45, co: 12, o2: 20.7, temp: 24.3, pm10: 184 },
    { time: '13:40', ch4: 0.28, co: 9, o2: 20.8, temp: 24.2, pm10: 92 },
    { time: '13:50', ch4: 0.14, co: 8, o2: 20.8, temp: 24.2, pm10: 68 },
    { time: '14:00', ch4: telemetry.ch4.value, co: telemetry.co.value, o2: telemetry.o2.value, temp: telemetry.temp.value, pm10: telemetry.pm10.value },
  ];

  const isLiveHardware = telemetry.hardwareMode === 'LIVE_HARDWARE';

  return (
    <div className="space-y-6">
      
      {/* Top Status & Stream Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveHardware ? 'bg-brand-success animate-pulse' : 'bg-brand-warning'}`}></span>
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">Sub-Surface Atmospheric Monitoring</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            CALIBRATED MULTI-CHANNEL TRANSDUCER ARRAY // FREQUENCY: 100Hz // SUPABASE REALTIME
          </p>
        </div>

        {/* Clear Distinction: Hardware Mode vs Simulator Toggle */}
        <div className="flex items-center gap-2 bg-brand-secondary p-1 rounded-lg border border-brand-border">
          <button
            onClick={() => setHardwareMode('SIMULATOR')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              !isLiveHardware
                ? 'bg-brand-warning text-brand-bg shadow-sm'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-bg"></span>
            <span>SIMULATOR MODE</span>
          </button>

          <button
            onClick={() => setHardwareMode('LIVE_HARDWARE')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              isLiveHardware
                ? 'bg-brand-success text-brand-bg shadow-sm'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-bg animate-pulse"></span>
            <span>LIVE ESP32 HARDWARE</span>
          </button>
        </div>
      </div>

      {/* Mode Clarification Banner */}
      {isLiveHardware ? (
        <div className="p-3 rounded-lg bg-brand-card border border-brand-success/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-brand-success">
            <ShieldCheck className="w-4 h-4" />
            <span>LIVE HARDWARE MODE: Listening for MQTT packets on <code className="text-brand-accent">trayate/rover/sensors/telemetry</code></span>
          </div>
          <span className="text-brand-secondaryText text-[11px]">NO SYNTHETIC JITTER APPLIED</span>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-brand-warning/10 border border-brand-warning/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-brand-warning">
            <AlertTriangle className="w-4 h-4" />
            <span>SIMULATOR ACTIVE: Displaying simulated telemetry with realistic environmental sensor variance for verification.</span>
          </div>
          <span className="text-brand-warning font-semibold text-[11px]">DEMO DATA</span>
        </div>
      )}

      {/* Primary Gas & Atmospheric Sensor Grid (8 Primary Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard data={telemetry.ch4} />
        <SensorCard data={telemetry.co} />
        <SensorCard data={telemetry.co2} />
        <SensorCard data={telemetry.o2} />
        <SensorCard data={telemetry.temp} />
        <SensorCard data={telemetry.humidity} />
        <SensorCard data={telemetry.pressure} />
        <SensorCard data={telemetry.pm10} />
      </div>

      {/* Secondary Hardware Diagnostics: DustCleaner & IMU & Battery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* DustCleaner Live Status */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-brand-warning" />
              <span className="font-sans font-bold text-sm text-brand-primaryText">DustCleaner Cyclonic Core</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-secondary text-brand-warning border border-brand-border">
              {telemetry.dustCleaner.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="bg-brand-bg p-2.5 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">BLOWER VELOCITY</span>
              <div className="text-base font-bold text-brand-primaryText mt-0.5">{telemetry.dustCleaner.blowerRpm} RPM</div>
            </div>
            <div className="bg-brand-bg p-2.5 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">HEPA FILTER LIFE</span>
              <div className="text-base font-bold text-brand-success mt-0.5">{telemetry.dustCleaner.filterLifePercent}%</div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-brand-secondaryText flex justify-between pt-1">
            <span>Intake PM10: {telemetry.dustCleaner.beforeDustPM10} µg</span>
            <span>Exhaust PM10: {telemetry.dustCleaner.afterDustPM10} µg</span>
          </div>
        </div>

        {/* IMU Orientation & Roll/Pitch */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-accent" />
              <span className="font-sans font-bold text-sm text-brand-primaryText">IMU Inclinometer & Compass</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-secondary text-brand-accent border border-brand-border">
              STABLE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-xs text-center">
            <div className="bg-brand-bg p-2 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">PITCH</span>
              <div className="text-sm font-bold text-brand-primaryText mt-0.5">{telemetry.imu.pitchDeg}°</div>
            </div>
            <div className="bg-brand-bg p-2 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">ROLL</span>
              <div className="text-sm font-bold text-brand-primaryText mt-0.5">{telemetry.imu.rollDeg}°</div>
            </div>
            <div className="bg-brand-bg p-2 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">HEADING</span>
              <div className="text-sm font-bold text-brand-accent mt-0.5">{telemetry.rover.headingDeg}°</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-brand-secondaryText">
            Tip-over threshold: &gt;35° inclination triggers automatic rover deceleration.
          </div>
        </div>

        {/* Main 24V Power Bus */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryMedium className="w-4 h-4 text-brand-success" />
              <span className="font-sans font-bold text-sm text-brand-primaryText">24V LiFePO4 Power System</span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-secondary text-brand-success border border-brand-border">
              {telemetry.rover.batteryPercent}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
            <div className="bg-brand-bg p-2.5 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">BUS VOLTAGE</span>
              <div className="text-base font-bold text-brand-success mt-0.5">{telemetry.rover.batteryVoltage.toFixed(1)} V</div>
            </div>
            <div className="bg-brand-bg p-2.5 rounded border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">CURRENT DRAW</span>
              <div className="text-base font-bold text-brand-primaryText mt-0.5">3.8 A</div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-brand-secondaryText flex justify-between pt-1">
            <span>Estimated Endurance: 4h 12m</span>
            <span>Cell Balance: 3.32V/cell</span>
          </div>
        </div>

      </div>

      {/* Historical Timeseries Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Methane & Carbon Monoxide */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">Combustible & Toxic Gas Profile</h3>
              <p className="font-mono text-xs text-brand-secondaryText">CH4 (% Vol) and CO (PPM) Trend Across Drift Corridor</p>
            </div>
            <span className="font-mono text-xs text-brand-accent bg-brand-secondary px-2.5 py-1 rounded border border-brand-border">
              WINDOW: {timeWindow}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalGasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ch4Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ch4" stroke="#38BDF8" fillOpacity={1} fill="url(#ch4Grad)" name="Methane (% CH4)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Ambient Temperature & Dust Concentration */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">Thermal & Aerosol Concentration</h3>
              <p className="font-mono text-xs text-brand-secondaryText">Ambient Temp (°C) and Respirable Coal Aerosol (PM10 µg/m³)</p>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['15m', '1h', '6h', '24h'] as const).map((win) => (
                <button
                  key={win}
                  onClick={() => setTimeWindow(win)}
                  className={`px-2 py-1 rounded transition-colors ${
                    timeWindow === win ? 'bg-brand-accent text-brand-bg font-bold' : 'text-brand-secondaryText hover:text-brand-primaryText'
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalGasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pm10Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="pm10" stroke="#F59E0B" fillOpacity={1} fill="url(#pm10Grad)" name="Dust (PM10 µg/m³)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
