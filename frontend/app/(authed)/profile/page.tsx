"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import toast from "react-hot-toast";
import { clearAuth, loadAuth, type AuthState } from "../../../lib/authStore";
import { useRouter } from "next/navigation";

type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: "ALUMNI" | "ADMIN";
  profilePhoto: string | null;
};

type CompletionResponse = {
  percent: number;
  pending: string[];
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState<CompletionResponse | null>(null);

  const firstName = useMemo(() => (me?.name ? me.name.split(/\s+/g)[0] : ""), [me?.name]);

  useEffect(() => {
    const auth: AuthState | null = typeof window === "undefined" ? null : loadAuth();
    const token = auth?.accessToken ?? null;
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    Promise.all([apiFetch<MeResponse>("/api/auth/me", { token }), apiFetch<CompletionResponse>("/api/profile/completion", { token })])
      .then(([m, c]) => {
        setMe(m);
        setCompletion(c);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-700">Loading...</div>
      ) : me ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          {/* LEFT 70% */}
          <div className="lg:col-span-7">
            {/* Profile Header Card */}
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="absolute right-4 top-4">
                <span className="inline-flex items-center rounded-full bg-[#17A2B8] px-3 py-1 text-xs font-extrabold text-white">ALUMNUS</span>
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative">
                  <div className="grid h-[150px] w-[150px] place-items-center overflow-hidden rounded-full bg-slate-100">
                    {me.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={me.profilePhoto} alt={me.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-extrabold text-[var(--navy)]">{initials(me.name)}</span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-2xl font-extrabold text-slate-900">{me.name}</div>
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-extrabold text-emerald-700">
                      ✅
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {/* Social icons row (demo placeholders) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: "f", cls: "bg-[#2563EB]" },
                        { label: "t", cls: "bg-[#06B6D4]" },
                        { label: "in", cls: "bg-[#2563EB]" },
                        { label: "🔗", cls: "bg-[#16A34A]" }
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`grid h-9 w-9 place-items-center rounded-full border border-slate-200 ${s.cls} text-white`}
                          title="Social"
                        >
                          <span className="text-xs font-extrabold">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-slate-700">
                    intern at vcet
                    <div className="mt-1 text-sm font-semibold text-slate-600">BE 2013, CE</div>
                    <div className="mt-1 text-sm font-semibold text-slate-600">Vasai, Maharashtra, India</div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => router.push("/profile/edit")}
                    >
                      EDIT PROFILE
                    </button>
                    <button
                      type="button"
                      className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                      onClick={() => {
                        clearAuth();
                        toast.success("Logged out");
                        router.push("/login");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Sections */}
            <div className="mt-6 space-y-4" id="incomplete-section">
              <SectionCard
                title="Professional Details"
                icon="💼"
                onEdit={() => router.push("/profile/edit")}
              >
                <div className="text-sm font-semibold text-slate-700">vcet</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">intern | 2014 to 2017</div>
                <div className="mt-2 text-sm text-slate-600">Experience: 3 Years</div>
                <div className="mt-1 text-sm text-slate-600">Roles played: Computer Operator</div>
              </SectionCard>

              <SectionCard title="Education Details" icon="📖" onEdit={() => router.push("/profile/edit")}>
                <div className="text-sm font-semibold text-slate-700">COMPS (2013 - 2017)</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">Vidyavardhini&apos;s College of Engineering and Technology</div>
                <div className="mt-2 text-sm text-slate-600">BE - Computer Engineering - 2013</div>
              </SectionCard>

              <SectionCard title="Personal Information" icon="👤" onEdit={() => router.push("/profile/edit")}>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-700">About me</span> &nbsp;-&nbsp;
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Born on</span> &nbsp;08 August 1998
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Relationship Status</span> &nbsp;No Answer
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Wedding Anniversary</span> &nbsp;-
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Contact Details" icon="📇" onEdit={() => router.push("/profile/edit")}>
                <div className="text-sm font-semibold text-slate-700">Lives in: Mumbai, India</div>
                <div className="mt-1 text-sm text-slate-600">Mobile: (demo)</div>
                <div className="mt-1 text-sm text-slate-600">Email: {me.email}</div>
              </SectionCard>

              <SectionCard title="Attachments" icon="📎" onEdit={() => router.push("/profile/edit")}>
                <div className="text-sm text-slate-600">No Files Uploaded</div>
                <button
                  type="button"
                  className="mt-3 rounded border border-[#17A2B8] px-4 py-2 text-sm font-semibold text-[#17A2B8] hover:bg-[#17A2B8]/5"
                  onClick={() => toast("Upload attachments coming soon")}
                >
                  Click here to upload
                </button>
              </SectionCard>

              <SectionCard title="Achievements" icon="🏆" onEdit={() => router.push("/profile/edit")}>
                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">Academic / Sports achievements (demo)</div>
              </SectionCard>
            </div>
          </div>

          {/* RIGHT 30% */}
          <aside className="lg:col-span-3">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-extrabold text-slate-900">Profile Views</div>
                <div className="mt-2 text-sm font-extrabold text-slate-700">1</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">Profile Completion Bar</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">{completion ? `${completion.percent}% Profile Completed` : "—"}</div>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-extrabold text-[#17A2B8] hover:underline"
                    onClick={() => {
                      document.getElementById("incomplete-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-3 w-full rounded-full bg-slate-100 p-1">
                  <div
                    className="h-3 rounded-full bg-[#FFA500]"
                    style={{ width: `${Math.max(0, Math.min(100, completion?.percent ?? 0))}%` }}
                  />
                </div>

                {completion?.pending?.length ? (
                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    Pending: {completion.pending.slice(0, 2).join(", ")}
                    {completion.pending.length > 2 ? "..." : ""}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900">👥 BATCHMATES</div>
                  <button type="button" className="text-xs font-semibold text-[#17A2B8] hover:underline" onClick={() => router.push("/members?filter=batchmates")}>
                    See All
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {["Niyoshi Mehta", "Sayali Patil", "Romita Rath"].map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-[var(--navy)]">
                        {initials(n)}
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{n}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm font-extrabold text-slate-900">◉◉ ACTIVITY</div>
                <div className="mt-3 text-sm font-semibold text-slate-600">No Posts</div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">Could not load profile.</div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  onEdit,
  children
}: {
  title: string;
  icon: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold tracking-wider text-slate-500">{icon} &nbsp;{title.toUpperCase()}</div>
        </div>
        <button type="button" className="text-xs font-extrabold text-[#17A2B8] hover:underline" onClick={onEdit}>
          Edit
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

