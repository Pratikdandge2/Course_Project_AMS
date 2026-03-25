"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../../lib/api";

type Event = {
  id: number;
  title: string;
  location: string;
  date: string;
  isPast: boolean;
};

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

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<Event[]>("/api/events")
      .then((items) => setEvent(items.find((e) => e.id === eventId) ?? null))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load event"))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-10">Loading...</div>;

  if (!event) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">Event not found.</div>
        <div className="mt-4">
          <Link href="/events" className="text-sm font-semibold text-[var(--navy)] hover:underline">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const start = new Date(event.date);
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">{event.title}</div>
          <div className="mt-2 text-sm font-semibold text-slate-700">
            📅 {start.toLocaleString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} (IST){" "}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-700">📍 {event.location}</div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95" onClick={() => downloadIcs({ title: event.title, start, location: event.location })}>
            Add to Calendar
          </button>
          <a href={gmaps} target="_blank" rel="noreferrer" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            view on map
          </a>
          <Link href="/events" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            All Events
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-56 bg-gradient-to-r from-slate-900 to-slate-600" />
        <div className="px-6 py-6">
          <div className="text-sm font-extrabold text-slate-900">Event description</div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            Rich text description will be available once event create/edit APIs are implemented. For now, this page shows the basic details (title, date/time, location).
          </div>

          <div className="mt-6 text-sm font-semibold text-slate-600">
            Posted on {start.toLocaleDateString()} by VCETV
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Link href="/events" className="text-sm font-semibold text-[var(--navy)] hover:underline">
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}

