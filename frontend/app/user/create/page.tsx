"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { loadRegistration, saveRegistration, clearRegistration } from "../../../lib/authStore";
import { StepperHeader } from "../../../components/StepperHeader";

type Step1Response = { regToken: string; user: { id: number; email: string; status: string } };

function isoDateFromParts(month: string, day: string, year: string) {
  const m = Number(month);
  const d = Number(day);
  const y = Number(year);
  if (!m || !d || !y) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function CreateAccountPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const initialEmail = params.get("email") ?? "";
  const reg = useMemo(() => (typeof window === "undefined" ? { email: null, regToken: null } : loadRegistration()), []);
  const email = initialEmail || reg.email || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "PREFER_NOT_TO_DISCLOSE">("PREFER_NOT_TO_DISCLOSE");
  const [dobMonth, setDobMonth] = useState("1");
  const [dobDay, setDobDay] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Missing email. Please start from /register.");
      router.push("/register");
      return;
    }

    const dateOfBirth = isoDateFromParts(dobMonth, dobDay, dobYear);
    if (!terms) {
      toast.error("Please accept Terms of Use");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<Step1Response>("/api/auth/register/step1", {
        method: "POST",
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          gender,
          dateOfBirth: dateOfBirth ?? undefined,
          mobileNo,
          currentCity,
          password,
          acceptedTerms: true
        })
      });
      saveRegistration({ email, regToken: res.regToken });
      toast.success("Account created. Continue to step 2.");
      router.push("/user/batch");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepperHeader step={1} />

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <div className="text-xs font-semibold text-slate-600">Email Address</div>
            <div className="mt-1 font-semibold">{email}</div>
            <div className="mt-1 text-xs text-slate-500">this email id would be your login id</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-600">First Name*</div>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Last Name*</div>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Gender*</div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
              {([
                ["MALE", "Male"],
                ["FEMALE", "Female"],
                ["PREFER_NOT_TO_DISCLOSE", "Prefer not to disclose"]
              ] as const).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2">
                  <input type="radio" name="gender" checked={gender === v} onChange={() => setGender(v)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold text-slate-600">Month</div>
              <select
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m)}>
                    {new Date(2000, m - 1, 1).toLocaleString(undefined, { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">DD</div>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                inputMode="numeric"
                placeholder="DD"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">YYYY</div>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                inputMode="numeric"
                placeholder="YYYY"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-600">Mobile No*</div>
              <div className="mt-1 flex gap-2">
                <select className="rounded border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400">
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  className="flex-1 rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-600">Current City*</div>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="Enter City"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Password*</div>
            <div className="mt-1 flex items-center gap-2">
              <input
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Password must have atleast 8 chars and include Uppercase, Numeric and Special Characters
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input className="mt-1" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>
              I agree to all the Terms of Use and understand that I would create a vaave user account on signup, which is
              used for authentication across the all sites powered by vaave.com
            </span>
          </label>

          <div className="flex items-center gap-4">
            <button
              disabled={loading}
              className="rounded bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-slate-600 hover:underline"
              onClick={() => {
                clearRegistration();
                router.push("/register");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading...</div>
        </div>
      }
    >
      <CreateAccountPageInner />
    </Suspense>
  );
}

