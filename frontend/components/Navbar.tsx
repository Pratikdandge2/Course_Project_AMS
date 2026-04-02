"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "ABOUT US", href: "#" },
  { label: "NEWSROOM", href: "#" },
  { label: "MEMBERS", href: "#" },
  { label: "EVENTS", href: "#" },
  { label: "GALLERY", href: "#" },
  { label: "ENGAGE", href: "#" },
  { label: "MOBILE APP", href: "#" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--navy)] shadow-lg group-hover:bg-[var(--navy-light)] transition-colors">
              <span className="text-lg font-black text-white tracking-tight">
                V
              </span>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[var(--gold)] border-2 border-white" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-black text-[var(--navy)] tracking-wide">
                VCET
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Alumni Association
              </div>
            </div>
          </Link>

          {/* Auth links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/register"
              className="rounded-lg bg-[var(--navy)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--navy-light)] transition-colors shadow-sm"
            >
              REGISTER
            </Link>
            <span className="text-slate-300 px-1">|</span>
            <Link
              href="/login"
              className="rounded-lg border border-[var(--navy)] px-5 py-2 text-sm font-bold text-[var(--navy)] hover:bg-slate-50 transition-colors"
            >
              LOGIN
            </Link>
          </nav>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="w-full bg-[var(--navy)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <div className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-4 py-3.5 text-xs font-bold tracking-widest text-white/80 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--gold)] group-hover:w-full transition-all duration-200" />
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto py-3 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-white" />
              <span className="block h-0.5 w-6 bg-white" />
              <span className="block h-0.5 w-4 bg-white" />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 pb-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2.5 text-xs font-bold tracking-widest text-white/80 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
