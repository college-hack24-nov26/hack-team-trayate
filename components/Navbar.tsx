'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu, X, ShieldAlert } from 'lucide-react';

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
            <svg className="w-5 h-5 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
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

        {/* Right: Command Centre Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded bg-brand-card hover:bg-brand-secondary text-brand-primaryText border border-brand-border hover:border-brand-accent transition-all duration-200 shadow-cyan-subtle group"
          >
            <span>Launch Command Centre</span>
            <ArrowUpRight className="w-4 h-4 text-brand-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded bg-brand-secondary border border-brand-border text-brand-secondaryText hover:text-brand-primaryText"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-brand-secondary/95 backdrop-blur-lg px-6 py-4 space-y-3 font-medium text-sm text-brand-secondaryText">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-1.5 ${
                pathname === link.href ? 'text-brand-accent font-semibold' : 'hover:text-brand-accent'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full mt-2 py-2.5 text-center text-xs font-semibold rounded bg-brand-accent text-brand-bg uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <span>Launch Command Centre</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </header>
  );
}

