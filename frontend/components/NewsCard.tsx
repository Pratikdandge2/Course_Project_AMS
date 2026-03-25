"use client";

export type News = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
};

export function NewsCard({ item }: { item: News }) {
  const date = new Date(item.publishedAt).toLocaleDateString();
  const excerpt = item.content.length > 120 ? `${item.content.slice(0, 120)}…` : item.content;
  return (
    <div className="card-hover overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        className="h-32 w-full bg-slate-100 bg-cover bg-center"
        style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }}
      />
      <div className="p-4">
        <div className="text-xs text-slate-500" suppressHydrationWarning>{date}</div>
        <div className="mt-1 font-semibold text-slate-900">{item.title}</div>
        <div className="mt-2 text-sm text-slate-600">{excerpt}</div>
        <button className="mt-3 text-sm font-semibold text-[var(--navy)] hover:underline">
          Read More
        </button>
      </div>
    </div>
  );
}

