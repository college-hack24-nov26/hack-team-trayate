'use client';

import { useState, useEffect } from 'react';

export interface SensorData {
  value: number;
  unit: string;
  status: 'safe' | 'warning' | 'critical';
  trend: number[];
  lastUpdated: string;
  minSafe: number;
  maxSafe: number;
  label: string;
}

export interface TelemetryState {
  ch4: SensorData;
  co: SensorData;
  co2: SensorData;
  o2: SensorData;
  temp: SensorData;
  humidity: SensorData;
  pm25: SensorData;
  pm10: SensorData;
  dustCleaner: {
    status: 'ACTIVE' | 'STANDBY' | 'PURGING' | 'OFFLINE';
    mode: 'AUTO' | 'MANUAL';
    blowerRpm: number;
    filterLifePercent: number;
    airflowRate: number; // m3/h
    efficiency: number; // %
    beforeDustPM10: number;
    afterDustPM10: number;
  };
  rover: {
    connectivity: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
    batteryPercent: number;
    batteryVoltage: number;
    latencyMs: number;
    depthMeters: number;
    speedMps: number;
    headingDeg: number;
    mode: 'MANUAL' | 'AUTONOMOUS';
    currentMovement: 'STOP' | 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';
    eStopTriggered: boolean;
    position: { x: number; y: number };
    trail: Array<{ x: number; y: number }>;
  };
  connections: {
    mqtt: boolean;
    supabase: boolean;
    isDemo: boolean;
    brokerUrl: string;
    lastPing: string;
  };
}

