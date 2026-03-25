"use client";

export type GalleryPhoto = {
  id: number;
  imageUrl: string;
  caption?: string | null;
};

export function GalleryStrip({ items }: { items: GalleryPhoto[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">Photos</div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {items.map((p) => (
          <div key={p.id} className="min-w-[220px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <div
              className="h-28 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${p.imageUrl})` }}
            />
            {p.caption ? <div className="px-3 py-2 text-xs text-slate-600">{p.caption}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

