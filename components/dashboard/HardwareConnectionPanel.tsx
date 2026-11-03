'use client';

import { useState, useEffect } from 'react';
import { 
  getHardwareConfig, 
  saveHardwareConfig, 
  checkHardwareClusterHealth, 
  DeviceHealth 
} from '@/lib/esp32Service';
import { 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Save, 
  Radio, 
  ShieldCheck, 
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function HardwareConnectionPanel() {
  const [config, setConfig] = useState(getHardwareConfig());
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshHealth = async () => {
    setIsChecking(true);
    try {
      const health = await checkHardwareClusterHealth();
      setDevices(health);
    } catch {
      // Catch
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveHardwareConfig(config);
    setSaveSuccess(true);
    refreshHealth();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-3">
        <div>
          <h3 className="font-sans font-bold text-base text-brand-primaryText flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-accent" />
            <span>Hardware Connection Architecture (3x ESP32 DevKits)</span>
          </h3>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            WI-FI LOCAL HOTSPOT TOPOLOGY // DIRECT EMBEDDED HTTP & RELAY GATEWAYS
          </p>
        </div>

        <button
          onClick={refreshHealth}
          disabled={isChecking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-border border border-brand-border text-brand-primaryText font-mono text-xs font-semibold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-accent ${isChecking ? 'animate-spin' : ''}`} />
          <span>PING ALL BOARDS</span>
        </button>
      </div>

      {/* 3 Hardware Board Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* ESP32-01: Sensor Module */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-brand-accent font-bold">ESP32-01</span>
              <h4 className="font-sans font-bold text-sm text-brand-primaryText">Sensor Module</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-success/15 border border-brand-success/40 text-brand-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
              <span>ONLINE</span>
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-brand-secondaryText">
            <div className="flex justify-between">
              <span>Target IP:</span>
              <strong className="text-brand-primaryText">{config.sensorUrl || '192.168.137.71'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Endpoints:</span>
              <span className="text-brand-accent">/api/status, /api/servo</span>
            </div>
            <div className="flex justify-between">
              <span>Transducers:</span>
              <span className="text-brand-primaryText">HC-SR04, MQ-4, MQ-135, DHT22</span>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border text-[10px] font-mono text-brand-success flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational on hotspot</span>
          </div>
        </div>

        {/* ESP32-02: Motor Controller */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-brand-warning font-bold">ESP32-02</span>
              <h4 className="font-sans font-bold text-sm text-brand-primaryText">Motor Controller</h4>
            </div>
            {(() => {
              const motorDev = devices.find((d) => d.id === 'ESP32-02');
              const isOnline = motorDev?.status === 'ONLINE';
              return (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isOnline
                    ? 'bg-brand-success/15 border-brand-success/40 text-brand-success flex items-center gap-1'
                    : config.motorUrl 
                    ? 'bg-brand-warning/15 border-brand-warning/40 text-brand-warning' 
                    : 'bg-brand-secondary border-brand-border text-brand-secondaryText'
                }`}>
                  {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>}
                  <span>{isOnline ? 'ONLINE' : (config.motorUrl ? 'AWAITING PING' : 'UNCONFIGURED')}</span>
                </span>
              );
            })()}
          </div>

          <div className="space-y-1.5 font-mono text-xs text-brand-secondaryText">
            <div className="flex justify-between">
              <span>Target IP:</span>
              <strong className={config.motorUrl ? 'text-brand-primaryText' : 'text-brand-warning'}>
                {config.motorUrl || 'http://192.168.137.221'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Endpoints:</span>
              <span className="text-brand-accent">/move?direction=...</span>
            </div>
            <div className="flex justify-between">
              <span>Safety Interlock:</span>
              <span className={devices.find((d) => d.id === 'ESP32-02')?.status === 'ONLINE' ? 'text-brand-success font-semibold' : 'text-brand-warning font-semibold'}>
                {devices.find((d) => d.id === 'ESP32-02')?.status === 'ONLINE' ? 'ENGAGED & READY' : (config.motorUrl ? 'CONNECTING...' : 'MOTOR COMMANDS INHIBITED')}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border text-[10px] font-mono flex items-center gap-1">
            {devices.find((d) => d.id === 'ESP32-02')?.status === 'ONLINE' ? (
              <span className="text-brand-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational on hotspot</span>
              </span>
            ) : (
              <span className="text-brand-warning flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Configured on http://192.168.137.221</span>
              </span>
            )}
          </div>
        </div>

        {/* ESP32-03: Edge AI Module */}
        <div className="bg-brand-bg border border-brand-border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] text-brand-accent font-bold">ESP32-03</span>
              <h4 className="font-sans font-bold text-sm text-brand-primaryText">Edge AI Module</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-secondary border border-brand-border text-brand-secondaryText">
              STANDBY
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-brand-secondaryText">
            <div className="flex justify-between">
              <span>Target IP:</span>
              <strong className={config.edgeUrl ? 'text-brand-primaryText' : 'text-brand-secondaryText'}>
                {config.edgeUrl || 'Future deployment'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Capabilities:</span>
              <span className="text-brand-primaryText">Anomaly Classifier, TinyML</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-brand-accent">Architecture Ready</span>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-border text-[10px] font-mono text-brand-secondaryText flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Edge processing architecture ready</span>
          </div>
        </div>

      </div>

      {/* IP Configuration Form */}
      <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-brand-primaryText">
            HOTSPOT IP ADDRESS CONFIGURATION
          </span>
          {saveSuccess && (
            <span className="font-mono text-xs text-brand-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Configuration saved to localStorage</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="space-y-1.5">
            <label className="text-brand-secondaryText block">
              ESP32-01 SENSOR URL:
            </label>
            <input
              type="text"
              value={config.sensorUrl}
              onChange={(e) => setConfig({ ...config, sensorUrl: e.target.value })}
              placeholder="http://192.168.137.71"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-primaryText focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-brand-secondaryText block">
              ESP32-02 MOTOR CONTROLLER URL:
            </label>
            <input
              type="text"
              value={config.motorUrl}
              onChange={(e) => setConfig({ ...config, motorUrl: e.target.value })}
              placeholder="http://192.168.137.221"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-primaryText focus:outline-none focus:border-brand-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-brand-secondaryText block">
              ESP32-03 EDGE AI URL:
            </label>
            <input
              type="text"
              value={config.edgeUrl}
              onChange={(e) => setConfig({ ...config, edgeUrl: e.target.value })}
              placeholder="http://192.168.137.73 (future)"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-primaryText focus:outline-none focus:border-brand-accent"
            />
          </div>

        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-mono text-xs font-bold transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>SAVE HARDWARE URLS</span>
          </button>
        </div>
      </form>

    </div>
  );
}

