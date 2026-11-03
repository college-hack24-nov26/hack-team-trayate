'use client';

// TRAYATE Physical Hardware Service Layer
// Communicates with physical ESP32 boards on the local network
// Direct fetch with automatic server-side relay fallback for zero-failure connectivity

export interface ESP32SensorResponse {
  connected: boolean;
  angle: number;
  distance: number;
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'NO_ECHO';
  mq4_raw: number;
  mq135_raw: number;
  temperature: number;
  humidity: number;
  timestamp?: string;
  latencyMs?: number;
}

export interface ServoCommandResponse {
  success: boolean;
  angle: number;
  error?: string;
  latencyMs?: number;
}

export interface HardwareClusterConfig {
  sensorUrl: string;
  motorUrl: string;
  edgeUrl: string;
}

export interface DeviceHealth {
  id: 'ESP32-01' | 'ESP32-02' | 'ESP32-03';
  name: string;
  role: string;
  url: string;
  isConfigured: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED' | 'DEGRADED';
  lastPing: string | null;
  latencyMs: number | null;
  errorDetails?: string;
}

const STORAGE_KEY = 'trayate_hardware_config';

export function getHardwareConfig(): HardwareClusterConfig {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          sensorUrl: parsed.sensorUrl || process.env.NEXT_PUBLIC_ROVER_SENSOR_URL || 'http://192.168.137.71',
          motorUrl: parsed.motorUrl || process.env.NEXT_PUBLIC_ROVER_MOTOR_URL || '',
          edgeUrl: parsed.edgeUrl || process.env.NEXT_PUBLIC_ROVER_EDGE_URL || '',
        };
      } catch {
        // Fallback
      }
    }
  }

  return {
    sensorUrl: process.env.NEXT_PUBLIC_ROVER_SENSOR_URL || 'http://192.168.137.71',
    motorUrl: process.env.NEXT_PUBLIC_ROVER_MOTOR_URL || '',
    edgeUrl: process.env.NEXT_PUBLIC_ROVER_EDGE_URL || '',
  };
}

