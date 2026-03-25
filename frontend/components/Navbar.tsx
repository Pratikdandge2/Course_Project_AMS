"use client";

import Link from "next/link";

const topLinks = [
  "ABOUT US",
  "NEWSROOM",
  "MEMBERS",
  "EVENTS",
  "GALLERY",
  "ENGAGE",
  "MOBILE APP"
];

export function Navbar() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded bg-[var(--navy)] text-white"
            aria-hidden
          >
            V
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-800">VCET</div>
            <div className="text-sm text-slate-600">Alumni Association</div>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link className="text-[var(--navy)] hover:underline" href="/register">
            REGISTER
          </Link>
          <span className="text-slate-300">::</span>
          <Link className="text-[var(--navy)] hover:underline" href="/login">
            LOGIN
          </Link>
        </nav>
      </div>

      <div className="w-full bg-[var(--navy)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 text-xs font-semibold tracking-wide text-white">
          {topLinks.map((t) => (
            <a key={t} href="#" className="opacity-95 hover:opacity-100">
              {t}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

