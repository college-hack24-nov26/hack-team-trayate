'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { soundManager } from './soundAlerts';

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
  mission: {
    id: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'ABORTED' | 'COMPLETED';
    startTime: string;
    elapsedSeconds: number;
  };
  hardwareMode: 'SIMULATOR' | 'LIVE_HARDWARE';
  camera: {
    url: string;
    status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';
    fps: number;
    latencyMs: number;
    resolution: string;
    format: string;
    lastPing: string;
  };
  ch4: SensorData;
  co: SensorData;
  co2: SensorData;
  o2: SensorData;
  temp: SensorData;
  humidity: SensorData;
  pressure: SensorData;
  pm25: SensorData;
  pm10: SensorData;
  imu: {
    pitchDeg: number;
    rollDeg: number;
    yawDeg: number;
  };
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
    speedGovernorPercent: number;
    headingDeg: number;
    mode: 'MANUAL' | 'AUTONOMOUS';
    currentMovement: 'STOP' | 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';
    eStopTriggered: boolean;
    lastMovementCommandTimestamp: number;
    deadmanExpired: boolean;
    position: { x: number; y: number };
    trail: Array<{ x: number; y: number }>;
  };
  connections: {
    mqtt: boolean;
    supabase: boolean;
    isDemo: boolean;
    brokerUrl: string;
    lastPing: string;
    connectedEsp32Count: number;
  };
  soundMuted: boolean;
}

