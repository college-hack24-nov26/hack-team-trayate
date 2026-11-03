'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, Target, HeartHandshake, Award, ArrowUpRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-primaryText flex flex-col font-sans">
      <Navbar />

      <section className="py-20 bg-tech-grid border-b border-brand-border text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase px-3 py-1 rounded bg-brand-secondary border border-brand-border">
            <span>ABOUT TRAYATE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-primaryText">
            Protecting Human Lives in Extreme Underground Environments
          </h1>
          <p className="text-brand-secondaryText text-base sm:text-lg leading-relaxed">
            TRAYATE is an autonomous industrial robotics startup building next-generation mine safety and emergency rescue rovers.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
        
        {/* Mission & Problem Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="font-mono text-xs font-bold text-brand-accent uppercase tracking-wider">THE MINING CRISIS</div>
            <h2 className="text-3xl font-bold text-brand-primaryText">Where Human Access Becomes Fatal</h2>
            <p className="text-brand-secondaryText text-sm sm:text-base leading-relaxed">
              Mining disasters—ranging from explosive methane accumulation, coal dust firestorms, to structural tunnel collapses—frequently trap workers in toxic, zero-oxygen atmospheres.
            </p>
            <p className="text-brand-secondaryText text-sm sm:text-base leading-relaxed">
              Traditional first-responder teams face extreme mortality risks attempting reconnaissance blind. TRAYATE was founded to send intelligent, explosion-proof rovers first—providing continuous environmental intelligence, locating survivors, and actively scrubbing airborne coal dust.
            </p>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-brand-primaryText border-b border-brand-border pb-3">
              Core Architectural Pillars
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-primaryText">Zero Single Points of Failure</h4>
                  <p className="text-xs text-brand-secondaryText mt-0.5">Distributed ESP32 microcontrollers with hardware-isolated locomotion and telemetry circuits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-primaryText">Zero-Delay Telemetry</h4>
                  <p className="text-xs text-brand-secondaryText mt-0.5">Sub-1GHz subterranean mesh radio bridging deep rock strata with sub-15ms latency.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-primaryText">Human-Centric Safety Design</h4>
                  <p className="text-xs text-brand-secondaryText mt-0.5">Instant hardware emergency stop overrides and AI-assisted survivor bio-thermal locking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standards & Certification */}
        <div className="bg-brand-secondary border border-brand-border rounded-xl p-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono text-xs font-bold text-brand-accent uppercase tracking-wider">COMPLIANCE & VERIFICATION</div>
            <h2 className="text-2xl font-bold text-brand-primaryText">Built to Global Mining Safety Standards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-card border border-brand-border rounded-lg p-5 space-y-2">
              <Award className="w-6 h-6 text-brand-accent" />
              <h3 className="font-bold text-sm text-brand-primaryText">ATEX Zone 1 / IECEx</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Intrinsically safe sealed electrical enclosures preventing spark ignition in volatile methane-air mixtures.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-lg p-5 space-y-2">
              <Award className="w-6 h-6 text-brand-accent" />
              <h3 className="font-bold text-sm text-brand-primaryText">ISO 10218 Industrial Robotics</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Strict safety interlock requirements, velocity limits, and certified hardware emergency stop circuits.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-lg p-5 space-y-2">
              <Award className="w-6 h-6 text-brand-accent" />
              <h3 className="font-bold text-sm text-brand-primaryText">NIOSH & DGMS Guidelines</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Calibrated atmospheric thresholds conforming to Directorate General of Mines Safety and NIOSH worker safety limits.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

