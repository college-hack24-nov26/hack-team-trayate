'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';
import { getHardwareConfig } from '@/lib/esp32Service';
import { 
  AlertOctagon, 
  Gauge, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sliders, 
  Square,
  Zap,
  Info
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

  // Active key state (supporting both Arrow keys and WASD)
  const [activeDirection, setActiveDirection] = useState<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('STOP');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const activeDirectionRef = useRef<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('STOP');
  activeDirectionRef.current = activeDirection;

  // Continuous movement heartbeat timer
  const continuousIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const hardwareConfig = getHardwareConfig();
  const isMotorConfigured = Boolean(hardwareConfig.motorUrl);
  const isEStopped = telemetry.rover.eStopTriggered;

  // Start continuous locomotion or rotation (fires immediately + loops every 100ms while held)
  const startContinuousMovement = useCallback((dir: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT', keyLabel?: string) => {
    if (telemetry.rover.eStopTriggered) return;

    if (activeDirectionRef.current === dir && continuousIntervalRef.current) {
      return;
    }

    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
      continuousIntervalRef.current = null;
    }

    soundManager.playClickTone();
    activeDirectionRef.current = dir;
    setActiveDirection(dir);
    if (keyLabel) setPressedKey(keyLabel);

    // 1. Dispatch initial command immediately (zero delay)
    sendMovementCommand(dir);

    // 2. Active continuous heartbeat (keeps motors rotating/driving smoothly while held)
    continuousIntervalRef.current = setInterval(() => {
      if (activeDirectionRef.current === dir) {
        sendMovementCommand(dir);
      } else {
        if (continuousIntervalRef.current) {
          clearInterval(continuousIntervalRef.current);
          continuousIntervalRef.current = null;
        }
      }
    }, 100);
  }, [sendMovementCommand, telemetry.rover.eStopTriggered]);

  // Stop continuous locomotion (clears heartbeat + fires STOP immediately)
  const stopContinuousMovement = useCallback(() => {
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
      continuousIntervalRef.current = null;
    }
    if (activeDirectionRef.current !== 'STOP') {
      activeDirectionRef.current = 'STOP';
      setActiveDirection('STOP');
      setPressedKey(null);
      sendMovementCommand('STOP');
    } else {
      setPressedKey(null);
    }
  }, [sendMovementCommand]);

  // Key Down Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 1. Never intercept when operator is typing in an input or textarea
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }

    // 2. Emergency Stop on SPACEBAR
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      stopContinuousMovement();
      triggerEStop();
      setPressedKey('SPACE');
      return;
    }

    // 3. Arrow Keys and WASD mapping
    let targetDir: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | null = null;
    let keyName = '';

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      targetDir = 'FORWARD';
      keyName = 'ArrowUp';
    } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
      targetDir = 'BACKWARD';
      keyName = 'ArrowDown';
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      targetDir = 'LEFT';
      keyName = 'ArrowLeft';
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      targetDir = 'RIGHT';
      keyName = 'ArrowRight';
    }

    if (targetDir) {
      e.preventDefault(); // Prevent page scrolling!
      startContinuousMovement(targetDir, keyName);
    }
  }, [startContinuousMovement, stopContinuousMovement, triggerEStop]);

  // Key Up Handler (Deadman instantaneous stop on key release)
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }

    if (e.code === 'Space' || e.key === ' ') {
      setPressedKey(null);
      return;
    }

    const isMovementKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
      ['w', 'a', 's', 'd'].includes(e.key.toLowerCase());

    if (isMovementKey) {
      e.preventDefault();
      stopContinuousMovement();
    }
  }, [stopContinuousMovement]);

  // Safety Window Event Listeners:
  // Immediately stop movement if browser loses focus or tab is hidden!
  useEffect(() => {
    const handleSafetyStop = () => {
      stopContinuousMovement();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSafetyStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mouseup', handleSafetyStop);
    window.addEventListener('touchend', handleSafetyStop);
    window.addEventListener('blur', handleSafetyStop);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseup', handleSafetyStop);
      window.removeEventListener('touchend', handleSafetyStop);
      window.removeEventListener('blur', handleSafetyStop);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleKeyDown, handleKeyUp, stopContinuousMovement]);

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
        
        {/* Safety & Motor Interlock Warning Banner */}
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
        ) : !isMotorConfigured ? (
          <div className="p-2.5 rounded-lg bg-brand-warning/10 border border-brand-warning/30 flex items-center justify-between text-brand-warning font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>ESP32-02 MOTOR IP AWAITING CONFIGURATION</span>
            </div>
            <span className="text-[9px] bg-brand-warning/20 px-1.5 py-0.5 rounded">SAFETY LOCK</span>
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">DIR:</span>
              <span className={`font-bold ${
                activeDirection !== 'STOP' ? 'text-brand-accent animate-pulse' : 'text-brand-secondaryText'
              }`}>
                {activeDirection}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">SPEED:</span>
              <span className="text-brand-primaryText font-bold">
                {telemetry.rover.speedGovernorPercent}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">TARGET:</span>
              <span className="text-brand-success font-semibold">
                ESP32-02
              </span>
            </div>
          </div>
        )}

        {/* Visual Directional Control Pad (Arrow keys & WASD) */}
        <div className="flex flex-col items-center justify-center py-1 space-y-2 select-none">
          
          {/* Forward (ArrowUp / W) */}
          <div className="flex justify-center">
            <button
              onMouseDown={() => startContinuousMovement('FORWARD', 'ArrowUp')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'FORWARD') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('FORWARD', 'ArrowUp'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md select-none ${
                pressedKey === 'ArrowUp' || activeDirection === 'FORWARD'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ArrowUp className="w-5 h-5 leading-none" />
              <span className="text-[8px] uppercase mt-0.5">FWD (↑/W)</span>
            </button>
          </div>

          {/* Left, STOP, Right */}
          <div className="flex items-center justify-center gap-2">
            
            {/* Left (ArrowLeft / A) */}
            <button
              onMouseDown={() => startContinuousMovement('LEFT', 'ArrowLeft')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'LEFT') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('LEFT', 'ArrowLeft'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md select-none ${
                pressedKey === 'ArrowLeft' || activeDirection === 'LEFT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ArrowLeft className="w-5 h-5 leading-none" />
              <span className="text-[8px] uppercase mt-0.5">LEFT (←/A)</span>
            </button>

            {/* STOP Button */}
            <button
              onClick={() => stopContinuousMovement()}
              className="w-14 h-14 rounded-lg border-2 border-brand-border bg-brand-bg hover:bg-brand-secondary text-brand-danger font-mono font-bold flex flex-col items-center justify-center transition-all shadow-md active:scale-95 select-none"
              title="Stop Rover Locomotion"
            >
              <Square className="w-4 h-4 fill-current leading-none" />
              <span className="text-[8px] uppercase mt-0.5 font-bold">STOP</span>
            </button>

            {/* Right (ArrowRight / D) */}
            <button
              onMouseDown={() => startContinuousMovement('RIGHT', 'ArrowRight')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'RIGHT') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('RIGHT', 'ArrowRight'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md select-none ${
                pressedKey === 'ArrowRight' || activeDirection === 'RIGHT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ArrowRight className="w-5 h-5 leading-none" />
              <span className="text-[8px] uppercase mt-0.5">RIGHT (→/D)</span>
            </button>
          </div>

          {/* Backward (ArrowDown / S) */}
          <div className="flex justify-center">
            <button
              onMouseDown={() => startContinuousMovement('BACKWARD', 'ArrowDown')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'BACKWARD') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('BACKWARD', 'ArrowDown'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono font-bold transition-all shadow-md select-none ${
                pressedKey === 'ArrowDown' || activeDirection === 'BACKWARD'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ArrowDown className="w-5 h-5 leading-none" />
              <span className="text-[8px] uppercase mt-0.5">REV (↓/S)</span>
            </button>
          </div>

          {/* SPACEBAR EMERGENCY STOP BUTTON */}
          <div className="w-full pt-1">
            <button
              onClick={triggerEStop}
              className={`w-full py-2.5 rounded-lg border-2 font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${
                pressedKey === 'SPACE' || isEStopped
                  ? 'bg-brand-danger text-white border-brand-danger shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                  : 'bg-brand-danger/20 border-brand-danger/60 text-brand-danger hover:bg-brand-danger hover:text-white'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>SPACEBAR — EMERGENCY STOP</span>
            </button>
          </div>
        </div>

        {/* Speed Governor Slider & Readout */}
        <div className="space-y-1.5 pt-2 border-t border-brand-border">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-brand-secondaryText flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-accent" />
              <span>MOTOR PWM SPEED GOVERNOR:</span>
            </span>
            <span className="font-bold text-brand-accent">
              {telemetry.rover.speedGovernorPercent}%
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
            <span>10% (CREEP)</span>
            <span>60% (NOMINAL)</span>
            <span>100% (MAX CRAWL)</span>
          </div>
        </div>

        {/* Safety Directives */}
        <div className="p-2 rounded bg-brand-bg/60 border border-brand-border font-mono text-[9px] text-brand-secondaryText space-y-0.5">
          <div className="flex items-center gap-1 text-brand-success font-semibold">
            <ShieldCheck className="w-3 h-3 text-brand-success" />
            <span>SAFETY INTERLOCK ACTIVE</span>
          </div>
          <p className="text-brand-secondaryText/80 leading-tight">
            Commands are dead-man latched. Releasing key or losing window focus immediately halts locomotion.
          </p>
        </div>

      </div>
    </div>
  );
}
