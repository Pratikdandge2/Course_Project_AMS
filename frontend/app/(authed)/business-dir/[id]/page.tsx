"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../../lib/api";
import { loadAuth } from "../../../../lib/authStore";

type Listing = {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  employees: string | null;
  fundingUsd: string | null;
  contactNumber: string | null;
  contactEmail: string | null;
  products: string[];
  services: string[];
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
};

type MoreListing = {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
};

/* social icon helper */
function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-[var(--navy)] hover:text-white transition">
      {children}
    </a>
  );
}

/* detail row */
function DetailRow({ label, value, isLink }: { label: string; value: string | null; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex border-b border-slate-100 py-3 text-sm">
      <span className="w-44 shrink-0 font-semibold text-rose-600">{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline break-all">{value}</a>
      ) : (
        <span className="font-semibold text-slate-800">{value}</span>
      )}
    </div>
  );
}

export default function BusinessDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const token = useMemo(() => (typeof window === "undefined" ? null : loadAuth()?.accessToken ?? null), []);

  const [listing, setListing] = useState<Listing | null>(null);
  const [more, setMore] = useState<MoreListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiFetch<{ listing: Listing; moreListings: MoreListing[] }>(`/api/business/${id}`, { token })
      .then((d) => {
        setListing(d.listing);
        setMore(d.moreListings);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load listing"))
      .finally(() => setLoading(false));
  }, [token, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center text-sm font-semibold text-rose-600">Business listing not found.</div>
      </div>
    );
  }

  const socials = [
    { href: listing.socialLinkedin, label: "in" },
    { href: listing.socialTwitter, label: "𝕏" },
    { href: listing.socialFacebook, label: "f" },
    { href: listing.socialInstagram, label: "📷" },
  ].filter((s) => s.href);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900">{listing.name}</h1>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          onClick={() => router.push("/business-dir")}
        >
          ← Business Directory
        </button>
      </div>

      {/* Main card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row">
          {/* Logo */}
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {listing.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.logoUrl} alt={listing.name} className="h-full w-full object-cover" />
            ) : (
              <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            {/* Social icons */}
            {socials.length > 0 && (
              <div className="mb-3 flex gap-2">
                {socials.map((s) => (
                  <SocialIcon key={s.label} href={s.href!}>
                    <span className="text-xs font-bold">{s.label}</span>
                  </SocialIcon>
                ))}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">{listing.description}</p>
            )}
          </div>
        </div>

        {/* Products */}
        {listing.products.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              Products
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.products.map((p) => (
                <span key={p} className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {listing.services.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Services
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.services.map((s) => (
                <span key={s} className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Detail table */}
        <div className="mt-8">
          <DetailRow label="Industry" value={listing.industry} />
          <DetailRow label="Location" value={listing.location} />
          <DetailRow label="Website" value={listing.website} isLink />
          <DetailRow label="No of Employees" value={listing.employees} />
          <DetailRow label="Total Funding (USD)" value={listing.fundingUsd} />
          <DetailRow label="Contact Number" value={listing.contactNumber} />
          <DetailRow label="Contact Email" value={listing.contactEmail} isLink />
        </div>

        {/* Team */}
        <div className="mt-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6 5.87v-2a4 4 0 00-3-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Team
          </div>
          <p className="mt-3 text-sm text-slate-500">No team members to display</p>
        </div>
      </div>

      {/* More Listings */}
      {more.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            More Listings
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((m) => (
              <button
                key={m.id}
                type="button"
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition"
                onClick={() => router.push(`/business-dir/${m.id}`)}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                  {m.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logoUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-extrabold text-slate-900">{m.name}</h3>
                  {m.industry && <p className="mt-1 text-xs text-slate-600">{m.industry}</p>}
                  {m.location && <p className="text-xs text-slate-500">{m.location}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
