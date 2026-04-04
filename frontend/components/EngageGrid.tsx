"use client";

import { GlowingEffect } from "./ui/glowing-effect";

const items = [
  {
    title: "Share Opportunities",
    desc: "Post jobs & internships for fellow alumni",
    icon: "💼",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Achievement",
    desc: "Celebrate milestones with your network",
    icon: "🏆",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Be a Mentor",
    desc: "Guide the next generation of engineers",
    icon: "🎓",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Invite",
    desc: "Grow the VCET alumni community",
    icon: "🤝",
    img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80",
  },
];

export function EngageGrid() {
  return (
    <section className="bg-[var(--cream)]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
              Get Involved
            </p>
            <h2 className="section-heading mt-1 text-2xl font-black text-slate-900">
              Engage With Alumni
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:underline"
          >
            View All
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="card-hover group relative h-52 overflow-hidden rounded-2xl cursor-pointer ring-1 ring-black/5"
            >
              <GlowingEffect variant="white" disabled={false} />
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${it.img})` }}
              />
              {/* Gradient overlay — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy-dark)]/90 via-[var(--navy-dark)]/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Icon pill */}
                <div className="self-start rounded-full bg-white/15 px-2.5 py-1 text-lg backdrop-blur-sm">
                  {it.icon}
                </div>
                <div>
                  <div className="text-base font-black text-white">
                    {it.title}
                  </div>
                  <div className="mt-1 text-xs text-white/70 leading-snug">
                    {it.desc}
                  </div>
                </div>
              </div>

              {/* Hover arrow indicator */}
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="rounded-full bg-[var(--gold)] p-1.5">
                  <svg
                    className="h-3 w-3 text-slate-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
