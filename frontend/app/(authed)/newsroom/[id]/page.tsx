"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

type News = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string;
};

export default function NewsroomDetailPage() {
  const params = useParams<{ id: string }>();
  const newsId = Number(params.id);

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<News[]>("/api/news")
      .then((items) => {
        const found = items.find((n) => n.id === newsId) ?? null;
        setNews(found);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load news"))
      .finally(() => setLoading(false));
  }, [newsId]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading...</div>;
  }

  if (!news) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">News not found.</div>
        <div className="mt-4">
          <Link href="/newsroom" className="text-sm font-semibold text-[var(--navy)] hover:underline">
            ← Back to Newsroom
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {news.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.imageUrl} alt={news.title} className="h-64 w-full object-cover" />
        ) : (
          <div className="h-64 bg-slate-100" />
        )}

        <div className="px-6 py-6">
          <div className="text-3xl font-extrabold text-slate-900">{news.title}</div>
          <div className="mt-2 text-sm font-semibold text-slate-600">
            Posted on {new Date(news.publishedAt).toLocaleDateString()} by VCETV
          </div>

          <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {news.content}
          </div>

          <div className="mt-6">
            <Link href="/newsroom" className="text-sm font-semibold text-[var(--navy)] hover:underline">
              ← Back to Newsroom
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

