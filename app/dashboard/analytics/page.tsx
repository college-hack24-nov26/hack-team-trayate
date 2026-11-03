'use client';

import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Zap 
} from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'1h' | '24h' | '7d' | '30d' | 'custom'>('24h');

  // Multi-day analytics data
  const multiDayGasTrend = [
    { date: 'Oct 28', ch4Measured: 0.12, ch4Predicted: 0.13, temp: 23.4, uptimeHrs: 18.2, pingMs: 14 },
    { date: 'Oct 29', ch4Measured: 0.14, ch4Predicted: 0.15, temp: 23.8, uptimeHrs: 19.5, pingMs: 12 },
    { date: 'Oct 30', ch4Measured: 0.11, ch4Predicted: 0.12, temp: 24.1, uptimeHrs: 22.0, pingMs: 15 },
    { date: 'Oct 31', ch4Measured: 0.28, ch4Predicted: 0.32, temp: 24.5, uptimeHrs: 16.4, pingMs: 18 },
    { date: 'Nov 01', ch4Measured: 0.19, ch4Predicted: 0.20, temp: 24.2, uptimeHrs: 20.8, pingMs: 13 },
    { date: 'Nov 02', ch4Measured: 0.13, ch4Predicted: 0.14, temp: 24.0, uptimeHrs: 23.1, pingMs: 11 },
    { date: 'Nov 03', ch4Measured: 0.12, ch4Predicted: 0.13, temp: 24.2, uptimeHrs: 23.8, pingMs: 12 },
  ];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,CH4_Measured,CH4_Predicted,Ambient_Temp,Uptime_Hours,Latency_Ping_Ms\n"
      + multiDayGasTrend.map(e => `${e.date},${e.ch4Measured},${e.ch4Predicted},${e.temp},${e.uptimeHrs},${e.pingMs}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trayate_telemetry_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-brand-primaryText">Historical Telemetry & Predictive Analytics</h2>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            MEASURED SENSORY TIMESERIES VS ML PREDICTIVE ACCUMULATION MODELS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          
          {/* Date Filter Tabs */}
          <div className="flex rounded-lg bg-brand-secondary p-1 border border-brand-border">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded transition-colors ${
                  dateRange === range
                    ? 'bg-brand-accent text-brand-bg font-bold shadow-cyan-subtle'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-card hover:bg-brand-secondary border border-brand-border hover:border-brand-accent text-brand-primaryText transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-accent" />
            <span>EXPORT CSV</span>
          </button>

        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <div className="font-mono text-[10px] text-brand-secondaryText">AVG METHANE (24H)</div>
          <div className="font-mono text-2xl font-bold text-brand-primaryText mt-1">0.14% <span className="text-xs font-normal text-brand-secondaryText">VOL</span></div>
          <div className="text-[10px] font-mono text-brand-success mt-1">Nominal Range</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <div className="font-mono text-[10px] text-brand-secondaryText">ROVER UPTIME (30D)</div>
          <div className="font-mono text-2xl font-bold text-brand-accent mt-1">99.4% <span className="text-xs font-normal text-brand-secondaryText">SLA</span></div>
          <div className="text-[10px] font-mono text-brand-secondaryText mt-1">542 Patrol Hours</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <div className="text-[11px] font-medium text-brand-secondaryText uppercase tracking-wider">Edge AI Inference</div>
          <div className="text-2xl font-bold text-brand-accent mt-1">24 ms <span className="text-xs font-normal text-brand-secondaryText">AVG</span></div>
          <div className="text-xs text-brand-secondaryText mt-1">MobileNet v2 Vision Model</div>
        </div>

        <div className="bg-brand-card border border-brand-border rounded-xl p-4">
          <div className="font-mono text-[10px] text-brand-secondaryText">PREDICTIVE LEAD TIME</div>
          <div className="font-mono text-2xl font-bold text-brand-success mt-1">15.4 <span className="text-xs font-normal text-brand-secondaryText">MIN</span></div>
          <div className="text-[10px] font-mono text-brand-secondaryText mt-1">Prior to LEL Limit</div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Measured vs Predictive Methane */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">
                Methane Concentration: Measured vs. ML Model
              </h3>
              <p className="font-mono text-xs text-brand-secondaryText">
                Solid = Sensor Transducer // Dashed = Edge Regression Forecast
              </p>
            </div>
            <span className="font-mono text-xs text-brand-accent bg-brand-secondary px-2.5 py-1 rounded border border-brand-border">
              R² = 0.984
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiDayGasTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1520', borderColor: '#243244', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ch4Measured" stroke="#38BDF8" strokeWidth={2.5} name="Measured CH4 (%)" />
                <Line type="monotone" dataKey="ch4Predicted" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" name="Predictive Model (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] font-mono text-brand-secondaryText">
            * NOTICE: Predictive trajectories are statistical estimations and should be cross-verified before human corridor entry.
          </div>
        </div>

        {/* Chart 2: Daily Rover Operational Uptime */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">
                Sub-Surface Operational Uptime (Hours/Day)
              </h3>
              <p className="font-mono text-xs text-brand-secondaryText">Battery charging and active patrol distribution</p>
            </div>
            <span className="font-mono text-xs text-brand-success bg-brand-secondary px-2.5 py-1 rounded border border-brand-border">
              NOMINAL
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiDayGasTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1520', borderColor: '#243244', borderRadius: '8px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="uptimeHrs" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Patrol Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-brand-secondaryText">
            <span>24H CYCLE CAPACITY: 24.0 HRS MAX</span>
            <span>DISCHARGE RATE: 4.8W MEAN</span>
          </div>
        </div>

      </div>

    </div>
  );
}