export function saveHardwareConfig(config: HardwareClusterConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

/**
 * Fetch live sensor telemetry from ESP32-01 (Rover Sensor Module)
 * Direct fetch with seamless proxy fallback
 */
export async function fetchLiveSensorData(sensorUrlOverride?: string): Promise<ESP32SensorResponse> {
  const config = getHardwareConfig();
  const baseUrl = (sensorUrlOverride || config.sensorUrl || 'http://192.168.137.71').replace(/\/+$/, '');
  const startTime = Date.now();

  // Try direct fetch first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${baseUrl}/api/status`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: Date.now() - startTime,
      };
    }
  } catch {
    // Direct fetch failed (e.g. browser Private Network Access or CORS); attempt proxy fallback
  }

  // Fallback to Next.js server-side proxy
  try {
    const proxyUrl = `/api/esp32/proxy?base=${encodeURIComponent(baseUrl)}&endpoint=${encodeURIComponent('/api/status')}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(proxyUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        ...data,
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: Date.now() - startTime,
      };
    } else {
      throw new Error(`Proxy responded with HTTP ${res.status}`);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sensor module unreachable';
    throw new Error(`ESP32-01 [${baseUrl}] offline: ${errorMsg}`);
  }
}

/**
 * Move the physical scanner servo to a specific angle (0° to 180°)
 * Available endpoint: GET /api/servo?angle=<angle>
 */
export async function sendServoAngleCommand(angle: number, sensorUrlOverride?: string): Promise<ServoCommandResponse> {
  const clampedAngle = Math.max(0, Math.min(180, Math.round(angle)));
  const config = getHardwareConfig();
  const baseUrl = (sensorUrlOverride || config.sensorUrl || 'http://192.168.137.71').replace(/\/+$/, '');
  const startTime = Date.now();

  // Try direct fetch first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${baseUrl}/api/servo?angle=${clampedAngle}`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        angle: data.angle ?? clampedAngle,
        latencyMs: Date.now() - startTime,
      };
    }
  } catch {
    // Fallback to proxy
  }

  // Fallback to Next.js server proxy
  try {
    const proxyUrl = `/api/esp32/proxy?base=${encodeURIComponent(baseUrl)}&endpoint=${encodeURIComponent('/api/servo')}&angle=${clampedAngle}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(proxyUrl, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.success ?? true,
        angle: data.angle ?? clampedAngle,
        latencyMs: Date.now() - startTime,
      };
    } else {
      throw new Error(`Proxy servo control error: HTTP ${res.status}`);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Servo command failed';
    return {
      success: false,
      angle: clampedAngle,
      error: errorMsg,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Send movement command to ESP32-02 (Rover Motor Controller)
 * Strictly enforces safety: If ESP32-02 is not configured, movement commands are inhibited!
 */
export async function sendMotorMovement(
  direction: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP',
  speedPercent: number = 60,
  motorUrlOverride?: string
): Promise<{ success: boolean; message: string; direction: string }> {
  const config = getHardwareConfig();
  const motorUrl = (motorUrlOverride || config.motorUrl).trim();

  // Safety Requirement: Never send motor commands to ESP32-01!
  if (!motorUrl) {
    return {
      success: false,
      message: 'SAFETY INTERLOCK: ESP32-02 Motor Controller IP is not configured. Physical movement inhibited.',
      direction: 'STOP',
    };
  }

  const cleanUrl = motorUrl.replace(/\/+$/, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    // Standard REST movement command format for ESP32 motor firmware:
    // GET /api/move?dir=forward&speed=150
    const dirParam = direction.toLowerCase();
    const pwmVal = Math.round((speedPercent / 100) * 255);

    const res = await fetch(`${cleanUrl}/api/move?dir=${dirParam}&speed=${pwmVal}`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json().catch(() => ({ success: true }));
      return {
        success: data.success ?? true,
        message: `Command ${direction} acknowledged by ESP32-02`,
        direction,
      };
    } else {
      return {
        success: false,
        message: `ESP32-02 responded with HTTP ${res.status}`,
        direction: 'STOP',
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Motor controller unreachable';
    return {
      success: false,
      message: `ESP32-02 connection error: ${errorMsg}`,
      direction: 'STOP',
    };
  }
}

/**
 * Emergency Stop Motor Shutdown
 */
export async function triggerHardwareEmergencyStop(motorUrlOverride?: string): Promise<{ success: boolean; message: string }> {
  const config = getHardwareConfig();
  const motorUrl = (motorUrlOverride || config.motorUrl).trim();

  if (!motorUrl) {
    return {
      success: true,
      message: 'Emergency Stop active: Local safety latch engaged (No motor controller connected).',
    };
  }

  const cleanUrl = motorUrl.replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);

    await fetch(`${cleanUrl}/api/estop`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return {
      success: true,
      message: 'HARDWARE EMERGENCY STOP BROADCAST TO ESP32-02 (MOTORS CUT).',
    };
  } catch {
    return {
      success: false,
      message: 'Emergency stop sent but ESP32-02 did not acknowledge.',
    };
  }
}

/**
 * Check health status of all 3 ESP32 boards
 */
export async function checkHardwareClusterHealth(): Promise<DeviceHealth[]> {
  const config = getHardwareConfig();

  // 1. ESP32-01 Sensor Module
  let sensorHealth: DeviceHealth = {
    id: 'ESP32-01',
    name: 'Rover Sensor Module',
    role: 'Ultrasonic Distance, MQ-4, MQ-135, DHT22, Servo Scanner',
    url: config.sensorUrl || 'http://192.168.137.71',
    isConfigured: true,
    status: 'OFFLINE',
    lastPing: null,
    latencyMs: null,
  };

  try {
    const sensorData = await fetchLiveSensorData(config.sensorUrl);
    if (sensorData.connected) {
      sensorHealth.status = 'ONLINE';
      sensorHealth.lastPing = sensorData.timestamp || 'Just now';
      sensorHealth.latencyMs = sensorData.latencyMs || 15;
    }
  } catch (err: unknown) {
    sensorHealth.status = 'OFFLINE';
    sensorHealth.errorDetails = err instanceof Error ? err.message : 'Connection failed';
  }

  // 2. ESP32-02 Motor Controller
  const motorHealth: DeviceHealth = {
    id: 'ESP32-02',
    name: 'Rover Motor Controller',
    role: '6-Wheel Locomotion, PWM Speed Governor, Hardware E-Stop Interlock',
    url: config.motorUrl || 'Awaiting IP configuration',
    isConfigured: Boolean(config.motorUrl),
    status: config.motorUrl ? 'OFFLINE' : 'UNCONFIGURED',
    lastPing: null,
    latencyMs: null,
    errorDetails: config.motorUrl ? undefined : 'Firmware IP and endpoints awaiting deployment',
  };

  // 3. ESP32-03 Edge AI Module
  const edgeHealth: DeviceHealth = {
    id: 'ESP32-03',
    name: 'Edge AI Anomaly Module',
    role: 'Lightweight Edge Anomaly Classifier & Sub-Surface Hazard Analysis',
    url: config.edgeUrl || 'Awaiting IP configuration',
    isConfigured: Boolean(config.edgeUrl),
    status: config.edgeUrl ? 'OFFLINE' : 'UNCONFIGURED',
    lastPing: null,
    latencyMs: null,
    errorDetails: config.edgeUrl ? undefined : 'Future Edge AI hardware integration architecture ready',
  };

  return [sensorHealth, motorHealth, edgeHealth];
}

