"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import clsx from "clsx";
import { apiFetch } from "../lib/api";
import { loadAuth } from "../lib/authStore";
import { getMockNotifications, getMockUnreadNotificationsCount, markMockNotificationRead, type MockNotification } from "../lib/mockNotifications";
import { getMockUnreadMessagesCount } from "../lib/mockMessages";

type AuthedUser = {
  name: string;
  profilePhoto?: string | null;
  email?: string;
  role?: string;
};

const iconNavItems = [
  { key: "dashboard", label: "DASHBOARD", href: "/dashboard", emoji: "🚀" },
  { key: "jobs", label: "JOB BOARD", href: "/jobs", emoji: "🚗" },
  { key: "members", label: "MEMBERS", href: "/members", emoji: "👥" },
  { key: "groups", label: "MY GROUPS", href: "/my-groups", emoji: "🤝" },
  { key: "business", label: "BUSINESS DIR", href: "/business-dir", emoji: "📁" },
  { key: "newsroom", label: "NEWSROOM", href: "/newsroom", emoji: "📢" },
  { key: "events", label: "EVENTS", href: "/events", emoji: "📅" }
] as const;

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/g)
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function AuthShell({
  user,
  children,
  onLogout
}: {
  user: AuthedUser | null;
  children: React.ReactNode;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [notificationItems, setNotificationItems] = useState<MockNotification[]>([]);

  const displayName = user?.name ?? "User";
  const firstName = useMemo(() => displayName.split(/\s+/g)[0] ?? displayName, [displayName]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (!menuOpen) return;
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    const auth = typeof window === "undefined" ? null : loadAuth();
    const token = auth?.accessToken ?? null;

    const mockItems = getMockNotifications().slice(0, 5);
    setNotificationItems(mockItems);
    setUnreadNotificationCount(getMockUnreadNotificationsCount());
    setUnreadMessageCount(getMockUnreadMessagesCount());

    if (!token) return;

    // Best-effort backend integration: if endpoints don't exist yet, keep mock UI.
    void Promise.all([
      apiFetch<{ count: number }>("/api/notifications/unread/count", { token }).catch(() => null),
      apiFetch<{ notifications: MockNotification[] }>("/api/notifications?page=1&pageSize=5", { token }).catch(() => null),
      apiFetch<{ count: number }>("/api/messages/unread/count", { token }).catch(() => null)
    ])
      .then(([notifCountRes, notifListRes, msgCountRes]) => {
        if (notifCountRes && typeof notifCountRes.count === "number") setUnreadNotificationCount(notifCountRes.count);
        if (notifListRes && Array.isArray(notifListRes.notifications)) {
          setNotificationItems(notifListRes.notifications.slice(0, 5) as MockNotification[]);
        }
        if (msgCountRes && typeof msgCountRes.count === "number") setUnreadMessageCount(msgCountRes.count);
      })
      .catch(() => {
        // swallow
      });
  }, [pathname]);

  useEffect(() => {
    if (!notificationOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(e.target as Node)) setNotificationOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [notificationOpen]);

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

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Row 1: Branding + top links + notification icons + avatar dropdown */}
      <header className="w-full bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-[var(--navy)] text-white" aria-hidden>
              V
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-800">VCET</div>
              <div className="text-sm text-slate-600">Alumni Association</div>
            </div>
          </div>

          <nav className="hidden items-center gap-4 text-sm font-semibold text-[var(--navy)] md:flex">
            <a href="#" className="hover:opacity-90">
              About Us
            </a>
            <a href="#" className="hover:opacity-90">
              Gallery
            </a>
            <a href="#" className="hover:opacity-90">
              Engage
            </a>
            <a href="#" className="hover:opacity-90">
              Mobile App
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative rounded p-2 text-slate-700 hover:bg-slate-50"
              aria-label="Notifications"
              onClick={() => {
                setMenuOpen(false);
                setNotificationOpen((v) => !v);
              }}
            >
              🔔
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {unreadNotificationCount}
              </span>
            </button>

            <button
              type="button"
              className="relative rounded p-2 text-slate-700 hover:bg-slate-50"
              aria-label="Messages"
              onClick={() => router.push("/messages")}
            >
              ✉️
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {unreadMessageCount}
              </span>
            </button>

            <div className="relative" ref={notificationRef}>
              {notificationOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-80 max-w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="px-4 py-3 text-left text-xs font-extrabold tracking-wide text-slate-500">NOTIFICATIONS</div>
                  <div className="max-h-[400px] overflow-auto border-t border-slate-200">
                    {notificationItems.length ? (
                      <div className="space-y-0.5 px-2 pb-2">
                        {notificationItems.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                              !n.isRead ? "border-transparent bg-white shadow-[inset_3px_0_0_0_#1B2F5E]" : "border-transparent bg-slate-50"
                            }`}
                            onClick={() => {
                              if (!n.isRead) {
                                markMockNotificationRead(n.id);
                                setNotificationItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                                setUnreadNotificationCount((c) => Math.max(0, c - 1));
                              }
                              setNotificationOpen(false);
                              if (n.linkUrl) router.push(n.linkUrl);
                              else toast("Opening notification (demo)");
                            }}
                          >
                            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-[var(--navy)]">
                              {n.avatarName
                                .split(/\s+/g)
                                .slice(0, 2)
                                .map((p) => p[0]!.toUpperCase())
                                .join("")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-extrabold text-slate-900">{n.message}</div>
                              <div className="mt-1 text-[11px] font-semibold text-slate-500">{relativeTime(n.createdAt)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center text-sm font-semibold text-slate-600">No notifications</div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 px-4 py-3">
                    <button
                      type="button"
                      className="w-full text-center text-xs font-extrabold text-[#17A2B8] hover:underline"
                      onClick={() => {
                        setNotificationOpen(false);
                        router.push("/notifications");
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(false);
                  setMenuOpen((v) => !v);
                }}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-50"
              >
                <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-slate-200">
                  {user?.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePhoto} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--navy)]">{initials(displayName)}</span>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold leading-tight text-slate-900">{firstName}</div>
                  <div className="text-xs leading-tight text-slate-500">{user?.email ?? ""}</div>
                </div>
                <span aria-hidden className="text-slate-500">
                  ▾
                </span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-200">
                        {user?.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.profilePhoto} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[var(--navy)]">{initials(displayName)}</span>
                        )}
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="truncate text-sm font-extrabold text-slate-900">{displayName}</div>
                        <div className="truncate text-xs font-semibold text-slate-500">{user?.email ?? ""}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    👤 My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile/edit");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/messages");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    ✉️ Messages
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/notifications");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    🔔 Notifications
                  </button>

                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    ⚙️ Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Row 2: Emoji icon nav bar */}
        <div className="w-full border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-stretch px-2">
            {iconNavItems.map((it, idx) => {
              const active =
                pathname === it.href ||
                (it.key === "dashboard" && pathname.startsWith("/dashboard")) ||
                (it.key === "jobs" && pathname.startsWith("/jobs")) ||
                (it.key === "members" && pathname.startsWith("/members")) ||
                (it.key === "groups" && pathname.startsWith("/my-groups")) ||
                (it.key === "business" && pathname.startsWith("/business-dir")) ||
                (it.key === "newsroom" && pathname.startsWith("/newsroom")) ||
                (it.key === "events" && pathname.startsWith("/events"));

              return (
                <Link
                  key={it.key}
                  href={it.href}
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-2 px-4 py-3 text-center",
                    idx === 0 ? "border-l-0" : "border-l border-slate-200",
                    active ? "bg-slate-100" : "bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="leading-tight">
                    <div className="text-base" aria-hidden>
                      {it.emoji}
                    </div>
                    <div className="text-[11px] font-extrabold tracking-wide text-slate-900">{it.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="px-4 py-8">{children}</main>
    </div>
  );
}

