'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X, Shield, Gamepad2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/technology', label: 'Technology' },
    { href: '/rover', label: 'T-Rover' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080D14]/90 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded bg-brand-secondary border border-brand-border flex items-center justify-center transition-all duration-300 group-hover:border-brand-accent group-hover:shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            <Shield className="w-5 h-5 text-brand-accent" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-accent animate-ping"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xl font-bold tracking-tight text-brand-primaryText">TRAYATE</span>
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-brand-secondary border border-brand-border text-brand-accent rounded">
                SaaS
              </span>
            </div>
            <span className="font-mono text-[9px] text-brand-secondaryText tracking-widest uppercase -mt-0.5">
              MINE SAFETY ROBOTICS
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-accent font-semibold'
                    : 'text-brand-secondaryText hover:text-brand-primaryText'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Command Centre & Start Mission Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-brand-secondary hover:bg-brand-card text-brand-secondaryText hover:text-brand-primaryText border border-brand-border transition-all"
          >
            <span>Overview</span>
          </Link>

          <Link
            href="/dashboard/mission"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded bg-brand-accent/15 hover:bg-brand-accent/25 text-brand-accent border border-brand-accent/40 hover:border-brand-accent transition-all duration-200 shadow-[0_0_15px_rgba(56,189,248,0.15)] group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span>Start Mission</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-brand-secondaryText hover:text-brand-primaryText hover:bg-brand-secondary focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-secondary border-b border-brand-border px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-brand-secondaryText hover:text-brand-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-brand-border flex flex-col gap-2">
            <Link
              href="/dashboard/mission"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold rounded bg-brand-accent text-brand-bg flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Start Mission (Teleoperation)</span>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-semibold rounded bg-brand-card text-brand-primaryText border border-brand-border"
            >
              Operations Overview
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
