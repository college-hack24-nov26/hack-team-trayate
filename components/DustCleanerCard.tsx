'use client';

import { useState } from 'react';
import { Wind, Play, Square, Settings, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface DustCleanerCardProps {
  status?: 'ACTIVE' | 'STANDBY' | 'PURGING' | 'OFFLINE';
  mode?: 'AUTO' | 'MANUAL';
  pm25?: number;
  pm10?: number;
  onToggleStatus?: () => void;
  onToggleMode?: () => void;
}

export default function DustCleanerCard({
  status: initialStatus = 'STANDBY',
  mode: initialMode = 'AUTO',
  pm25 = 28,
  pm10 = 64,
}: DustCleanerCardProps) {
  const [status, setStatus] = useState<'ACTIVE' | 'STANDBY' | 'PURGING' | 'OFFLINE'>(initialStatus);
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>(initialMode);
  const [blowerRpm, setBlowerRpm] = useState(3200);

  const toggleActivate = () => {
    if (status === 'ACTIVE') {
      setStatus('STANDBY');
      setBlowerRpm(0);
    } else {
      setStatus('ACTIVE');
      setBlowerRpm(4800);
    }
  };

  const isBlowerRunning = status === 'ACTIVE';

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-brand-border gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-warning">
            <Wind className={`w-5 h-5 ${isBlowerRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-lg font-bold text-brand-primaryText">DustCleaner Core</h3>
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-brand-secondary border border-brand-border text-brand-warning">
                CYCLONIC TRAP
              </span>
            </div>
            <p className="text-xs text-brand-secondaryText font-mono">ESP32-04 // AUTOMATED AIR SCRUBBER</p>
          </div>
        </div>

        {/* Operating State Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
            status === 'ACTIVE'
              ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
              : status === 'STANDBY'
              ? 'bg-brand-warning/10 text-brand-warning border-brand-warning/30'
              : 'bg-brand-secondary text-brand-secondaryText border-brand-border'
          }`}>
            ● {status}
          </span>
          <span className="px-2 py-1 rounded text-xs font-mono bg-brand-secondary border border-brand-border text-brand-secondaryText">
            MODE: {mode}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        
        {/* PM2.5 */}
        <div className="p-3 rounded bg-brand-secondary/80 border border-brand-border">
          <div className="font-mono text-[10px] text-brand-secondaryText mb-1">PM2.5 DUST</div>
          <div className="font-mono text-xl font-bold text-brand-primaryText">
            {pm25} <span className="text-xs font-normal text-brand-secondaryText">µg/m³</span>
          </div>
          <div className="text-[10px] text-brand-success font-mono mt-1">Normal Level</div>
        </div>

        {/* PM10 */}
        <div className="p-3 rounded bg-brand-secondary/80 border border-brand-border">
          <div className="font-mono text-[10px] text-brand-secondaryText mb-1">PM10 COAL DUST</div>
          <div className="font-mono text-xl font-bold text-brand-warning">
            {pm10} <span className="text-xs font-normal text-brand-secondaryText">µg/m³</span>
          </div>
          <div className="text-[10px] text-brand-secondaryText font-mono mt-1">Safe Limit &lt; 150</div>
        </div>

        {/* Blower RPM */}
        <div className="p-3 rounded bg-brand-secondary/80 border border-brand-border">
          <div className="font-mono text-[10px] text-brand-secondaryText mb-1">BLOWER RPM</div>
          <div className="font-mono text-xl font-bold text-brand-primaryText">
            {blowerRpm} <span className="text-xs font-normal text-brand-secondaryText">RPM</span>
          </div>
          <div className="text-[10px] text-brand-accent font-mono mt-1">ESC Telemetry OK</div>
        </div>

        {/* Filter Life */}
        <div className="p-3 rounded bg-brand-secondary/80 border border-brand-border">
          <div className="font-mono text-[10px] text-brand-secondaryText mb-1">HEPA FILTER LIFE</div>
          <div className="font-mono text-xl font-bold text-brand-success">
            88% <span className="text-xs font-normal text-brand-secondaryText">LIFE</span>
          </div>
          <div className="text-[10px] text-brand-secondaryText font-mono mt-1">Pressure Drop: 18 Pa</div>
        </div>

      </div>

      {/* Before-and-After Dust Comparison */}
      <div className="p-4 rounded bg-brand-secondary/50 border border-brand-border mb-6">
        <div className="flex items-center justify-between font-mono text-xs mb-2">
          <span className="text-brand-secondaryText">SAMPLE RUN: BEFORE VS AFTER ACTIVE SCRUB</span>
          <span className="text-brand-success font-semibold">-77.1% PARTICULATE SUPPRESSION</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-brand-secondaryText mb-1">
              <span>UNFILTERED AIR:</span>
              <span className="text-brand-danger font-bold">184 µg/m³</span>
            </div>
            <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border/40">
              <div className="bg-brand-danger h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-mono text-brand-secondaryText mb-1">
              <span>SCRUBBED OUTPUT:</span>
              <span className="text-brand-success font-bold">42 µg/m³</span>
            </div>
            <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border/40">
              <div className="bg-brand-success h-full rounded-full" style={{ width: '22%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-brand-secondaryText">MODE SELECTION:</span>
          <button
            onClick={() => setMode('AUTO')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors ${
              mode === 'AUTO'
                ? 'bg-brand-accent/15 border-brand-accent text-brand-accent'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            AUTOMATIC MODE
          </button>
          <button
            onClick={() => setMode('MANUAL')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors ${
              mode === 'MANUAL'
                ? 'bg-brand-accent/15 border-brand-accent text-brand-accent'
                : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            MANUAL MODE
          </button>
        </div>

        <div className="flex items-center gap-2">
          {status === 'ACTIVE' ? (
            <button
              onClick={toggleActivate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand-danger/20 hover:bg-brand-danger/30 text-brand-danger border border-brand-danger/40 text-xs font-mono font-bold transition-all"
            >
              <Square className="w-3.5 h-3.5" />
              <span>DEACTIVATE BLOWER</span>
            </button>
          ) : (
            <button
              onClick={toggleActivate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-brand-warning hover:bg-amber-400 text-brand-bg text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ACTIVATE DUSTCLEANER</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

