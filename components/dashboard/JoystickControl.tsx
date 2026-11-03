'use client';

import { useState } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Square, 
  AlertOctagon, 
  Gauge, 
  Sliders, 
  Radio, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function JoystickControl() {
  const { telemetry, sendMovementCommand, triggerEStop, resetEStop } = useTelemetry();
  const [speed, setSpeed] = useState(0.8);
  const [controlMode, setControlMode] = useState<'MANUAL' | 'AUTONOMOUS'>('MANUAL');
  const [showModeModal, setShowModeModal] = useState(false);
  const [pendingMode, setPendingMode] = useState<'MANUAL' | 'AUTONOMOUS'>('MANUAL');
  const [lastAck, setLastAck] = useState<string>('CMD_ACK_OK: IDLE (12ms)');

  const handleCommand = (dir: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP') => {
    if (telemetry.rover.eStopTriggered) return;
    sendMovementCommand(dir);
    setLastAck(`CMD_ACK_OK: ${dir} @ ${speed} m/s (RTT: 14ms)`);
  };

  const handleModeSwitchRequest = (newMode: 'MANUAL' | 'AUTONOMOUS') => {
    if (newMode === controlMode) return;
    setPendingMode(newMode);
    setShowModeModal(true);
  };

  const confirmModeSwitch = () => {
    setControlMode(pendingMode);
    setShowModeModal(false);
    setLastAck(`SYSTEM_MODE_SWITCH: ${pendingMode} ACTIVATED`);
  };

  const isEStopped = telemetry.rover.eStopTriggered;
  const currentMovement = telemetry.rover.currentMovement;

  const motorStatuses = [
    { id: 'M1 Front-Left', rpm: currentMovement !== 'STOP' ? 140 : 0, temp: 34.2, status: 'NOMINAL' },
    { id: 'M2 Rear-Left', rpm: currentMovement !== 'STOP' ? 140 : 0, temp: 33.8, status: 'NOMINAL' },
    { id: 'M3 Front-Right', rpm: currentMovement !== 'STOP' ? 140 : 0, temp: 34.5, status: 'NOMINAL' },
    { id: 'M4 Rear-Right', rpm: currentMovement !== 'STOP' ? 140 : 0, temp: 34.0, status: 'NOMINAL' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Prominent Safety Alert & Mode Selector */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isEStopped ? 'bg-brand-danger' : 'bg-brand-success'} animate-pulse`}></span>
              <h2 className="font-sans text-base sm:text-lg font-bold text-brand-primaryText">Rover Drive Console</h2>
            </div>
            <p className="text-xs text-brand-secondaryText mt-0.5">
              Target: ESP32-02 (Motors) • Latency: <span className="font-mono">{telemetry.rover.latencyMs}ms</span>
            </p>
          </div>

          {/* Mode Switcher with Confirmation Warning */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-brand-secondaryText font-medium">Control Mode:</span>
            <div className="flex rounded-lg bg-brand-secondary p-1 border border-brand-border">
              <button
                onClick={() => handleModeSwitchRequest('MANUAL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  controlMode === 'MANUAL'
                    ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => handleModeSwitchRequest('AUTONOMOUS')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  controlMode === 'AUTONOMOUS'
                    ? 'bg-brand-warning text-brand-bg font-semibold'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                Autonomous
              </button>
            </div>
          </div>
        </div>

        {/* Movement State & Ack Status Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-brand-secondaryText gap-4">
          <div className="flex items-center gap-4">
            <span>State: <strong className="text-brand-accent font-medium">{currentMovement}</strong></span>
            <span>Speed: <strong className="text-brand-primaryText font-mono font-medium">{telemetry.rover.speedMps} m/s</strong></span>
            <span>Heading: <strong className="text-brand-primaryText font-mono font-medium">{telemetry.rover.headingDeg}°</strong></span>
          </div>
          <div className="px-3 py-1 rounded-md bg-brand-bg border border-brand-border text-brand-success flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Directional Controls & Big Emergency STOP */}
        <div className="lg:col-span-7 bg-brand-card border border-brand-border rounded-xl p-6 sm:p-8 space-y-8">
          
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-sans text-sm sm:text-base font-semibold text-brand-primaryText">Actuation Pad</h3>
            <span className="text-xs text-brand-secondaryText">Direct Drive</span>
          </div>

          {/* Cross Pad Controls */}
          <div className="max-w-[280px] mx-auto grid grid-cols-3 gap-3">
            <div></div>
            <button
              onClick={() => handleCommand('FORWARD')}
              disabled={isEStopped}
              className="h-20 rounded-xl bg-brand-secondary hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent text-brand-primaryText hover:text-brand-accent flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Drive Forward (W)"
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Forward</span>
            </button>
            <div></div>

            <button
              onClick={() => handleCommand('LEFT')}
              disabled={isEStopped}
              className="h-20 rounded-xl bg-brand-secondary hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent text-brand-primaryText hover:text-brand-accent flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Pivot Left (A)"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Left</span>
            </button>

            <button
              onClick={() => handleCommand('STOP')}
              disabled={isEStopped}
              className="h-20 rounded-xl bg-brand-secondary hover:bg-brand-warning/20 border border-brand-border hover:border-brand-warning text-brand-warning flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 shadow-sm"
              title="Halt Rover (Space)"
            >
              <Square className="w-6 h-6" />
              <span className="text-xs font-bold mt-1">Halt</span>
            </button>

            <button
              onClick={() => handleCommand('RIGHT')}
              disabled={isEStopped}
              className="h-20 rounded-xl bg-brand-secondary hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent text-brand-primaryText hover:text-brand-accent flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Pivot Right (D)"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Right</span>
            </button>

            <div></div>
            <button
              onClick={() => handleCommand('BACKWARD')}
              disabled={isEStopped}
              className="h-20 rounded-xl bg-brand-secondary hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent text-brand-primaryText hover:text-brand-accent flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Drive Backward (S)"
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">Reverse</span>
            </button>
            <div></div>
          </div>

          {/* Speed Control Slider */}
          <div className="pt-6 border-t border-brand-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-secondaryText flex items-center gap-1.5 font-medium">
                <Sliders className="w-4 h-4 text-brand-accent" />
                <span>Velocity Governor Limit</span>
              </span>
              <span className="text-brand-accent font-mono font-bold">{speed} m/s ({Math.round((speed / 1.8) * 100)}%)</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.8"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              disabled={isEStopped}
              className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>

          {/* ULTRA-PROMINENT EMERGENCY STOP BUTTON */}
          <div className="pt-4 border-t border-brand-border">
            {isEStopped ? (
              <div className="p-4 rounded-xl bg-brand-danger/20 border-2 border-brand-danger text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-brand-danger font-mono font-bold text-sm">
                  <AlertOctagon className="w-5 h-5 animate-spin" />
                  <span>HARDWARE EMERGENCY STOP ENGAGED // ALL MOTORS ISOLATED</span>
                </div>
                <button
                  onClick={resetEStop}
                  className="px-6 py-2.5 rounded-lg bg-brand-danger hover:bg-red-600 text-white font-mono font-bold text-xs shadow-danger-glow transition-all"
                >
                  PRESS TO CLEAR SAFETY INTERLOCK & RESET
                </button>
              </div>
            ) : (
              <button
                onClick={triggerEStop}
                className="w-full py-5 rounded-xl bg-brand-danger hover:bg-red-600 text-white font-mono font-extrabold text-base tracking-wider transition-all shadow-danger-glow flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                <AlertOctagon className="w-6 h-6" />
                <span>EMERGENCY STOP (E-STOP)</span>
              </button>
            )}
          </div>

        </div>

        {/* Right: Motor Telemetry Diagnostics (All 4 Motors - 4WD) */}
        <div className="lg:col-span-5 bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="font-sans text-base font-bold text-brand-primaryText">4WD Inverter Telemetry</h3>
            <span className="font-mono text-xs text-brand-success">ALL NOMINAL</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {motorStatuses.map((m) => (
              <div key={m.id} className="p-3 rounded-lg bg-brand-secondary/80 border border-brand-border flex items-center justify-between">
                <div>
                  <div className="text-brand-primaryText font-bold text-xs">{m.id}</div>
                  <div className="text-[10px] text-brand-secondaryText mt-0.5">TEMP: {m.temp}°C // CURRENT: 2.4A</div>
                </div>
                <div className="text-right">
                  <div className="text-brand-accent font-bold">{m.rpm} RPM</div>
                  <div className="text-[9px] text-brand-success">{m.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-brand-bg border border-brand-border text-[11px] font-mono text-brand-secondaryText space-y-1">
            <div className="flex justify-between">
              <span>BATTERY PACK:</span>
              <span className="text-brand-primaryText font-bold">{telemetry.rover.batteryVoltage}V / {telemetry.rover.batteryPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span>CHASSIS GROUND PITCH:</span>
              <span className="text-brand-primaryText font-bold">+1.8° PITCH / -0.4° ROLL</span>
            </div>
          </div>
        </div>

      </div>

      {/* Autonomous Confirmation Modal */}
      {showModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-warning/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-brand-warning">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-sans font-bold text-lg text-brand-primaryText">Confirm Autonomous Nav Mode</h3>
            </div>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Switching from Manual Tele-op to Autonomous Mode transfers pathing decisions to the edge LiDAR SLAM module. Ensure all personnel have vacated the immediate inspection corridor before proceeding.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModeModal(false)}
                className="px-4 py-2 rounded bg-brand-secondary border border-brand-border text-xs font-mono text-brand-primaryText"
              >
                CANCEL
              </button>
              <button
                onClick={confirmModeSwitch}
                className="px-4 py-2 rounded bg-brand-warning hover:bg-amber-400 text-brand-bg font-mono font-bold text-xs"
              >
                ENGAGE AUTONOMOUS MODE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

