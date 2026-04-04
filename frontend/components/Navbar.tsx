"use client";

import Link from "next/link";
import { useState } from "react";
import { GlowingEffect } from "./ui/glowing-effect";

const navLinks = [
  { label: "About Us",   href: "#" },
  { label: "Newsroom",   href: "#" },
  { label: "Members",    href: "#" },
  { label: "Events",     href: "#" },
  { label: "Gallery",    href: "#" },
  { label: "Engage",     href: "#" },
  { label: "Mobile App", href: "#" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-50 shadow-md">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--navy)] shadow-lg group-hover:bg-[var(--navy-light)] transition-colors">
              <span className="text-lg font-black text-white tracking-tight">V</span>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[var(--gold)] border-2 border-white" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-black text-[var(--navy)] tracking-wide">VCET</div>
              <div className="text-xs text-slate-500 font-medium">Alumni Association</div>
            </div>
          </Link>

          {/* Auth buttons — proper gap, no "|" */}
          <nav className="flex items-center gap-3">
            <Link
              href="/register"
              className="relative overflow-hidden rounded-lg bg-[var(--navy)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--navy-light)] transition-colors shadow-sm"
            >
              <GlowingEffect disabled={false} />
              <span className="relative z-10">Register</span>
            </Link>
            <Link
              href="/login"
              className="relative overflow-hidden rounded-lg border-2 border-[var(--navy)] px-5 py-2 text-sm font-bold text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white transition-all"
            >
              <GlowingEffect disabled={false} />
              <span className="relative z-10">Login</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* ── NAV BAR ── */}
      <div className="w-full bg-[var(--navy)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">

          {/* Desktop links — proper spacing */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-4 py-4 text-[13px] font-semibold tracking-wide text-white/75 hover:text-white transition-colors group"
              >
                {link.label}
                {/* Gold underline on hover */}
                <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full bg-[var(--gold)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto py-4 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              /* X icon when open */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h12" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:pl-2 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
