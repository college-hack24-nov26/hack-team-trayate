'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';
import { 
  AlertOctagon, 
  Gauge, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Compass, 
  Sliders, 
  RotateCcw,
  Zap
} from 'lucide-react';

export default function MissionKeyboardControls() {
  const { 
    telemetry, 
    sendMovementCommand, 
    triggerEStop, 
    resetEStop, 
    setSpeedGovernor,
    setMovementMode 
  } = useTelemetry();

  // Active pressed keys state
  const [pressedKeys, setPressedKeys] = useState<{ [key: string]: boolean }>({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
  });

  // Handle Key Down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If typing in an input element, do not hijack
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    const key = e.key.toLowerCase();

    if (e.code === 'Space') {
      e.preventDefault();
      triggerEStop();
      setPressedKeys((prev) => ({ ...prev, space: true }));
      return;
    }

    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
      if (!pressedKeys[key]) {
        soundManager.playClickTone();
        setPressedKeys((prev) => ({ ...prev, [key]: true }));

        if (key === 'w') sendMovementCommand('FORWARD');
        else if (key === 'a') sendMovementCommand('LEFT');
        else if (key === 's') sendMovementCommand('BACKWARD');
        else if (key === 'd') sendMovementCommand('RIGHT');
      }
    }
  }, [pressedKeys, sendMovementCommand, triggerEStop]);

  // Handle Key Up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    const key = e.key.toLowerCase();

    if (e.code === 'Space') {
      setPressedKeys((prev) => ({ ...prev, space: false }));
      return;
    }

    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
      setPressedKeys((prev) => ({ ...prev, [key]: false }));
      // Deadman instantaneous halt on key release
      sendMovementCommand('STOP');
    }
  }, [sendMovementCommand]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const isDisconnected = telemetry.rover.connectivity === 'OFFLINE';
  const isEStopped = telemetry.rover.eStopTriggered;

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col h-full overflow-hidden">
      
      {/* Panel Header */}
      <div className="h-10 px-3 bg-brand-secondary border-b border-brand-border flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-brand-accent" />
          <span className="font-sans font-semibold text-brand-primaryText text-[11px] sm:text-xs">
            TELEOPERATION CONSOLE
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border text-brand-accent font-semibold">
            KEYBOARD ACTIVE
          </span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-brand-bg p-0.5 rounded border border-brand-border">
          <button
            onClick={() => setMovementMode('MANUAL')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              telemetry.rover.mode === 'MANUAL'
                ? 'bg-brand-accent text-brand-bg font-bold'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            MANUAL
          </button>
          <button
            onClick={() => setMovementMode('AUTONOMOUS')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              telemetry.rover.mode === 'AUTONOMOUS'
                ? 'bg-brand-accent text-brand-bg font-bold'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            AUTO
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        
        {/* Safety Status Notification / Warning Banner */}
        {isEStopped ? (
          <div className="p-2.5 rounded-lg bg-brand-danger/15 border border-brand-danger/40 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-brand-danger font-mono text-xs font-bold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>EMERGENCY STOP ENGAGED // MOTORS DEADMAN SHUTDOWN</span>
            </div>
            <button
              onClick={resetEStop}
              className="px-2.5 py-1 rounded bg-brand-danger text-white text-[10px] font-bold uppercase hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
          </div>
        ) : isDisconnected ? (
          <div className="p-2.5 rounded-lg bg-brand-danger/10 border border-brand-danger/30 flex items-center gap-2 text-brand-danger font-mono text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>ROVER OFFLINE // COMMAND DISPATCH INHIBITED</span>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">STATE:</span>
              <span className={`font-bold ${
                telemetry.rover.currentMovement !== 'STOP' ? 'text-brand-accent animate-pulse' : 'text-brand-secondaryText'
              }`}>
                {telemetry.rover.currentMovement}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">SPEED:</span>
              <span className="text-brand-primaryText font-bold">
                {telemetry.rover.speedMps.toFixed(1)} m/s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">HEADING:</span>
              <span className="text-brand-accent font-bold">
                {telemetry.rover.headingDeg}°
              </span>
            </div>
          </div>
        )}

        {/* Interactive Keyboard Visual Indicator Grid */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2 select-none">
          {/* Key W */}
          <div className="flex justify-center">
            <button
              onMouseDown={() => sendMovementCommand('FORWARD')}
              onMouseUp={() => sendMovementCommand('STOP')}
              disabled={isEStopped || isDisconnected}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md ${
                pressedKeys.w || telemetry.rover.currentMovement === 'FORWARD'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <span className="text-lg leading-none">W</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">FWD</span>
            </button>
          </div>

          {/* Keys A, S, D */}
          <div className="flex items-center justify-center gap-2">
            {/* Key A */}
            <button
              onMouseDown={() => sendMovementCommand('LEFT')}
              onMouseUp={() => sendMovementCommand('STOP')}
              disabled={isEStopped || isDisconnected}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md ${
                pressedKeys.a || telemetry.rover.currentMovement === 'LEFT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <span className="text-lg leading-none">A</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">LEFT</span>
            </button>

            {/* Key S */}
            <button
              onMouseDown={() => sendMovementCommand('BACKWARD')}
              onMouseUp={() => sendMovementCommand('STOP')}
              disabled={isEStopped || isDisconnected}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md ${
                pressedKeys.s || telemetry.rover.currentMovement === 'BACKWARD'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <span className="text-lg leading-none">S</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">REV</span>
            </button>

            {/* Key D */}
            <button
              onMouseDown={() => sendMovementCommand('RIGHT')}
              onMouseUp={() => sendMovementCommand('STOP')}
              disabled={isEStopped || isDisconnected}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md ${
                pressedKeys.d || telemetry.rover.currentMovement === 'RIGHT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <span className="text-lg leading-none">D</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">RIGHT</span>
            </button>
          </div>

          {/* Key Spacebar: Emergency Stop */}
          <div className="w-full pt-1">
            <button
              onClick={triggerEStop}
              className={`w-full py-2.5 rounded-lg border-2 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                pressedKeys.space || isEStopped
                  ? 'bg-brand-danger text-white border-brand-danger shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                  : 'bg-brand-danger/20 border-brand-danger/60 text-brand-danger hover:bg-brand-danger hover:text-white'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SPACEBAR — EMERGENCY STOP</span>
            </button>
          </div>
        </div>

        {/* Speed Governor Slider & Telemetry */}
        <div className="space-y-2 pt-2 border-t border-brand-border">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-brand-secondaryText flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-accent" />
              <span>SPEED GOVERNOR:</span>
            </span>
            <span className="font-bold text-brand-accent">
              {telemetry.rover.speedGovernorPercent}% ({(1.2 * (telemetry.rover.speedGovernorPercent / 100)).toFixed(2)} m/s max)
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={telemetry.rover.speedGovernorPercent}
            onChange={(e) => setSpeedGovernor(Number(e.target.value))}
            className="w-full h-1.5 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />

          <div className="flex justify-between text-[9px] font-mono text-brand-secondaryText/60">
            <span>10% (CRAWL)</span>
            <span>50% (NOMINAL)</span>
            <span>100% (RESCUE SPRINT)</span>
          </div>
        </div>

        {/* Deadman & Hardware Safety Notice */}
        <div className="p-2.5 rounded bg-brand-bg/60 border border-brand-border font-mono text-[9px] text-brand-secondaryText space-y-1">
          <div className="flex items-center gap-1.5 text-brand-success font-semibold">
            <ShieldCheck className="w-3 h-3 text-brand-success" />
            <span>DEADMAN INTERLOCK ACTIVE</span>
          </div>
          <p className="leading-tight text-brand-secondaryText/80">
            Movement halts instantly upon key release. The onboard ESP32 independently shuts down all 6 motor inverters if telemetry drops for &gt;600ms.
          </p>
        </div>

      </div>
    </div>
  );
}

