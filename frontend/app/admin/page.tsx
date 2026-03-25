"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { loadAuth, clearAuth } from "../../lib/authStore";
import { Skeleton } from "../../components/Skeleton";

type PendingUser = {
  id: number;
  name: string;
  graduationYear?: number | null;
  department?: string | null;
  email: string;
};

type PendingResponse = {
  page: number;
  pageSize: number;
  total: number;
  users: PendingUser[];
};

export default function AdminPage() {
  const router = useRouter();
  const auth = useMemo(() => (typeof window === "undefined" ? null : loadAuth()), []);
  const token = auth?.accessToken ?? null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PendingResponse | null>(null);
  const [page, setPage] = useState(1);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiFetch<PendingResponse>(`/api/admin/pending?page=${page}&pageSize=10`, {
        method: "GET",
        token
      });
      setData(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth?.accessToken || auth.role !== "ADMIN") {
      toast.error("Admin access required");
      router.push("/login");
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function act(id: number, kind: "approve" | "reject") {
    if (!token) return;
    const t = toast.loading(kind === "approve" ? "Approving..." : "Rejecting...");
    try {
      await apiFetch(`/api/admin/users/${id}/${kind}`, {
        method: "PUT",
        token
      });
      toast.success(kind === "approve" ? "Approved" : "Rejected", { id: t });
      setData((prev) =>
        prev ? { ...prev, users: prev.users.filter((u) => u.id !== id), total: Math.max(0, prev.total - 1) } : prev
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed", { id: t });
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <button
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              clearAuth();
              toast.success("Logged out");
              router.push("/");
            }}
          >
            Logout
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900">
            Pending Alumni Registrations
          </div>

          {loading ? (
            <div className="p-5">
              <Skeleton className="h-10 w-full" />
              <div className="mt-3 grid gap-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Graduation Year</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.users ?? []).map((u) => (
                    <tr key={u.id} className="transition-opacity">
                      <td className="px-5 py-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-5 py-4 text-slate-700">{u.graduationYear ?? "-"}</td>
                      <td className="px-5 py-4 text-slate-700">{u.department ?? "-"}</td>
                      <td className="px-5 py-4 text-slate-700">{u.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                            onClick={() => void act(u.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="rounded bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                            onClick={() => void act(u.id, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data?.users?.length ? (
                    <tr>
                      <td className="px-5 py-10 text-center text-slate-600" colSpan={5}>
                        No pending registrations.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
            <div>
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page <= 1}
              >
                |&lt;
              </button>
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                &lt;
              </button>
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                &gt;
              </button>
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
              >
                &gt;|
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

