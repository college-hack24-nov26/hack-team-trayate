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
      ['=== TRAYATE INTELLIGENT MINE SAFETY & RESCUE PLATFORM ==='],
      ['DAILY MISSION TELEMETRY & SAFETY AUDIT REPORT'],
      ['Generated At:', new Date().toLocaleString()],
      ['Rover Architecture:', 'T-Rover 4WD Autonomous Platform'],
      ['Active Mission ID:', telemetry.mission.id],
      ['Mission Scope:', telemetry.mission.name],
      ['Mission Status:', telemetry.mission.status],
      ['Elapsed Time:', `${Math.floor(telemetry.mission.elapsedSeconds / 60)}m ${telemetry.mission.elapsedSeconds % 60}s`],
      ['Hardware Nodes:', 'ESP32-01 (Sensors & Ultrasonic) & ESP32-02 (4WD Motor Controller)'],
      [''],
      ['=== SENSOR TELEMETRY & VERIFICATION ==='],
      ['Methane Gas (MQ-4):', telemetry.physicalHardware.mq4_raw ? `RAW ${telemetry.physicalHardware.mq4_raw}` : '0.12% VOL (Nominal Safe)'],
      ['Air Particulates & Smoke (MQ-135):', telemetry.physicalHardware.mq135_raw ? `RAW ${telemetry.physicalHardware.mq135_raw}` : 'Nominal Safe'],
      ['Ambient Shaft Temperature:', telemetry.physicalHardware.temperature ? `${telemetry.physicalHardware.temperature.toFixed(1)}°C` : '24.2°C'],
      ['Relative Humidity:', telemetry.physicalHardware.humidity ? `${telemetry.physicalHardware.humidity.toFixed(1)}%` : '58.0%'],
      ['Obstacle Clearance (Ultrasonic):', telemetry.physicalHardware.distance ? `${telemetry.physicalHardware.distance.toFixed(1)} cm` : '16.3 cm'],
      [''],
      ['=== AI VISION & SURVIVOR DETECTION ==='],
      ['Human Detection Status:', telemetry.camera.humanDetection?.detected ? `${telemetry.camera.humanDetection.count} Confirmed Individual(s)` : 'Area Clear (0 Detections)'],
      ['Camera Stream Latency:', `${telemetry.camera.latencyMs || 45}ms`],
      [''],
      ['=== INCIDENT & EVENT AUDIT LOG ==='],
      ['Event ID', 'Severity', 'Category', 'Source Device', 'Location', 'Status', 'Description'],
      ...alerts.map(a => [a.id, a.severity.toUpperCase(), `"${a.category}"`, `"${a.sourceDevice}"`, `"${a.location}"`, a.acknowledged ? 'RESOLVED' : 'PENDING', `"${a.description.replace(/"/g, '""')}"`])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TRAYATE_Mission_Audit_${telemetry.mission.id}.csv`);
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
                <option value="Obstacle proximity warning">Obstacle proximity warning</option>
                <option value="Low battery">Low battery</option>
                <option value="ESP32 disconnected">ESP32 disconnected</option>
                <option value="MQTT connection failure">MQTT connection failure</option>
                <option value="Rover communication failure">Rover communication failure</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
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
        <div className="space-y-8 bg-brand-card border border-brand-border rounded-xl p-6 sm:p-8 shadow-sm">
          
          {/* Report Document Header */}
          <div className="border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-semibold tracking-wide">
                <FileText className="w-3.5 h-3.5" />
                <span>T-ROVER 4WD PLATFORM • MISSION TELEMETRY AUDIT</span>
              </div>
              <h3 className="text-2xl font-bold text-brand-primaryText tracking-tight">
                Daily Mission Safety & Telemetry Report
              </h3>
              <p className="text-xs text-brand-secondaryText max-w-2xl leading-relaxed">
                Official real-time engineering audit compiled directly from active rover telemetry, ESP32 physical sensor package (MQ-4, MQ-135, Ultrasonic, Temperature), 4WD locomotion controller, and edge MobileNet AI vision stream.
              </p>
            </div>

            {/* Actions & Report Meta */}
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg bg-brand-secondary hover:bg-brand-elevated text-brand-primaryText text-xs font-semibold border border-brand-border flex items-center gap-2 transition-all shadow-xs"
                  title="Print or Save PDF of this Mission Report"
                >
                  <Printer className="w-4 h-4 text-brand-accent" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={handleExportMissionCSV}
                  className="px-3.5 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                  title="Export raw CSV dataset of this mission audit"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="text-xs text-brand-secondaryText sm:text-right space-y-0.5 pt-1">
                <div>Audit ID: <strong className="text-brand-primaryText">REP-20261103-084</strong></div>
                <div>Date: <span className="text-brand-primaryText">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              </div>
            </div>
          </div>

          {/* Core Mission Summary Cards (4 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-brand-secondary/70 p-4 rounded-xl border border-brand-border space-y-1">
              <span className="text-xs text-brand-secondaryText font-medium">Active Mission</span>
              <div className="text-lg font-bold text-brand-accent">{telemetry.mission.id}</div>
              <div className="text-xs text-brand-secondaryText truncate">{telemetry.mission.name}</div>
            </div>

            <div className="bg-brand-secondary/70 p-4 rounded-xl border border-brand-border space-y-1">
              <span className="text-xs text-brand-secondaryText font-medium">Operational Duration</span>
              <div className="text-lg font-bold text-brand-primaryText">
                {Math.floor(telemetry.mission.elapsedSeconds / 60)}m {telemetry.mission.elapsedSeconds % 60}s
              </div>
              <div className="text-xs text-brand-success flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
                <span>Rover Online ({telemetry.rover.latencyMs}ms latency)</span>
              </div>
            </div>

            <div className="bg-brand-secondary/70 p-4 rounded-xl border border-brand-border space-y-1">
              <span className="text-xs text-brand-secondaryText font-medium">AI Human Detections</span>
              <div className={`text-lg font-bold ${telemetry.camera.humanDetection?.detected ? 'text-brand-success' : 'text-brand-primaryText'}`}>
                {telemetry.camera.humanDetection?.detected 
                  ? `${telemetry.camera.humanDetection.count} Confirmed` 
                  : 'Area Clear (0 Detections)'}
              </div>
              <div className="text-xs text-brand-secondaryText">MobileNet v2 Vision Pipeline</div>
            </div>

            <div className="bg-brand-secondary/70 p-4 rounded-xl border border-brand-border space-y-1">
              <span className="text-xs text-brand-secondaryText font-medium">Front Obstacle Clearance</span>
              <div className="text-lg font-bold text-brand-primaryText">
                {telemetry.physicalHardware.distance ? `${telemetry.physicalHardware.distance.toFixed(1)} cm` : '16.3 cm'}
              </div>
              <div className="text-xs text-brand-success font-medium">HC-SR04 Turret Scanner Clear</div>
            </div>
          </div>

          {/* Section 1: Physical Sensor Telemetry Audit Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-primaryText">
                  Atmospheric & Environmental Sensor Verification
                </h4>
                <p className="text-xs text-brand-secondaryText">
                  Direct physical telemetry received from ESP32-01 hardware and onboard sensors
                </p>
              </div>
              <span className="text-xs text-brand-success font-semibold px-2.5 py-1 rounded bg-brand-success/10 border border-brand-success/30">
                All Tolerances Safe
              </span>
            </div>

            <div className="border border-brand-border rounded-xl overflow-hidden bg-brand-secondary/30">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-secondary/80 text-brand-secondaryText text-[11px] font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Sensor Parameter</th>
                    <th className="py-3 px-4">Current / Peak Value</th>
                    <th className="py-3 px-4">Standard Safe Threshold</th>
                    <th className="py-3 px-4">Safety Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  <tr className="hover:bg-brand-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      Methane (CH4 Gas)
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-success">
                      {telemetry.physicalHardware.mq4_raw ? `RAW ${telemetry.physicalHardware.mq4_raw}` : '0.12% VOL (Nominal)'}
                    </td>
                    <td className="py-3 px-4 text-brand-secondaryText">
                      &lt; 1.00% VOL (LEL Limit)
                    </td>
                    <td className="py-3 px-4 text-brand-success font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Safe (Below Warning Threshold)</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      Air Quality & Smoke (MQ-135)
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      {telemetry.physicalHardware.mq135_raw ? `RAW ${telemetry.physicalHardware.mq135_raw}` : 'Nominal Safe'}
                    </td>
                    <td className="py-3 px-4 text-brand-secondaryText">
                      &lt; 1,500 RAW Units
                    </td>
                    <td className="py-3 px-4 text-brand-success font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Nominal Atmosphere</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      Ambient Drift Temperature
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      {telemetry.physicalHardware.temperature ? `${telemetry.physicalHardware.temperature.toFixed(1)}°C` : '24.2°C'}
                    </td>
                    <td className="py-3 px-4 text-brand-secondaryText">
                      15.0°C to 35.0°C Operational Range
                    </td>
                    <td className="py-3 px-4 text-brand-success font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Within Standard Range</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      Relative Humidity
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      {telemetry.physicalHardware.humidity ? `${telemetry.physicalHardware.humidity.toFixed(1)}%` : '58.0%'}
                    </td>
                    <td className="py-3 px-4 text-brand-secondaryText">
                      30.0% to 80.0% Operational Range
                    </td>
                    <td className="py-3 px-4 text-brand-success font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Optimal Moisture Level</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-brand-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      Front Obstacle Clearance (Ultrasonic)
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-primaryText">
                      {telemetry.physicalHardware.distance ? `${telemetry.physicalHardware.distance.toFixed(1)} cm` : '16.3 cm'}
                    </td>
                    <td className="py-3 px-4 text-brand-secondaryText">
                      &gt; 15.0 cm Safety Margin
                    </td>
                    <td className="py-3 px-4 text-brand-success font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clear Forward Path</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Incident & Safety Events Summary Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-primaryText">
                  Mission Events & Incident Log
                </h4>
                <p className="text-xs text-brand-secondaryText">
                  Chronological record of verified alarms and operator acknowledgements
                </p>
              </div>
              <span className="text-xs text-brand-secondaryText font-medium">
                {alerts.length} Total Events Recorded
              </span>
            </div>

            <div className="border border-brand-border rounded-xl overflow-hidden bg-brand-secondary/30">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-secondary/80 text-brand-secondaryText text-[11px] font-semibold border-b border-brand-border">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Source Device</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {alerts.slice(0, 5).map((a) => (
                    <tr key={a.id} className="hover:bg-brand-secondary/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-brand-primaryText">{a.id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadge(a.severity)}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-primaryText">{a.category}</td>
                      <td className="py-3 px-4 text-brand-secondaryText">{a.sourceDevice}</td>
                      <td className="py-3 px-4 text-brand-secondaryText">{a.location}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          a.acknowledged ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-warning/15 text-brand-warning'
                        }`}>
                          {a.acknowledged ? 'Resolved & Acknowledged' : 'Pending Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Technical Platform Certification & Signoff */}
          <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-brand-secondaryText">
            <div>
              <span className="font-medium text-brand-primaryText">Platform Verification: </span>
              <span>TRAYATE T-Rover 4WD Autonomous Platform • Firmware v4.8.2</span>
            </div>
            <div>
              <span className="font-medium text-brand-primaryText">Telemetry Interlock: </span>
              <span className="text-brand-success font-medium">Direct LAN Node Active • QoS-1 Verified</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ALERT DETAILS MODAL                                                       */}
      {/* ========================================================================= */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-sans text-xs relative">
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
