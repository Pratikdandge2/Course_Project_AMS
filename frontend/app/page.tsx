import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { Footer } from "../components/Footer";
import { NewsCard, type News } from "../components/NewsCard";
import { EventList, type EventItem } from "../components/EventList";

import { GalleryStrip, type GalleryPhoto } from "../components/GalleryStrip";
import { MemberAvatars, type Member } from "../components/MemberAvatars";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";
import { WorldMapDemo } from "../components/WorldMapDemo";
import { GlowingEffect } from "../components/ui/glowing-effect";
import { ScrollRevealTextureSection } from "../components/ScrollRevealTextureSection";

async function getHomeData() {
  try {
    const [news, events, gallery, members] = await Promise.all([
      apiFetch<News[]>("/api/news"),
      apiFetch<EventItem[]>("/api/events"),
      apiFetch<GalleryPhoto[]>("/api/gallery"),
      apiFetch<Member[]>("/api/members/latest"),
    ]);
    return {
      news: news.slice(0, 2),
      events: events.slice(0, 6),
      gallery: gallery.slice(0, 10),
      members,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* ── LATEST NEWS + EVENTS + PHOTOS + MEMBERS (single continuous texture + single transition) ── */}
      <ScrollRevealTextureSection>
        {/* ── LATEST NEWS + EVENTS ── */}
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
              What&apos;s Happening
            </p>
            <h2 className="section-heading mt-1 text-2xl font-black text-slate-900">
              Latest at VCET
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            {/* ── News column — compact horizontal cards ── */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-[var(--navy)]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Latest News
                </h3>
              </div>
              <div className="space-y-3">
                {data ? (
                  data.news.map((n) => <NewsCard key={n.id} item={n} />)
                ) : (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                )}
              </div>
            </div>

            {/* ── Events column ── */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-[var(--gold)]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Upcoming Events
                </h3>
              </div>
              {data ? (
                <EventList items={data.events} />
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PHOTOS + MEMBERS ── */}
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
              Our Community
            </p>
            <h2 className="section-heading mt-1 text-2xl font-black text-slate-900">
              Latest Members &amp; Photos
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {data ? (
              <>
                <GalleryStrip items={data.gallery} />
                <MemberAvatars items={data.members} />
              </>
            ) : (
              <>
                <Skeleton className="h-56 w-full" />
                <Skeleton className="h-56 w-full" />
              </>
            )}
          </div>
        </div>
      </ScrollRevealTextureSection>

      {/* ── CTA BANNER (with World Map background) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--navy-dark)] via-[var(--navy)] to-[#1e4480]">
        {/* World map background */}
        <div className="absolute inset-0 opacity-60 pointer-events-none flex items-center justify-center">
          <WorldMapDemo />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-3">
            Join the Network
          </p>
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Ready to reconnect with your{" "}
            <span className="text-[var(--gold)]">VCET family?</span>
          </h2>
          <p className="mt-3 text-white text-sm max-w-md mx-auto">
            Join thousands of alumni already on the network. It&apos;s free and always will be.
          </p>
          <a
            href="/register"
            className="relative overflow-hidden mt-20 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-8 py-4 text-sm font-bold text-slate-900 shadow-xl hover:bg-amber-400 transition-all hover:scale-105"
          >
            <GlowingEffect disabled={false} />
            <span className="relative z-10 flex items-center gap-2">
              Create Your Alumni Profile
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </a>
        </div>


        {/* Footer lives inside the same dark section so bg-transparent works */}
        <Footer />
      </section>
    </div>
  );
}
