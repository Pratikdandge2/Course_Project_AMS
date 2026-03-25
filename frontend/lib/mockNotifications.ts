"use client";

export type MockNotification = {
  id: number;
  message: string;
  createdAt: string; // ISO
  isRead: boolean;
  avatarName: string;
  linkUrl?: string;
  type?:
    | "POST_LIKE"
    | "POST_COMMENT"
    | "COMMENT_REPLY"
    | "PROFILE_APPROVED"
    | "NEW_EVENT"
    | "BIRTHDAY"
    | "NEW_MESSAGE"
    | "NEW_JOB";
};

type ReadMap = Record<string, boolean>;

const READ_MAP_KEY = "ams_mock_notifications_read_map";

function loadReadMap(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(READ_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReadMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function saveReadMap(map: ReadMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(READ_MAP_KEY, JSON.stringify(map));
}

const BASE = [
  {
    id: 1,
    message: "John Doe liked your post",
    avatarName: "John Doe",
    type: "POST_LIKE" as const,
    linkUrl: "/dashboard",
    // Today
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    message: "Jane commented: \"Great post!\"",
    avatarName: "Jane Smith",
    type: "POST_COMMENT" as const,
    linkUrl: "/dashboard",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // today
  },
  {
    id: 3,
    message: "Today is Robin Dias's birthday! 🎂",
    avatarName: "Robin Dias",
    type: "BIRTHDAY" as const,
    linkUrl: "/dashboard",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // today
  },
  {
    id: 4,
    message: "New Event: Alumni Webinar posted",
    avatarName: "VCETV",
    type: "NEW_EVENT" as const,
    linkUrl: "/events",
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // yesterday-ish
  },
  {
    id: 5,
    message: "Admin approved your profile",
    avatarName: "Admin",
    type: "PROFILE_APPROVED" as const,
    linkUrl: "/profile",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // earlier
  },
  {
    id: 6,
    message: "Mike sent you a message",
    avatarName: "Mike Johnson",
    type: "NEW_MESSAGE" as const,
    linkUrl: "/messages",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // today
  }
];

export function getMockNotifications(): MockNotification[] {
  const readMap = loadReadMap();
  return BASE.map((n) => ({
    ...n,
    isRead: readMap[String(n.id)] === true
  }));
}

export function getMockUnreadNotificationsCount(): number {
  return getMockNotifications().filter((n) => !n.isRead).length;
}

export function markMockNotificationRead(id: number) {
  const map = loadReadMap();
  map[String(id)] = true;
  saveReadMap(map);
}

export function markMockAllNotificationsRead() {
  const map = loadReadMap();
  for (const n of BASE) map[String(n.id)] = true;
  saveReadMap(map);
}

