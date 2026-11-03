'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MagicRings from '@/components/MagicRings';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Wind, 
  Scan, 
  Radar, 
  Filter, 
  Activity, 
  Cpu, 
  RadioTower, 
  Database, 
  LayoutDashboard,
  CheckCircle2,
  Crosshair,
  Gauge,
  Droplets,
  Thermometer,
  Sparkles
} from 'lucide-react';
import { useTelemetry } from '@/lib/telemetryStore';

export default function LandingPage() {
  const { telemetry } = useTelemetry();

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primaryText flex flex-col font-sans selection:bg-brand-accent selection:text-brand-bg">
      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION (Full-screen, Impressive, 3D Industrial Render Focal Point)  */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center pt-8 pb-16 lg:py-20 bg-tech-grid overflow-hidden">
        
        {/* MagicRings Interactive WebGL Particle Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden flex items-center justify-center">
          <div className="w-[1250px] h-[850px] max-w-full max-h-full relative opacity-70">
            <MagicRings
              color="#38BDF8"
              colorTwo="#0EA5E9"
              motion="pulse"
              ringCount={6}
              speed={0.8}
              lineThickness={1.8}
              glow={1.4}
              hoverScale={1.18}
              hoverIntensity={1.2}
              clickBurst={true}
              followMouse={true}
              mouseInfluence={0.12}
              parallax={0.05}
              tilt={-10}
              opacity={0.7}
              theme="dark"
            />
          </div>
        </div>

        {/* Subtle Restrained Ambient Cyan Glow Field */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-accent/8 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary/90 border border-brand-border">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_#38BDF8]"></span>
                <span className="font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase">
                  NEXT-GENERATION MINE SAFETY TECHNOLOGY
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-primaryText leading-[1.1]">
                Into the depths.<br />
                <span className="bg-gradient-to-r from-brand-accent via-[#38BDF8] to-[#93C5FD] bg-clip-text text-transparent">
                  Beyond human limits.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-brand-secondaryText max-w-xl leading-relaxed">
                An intelligent mine safety and rescue rover designed to monitor hazardous environments, detect critical threats and support rescue operations where human access becomes dangerous.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/rover"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm bg-brand-accent hover:bg-brand-accent-hover text-brand-bg transition-all duration-200 shadow-cyan-glow active:scale-[0.98]"
                >
                  <span>Explore T-Rover</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/mission"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm bg-brand-card hover:bg-brand-secondary text-brand-primaryText border border-brand-border hover:border-brand-accent transition-all duration-200 active:scale-[0.98]"
                >
                  <span>Launch Command Centre</span>
                  <ArrowUpRight className="w-4 h-4 text-brand-accent" />
                </Link>
              </div>

              {/* Micro-information bar */}
              <div className="pt-4 border-t border-brand-border/60 flex flex-wrap items-center gap-y-2 gap-x-4 font-mono text-[11px] text-brand-secondaryText">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  REAL-TIME MONITORING
                </span>
                <span className="text-brand-border">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  INTELLIGENT DETECTION
                </span>
                <span className="text-brand-border">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  REMOTE OPERATIONS
                </span>
              </div>

            </div>

            {/* Right Column: 3D-Style Industrial Render of 4WD Rover */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-xl bg-brand-card/90 border border-brand-border p-2 sm:p-3 shadow-2xl overflow-hidden group">
                
                {/* Tactical HUD Corner Reticles */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-brand-accent z-20"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-brand-accent z-20"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-brand-accent z-20"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-brand-accent z-20"></div>

                {/* Top Status Strip */}
                <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-brand-secondary/90 border border-brand-border/60 rounded text-[11px] font-mono text-brand-secondaryText">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-semibold">UNIT // T-ROVER 01</span>
                    <span className="text-brand-border">|</span>
                    <span className="hidden sm:inline">4-WHEEL DRIVE (4WD) ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
                    <span className="text-brand-success font-medium">SYSTEM READY</span>
                  </div>
                </div>

                {/* Image Container with 3D Industrial Render */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-lg border border-brand-border bg-[#05080E]">
                  <Image
                    src="/assets/t-rover.png"
                    alt="T-Rover: 4WD Industrial Mine Rescue Rover Prototype"
                    fill
                    className="object-cover object-center filter contrast-105 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    priority
                  />

                  {/* Gradient & Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/85 via-transparent to-brand-bg/20 pointer-events-none"></div>

                  {/* Top-Right Telemetry Badge */}
                  <div className="absolute top-3 right-3 bg-brand-bg/85 backdrop-blur-md border border-brand-border px-3 py-1.5 rounded text-[10px] font-mono space-y-0.5 pointer-events-none shadow-lg">
                    <div className="flex justify-between gap-3 text-brand-secondaryText">
                      <span>DEPTH:</span>
                      <span className="text-brand-primaryText font-semibold">{telemetry.rover.depthMeters} M</span>
                    </div>
                    <div className="flex justify-between gap-3 text-brand-secondaryText">
                      <span>BATTERY:</span>
                      <span className="text-brand-accent font-semibold">{telemetry.rover.batteryPercent}% [24.8V]</span>
                    </div>
                  </div>

                  {/* Bottom-Left Targeting HUD */}
                  <div className="absolute bottom-3 left-3 bg-brand-bg/85 backdrop-blur-md border border-brand-accent/40 px-3 py-2 rounded text-[10px] font-mono pointer-events-none">
                    <div className="flex items-center gap-2 text-brand-accent font-bold">
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>LIDAR + GAS SCANNER ARMED</span>
                    </div>
                    <div className="text-[9px] text-brand-secondaryText mt-0.5">
                      ESP32 DUAL-BUS // LATENCY: {telemetry.rover.latencyMs}ms
                    </div>
                  </div>
                </div>

                {/* Bottom Frame Detail */}
                <div className="mt-2 px-3 py-1.5 bg-brand-secondary/90 border border-brand-border/60 rounded flex items-center justify-between font-mono text-[10px] text-brand-secondaryText">
                  <span>CHASSIS: INDUSTRIAL GRADE TITANIUM-ALLOY</span>
                  <span className="text-brand-accent">ATEX / IECEx COMPLIANT</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LIVE SYSTEM STATUS STRIP                                                 */}
      {/* ========================================================================= */}
      <section className="w-full bg-brand-secondary border-y border-brand-border py-4 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 font-mono text-xs">
            
            {/* 4 Compact Status Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-brand-secondaryText text-[10px]">Rover Connectivity</span>
                  <span className="font-bold text-brand-success tracking-wider">{telemetry.rover.connectivity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent shadow-[0_0_8px_#38BDF8]"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-brand-secondaryText text-[10px]">Sensor Network</span>
                  <span className="font-bold text-brand-accent tracking-wider">ACTIVE</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-brand-success"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-brand-secondaryText text-[10px]">Env. Monitoring</span>
                  <span className="font-bold text-brand-success tracking-wider">LIVE</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-brand-secondaryText text-[10px]">AI Vision</span>
                  <span className="font-bold text-brand-accent tracking-wider">ACTIVE</span>
                </div>
              </div>

            </div>

            {/* Protocol & Supabase Live Data Sync Flag */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-brand-secondaryText pt-2 lg:pt-0 border-t lg:border-t-0 border-brand-border/60">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-accent" />
                <span>SUPABASE READY</span>
              </span>
              <span className="text-brand-border">|</span>
              <span className="flex items-center gap-1.5">
                <RadioTower className="w-3.5 h-3.5 text-brand-accent" />
                <span>MQTT 100Hz</span>
              </span>
              <span className="text-brand-border">|</span>
              <span className="text-brand-accent font-semibold">{telemetry.rover.latencyMs}ms LATENCY</span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TECHNOLOGY OVERVIEW SECTION (4 Premium Feature Cards)                     */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-left mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>ENGINEERED FOR HAZARDOUS ENVIRONMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primaryText tracking-tight">
            Multiple layers of intelligence. One mission.
          </h2>
          <p className="text-brand-secondaryText text-base sm:text-lg max-w-2xl">
            Built with hardware-level redundancy and edge-computed machine intelligence to maintain operational integrity in explosive and zero-visibility mine shafts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Environmental Intelligence */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-brand-accent/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mb-6">
                <Wind className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-brand-accent font-semibold uppercase tracking-widest mb-1">
                01 // ATMOSPHERIC SENSING
              </div>
              <h3 className="text-xl font-bold text-brand-primaryText mb-3">
                Environmental Intelligence
              </h3>
              <p className="text-sm text-brand-secondaryText leading-relaxed">
                Continuous monitoring of hazardous gases, temperature, humidity and environmental conditions with calibrated sub-ppm precision.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border/60 font-mono text-xs flex justify-between items-center">
              <span className="text-brand-secondaryText">CH4 / CO / O2 / H2S</span>
              <span className="text-brand-accent">100Hz Refresh</span>
            </div>
          </div>

          {/* Card 2: AI-Powered Vision */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-brand-accent/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mb-6">
                <Scan className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-brand-accent font-semibold uppercase tracking-widest mb-1">
                02 // COMPUTER VISION
              </div>
              <h3 className="text-xl font-bold text-brand-primaryText mb-3">
                AI-Powered Vision
              </h3>
              <p className="text-sm text-brand-secondaryText leading-relaxed">
                Intelligent visual monitoring with human, smoke and fire detection capabilities powered by on-chassis edge neural inference.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border/60 font-mono text-xs flex justify-between items-center">
              <span className="text-brand-secondaryText">Edge YOLO Model</span>
              <span className="text-brand-success font-semibold">98.4% Accuracy</span>
            </div>
          </div>

          {/* Card 3: Obstacle Ranging & Turret Scanner */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-brand-accent/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mb-6">
                <Radar className="w-6 h-6" />
              </div>
              <div className="text-[10px] text-brand-accent font-semibold uppercase tracking-widest mb-1">
                03 // OBSTACLE SCANNING
              </div>
              <h3 className="text-xl font-bold text-brand-primaryText mb-3">
                Ultrasonic Servo Scanner
              </h3>
              <p className="text-sm text-brand-secondaryText leading-relaxed">
                HC-SR04 ultrasonic distance sensor mounted on a 180° pan servo scanner providing real-time obstacle telemetry and collision deadbands.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border/60 text-xs flex justify-between items-center">
              <span className="text-brand-secondaryText">Obstacle Distance</span>
              <span className="text-brand-success font-semibold">180° Sweep Active</span>
            </div>
          </div>

          {/* Card 4: Remote Operations */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-brand-accent/50 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <div className="font-mono text-[10px] text-brand-accent font-semibold uppercase tracking-widest mb-1">
                04 // UNIFIED COMMAND
              </div>
              <h3 className="text-xl font-bold text-brand-primaryText mb-3">
                Remote Operations
              </h3>
              <p className="text-sm text-brand-secondaryText leading-relaxed">
                Monitor rover telemetry, receive alerts and operate the rover remotely through a unified command interface with redundant failover links.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border/60 font-mono text-xs flex justify-between items-center">
              <span className="text-brand-secondaryText">Control Latency</span>
              <span className="text-brand-accent font-semibold">&lt; 14ms (Sub-1GHz)</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* MEET T-ROVER SECTION (Product Showcase)                                  */}
      {/* ========================================================================= */}
      <section className="py-24 bg-brand-secondary border-y border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-3xl mb-16 space-y-3">
            <div className="font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase">
              ROBOTIC PLATFORM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primaryText tracking-tight">
              Meet T-Rover.
            </h2>
            <p className="text-brand-secondaryText text-base sm:text-lg">
              An integrated robotic platform designed to extend situational awareness into hazardous underground environments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Rover Image with Callouts */}
            <div className="lg:col-span-7 relative">
              <div className="rounded-xl bg-brand-card border border-brand-border p-3 sm:p-4 shadow-2xl relative overflow-hidden">
                <div className="relative rounded-lg overflow-hidden aspect-[16/10] bg-[#05080E] border border-brand-border">
                  <Image
                    src="/assets/t-rover.png"
                    alt="T-Rover 4WD Rescue Platform"
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/75 via-transparent to-transparent pointer-events-none"></div>

                  {/* Hotspots */}
                  <div className="absolute top-[22%] left-[45%]">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
                    </span>
                  </div>
                  <div className="absolute top-[48%] left-[72%]">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-accent"></span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-brand-secondaryText px-1">
                  <span>WEIGHT: 28.5 KG</span>
                  <span>RUN TIME: 6.5 HRS CONT.</span>
                  <span className="text-brand-accent">IP67 WATER / DUST TIGHT</span>
                </div>
              </div>
            </div>

            {/* Highlights List */}
            <div className="lg:col-span-5 space-y-3.5">
              
              <div className="p-4 rounded-lg bg-brand-card border border-brand-border">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-brand-primaryText text-sm sm:text-base">4WD Industrial Mobility</h4>
                  <span className="font-mono text-[10px] text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">350mm Clearance</span>
                </div>
                <p className="text-xs text-brand-secondaryText leading-relaxed">
                  High-torque planetary hub motors engineered for rough mine rubble, flooded shafts, and 45° inclines.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-card border border-brand-border">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-brand-primaryText text-sm sm:text-base">Multi-Sensor Integration</h4>
                  <span className="font-mono text-[10px] text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">6-Gas + Thermal</span>
                </div>
                <p className="text-xs text-brand-secondaryText leading-relaxed">
                  Continuous real-time gas sampling for CH4, CO, CO2, O2, ambient barometric pressure, and humidity.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-card border border-brand-border">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-brand-primaryText text-sm sm:text-base">ESP32-Based Distributed Control</h4>
                  <span className="font-mono text-[10px] text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">Dual-Core RTOS</span>
                </div>
                <p className="text-xs text-brand-secondaryText leading-relaxed">
                  Hardware-isolated controllers manage motor PID loops, sensor calibration, and automated fail-safe watchdogs.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-brand-card border border-brand-border">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-brand-primaryText text-sm sm:text-base">Wireless Communication</h4>
                  <span className="font-mono text-[10px] text-brand-accent bg-brand-secondary px-2 py-0.5 rounded border border-brand-border">Sub-1GHz Mesh</span>
                </div>
                <p className="text-xs text-brand-secondaryText leading-relaxed">
                  Sub-surface RF mesh penetration with automatic failover to Wi-Fi surface gateway nodes.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/rover"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-primaryText transition-colors"
                >
                  <span>Explore the Technology →</span>
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW IT WORKS (End-to-End Pipeline)                                       */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase">
            DATA PIPELINE & SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primaryText tracking-tight">
            From underground sensing to real-time intelligence.
          </h2>
          <p className="text-brand-secondaryText text-base sm:text-lg">
            A resilient, distributed pipeline engineered without single points of failure to deliver zero-delay situational awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-accent px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">01</span>
                <Activity className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-base font-bold text-brand-primaryText">SENSOR NETWORK</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Environmental sensors collect real-time readings including gas levels, temperature, and dust.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-border/60 font-mono text-[10px] text-brand-secondaryText">
              RAW I2C / SPI HARDWARE
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-accent px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">02</span>
                <Cpu className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-base font-bold text-brand-primaryText">ESP32 CONTROLLERS</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Distributed microcontrollers collect and process hardware data and motor control loops.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-border/60 font-mono text-[10px] text-brand-secondaryText">
              FREE-RTOS PROCESSING
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-accent px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">03</span>
                <RadioTower className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-base font-bold text-brand-primaryText">MQTT TRANSMISSION</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Telemetry and commands are transmitted through MQTT over subterranean mesh channels.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-border/60 font-mono text-[10px] text-brand-accent">
              QoS-1 &lt; 15ms MESH
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-accent px-2 py-0.5 rounded bg-brand-secondary border border-brand-border">04</span>
                <Database className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-base font-bold text-brand-primaryText">CLOUD BACKEND</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Supabase stores readings and distributes live updates with realtime subscriptions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-border/60 font-mono text-[10px] text-brand-secondaryText">
              SUPABASE POSTGRES
            </div>
          </div>

          <div className="bg-brand-card border border-brand-accent/50 rounded-xl p-5 flex flex-col justify-between shadow-cyan-subtle">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-bg px-2 py-0.5 rounded bg-brand-accent">05</span>
                <LayoutDashboard className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-base font-bold text-brand-primaryText">COMMAND CENTRE</h3>
              <p className="text-xs text-brand-secondaryText leading-relaxed">
                Operators visualize conditions, monitor alerts and control rover operations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-brand-border/60 font-mono text-[10px] text-brand-accent font-semibold">
              SURFACE OPERATOR TERMINAL
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA                                                                */}
      {/* ========================================================================= */}
      <section className="py-28 relative overflow-hidden bg-brand-bg text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[350px] bg-brand-accent/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase px-3 py-1 rounded bg-brand-secondary border border-brand-border">
            <span>INDUSTRIAL SAFETY PLATFORM</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-primaryText tracking-tight">
            Building safer underground operations.
          </h2>

          <p className="text-brand-secondaryText text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Explore how intelligent robotics and real-time environmental intelligence can transform mine safety and rescue operations.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard/mission"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-base bg-brand-accent hover:bg-brand-accent-hover text-brand-bg transition-all duration-200 shadow-cyan-glow active:scale-[0.98]"
            >
              <span>Enter Command Centre</span>
              <ArrowUpRight className="w-5 h-5" />
            </Link>

            <Link
              href="/technology"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-lg font-semibold text-base bg-brand-card hover:bg-brand-secondary text-brand-primaryText border border-brand-border hover:border-brand-accent transition-all duration-200"
            >
              <span>Review Technical Specs</span>
              <ArrowRight className="w-5 h-5 text-brand-accent" />
            </Link>
          </div>

          <div className="pt-8 text-xs font-mono text-brand-secondaryText flex flex-wrap items-center justify-center gap-6">
            <span>ISO 10218 ROBOTIC SAFETY COMPLIANT</span>
            <span>•</span>
            <span>ATEX ZONE 1 CERTIFIED DESIGN</span>
            <span>•</span>
            <span>MISSION CRITICAL SLA 99.99%</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
