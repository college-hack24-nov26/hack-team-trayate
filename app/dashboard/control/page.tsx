'use client';

import JoystickControl from '@/components/dashboard/JoystickControl';
import ServoScannerControl from '@/components/dashboard/ServoScannerControl';
import DistanceMonitorCard from '@/components/dashboard/DistanceMonitorCard';
import Link from 'next/link';
import { Gamepad2, ArrowUpRight, Radar } from 'lucide-react';

export default function RoverControlPage() {
  return (
    <div className="space-y-6">
      
      {/* Banner to switch to Unified One-Screen Start Mission */}
      <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-sm text-brand-primaryText">
              Start Mission Workstation
            </h3>
            <p className="text-xs text-brand-secondaryText">
              Control T-Rover with WASD keys while monitoring live camera feeds and hardware sensors.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/mission"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-xs transition-all whitespace-nowrap shadow-sm"
        >
          <span>Open Mission Cockpit</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-b border-brand-border pb-3">
        <h2 className="font-sans text-lg font-bold text-brand-primaryText">Rover Teleoperation & Physical Controls</h2>
        <p className="text-xs text-brand-secondaryText mt-0.5">
          Direct hardware control for ESP32-01 sensor suite and ESP32-02 motor module.
        </p>
      </div>

      {/* Top 2 Physical Hardware Cards: Servo Scanner & Ultrasonic Distance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistanceMonitorCard />
        <ServoScannerControl />
      </div>

      {/* Primary Rover Directional Drive Diagnostics */}
      <JoystickControl />
    </div>
  );
}
