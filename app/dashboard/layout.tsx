'use client';

import DashboardSidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-primaryText font-sans selection:bg-brand-accent selection:text-brand-bg">
      {/* Persistent Left Sidebar */}
      <DashboardSidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

