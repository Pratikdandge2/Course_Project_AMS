"use client";

const social = ["Website", "Facebook", "Twitter", "LinkedIn", "YouTube", "Instagram"];
const bottom = ["Copyright", "Disclaimer", "Terms of Use", "Privacy Policy", "Alumni Directory"];

export function Footer() {
  return (
    <footer className="mt-14 bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="text-sm font-semibold">VCET Alumni Association</div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
            {social.map((s) => (
              <a key={s} href="#" className="hover:text-white">
                {s}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-start gap-3 md:justify-end">
          <div className="rounded bg-slate-900 px-4 py-2 text-xs">Google Play</div>
          <div className="rounded bg-slate-900 px-4 py-2 text-xs">App Store</div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-slate-300">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {bottom.map((b) => (
              <a key={b} href="#" className="hover:text-white">
                {b}
              </a>
            ))}
          </div>
          <div>© {new Date().getFullYear()} VCET</div>
        </div>
      </div>
    </footer>
  );
}

