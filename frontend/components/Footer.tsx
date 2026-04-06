"use client";

import { GlowingEffect } from "./ui/glowing-effect";

const social = [
  { label: "Website",   href: "#", color: "bg-blue-500",    letter: "W" },
  { label: "Facebook",  href: "#", color: "bg-[#1877f2]",   letter: "f" },
  { label: "Twitter",   href: "#", color: "bg-[#1da1f2]",   letter: "𝕏" },
  { label: "LinkedIn",  href: "#", color: "bg-[#0a66c2]",   letter: "in" },
  { label: "YouTube",   href: "#", color: "bg-[#ff0000]",   letter: "▶" },
  { label: "Instagram", href: "#", color: "bg-pink-600",    letter: "IG" },
];

const bottom = ["Disclaimer", "Terms of Use", "Privacy Policy", "Alumni Directory"];

export function Footer() {
  return (
    <footer className="bg-transparent text-slate-300">

      {/* ── MAIN 3-COLUMN GRID ── */}
      <div className="mx-auto max-w-6xl grid gap-10 px-4 py-12 md:grid-cols-3">

        {/* Column 1 — Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="https://vcet.edu.in/wp-content/uploads/2026/02/College_Logo_R-removebg-preview.png" 
              alt="VCET Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="text-sm font-black text-white">VCET</div>
              <div className="text-xs text-slate-400">Alumni Association</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
            Vidyavardhini's College of Engineering and Technology, Vasai.
            Keeping our alumni connected, inspired, and growing.
          </p>
        </div>

        {/* Column 2 — Social links */}
        <div>
          {/* Section label — clearly visible */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3.5 w-0.5 rounded-full bg-[var(--gold)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              Follow Us
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="relative overflow-hidden flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/15 hover:text-white hover:border-white/50 transition-all"
              >
                <GlowingEffect disabled={false} />
                <span className="relative z-10 flex w-full items-center gap-2">
                  {/* Coloured brand dot instead of emoji */}
                  <span className={`h-4 w-4 rounded-sm ${s.color} flex items-center justify-center text-[9px] font-black text-white flex-shrink-0`}>
                    {s.letter}
                  </span>
                  {s.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Column 3 — App download */}
        <div>
          {/* Section label — clearly visible */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3.5 w-0.5 rounded-full bg-[var(--gold)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">
              Download App
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Google Play */}
            <a
              href="#"
              className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-white/25 bg-white/5 px-4 py-3 hover:bg-white/15 hover:border-white/50 transition-all group"
            >
              <GlowingEffect disabled={false} />
              <div className="relative z-10 flex w-full items-center gap-3">
                {/* Play triangle icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Get it on</div>
                  <div className="text-sm font-bold text-white">Google Play</div>
                </div>
              </div>
            </a>

            {/* App Store */}
            <a
              href="#"
              className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-white/25 bg-white/5 px-4 py-3 hover:bg-white/15 hover:border-white/50 transition-all group"
            >
              <GlowingEffect disabled={false} />
              <div className="relative z-10 flex w-full items-center gap-3">
                {/* Apple icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 flex-shrink-0 group-hover:bg-white/20 transition-colors">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Download on the</div>
                  <div className="text-sm font-bold text-white">App Store</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-400">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {bottom.map((b) => (
              <a key={b} href="#" className="hover:text-white transition-colors">
                {b}
              </a>
            ))}
          </div>
          <div>© {new Date().getFullYear()} VCET Alumni Association. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