const initialTelemetry: TelemetryState = {
  mission: {
    id: 'TR-MIS-2026-084',
    name: 'Sector 4 Sub-Drift Reconnaissance',
    status: 'ACTIVE',
    startTime: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    elapsedSeconds: 2540,
  },
  hardwareMode: 'SIMULATOR',
  camera: {
    url: 'http://192.168.1.100:8080/video',
    status: 'DISCONNECTED',
    fps: 30,
    latencyMs: 38,
    resolution: '1280x720',
    format: 'MJPEG (Android IP Webcam)',
    lastPing: 'Awaiting feed',
  },
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
  pressure: {
    label: 'Barometric Pressure',
    value: 1018.4,
    unit: 'hPa',
    status: 'safe',
    trend: [1017.9, 1018.1, 1018.3, 1018.5, 1018.4, 1018.4],
    lastUpdated: 'Just now',
    minSafe: 980,
    maxSafe: 1050,
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
  imu: {
    pitchDeg: -1.4,
    rollDeg: 2.1,
    yawDeg: 278.0,
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
    speedGovernorPercent: 65,
    headingDeg: 278,
    mode: 'MANUAL',
    currentMovement: 'STOP',
    eStopTriggered: false,
    lastMovementCommandTimestamp: Date.now(),
    deadmanExpired: false,
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
    connectedEsp32Count: 4,
  },
  soundMuted: false,
};

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(initialTelemetry);
  const deadmanTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mission timer & simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const nextElapsed = prev.mission.elapsedSeconds + 1;

        if (prev.hardwareMode === 'LIVE_HARDWARE') {
          // When in live hardware mode and no direct hardware packet is delivered,
          // maintain true empty state / un-jittered values to avoid fake data
          return {
            ...prev,
            mission: {
              ...prev.mission,
              elapsedSeconds: nextElapsed,
            },
          };
        }

        // Natural telemetry jitter for simulation mode
        const ch4Jitter = Number((0.11 + Math.random() * 0.03).toFixed(2));
        const coJitter = Math.floor(7 + Math.random() * 3);
        const o2Jitter = Number((20.7 + Math.random() * 0.2).toFixed(1));
        const tempJitter = Number((24.1 + Math.random() * 0.3).toFixed(1));
        const humJitter = Number((62.0 + Math.random() * 0.8).toFixed(1));
        const pm10Jitter = Math.floor(60 + Math.random() * 8);
        const batteryVoltJitter = Number((24.7 + Math.random() * 0.2).toFixed(1));

        return {
          ...prev,
          mission: {
            ...prev.mission,
            elapsedSeconds: nextElapsed,
          },
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
          rover: {
            ...prev.rover,
            batteryVoltage: batteryVoltJitter,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Deadman watchdog: If movement is active but no keep-alive received within 800ms, force halt
  const resetDeadmanWatchdog = useCallback(() => {
    if (deadmanTimerRef.current) {
      clearTimeout(deadmanTimerRef.current);
    }
    deadmanTimerRef.current = setTimeout(() => {
      setTelemetry((prev) => {
        if (prev.rover.currentMovement !== 'STOP') {
          return {
            ...prev,
            rover: {
              ...prev.rover,
              currentMovement: 'STOP',
              speedMps: 0.0,
              deadmanExpired: true,
            },
          };
        }
        return prev;
      });
    }, 800);
  }, []);

  // Movement command dispatcher with deadman protection & E-stop interlock
  const sendMovementCommand = useCallback((direction: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP') => {
    setTelemetry((prev) => {
      // E-stop safety interlock or disconnected safety
      if (prev.rover.eStopTriggered || prev.rover.connectivity === 'OFFLINE') {
        return prev;
      }

      const governorMultiplier = prev.rover.speedGovernorPercent / 100;
      const targetSpeed = direction === 'STOP' ? 0.0 : Number((1.2 * governorMultiplier).toFixed(2));
      
      // Compute heading delta
      let nextHeading = prev.rover.headingDeg;
      if (direction === 'LEFT') nextHeading = (nextHeading - 5 + 360) % 360;
      if (direction === 'RIGHT') nextHeading = (nextHeading + 5) % 360;

      // Compute position delta
      let nextX = prev.rover.position.x;
      let nextY = prev.rover.position.y;
      if (direction === 'FORWARD') {
        const rad = (nextHeading * Math.PI) / 180;
        nextX += Math.cos(rad) * 4 * governorMultiplier;
        nextY += Math.sin(rad) * 4 * governorMultiplier;
      } else if (direction === 'BACKWARD') {
        const rad = (nextHeading * Math.PI) / 180;
        nextX -= Math.cos(rad) * 3 * governorMultiplier;
        nextY -= Math.sin(rad) * 3 * governorMultiplier;
      }

      const nextTrail = direction !== 'STOP' 
        ? [...prev.rover.trail.slice(-40), { x: Math.round(nextX), y: Math.round(nextY) }]
        : prev.rover.trail;

      return {
        ...prev,
        rover: {
          ...prev.rover,
          currentMovement: direction,
          speedMps: targetSpeed,
          headingDeg: nextHeading,
          position: { x: Math.round(nextX), y: Math.round(nextY) },
          trail: nextTrail,
          lastMovementCommandTimestamp: Date.now(),
          deadmanExpired: false,
        },
      };
    });

    if (direction !== 'STOP') {
      resetDeadmanWatchdog();
    }
  }, [resetDeadmanWatchdog]);

  const triggerEStop = useCallback(() => {
    soundManager.playCriticalAlarm();
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        eStopTriggered: true,
        currentMovement: 'STOP',
        speedMps: 0.0,
      },
    }));
  }, []);

  const resetEStop = useCallback(() => {
    soundManager.playClickTone();
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        eStopTriggered: false,
        deadmanExpired: false,
      },
    }));
  }, []);

  const setSpeedGovernor = useCallback((percent: number) => {
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        speedGovernorPercent: Math.max(10, Math.min(100, percent)),
      },
    }));
  }, []);

  const setMovementMode = useCallback((mode: 'MANUAL' | 'AUTONOMOUS') => {
    soundManager.playClickTone();
    setTelemetry((prev) => ({
      ...prev,
      rover: {
        ...prev.rover,
        mode,
        currentMovement: 'STOP',
        speedMps: 0.0,
      },
    }));
  }, []);

  const toggleDustCleaner = useCallback(() => {
    soundManager.playClickTone();
    setTelemetry((prev) => ({
      ...prev,
      dustCleaner: {
        ...prev.dustCleaner,
        status: prev.dustCleaner.status === 'ACTIVE' ? 'STANDBY' : 'ACTIVE',
      },
    }));
  }, []);

  const setDustCleanerMode = useCallback((mode: 'AUTO' | 'MANUAL') => {
    setTelemetry((prev) => ({
      ...prev,
      dustCleaner: {
        ...prev.dustCleaner,
        mode,
      },
    }));
  }, []);

  const setHardwareMode = useCallback((mode: 'SIMULATOR' | 'LIVE_HARDWARE') => {
    soundManager.playClickTone();
    setTelemetry((prev) => ({
      ...prev,
      hardwareMode: mode,
      connections: {
        ...prev.connections,
        isDemo: mode === 'SIMULATOR',
      },
    }));
  }, []);

  const setCameraUrl = useCallback((url: string) => {
    setTelemetry((prev) => ({
      ...prev,
      camera: {
        ...prev.camera,
        url,
      },
    }));
  }, []);

  const setCameraStatus = useCallback((status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR') => {
    setTelemetry((prev) => ({
      ...prev,
      camera: {
        ...prev.camera,
        status,
        lastPing: status === 'CONNECTED' ? 'Live 30 FPS' : 'Offline',
      },
    }));
  }, []);

  const toggleSoundMute = useCallback(() => {
    setTelemetry((prev) => {
      const nextMute = !prev.soundMuted;
      soundManager.setMuted(nextMute);
      return {
        ...prev,
        soundMuted: nextMute,
      };
    });
  }, []);

  return {
    telemetry,
    sendMovementCommand,
    triggerEStop,
    resetEStop,
    setSpeedGovernor,
    setMovementMode,
    toggleDustCleaner,
    setDustCleanerMode,
    setHardwareMode,
    setCameraUrl,
    setCameraStatus,
    toggleSoundMute,
  };
}
