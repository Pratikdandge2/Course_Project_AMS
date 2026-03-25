"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { saveRegistration } from "../../lib/authStore";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ exists: boolean }>(`/api/auth/register/check?email=${encodeURIComponent(email)}`);
      if (res.exists) {
        toast.error("This email is already registered. Please login.");
        return;
      }
      saveRegistration({ email, regToken: null });
      router.push(`/user/create?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900">Registration</h1>
        <div className="mt-1 text-sm text-slate-600">Join your alumni network</div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            className="w-full rounded bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => toast("LinkedIn signup is UI-only for now")}
          >
            Signup with LinkedIn
          </button>
          <button
            type="button"
            className="w-full rounded bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => toast("Google signup is UI-only for now")}
          >
            Signup with Google
          </button>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <div className="text-xs text-slate-500">or</div>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="text-xs font-semibold text-slate-600">Signup with your Email Address</div>
          <input
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />

          <button
            disabled={loading}
            className="mt-2 w-full rounded bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-600">
          Already Member?{" "}
          <Link href="/login" className="font-semibold text-[var(--navy)] hover:underline">
            Click here to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

