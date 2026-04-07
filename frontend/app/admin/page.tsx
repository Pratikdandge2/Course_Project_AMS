"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import { loadAuth, clearAuth } from "../../lib/authStore";
import { Skeleton } from "../../components/Skeleton";

type User = {
  id: number;
  name: string;
  graduationYear?: number | null;
  department?: string | null;
  email: string;
  status: string;
};

type UserResponse = {
  page: number;
  pageSize: number;
  total: number;
  users: User[];
};

export default function AdminPage() {
  const router = useRouter();
  const auth = useMemo(() => (typeof window === "undefined" ? null : loadAuth()), []);
  const token = auth?.accessToken ?? null;
  const currentUserId = auth?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserResponse | null>(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const endpoint = activeTab === "pending" ? "/api/admin/pending" : "/api/admin/users";
      const res = await apiFetch<UserResponse>(`${endpoint}?page=${page}&pageSize=10`, {
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
  }, [page, activeTab]);

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

  async function removeUser(id: number) {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    const t = toast.loading("Deleting user...");
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        token
      });
      toast.success("User deleted", { id: t });
      setData((prev) =>
        prev ? { ...prev, users: prev.users.filter((u) => u.id !== id), total: Math.max(0, prev.total - 1) } : prev
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user", { id: t });
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

        {/* Tabs */}
        <div className="mt-8 flex border-b border-slate-200">
          <button
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === "pending"
                ? "border-b-2 border-[#17A2B8] text-[#17A2B8]"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => {
              setActiveTab("pending");
              setPage(1);
            }}
          >
            Pending Registrations
          </button>
          <button
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-[#17A2B8] text-[#17A2B8]"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
          >
            Manage All Users
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-900">
            {activeTab === "pending" ? "Pending Alumni Registrations" : "All Registered Users"}
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
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Details</th>
                    <th className="px-5 py-3">Email</th>
                    {activeTab === "all" && <th className="px-5 py-3">Status</th>}
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.users ?? []).map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        {u.id === currentUserId && (
                          <span className="text-[10px] font-bold text-[#17A2B8] uppercase mt-0.5 block">(You)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="text-xs font-semibold">{u.department ?? "No Dept"}</div>
                        <div className="text-[11px]">{u.graduationYear ? `Class of ${u.graduationYear}` : "Year N/A"}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-600">{u.email}</td>
                      {activeTab === "all" && (
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                            u.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      )}
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {activeTab === "pending" ? (
                            <>
                              <button
                                className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                onClick={() => void act(u.id, "approve")}
                              >
                                Approve
                              </button>
                              <button
                                className="rounded bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700"
                                onClick={() => void act(u.id, "reject")}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                              onClick={() => void removeUser(u.id)}
                              disabled={u.id === currentUserId}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!data?.users?.length ? (
                    <tr>
                      <td className="px-5 py-10 text-center text-slate-400" colSpan={activeTab === "all" ? 5 : 4}>
                        No users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
            <div>
              Showing <span className="font-bold">{data?.users.length ?? 0}</span> of{" "}
              <span className="font-bold">{data?.total ?? 0}</span> users
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page <= 1}
              >
                &laquo;
              </button>
              <button
                className="grid h-8 w-8 place-items-center rounded border border-[#17A2B8] bg-[#17A2B8]/5 text-sm font-bold text-[#17A2B8]"
              >
                {page}
              </button>
              <button
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

