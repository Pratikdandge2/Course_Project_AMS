"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { loadAuth } from "../../../lib/authStore";
import GroupCard from "../../../components/GroupCard";

type GroupItem = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  isMember: boolean;
};

const TABS = [
  { key: "MY_GROUPS", label: "My Groups" },
  { key: "INTEREST_GROUPS", label: "Interest Groups" },
  { key: "CHAPTERS", label: "Chapters" },
  { key: "CLASS_GROUPS", label: "Class Groups" },
  { key: "YEAR_GROUPS", label: "Year Groups" }
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MyGroupsPage() {
  const auth = useMemo(() => (typeof window === "undefined" ? null : loadAuth()), []);
  const token = auth?.accessToken ?? null;

  const [activeTab, setActiveTab] = useState<TabKey>("MY_GROUPS");
  const [search, setSearch] = useState("");
  const [allGroups, setAllGroups] = useState<GroupItem[]>([]);
  const [myGroups, setMyGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch groups for the active tab
  const fetchGroups = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (activeTab === "MY_GROUPS") {
        const res = await apiFetch<{ groups: GroupItem[] }>("/api/groups/my", { token });
        setMyGroups(res.groups);
        setAllGroups([]);
      } else {
        const params = new URLSearchParams({ category: activeTab });
        if (search.trim()) params.set("search", search.trim());
        const res = await apiFetch<{ groups: GroupItem[] }>(`/api/groups?${params}`, { token });
        setAllGroups(res.groups);

        // Also fetch my groups for the "My Groups" section at the top
        const myRes = await apiFetch<{ groups: GroupItem[] }>("/api/groups/my", { token });
        setMyGroups(myRes.groups.filter((g) => g.category === activeTab));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    if (activeTab !== "MY_GROUPS") fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  async function handleJoin(groupId: number) {
    if (!token) return;
    setActionLoading(groupId);
    try {
      await apiFetch(`/api/groups/${groupId}/join`, { method: "POST", token });
      toast.success("Joined group!");
      await fetchGroups();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave(groupId: number) {
    if (!token) return;
    setActionLoading(groupId);
    try {
      await apiFetch(`/api/groups/${groupId}/leave`, { method: "DELETE", token });
      toast.success("Left group");
      await fetchGroups();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave");
    } finally {
      setActionLoading(null);
    }
  }

  // Filter for display
  const displayAllGroups = allGroups.filter(
    (g) => !myGroups.some((mg) => mg.id === g.id)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <h1 className="text-2xl font-extrabold text-slate-900">My Groups</h1>
      <p className="mt-1 text-sm font-semibold text-slate-500">List of groups you belong to</p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-0 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
            className={`px-4 py-2.5 text-sm font-bold transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#1B2F5E] text-[#1B2F5E]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar (not shown on My Groups tab) */}
      {activeTab !== "MY_GROUPS" && (
        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by typing name of a Group"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1B2F5E] focus:ring-1 focus:ring-[#1B2F5E]"
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="mt-10 text-center text-sm font-semibold text-slate-500">Loading groups...</div>
      ) : (
        <>
          {/* My Groups section */}
          {myGroups.length > 0 && (
            <div className="mt-8">
              <div className="rounded-lg bg-amber-50 px-4 py-2 text-center text-sm font-bold text-slate-800">
                My Groups
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {myGroups.map((g) => (
                  <GroupCard
                    key={g.id}
                    id={g.id}
                    name={g.name}
                    memberCount={g.memberCount}
                    isMember={true}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    loading={actionLoading === g.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Groups section (only on category tabs) */}
          {activeTab !== "MY_GROUPS" && (
            <div className="mt-8">
              <div className="rounded-lg bg-amber-50 px-4 py-2 text-center text-sm font-bold text-slate-800">
                All Groups
              </div>
              {displayAllGroups.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {displayAllGroups.map((g) => (
                    <GroupCard
                      key={g.id}
                      id={g.id}
                      name={g.name}
                      memberCount={g.memberCount}
                      isMember={g.isMember}
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      loading={actionLoading === g.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 text-center text-sm text-slate-500">No groups found</div>
              )}
            </div>
          )}

          {/* Empty state for My Groups tab */}
          {activeTab === "MY_GROUPS" && myGroups.length === 0 && (
            <div className="mt-10 text-center">
              <div className="text-4xl">👥</div>
              <div className="mt-3 text-sm font-semibold text-slate-600">You haven't joined any groups yet</div>
              <button
                type="button"
                onClick={() => setActiveTab("CLASS_GROUPS")}
                className="mt-4 rounded-lg bg-[#1B2F5E] px-5 py-2 text-sm font-bold text-white hover:bg-[#15264d]"
              >
                Browse Groups
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
