"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { clearAuth, loadAuth, type AuthState } from "../../lib/authStore";
import { AuthShell } from "../../components/AuthShell";

type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: "ALUMNI" | "ADMIN";
  profilePhoto: string | null;
};

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth: AuthState | null = useMemo(() => (typeof window === "undefined" ? null : loadAuth()), []);

  const token = auth?.accessToken ?? null;
  const [user, setUser] = useState<MeResponse | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error("Please login to access your dashboard");
      router.push("/login");
      return;
    }

    setChecking(true);
    apiFetch<MeResponse>("/api/auth/me", { token })
      .then((me) => setUser(me))
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load profile");
        clearAuth();
        router.push("/login");
      })
      .finally(() => setChecking(false));
  }, [router, token]);

  if (checking) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return <AuthShell user={user} onLogout={() => (clearAuth(), toast.success("Logged out"), router.push("/login"))}>{children}</AuthShell>;
}

