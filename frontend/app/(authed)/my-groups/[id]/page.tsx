"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../../lib/api";
import { loadAuth } from "../../../../lib/authStore";

type GroupDetail = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  memberCount: number;
  isMember: boolean;
};

type MemberItem = {
  id: number;
  name: string;
  email: string;
  profilePhoto: string | null;
  department: string | null;
  graduationYear: number | null;
  joinedAt: string;
};

const SUB_TABS = ["Home", "Newsroom", "Events", "Members", "Albums"] as const;
type SubTab = (typeof SUB_TABS)[number];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/g)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.id);

  const auth = useMemo(() => (typeof window === "undefined" ? null : loadAuth()), []);
  const token = auth?.accessToken ?? null;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<SubTab>("Home");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [membersPage, setMembersPage] = useState(1);

  const fetchGroup = useCallback(async () => {
    if (!token || !groupId) return;
    setLoading(true);
    try {
      const res = await apiFetch<GroupDetail>(`/api/groups/${groupId}`, { token });
      setGroup(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  const fetchMembers = useCallback(
    async (page = 1) => {
      if (!token || !groupId) return;
      try {
        const res = await apiFetch<{ members: MemberItem[]; total: number; page: number }>(
          `/api/groups/${groupId}/members?page=${page}&pageSize=20`,
          { token }
        );
        setMembers(res.members);
        setMemberTotal(res.total);
        setMembersPage(page);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load members");
      }
    },
    [token, groupId]
  );

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  useEffect(() => {
    if (activeTab === "Members") fetchMembers(1);
  }, [activeTab, fetchMembers]);

  async function handleJoin() {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/groups/${groupId}/join`, { method: "POST", token });
      toast.success("Joined group!");
      await fetchGroup();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (!token) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/groups/${groupId}/leave`, { method: "DELETE", token });
      toast.success("Left group");
      await fetchGroup();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center text-sm font-semibold text-slate-500">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center text-sm font-semibold text-slate-500">Group not found</div>
      </div>
    );
  }

  const totalPages = Math.ceil(memberTotal / 20);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Group name */}
      <h1 className="text-center text-2xl font-extrabold text-slate-900">{group.name}</h1>

      {/* Sub-nav tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        {SUB_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 pb-1 text-sm font-bold transition-colors ${
              activeTab === tab
                ? "border-b-2 border-[#1B2F5E] text-[#1B2F5E]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "Home" && "🏠"}
            {tab === "Newsroom" && "📰"}
            {tab === "Events" && "📅"}
            {tab === "Members" && "👥"}
            {tab === "Albums" && "📷"}
            {tab}
          </button>
        ))}
      </div>

      {/* Join / Leave button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={actionLoading}
          onClick={group.isMember ? handleLeave : handleJoin}
          className={`rounded-lg px-6 py-2 text-sm font-bold transition-colors ${
            group.isMember
              ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              : "bg-[#1B2F5E] text-white hover:bg-[#15264d]"
          } ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {actionLoading ? "..." : group.isMember ? "Leave Group" : "Join Group"}
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === "Home" && (
          <div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="text"
                placeholder="Type here to start a discussion"
                className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") toast("Discussion feature coming soon");
                }}
              />
            </div>
            <div className="mt-8 text-center text-sm text-slate-400">No Content to Display</div>
          </div>
        )}

        {activeTab === "Newsroom" && (
          <div className="text-center text-sm text-slate-400 py-8">No newsroom posts yet</div>
        )}

        {activeTab === "Events" && (
          <div className="text-center text-sm text-slate-400 py-8">No events yet</div>
        )}

        {activeTab === "Members" && (
          <div>
            <div className="text-sm font-bold text-slate-700 mb-4">{memberTotal} Member{memberTotal !== 1 ? "s" : ""}</div>
            {members.length > 0 ? (
              <>
                <div className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-3">
                      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-200">
                        {m.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.profilePhoto} alt={m.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#1B2F5E]">{initials(m.name)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{m.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {m.department && `${m.department}`}
                          {m.department && m.graduationYear && " · "}
                          {m.graduationYear && `Class of ${m.graduationYear}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={membersPage <= 1}
                      onClick={() => fetchMembers(membersPage - 1)}
                      className="rounded bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-slate-500">
                      Page {membersPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={membersPage >= totalPages}
                      onClick={() => fetchMembers(membersPage + 1)}
                      className="rounded bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-sm text-slate-400 py-8">No members yet</div>
            )}
          </div>
        )}

        {activeTab === "Albums" && (
          <div className="text-center text-sm text-slate-400 py-8">No albums yet</div>
        )}
      </div>
    </div>
  );
}
