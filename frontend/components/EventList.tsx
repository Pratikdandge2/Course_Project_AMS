"use client";

export type EventItem = {
  id: number;
  title: string;
  location: string;
  date: string;
  isPast: boolean;
};

function monthDay(d: Date) {
  const m = d.toLocaleString(undefined, { month: "short" }).toUpperCase();
  const day = d.getDate();
  return { m, day };
}

export function EventList({ items }: { items: EventItem[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
        Events
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((e) => {
          const d = new Date(e.date);
          const md = monthDay(d);
          return (
            <div key={e.id} className="flex items-start gap-4 px-4 py-4">
              <div className="w-12 text-center">
                <div className="text-xs font-semibold text-slate-500">{md.m}</div>
                <div className="text-lg font-extrabold text-slate-900">{md.day}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {e.isPast ? (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      PAST
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      UPCOMING
                    </span>
                  )}
                  <div className="truncate font-semibold text-slate-900">{e.title}</div>
                </div>
                <div className="mt-1 text-xs text-slate-600">{e.location}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

