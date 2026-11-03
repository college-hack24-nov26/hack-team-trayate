'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Cpu, 
  RadioTower, 
  Database, 
  Brain, 
  Wind, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Thermometer, 
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-primaryText flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="py-20 bg-tech-grid border-b border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase px-3 py-1 rounded bg-brand-secondary border border-brand-border mb-4">
            <span>FULL-STACK SYSTEM ARCHITECTURE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-primaryText mb-4">
            Underground Sensing to Real-Time Intelligence
          </h1>
          <p className="text-brand-secondaryText text-base sm:text-lg leading-relaxed">
            A comprehensive, fault-tolerant deep-tech ecosystem engineered specifically for volatile sub-surface mining environments.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* SECTION A: SENSOR NETWORK */}
        <section id="sensors" className="space-y-8">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">SECTION A</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Multi-Sensor Atmospheric Network</h2>
            </div>
            <Wind className="w-8 h-8 text-brand-accent hidden sm:block" />
          </div>

          <p className="text-brand-secondaryText text-base max-w-3xl leading-relaxed">
            The sensory envelope combines electrochemical, optical NDIR, and solid-state sensors to capture multi-dimensional environmental indicators at 50Hz–100Hz continuous polling rates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brand-accent font-bold">MQ-4 / NDIR</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-secondary text-brand-success border border-brand-border">CH4</span>
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">Methane (CH4) Gas Sensors</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Calibrated optical non-dispersive infrared (NDIR) detection immune to sensor poisoning from high hydrocarbon concentrations.
              </p>
              <div className="text-[10px] font-mono text-brand-secondaryText pt-2 border-t border-brand-border">
                RANGE: 0.01% — 5.0% VOL (LEL)
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brand-accent font-bold">ELECTROCHEMICAL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-secondary text-brand-warning border border-brand-border">CO</span>
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">Carbon Monoxide (CO)</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Sub-ppm precision electrochemical cell for early coal smoldering and spontaneous combustion detection.
              </p>
              <div className="text-[10px] font-mono text-brand-secondaryText pt-2 border-t border-brand-border">
                RESOLUTION: 1 PPM // NIOSH TWA 25 PPM
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brand-accent font-bold">BME680 / THERMAL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-secondary text-brand-accent border border-brand-border">TEMP / RH</span>
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">Temperature & Humidity</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Ambient barometric pressure, relative humidity, and heat convection gradient measurement to detect ventilation collapses.
              </p>
              <div className="text-[10px] font-mono text-brand-secondaryText pt-2 border-t border-brand-border">
                PRESSURE: 300 - 1100 hPa
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-brand-accent font-bold">LASER SCATTERING</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-secondary text-brand-warning border border-brand-border">PM2.5 / PM10</span>
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">Air-Quality & Coal Dust</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Dual-channel laser scattering particle counter capturing suspended respirable and explosive coal aerosol density.
              </p>
              <div className="text-[10px] font-mono text-brand-secondaryText pt-2 border-t border-brand-border">
                THRESHOLD: 0 - 1000 µg/m³
              </div>
            </div>

          </div>
        </section>

        {/* SECTION B: DISTRIBUTED CONTROLLERS */}
        <section id="controllers" className="space-y-8">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">SECTION B</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Distributed ESP32 Hardware Controllers</h2>
            </div>
            <Cpu className="w-8 h-8 text-brand-accent hidden sm:block" />
          </div>

          <p className="text-brand-secondaryText text-base max-w-3xl leading-relaxed">
            Rather than relying on a centralized fragile processor, T-Rover uses four isolated ESP32 dual-core microcontrollers running FreeRTOS. A failure in the camera module will never compromise locomotion or safety-critical E-Stop circuits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-brand-card border border-brand-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-success"></span>
                  <span className="font-mono text-sm font-bold text-brand-primaryText">ESP32-01 — Main Mobility & E-Stop</span>
                </div>
                <span className="text-xs font-mono text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">PRIMARY BUS</span>
              </div>
              <p className="text-xs text-brand-secondaryText leading-relaxed mb-4">
                Executes 4-wheel brushless hub motor velocity PID loops (4WD), receives remote steering commands via Sub-1GHz RF, and drives the hardware-isolated Emergency STOP relay.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-brand-secondaryText pt-3 border-t border-brand-border/60">
                <div>CLOCK: 240 MHz</div>
                <div>RTOS: FreeRTOS v10</div>
                <div>WATCHDOG: 50ms</div>
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-success"></span>
                  <span className="font-mono text-sm font-bold text-brand-primaryText">ESP32-02 — Environmental Sensor Hub</span>
                </div>
                <span className="text-xs font-mono text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">I2C / SPI BUS</span>
              </div>
              <p className="text-xs text-brand-secondaryText leading-relaxed mb-4">
                Samples continuous gas concentrations, applies factory temperature drift compensation, and packages telemetry packets into compact MQTT payloads.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-brand-secondaryText pt-3 border-t border-brand-border/60">
                <div>ADC: 16-Bit ADS1115</div>
                <div>CHANNELS: 8 Sensor</div>
                <div>RATE: 100 Hz</div>
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-success"></span>
                  <span className="font-mono text-sm font-bold text-brand-primaryText">ESP32-03 — Camera & Thermal Module</span>
                </div>
                <span className="text-xs font-mono text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">VISION BUS</span>
              </div>
              <p className="text-xs text-brand-secondaryText leading-relaxed mb-4">
                Manages dual optical 1080p stream and MLX90640 32x24 thermal infrared array with pan/tilt gimbal stabilization.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-brand-secondaryText pt-3 border-t border-brand-border/60">
                <div>PSRAM: 8MB</div>
                <div>STREAM: RTSP/MJPEG</div>
                <div>GIMBAL: 2-Axis</div>
              </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-success"></span>
                  <span className="font-mono text-sm font-bold text-brand-primaryText">ESP32-04 — DustCleaner Filtration Controller</span>
                </div>
                <span className="text-xs font-mono text-brand-warning bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">ACTUATOR BUS</span>
              </div>
              <p className="text-xs text-brand-secondaryText leading-relaxed mb-4">
                Monitors dust accumulation differential pressure, governs brushless blower ESC speeds up to 6,000 RPM, and regulates automated cyclonic purge cycles.
              </p>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-brand-secondaryText pt-3 border-t border-brand-border/60">
                <div>BLOWER: 180W Brushless</div>
                <div>PRESSURE: BMP390</div>
                <div>AIRFLOW: 142 m³/h</div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION C: COMMUNICATION LAYER */}
        <section id="communication" className="space-y-8">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">SECTION C</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Subterranean Communication Layer</h2>
            </div>
            <RadioTower className="w-8 h-8 text-brand-accent hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
                <RadioTower className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">Sub-1GHz Mesh RF</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Operating at 868/915 MHz with long-range chirp modulation to penetrate deep rock, coal seams, and metal reinforcement where 2.4GHz fails completely.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">QoS-1 MQTT Protocol</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Lightweight publish-subscribe message broker guaranteeing command delivery even over intermittent connections with packet deduplication.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <div className="w-10 h-10 rounded bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-brand-primaryText">TLS 1.3 / AES-256</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Hardware-accelerated cryptographic encryption prevents signal tampering or unauthorized teleoperation overrides along remote repeater networks.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION D: BACKEND INFRASTRUCTURE */}
        <section id="backend" className="space-y-8">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">SECTION D</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Supabase Cloud & Edge Infrastructure</h2>
            </div>
            <Database className="w-8 h-8 text-brand-accent hidden sm:block" />
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-brand-primaryText">Realtime Subscriptions & Timeseries Persistence</h3>
                <p className="text-sm text-brand-secondaryText leading-relaxed">
                  Supabase PostgreSQL powers both live web socket broadcasting to connected surface operator consoles and long-term historical timeseries indexing for post-mission incident investigations.
                </p>
                <ul className="space-y-2 text-xs text-brand-secondaryText">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Instant WebSocket telemetry distribution via Supabase Realtime</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Row-Level Security (RLS) guaranteeing authenticated operator role boundaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-success" />
                    <span>Timeseries partitioning for 10M+ sub-surface telemetry points</span>
                  </li>
                </ul>
              </div>

              {/* Technical Code Representation */}
              <div className="bg-brand-bg rounded-lg p-4 border border-brand-border font-mono text-xs text-brand-secondaryText space-y-2 overflow-x-auto">
                <div className="text-brand-accent">// Supabase Realtime Telemetry Hook</div>
                <div>supabase</div>
                <div className="pl-4">.channel(&apos;telemetry-rover01&apos;)</div>
                <div className="pl-4">.on(&apos;broadcast&apos;, &#123; event: &apos;sensor-update&apos; &#125;, (payload) =&gt; &#123;</div>
                <div className="pl-8 text-brand-primaryText">updateDashboardHUD(payload);</div>
                <div className="pl-4">&#125;)</div>
                <div className="pl-4">.subscribe();</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E: INTELLIGENCE LAYER */}
        <section id="intelligence" className="space-y-8">
          <div className="border-b border-brand-border pb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">SECTION E</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Edge Intelligence & Predictive Analysis</h2>
            </div>
            <Brain className="w-8 h-8 text-brand-accent hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <span className="text-xs font-mono text-brand-accent font-bold">BIO-SIGNATURE RECOGNITION</span>
              <h3 className="font-bold text-base text-brand-primaryText">Trapped Miner Detection</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Fused optical and thermal infrared model identifies human silhouettes even when obscured by dust, rubble, or smoke with &gt;98% validation accuracy.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <span className="text-xs font-mono text-brand-warning font-bold">ATMOSPHERIC PREDICTION</span>
              <h3 className="font-bold text-base text-brand-primaryText">Explosive Limit (LEL) Trajectory</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Machine learning regression models forecast methane accumulation trends up to 15 minutes ahead of critical explosive threshold breaches.
              </p>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-3">
              <span className="text-xs font-mono text-brand-success font-bold">THERMAL FLAME ANOMALY</span>
              <h3 className="font-bold text-base text-brand-primaryText">Sub-Surface Ignition Triangulation</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Continuous spatial thermal grid scanning pinpoints spontaneous coal heating hot-spots before visible flame eruption occurs.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Bottom CTA */}
      <section className="py-16 bg-brand-secondary border-t border-brand-border text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText">
            Experience the Complete Command Centre
          </h2>
          <p className="text-brand-secondaryText text-sm max-w-xl mx-auto">
            Interact with live simulated hardware streams, virtual joystick controls, and spatial mine mapping.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-sm shadow-cyan-glow transition-all"
            >
              <span>Launch Command Centre</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

