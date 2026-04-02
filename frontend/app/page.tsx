import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { Footer } from "../components/Footer";
import { NewsCard, type News } from "../components/NewsCard";
import { EventList, type EventItem } from "../components/EventList";
import { EngageGrid } from "../components/EngageGrid";
import { GalleryStrip, type GalleryPhoto } from "../components/GalleryStrip";
import { MemberAvatars, type Member } from "../components/MemberAvatars";
import { apiFetch } from "../lib/api";
import { Skeleton } from "../components/Skeleton";

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

      {/* ── LATEST NEWS + EVENTS ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {/* Section header */}
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                What's Happening
              </p>
              <h2 className="section-heading mt-1 text-2xl font-black text-slate-900">
                Latest at VCET
              </h2>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_400px]">
            {/* News column */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-[var(--navy)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Latest News
                </h3>
              </div>
              <div className="grid gap-5">
                {data ? (
                  data.news.map((n) => <NewsCard key={n.id} item={n} />)
                ) : (
                  <>
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                  </>
                )}
              </div>
            </div>

            {/* Events column */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-1 rounded-full bg-[var(--gold)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Upcoming Events
                </h3>
              </div>
              {data ? (
                <EventList items={data.events} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGAGE ── */}
      <EngageGrid />

      {/* ── PHOTOS + MEMBERS ── */}
      <section className="bg-white">
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
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-gradient-to-r from-[var(--navy-dark)] via-[var(--navy)] to-[#1e4480]">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Ready to reconnect with your{" "}
            <span className="text-[var(--gold)]">VCET family?</span>
          </h2>
          <p className="mt-3 text-white/60 text-sm">
            Join thousands of alumni already on the network. It&apos;s free and
            always will be.
          </p>
          <a
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-8 py-4 text-sm font-bold text-slate-900 shadow-xl hover:bg-amber-400 transition-all hover:scale-105"
          >
            Create Your Alumni Profile
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
