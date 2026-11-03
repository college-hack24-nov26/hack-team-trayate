'use client';

import JoystickControl from '@/components/dashboard/JoystickControl';

export default function RoverControlPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-sans text-xl font-bold text-brand-primaryText">Rover Teleoperation & Motor Control</h2>
        <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
          BIDIRECTIONAL FLY-BY-WIRE // ESP32-01 LOCOMOTION CONTROLLER // FAIL-SAFE INTERLOCK ACTIVE
        </p>
      </div>

      <JoystickControl />
    </div>
  );
}

