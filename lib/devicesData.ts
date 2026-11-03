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
    name: 'Main Mobility & Safety Controller',
    role: 'Locomotion, 6-Wheel PID, E-Stop Interlock & Sub-1GHz Mesh',
    status: 'ONLINE',
    ipAddress: '192.168.4.101',
    macAddress: '24:0A:C4:58:1A:01',
    mqttTopic: 'trayate/rover01/control',
    firmwareVersion: 'v4.8.2-rtos',
    lastHeartbeat: '1s ago',
    lastDataReceived: '12ms ago',
    cpuLoadPercent: 18,
    freeHeapKb: 184,
    voltage: 3.32,
    subsystems: ['6x Hub Inverters', 'Hardware E-Stop Relay', 'IMU 6-DOF', 'Sub-1GHz RF'],
  },
  {
    id: 'ESP32-02',
    name: 'Atmospheric Sensor Array Hub',
    role: 'Multi-Gas Sampling (CH4, CO, CO2, O2) & Environmental Telemetry',
    status: 'ONLINE',
    ipAddress: '192.168.4.102',
    macAddress: '24:0A:C4:58:1A:02',
    mqttTopic: 'trayate/rover01/sensors',
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
    name: 'Vision & Thermal Camera Streamer',
    role: 'HD Optical Turret, Thermal Infrared Sensor & Pan/Tilt Servos',
    status: 'ONLINE',
    ipAddress: '192.168.4.103',
    macAddress: '24:0A:C4:58:1A:03',
    mqttTopic: 'trayate/rover01/vision',
    firmwareVersion: 'v4.8.0-cam',
    lastHeartbeat: '2s ago',
    lastDataReceived: '32ms ago',
    cpuLoadPercent: 44,
    freeHeapKb: 98,
    voltage: 3.28,
    subsystems: ['OV5640 1080p Optical', 'MLX90640 Thermal Grid (32x24)', 'Pan/Tilt Gimbal'],
  },
  {
    id: 'ESP32-04',
    name: 'DustCleaner Filtration Controller',
    role: 'PM2.5/PM10 Monitoring, High-RPM Cyclonic Blower & Automated Purge',
    status: 'ONLINE',
    ipAddress: '192.168.4.104',
    macAddress: '24:0A:C4:58:1A:04',
    mqttTopic: 'trayate/rover01/dustcleaner',
    firmwareVersion: 'v4.8.1-dust',
    lastHeartbeat: '3s ago',
    lastDataReceived: '120ms ago',
    cpuLoadPercent: 21,
    freeHeapKb: 172,
    voltage: 3.31,
    subsystems: ['Plantower PMS5003 Dust Sensor', 'Brushless Blower ESC', 'Differential Pressure Trap'],
  },
];

