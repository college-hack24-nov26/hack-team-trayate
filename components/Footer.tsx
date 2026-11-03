import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#05080E] border-t border-brand-border py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between pb-12 border-b border-brand-border/60">
          
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-brand-secondary border border-brand-border flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <span className="font-sans text-2xl font-bold tracking-tight text-brand-primaryText">TRAYATE</span>
            </div>
            <p className="text-sm text-brand-secondaryText max-w-sm">
              Intelligent Mine Safety & Rescue System.
            </p>
            <p className="text-xs text-brand-secondaryText/80 font-mono">
              Empowering mining enterprises with autonomous rover technology and zero-latency environmental intelligence.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-mono text-xs font-semibold text-brand-accent tracking-widest uppercase">PLATFORM</div>
            <ul className="space-y-2 text-sm text-brand-secondaryText">
              <li><Link href="/" className="hover:text-brand-primaryText transition-colors">Home</Link></li>
              <li><Link href="/technology" className="hover:text-brand-primaryText transition-colors">Technology</Link></li>
              <li><Link href="/rover" className="hover:text-brand-primaryText transition-colors">T-Rover</Link></li>
              <li><Link href="/about" className="hover:text-brand-primaryText transition-colors">About</Link></li>
              <li><Link href="/dashboard" className="text-brand-accent hover:underline transition-colors">Command Centre</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-mono text-xs font-semibold text-brand-accent tracking-widest uppercase">RESOURCES</div>
            <ul className="space-y-2 text-sm text-brand-secondaryText">
              <li><Link href="/dashboard" className="hover:text-brand-primaryText transition-colors">Live Operations</Link></li>
              <li><a href="mailto:contact@trayate.systems" className="hover:text-brand-primaryText transition-colors">Contact Engineering</a></li>
              <li><a href="https://github.com/college-hack24-nov26/hack-team-trayate" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primaryText transition-colors">GitHub Repository</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-brand-secondaryText gap-4">
          <div>
            © 2026 TRAYATE. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-brand-primaryText cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-brand-primaryText cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="text-brand-accent">Industrial Firmware v4.8.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

