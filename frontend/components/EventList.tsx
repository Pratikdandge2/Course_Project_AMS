"use client";

export type EventItem = {
  id: number;
  title: string;
  location: string;
  date: string;
  isPast: boolean;
};

function monthDay(d: Date) {
  return {
    m: d.toLocaleString(undefined, { month: "short" }).toUpperCase(),
    day: d.getDate(),
  };
}

export function EventList({ items }: { items: EventItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-[var(--navy)] to-[#1e4480] px-5 py-4">
        <svg
          className="h-4 w-4 text-[var(--gold)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-bold text-white tracking-wide">
          EVENTS
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        {items.map((e) => {
          const d = new Date(e.date);
          const { m, day } = monthDay(d);
          return (
            <div
              key={e.id}
              className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              {/* Date block */}
              <div
                className={`flex w-14 flex-col items-center justify-center rounded-xl py-2.5 text-center flex-shrink-0 ${
                  e.isPast
                    ? "bg-slate-100 text-slate-400"
                    : "bg-[var(--navy)] text-white shadow-md"
                }`}
              >
                <div className="text-[10px] font-bold tracking-widest">{m}</div>
                <div className="text-2xl font-black leading-none mt-0.5">
                  {day}
                </div>
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1">
                  {e.isPast ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                      Past
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Upcoming
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-[var(--navy)] transition-colors truncate">
                  {e.title}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {e.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
