'use client';

import { SensorData } from '@/lib/telemetryStore';

interface SensorCardProps {
  data: SensorData;
  isSimulated?: boolean;
}

export default function SensorCard({ data, isSimulated = true }: SensorCardProps) {
  const getStatusColor = (status: SensorData['status']) => {
    switch (status) {
      case 'critical':
        return 'text-brand-danger bg-brand-danger/10 border-brand-danger/30';
      case 'warning':
        return 'text-brand-warning bg-brand-warning/10 border-brand-warning/30';
      default:
        return 'text-brand-success bg-brand-success/10 border-brand-success/30';
    }
  };

  // Generate SVG mini sparkline path from trend array
  const trend = data.trend && data.trend.length > 0 ? data.trend : [data.value];
  const minVal = Math.min(...trend) * 0.95;
  const maxVal = Math.max(...trend) * 1.05 || 1;
  const range = maxVal - minVal || 1;
  
  const width = 120;
  const height = 32;
  const points = trend.map((v, i) => {
    const x = (i / (trend.length - 1 || 1)) * width;
    const y = height - ((v - minVal) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col justify-between hover:border-brand-accent/40 transition-colors shadow-sm">
      
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between font-mono text-xs mb-2">
          <span className="text-brand-secondaryText font-medium truncate max-w-[150px]">{data.label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(data.status)}`}>
            {data.status}
          </span>
        </div>

        {/* Current Value Display */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-brand-primaryText">
              {data.value}
            </span>
            <span className="font-mono text-xs text-brand-secondaryText font-medium">
              {data.unit}
            </span>
          </div>

          {/* Mini Sparkline SVG */}
          <div className="w-[120px] h-[32px] overflow-hidden">
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                fill="none"
                stroke={data.status === 'critical' ? '#EF4444' : data.status === 'warning' ? '#F59E0B' : '#38BDF8'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[10px] font-mono text-brand-secondaryText">
        <span>Safe: &lt; {data.maxSafe} {data.unit}</span>
        <span className="text-brand-secondaryText/80">Updated: {data.lastUpdated}</span>
      </div>

    </div>
  );
}

