"use client";

import { GlowingEffect } from "./ui/glowing-effect";

export type Member = {
  id: number;
  name: string;
  profilePhoto?: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// Cycle through colours for avatar backgrounds
const colours = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export function MemberAvatars({ items }: { items: Member[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <GlowingEffect variant="white" disabled={false} />
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-bold text-slate-900 tracking-wide">Latest Members</span>
        </div>
        <span className="text-xs font-semibold text-[var(--navy)]">{items.length} joined</span>
      </div>

      {/* Grid — 5 columns max so avatars are readable */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {items.slice(0, 10).map((m, i) => (
          <div key={m.id} className="group flex flex-col items-center gap-1.5 cursor-pointer">
            {m.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.profilePhoto}
                alt={m.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-[var(--navy)] transition-all"
              />
            ) : (
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-slate-100 group-hover:ring-[var(--navy)] transition-all ${colours[i % colours.length]}`}>
                {initials(m.name)}
              </div>
            )}
            <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-800 transition-colors text-center leading-tight truncate w-full text-center">
              {m.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
