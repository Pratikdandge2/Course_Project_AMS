"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { saveAuth } from "../../lib/authStore";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: number; name: string; email: string; role: "ALUMNI" | "ADMIN"; status: "APPROVED" };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      saveAuth({ accessToken: res.accessToken, refreshToken: res.refreshToken, role: res.user.role });
      toast.success("Logged in");
      router.push(res.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Building photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/vcet-campus.jpg')" }}
        aria-hidden
      />
      {/* Dark navy overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(17,30,61,0.85) 0%, rgba(27,47,94,0.78) 100%)"
        }}
        aria-hidden
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="text-xl font-extrabold text-slate-900">Login</h1>

        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <input
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />

          <button
            disabled={loading}
            className="mt-2 w-full rounded bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[var(--navy)] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
