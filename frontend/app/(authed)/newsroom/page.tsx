"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";

type News = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
};

type ArchiveItem = { key: string; label: string; count: number };

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function NewsroomPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeArchive, setActiveArchive] = useState<string>("All");

  useEffect(() => {
    setLoading(true);
    apiFetch<News[]>("/api/news")
      .then((items) => setNews(items))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load news"))
      .finally(() => setLoading(false));
  }, []);

  const archives = useMemo<ArchiveItem[]>(() => {
    const map = new Map<string, ArchiveItem>();
    for (const n of news) {
      const d = new Date(n.publishedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = monthLabel(d);
      const cur = map.get(key);
      map.set(key, { key, label, count: (cur?.count ?? 0) + 1 });
    }
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [news]);

  const filteredNews = useMemo(() => {
    if (activeArchive === "All") return news;
    return news.filter((n) => {
      const d = new Date(n.publishedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === activeArchive;
    });
  }, [activeArchive, news]);

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <div className="text-2xl font-extrabold text-slate-900">Newsroom</div>
        <div className="mt-1 text-sm font-semibold text-slate-600">All the News and Updates from VCETV</div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left */}
        <section className="lg:col-span-3">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-700">
                Loading news...
              </div>
            ) : (
              filteredNews.map((n) => (
                <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm card-hover">
                  <div className="flex gap-4">
                    <div className="h-28 w-32 overflow-hidden rounded-xl bg-slate-100">
                      {n.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.imageUrl} alt={n.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold text-slate-900">{n.title}</div>
                      <div className="mt-2 line-clamp-3 text-xs font-semibold text-slate-600">{n.content}</div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Link
                          href={`/newsroom/${n.id}`}
                          className="rounded border-2 border-[#17A2B8] px-3 py-2 text-xs font-semibold text-[#17A2B8] hover:bg-[#17A2B8]/5"
                        >
                          Read More
                        </Link>
                        <div className="text-xs font-semibold text-slate-500">
                          {new Date(n.publishedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right archive */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">Archive</div>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${
                  activeArchive === "All" ? "bg-slate-50" : ""
                }`}
                onClick={() => setActiveArchive("All")}
              >
                All
              </button>
              {archives.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 ${
                    activeArchive === a.key ? "bg-slate-50" : ""
                  }`}
                  onClick={() => setActiveArchive(a.key)}
                >
                  <span className="text-slate-700">{a.label}</span>
                  <span className="text-slate-500">{a.count}</span>
                </button>
              ))}
              {!archives.length ? <div className="text-xs font-semibold text-slate-500">No archive items</div> : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

