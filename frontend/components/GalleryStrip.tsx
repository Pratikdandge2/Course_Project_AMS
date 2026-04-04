"use client";

import { GlowingEffect } from "./ui/glowing-effect";

export type GalleryPhoto = {
  id: number;
  imageUrl: string;
  caption?: string | null;
};

export function GalleryStrip({ items }: { items: GalleryPhoto[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <GlowingEffect variant="white" disabled={false} />
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg className="h-4 w-4 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-bold text-slate-900 tracking-wide">Photo Gallery</span>
      </div>

      {/* Scrollable strip — hidden scrollbar */}
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((p) => (
          <div
            key={p.id}
            className="group relative min-w-[200px] overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
          >
            <GlowingEffect variant="white" disabled={false} />
            <div
              className="h-32 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${p.imageUrl})` }}
            />
            {p.caption && (
              <div className="px-3 py-2 text-xs font-medium text-slate-600 truncate">
                {p.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll hint dots */}
      <div className="mt-3 flex justify-center gap-1.5">
        {items.slice(0, Math.min(items.length, 5)).map((_, i) => (
          <div key={i} className={`h-1 rounded-full ${i === 0 ? "w-4 bg-[var(--navy)]" : "w-1.5 bg-slate-200"}`} />
        ))}
      </div>
    </div>
  );
}
