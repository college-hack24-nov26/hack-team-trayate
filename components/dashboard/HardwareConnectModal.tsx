'use client';

import { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  X, 
  Radio, 
  Flame, 
  Ruler, 
  Thermometer, 
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';
import { 
  getHardwareConfig, 
  saveHardwareConfig, 
  pingEsp32Target, 
  normalizeEspUrl,
  PingEspResult 
} from '@/lib/esp32Service';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';

interface HardwareConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HardwareConnectModal({ isOpen, onClose }: HardwareConnectModalProps) {
  const { telemetry, updateHardwareIps } = useTelemetry();
  
  const [sensorIp, setSensorIp] = useState('');
  const [motorIp, setMotorIp] = useState('');
  
  // Test states
  const [isTestingSensor, setIsTestingSensor] = useState(false);
  const [sensorTestResult, setSensorTestResult] = useState<PingEspResult | null>(null);
  
  const [isTestingMotor, setIsTestingMotor] = useState(false);
  const [motorTestResult, setMotorTestResult] = useState<PingEspResult | null>(null);
  
  const [detectedHostIps, setDetectedHostIps] = useState<{ name: string; ip: string; type: string }[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync inputs from currently saved config when modal opens
  useEffect(() => {
    if (isOpen) {
      const cfg = getHardwareConfig();
      setSensorIp(cfg.sensorUrl.replace(/^https?:\/\//, ''));
      setMotorIp(cfg.motorUrl.replace(/^https?:\/\//, ''));
      setSensorTestResult(null);
      setMotorTestResult(null);
      setSaveSuccess(false);

      // Probe host network interfaces to guide operator
      pingEsp32Target(cfg.sensorUrl || '192.168.137.71', 'sensor').then((res) => {
        if (res.hostIps && res.hostIps.length > 0) {
          setDetectedHostIps(res.hostIps);
        }
      });
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestSensor = async () => {
    if (!sensorIp.trim()) return;
    setIsTestingSensor(true);
    setSensorTestResult(null);
    soundManager.playClickTone();
    try {
      const res = await pingEsp32Target(sensorIp, 'sensor');
      setSensorTestResult(res);
      if (res.hostIps) setDetectedHostIps(res.hostIps);
    } finally {
      setIsTestingSensor(false);
    }
  };

  const handleTestMotor = async () => {
    if (!motorIp.trim()) return;
    setIsTestingMotor(true);
    setMotorTestResult(null);
    soundManager.playClickTone();
    try {
      const res = await pingEsp32Target(motorIp, 'motor');
      setMotorTestResult(res);
      if (res.hostIps) setDetectedHostIps(res.hostIps);
    } finally {
      setIsTestingMotor(false);
    }
  };

  const handleSaveAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClickTone();
    
    const cleanSensor = normalizeEspUrl(sensorIp);
    const cleanMotor = normalizeEspUrl(motorIp);

    updateHardwareIps(cleanSensor, cleanMotor);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const fillSubnetTemplate = (basePrefix: string) => {
    soundManager.playClickTone();
    if (!sensorIp || sensorIp.includes('192.168.')) {
      setSensorIp(`${basePrefix}.71`);
    }
    if (!motorIp || motorIp.includes('192.168.')) {
      setMotorIp(`${basePrefix}.221`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-brand-secondary border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">
                Configure Physical ESP32 Hardware IPs
              </h3>
              <p className="text-xs text-brand-secondaryText">
                Connect your rover without hardcoded IPs when DHCP or Wi-Fi networks change.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-bg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveAndConnect} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Host Computer Network Discovery Info */}
          {detectedHostIps.length > 0 && (
            <div className="p-3.5 rounded-xl bg-brand-bg/70 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-brand-primaryText flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Your Computer Local Networks:</span>
                </span>
                <div className="flex flex-wrap gap-2 text-[11px] text-brand-secondaryText font-mono pt-1">
                  {detectedHostIps.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">
                      {h.type}: <strong className="text-brand-accent">{h.ip}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Subnet Auto-Fill Helpers */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-brand-secondaryText">Quick fill:</span>
                {detectedHostIps.some((h) => h.ip.startsWith('192.168.137.')) && (
                  <button
                    type="button"
                    onClick={() => fillSubnetTemplate('192.168.137')}
                    className="px-2 py-1 rounded bg-brand-secondary hover:bg-brand-card border border-brand-border text-brand-accent text-[11px] font-mono transition-colors"
                  >
                    192.168.137.x
                  </button>
                )}
                {detectedHostIps.some((h) => h.ip.startsWith('192.168.2.')) && (
                  <button
                    type="button"
                    onClick={() => fillSubnetTemplate('192.168.2')}
                    className="px-2 py-1 rounded bg-brand-secondary hover:bg-brand-card border border-brand-border text-brand-accent text-[11px] font-mono transition-colors"
                  >
                    192.168.2.x
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. ESP32-01: Sensor Module Card */}
          <div className="p-4 rounded-xl bg-brand-secondary/40 border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-accent"></div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-brand-primaryText">
                    ESP32-01: Sensor Suite Module
                  </h4>
                  <p className="text-[11px] text-brand-secondaryText">
                    Transducers: Ultrasonic Radar, MQ-4, MQ-135, DHT22, Servo Scanner
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                telemetry.physicalHardware.esp32_01_connected
                  ? 'bg-brand-success/15 border-brand-success/40 text-brand-success'
                  : 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  telemetry.physicalHardware.esp32_01_connected ? 'bg-brand-success animate-pulse' : 'bg-brand-warning'
                }`}></span>
                <span>{telemetry.physicalHardware.esp32_01_connected ? 'Online' : 'Offline'}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-brand-secondaryText select-none pointer-events-none">
                  http://
                </span>
                <input
                  type="text"
                  value={sensorIp}
                  onChange={(e) => setSensorIp(e.target.value)}
                  placeholder="192.168.137.71 or your-esp-ip"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-14 pr-3 py-2 text-xs font-mono text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSensor}
                disabled={isTestingSensor || !sensorIp.trim()}
                className="px-3.5 py-2 rounded-lg bg-brand-card hover:bg-brand-secondary border border-brand-border text-brand-primaryText text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-accent ${isTestingSensor ? 'animate-spin' : ''}`} />
                <span>{isTestingSensor ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Live Sensor Test Result Feedback */}
            {sensorTestResult && (
              <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                sensorTestResult.ok 
                  ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' 
                  : 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning'
              }`}>
                {sensorTestResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <span className="font-semibold">{sensorTestResult.message}</span>
                  {sensorTestResult.payload && typeof sensorTestResult.payload === 'object' && (
                    <div className="text-[11px] text-brand-primaryText/90 flex flex-wrap gap-2 pt-1 font-mono">
                      <span>Dist: {sensorTestResult.payload.distance ?? '--'}cm</span>
                      <span>•</span>
                      <span>Temp: {sensorTestResult.payload.temperature ?? '--'}°C</span>
                      <span>•</span>
                      <span>MQ-4: {sensorTestResult.payload.mq4_raw ?? '--'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. ESP32-02: Motor Controller Card */}
          <div className="p-4 rounded-xl bg-brand-secondary/40 border border-brand-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-warning"></div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-brand-primaryText">
                    ESP32-02: Rover Locomotion & Motor Controller
                  </h4>
                  <p className="text-[11px] text-brand-secondaryText">
                    Controls: 4WD Locomotion, PWM Governor, Hardware E-Stop Interlock (/move)
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                motorIp ? 'bg-brand-accent/15 border-brand-accent/40 text-brand-accent' : 'bg-brand-bg border-brand-border text-brand-secondaryText'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                <span>{motorIp ? 'Configured' : 'Unconfigured'}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-mono text-brand-secondaryText select-none pointer-events-none">
                  http://
                </span>
                <input
                  type="text"
                  value={motorIp}
                  onChange={(e) => setMotorIp(e.target.value)}
                  placeholder="192.168.137.221 or your-esp-ip"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-14 pr-3 py-2 text-xs font-mono text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleTestMotor}
                disabled={isTestingMotor || !motorIp.trim()}
                className="px-3.5 py-2 rounded-lg bg-brand-card hover:bg-brand-secondary border border-brand-border text-brand-primaryText text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-accent ${isTestingMotor ? 'animate-spin' : ''}`} />
                <span>{isTestingMotor ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Live Motor Test Result Feedback */}
            {motorTestResult && (
              <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                motorTestResult.ok 
                  ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' 
                  : 'bg-brand-warning/10 border-brand-warning/30 text-brand-warning'
              }`}>
                {motorTestResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{motorTestResult.message}</span>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-brand-border">
            <span className="text-xs text-brand-secondaryText">
              IPs are saved to browser storage and apply across all pages.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-brand-bg hover:bg-brand-secondary border border-brand-border text-brand-secondaryText hover:text-brand-primaryText text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saveSuccess}
                className="px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-75"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Connected!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
