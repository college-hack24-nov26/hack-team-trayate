'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import DistanceMonitorCard from './DistanceMonitorCard';
import ServoScannerControl from './ServoScannerControl';
import { 
  Flame, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function PhysicalSensorGrid() {
  const { telemetry } = useTelemetry();
  const { 
    sensorUrl,
    esp32_01_connected, 
    mq4_raw, 
    mq135_raw, 
    temperature, 
    humidity, 
    lastUpdated, 
    latencyMs, 
    isInitialLoading,
    history
  } = telemetry.physicalHardware;

  return (
    <div className="space-y-6">
      
      {/* Physical Hardware Status Strip */}
      <div className="bg-brand-secondary border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
              esp32_01_connected ? 'bg-brand-success opacity-75' : 'bg-brand-danger opacity-75'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              esp32_01_connected ? 'bg-brand-success' : 'bg-brand-danger'
            }`}></span>
          </span>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-sm text-brand-primaryText">
                ESP32-01 Rover Sensor Module
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                esp32_01_connected
                  ? 'bg-brand-success/15 border-brand-success/40 text-brand-success'
                  : 'bg-brand-danger/15 border-brand-danger/40 text-brand-danger'
              }`}>
                {esp32_01_connected ? `ONLINE (${sensorUrl ? sensorUrl.replace(/^https?:\/\//, '') : 'Configured'})` : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[11px] text-brand-secondaryText">
              Real-time hardware polling active via Wi-Fi hotspot • Frequency: 1000ms • Latency: {latencyMs}ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-brand-secondaryText text-[11px]">
          <div className="flex items-center gap-1.5 bg-brand-bg px-2.5 py-1 rounded border border-brand-border">
            <Clock className="w-3.5 h-3.5 text-brand-accent" />
            <span>LAST SYNC: <strong className="text-brand-primaryText">{lastUpdated || 'Connecting...'}</strong></span>
          </div>
        </div>
      </div>

      {/* Top 2 Major Physical Controllers: Distance Proximity + Servo Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistanceMonitorCard />
        <ServoScannerControl />
      </div>

      {/* 4 Dedicated Physical Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: MQ-4 Gas Sensor (RAW ADC) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-warning" />
              <span className="font-sans font-bold text-xs text-brand-primaryText">
                MQ-4 Methane Sensor
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-brand-warning/15 border border-brand-warning/30 text-brand-warning font-bold">
              RAW ADC
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-brand-secondaryText uppercase tracking-wider block">
              ANALOG TRANSDUCER LEVEL
            </span>
            <div className="flex items-baseline gap-2 mt-1 font-mono">
              {isInitialLoading ? (
                <span className="text-3xl font-bold text-brand-secondaryText animate-pulse">----</span>
              ) : mq4_raw !== null ? (
                <>
                  <span className="text-4xl font-extrabold text-brand-primaryText">
                    {mq4_raw}
                  </span>
                  <span className="text-xs text-brand-secondaryText font-semibold">
                    / 4095
                  </span>
                </>
              ) : (
                <span className="text-xl text-brand-danger">DISCONNECTED</span>
              )}
            </div>
          </div>

          <div className="p-2 rounded bg-brand-bg/80 border border-brand-border text-[10px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>Sensor Range:</span>
              <span className="text-brand-primaryText">12-bit ADC (0 - 4095)</span>
            </div>
            <div className="flex justify-between">
              <span>Calibration State:</span>
              <span className="text-brand-warning font-semibold">RAW UNCALIBRATED</span>
            </div>
          </div>

          <p className="text-[9px] font-mono text-brand-secondaryText/70 leading-tight">
            *MQ-4 returns raw analog voltage. No arbitrary ppm conversion is applied to preserve safety integrity.
          </p>
        </div>

        {/* CARD 2: MQ-135 Air Quality Sensor (RAW ADC) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-brand-accent" />
              <span className="font-sans font-bold text-xs text-brand-primaryText">
                MQ-135 Air Quality
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-brand-accent/15 border border-brand-accent/30 text-brand-accent font-bold">
              RAW ADC
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-brand-secondaryText uppercase tracking-wider block">
              AIR QUALITY INDEX LEVEL
            </span>
            <div className="flex items-baseline gap-2 mt-1 font-mono">
              {isInitialLoading ? (
                <span className="text-3xl font-bold text-brand-secondaryText animate-pulse">----</span>
              ) : mq135_raw !== null ? (
                <>
                  <span className="text-4xl font-extrabold text-brand-primaryText">
                    {mq135_raw}
                  </span>
                  <span className="text-xs text-brand-secondaryText font-semibold">
                    / 4095
                  </span>
                </>
              ) : (
                <span className="text-xl text-brand-danger">DISCONNECTED</span>
              )}
            </div>
          </div>

          <div className="p-2 rounded bg-brand-bg/80 border border-brand-border text-[10px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>Gas Sensitivity:</span>
              <span className="text-brand-primaryText">NH3, NOx, Alcohol, CO</span>
            </div>
            <div className="flex justify-between">
              <span>Calibration State:</span>
              <span className="text-brand-accent font-semibold">RAW UNCALIBRATED</span>
            </div>
          </div>

          <p className="text-[9px] font-mono text-brand-secondaryText/70 leading-tight">
            *MQ-135 raw readings reflect atmospheric resistance changes across mine corridors.
          </p>
        </div>

        {/* CARD 3: Temperature (DHT22) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-brand-danger" />
              <span className="font-sans font-bold text-xs text-brand-primaryText">
                Ambient Temperature
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-brand-secondary border border-brand-border text-brand-primaryText font-bold">
              DHT22
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-brand-secondaryText uppercase tracking-wider block">
              CALIBRATED DIGITAL THERMAL
            </span>
            <div className="flex items-baseline gap-2 mt-1 font-mono">
              {isInitialLoading ? (
                <span className="text-3xl font-bold text-brand-secondaryText animate-pulse">--.-</span>
              ) : temperature !== null ? (
                <>
                  <span className="text-4xl font-extrabold text-brand-primaryText">
                    {temperature.toFixed(1)}
                  </span>
                  <span className="text-sm text-brand-secondaryText font-semibold">
                    °C
                  </span>
                </>
              ) : (
                <span className="text-xl text-brand-danger">DISCONNECTED</span>
              )}
            </div>
          </div>

          <div className="p-2 rounded bg-brand-bg/80 border border-brand-border text-[10px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>Operational Range:</span>
              <span className="text-brand-primaryText">-40°C to +80°C</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className="text-brand-success font-semibold">±0.5°C Resolution</span>
            </div>
          </div>

          <p className="text-[9px] font-mono text-brand-secondaryText/70 leading-tight">
            *High precision single-bus digital thermal sensing.
          </p>
        </div>

        {/* CARD 4: Humidity (DHT22) */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-brand-accent" />
              <span className="font-sans font-bold text-xs text-brand-primaryText">
                Relative Humidity
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-brand-secondary border border-brand-border text-brand-primaryText font-bold">
              DHT22
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-brand-secondaryText uppercase tracking-wider block">
              MOISTURE SATURATION
            </span>
            <div className="flex items-baseline gap-2 mt-1 font-mono">
              {isInitialLoading ? (
                <span className="text-3xl font-bold text-brand-secondaryText animate-pulse">--.-</span>
              ) : humidity !== null ? (
                <>
                  <span className="text-4xl font-extrabold text-brand-primaryText">
                    {humidity.toFixed(1)}
                  </span>
                  <span className="text-sm text-brand-secondaryText font-semibold">
                    % RH
                  </span>
                </>
              ) : (
                <span className="text-xl text-brand-danger">DISCONNECTED</span>
              )}
            </div>
          </div>

          <div className="p-2 rounded bg-brand-bg/80 border border-brand-border text-[10px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>Operational Range:</span>
              <span className="text-brand-primaryText">0% to 100% RH</span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className="text-brand-success font-semibold">±2% RH</span>
            </div>
          </div>

          <p className="text-[9px] font-mono text-brand-secondaryText/70 leading-tight">
            *High relative humidity increases coal dust moisture agglomeration.
          </p>
        </div>

      </div>

    </div>
  );
}

