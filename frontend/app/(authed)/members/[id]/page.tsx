"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";
import toast from "react-hot-toast";

type Member = {
  id: number;
  name: string;
  profilePhoto: string | null;
  department: string | null;
  graduationYear: number | null;
};

const TABS = ["About", "Experience", "Education", "Skills", "Posts"] as const;
type Tab = (typeof TABS)[number];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const memberId = Number(params.id);

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<Tab>("About");

  useEffect(() => {
    setLoading(true);
    apiFetch<Member[]>("/api/members/latest")
      .then((items) => {
        const found = items.find((m) => m.id === memberId) ?? null;
        setMember(found);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load member");
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const batchLabel = useMemo(() => {
    if (!member) return "";
    const year = member.graduationYear ? member.graduationYear : "—";
    return `BE ${year}, ${member.department ?? "-"}`;
  }, [member]);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10">Loading...</div>;
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">
          Member not found (demo uses latest members only).
        </div>
        <div className="mt-4">
          <Link href="/members" className="text-sm font-semibold text-[var(--navy)] hover:underline">
            ← Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Cover */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[var(--navy)] to-slate-600" />

        <div className="px-6 pb-6 pt-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative -mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-slate-100 border border-white shadow-sm">
                {member.profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.profilePhoto} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[var(--navy)]">{initials(member.name)}</span>
                )}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{member.name}</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">{batchLabel}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">Current Role @ Company (coming soon)</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Connect
              </button>
              <button
                type="button"
                className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => toast("Message flow coming soon")}
              >
                Message
              </button>
              <button
                type="button"
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => toast("Email flow coming soon")}
              >
                Send Email
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  tab === t ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 text-sm text-slate-700">
            {tab === "About" ? (
              <>
                <div className="font-extrabold text-slate-900">About</div>
                <div className="mt-2">
                  Alumni profile details (company, work experience, education, skills) will be loaded here once backend member-detail APIs are added.
                </div>
              </>
            ) : null}
            {tab === "Experience" ? (
              <>
                <div className="font-extrabold text-slate-900">Experience</div>
                <div className="mt-2">Coming soon.</div>
              </>
            ) : null}
            {tab === "Education" ? (
              <>
                <div className="font-extrabold text-slate-900">Education</div>
                <div className="mt-2">Batch and course details coming soon.</div>
              </>
            ) : null}
            {tab === "Skills" ? (
              <>
                <div className="font-extrabold text-slate-900">Skills</div>
                <div className="mt-2">Skill tags coming soon.</div>
              </>
            ) : null}
            {tab === "Posts" ? (
              <>
                <div className="font-extrabold text-slate-900">Posts</div>
                <div className="mt-2">User posts coming soon.</div>
              </>
            ) : null}
          </div>

          <div className="mt-6">
            <Link href="/members" className="text-sm font-semibold text-[var(--navy)] hover:underline">
              ← Back to Members
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

