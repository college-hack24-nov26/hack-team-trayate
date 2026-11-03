'use client';

import { useState } from 'react';
import { initialAlerts, AlertItem } from '@/lib/alertsData';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  Filter, 
  ShieldAlert,
  BellRing
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const toggleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, acknowledged: !a.acknowledged, acknowledgedBy: a.acknowledged ? undefined : 'Operator 04 (HQ)' }
          : a
      )
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (sev: AlertItem['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-brand-danger/15 text-brand-danger border-brand-danger/30';
      case 'warning':
        return 'bg-brand-warning/15 text-brand-warning border-brand-warning/30';
      default:
        return 'bg-brand-accent/15 text-brand-accent border-brand-accent/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-brand-accent" />
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">Sub-Surface Alerts & Safety Events</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            HAZARD EVENT DISPATCHER // INCIDENT AUDIT TRAIL // ISO 10218 PROTOCOLS
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-brand-secondaryText flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>FILTER:</span>
          </span>
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded border uppercase transition-colors ${
                filterSeverity === sev
                  ? 'bg-brand-accent text-brand-bg font-bold border-brand-accent shadow-cyan-subtle'
                  : 'bg-brand-secondary border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table / Cards */}
      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-brand-secondary text-brand-secondaryText uppercase text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Severity / ID</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Source Module</th>
                <th className="py-3 px-4">Value / Telemetry</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Acknowledgement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-brand-secondary/40 transition-colors">
                  
                  {/* Severity & ID */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-brand-primaryText font-semibold">{alert.id}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-sans font-bold text-sm text-brand-primaryText">
                      {alert.category}
                    </span>
                  </td>

                  {/* Source Device */}
                  <td className="py-4 px-4 whitespace-nowrap text-brand-secondaryText">
                    <div>{alert.sourceDevice}</div>
                    <div className="text-[10px] text-brand-accent">{alert.sensorInfo}</div>
                  </td>

                  {/* Current Value */}
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-brand-primaryText">
                    {alert.currentValue}
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 whitespace-nowrap text-brand-secondaryText">
                    {alert.location}
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 whitespace-nowrap text-brand-secondaryText">
                    {alert.timestamp}
                  </td>

                  {/* Acknowledgement Action */}
                  <td className="py-4 px-4 whitespace-nowrap text-right">
                    {alert.acknowledged ? (
                      <button
                        onClick={() => toggleAcknowledge(alert.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-success/15 border border-brand-success/30 text-brand-success text-[11px] font-bold hover:bg-brand-success/20 transition-all"
                        title="Click to toggle unacknowledged"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACKNOWLEDGED</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleAcknowledge(alert.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-danger/20 border border-brand-danger/40 text-brand-danger text-[11px] font-bold hover:bg-brand-danger hover:text-white transition-all shadow-sm"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ACKNOWLEDGE</span>
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

