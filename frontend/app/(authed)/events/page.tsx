"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { useRouter } from "next/navigation";

type Event = {
  id: number;
  title: string;
  location: string;
  date: string;
  isPast: boolean;
};

type EventCategory = "reunions" | "webinars" | "hackathons" | "campus-events" | "all";

function detectCategory(title: string): Exclude<EventCategory, "all"> {
  const t = title.toLowerCase();
  if (t.includes("webinar")) return "webinars";
  if (t.includes("hack")) return "hackathons";
  if (t.includes("campus")) return "campus-events";
  if (t.includes("reunion")) return "reunions";
  return "reunions";
}

function downloadIcs({ title, start, location }: { title: string; start: Date; location: string }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = start.getUTCFullYear();
  const mm = pad(start.getUTCMonth() + 1);
  const dd = pad(start.getUTCDate());
  const hh = pad(start.getUTCHours());
  const mi = pad(start.getUTCMinutes());
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const yyyy2 = end.getUTCFullYear();
  const mm2 = pad(end.getUTCMonth() + 1);
  const dd2 = pad(end.getUTCDate());
  const hh2 = pad(end.getUTCHours());
  const mi2 = pad(end.getUTCMinutes());

  // Basic ICS (UTC). For a richer implementation, timezone handling can be improved.
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VCET Alumni//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@vcet-alumni`,
    `DTSTAMP:${yyyy}${mm}${dd}T${hh}${mi}Z`,
    `DTSTART:${yyyy}${mm}${dd}T${hh}${mi}Z`,
    `DTEND:${yyyy2}${mm2}${dd2}T${hh2}${mi2}Z`,
    `SUMMARY:${title.replace(/\\n/g, " ")}`,
    `LOCATION:${location.replace(/\\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${start.toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function EventsPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EventCategory>("all");

  useEffect(() => {
    setLoading(true);
    apiFetch<Event[]>("/api/events")
      .then((items) => setEvents(items))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const categorized = useMemo(() => {
    const map = {
      past: events.filter((e) => e.isPast),
      upcoming: events.filter((e) => !e.isPast)
    };
    function filterByTab(arr: Event[]) {
      if (activeTab === "all") return arr;
      return arr.filter((e) => detectCategory(e.title) === activeTab);
    }
    return {
      past: filterByTab(map.past),
      upcoming: filterByTab(map.upcoming)
    };
  }, [activeTab, events]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Events</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">View upcoming and previous alumni events &amp; conferences from VCETV</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded bg-[#28A745] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => router.push("/events/basic/setup/webinars")}
          >
            + Create Webinar
          </button>
          <button
            type="button"
            className="rounded bg-[#17A2B8] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => router.push("/events/basic/setup")}
          >
            + Create an Event
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-slate-200">
        {[
          { key: "all", label: "All" },
          { key: "reunions", label: "Reunions" },
          { key: "webinars", label: "Webinars" },
          { key: "hackathons", label: "Hackathons" },
          { key: "campus-events", label: "Campus Events" }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`pb-3 text-sm font-semibold ${
              activeTab === (t.key as EventCategory)
                ? "border-b-4 border-[#1B2F5E] text-[#1B2F5E]"
                : "border-b-4 border-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab(t.key as EventCategory)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Past + Upcoming */}
      {loading ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-700">
          Loading events...
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <section>
            <div className="text-xs font-extrabold tracking-wide text-slate-400">PAST EVENTS</div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              {categorized.past.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="card-hover rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
                  onClick={() => router.push(`/events/${e.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-24 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-600" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">{e.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">{e.location}</div>
                      <div className="mt-2 text-xs font-semibold text-slate-500">
                        📅 {new Date(e.date).toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} (IST)
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                      {detectCategory(e.title)}
                    </div>
                  </div>
                </button>
              ))}
              {!categorized.past.length ? (
                <div className="md:col-span-2 rounded-2xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-700">
                  No past events found.
                </div>
              ) : null}
            </div>
          </section>

          <section>
            <div className="text-xs font-extrabold tracking-wide text-slate-400">UPCOMING EVENTS</div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              {categorized.upcoming.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="card-hover rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
                  onClick={() => router.push(`/events/${e.id}`)}
                >
                  <div className="h-24 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-600" />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">{e.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">{e.location}</div>
                      <div className="mt-2 text-xs font-semibold text-slate-500">
                        📅 {new Date(e.date).toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} (IST)
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-700">
                      {detectCategory(e.title)}
                    </div>
                  </div>
                </button>
              ))}
              {!categorized.upcoming.length ? (
                <div className="md:col-span-2 rounded-2xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-700">
                  No upcoming events found.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

