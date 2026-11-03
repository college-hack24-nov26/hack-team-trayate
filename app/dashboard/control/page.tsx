'use client';

import JoystickControl from '@/components/dashboard/JoystickControl';
import Link from 'next/link';
import { Gamepad2, ArrowUpRight } from 'lucide-react';

export default function RoverControlPage() {
  return (
    <div className="space-y-6">
      
      {/* Banner to switch to Unified One-Screen Start Mission */}
      <div className="bg-brand-accent/10 border border-brand-accent/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-accent/20 border border-brand-accent/50 flex items-center justify-center text-brand-accent shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-brand-primaryText">
              Unified Single-Screen Mission Cockpit Available
            </h3>
            <p className="font-mono text-xs text-brand-secondaryText">
              Control T-Rover with W-A-S-D keyboard while viewing live IP Webcam and 2D mine map simultaneously on one screen.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/mission"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs font-mono transition-all whitespace-nowrap shadow-sm"
        >
          <span>LAUNCH UNIFIED MISSION COCKPIT</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-b border-brand-border pb-4">
        <h2 className="font-sans text-xl font-bold text-brand-primaryText">Rover Teleoperation & Motor Diagnostics</h2>
        <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
          BIDIRECTIONAL FLY-BY-WIRE // ESP32-01 LOCOMOTION CONTROLLER // FAIL-SAFE INTERLOCK ACTIVE
        </p>
      </div>

      <JoystickControl />
    </div>
  );
}
