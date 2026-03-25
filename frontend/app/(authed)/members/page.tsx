"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";

type Member = {
  id: number;
  name: string;
  profilePhoto: string | null;
  department: string | null;
  graduationYear: number | null;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const SEARCH_TABS = ["Name, Email & Roll No", "Course & Year", "Location", "Company", "Work Experience"] as const;
type SearchTab = (typeof SEARCH_TABS)[number];

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [browseKey, setBrowseKey] = useState<string>(""); // UI-only for now

  const [tab, setTab] = useState<SearchTab>("Name, Email & Roll No");
  const [query, setQuery] = useState("");

  const [alphabet, setAlphabet] = useState<string>("");
  const [showFilter, setShowFilter] = useState<"All" | "Faculty" | "Batchmates" | "Registered Only">("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Name A-Z">("Newest");

  useEffect(() => {
    setLoading(true);
    apiFetch<Member[]>("/api/members/latest")
      .then((items) => setMembers(items))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load members";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let arr = [...members];

    if (browseKey) {
      // We don't have browse metadata from the backend yet; keep it minimal and predictable.
      if (browseKey === "Institute") {
        // best-effort: department is the closest proxy we have
        arr = arr.filter((m) => (m.department ?? "").toLowerCase().includes("engineering"));
      }
    }

    if (alphabet) {
      const a = alphabet.toUpperCase();
      arr = arr.filter((m) => m.name.toUpperCase().startsWith(a));
    }

    if (showFilter !== "All") {
      // Since latest members is already approved alumni, treat "Registered Only" as same.
      // Other filters will be implemented once /api/members supports richer filtering.
      if (showFilter === "Registered Only") {
        arr = arr;
      }
    }

    const q = query.trim().toLowerCase();
    if (q) {
      arr = arr.filter((m) => {
        const hay = `${m.name} ${(m.department ?? "")} ${m.graduationYear ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (sortBy === "Name A-Z") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }

    return arr;
  }, [alphabet, browseKey, members, query, showFilter, sortBy]);

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <div className="text-2xl font-extrabold text-slate-900">Members</div>
        <div className="mt-1 text-sm font-semibold text-slate-600">Search and connect with friends, batchmates and other alumni</div>
      </div>

      {/* Browse By Bar */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {["Location", "Institute", "Company", "Roles", "Professional Skills", "Industry"].map((p) => (
          <button
            key={p}
            type="button"
            className={`rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 ${
              browseKey === p ? "bg-slate-50" : ""
            }`}
            onClick={() => setBrowseKey((k) => (k === p ? "" : p))}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Search Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {SEARCH_TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                tab === t ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Sort by</span>
          <select
            className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-slate-400"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="Newest">Newest</option>
            <option value="Name A-Z">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="flex-1 min-w-[220px] rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "Name, Email & Roll No" ? "Name or email" : tab === "Course & Year" ? "Degree or year" : "Search members"}
        />
        <button type="button" className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95" onClick={() => toast("Search applied")}>
          → Search
        </button>
      </div>

      {/* Alphabet quick-filter */}
      <div className="mt-4 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((a) => (
          <button
            key={a}
            type="button"
            className={`rounded-full px-2 py-1 hover:bg-slate-50 ${alphabet === a ? "bg-slate-100" : ""}`}
            onClick={() => setAlphabet((v) => (v === a ? "" : a))}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Show filter pills */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Faculty", "Batchmates", "Registered Only"] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                showFilter === p ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setShowFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="text-xs font-semibold text-slate-600">
          {filtered.length} Member(s) Found
        </div>
      </div>

      {/* Member Grid */}
      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm font-semibold text-slate-700">Loading members...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm text-sm font-semibold text-rose-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => router.push(`/members/${m.id}`)}
                className="relative rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md"
              >
                <div className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  ✓
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-slate-100">
                    {m.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.profilePhoto} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--navy)]">{initials(m.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-slate-900">{m.name}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">
                      {m.graduationYear ? `BE ${m.graduationYear}` : "BE"} , {m.department ?? "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-500">Registered member</div>
              </button>
            ))}
            {!filtered.length ? (
              <div className="col-span-full rounded-2xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-700">
                No members found.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

