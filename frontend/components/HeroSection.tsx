"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GlowingEffect } from "./ui/glowing-effect";

const slides = [
  {
    img: "/img1.jpg",
    label: "Reconnect with 7,000+ alumni",
  },
  {
    img: "/img2.jpg",
    label: "Discover career opportunities",
  },
  {
    img: "/img3.jpg",
    label: "Share knowledge & mentor peers",
  },
];

const stats = [
  { value: "7,000+", label: "Alumni" },
  { value: "25+",    label: "Years"  },
  { value: "500+",   label: "Jobs Posted" },
  { value: "50+",    label: "Events" },
];

export function HeroSection() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % slides.length),
      4000,
    );
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[600px] overflow-hidden md:min-h-[680px]">

      {/* ── LAYER 1: Real VCET campus photo as full background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vcet-campus.jpg')" }}
        aria-hidden
      />

      {/* ── LAYER 2: Dark navy overlay — gives the blue tint like the login page ── */}
      {/* Adjust the opacity value (0.72) to make it lighter or darker:            */}
      {/* 0.60 = lighter, shows more building | 0.82 = darker, more navy           */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(17,30,61,0.82) 0%, rgba(27,47,94,0.75) 50%, rgba(30,68,128,0.65) 100%)",
        }}
        aria-hidden
      />

      {/* ── CONTENT (sits above all layers) ── */}
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 pb-12 md:grid-cols-2 md:items-center md:py-24 md:pb-20">

        {/* Left — Text */}
        <div>
          {/* Pre-heading badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--gold)] pulse-dot" />
            VCET Alumni Network · Est. 1999
          </div>

          <h1 className="text-4xl font-black leading-[1.1] text-white md:text-5xl lg:text-6xl">
            Stay Connected
            <br />
            <span className="text-gradient">With Your</span>
            <br />
            Alma Mater
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
            Join the VCET Alumni Association — discover events, share
            opportunities, find jobs, and reconnect with batchmates from across
            the globe.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg hover:bg-amber-400 transition-all hover:scale-105"
            >
              <GlowingEffect disabled={false} />
              <span className="relative z-10 flex items-center gap-2">
                JOIN NOW — It&apos;s Free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/login"
              className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/15 hover:border-white transition-all"
            >
              <GlowingEffect disabled={false} />
              <span className="relative z-10">Already a member? Login</span>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-4 gap-4 border-t border-white/10 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-xl font-black text-[var(--gold)]">{s.value}</div>
                <div className="text-xs font-semibold text-white/70 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Carousel */}
        <div className="relative z-10 mt-6 md:mt-0">
          {/* Carousel frame — proper border ring */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-2 ring-white/30 bg-slate-900">
            {slides.map((s, i) => (
              <div
                key={i}
                className={clsx(
                  "absolute inset-0 h-full w-full bg-cover bg-center transition-opacity duration-700",
                  i === idx ? "opacity-100" : "opacity-0",
                )}
                style={{ backgroundImage: `url(${s.img})` }}
              />
            ))}
            {/* Spacer to give height */}
            <div className="relative h-72 md:h-[400px]" />

            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Slide label */}
            <div className="absolute bottom-14 left-4 right-4">
              <div className="inline-block rounded-lg bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/10">
                {slides[idx].label}
              </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIdx(i)}
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    i === idx ? "h-2 w-8 bg-[var(--gold)]" : "h-2 w-2 bg-white/40 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Floating member card — properly ABSOLUTE, positioned at bottom-left of carousel */}
          <div className="absolute -bottom-5 left-3 z-20 rounded-xl bg-white p-3 shadow-xl ring-1 ring-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {["bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-amber-400"].map((c, i) => (
                  <div key={i} className={`h-7 w-7 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">7,000+ Alumni</div>
                <div className="text-[10px] text-slate-500">joined the network</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Smooth fade hero → white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(214,234,248,0.45) 55%, rgba(214,234,248,0.88) 82%, rgba(214,234,248,1) 100%)",
        }}
        aria-hidden
      />
    </section>
  );
}
