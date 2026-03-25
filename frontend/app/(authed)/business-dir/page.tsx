"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { loadAuth } from "../../../lib/authStore";

/* ── types ── */
type BusinessListing = {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  products: string[];
  services: string[];
};

type FilterOption = { name: string; count: number };

type FiltersResponse = {
  industries: FilterOption[];
  products: FilterOption[];
  services: FilterOption[];
};

/* ── Dropdown component ── */
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold transition
          ${value ? "border-[var(--navy)] bg-[var(--navy)]/5 text-[var(--navy)]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
        onClick={() => setOpen((p) => !p)}
      >
        {value || label}
        <svg className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[240px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            className={`block w-full px-4 py-2 text-left text-sm font-semibold ${!value ? "bg-[var(--navy)] text-white" : "text-slate-700 hover:bg-slate-50"}`}
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {label}
          </button>
          {options.map((o) => (
            <button
              key={o.name}
              type="button"
              className={`block w-full px-4 py-2 text-left text-sm ${value === o.name ? "bg-[var(--navy)] text-white font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
              onClick={() => { onChange(o.name); setOpen(false); }}
            >
              {o.name} ({o.count})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── main page ── */
export default function BusinessDirPage() {
  const router = useRouter();
  const token = useMemo(() => (typeof window === "undefined" ? null : loadAuth()?.accessToken ?? null), []);

  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [filters, setFilters] = useState<FiltersResponse>({ industries: [], products: [], services: [] });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [product, setProduct] = useState("");
  const [service, setService] = useState("");

  /* ── fetch filters once ── */
  useEffect(() => {
    if (!token) return;
    apiFetch<FiltersResponse>("/api/business/filters", { token }).then(setFilters).catch(() => {});
  }, [token]);

  /* ── fetch listings ── */
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (industry) params.set("industry", industry);
    if (product) params.set("product", product);
    if (service) params.set("service", service);

    apiFetch<{ listings: BusinessListing[]; total: number }>(
      `/api/business?${params.toString()}`,
      { token }
    )
      .then((d) => setListings(d.listings))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load listings"))
      .finally(() => setLoading(false));
  }, [token, search, industry, product, service]);

  /* debounced search */
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Business Directory</h1>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
          onClick={() => router.push("/business-dir/add")}
        >
          + Add a Business Listing
        </button>
      </div>

      {/* Search bar */}
      <div className="mt-5">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Location, Industry, Product or Service"
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)] transition"
          />
        </div>
      </div>

      {/* Filter dropdowns + count */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <FilterDropdown label="Industries" options={filters.industries} value={industry} onChange={setIndustry} />
        <FilterDropdown label="Products" options={filters.products} value={product} onChange={setProduct} />
        <FilterDropdown label="Services" options={filters.services} value={service} onChange={setService} />
        <span className="ml-auto text-sm font-semibold text-slate-600">
          {listings.length} {listings.length === 1 ? "Business" : "Businesses"} Found
        </span>
      </div>

      {/* Listings grid */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">
            Loading business listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-600">
            No businesses found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {listings.map((b) => (
              <button
                key={b.id}
                type="button"
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition"
                onClick={() => router.push(`/business-dir/${b.id}`)}
              >
                {/* Logo / placeholder */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt={b.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-extrabold text-slate-900">{b.name}</h3>

                  {b.industry && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                      </svg>
                      {b.industry}
                    </div>
                  )}

                  {b.location && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {b.location}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
