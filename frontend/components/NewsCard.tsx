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
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const excerpt =
    item.content.length > 130 ? `${item.content.slice(0, 130)}…` : item.content;

  return (
    <div className="card-hover group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:border-slate-200 transition-all">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9"
              />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1 w-6 rounded-full bg-[var(--gold)]" />
          <span
            className="text-xs font-semibold text-slate-400"
            suppressHydrationWarning
          >
            {date}
          </span>
        </div>
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[var(--navy)] transition-colors">
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{excerpt}</p>
        <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--navy)] hover:text-[var(--navy-light)] transition-colors group/btn">
          Read More
          <svg
            className="h-3.5 w-3.5 translate-x-0 group-hover/btn:translate-x-1 transition-transform"
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
        </button>
      </div>
    </div>
  );
}
