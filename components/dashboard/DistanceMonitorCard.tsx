'use client';

import { useTelemetry } from '@/lib/telemetryStore';
import { Ruler, AlertOctagon, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function DistanceMonitorCard() {
  const { telemetry } = useTelemetry();
  const { distance, distanceStatus, esp32_01_connected, history, isInitialLoading } = telemetry.physicalHardware;

  // Proximity status styling according to exact ESP32 status enum:
  // NORMAL | WARNING | DANGER | NO_ECHO
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DANGER':
        return {
          color: 'text-brand-danger',
          border: 'border-brand-danger',
          bg: 'bg-brand-danger/15',
          barColor: 'bg-brand-danger',
          label: 'OBSTACLE IMMINENT // DANGER',
          icon: AlertOctagon,
        };
      case 'WARNING':
        return {
          color: 'text-brand-warning',
          border: 'border-brand-warning',
          bg: 'bg-brand-warning/15',
          barColor: 'bg-brand-warning',
          label: 'PROXIMITY WARNING',
          icon: AlertTriangle,
        };
      case 'NO_ECHO':
        return {
          color: 'text-brand-secondaryText',
          border: 'border-brand-border',
          bg: 'bg-brand-secondary',
          barColor: 'bg-brand-secondaryText/40',
          label: 'NO ECHO / OPEN CORRIDOR',
          icon: HelpCircle,
        };
      case 'NORMAL':
      default:
        return {
          color: 'text-brand-success',
          border: 'border-brand-success',
          bg: 'bg-brand-success/15',
          barColor: 'bg-brand-success',
          label: 'PATH CLEAR // NORMAL',
          icon: ShieldCheck,
        };
    }
  };

  const statusConfig = getStatusConfig(distanceStatus);
  const StatusIcon = statusConfig.icon;

  // Calculate percentage of proximity (0 to 400cm range)
  const maxRangeCm = 300;
  const clampedDistance = distance !== null ? Math.min(maxRangeCm, Math.max(0, distance)) : 0;
  const progressPercent = distance !== null ? Math.round((clampedDistance / maxRangeCm) * 100) : 0;

  // Distance trend array
  const trendValues = history
    .map((h) => h.distance)
    .filter((d): d is number => d !== null)
    .slice(-15);

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-brand-primaryText">
              Ultrasonic Obstacle Proximity
            </h3>
            <span className="font-mono text-[10px] text-brand-secondaryText">
              HC-SR04 SCANNER TRANSDUCER
            </span>
          </div>
        </div>

        {/* ESP32 Status Pill */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{distanceStatus}</span>
        </div>
      </div>

      {/* Main Distance Readout */}
      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono text-brand-secondaryText uppercase tracking-wider block">
            MEASURED DISTANCE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            {isInitialLoading ? (
              <span className="text-3xl font-mono font-bold text-brand-secondaryText animate-pulse">
                --.-
              </span>
            ) : distance !== null ? (
              <>
                <span className={`text-4xl sm:text-5xl font-mono font-extrabold tracking-tight ${statusConfig.color}`}>
                  {distance.toFixed(1)}
                </span>
                <span className="text-sm font-mono text-brand-secondaryText font-semibold">
                  CM
                </span>
              </>
            ) : (
              <span className="text-2xl font-mono text-brand-danger">
                DISCONNECTED
              </span>
            )}
          </div>
        </div>

        {/* Status Callout */}
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-brand-primaryText">
            {distanceStatus}
          </span>
          <div className="text-[10px] font-mono text-brand-secondaryText">
            RANGE: 2 - 400 CM
          </div>
        </div>
      </div>

      {/* Visual Proximity Progress Bar */}
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex justify-between text-[10px] text-brand-secondaryText">
          <span className="text-brand-danger font-semibold">0 cm (COLLISION)</span>
          <span>150 cm</span>
          <span className="text-brand-success font-semibold">300+ cm (CLEAR)</span>
        </div>

        <div className="w-full h-3 bg-brand-bg rounded-full overflow-hidden border border-brand-border p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${statusConfig.barColor}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Mini Trend Sparkline */}
      {trendValues.length > 2 && (
        <div className="pt-2 border-t border-brand-border flex items-center justify-between font-mono text-[10px] text-brand-secondaryText">
          <span>RECENT ECHO TREND (15s):</span>
          <div className="flex items-end gap-1 h-5">
            {trendValues.map((v, i) => {
              const heightPct = Math.min(100, Math.max(15, (v / maxRangeCm) * 100));
              return (
                <div
                  key={i}
                  className={`w-1 rounded-sm ${statusConfig.barColor} opacity-75`}
                  style={{ height: `${heightPct}%` }}
                  title={`${v} cm`}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[10px] font-mono text-brand-secondaryText/80 flex items-center justify-between pt-1 border-t border-brand-border">
        <span>POLL INTERVAL: 1000ms</span>
        <span className="text-brand-accent">
          {esp32_01_connected ? 'LIVE HARDWARE SYNC' : 'AWAITING ESP32-01'}
        </span>
      </div>

    </div>
  );
}

