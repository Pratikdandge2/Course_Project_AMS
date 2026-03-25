"use client";

import clsx from "clsx";

function StepCircle({ state, label }: { state: "active" | "done" | "inactive"; label: string }) {
  const base = "grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold";
  const cls =
    state === "active"
      ? "bg-[#F5A623] text-white"
      : state === "done"
        ? "bg-[var(--accent)] text-white"
        : "border border-slate-300 text-slate-500";
  return (
    <div className="flex items-center gap-2">
      <div className={clsx(base, cls)} aria-hidden>
        {state === "done" ? "✓" : "●"}
      </div>
      <div className={clsx("text-sm font-semibold", state === "inactive" ? "text-slate-500" : "text-slate-900")}>
        {label}
      </div>
    </div>
  );
}

export function StepperHeader({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-6">
        <StepCircle state={step === 1 ? "active" : "done"} label="Create Account" />
        <StepCircle state={step === 2 ? "active" : "inactive"} label="Batch / Faculty Details" />
      </div>
      <div className="text-xs text-slate-600">
        <div className="font-semibold text-slate-700">Registration Helpline</div>
        <div>Admin (1991919191)</div>
      </div>
    </div>
  );
}

