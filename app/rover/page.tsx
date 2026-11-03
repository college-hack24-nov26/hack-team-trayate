'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import DustCleanerCard from '@/components/DustCleanerCard';
import { 
  ArrowUpRight, 
  Check, 
  Cpu, 
  Shield, 
  Camera, 
  Wind, 
  Radio, 
  Activity, 
  Compass, 
  Layers 
} from 'lucide-react';

export default function RoverProductPage() {
  const specs = [
    { label: 'Mobility Architecture', value: '6-Wheel Independent Planetary Hub Drive' },
    { label: 'Ground Clearance', value: '350 mm Obstacle Scaling' },
    { label: 'Max Incline Traversal', value: '45° Slope over Rubble & Coal Seams' },
    { label: 'Chassis Material', value: 'Matte Titanium Alloy & Reinforced Carbon Composite' },
    { label: 'Ingress Protection', value: 'IP67 (Hermetically Sealed Water & Dust Proof)' },
    { label: 'Hazard Certification', value: 'ATEX Zone 1 / IECEx Intrinsically Safe Standard' },
    { label: 'Power Supply', value: '24.8V Lithium Iron Phosphate (LiFePO4) 32Ah' },
    { label: 'Operational Runtime', value: '6.5 Hours Continuous Autonomous Patrol' },
    { label: 'Payload Capacity', value: '25 kg Aux Sensor / Rescue Kit Carrier' },
    { label: 'Total Curb Weight', value: '28.5 kg' },
    { label: 'Main Controllers', value: '4x Distributed ESP32 Dual-Core (240MHz FreeRTOS)' },
    { label: 'Communication Radio', value: 'Sub-1GHz Mesh RF (868/915MHz) + 2.4/5GHz Wi-Fi' },
    { label: 'Optical Camera', value: '1080p Low-Light HD Optical Turret (120° FOV)' },
    { label: 'Thermal Sensor', value: '32x24 Long-Wave Infrared (LWIR) False-Color Array' },
    { label: 'Gas Detection Channels', value: 'CH4, CO, CO2, O2, Barometric Pressure, Humidity' },
    { label: 'Dust Mitigation', value: 'Integrated DustCleaner Cyclonic HEPA (142 m³/h)' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primaryText flex flex-col font-sans">
      <Navbar />

      {/* Hero Showcase */}
      <section className="py-20 bg-tech-grid border-b border-brand-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-brand-accent uppercase px-3 py-1 rounded bg-brand-secondary border border-brand-border">
                <span>FLAGSHIP AUTONOMOUS HARDWARE</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-primaryText leading-tight">
                T-Rover Industrial Mine Rescue Robot
              </h1>
              <p className="text-brand-secondaryText text-base sm:text-lg leading-relaxed">
                Engineered from the ground up for extreme durability in underground mining hazards. Equipped with six-wheel independent all-terrain drive, multi-gas sniffer array, and automated dust mitigation.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard/control"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-brand-bg font-semibold text-sm shadow-cyan-glow transition-all"
                >
                  <span>Test Rover Controls</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#specs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-card hover:bg-brand-secondary text-brand-primaryText border border-brand-border text-sm font-semibold transition-all"
                >
                  <span>View Full Spec Sheet</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-xl bg-brand-card border border-brand-border p-3 shadow-2xl relative">
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-brand-border bg-[#05080E]">
                  <Image
                    src="/assets/t-rover.png"
                    alt="T-Rover Six-Wheeled Rover"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 left-3 bg-brand-bg/85 px-3 py-1.5 rounded border border-brand-border text-[10px] font-mono text-brand-primaryText">
                    UNIT: T-ROVER PROTOTYPE // ATEX ZONE 1
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Engineering Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-brand-primaryText">Engineered for Hostile Underground Realities</h2>
          <p className="text-brand-secondaryText text-sm sm:text-base">
            Every module on T-Rover is sealed, redundant, and built to survive explosive gas pockets and collapsed shafts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Six-Wheel Mobility System</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Six brushless in-wheel planetary motors deliver independent torque distribution across all contact patches, withstanding 350mm step climbs and submerged coal slurry without stall.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Industrial Enclosure</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Machined titanium and carbon composite shell provides IP67 sealing against water ingress, coal dust infiltration, and structural rock fall impacts up to 50 Joules.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Multi-Sensor Gas Array</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Integrated aspirating sniffer port pulls ambient air across NDIR methane, electrochemical carbon monoxide, carbon dioxide, oxygen, and barometric transducers.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Vision & Thermal Sensing</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Dual optical camera turret paired with a long-wave infrared (LWIR) grid sensor enables zero-visibility thermal tracking of trapped survivors and spontaneous combustion hot-spots.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-warning">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Integrated DustCleaner Core</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              High-volume cyclonic particulate separator traps airborne coal dust and respirable silica particles, reducing the explosive risk index along inspection corridors.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-brand-card border border-brand-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-secondary border border-brand-border flex items-center justify-center text-brand-accent">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-brand-primaryText">Subterranean RF Architecture</h3>
            <p className="text-xs text-brand-secondaryText leading-relaxed">
              Sub-1GHz mesh radio technology penetrates deep geological strata, automatically synchronizing telemetry via QoS-1 MQTT streams to surface command consoles.
            </p>
          </div>

        </div>

      </section>

      {/* DustCleaner Embedded Section */}
      <section className="py-16 bg-brand-secondary border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText">Active Dust Suppression Core</h2>
            <p className="text-brand-secondaryText text-sm">
              Real-time demonstration of the on-rover filtration module.
            </p>
          </div>
          <DustCleanerCard />
        </div>
      </section>

      {/* Specifications Table */}
      <section id="specs" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-brand-border pb-4">
          <div className="font-mono text-xs font-bold text-brand-accent tracking-widest uppercase">HARDWARE DATASHEET</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-primaryText mt-1">Verified Technical Specifications</h2>
        </div>

        <div className="rounded-xl border border-brand-border overflow-hidden bg-brand-card">
          <div className="divide-y divide-brand-border font-mono text-xs">
            {specs.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-brand-secondary/60 transition-colors gap-2"
              >
                <span className="text-brand-secondaryText font-medium">{item.label}</span>
                <span className="text-brand-primaryText font-bold text-left sm:text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

