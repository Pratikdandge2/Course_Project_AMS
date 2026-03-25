"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import {
  getMockNotifications,
  getMockUnreadNotificationsCount,
  markMockAllNotificationsRead,
  markMockNotificationRead,
  type MockNotification
} from "../../../lib/mockNotifications";

function relativeTime(iso: string) {
  const dt = new Date(iso).getTime();
  const diff = Date.now() - dt;
  const mins = Math.floor(diff / (60 * 1000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MockNotification[]>([]);

  useEffect(() => {
    setLoading(true);

    // Try backend endpoints; fallback to mock.
    Promise.resolve()
      .then(() => apiFetch<any>("/api/notifications?page=1&pageSize=50"))
      .then((data) => {
        if (data && Array.isArray(data.notifications)) {
          const mapped = data.notifications.map((n: any) => ({
            id: Number(n.id),
            message: String(n.message ?? ""),
            createdAt: String(n.createdAt ?? new Date().toISOString()),
            isRead: Boolean(n.isRead),
            avatarName: String(n.avatarName ?? "VCET"),
            linkUrl: n.linkUrl ? String(n.linkUrl) : undefined
          }));
          setItems(mapped);
        } else {
          setItems(getMockNotifications());
        }
      })
      .catch(() => setItems(getMockNotifications()))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const now = new Date();
    const today = dayKey(now);
    const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    const todayItems = [];
    const yesterdayItems = [];
    const earlierItems = [];

    for (const n of items) {
      const k = dayKey(new Date(n.createdAt));
      if (k === today) todayItems.push(n);
      else if (k === yesterday) yesterdayItems.push(n);
      else earlierItems.push(n);
    }

    // newest first
    const sortDesc = (a: MockNotification, b: MockNotification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return {
      today: todayItems.sort(sortDesc),
      yesterday: yesterdayItems.sort(sortDesc),
      earlier: earlierItems.sort(sortDesc)
    };
  }, [items]);

  function onMarkAllRead() {
    // Backend integration can come later; for now, align mock state.
    markMockAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  }

  function onOpen(n: MockNotification) {
    if (!n.isRead) {
      markMockNotificationRead(n.id);
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    if (n.linkUrl) {
      router.push(n.linkUrl);
    } else {
      toast("Opening notification (demo)");
    }
  }

  const unreadCount = getMockUnreadNotificationsCount();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Notifications</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">
            {loading ? "Loading..." : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            disabled={!items.some((i) => !i.isRead)}
            onClick={onMarkAllRead}
          >
            Mark All as Read
          </button>
          <Link href="/dashboard" className="text-sm font-semibold text-[var(--navy)] hover:underline">
            ← Back
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="p-6 text-center text-sm font-semibold text-slate-700">Loading notifications...</div>
        ) : !items.length ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-700">No notifications.</div>
        ) : (
          <div className="space-y-5">
            {(["today", "yesterday", "earlier"] as const).map((k) => {
              const label = k === "today" ? "Today" : k === "yesterday" ? "Yesterday" : "Earlier";
              const arr = grouped[k];
              if (!arr.length) return null;

              return (
                <div key={k}>
                  <div className="mb-3 text-xs font-extrabold tracking-wide text-slate-400">{label}</div>
                  <div className="space-y-2">
                    {arr.slice(0, 20).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                          !n.isRead ? "border-transparent bg-white shadow-[inset_3px_0_0_0_#1B2F5E]" : "bg-slate-50"
                        }`}
                        onClick={() => onOpen(n)}
                      >
                        <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-[var(--navy)]">
                          {n.avatarName
                            .split(/\s+/g)
                            .slice(0, 2)
                            .map((p) => p[0]!.toUpperCase())
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-extrabold text-slate-900">{n.message}</div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">{relativeTime(n.createdAt)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

