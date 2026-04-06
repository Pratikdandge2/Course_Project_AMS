"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { loadRegistration } from "../../../lib/authStore";

type CompletionResponse = { percent: number; pending: string[] };

export default function CompletedPage() {
  const router = useRouter();
  const reg = useMemo(() => (typeof window === "undefined" ? { email: null, regToken: null } : loadRegistration()), []);
  const token = reg.regToken;

  const [percent, setPercent] = useState(61);
  const [pending, setPending] = useState<string[]>([
    "Upload your photograph",
    "Enter your college education details (other than Vidyavardhini's College of Engineering & Technology Alumni Association)",
    "Enter your contact details"
  ]);

  useEffect(() => {
    if (!token) return;
    apiFetch<CompletionResponse>("/api/profile/completion", { token })
      .then((r) => {
        setPercent(r.percent);
        setPending(r.pending);
      })
      .catch(() => void 0);
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Approval Pending</h1>
        <p className="mt-3 text-sm text-slate-700">
          Your membership is pending approval, you will be notified by email after approval. In case of any further
          assistance please drop a mail at dean_alumni@vcet.edu.in
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-semibold text-slate-900">{percent}% Profile Completed</div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-[#FFA500]" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
          </div>

          <div className="mt-4 text-sm text-slate-700">To increase the profile completion score:</div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            {(pending.length ? pending : ["Upload your photograph", "Enter your college education details", "Enter your contact details"]).slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            className="rounded bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            onClick={() => {
              toast("Profile completion flow is next to implement");
              router.push("/");
            }}
          >
            Continue to Complete Profile
          </button>
          <Link href="/" className="text-sm font-semibold text-[var(--navy)] hover:underline">
            Edit / Update Profile
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          After admin approval, you can log in from{" "}
          <Link className="font-semibold text-[var(--navy)] hover:underline" href="/login">
            /login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

