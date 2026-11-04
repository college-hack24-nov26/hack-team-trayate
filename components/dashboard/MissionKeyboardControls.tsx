'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { soundManager } from '@/lib/soundAlerts';
import { getHardwareConfig } from '@/lib/esp32Service';
import { 
  AlertOctagon, 
  Gauge, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
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

  // Active key state (supporting both Arrow keys and WASD)
  const [activeDirection, setActiveDirection] = useState<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('STOP');
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const activeDirectionRef = useRef<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('STOP');
  activeDirectionRef.current = activeDirection;

  // Continuous movement heartbeat timer
  const continuousIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMotorConfigured = Boolean(telemetry.physicalHardware.motorUrl);
  const isEStopped = telemetry.rover.eStopTriggered;

  // Set of currently held movement keys for butter-smooth multi-key locomotion
  const heldKeysRef = useRef<Set<string>>(new Set());

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

  // Helper to map key string to direction
  const keyToDirection = (key: string): { dir: 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | null; label: string } => {
    const k = key.toLowerCase();
    if (k === 'w' || key === 'ArrowUp') return { dir: 'FORWARD', label: 'ArrowUp' };
    if (k === 's' || key === 'ArrowDown') return { dir: 'BACKWARD', label: 'ArrowDown' };
    if (k === 'a' || key === 'ArrowLeft') return { dir: 'LEFT', label: 'ArrowLeft' };
    if (k === 'd' || key === 'ArrowRight') return { dir: 'RIGHT', label: 'ArrowRight' };
    return { dir: null, label: '' };
  };

  // Key Down Handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 1. Never intercept when operator is typing in an input or textarea
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable) {
      return;
    }

    // 2. Emergency Stop on SPACEBAR
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      heldKeysRef.current.clear();
      stopContinuousMovement();
      triggerEStop();
      setPressedKey('SPACE');
      return;
    }

    // 3. Arrow Keys and WASD mapping
    const { dir, label } = keyToDirection(e.key);

    if (dir) {
      e.preventDefault(); // Prevent page scrolling
      heldKeysRef.current.add(e.key.toLowerCase());
      startContinuousMovement(dir, label);
    }
  }, [startContinuousMovement, stopContinuousMovement, triggerEStop]);

  // Key Up Handler (Deadman instantaneous stop on key release or fallback to remaining held key)
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable) {
      return;
    }

    if (e.code === 'Space' || e.key === ' ') {
      setPressedKey(null);
      return;
    }

    const { dir } = keyToDirection(e.key);

    if (dir) {
      e.preventDefault();
      heldKeysRef.current.delete(e.key.toLowerCase());

      // If other movement keys are still being held down, transition smoothly to them
      if (heldKeysRef.current.size > 0) {
        const remainingKeys = Array.from(heldKeysRef.current);
        const lastKey = remainingKeys[remainingKeys.length - 1];
        const nextTarget = keyToDirection(lastKey);
        if (nextTarget.dir) {
          startContinuousMovement(nextTarget.dir, nextTarget.label);
          return;
        }
      }

      stopContinuousMovement();
    }
  }, [startContinuousMovement, stopContinuousMovement]);

  // Safety Window Event Listeners:
  // Immediately stop movement if browser loses focus or tab is hidden
  useEffect(() => {
    const handleSafetyStop = () => {
      heldKeysRef.current.clear();
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

  const getDirectionText = () => {
    switch (activeDirection) {
      case 'FORWARD': return 'Moving Forward';
      case 'BACKWARD': return 'Reversing';
      case 'LEFT': return 'Turning Left';
      case 'RIGHT': return 'Turning Right';
      default: return 'Idle / Stopped';
    }
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col overflow-hidden shadow-sm">
      
      {/* Panel Header */}
      <div className="h-12 px-4 bg-brand-secondary border-b border-brand-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-brand-accent">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-brand-primaryText text-sm">
              Rover Controls
            </h3>
          </div>
          <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-brand-bg border border-brand-border text-brand-secondaryText">
            WASD / Arrow Keys
          </span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-lg border border-brand-border">
          <button
            onClick={() => setMovementMode('MANUAL')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              telemetry.rover.mode === 'MANUAL'
                ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMovementMode('AUTONOMOUS')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              telemetry.rover.mode === 'AUTONOMOUS'
                ? 'bg-brand-accent text-brand-bg font-semibold shadow-xs'
                : 'text-brand-secondaryText hover:text-brand-primaryText'
            }`}
          >
            Autonomous
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-4">
        
        {/* Safety & Motor Interlock Warning Banner */}
        {isEStopped ? (
          <div className="p-3 rounded-lg bg-brand-danger/15 border border-brand-danger/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-danger text-xs font-semibold">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>Emergency Stop engaged — motors shut down</span>
            </div>
            <button
              onClick={resetEStop}
              className="px-3 py-1 rounded bg-brand-danger text-white text-xs font-semibold hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
          </div>
        ) : !isMotorConfigured ? (
          <div className="p-3 rounded-lg bg-brand-warning/10 border border-brand-warning/30 flex items-center justify-between text-brand-warning text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Motor controller awaiting configuration</span>
            </div>
            <span className="text-[11px] bg-brand-warning/20 px-2 py-0.5 rounded font-medium">Locked</span>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">Status:</span>
              <span className={`font-medium ${
                activeDirection !== 'STOP' ? 'text-brand-accent font-semibold' : 'text-brand-secondaryText'
              }`}>
                {getDirectionText()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondaryText">Speed:</span>
              <span className="text-brand-primaryText font-mono font-semibold">
                {telemetry.rover.speedGovernorPercent}%
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-brand-secondaryText">
              <span className={`w-1.5 h-1.5 rounded-full ${isMotorConfigured ? 'bg-brand-success' : 'bg-brand-warning'}`}></span>
              <span>ESP32-02 ({telemetry.physicalHardware.motorUrl ? telemetry.physicalHardware.motorUrl.replace(/^https?:\/\//, '') : 'Unset'})</span>
            </div>
          </div>
        )}

        {/* Directional Pad */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2.5 select-none">
          
          {/* Forward */}
          <button
            onMouseDown={() => startContinuousMovement('FORWARD', 'ArrowUp')}
            onMouseUp={() => stopContinuousMovement()}
            onMouseLeave={() => { if (activeDirectionRef.current === 'FORWARD') stopContinuousMovement(); }}
            onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('FORWARD', 'ArrowUp'); }}
            onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
            disabled={isEStopped}
            className={`w-28 sm:w-32 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all select-none ${
              pressedKey === 'ArrowUp' || activeDirection === 'FORWARD'
                ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-lg shadow-brand-accent/25'
                : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/60 hover:bg-brand-elevated'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ArrowUp className="w-5 h-5" />
            <span className="text-xs font-semibold">Forward (W)</span>
          </button>

          {/* Left, STOP, Right */}
          <div className="flex items-center justify-center gap-2.5">
            
            {/* Left */}
            <button
              onMouseDown={() => startContinuousMovement('LEFT', 'ArrowLeft')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'LEFT') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('LEFT', 'ArrowLeft'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-28 sm:w-32 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all select-none ${
                pressedKey === 'ArrowLeft' || activeDirection === 'LEFT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-lg shadow-brand-accent/25'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/60 hover:bg-brand-elevated'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-semibold">Left (A)</span>
            </button>

            {/* Stop */}
            <button
              onClick={() => stopContinuousMovement()}
              className="w-20 sm:w-24 h-14 rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-secondary text-brand-danger flex flex-col items-center justify-center gap-1 transition-all active:scale-95 select-none"
              title="Stop Rover Movement"
            >
              <Square className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold">Stop</span>
            </button>

            {/* Right */}
            <button
              onMouseDown={() => startContinuousMovement('RIGHT', 'ArrowRight')}
              onMouseUp={() => stopContinuousMovement()}
              onMouseLeave={() => { if (activeDirectionRef.current === 'RIGHT') stopContinuousMovement(); }}
              onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('RIGHT', 'ArrowRight'); }}
              onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
              disabled={isEStopped}
              className={`w-28 sm:w-32 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all select-none ${
                pressedKey === 'ArrowRight' || activeDirection === 'RIGHT'
                  ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-lg shadow-brand-accent/25'
                  : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/60 hover:bg-brand-elevated'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-xs font-semibold">Right (D)</span>
            </button>
          </div>

          {/* Reverse */}
          <button
            onMouseDown={() => startContinuousMovement('BACKWARD', 'ArrowDown')}
            onMouseUp={() => stopContinuousMovement()}
            onMouseLeave={() => { if (activeDirectionRef.current === 'BACKWARD') stopContinuousMovement(); }}
            onTouchStart={(e) => { e.preventDefault(); startContinuousMovement('BACKWARD', 'ArrowDown'); }}
            onTouchEnd={(e) => { e.preventDefault(); stopContinuousMovement(); }}
            disabled={isEStopped}
            className={`w-28 sm:w-32 h-14 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all select-none ${
              pressedKey === 'ArrowDown' || activeDirection === 'BACKWARD'
                ? 'bg-brand-accent text-brand-bg border-brand-accent scale-95 shadow-lg shadow-brand-accent/25'
                : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/60 hover:bg-brand-elevated'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ArrowDown className="w-5 h-5" />
            <span className="text-xs font-semibold">Reverse (S)</span>
          </button>

          {/* Spacebar Emergency Stop */}
          <div className="w-full pt-1">
            <button
              onClick={triggerEStop}
              className={`w-full py-3 rounded-xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                pressedKey === 'SPACE' || isEStopped
                  ? 'bg-brand-danger text-white border-brand-danger shadow-lg shadow-brand-danger/30'
                  : 'bg-brand-danger/15 border-brand-danger/50 text-brand-danger hover:bg-brand-danger hover:text-white'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Spacebar — Emergency Stop</span>
            </button>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2 pt-3 border-t border-brand-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-secondaryText flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-brand-accent" />
              <span>Motor Speed Limit</span>
            </span>
            <span className="font-mono font-bold text-brand-accent text-sm">
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
            className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent"
          />

          <div className="flex justify-between text-[11px] text-brand-secondaryText">
            <span>10% (Slow Creep)</span>
            <span>60% (Standard)</span>
            <span>100% (Maximum)</span>
          </div>
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-lg bg-brand-bg border border-brand-border flex items-start gap-2.5 text-xs text-brand-secondaryText">
          <ShieldCheck className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Deadman safety active: Holding a key drives continuously; releasing it or switching windows immediately halts the rover.
          </p>
        </div>

      </div>
    </div>
  );
}
