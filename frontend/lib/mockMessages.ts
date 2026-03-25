"use client";

export type MockMessage = {
  id: number;
  fromMe: boolean;
  content: string;
  createdAt: string; // ISO
};

export type MockThread = {
  id: number;
  otherName: string;
  otherAvatar?: string | null;
  subject?: string;
  folder: "ALL" | "SENT" | "OPEN"; // maps to tabs
  unreadCount: number;
  lastMessagePreview: string;
  lastMessageAt: string; // ISO
  messages: MockMessage[];
};

type ReadMap = Record<string, boolean>;

const UNREAD_MAP_KEY = "ams_mock_threads_unread_map";

function loadUnreadMap(): ReadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(UNREAD_MAP_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ReadMap;
  } catch {
    return {};
  }
}

function saveUnreadMap(map: ReadMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UNREAD_MAP_KEY, JSON.stringify(map));
}

const MEMBERS = ["John Doe", "Jane Smith", "Mike Johnson", "Robin Dias", "Saivamshi Jilla"] as const;

export function getMockMemberOptions(): string[] {
  return [...MEMBERS];
}

function baseThreads(): MockThread[] {
  const now = Date.now();
  return [
    {
      id: 11,
      otherName: "Mike Johnson",
      subject: "Service request: Career guidance",
      folder: "OPEN",
      unreadCount: 2,
      lastMessagePreview: "Sure, happy to share tips for interviews.",
      lastMessageAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 111,
          fromMe: false,
          content: "Hi! Are you open for career guidance? I&apos;m preparing for HR interviews.",
          createdAt: new Date(now - 2.5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 112,
          fromMe: true,
          content: "Sure, happy to share tips for interviews.",
          createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 12,
      otherName: "John Doe",
      subject: "Networking",
      folder: "ALL",
      unreadCount: 0,
      lastMessagePreview: "Thanks! I will reach out again next week.",
      lastMessageAt: new Date(now - 22 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 121,
          fromMe: false,
          content: "Hi Raj, great connecting. Let me know if you&apos;re attending any VCET events.",
          createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 122,
          fromMe: true,
          content: "Thanks! I will reach out again next week.",
          createdAt: new Date(now - 22 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 13,
      otherName: "Jane Smith",
      subject: "Service request: Resume review",
      folder: "SENT",
      unreadCount: 1,
      lastMessagePreview: "I&apos;ll review and send comments today.",
      lastMessageAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      messages: [
        {
          id: 131,
          fromMe: true,
          content: "Can you review my resume? I&apos;m applying for software roles.",
          createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 132,
          fromMe: false,
          content: "Absolutely! I&apos;ll review and send comments today.",
          createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];
}

export function getMockThreads(): MockThread[] {
  const unreadMap = loadUnreadMap();
  const threads = baseThreads();

  // unreadMap stores per-thread whether it is unread (true) or read (false)
  // Default is the base unreadCount.
  return threads.map((t) => {
    const forced = unreadMap[String(t.id)];
    if (forced === undefined) return t;
    return {
      ...t,
      unreadCount: forced ? Math.max(1, t.unreadCount) : 0,
      lastMessagePreview: t.lastMessagePreview
    };
  });
}

export function getMockUnreadMessagesCount(): number {
  return getMockThreads().reduce((acc, t) => acc + (t.unreadCount || 0), 0);
}

export function markMockThreadRead(threadId: number) {
  const map = loadUnreadMap();
  map[String(threadId)] = false;
  saveUnreadMap(map);
}

export function markMockThreadUnread(threadId: number, unreadCount: number) {
  const map = loadUnreadMap();
  // For simplicity, store boolean unread; unreadCount is derived from base.
  map[String(threadId)] = true;
  saveUnreadMap(map);
}

