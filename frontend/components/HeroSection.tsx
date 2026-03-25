"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

const slides = [
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60"
];

export function HeroSection() {
  const [idx, setIdx] = useState(0);
  const current = useMemo(() => slides[idx % slides.length], [idx]);

  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % slides.length), 3500);
    return () => window.clearInterval(t);
  }, []);

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          Stay Connected With Your Alma Mater
        </h1>
        <p className="mt-4 max-w-prose text-slate-600">
          Register to join the VCET Alumni Association, discover events, share opportunities, and reconnect with peers.
        </p>
        <Link
          href="/register"
          className="mt-6 inline-flex items-center justify-center rounded bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
        >
          REGISTER
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div
          className="h-64 w-full bg-cover bg-center md:h-80"
          style={{ backgroundImage: `url(${current})` }}
          aria-label="Hero carousel"
        />
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={clsx(
                "h-2.5 w-2.5 rounded-full border border-white/70",
                i === idx ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