const initialTelemetry: TelemetryState = {
  ch4: {
    label: 'Methane (CH4)',
    value: 0.12,
    unit: '% VOL',
    status: 'safe',
    trend: [0.10, 0.11, 0.12, 0.13, 0.12, 0.11, 0.12],
    lastUpdated: 'Just now',
    minSafe: 0,
    maxSafe: 1.0,
  },
  co: {
    label: 'Carbon Monoxide (CO)',
    value: 8,
    unit: 'PPM',
    status: 'safe',
    trend: [6, 7, 7, 8, 9, 8, 8],
    lastUpdated: 'Just now',
    minSafe: 0,
    maxSafe: 25,
  },
  co2: {
    label: 'Carbon Dioxide (CO2)',
    value: 620,
    unit: 'PPM',
    status: 'safe',
    trend: [580, 595, 610, 630, 625, 620, 620],
    lastUpdated: 'Just now',
    minSafe: 350,
    maxSafe: 1200,
  },
  o2: {
    label: 'Oxygen (O2)',
    value: 20.8,
    unit: '% VOL',
    status: 'safe',
    trend: [20.9, 20.8, 20.8, 20.7, 20.8, 20.8, 20.8],
    lastUpdated: 'Just now',
    minSafe: 19.5,
    maxSafe: 23.5,
  },
  temp: {
    label: 'Ambient Temperature',
    value: 24.2,
    unit: '°C',
    status: 'safe',
    trend: [23.8, 23.9, 24.1, 24.2, 24.3, 24.2, 24.2],
    lastUpdated: 'Just now',
    minSafe: 10,
    maxSafe: 35,
  },
  humidity: {
    label: 'Relative Humidity',
    value: 62.4,
    unit: '% RH',
    status: 'safe',
    trend: [61.0, 61.5, 62.0, 62.8, 62.6, 62.4, 62.4],
    lastUpdated: 'Just now',
    minSafe: 30,
    maxSafe: 80,
  },
  pm25: {
    label: 'Fine Particulates (PM2.5)',
    value: 28,
    unit: 'µg/m³',
    status: 'safe',
    trend: [22, 24, 26, 31, 29, 28, 28],
    lastUpdated: 'Just now',
    minSafe: 0,
    maxSafe: 60,
  },
  pm10: {
    label: 'Coarse Coal Dust (PM10)',
    value: 64,
    unit: 'µg/m³',
    status: 'safe',
    trend: [85, 82, 76, 72, 68, 65, 64],
    lastUpdated: 'Just now',
    minSafe: 0,
    maxSafe: 150,
  },
  dustCleaner: {
    status: 'STANDBY',
    mode: 'AUTO',
    blowerRpm: 3200,
    filterLifePercent: 88,
    airflowRate: 142,
    efficiency: 94.6,
    beforeDustPM10: 184,
    afterDustPM10: 42,
  },
  rover: {
    connectivity: 'ONLINE',
    batteryPercent: 94,
    batteryVoltage: 24.8,
    latencyMs: 12,
    depthMeters: -428.5,
    speedMps: 0.0,
    headingDeg: 278,
    mode: 'MANUAL',
    currentMovement: 'STOP',
    eStopTriggered: false,
    position: { x: 340, y: 220 },
    trail: [
      { x: 120, y: 150 },
      { x: 180, y: 170 },
      { x: 240, y: 190 },
      { x: 300, y: 210 },
      { x: 340, y: 220 },
    ],
  },
  connections: {
    mqtt: true,
    supabase: true,
    isDemo: true, // Display DEMO DATA badge clearly
    brokerUrl: 'wss://telemetry.trayate.systems/mqtt',
    lastPing: '2s ago',
  },
};

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(initialTelemetry);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Natural telemetry jitter
        const ch4Jitter = Number((0.11 + Math.random() * 0.03).toFixed(2));
        const coJitter = Math.floor(7 + Math.random() * 3);
        const o2Jitter = Number((20.7 + Math.random() * 0.2).toFixed(1));
        const tempJitter = Number((24.1 + Math.random() * 0.3).toFixed(1));
        const humJitter = Number((62.0 + Math.random() * 0.8).toFixed(1));
        const pm10Jitter = Math.floor(60 + Math.random() * 8);

        return {
          ...prev,
          ch4: {
            ...prev.ch4,
            value: ch4Jitter,
            trend: [...prev.ch4.trend.slice(1), ch4Jitter],
            lastUpdated: '1s ago',
          },
          co: {
            ...prev.co,
            value: coJitter,
            trend: [...prev.co.trend.slice(1), coJitter],
            lastUpdated: '1s ago',
          },
          o2: {
            ...prev.o2,
            value: o2Jitter,
            trend: [...prev.o2.trend.slice(1), o2Jitter],
            lastUpdated: '1s ago',
          },
          temp: {
            ...prev.temp,
            value: tempJitter,
            trend: [...prev.temp.trend.slice(1), tempJitter],
            lastUpdated: '1s ago',
          },
          humidity: {
            ...prev.humidity,
            value: humJitter,
            trend: [...prev.humidity.trend.slice(1), humJitter],
            lastUpdated: '1s ago',
          },
          pm10: {
            ...prev.pm10,
            value: pm10Jitter,
            trend: [...prev.pm10.trend.slice(1), pm10Jitter],
            lastUpdated: '1s ago',
          },
        };
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const sendMovementCommand = (direction: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP') => {
    if (telemetry.rover.eStopTriggered) return;
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        currentMovement: direction,
        speedMps: direction === 'STOP' ? 0.0 : 0.8,
      },
    }));
  };

  const triggerEStop = () => {
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        eStopTriggered: true,
        currentMovement: 'STOP',
        speedMps: 0.0,
      },
    }));
  };

  const resetEStop = () => {
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        eStopTriggered: false,
      },
    }));
  };

  const toggleDustCleaner = () => {
    setTelemetry((prev) => ({
      ...prev,
      dustCleaner: {
        ...prev.dustCleaner,
        status: prev.dustCleaner.status === 'ACTIVE' ? 'STANDBY' : 'ACTIVE',
      },
    }));
  };

  const setDustCleanerMode = (mode: 'AUTO' | 'MANUAL') => {
    setTelemetry((prev) => ({
      ...prev,
      dustCleaner: {
        ...prev.dustCleaner,
        mode,
      },
    }));
  };

  return {
    telemetry,
    sendMovementCommand,
    triggerEStop,
    resetEStop,
    toggleDustCleaner,
    setDustCleanerMode,
  };
}

