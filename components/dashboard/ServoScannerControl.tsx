'use client';

import { useState } from 'react';
import { useTelemetry } from '@/lib/telemetryStore';
import { sendServoAngleCommand } from '@/lib/esp32Service';
import { 
  Radar, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ServoScannerControl() {
  const { telemetry, setPhysicalServoAngle } = useTelemetry();
  const currentAngle = telemetry.physicalHardware.servoAngle ?? 90;
  const isEspConnected = telemetry.physicalHardware.esp32_01_connected;

  const [sliderAngle, setSliderAngle] = useState<number>(currentAngle);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleAngleChange = async (targetAngle: number) => {
    if (isPending) return;
    setIsPending(true);
    setFeedback({ type: null, message: '' });

    try {
      const res = await sendServoAngleCommand(targetAngle);
      if (res.success) {
        await setPhysicalServoAngle(res.angle);
        setSliderAngle(res.angle);
        setFeedback({
          type: 'success',
          message: `Physical servo confirmed at ${res.angle}° (${res.latencyMs}ms)`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Servo command failed on physical board',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'ESP32-01 communication failure',
      });
    } finally {
      setIsPending(false);
      setTimeout(() => {
        setFeedback((prev) => (prev.type === 'success' ? { type: null, message: '' } : prev));
      }, 4000);
    }
  };

  const presetAngles = [0, 45, 90, 135, 180];

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
            <Radar className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm text-brand-primaryText flex items-center gap-2">
              <span>Servo Scanner Pan</span>
              {isEspConnected ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-success/15 border border-brand-success/40 text-brand-success font-medium">
                  Hardware Online
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-danger/15 border border-brand-danger/40 text-brand-danger font-medium">
                  Offline
                </span>
              )}
            </h3>
            <p className="text-xs text-brand-secondaryText">
              SG90 Pan Mechanism
            </p>
          </div>
        </div>

        {/* Center / Reset Button at 90° */}
        <button
          onClick={() => handleAngleChange(90)}
          disabled={isPending || !isEspConnected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-secondary hover:bg-brand-border border border-brand-border text-brand-primaryText text-xs font-medium transition-all disabled:opacity-40"
          title="Center Servo Scanner to 90° Forward"
        >
          <RotateCcw className="w-3.5 h-3.5 text-brand-accent" />
          <span>Center (90°)</span>
        </button>
      </div>

      {/* Semicircular Radar / Angle Dial Display */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center">
          
          {/* Semicircle Gauge Outer Arc */}
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-brand-border bg-brand-bg/60 relative">
            
            {/* 45 degree ticks */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-0.5 bg-brand-border/40"></div>
            </div>
            
            {/* Sweep radar cone */}
            <div 
              className="absolute bottom-1/2 left-1/2 w-24 h-1 bg-gradient-to-r from-transparent to-brand-accent origin-left transition-transform duration-300 ease-out pointer-events-none shadow-[0_0_12px_#38BDF8]"
              style={{
                transform: `rotate(${currentAngle - 180}deg)`,
              }}
            >
              <div className="absolute right-0 -top-1 w-2.5 h-2.5 rounded-full bg-brand-accent"></div>
            </div>

          </div>

          {/* Center Pivot */}
          <div className="absolute bottom-0 w-8 h-8 rounded-full bg-brand-secondary border-2 border-brand-accent flex items-center justify-center text-brand-accent shadow-md z-10">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        {/* Angle Readout */}
        <div className="text-center mt-3">
          <div className="text-2xl font-mono font-extrabold text-brand-primaryText">
            {currentAngle}°
          </div>
          <span className="text-xs text-brand-secondaryText font-medium">
            {currentAngle < 75 ? 'Left (Port)' : currentAngle > 105 ? 'Right (Starboard)' : 'Straight Ahead'}
          </span>
        </div>
      </div>

      {/* Preset Quick-Buttons (0°, 45°, 90°, 135°, 180°) */}
      <div className="space-y-2">
        <span className="text-xs text-brand-secondaryText font-medium">
          Preset Angles:
        </span>
        <div className="grid grid-cols-5 gap-2 font-mono text-xs">
          {presetAngles.map((deg) => {
            const isSelected = currentAngle === deg;
            return (
              <button
                key={deg}
                onClick={() => handleAngleChange(deg)}
                disabled={isPending || !isEspConnected}
                className={`py-2 rounded-lg border font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-accent text-brand-bg border-brand-accent shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'bg-brand-secondary border-brand-border text-brand-primaryText hover:border-brand-accent/50'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {deg}°
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Angle Slider */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center text-brand-secondaryText font-medium">
          <span>Manual Angle Adjustment</span>
          <span className="text-brand-accent font-mono font-bold">{sliderAngle}°</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-secondaryText font-mono">0°</span>
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={sliderAngle}
            onChange={(e) => setSliderAngle(Number(e.target.value))}
            onMouseUp={() => handleAngleChange(sliderAngle)}
            onTouchEnd={() => handleAngleChange(sliderAngle)}
            disabled={isPending || !isEspConnected}
            className="flex-1 h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-accent disabled:opacity-40"
          />
          <span className="text-xs text-brand-secondaryText font-mono">180°</span>
        </div>
      </div>

      {/* Feedback & Confirmation Strip */}
      {feedback.message && (
        <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-brand-success/10 border-brand-success/30 text-brand-success font-medium'
            : 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger font-medium'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">{feedback.message}</span>
        </div>
      )}

      {/* Hardware Safety Verification Note */}
      <div className="pt-2 border-t border-brand-border text-xs text-brand-secondaryText flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
          <span>Feedback Verification Active</span>
        </span>
        <span className="font-mono text-[11px]">ESP32-01 SG90</span>
      </div>

    </div>
  );
}

