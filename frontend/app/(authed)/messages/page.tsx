"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import {
  getMockMemberOptions,
  getMockThreads,
  getMockUnreadMessagesCount,
  markMockThreadRead
} from "../../../lib/mockMessages";

type ThreadApi = {
  id: number;
  otherName?: string;
  unreadCount?: number;
};

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

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

type Tab = "ALL" | "UNREAD" | "SENT" | "OPEN";

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>("ALL");

  const [threads, setThreads] = useState<ReturnType<typeof getMockThreads>>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  // Compose fields
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const replyRef = useRef<HTMLTextAreaElement | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const memberOptions = useMemo(() => getMockMemberOptions(), []);

  useEffect(() => {
    setLoading(true);
    // Try backend first, but fallback to mock (current backend may not have message endpoints yet).
    Promise.all([
      apiFetch<{ threads: any[] }>("/api/messages").catch(() => null),
      apiFetch<{ count: number }>("/api/messages/unread/count").catch(() => null)
    ])
      .then(([maybeInbox]) => {
        if (maybeInbox && Array.isArray((maybeInbox as any).threads)) {
          // Minimal fallback mapping; full API integration can come later.
          const apiThreads = (maybeInbox as any).threads as ThreadApi[];
          const normalized = apiThreads
            .map((t) => ({
              id: Number((t as any).id),
              otherName: (t as any).otherName ?? "Member",
              subject: (t as any).subject,
              folder: "ALL" as const,
              unreadCount: (t as any).unreadCount ?? 0,
              lastMessagePreview: "Message preview (API mapping coming soon)",
              lastMessageAt: new Date().toISOString(),
              messages: []
            }))
            .filter((t) => Number.isFinite(t.id));

          setThreads(normalized as any);
        } else {
          setThreads(getMockThreads());
        }
      })
      .catch(() => setThreads(getMockThreads()))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!threads.length) return;
    setSelectedThreadId((prev) => prev ?? threads[0]!.id);
  }, [threads]);

  const selectedThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) ?? null;
  }, [selectedThreadId, threads]);

  const filteredThreads = useMemo(() => {
    if (tab === "ALL") return threads;
    if (tab === "UNREAD") return threads.filter((t) => t.unreadCount > 0);
    if (tab === "SENT") return threads.filter((t) => t.folder === "SENT");
    return threads.filter((t) => t.folder === "OPEN");
  }, [tab, threads]);

  const unreadCount = useMemo(() => getMockUnreadMessagesCount(), []);

  function openThread(id: number) {
    setSelectedThreadId(id);
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.unreadCount === 0) return t;
        return { ...t, unreadCount: 0 };
      })
    );
    markMockThreadRead(id);
  }

  function onSendReply() {
    if (!selectedThread) return;
    const text = replyDraft.trim();
    if (!text) return;

    const nowIso = new Date().toISOString();
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== selectedThread.id) return t;
        return {
          ...t,
          unreadCount: 0,
          lastMessagePreview: text,
          lastMessageAt: nowIso,
          messages: [
            ...t.messages,
            {
              id: Date.now(),
              fromMe: true,
              content: text,
              createdAt: nowIso
            }
          ]
        };
      })
    );
    setReplyDraft("");
    toast.success("Reply sent");

    // Demo auto-reply
    window.setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== selectedThread.id) return t;
          const fromMe = false;
          const content = "Thanks! Got it. I’ll get back to you soon.";
          const iso = new Date().toISOString();
          return {
            ...t,
            unreadCount: tab === "UNREAD" ? t.unreadCount + 1 : 1,
            lastMessagePreview: content,
            lastMessageAt: iso,
            messages: [
              ...t.messages,
              {
                id: Date.now() + 1,
                fromMe,
                content,
                createdAt: iso
              }
            ]
          };
        })
      );
    }, 900);
  }

  function onSendCompose() {
    const to = toName.trim();
    const subj = subject.trim();
    const body = message.trim();
    if (!to) return toast.error("Please enter the recipient");
    if (!body) return toast.error("Please write a message");

    const nowIso = new Date().toISOString();
    const newThread = {
      id: Date.now(),
      otherName: to,
      subject: subj || "Message",
      folder: "ALL" as const,
      unreadCount: 0,
      lastMessagePreview: body,
      lastMessageAt: nowIso,
      messages: [
        {
          id: Date.now() + 1,
          fromMe: true,
          content: body,
          createdAt: nowIso
        }
      ]
    };

    setThreads((prev) => [newThread, ...prev]);
    setSelectedThreadId(newThread.id);
    setComposeOpen(false);
    setToName("");
    setSubject("");
    setMessage("");
    toast.success("Message sent (mock)");
  }

  const hasAny = filteredThreads.length > 0 || threads.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Header */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold text-slate-900">Messages</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Send and Receive messages across the network</div>
        </div>

        <button
          type="button"
          className="rounded bg-[#28A745] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          onClick={() => setComposeOpen(true)}
        >
          + Compose Message
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-3 border-b border-slate-200 pb-3">
        {[
          { k: "ALL", label: "All Messages" },
          { k: "UNREAD", label: "Unread Messages" },
          { k: "SENT", label: "My Services Requests" },
          { k: "OPEN", label: "Open Requests" }
        ].map((t) => (
          <button
            key={t.k}
            type="button"
            className={`pb-3 text-sm font-semibold ${
              tab === t.k ? "border-b-4 border-[#1B2F5E] text-[#1B2F5E]" : "border-b-4 border-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setTab(t.k as Tab)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {loading ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-700">Loading...</div>
      ) : !hasAny ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-600">
          No messages
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: conversation list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-extrabold text-slate-600">Conversations</div>
            <div className="mt-3 space-y-3">
              {filteredThreads.length ? (
                filteredThreads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedThreadId === t.id ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => openThread(t.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-[var(--navy)]">
                          {initials(t.otherName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-extrabold text-slate-900 ${t.unreadCount > 0 ? "text-[var(--navy)]" : ""}`}>
                              {t.otherName}
                            </div>
                            {t.unreadCount > 0 ? (
                              <span className="grid h-2 w-2 place-items-center rounded-full bg-[#2563EB]" aria-hidden />
                            ) : null}
                          </div>
                          <div className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{t.lastMessagePreview}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-500">{relativeTime(t.lastMessageAt)}</div>
                        {t.unreadCount > 0 ? (
                          <div className="mt-2 inline-flex items-center justify-center rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            {t.unreadCount}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-700">No threads for this tab.</div>
              )}
            </div>
          </div>

          {/* Right: message thread */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {!selectedThread ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-700">Select a conversation.</div>
            ) : (
              <div className="flex h-[520px] flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="text-sm font-extrabold text-slate-900">{selectedThread.otherName}</div>
                  <div className="text-xs font-semibold text-slate-500">{selectedThread.subject ?? "Conversation"}</div>
                </div>

                <div className="mt-4 flex-1 space-y-3 overflow-auto pr-2">
                  {selectedThread.messages.length ? (
                    selectedThread.messages.map((m) => (
                      <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs font-semibold ${
                            m.fromMe ? "bg-[#17A2B8] text-white" : "bg-[#F1F1F1] text-slate-800"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-700">No messages yet.</div>
                  )}
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={replyRef}
                      className="min-h-[44px] flex-1 resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      placeholder="Reply..."
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded bg-[#17A2B8] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                      disabled={!replyDraft.trim()}
                      onClick={onSendReply}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {composeOpen ? (
        <div className="fixed inset-0 z-[90] bg-black/40 p-4" onClick={() => setComposeOpen(false)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-xl rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Compose Message</div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setComposeOpen(false)}>
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-xs font-semibold text-slate-700">
                To:
                <input
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  list="member-options"
                  value={toName}
                  placeholder="Search member by name/email"
                  onChange={(e) => setToName(e.target.value)}
                />
                <datalist id="member-options">
                  {memberOptions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Subject:
                <input
                  className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (optional)"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Message:
                <textarea
                  className="mt-1 min-h-[120px] w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button type="button" className="rounded border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setComposeOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded bg-[#28A745] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60" disabled={!message.trim() || !toName.trim()} onClick={onSendCompose}>
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

