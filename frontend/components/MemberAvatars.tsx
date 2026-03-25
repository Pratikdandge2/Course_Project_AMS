"use client";

export type Member = {
  id: number;
  name: string;
  profilePhoto?: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function MemberAvatars({ items }: { items: Member[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">Latest Members</div>
      <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-10">
        {items.map((m) => (
          <div key={m.id} className="flex flex-col items-center gap-2">
            {m.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.profilePhoto}
                alt={m.name}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                {initials(m.name)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

