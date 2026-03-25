"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../../lib/api";
import { loadAuth } from "../../../../lib/authStore";

export default function AddBusinessListingPage() {
  const router = useRouter();
  const token = useMemo(() => (typeof window === "undefined" ? null : loadAuth()?.accessToken ?? null), []);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "",
    location: "",
    website: "",
    employees: "",
    fundingUsd: "",
    contactNumber: "",
    contactEmail: "",
    products: "",
    services: "",
    socialLinkedin: "",
    socialTwitter: "",
    socialFacebook: "",
    socialInstagram: "",
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/business", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          products: form.products.split(",").map((s) => s.trim()).filter(Boolean),
          services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      toast.success("Business listing created!");
      router.push("/business-dir");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--navy)] focus:ring-1 focus:ring-[var(--navy)] transition";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Add a Business Listing</h1>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          onClick={() => router.push("/business-dir")}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Business Name *</label>
          <input value={form.name} onChange={set("name")} className={inputCls} placeholder="e.g. Astral Technologies" required />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
          <textarea value={form.description} onChange={set("description")} className={`${inputCls} min-h-[100px] resize-y`} placeholder="Brief description of the business..." />
        </div>

        {/* Industry + Location */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Industry</label>
            <input value={form.industry} onChange={set("industry")} className={inputCls} placeholder="e.g. Engineering & Technology" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Location</label>
            <input value={form.location} onChange={set("location")} className={inputCls} placeholder="e.g. Mumbai" />
          </div>
        </div>

        {/* Website + Employees */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Website</label>
            <input value={form.website} onChange={set("website")} className={inputCls} placeholder="https://example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">No. of Employees</label>
            <input value={form.employees} onChange={set("employees")} className={inputCls} placeholder="e.g. 20-50" />
          </div>
        </div>

        {/* Funding + Contact */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Total Funding (USD)</label>
            <input value={form.fundingUsd} onChange={set("fundingUsd")} className={inputCls} placeholder="e.g. $1M or NIL" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Contact Number</label>
            <input value={form.contactNumber} onChange={set("contactNumber")} className={inputCls} placeholder="+91-1234567890" />
          </div>
        </div>

        {/* Contact Email */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Contact Email</label>
          <input value={form.contactEmail} onChange={set("contactEmail")} type="email" className={inputCls} placeholder="contact@example.com" />
        </div>

        {/* Products + Services */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Products (comma-separated)</label>
            <input value={form.products} onChange={set("products")} className={inputCls} placeholder="CRM, ERP, Analytics" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Services (comma-separated)</label>
            <input value={form.services} onChange={set("services")} className={inputCls} placeholder="Consulting, Training" />
          </div>
        </div>

        {/* Social links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">LinkedIn URL</label>
            <input value={form.socialLinkedin} onChange={set("socialLinkedin")} className={inputCls} placeholder="https://linkedin.com/company/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Twitter URL</label>
            <input value={form.socialTwitter} onChange={set("socialTwitter")} className={inputCls} placeholder="https://twitter.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Facebook URL</label>
            <input value={form.socialFacebook} onChange={set("socialFacebook")} className={inputCls} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Instagram URL</label>
            <input value={form.socialInstagram} onChange={set("socialInstagram")} className={inputCls} placeholder="https://instagram.com/..." />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
