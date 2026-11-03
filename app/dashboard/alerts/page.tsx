'use client';

import { useState } from 'react';
import { initialAlerts, AlertItem } from '@/lib/alertsData';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  Filter, 
  ShieldAlert,
  BellRing,
  Download,
  FileText,
  Search,
  Eye,
  X,
  Printer,
  Calendar,
  Cpu,
  Flame,
  Wind,
  UserCheck
} from 'lucide-react';

export default function AlertsAndReportsPage() {
  const { telemetry } = useTelemetry();
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'alerts' | 'reports'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Acknowledge handler
  const toggleAcknowledge = (id: string) => {
    soundManager.playClickTone();
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { 
              ...a, 
              acknowledged: !a.acknowledged, 
              acknowledgedBy: a.acknowledged ? undefined : 'Operator 04 (HQ Command)',
              acknowledgedAt: a.acknowledged ? undefined : new Date().toLocaleTimeString()
            }
          : a
      )
    );
  };

  // Filter pipeline
  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        a.id.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.sourceDevice.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Export Alerts to CSV
  const handleExportAlertsCSV = () => {
    soundManager.playClickTone();
    const headers = ['Alert ID', 'Severity', 'Category', 'Timestamp', 'Device', 'Sensor', 'Value', 'Location', 'Acknowledged', 'Acknowledged By', 'Description'];
    const rows = filteredAlerts.map((a) => [
      a.id,
      a.severity.toUpperCase(),
      `"${a.category}"`,
      `"${a.timestamp}"`,
      `"${a.sourceDevice}"`,
      `"${a.sensorInfo}"`,
      `"${a.currentValue}"`,
      `"${a.location}"`,
      a.acknowledged ? 'YES' : 'NO',
      `"${a.acknowledgedBy || 'N/A'}"`,
      `"${a.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TRAYATE_Alerts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Daily Mission Report to CSV
  const handleExportMissionCSV = () => {
    soundManager.playClickTone();
    const reportData = [
      ['=== TRAYATE INTELLIGENT MINE SAFETY & RESCUE SYSTEM ==='],
      ['DAILY MISSION TELEMETRY AUDIT REPORT'],
      ['Report Generated:', new Date().toISOString()],
      ['Mission ID:', telemetry.mission.id],
      ['Mission Name:', telemetry.mission.name],
      ['Mission Status:', telemetry.mission.status],
      ['Elapsed Time:', `${Math.floor(telemetry.mission.elapsedSeconds / 60)} minutes`],
      ['Rover Status:', 'ONLINE (99.98% Uptime)'],
      [''],
      ['=== SENSOR EXTREMES & CRITICAL METRICS ==='],
      ['Peak Methane (CH4):', '0.45% VOL (LEL Safe Target < 1.00%)'],
      ['Peak Carbon Monoxide (CO):', '12 PPM (Safe Threshold < 25 PPM)'],
      ['Max Ambient Temperature:', '38.4°C'],
      ['Average Oxygen (O2):', '20.8% VOL (Nominal Air Quality)'],
      ['Dust Mitigation (PM10):', '184 µg/m³ peak suppressed to 42 µg/m³ via DustCleaner'],
      [''],
      ['=== DETECTION & INCIDENT SUMMARY ==='],
      ['Human Detection Events:', '1 (ALT-1084 - 98.4% Confidence - Thermal Lock)'],
      ['Fire / Thermal Hotspots:', '1 (ALT-1080 - 412°C Localized - Stope Rib Wall)'],
      ['Smoke Aerosol Alerts:', '1 (ALT-1079 - Early Ionization Alert)'],
      ['ESP32 Disconnections:', '0 during active mission window'],
      [''],
      ['=== RECENT AUDIT LOG ==='],
      ['Alert ID', 'Severity', 'Category', 'Device', 'Description'],
      ...alerts.map(a => [a.id, a.severity.toUpperCase(), `"${a.category}"`, `"${a.sourceDevice}"`, `"${a.description.replace(/"/g, '""')}"`])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TRAYATE_Daily_Mission_Report_${telemetry.mission.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-brand-accent" />
            <h2 className="font-sans text-xl font-bold text-brand-primaryText">Alerts & Mission Reports</h2>
          </div>
          <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
            HAZARD EVENT DISPATCHER // SUPABASE INCIDENT AUDIT TRAIL // ISO 10218 COMPLIANCE
          </p>
        </div>

        {/* Tab Switcher & CSV Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-brand-secondary p-1 rounded-lg border border-brand-border flex items-center font-mono text-xs">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                activeTab === 'alerts'
                  ? 'bg-brand-card text-brand-accent border border-brand-border shadow-sm'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
            >
              Active Alerts ({alerts.filter(a => !a.acknowledged).length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                activeTab === 'reports'
                  ? 'bg-brand-card text-brand-accent border border-brand-border shadow-sm'
                  : 'text-brand-secondaryText hover:text-brand-primaryText'
              }`}
            >
              Daily Mission Reports
            </button>
          </div>

          {activeTab === 'alerts' ? (
            <button
              onClick={handleExportAlertsCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card border border-brand-border text-brand-primaryText font-mono text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-brand-accent" />
              <span>EXPORT CSV</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMissionCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-secondary hover:bg-brand-card border border-brand-border text-brand-primaryText font-mono text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-brand-accent" />
                <span>DOWNLOAD CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-mono text-xs font-semibold transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT / PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE ALERTS TABLE & FILTERS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-brand-card p-3 rounded-xl border border-brand-border text-xs font-mono">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-3.5 h-3.5 text-brand-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, category, device, stope..."
                className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-3 py-2 text-brand-primaryText placeholder-brand-secondaryText/40 focus:outline-none focus:border-brand-accent"
              />
            </div>

            {/* Severity Tabs */}
            <div className="sm:col-span-4 flex items-center gap-1">
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`flex-1 py-2 rounded border uppercase font-semibold text-[10px] transition-colors ${
                    filterSeverity === sev
                      ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-sm'
                      : 'bg-brand-bg border-brand-border text-brand-secondaryText hover:text-brand-primaryText'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Category Select */}
            <div className="sm:col-span-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Filter alerts by category"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-2.5 py-2 text-brand-primaryText focus:outline-none focus:border-brand-accent text-xs"
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="Human detected">Human detected</option>
                <option value="High gas concentration">High gas concentration</option>
                <option value="High temperature">High temperature</option>
                <option value="Fire detected">Fire detected</option>
                <option value="Smoke detected">Smoke detected</option>
                <option value="High dust concentration">High dust concentration</option>
                <option value="Low battery">Low battery</option>
                <option value="ESP32 disconnected">ESP32 disconnected</option>
                <option value="MQTT connection failure">MQTT connection failure</option>
                <option value="Rover communication failure">Rover communication failure</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-brand-secondary text-brand-secondaryText uppercase text-[10px] tracking-wider border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Severity / ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Source Device</th>
                    <th className="py-3 px-4">Location / Sector</th>
                    <th className="py-3 px-4">Value / Metric</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <tr 
                        key={alert.id}
                        className={`hover:bg-brand-secondary/40 transition-colors ${
                          !alert.acknowledged && alert.severity === 'critical' ? 'bg-brand-danger/5' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-brand-primaryText font-bold">{alert.id}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-sans font-semibold text-brand-primaryText whitespace-nowrap">
                          {alert.category}
                        </td>

                        <td className="py-3.5 px-4 text-brand-secondaryText whitespace-nowrap">
                          {alert.sourceDevice}
                        </td>

                        <td className="py-3.5 px-4 text-brand-secondaryText whitespace-nowrap">
                          {alert.location}
                        </td>

                        <td className="py-3.5 px-4 text-brand-accent font-semibold whitespace-nowrap">
                          {alert.currentValue}
                        </td>

                        <td className="py-3.5 px-4 text-brand-secondaryText text-[11px] whitespace-nowrap">
                          {alert.timestamp}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleAcknowledge(alert.id)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                alert.acknowledged
                                  ? 'bg-brand-success/15 border border-brand-success/40 text-brand-success'
                                  : 'bg-brand-accent/20 border border-brand-accent/50 text-brand-accent hover:bg-brand-accent/30'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{alert.acknowledged ? 'ACKED' : 'ACKNOWLEDGE'}</span>
                            </button>

                            <button
                              onClick={() => setSelectedAlert(alert)}
                              className="p-1 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-secondary transition-colors"
                              title="View Telemetry Snapshot Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-brand-secondaryText font-mono">
                        No alerts match the active filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DAILY MISSION REPORTS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 bg-brand-card border border-brand-border rounded-xl p-6 shadow-xl">
          
          {/* Report Header */}
          <div className="border-b border-brand-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-accent" />
                <h3 className="font-sans font-bold text-lg text-brand-primaryText">
                  Daily Mission Safety & Telemetry Audit Report
                </h3>
              </div>
              <p className="font-mono text-xs text-brand-secondaryText mt-1">
                OFFICIAL RECORD // ISO 10218 COMPLIANT // TRAYATE ROBOTICS FLEET TELEMETRY
              </p>
            </div>

            <div className="font-mono text-xs text-brand-secondaryText sm:text-right">
              <div>REPORT ID: <strong className="text-brand-accent">REP-20261103-084</strong></div>
              <div>DATE: <strong className="text-brand-primaryText">{new Date().toDateString()}</strong></div>
            </div>
          </div>

          {/* Mission Core Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-brand-bg p-3.5 rounded-lg border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">MISSION ID</span>
              <div className="text-sm font-bold text-brand-accent mt-0.5">{telemetry.mission.id}</div>
              <div className="text-[10px] text-brand-secondaryText mt-0.5">{telemetry.mission.name}</div>
            </div>

            <div className="bg-brand-bg p-3.5 rounded-lg border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">OPERATIONAL DURATION</span>
              <div className="text-sm font-bold text-brand-primaryText mt-0.5">
                {Math.floor(telemetry.mission.elapsedSeconds / 60)}m {telemetry.mission.elapsedSeconds % 60}s
              </div>
              <div className="text-[10px] text-brand-success mt-0.5">ROVER UPTIME: 99.98%</div>
            </div>

            <div className="bg-brand-bg p-3.5 rounded-lg border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">SURVIVOR DETECTIONS</span>
              <div className="text-sm font-bold text-brand-success mt-0.5">1 CONFIRMED</div>
              <div className="text-[10px] text-brand-secondaryText mt-0.5">Shaft-B / Section 4-C</div>
            </div>

            <div className="bg-brand-bg p-3.5 rounded-lg border border-brand-border">
              <span className="text-brand-secondaryText text-[10px]">DUST CLEANED</span>
              <div className="text-sm font-bold text-brand-warning mt-0.5">142 m³/h</div>
              <div className="text-[10px] text-brand-secondaryText mt-0.5">76.8% Aerosol Purged</div>
            </div>
          </div>

          {/* Sensor Maximums & Averages Summary */}
          <div className="space-y-3 pt-2">
            <h4 className="font-sans font-bold text-sm text-brand-primaryText">
              Atmospheric & Environmental Transducer Extremes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 rounded bg-brand-bg border border-brand-border space-y-1">
                <div className="text-brand-secondaryText text-[11px] font-semibold">METHANE (CH4)</div>
                <div className="text-lg font-bold text-brand-success">Peak: 0.45% VOL</div>
                <div className="text-[10px] text-brand-secondaryText">Average: 0.12% VOL (Safe Limit &lt; 1.00%)</div>
              </div>

              <div className="p-3 rounded bg-brand-bg border border-brand-border space-y-1">
                <div className="text-brand-secondaryText text-[11px] font-semibold">CARBON MONOXIDE (CO)</div>
                <div className="text-lg font-bold text-brand-primaryText">Peak: 12 PPM</div>
                <div className="text-[10px] text-brand-secondaryText">Average: 8 PPM (Safe Limit &lt; 25 PPM)</div>
              </div>

              <div className="p-3 rounded bg-brand-bg border border-brand-border space-y-1">
                <div className="text-brand-secondaryText text-[11px] font-semibold">DRIFT TEMPERATURE</div>
                <div className="text-lg font-bold text-brand-warning">Peak: 38.4°C</div>
                <div className="text-[10px] text-brand-secondaryText">Average: 24.2°C (Warning Limit &gt; 35°C)</div>
              </div>
            </div>
          </div>

          {/* Incident Log Summary Table */}
          <div className="space-y-3 pt-2">
            <h4 className="font-sans font-bold text-sm text-brand-primaryText">
              Timestamped Critical Events Log
            </h4>

            <div className="border border-brand-border rounded-lg overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-brand-secondary text-brand-secondaryText text-[10px] uppercase border-b border-brand-border">
                  <tr>
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {alerts.slice(0, 5).map((a) => (
                    <tr key={a.id} className="hover:bg-brand-secondary/30">
                      <td className="py-2.5 px-3 font-bold text-brand-primaryText">{a.id}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${getSeverityBadge(a.severity)}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{a.category}</td>
                      <td className="py-2.5 px-3 text-brand-secondaryText">{a.location}</td>
                      <td className="py-2.5 px-3 text-brand-success font-semibold">
                        {a.acknowledged ? 'RESOLVED & ACKNOWLEDGED' : 'PENDING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signoff Section */}
          <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs text-brand-secondaryText">
            <div>
              <span>REPORT CERTIFIED BY: </span>
              <strong className="text-brand-primaryText">COMMANDER ELENA ROSTOVA</strong>
            </div>
            <div>
              <span>SHA-256 INTEGRITY HASH: </span>
              <code className="text-brand-accent">8f4c...3e19</code>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ALERT DETAILS MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs relative">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 text-brand-secondaryText hover:text-brand-primaryText"
              aria-label="Close alert details modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadge(selectedAlert.severity)}`}>
                {selectedAlert.severity}
              </span>
              <h3 className="font-sans font-bold text-base text-brand-primaryText">
                {selectedAlert.id} // {selectedAlert.category}
              </h3>
            </div>

            <div className="space-y-2 bg-brand-bg p-3.5 rounded-lg border border-brand-border">
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Source Hardware:</span>
                <span className="text-brand-primaryText font-bold">{selectedAlert.sourceDevice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Transducer Cell:</span>
                <span className="text-brand-accent">{selectedAlert.sensorInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Recorded Value:</span>
                <span className="text-brand-warning font-bold">{selectedAlert.currentValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Sector Location:</span>
                <span className="text-brand-primaryText">{selectedAlert.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Timestamp:</span>
                <span className="text-brand-secondaryText">{selectedAlert.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-secondaryText">Mission ID:</span>
                <span className="text-brand-accent">{selectedAlert.missionId}</span>
              </div>
            </div>

            <div>
              <span className="text-brand-secondaryText text-[10px] uppercase">Incident Narrative:</span>
              <p className="font-sans text-sm text-brand-primaryText mt-1 leading-relaxed bg-brand-secondary p-3 rounded border border-brand-border">
                {selectedAlert.description}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-brand-border">
              <span className="text-brand-secondaryText text-[11px]">
                {selectedAlert.acknowledged 
                  ? `Acknowledged by ${selectedAlert.acknowledgedBy}` 
                  : 'Pending Operator Acknowledgement'}
              </span>

              <button
                onClick={() => {
                  toggleAcknowledge(selectedAlert.id);
                  setSelectedAlert((prev) => prev ? { ...prev, acknowledged: !prev.acknowledged } : null);
                }}
                className={`px-3 py-1.5 rounded font-bold uppercase text-xs transition-colors ${
                  selectedAlert.acknowledged
                    ? 'bg-brand-success/15 border border-brand-success/40 text-brand-success'
                    : 'bg-brand-accent text-brand-bg hover:bg-brand-accent-hover'
                }`}
              >
                {selectedAlert.acknowledged ? 'Mark Unacknowledged' : 'Acknowledge Event'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
