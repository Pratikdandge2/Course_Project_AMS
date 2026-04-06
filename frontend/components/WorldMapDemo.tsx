"use client";

import WorldMap from "@/components/ui/world-map";

export function WorldMapDemo() {
  return (
    <div className="w-full h-full">
      <WorldMap
        lineColor="rgba(255,255,255,0.08)"
        dots={[]}
      />
    </div>
  );
}
