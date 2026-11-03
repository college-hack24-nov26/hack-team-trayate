export interface ESP32Device {
  id: string;
  name: string;
  role: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  ipAddress: string;
  macAddress: string;
  mqttTopic: string;
  firmwareVersion: string;
  lastHeartbeat: string;
  lastDataReceived: string;
  cpuLoadPercent: number;
  freeHeapKb: number;
  voltage: number;
  subsystems: string[];
}

export const initialDevices: ESP32Device[] = [
  {
    id: 'ESP32-01',
    name: 'Main Rover Controller (Mobility & Safety)',
    role: 'Locomotion, 4-Wheel Drive PID, E-Stop Interlock & Sub-1GHz Mesh',
    status: 'ONLINE',
    ipAddress: '192.168.4.101',
    macAddress: '24:0A:C4:58:1A:01',
    mqttTopic: 'trayate/rover/main/telemetry',
    firmwareVersion: 'v4.8.2-rtos',
    lastHeartbeat: '1s ago',
    lastDataReceived: '12ms ago',
    cpuLoadPercent: 18,
    freeHeapKb: 184,
    voltage: 3.32,
    subsystems: ['4x Hub Inverters', 'Hardware E-Stop Relay', 'IMU 6-DOF', 'Sub-1GHz RF'],
  },
  {
    id: 'ESP32-02',
    name: 'Environmental Sensor Module',
    role: 'Multi-Gas Sampling (CH4, CO, CO2, O2) & Environmental Telemetry',
    status: 'ONLINE',
    ipAddress: '192.168.4.102',
    macAddress: '24:0A:C4:58:1A:02',
    mqttTopic: 'trayate/rover/sensors/telemetry',
    firmwareVersion: 'v4.8.2-sensors',
    lastHeartbeat: '1s ago',
    lastDataReceived: '24ms ago',
    cpuLoadPercent: 26,
    freeHeapKb: 162,
    voltage: 3.30,
    subsystems: ['MQ-4 / MQ-7 NDIR', 'O2 Electrochemical', 'BME680 Temp/Humidity', 'Barometer'],
  },
  {
    id: 'ESP32-03',
    name: 'Camera & Vision Module',
    role: 'HD Optical Stream Relay, Thermal Infrared Sensor & Pan/Tilt Servos',
    status: 'ONLINE',
    ipAddress: '192.168.4.103',
    macAddress: '24:0A:C4:58:1A:03',
    mqttTopic: 'trayate/rover/camera/status',
    firmwareVersion: 'v4.8.0-cam',
    lastHeartbeat: '2s ago',
    lastDataReceived: '32ms ago',
    cpuLoadPercent: 44,
    freeHeapKb: 98,
    voltage: 3.28,
    subsystems: ['IP Webcam Android Bridge', 'MLX90640 Thermal Grid (32x24)', 'Pan/Tilt Gimbal'],
  },
];
