'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { soundManager } from './soundAlerts';
import { 
  fetchLiveSensorData, 
  sendServoAngleCommand, 
  sendMotorMovement, 
  triggerHardwareEmergencyStop,
  getHardwareConfig,
  ESP32SensorResponse 
} from './esp32Service';

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

export interface PhysicalHardwareTelemetry {
  esp32_01_connected: boolean;
  distance: number | null;
  distanceStatus: 'NORMAL' | 'WARNING' | 'DANGER' | 'NO_ECHO';
  mq4_raw: number | null;
  mq135_raw: number | null;
  temperature: number | null;
  humidity: number | null;
  servoAngle: number;
  lastUpdated: string | null;
  latencyMs: number;
  consecutiveFailures: number;
  pollError: string | null;
  isInitialLoading: boolean;
  history: Array<{
    time: string;
    distance: number | null;
    mq4_raw: number | null;
    mq135_raw: number | null;
    temperature: number | null;
    humidity: number | null;
  }>;
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
  physicalHardware: PhysicalHardwareTelemetry;
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
  hardwareMode: 'LIVE_HARDWARE', // Default to live physical hardware!
  physicalHardware: {
    esp32_01_connected: false,
    distance: null,
    distanceStatus: 'NORMAL',
    mq4_raw: null,
    mq135_raw: null,
    temperature: null,
    humidity: null,
    servoAngle: 90,
    lastUpdated: null,
    latencyMs: 0,
    consecutiveFailures: 0,
    pollError: null,
    isInitialLoading: true,
    history: [],
  },
  camera: {
    url: 'http://192.168.4.57:8080/video',
    status: 'DISCONNECTED',
    fps: 30,
    latencyMs: 38,
    resolution: '1280x720',
    format: 'MJPEG (Android IP Webcam)',
    lastPing: 'Awaiting feed',
  },
  ch4: {
    label: 'Methane (MQ-4 RAW ADC)',
    value: 0,
    unit: 'RAW ADC',
    status: 'safe',
    trend: [],
    lastUpdated: 'Connecting...',
    minSafe: 0,
    maxSafe: 1200,
  },
  co: {
    label: 'Air Quality (MQ-135 RAW ADC)',
    value: 0,
    unit: 'RAW ADC',
    status: 'safe',
    trend: [],
    lastUpdated: 'Connecting...',
    minSafe: 0,
    maxSafe: 1200,
  },
  co2: {
    label: 'Carbon Dioxide (CO2)',
    value: 620,
    unit: 'PPM',
    status: 'safe',
    trend: [580, 595, 610, 630, 625, 620, 620],
    lastUpdated: 'Standby',
    minSafe: 350,
    maxSafe: 1200,
  },
  o2: {
    label: 'Oxygen (O2)',
    value: 20.8,
    unit: '% VOL',
    status: 'safe',
    trend: [20.9, 20.8, 20.8, 20.7, 20.8, 20.8, 20.8],
    lastUpdated: 'Nominal',
    minSafe: 19.5,
    maxSafe: 23.5,
  },
  temp: {
    label: 'Temperature (DHT22)',
    value: 0,
    unit: '°C',
    status: 'safe',
    trend: [],
    lastUpdated: 'Connecting...',
    minSafe: 10,
    maxSafe: 40,
  },
  humidity: {
    label: 'Humidity (DHT22)',
    value: 0,
    unit: '% RH',
    status: 'safe',
    trend: [],
    lastUpdated: 'Connecting...',
    minSafe: 20,
    maxSafe: 90,
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
    isDemo: false,
    brokerUrl: 'wss://telemetry.trayate.systems/mqtt',
    lastPing: '2s ago',
    connectedEsp32Count: 1, // ESP32-01 online
  },
  soundMuted: false,
};

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(initialTelemetry);
  const deadmanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef<boolean>(false);

  // 1. Mission Clock (ticks every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        mission: {
          ...prev.mission,
          elapsedSeconds: prev.mission.elapsedSeconds + 1,
        },
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Physical ESP32 Hardware Poller (Every 1000ms)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const liveData: ESP32SensorResponse = await fetchLiveSensorData();

        setTelemetry((prev) => {
          const timestamp = liveData.timestamp || new Date().toLocaleTimeString();
          const latency = liveData.latencyMs || 15;

          const newHistoryItem = {
            time: timestamp,
            distance: liveData.distance,
            mq4_raw: liveData.mq4_raw,
            mq135_raw: liveData.mq135_raw,
            temperature: liveData.temperature,
            humidity: liveData.humidity,
          };

          const nextHistory = [...prev.physicalHardware.history.slice(-39), newHistoryItem];

          return {
            ...prev,
            physicalHardware: {
              ...prev.physicalHardware,
              esp32_01_connected: true,
              distance: liveData.distance,
              distanceStatus: liveData.status,
              mq4_raw: liveData.mq4_raw,
              mq135_raw: liveData.mq135_raw,
              temperature: liveData.temperature,
              humidity: liveData.humidity,
              servoAngle: liveData.angle,
              lastUpdated: timestamp,
              latencyMs: latency,
              consecutiveFailures: 0,
              pollError: null,
              isInitialLoading: false,
              history: nextHistory,
            },
            // Map live physical readings into primary state
            temp: {
              ...prev.temp,
              value: liveData.temperature,
              trend: [...prev.temp.trend.slice(-10), liveData.temperature],
              lastUpdated: `${timestamp} (DHT22)`,
            },
            humidity: {
              ...prev.humidity,
              value: liveData.humidity,
              trend: [...prev.humidity.trend.slice(-10), liveData.humidity],
              lastUpdated: `${timestamp} (DHT22)`,
            },
            ch4: {
              ...prev.ch4,
              value: liveData.mq4_raw,
              trend: [...prev.ch4.trend.slice(-10), liveData.mq4_raw],
              lastUpdated: `${timestamp} (RAW ADC)`,
            },
            co: {
              ...prev.co,
              value: liveData.mq135_raw,
              trend: [...prev.co.trend.slice(-10), liveData.mq135_raw],
              lastUpdated: `${timestamp} (RAW ADC)`,
            },
            connections: {
              ...prev.connections,
              isDemo: false,
              lastPing: `${latency}ms`,
            },
          };
        });
      } catch (err: unknown) {
        // Handle polling error
        const errorMsg = err instanceof Error ? err.message : 'ESP32 sensor timeout';

        setTelemetry((prev) => {
          const failures = prev.physicalHardware.consecutiveFailures + 1;
          const isNowOffline = failures >= 3;

          return {
            ...prev,
            physicalHardware: {
              ...prev.physicalHardware,
              esp32_01_connected: isNowOffline ? false : prev.physicalHardware.esp32_01_connected,
              consecutiveFailures: failures,
              pollError: errorMsg,
              isInitialLoading: false,
            },
          };
        });
      } finally {
        isPollingRef.current = false;
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, []);

  // Deadman watchdog timer: Forces STOP if key held without refresh
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

  // Send movement command (Arrow keys / WASD / UI buttons)
  const sendMovementCommand = useCallback(async (direction: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP') => {
    // 1. Update local UI state
    setTelemetry((prev) => {
      if (prev.rover.eStopTriggered) return prev;

      const governorMultiplier = prev.rover.speedGovernorPercent / 100;
      const targetSpeed = direction === 'STOP' ? 0.0 : Number((1.2 * governorMultiplier).toFixed(2));
      
      let nextHeading = prev.rover.headingDeg;
      if (direction === 'LEFT') nextHeading = (nextHeading - 5 + 360) % 360;
      if (direction === 'RIGHT') nextHeading = (nextHeading + 5) % 360;

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

    // 2. Dispatch to physical ESP32-02 (Rover Motor Controller)
    // Note: Never sends motor commands to ESP32-01
    await sendMotorMovement(direction, telemetry.rover.speedGovernorPercent);
  }, [resetDeadmanWatchdog, telemetry.rover.speedGovernorPercent]);

  // Physical Servo Scanner angle control
  const setPhysicalServoAngle = useCallback(async (angle: number): Promise<boolean> => {
    soundManager.playClickTone();
    try {
      const res = await sendServoAngleCommand(angle);
      if (res.success) {
        setTelemetry((prev) => ({
          ...prev,
          physicalHardware: {
            ...prev.physicalHardware,
            servoAngle: res.angle,
          },
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const triggerEStop = useCallback(() => {
    soundManager.playCriticalAlarm();
    triggerHardwareEmergencyStop();
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
    setPhysicalServoAngle,
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
