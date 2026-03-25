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
  const [news, events, gallery, members] = await Promise.all([
    apiFetch<News[]>("/api/news"),
    apiFetch<EventItem[]>("/api/events"),
    apiFetch<GalleryPhoto[]>("/api/gallery"),
    apiFetch<Member[]>("/api/members/latest")
  ]);

  return {
    news: news.slice(0, 2),
    events: events.slice(0, 6),
    gallery: gallery.slice(0, 10),
    members
  };
}

export default async function HomePage() {
  let data:
    | Awaited<ReturnType<typeof getHomeData>>
    | null = null;
  try {
    data = await getHomeData();
  } catch {
    data = null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Latest News</h2>
          <div className="mt-5 grid gap-4">
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

        <div className="md:pt-9">
          {data ? (
            <EventList items={data.events} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">Events</div>
              <div className="mt-4 grid gap-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          )}
        </div>
      </section>

      <EngageGrid />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
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
      </section>

      <Footer />
    </div>
  );
}

