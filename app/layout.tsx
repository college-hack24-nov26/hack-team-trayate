import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRAYATE — Intelligent Mine Safety & Rescue System',
  description: 'AI-Powered Mine Safety & Rescue Rover Platform. Real-time underground telemetry, environmental sensing, and mission-critical teleoperation.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-brand-bg text-brand-primaryText antialiased selection:bg-brand-accent selection:text-brand-bg font-sans">
        {children}
      </body>
    </html>
  );
}
