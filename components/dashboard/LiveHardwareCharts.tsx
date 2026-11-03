'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Activity, Ruler, Flame, Thermometer, Droplets, WifiOff } from 'lucide-react';

export default function LiveHardwareCharts() {
  const { telemetry } = useTelemetry();
  const { history, esp32_01_connected } = telemetry.physicalHardware;

  // Format history for Recharts
  const chartData = history.map((item) => ({
    time: item.time,
    distance: item.distance !== null ? Number(item.distance.toFixed(1)) : null,
    temperature: item.temperature !== null ? Number(item.temperature.toFixed(1)) : null,
    humidity: item.humidity !== null ? Number(item.humidity.toFixed(1)) : null,
    mq4_raw: item.mq4_raw,
    mq135_raw: item.mq135_raw,
  }));

  const hasData = chartData.length > 1 && esp32_01_connected;

  return (
    <div className="space-y-6">
      
      <div className="border-b border-brand-border pb-3 flex items-center justify-between">
        <div>
          <h3 className="font-sans font-bold text-base text-brand-primaryText flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-accent" />
            <span>Live Hardware Telemetry Charts</span>
          </h3>
          <p className="font-mono text-xs text-brand-secondaryText">
            Continuous real-time rolling buffer from ESP32-01 (Updated every 1000ms)
          </p>
        </div>

        <div className="font-mono text-xs text-brand-secondaryText">
          SAMPLES BUFFERED: <strong className="text-brand-accent">{chartData.length} / 40</strong>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-brand-card border border-brand-border rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-brand-secondary border border-brand-border flex items-center justify-center mx-auto text-brand-secondaryText">
            <WifiOff className="w-6 h-6 text-brand-secondaryText" />
          </div>
          <div className="space-y-1">
            <h4 className="font-sans font-bold text-sm text-brand-primaryText">
              Awaiting Physical ESP32 Hardware Data
            </h4>
            <p className="font-mono text-xs text-brand-secondaryText max-w-md mx-auto">
              No simulated numbers are generated. Connect your laptop to the ESP32 hotspot at <code className="text-brand-accent">192.168.137.71</code> to start charting live readings.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: Ultrasonic Distance Trend (cm) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-brand-accent" />
                <span className="font-sans font-bold text-sm text-brand-primaryText">
                  Obstacle Distance (cm)
                </span>
              </div>
              <span className="font-mono text-xs text-brand-accent">
                CURRENT: {telemetry.physicalHardware.distance?.toFixed(1) ?? '--'} cm
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="distance" stroke="#38BDF8" fillOpacity={1} fill="url(#distGrad)" name="Distance (cm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: Raw Gas ADC Readings (MQ-4 & MQ-135) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-warning" />
                <span className="font-sans font-bold text-sm text-brand-primaryText">
                  Raw Gas Transducers (ADC Counts / 4095)
                </span>
              </div>
              <span className="font-mono text-xs text-brand-warning">
                MQ-4: {telemetry.physicalHardware.mq4_raw ?? '--'} | MQ-135: {telemetry.physicalHardware.mq135_raw ?? '--'}
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="mq4_raw" stroke="#F59E0B" dot={false} strokeWidth={2} name="MQ-4 (Raw ADC)" />
                  <Line type="monotone" dataKey="mq135_raw" stroke="#38BDF8" dot={false} strokeWidth={2} name="MQ-135 (Raw ADC)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: Ambient Temperature (DHT22 °C) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-brand-danger" />
                <span className="font-sans font-bold text-sm text-brand-primaryText">
                  Ambient Temperature (°C)
                </span>
              </div>
              <span className="font-mono text-xs text-brand-danger">
                DHT22: {telemetry.physicalHardware.temperature?.toFixed(1) ?? '--'}°C
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="temperature" stroke="#EF4444" fillOpacity={1} fill="url(#tempGrad)" name="Temperature (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 4: Relative Humidity (DHT22 %) */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-brand-accent" />
                <span className="font-sans font-bold text-sm text-brand-primaryText">
                  Relative Humidity (% RH)
                </span>
              </div>
              <span className="font-mono text-xs text-brand-accent">
                DHT22: {telemetry.physicalHardware.humidity?.toFixed(1) ?? '--'}%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243244" opacity={0.5} />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#94A3B8" fontSize={10} fontFamily="JetBrains Mono" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111B27', borderColor: '#243244', borderRadius: '8px', color: '#F8FAFC', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="humidity" stroke="#22C55E" fillOpacity={1} fill="url(#humGrad)" name="Humidity (% RH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

