"use client";

const items = [
  { title: "Share Opportunities", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=60" },
  { title: "Achievement", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=60" },
  { title: "Be a Mentor", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60" },
  { title: "Invite", img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=60" }
];

export function EngageGrid() {
  return (
    <section className="bg-[var(--cream)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-extrabold text-slate-900">Engage With Alumni</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="card-hover relative h-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${it.img})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">
                {it.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

