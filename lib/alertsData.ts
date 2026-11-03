export interface AlertItem {
  id: string;
  category: 
    | 'Gas Concentration Warning'
    | 'Critical Gas Level'
    | 'High Temperature'
    | 'Fire Detection'
    | 'Human Detection'
    | 'Dust Concentration Warning'
    | 'Device Disconnection'
    | 'Communication Failure'
    | 'Low Battery';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  sourceDevice: string;
  sensorInfo: string;
  currentValue: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  location: string;
  description: string;
}

export const initialAlerts: AlertItem[] = [
  {
    id: 'ALT-1084',
    category: 'Human Detection',
    severity: 'info',
    timestamp: '2 mins ago (14:04:12)',
    sourceDevice: 'ESP32-03 (Vision Module)',
    sensorInfo: 'Edge YOLOv8 Bio-Thermal Lock',
    currentValue: '98.4% Confidence',
    acknowledged: false,
    location: 'Shaft-B // Section 4-C (-428m)',
    description: 'Human thermal signature acquired along north collapsed timbering. No movement observed.',
  },
  {
    id: 'ALT-1083',
    category: 'Dust Concentration Warning',
    severity: 'warning',
    timestamp: '14 mins ago (13:52:00)',
    sourceDevice: 'ESP32-04 (DustCleaner)',
    sensorInfo: 'PMS5003 Optical Dust Counter',
    currentValue: '184 µg/m³ PM10',
    acknowledged: true,
    acknowledgedBy: 'Safety Officer Dave M.',
    location: 'Conveyor Junction West',
    description: 'Elevated airborne coal aerosol detected. DustCleaner automated filtration triggered.',
  },
  {
    id: 'ALT-1082',
    category: 'Gas Concentration Warning',
    severity: 'warning',
    timestamp: '38 mins ago (13:28:44)',
    sourceDevice: 'ESP32-02 (Gas Array)',
    sensorInfo: 'MQ-4 Methane Sensor',
    currentValue: '0.45% VOL (LEL Caution)',
    acknowledged: true,
    acknowledgedBy: 'HQ Operator 04',
    location: 'Sub-surface Drift 12',
    description: 'Transient localized pocket of methane detected. Dissipated following ventilation flow.',
  },
  {
    id: 'ALT-1081',
    category: 'Communication Failure',
    severity: 'critical',
    timestamp: '1 hr 12 mins ago',
    sourceDevice: 'Sub-1GHz Repeater Node 03',
    sensorInfo: 'Mesh RF Ping Test',
    currentValue: 'Packet Loss: 82%',
    acknowledged: true,
    acknowledgedBy: 'HQ Operator 04',
    location: 'Shaft-A Entrance Portal',
    description: 'Temporary RF multipath fading during seismic tremor. Auto-failed over to Wi-Fi fallback.',
  },
];

