"use client";

export type News = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
};

export function NewsCard({ item }: { item: News }) {
  const date = new Date(item.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const excerpt =
    item.content.length > 100
      ? `${item.content.slice(0, 100)}…`
      : item.content;

  return (
    <div className="group flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all card-hover cursor-pointer">
      {/* Thumbnail */}
      {item.imageUrl && (
        <div
          className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 bg-cover bg-center"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-0.5 w-5 rounded-full bg-[var(--gold)]" />
          <span className="text-[11px] font-semibold text-slate-400">{date}</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[var(--navy)] transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{excerpt}</p>
        <button className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--navy)] hover:underline">
          Read More
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
