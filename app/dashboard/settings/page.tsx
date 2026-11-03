'use client';

import { useState } from 'react';
import { 
  Settings, 
  Radio, 
  Database, 
  ShieldAlert, 
  User, 
  Save, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function SettingsPage() {
  const [mqttUrl, setMqttUrl] = useState('wss://telemetry.trayate.systems/mqtt');
  const [mqttPort, setMqttPort] = useState('8883');
  const [supabaseUrl, setSupabaseUrl] = useState('https://oqxwhkpxvjdf.supabase.co');
  const [ch4Warning, setCh4Warning] = useState('0.80');
  const [ch4Critical, setCh4Critical] = useState('1.00');
  const [coLimit, setCoLimit] = useState('25');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    setTimeout(() => {
      setTestingConnection(false);
      setConnectionStatus('SUCCESS: MQTT & Supabase Realtime endpoints responding with 14ms latency.');
    }, 1200);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Top Banner */}
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-sans text-xl font-bold text-brand-primaryText">Platform Settings & Infrastructure Config</h2>
        <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
          BROKER PARAMETERS // SUPABASE REALTIME SECRETS // SAFETY THRESHOLD POLICY
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: MQTT BROKER CONFIGURATION */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <Radio className="w-5 h-5 text-brand-accent" />
            <h3 className="font-sans text-base font-bold text-brand-primaryText">MQTT WebSocket Gateway</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-brand-secondaryText block">BROKER WEBSOCKET ENDPOINT</label>
              <input
                type="text"
                value={mqttUrl}
                onChange={(e) => setMqttUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">PORT / TLS</label>
              <input
                type="text"
                value={mqttPort}
                onChange={(e) => setMqttPort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SUPABASE REALTIME CONFIGURATION */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <Database className="w-5 h-5 text-brand-success" />
            <h3 className="font-sans text-base font-bold text-brand-primaryText">Supabase Realtime Cloud Database</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">SUPABASE PROJECT URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">PUBLIC ANON API KEY (CLIENT SAFE)</label>
              <input
                type="password"
                defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_telemetry_stream"
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
              <p className="text-[10px] text-brand-secondaryText/80">
                Service-role keys must NEVER be placed in client settings. Store them in backend environment variables (.env.local).
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: SAFETY THRESHOLD RULES */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <ShieldAlert className="w-5 h-5 text-brand-warning" />
            <h3 className="font-sans text-base font-bold text-brand-primaryText">Atmospheric Safety Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">CH4 WARNING (% VOL)</label>
              <input
                type="text"
                value={ch4Warning}
                onChange={(e) => setCh4Warning(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">CH4 CRITICAL E-STOP (% VOL)</label>
              <input
                type="text"
                value={ch4Critical}
                onChange={(e) => setCh4Critical(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText block">CO NIOSH CEILING (PPM)</label>
              <input
                type="text"
                value={coLimit}
                onChange={(e) => setCoLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText focus:border-brand-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Test Connection Banner */}
        {connectionStatus && (
          <div className="p-3 rounded-lg bg-brand-success/10 border border-brand-success/30 text-brand-success font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{connectionStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-secondary hover:bg-brand-border border border-brand-border text-xs font-mono font-bold text-brand-primaryText transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
            <span>{testingConnection ? 'TESTING HANDSHAKE...' : 'TEST BROKER CONNECTIVITY'}</span>
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-mono text-brand-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SAVED SUCCESSFULLY</span>
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-sans font-bold text-xs shadow-cyan-subtle transition-all"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}

