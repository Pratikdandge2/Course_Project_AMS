"use client";

import Link from "next/link";

type GroupCardProps = {
  id: number;
  name: string;
  memberCount: number;
  isMember: boolean;
  onJoin: (id: number) => void;
  onLeave: (id: number) => void;
  loading?: boolean;
};

export default function GroupCard({ id, name, memberCount, isMember, onJoin, onLeave, loading }: GroupCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image placeholder */}
      <Link href={`/my-groups/${id}`} className="block">
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-4xl opacity-40">👥</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/my-groups/${id}`} className="text-sm font-bold text-[#1B2F5E] hover:underline leading-tight">
          {name}
        </Link>
        <div className="text-xs text-slate-500">{memberCount} member{memberCount !== 1 ? "s" : ""}</div>

        <button
          type="button"
          disabled={loading}
          onClick={() => (isMember ? onLeave(id) : onJoin(id))}
          className={`mt-auto rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            isMember
              ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              : "bg-[#1B2F5E] text-white hover:bg-[#15264d]"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "..." : isMember ? "Leave" : "Join"}
        </button>
      </div>
    </div>
  );
}
