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
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FolderOpen,
  Megaphone,
  Calendar,
  Bell,
  MessageSquare,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  Pencil,
  Handshake
} from "lucide-react";

type AuthedUser = {
  name: string;
  profilePhoto?: string | null;
  email?: string;
  role?: string;
};

const iconNavItems = [
  { key: "dashboard", label: "Home", href: "/dashboard", Icon: LayoutDashboard },
  { key: "jobs", label: "Jobs", href: "/jobs", Icon: Briefcase },
  { key: "members", label: "Network", href: "/members", Icon: Users },
  { key: "groups", label: "Groups", href: "/my-groups", Icon: Handshake },
  { key: "business", label: "Business", href: "/business-dir", Icon: FolderOpen },
  { key: "newsroom", label: "News", href: "/newsroom", Icon: Megaphone },
  { key: "events", label: "Events", href: "/events", Icon: Calendar }
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
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">

        {/* ── ROW 1: Logo | Secondary links (centered) | Icons + Me ── */}
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">

          {/* Logo — left */}
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--navy)] text-white font-black text-base shadow-sm">
              V
            </div>
            <div className="leading-tight">
              <div className="text-sm font-black text-[var(--navy)] tracking-wide">VCET</div>
              <div className="text-[11px] text-slate-500">Alumni Association</div>
            </div>
          </Link>




          {/* Right side — Notifications + Messaging + Me */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">

            {/* Notifications bell */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                aria-label="Notifications"
                onClick={() => { setMenuOpen(false); setNotificationOpen((v) => !v); }}
              >
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium">Notifications</span>
              </button>

              {/* Notification dropdown — anchored to THIS div */}
              {notificationOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="px-4 py-3 text-xs font-extrabold tracking-wide text-slate-500 border-b border-slate-100">
                    NOTIFICATIONS
                  </div>
                  <div className="max-h-[380px] overflow-auto">
                    {notificationItems.length ? (
                      <div className="py-1">
                        {notificationItems.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                              !n.isRead ? "border-l-4 border-[var(--navy)] bg-blue-50/30" : ""
                            }`}
                            onClick={() => {
                              if (!n.isRead) {
                                markMockNotificationRead(n.id);
                                setNotificationItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                                setUnreadNotificationCount((c) => Math.max(0, c - 1));
                              }
                              setNotificationOpen(false);
                              if (n.linkUrl) router.push(n.linkUrl);
                            }}
                          >
                            <div className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-slate-200 text-xs font-bold text-[var(--navy)]">
                              {n.avatarName.split(/\s+/g).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-900 leading-snug">{n.message}</div>
                              <div className="mt-1 text-[11px] text-slate-400">{relativeTime(n.createdAt)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet</div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3">
                    <button
                      type="button"
                      className="w-full text-center text-xs font-bold text-[var(--navy)] hover:underline"
                      onClick={() => { setNotificationOpen(false); router.push("/notifications"); }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messaging */}
            <button
              type="button"
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              aria-label="Messages"
              onClick={() => router.push("/messages")}
            >
              <div className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadMessageCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">Messaging</span>
            </button>

            {/* Me dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => { setNotificationOpen(false); setMenuOpen((v) => !v); }}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <div className="grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-[var(--navy)] text-white text-[10px] font-bold">
                  {user?.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePhoto} alt={displayName} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <span>{initials(displayName)}</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-medium">Me</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[var(--navy)] text-white text-xs font-bold flex-shrink-0">
                      {user?.profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.profilePhoto} alt={displayName} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <span>{initials(displayName)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">{displayName}</div>
                      <div className="truncate text-[11px] text-slate-500">{user?.email ?? ""}</div>
                    </div>
                  </div>
                  <div className="py-1">
                    {[
                      { label: "My Profile", icon: <UserIcon className="h-4 w-4" />, href: "/profile" },
                      { label: "Edit Profile", icon: <Pencil className="h-4 w-4" />, href: "/profile/edit" },
                      { label: "Messages", icon: <MessageSquare className="h-4 w-4" />, href: "/messages" },
                      { label: "Notifications", icon: <Bell className="h-4 w-4" />, href: "/notifications" },
                      { label: "Settings", icon: <Settings className="h-4 w-4" />, href: "/settings" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => { setMenuOpen(false); router.push(item.href); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                      >
                        <span className="text-slate-400">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); onLogout(); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 2: Icon nav (LinkedIn-style) ── */}
        <div className="w-full border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl items-stretch px-2">
            {iconNavItems.map((it) => {
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
                    "relative flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-center transition-colors min-w-0",
                    active ? "text-slate-900" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <it.Icon className={clsx("h-5 w-5 flex-shrink-0", active ? "text-slate-900" : "")} />
                  <div className={clsx("text-[11px] font-semibold truncate w-full text-center", active ? "text-slate-900" : "")}>
                    {it.label}
                  </div>
                  {active && <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full bg-slate-900" />}
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

