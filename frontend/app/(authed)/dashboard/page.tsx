"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type Author = {
  name: string;
  avatar?: string | null;
};

type PostComment = {
  id: number;
  author: Author;
  content: string;
  createdAt: string;
};

type FeedPost = {
  id: number;
  type: "JOB" | "TEXT";
  createdAt: string;
  author: Author;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  comments: PostComment[];
  // TEXT
  category?: "ALUMNI_INTRODUCTIONS" | "JOB_OPPORTUNITY" | "GENERAL" | "ANNOUNCEMENT" | "ACHIEVEMENT" | "HELP";
  content?: string;
  visibility?: "ALL" | "MY_BATCH" | "MY_DEPARTMENT";
  isFirstPost?: boolean;
  // JOB
  jobTitle?: string;
  company?: string;
  location?: string;
  experience?: string;
  skills?: string[];
  jobArea?: string[];
  salary?: string;
  sourceTag?: "NETWORK" | "PARTNER";
};

function formatDateLabel(input: string) {
  try {
    const d = new Date(input);
    return d.toLocaleString(undefined, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return input;
  }
}

export default function DashboardPage() {
  const [hasPosted, setHasPosted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [composer, setComposer] = useState({
    text: "",
    category: "GENERAL" as FeedPost["category"],
    visibility: "ALL" as FeedPost["visibility"],
    imagePreviewUrl: null as string | null,
    attachName: "" // local only
  });

  const initialPosts = useMemo<FeedPost[]>(
    () => [
      {
        id: 101,
        type: "JOB",
        createdAt: "2026-02-27T01:43:00.000Z",
        likesCount: 0,
        likedByMe: false,
        commentsCount: 0,
        comments: [],
        author: { name: "Mustafa Shaikh" },
        jobTitle: "💼 Assistant Manager - Business Development",
        company: "Receivables Exchange of India Limited",
        location: "Mumbai",
        experience: "6 - 9 Years",
        skills: ["Employee Relations", "HR compliance", "conflict resolution", "Workforce Management"],
        jobArea: ["Engineering & Technology"],
        salary: "INR 7 LPA - INR 10 LPA",
        sourceTag: "PARTNER"
      },
      {
        id: 102,
        type: "TEXT",
        createdAt: "2026-02-20T12:55:00.000Z",
        likesCount: 1,
        likedByMe: false,
        commentsCount: 0,
        comments: [],
        author: { name: "Omkar Mergu" },
        category: "ALUMNI_INTRODUCTIONS",
        content: "Hi I am Omkar Mergu, VCET Alumni currently working in NTPC Limited as an Executive Engineer. I would love to interact with new generation Engineers.",
        visibility: "ALL",
        isFirstPost: true
      },
      {
        id: 103,
        type: "TEXT",
        createdAt: "2026-02-18T09:30:00.000Z",
        likesCount: 3,
        likedByMe: true,
        commentsCount: 2,
        comments: [
          { id: 1, author: { name: "Saivamshi Jilla" }, content: "Welcome! Great to see alumni connecting.", createdAt: "2026-02-18T10:00:00.000Z" }
        ],
        author: { name: "Dhruti Patil" },
        category: "GENERAL",
        content: "New to the community? Say hi and connect with alumni across batches."
      }
    ],
    []
  );

  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [visibleCount, setVisibleCount] = useState(4);

  const [filters, setFilters] = useState({ type: "All", tags: "", groups: "" });
  const [replyOpenId, setReplyOpenId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const [shareOpen, setShareOpen] = useState<FeedPost | null>(null);
  const [reportOpen, setReportOpen] = useState<FeedPost | null>(null);
  const [reportReason, setReportReason] = useState("Spam");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("ams_has_posted");
    setHasPosted(raw === "true");
  }, []);

  function setComposerFromFile(file: File | null) {
    if (!file) return setComposer((c) => ({ ...c, imagePreviewUrl: null }));
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file for the picture");
      return;
    }
    const url = URL.createObjectURL(file);
    setComposer((c) => ({ ...c, imagePreviewUrl: url }));
  }

  function submitPost() {
    const text = composer.text.trim();
    if (!text) {
      toast.error("Type something to start a discussion");
      return;
    }

    const isFirstEver = !hasPosted;
    const category = (isFirstEver ? "ALUMNI_INTRODUCTIONS" : composer.category) as FeedPost["category"];

    const newPost: FeedPost = {
      id: Date.now(),
      type: "TEXT",
      createdAt: new Date().toISOString(),
      author: { name: "You" },
      likesCount: 0,
      likedByMe: false,
      commentsCount: 0,
      comments: [],
      category,
      visibility: composer.visibility,
      content: text,
      isFirstPost: isFirstEver
    };

    setPosts((prev) => [newPost, ...prev]);
    setVisibleCount(6);
    setComposer({ text: "", category: "GENERAL", visibility: "ALL", imagePreviewUrl: composer.imagePreviewUrl, attachName: "" });

    if (isFirstEver && typeof window !== "undefined") {
      window.localStorage.setItem("ams_has_posted", "true");
      setHasPosted(true);
    }

    toast.success("Posted");
  }

  function toggleLike(postId: number) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likesCount: Math.max(0, p.likesCount + (liked ? 1 : -1))
        };
      })
    );
  }

  function submitReply(postId: number) {
    const text = replyDraft.trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextComment: PostComment = {
          id: Date.now(),
          author: { name: "You" },
          content: text,
          createdAt: new Date().toISOString()
        };
        return {
          ...p,
          comments: [nextComment, ...p.comments],
          commentsCount: p.commentsCount + 1
        };
      })
    );
    setReplyOpenId(null);
    setReplyDraft("");
    toast.success("Reply added");
  }

  const filteredPosts = useMemo(() => {
    if (filters.type === "All") return posts;
    if (filters.type === "ALUMNI INTRODUCTIONS") return posts.filter((p) => p.category === "ALUMNI_INTRODUCTIONS");
    if (filters.type === "Job Opportunities") return posts.filter((p) => p.type === "JOB" || p.category === "JOB_OPPORTUNITY");
    if (filters.type === "Announcements") return posts.filter((p) => p.category === "ANNOUNCEMENT");
    return posts;
  }, [filters.type, posts]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  async function loadMore() {
    setLoadingMore(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      setVisibleCount((n) => Math.min(filteredPosts.length, n + 4));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
        {/* LEFT COLUMN */}
        <section className="lg:col-span-2">
          <div className="mb-5">
            <div className="text-xs font-semibold text-slate-500">Welcome</div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Welcome, Alumni! Here&apos;s everything that&apos;s happening on your alumni network!
            </h1>
          </div>

          {/* Post Composer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <textarea
              className="min-h-[90px] w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Type here to start a discussion"
              value={composer.text}
              onChange={(e) => setComposer((c) => ({ ...c, text: e.target.value }))}
            />
            <div className="mt-2 text-xs text-slate-500">
              Please note: Any content found inappropriate shall be deleted without any notice
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  📷 Picture
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setComposerFromFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="cursor-pointer rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  📎 Attach
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setComposer((c) => ({ ...c, attachName: e.target.files?.[0]?.name ?? "" }))}
                  />
                </label>
                {composer.attachName ? <span className="text-xs text-slate-600">Attached: {composer.attachName}</span> : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <select
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={composer.category ?? "GENERAL"}
                  onChange={(e) => setComposer((c) => ({ ...c, category: e.target.value as FeedPost["category"] }))}
                >
                  <option value="ALUMNI_INTRODUCTIONS">Alumni Introductions</option>
                  <option value="JOB_OPPORTUNITY">Job Opportunities</option>
                  <option value="GENERAL">General Discussion</option>
                  <option value="ANNOUNCEMENT">Announcements</option>
                  <option value="ACHIEVEMENT">Achievements</option>
                  <option value="HELP">Help & Advice</option>
                </select>

                <select
                  className="rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={composer.visibility}
                  onChange={(e) => setComposer((c) => ({ ...c, visibility: e.target.value as FeedPost["visibility"] }))}
                >
                  <option value="ALL">Visible to All Members</option>
                  <option value="MY_BATCH">Only My Batch</option>
                  <option value="MY_DEPARTMENT">Only My Department</option>
                </select>

                <button
                  type="button"
                  className="rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                  onClick={submitPost}
                >
                  Submit →
                </button>
              </div>
            </div>

            {composer.imagePreviewUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={composer.imagePreviewUrl} alt="Preview" className="h-40 w-full object-cover" />
              </div>
            ) : null}
          </div>

          {/* Feed Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="text-xs font-extrabold text-slate-600">FILTERS:</div>
            <label className="text-xs font-semibold text-slate-600">
              Type{" "}
              <select
                className="ml-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400"
                value={filters.type}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="All">All</option>
                <option value="ALUMNI INTRODUCTIONS">Alumni Introductions</option>
                <option value="Job Opportunities">Job Opportunities</option>
                <option value="Announcements">Announcements</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Tags{" "}
              <select
                className="ml-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400"
                value={filters.tags}
                onChange={(e) => setFilters((f) => ({ ...f, tags: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="react">React</option>
                <option value="ai">AI</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Groups{" "}
              <select
                className="ml-2 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-400"
                value={filters.groups}
                onChange={(e) => setFilters((f) => ({ ...f, groups: e.target.value }))}
              >
                <option value="">Any</option>
                <option value="it">IT</option>
                <option value="mech">Mech</option>
              </select>
            </label>
          </div>

          {/* Feed */}
          <div className="mt-4 space-y-4">
            {visiblePosts.map((p) => {
              if (p.type === "JOB") {
                return (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm card-hover">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{p.jobTitle}</div>
                        <div className="mt-2 grid gap-2 text-xs text-slate-700 md:grid-cols-2">
                          <div>
                            <div className="font-semibold text-slate-900">COMPANY</div>
                            <div>{p.company}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">EXPERIENCE</div>
                            <div>{p.experience}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">LOCATION</div>
                            <div>{p.location}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">SKILLS</div>
                            <div className="line-clamp-2">{(p.skills ?? []).join(", ")}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="rounded bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                        onClick={() => toast("Job application flow coming soon")}
                      >
                        View & Apply
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {p.author.name
                            .split(/\s+/g)
                            .slice(0, 2)
                            .map((x) => x[0]!)
                            .join("")}
                        </div>
                        <div className="font-semibold text-slate-900">{p.author.name}</div>
                      </div>
                      <div>{formatDateLabel(p.createdAt)}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 text-slate-700">
                        <button
                          type="button"
                          className="hover:underline"
                          onClick={() => toggleLike(p.id)}
                        >
                          Like ({p.likesCount})
                        </button>
                        <button type="button" className="hover:underline" onClick={() => setReplyOpenId(p.id)}>
                          Reply ({p.commentsCount})
                        </button>
                        <button type="button" className="hover:underline" onClick={() => setShareOpen(p)}>
                          Share
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-rose-600 hover:underline"
                        onClick={() => setReportOpen(p)}
                      >
                        Report
                      </button>
                    </div>

                    {p.sourceTag ? (
                      <div className="mt-2 text-right text-[11px] italic text-slate-400">
                        SOURCED FROM {p.sourceTag === "PARTNER" ? "PARTNER NETWORK" : "YOUR NETWORK"}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const badge = p.category === "ALUMNI_INTRODUCTIONS" ? "ALUMNI INTRODUCTIONS" : "";
              return (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {badge ? (
                        <div className="mb-2 inline-flex rounded-full bg-[#F5A623] px-3 py-1 text-[11px] font-extrabold text-white">
                          {badge}
                        </div>
                      ) : null}
                      <div className="text-sm font-semibold text-slate-900">{p.content}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        {p.author.name
                          .split(/\s+/g)
                          .slice(0, 2)
                          .map((x) => x[0]!)
                          .join("")}
                      </div>
                      <div className="font-semibold text-slate-900">{p.author.name}</div>
                    </div>
                    <div>{formatDateLabel(p.createdAt)}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-700">
                      <button type="button" className="hover:underline" onClick={() => toggleLike(p.id)}>
                        Like ({p.likesCount})
                      </button>
                      <button type="button" className="hover:underline" onClick={() => setReplyOpenId(p.id)}>
                        Reply ({p.commentsCount})
                      </button>
                      <button type="button" className="hover:underline" onClick={() => setShareOpen(p)}>
                        Share
                      </button>
                    </div>
                    <button type="button" className="text-rose-600 hover:underline" onClick={() => setReportOpen(p)}>
                      Report
                    </button>
                  </div>

                  {replyOpenId === p.id ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-700">Add a reply</div>
                      <textarea
                        className="mt-2 min-h-[60px] w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        placeholder="Write your reply..."
                      />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          onClick={() => setReplyOpenId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="rounded bg-[var(--navy)] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                          onClick={() => submitReply(p.id)}
                        >
                          Reply →
                        </button>
                      </div>

                      {p.comments.length ? (
                        <div className="mt-4 space-y-2">
                          {p.comments.slice(0, 2).map((c) => (
                            <div key={c.id} className="rounded-lg bg-white p-2 text-xs">
                              <div className="font-semibold text-slate-900">{c.author.name}</div>
                              <div className="text-slate-700">{c.content}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}

            {filteredPosts.length > visiblePosts.length ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  className="rounded bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="lg:col-span-1">
          <div className="space-y-4">
            {/* Invite Friends */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">Invite Friends</div>
              <div className="mt-2 text-xs text-slate-600">
                Spread the word about the network to your friends and help us build the Alumni Network
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded border-2 border-[#17A2B8] bg-white px-3 py-2 text-sm font-semibold text-[#17A2B8] hover:bg-[#17A2B8]/5"
                onClick={() => setInviteOpen(true)}
              >
                Invite by Email
              </button>
            </div>

            {/* Birthdays */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-slate-900">Upcoming Birthdays</div>
                <button type="button" className="text-xs font-semibold text-[var(--navy)] hover:underline" onClick={() => toast("Birthday list modal coming soon")}>
                  View All
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {[
                  { name: "Saivamshi Jilla", date: "MAR 15", meta: "BE 2026, CE" },
                  { name: "Dhruti Patil", date: "MAR 15", meta: "BE 2026, CE" },
                  { name: "Shreya Parchurkar", date: "MAR 16", meta: "BE 2024, IT" },
                  { name: "Sumit chawan", date: "MAR 16", meta: "BE 2016, IT" },
                  { name: "Jagruti Lakule", date: "MAR 16", meta: "MMS 2025" }
                ].map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold text-[var(--navy)]">
                        {b.name
                          .split(/\s+/g)
                          .slice(0, 2)
                          .map((x) => x[0]!)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{b.name}</div>
                        <div className="text-[11px] text-slate-500">{b.meta}</div>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-slate-700">{b.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Share Modal */}
      {shareOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/40 p-4" onClick={() => setShareOpen(null)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Share post</div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setShareOpen(null)}>
                Close
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-600">Copy link / share with other alumni (coming soon)</div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-700">
              {`${window.location.origin}/dashboard#post-${shareOpen.id}`}
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${window.location.origin}/dashboard#post-${shareOpen.id}`);
                  toast.success("Link copied");
                } catch {
                  toast.error("Copy failed");
                }
              }}
            >
              Copy link
            </button>
          </div>
        </div>
      ) : null}

      {/* Report Modal */}
      {reportOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/40 p-4" onClick={() => setReportOpen(null)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Report post</div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setReportOpen(null)}>
                Close
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <label className="text-xs font-semibold text-slate-700">
                Reason
                <select
                  className="ml-2 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Spam">Spam</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setReportOpen(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => {
                  toast.success("Report submitted. Thanks!");
                  setReportOpen(null);
                  setReportReason("Spam");
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Invite Modal */}
      {inviteOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/40 p-4" onClick={() => setInviteOpen(false)} role="dialog" aria-modal>
          <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-slate-900">Invite by Email</div>
              <button type="button" className="text-sm font-semibold text-slate-600 hover:underline" onClick={() => setInviteOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-600">Enter an email and we will send an invite (coming soon)</div>
            <input
              className="mt-4 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
            />
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-[#17A2B8] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => {
                  if (!inviteEmail.trim()) {
                    toast.error("Please enter an email");
                    return;
                  }
                  toast.success("Invite sent (mock)");
                  setInviteOpen(false);
                  setInviteEmail("");
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

