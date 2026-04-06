"use client";

const footerColumns = [
  {
    heading: "ALUMNI",
    links: [
      { label: "Members",   href: "#" },
      { label: "Events",    href: "#" },
      { label: "Job Board", href: "#" },
      { label: "Newsroom",  href: "#" },
      { label: "Gallery",   href: "#" },
    ],
  },
  {
    heading: "ASSOCIATION",
    links: [
      { label: "About Us",  href: "#" },
      { label: "Register",  href: "/register" },
      { label: "Login",     href: "/login" },
      { label: "Engage",    href: "#" },
      { label: "Mobile App",href: "#" },
    ],
  },
  {
    heading: "LEGAL",
    links: [
      { label: "Privacy Policy",   href: "#" },
      { label: "Terms of Use",     href: "#" },
      { label: "Disclaimer",       href: "#" },
      { label: "Alumni Directory", href: "#" },
      { label: "Cookie Policy",    href: "#" },
    ],
  },
];

// Setu-style social icons — SVG only, no emoji
const socialIcons = [
  {
    label: "Website",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-transparent text-slate-300">

      {/* ── MAIN CONTENT ── */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr_auto]">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/20 font-black text-white text-sm flex-shrink-0">
                V
              </div>
              <div>
                <div className="text-sm font-black text-white leading-tight">VCET</div>
                <div className="text-[11px] text-slate-400 leading-tight">Alumni Association</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-[200px]">
              Vidyavardhini&apos;s College of Engineering and Technology, Vasai. Keeping alumni connected, inspired, and growing.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8">
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {col.heading}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Send Feedback — Setu-style right column */}
          <div>
            <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
              CONTACT
            </div>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:alumni@vcet.edu.in" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Send Feedback
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-slate-400 hover:text-white transition-colors">
                  Report Issue
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR — Setu style ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">

          {/* Copyright left */}
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} VCET Alumni Association. All rights reserved.
          </div>

          {/* Social icons center — Setu-style circular bordered buttons */}
          <div className="flex items-center gap-2">
            {socialIcons.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-slate-400 hover:border-white/50 hover:text-white transition-all"
              >
                {s.svg}
              </a>
            ))}
          </div>

          {/* Privacy + Terms right */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
