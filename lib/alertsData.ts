export interface AlertItem {
  id: string;
  category: 
    | 'Human detected'
    | 'High gas concentration'
    | 'High temperature'
    | 'Fire detected'
    | 'Smoke detected'
    | 'Obstacle proximity warning'
    | 'Low battery'
    | 'ESP32 disconnected'
    | 'MQTT connection failure'
    | 'Rover communication failure';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  isoDate: string;
  sourceDevice: string;
  sensorInfo: string;
  currentValue: string;
  missionId: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  location: string;
  description: string;
}

export const initialAlerts: AlertItem[] = [
  {
    id: 'ALT-1084',
    category: 'Human detected',
    severity: 'info',
    timestamp: '2 mins ago (14:04:12)',
    isoDate: '2026-11-03T14:04:12Z',
    sourceDevice: 'ESP32-03 (Vision Module)',
    sensorInfo: 'Edge YOLOv8 Bio-Thermal Lock',
    currentValue: '98.4% Confidence',
    missionId: 'TR-MIS-2026-084',
    acknowledged: false,
    location: 'Shaft-B // Section 4-C (-428m)',
    description: 'Human thermal silhouette identified near collapsed timbering. No movement observed.',
  },
  {
    id: 'ALT-1083',
    category: 'Obstacle proximity warning',
    severity: 'warning',
    timestamp: '14 mins ago (13:52:00)',
    isoDate: '2026-11-03T13:52:00Z',
    sourceDevice: 'ESP32-01 (Ultrasonic Sensor)',
    sensorInfo: 'HC-SR04 Ranging Transducer',
    currentValue: '14.2 cm Clearance',
    missionId: 'TR-MIS-2026-084',
    acknowledged: true,
    acknowledgedBy: 'Safety Officer Dave M.',
    acknowledgedAt: '13:54:10',
    location: 'Conveyor Junction West',
    description: 'Rubble obstruction detected ahead within 15cm deadband. Rover slow-crawl governor engaged.',
  },
  {
    id: 'ALT-1082',
    category: 'High gas concentration',
    severity: 'warning',
    timestamp: '38 mins ago (13:28:44)',
    isoDate: '2026-11-03T13:28:44Z',
    sourceDevice: 'ESP32-02 (Gas Transducers)',
    sensorInfo: 'MQ-4 Methane Sensor',
    currentValue: '0.45% VOL (LEL Caution)',
    missionId: 'TR-MIS-2026-084',
    acknowledged: true,
    acknowledgedBy: 'HQ Operator 04',
    acknowledgedAt: '13:30:15',
    location: 'Sub-surface Drift 12',
    description: 'Transient localized pocket of methane detected. Dissipated following continuous blower exhaust.',
  },
  {
    id: 'ALT-1081',
    category: 'Rover communication failure',
    severity: 'critical',
    timestamp: '1 hr 12 mins ago (12:54:10)',
    isoDate: '2026-11-03T12:54:10Z',
    sourceDevice: 'ESP32-01 (Locomotion)',
    sensorInfo: 'Mesh RF Ping Test',
    currentValue: 'Packet Loss: 82%',
    missionId: 'TR-MIS-2026-084',
    acknowledged: true,
    acknowledgedBy: 'HQ Operator 04',
    acknowledgedAt: '12:55:02',
    location: 'Shaft-A Entrance Portal',
    description: 'Temporary RF multipath fading during seismic tremor. Auto-failed over to Wi-Fi mesh fallback.',
  },
  {
    id: 'ALT-1080',
    category: 'Fire detected',
    severity: 'critical',
    timestamp: '3 hrs ago (11:15:22)',
    isoDate: '2026-11-03T11:15:22Z',
    sourceDevice: 'ESP32-03 (Vision Module)',
    sensorInfo: 'FLIR Lepton 3.5 LWIR Core',
    currentValue: 'Thermal Spike 412°C',
    missionId: 'TR-MIS-2026-083',
    acknowledged: true,
    acknowledgedBy: 'Commander Elena Rostova',
    acknowledgedAt: '11:16:00',
    location: 'Crosscut 4 East Abandoned Stope',
    description: 'Spontaneous combustion smoldering hot spot localized behind rib wall. Fire suppression foam crew dispatched.',
  },
  {
    id: 'ALT-1079',
    category: 'Smoke detected',
    severity: 'warning',
    timestamp: '3 hrs 12 mins ago',
    isoDate: '2026-11-03T11:03:00Z',
    sourceDevice: 'ESP32-02 (Gas Transducers)',
    sensorInfo: 'MQ-2 Ionization Smoke Cell',
    currentValue: '280 PPM CO & Aerosol',
    missionId: 'TR-MIS-2026-083',
    acknowledged: true,
    acknowledgedBy: 'Commander Elena Rostova',
    acknowledgedAt: '11:04:10',
    location: 'Crosscut 4 East',
    description: 'Early ionization aerosol increase detected 12 minutes prior to open smolder lock.',
  },
  {
    id: 'ALT-1078',
    category: 'High temperature',
    severity: 'warning',
    timestamp: '5 hrs ago (09:20:11)',
    isoDate: '2026-11-03T09:20:11Z',
    sourceDevice: 'ESP32-02 (Environmental Transducers)',
    sensorInfo: 'Sensirion SHT31',
    currentValue: '38.4°C',
    missionId: 'TR-MIS-2026-083',
    acknowledged: true,
    acknowledgedBy: 'Operator 02',
    acknowledgedAt: '09:21:40',
    location: 'Sub-Drift South',
    description: 'Ambient drift temperature crossed 35°C threshold due to secondary auxiliary fan stoppage.',
  },
  {
    id: 'ALT-1077',
    category: 'Low battery',
    severity: 'warning',
    timestamp: 'Yesterday (18:40:00)',
    isoDate: '2026-11-02T18:40:00Z',
    sourceDevice: 'ESP32-01 (Locomotion)',
    sensorInfo: 'TI BQ76952 BMS Cell Monitor',
    currentValue: '21.4V (18% SOC)',
    missionId: 'TR-MIS-2026-082',
    acknowledged: true,
    acknowledgedBy: 'Operator 01',
    acknowledgedAt: '18:41:00',
    location: 'Main Haulage Return',
    description: 'Low battery threshold reached during long-distance exploratory crawl. Autonomous RTH dock initiated.',
  },
  {
    id: 'ALT-1076',
    category: 'ESP32 disconnected',
    severity: 'critical',
    timestamp: 'Yesterday (14:10:00)',
    isoDate: '2026-11-02T14:10:00Z',
    sourceDevice: 'ESP32-02 (Motor Controller)',
    sensorInfo: 'Heartbeat Watchdog Timeout',
    currentValue: '0 packets in 3000ms',
    missionId: 'TR-MIS-2026-082',
    acknowledged: true,
    acknowledgedBy: 'Hardware Tech S. Nair',
    acknowledgedAt: '14:12:30',
    location: 'Bench Testing Enclosure',
    description: 'CAN-bus connector loosened during high vibration cycle. Reseated and locked with IP67 screw ring.',
  },
  {
    id: 'ALT-1075',
    category: 'MQTT connection failure',
    severity: 'critical',
    timestamp: '01 Nov 2026 (08:00:15)',
    isoDate: '2026-11-01T08:00:15Z',
    sourceDevice: 'Central Broker Gateway',
    sensorInfo: 'EMQX Broker TCP Keepalive',
    currentValue: 'TCP Reset (ECONNRESET)',
    missionId: 'TR-MIS-2026-081',
    acknowledged: true,
    acknowledgedBy: 'DevOps Lead',
    acknowledgedAt: '08:02:00',
    location: 'Surface Server Shack',
    description: 'Primary fiber optic lightning surge arrester switched over to secondary microwave uplink.',
  },
];
