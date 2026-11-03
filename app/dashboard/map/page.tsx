'use client';

import MineMapCanvas from '@/components/dashboard/MineMapCanvas';

export default function MineMapPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-brand-border pb-4">
        <h2 className="font-sans text-xl font-bold text-brand-primaryText">Sub-Surface Spatial Mine Mapping</h2>
        <p className="font-mono text-xs text-brand-secondaryText mt-0.5">
          2D OCCUPANCY GRID // SLAM LOCALIZATION // GEOLOGICAL HAZARD LAYERS
        </p>
      </div>

      <MineMapCanvas />
    </div>
  );
}

