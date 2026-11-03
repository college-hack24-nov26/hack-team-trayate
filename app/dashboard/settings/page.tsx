'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Radio, 
  Database, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Code2
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  testSupabaseConnection, 
  isSupabaseConfigured 
} from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [mqttUrl, setMqttUrl] = useState('wss://telemetry.trayate.systems/mqtt');
  const [mqttPort, setMqttPort] = useState('8883');
  
  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  
  // Safety thresholds
  const [ch4Warning, setCh4Warning] = useState('0.80');
  const [ch4Critical, setCh4Critical] = useState('1.00');
  const [coLimit, setCoLimit] = useState('25');
  
  // Status states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.url && !creds.url.includes('demo-trayate')) {
      setSupabaseUrl(creds.url);
    }
    if (creds.anonKey && !creds.anonKey.includes('placeholder')) {
      setSupabaseAnonKey(creds.anonKey);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      if (supabaseUrl.trim()) {
        localStorage.setItem('trayate_supabase_url', supabaseUrl.trim());
      }
      if (supabaseAnonKey.trim()) {
        localStorage.setItem('trayate_supabase_anon_key', supabaseAnonKey.trim());
      }
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseStatus(null);
    try {
      // Temporarily store in localStorage so test uses input values
      if (typeof window !== 'undefined') {
        localStorage.setItem('trayate_supabase_url', supabaseUrl.trim());
        localStorage.setItem('trayate_supabase_anon_key', supabaseAnonKey.trim());
      }
      const res = await testSupabaseConnection();
      setSupabaseStatus({ connected: res.connected, message: res.message });
    } finally {
      setTestingSupabase(false);
    }
  };

  const sqlSchemaSnippet = `-- Run this in your Supabase SQL Editor:
create table if not exists public.missions (
    id text primary key,
    name text not null,
    status text not null default 'ACTIVE',
    start_time timestamptz not null default now(),
    created_at timestamptz not null default now()
);

insert into public.missions (id, name, status)
values ('TR-MIS-2026-084', 'Sector 4 Sub-Drift Reconnaissance', 'ACTIVE')
on conflict (id) do nothing;

create table if not exists public.telemetry_logs (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id),
    device_id text not null default 'ESP32-01',
    distance numeric,
    distance_status text,
    servo_angle integer default 90,
    mq4_raw integer,
    mq135_raw integer,
    temperature numeric,
    humidity numeric,
    speed numeric default 0.0,
    movement_direction text default 'STOP',
    battery_voltage numeric default 24.8,
    battery_percent integer default 94
);

create table if not exists public.human_detections (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id),
    count integer not null default 1,
    confidence numeric not null,
    nearest_distance numeric,
    message text,
    acknowledged boolean not null default false
);

create table if not exists public.mission_alerts (
    id text primary key,
    created_at timestamptz not null default now(),
    mission_id text references public.missions(id),
    severity text not null check (severity in ('CRITICAL', 'WARNING', 'INFO')),
    title text not null,
    description text,
    acknowledged boolean not null default false
);

alter table public.missions enable row level security;
alter table public.telemetry_logs enable row level security;
alter table public.human_detections enable row level security;
alter table public.mission_alerts enable row level security;

create policy "Allow anon all missions" on public.missions for all using (true);
create policy "Allow anon all telemetry" on public.telemetry_logs for all using (true);
create policy "Allow anon all detections" on public.human_detections for all using (true);
create policy "Allow anon all alerts" on public.mission_alerts for all using (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Top Banner */}
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-sans text-xl font-bold text-brand-primaryText">Platform Settings & Backend Configuration</h2>
        <p className="text-xs text-brand-secondaryText mt-0.5">
          Configure Supabase Cloud Database credentials, MQTT broker parameters, and safety limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: SUPABASE REALTIME CONFIGURATION */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-border gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-success">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-sm sm:text-base font-semibold text-brand-primaryText">
                  Supabase Cloud Database & Storage
                </h3>
                <p className="text-xs text-brand-secondaryText">
                  Timeseries telemetry indexing, survivor detections, and incident logs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-elevated border border-brand-border text-brand-secondaryText hover:text-brand-primaryText text-xs font-medium transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-brand-accent" />
                <span>{showSqlGuide ? 'Hide SQL Script' : 'View SQL Schema'}</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-elevated border border-brand-border text-brand-secondaryText hover:text-brand-primaryText text-xs font-medium transition-colors"
              >
                <span>Supabase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SQL Schema Script Viewer */}
          {showSqlGuide && (
            <div className="p-4 rounded-xl bg-brand-secondary border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-primaryText block">
                    Copy-Paste SQL Schema Migration
                  </span>
                  <span className="text-[11px] text-brand-secondaryText">
                    Paste this into your Supabase Dashboard → <strong>SQL Editor</strong> and click <strong>Run</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent text-brand-bg text-xs font-semibold hover:bg-brand-accent-hover transition-colors shadow-xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-lg bg-brand-bg border border-brand-border text-[11px] font-mono text-brand-primaryText/90 overflow-x-auto max-h-56">
                {sqlSchemaSnippet}
              </pre>
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
              <span className="text-[11px] text-brand-secondaryText">
                Found in your Supabase project under <strong>Project Settings → API → Project URL</strong>.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">
                Public Anon Key (Client-Safe)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
              <span className="text-[11px] text-brand-secondaryText">
                Found under <strong>Project Settings → API → Project API Keys (anon public)</strong>.
              </span>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={testingSupabase || !supabaseUrl.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-secondary hover:bg-brand-elevated border border-brand-border text-xs font-medium text-brand-primaryText transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin text-brand-accent' : ''}`} />
              <span>{testingSupabase ? 'Testing Connection...' : 'Test Supabase Connection'}</span>
            </button>

            {supabaseStatus && (
              <div className={`p-2 px-3 rounded-lg border text-xs flex items-center gap-2 ${
                supabaseStatus.connected 
                  ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' 
                  : 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{supabaseStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: MQTT BROKER CONFIGURATION */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border">
            <div className="w-8 h-8 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm sm:text-base font-semibold text-brand-primaryText">
                MQTT WebSocket Gateway
              </h3>
              <p className="text-xs text-brand-secondaryText">
                Sub-gigahertz mesh telemetry transport bridge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">Broker WebSocket Endpoint</label>
              <input
                type="text"
                value={mqttUrl}
                onChange={(e) => setMqttUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">Port / TLS</label>
              <input
                type="text"
                value={mqttPort}
                onChange={(e) => setMqttPort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ATMOSPHERIC SAFETY THRESHOLDS */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border">
            <div className="w-8 h-8 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-warning">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm sm:text-base font-semibold text-brand-primaryText">
                Atmospheric Safety Thresholds
              </h3>
              <p className="text-xs text-brand-secondaryText">
                Autonomous interlock triggers for hazardous underground environments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">CH4 Warning (% Vol)</label>
              <input
                type="text"
                value={ch4Warning}
                onChange={(e) => setCh4Warning(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">CH4 Critical E-Stop (% Vol)</label>
              <input
                type="text"
                value={ch4Critical}
                onChange={(e) => setCh4Critical(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-brand-secondaryText font-medium block">CO NIOSH Ceiling (PPM)</label>
              <input
                type="text"
                value={coLimit}
                onChange={(e) => setCoLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-brand-secondary border border-brand-border text-brand-primaryText font-mono focus:border-brand-accent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-xs text-brand-success flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-sans font-bold text-xs shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
