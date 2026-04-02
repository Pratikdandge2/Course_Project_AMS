"use client";

const social = [
  { label: "Website", href: "#", icon: "🌐" },
  { label: "Facebook", href: "#", icon: "📘" },
  { label: "Twitter", href: "#", icon: "🐦" },
  { label: "LinkedIn", href: "#", icon: "💼" },
  { label: "YouTube", href: "#", icon: "▶️" },
  { label: "Instagram", href: "#", icon: "📸" },
];

const bottom = [
  "Disclaimer",
  "Terms of Use",
  "Privacy Policy",
  "Alumni Directory",
];

export function Footer() {
  return (
    <footer className="bg-transparent text-slate-300">
      {/* Main footer body */}
      <div className="mx-auto max-w-6xl grid gap-10 px-4 py-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-lg font-black text-white">
              V
            </div>
            <div>
              <div className="text-sm font-black text-white">VCET</div>
              <div className="text-xs text-slate-400">Alumni Association</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
            Vidyavardhini's College of Engineering and Technology, Vasai.
            Keeping our alumni connected, inspired, and growing.
          </p>
        </div>

        {/* Social links */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Follow Us
          </div>
          <div className="grid grid-cols-3 gap-2">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <span>{s.icon}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* App download */}
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            Download App
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/10 transition-all"
            >
              <span className="text-2xl">▶</span>
              <div>
                <div className="text-[10px] text-slate-400">GET IT ON</div>
                <div className="text-sm font-bold text-white">Google Play</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/10 transition-all"
            >
              <span className="text-2xl"></span>
              <div>
                <div className="text-[10px] text-slate-400">
                  DOWNLOAD ON THE
                </div>
                <div className="text-sm font-bold text-white">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-400">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {bottom.map((b) => (
              <a
                key={b}
                href="#"
                className="hover:text-white transition-colors"
              >
                {b}
              </a>
            ))}
          </div>
          <div>
            © {new Date().getFullYear()} VCET Alumni Association. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
