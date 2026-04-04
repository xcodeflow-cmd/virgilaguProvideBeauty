import Link from "next/link";

import { auth } from "@/auth";
import { ProtectedVideoPlayer } from "@/components/protected-video-player";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

async function getLiveData(userId?: string) {
  const fallbackSessions = [
    {
      id: "1",
      title: "Luxury Fade Workflow",
      slug: "luxury-fade-workflow",
      description: "Consultation, sectioning, taper transitions, and final detailing.",
      scheduledFor: new Date(),
      durationMinutes: 75,
      thumbnailUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
      streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      price: null,
      visibility: "SUBSCRIBERS",
      isLive: true,
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      title: "Textured Crop Masterclass",
      slug: "textured-crop-masterclass",
      description: "A modern crop build with blending and product finish.",
      scheduledFor: new Date(Date.now() - 86400000),
      durationMinutes: 60,
      thumbnailUrl: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
      streamUrl: null,
      recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      price: 1900,
      visibility: "ONE_TIME",
      isLive: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    const [sessions, subscriptions, purchases] = await Promise.all([
      prisma.liveSession.findMany({ orderBy: { scheduledFor: "asc" } }),
      userId
        ? prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
        : Promise.resolve([]),
      userId
        ? prisma.purchase.findMany({ where: { userId }, select: { liveSessionId: true } })
        : Promise.resolve([])
    ]);

    return {
      sessions: sessions.length ? sessions : fallbackSessions,
      activeSubscription: subscriptions.some(
        (item: (typeof subscriptions)[number]) => ["active", "trialing"].includes(item.status)
      ),
      purchasedSessionIds: purchases
        .map((item: (typeof purchases)[number]) => item.liveSessionId)
        .filter(Boolean)
    };
  } catch {
    return {
      sessions: fallbackSessions,
      activeSubscription: false,
      purchasedSessionIds: []
    };
  }
}

function canAccessSession(
  visibility: string,
  activeSubscription: boolean,
  purchasedSessionIds: Array<string | null>,
  sessionId: string
) {
  if (visibility === "PUBLIC") return true;
  if (visibility === "SUBSCRIBERS") return activeSubscription;
  return purchasedSessionIds.includes(sessionId);
}

export default async function LivePage() {
  const session = await auth();
  const { sessions, activeSubscription, purchasedSessionIds } = await getLiveData(session?.user?.id);
  const featured = sessions.find((item: (typeof sessions)[number]) => item.isFeatured) || sessions[0];
  const defaultOneTimeSession = sessions.find(
    (item: (typeof sessions)[number]) => item.visibility === "ONE_TIME" && item.price
  );
  const featuredAccess = featured
    ? canAccessSession(featured.visibility, activeSubscription, purchasedSessionIds, featured.id)
    : false;
  const upcoming = sessions.filter(
    (item: (typeof sessions)[number]) => new Date(item.scheduledFor) > new Date() && !item.isLive
  );
  const archive = sessions.filter((item: (typeof sessions)[number]) => item.recordingUrl);

  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Live Studio"
          title="Premium live sessions with real access control."
          description="Subscribers unlock full streams and archive access. Non-members get previews and can unlock selected sessions individually."
        />
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProtectedVideoPlayer
          canAccess={featuredAccess}
          previewUrl="https://www.w3schools.com/html/mov_bbb.mp4"
          streamUrl={featured?.streamUrl || featured?.recordingUrl}
        />
        <div className="glass-panel gold-ring rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-light/80">Access</p>
          <h2 className="mt-4 text-4xl text-white">{activeSubscription ? "Subscription active" : "Premium access locked"}</h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            The player is protected at the UI layer for MVP use and structured for future streaming-provider token gating.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/api/stripe/checkout?mode=subscription">Start Subscription</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link
                href={
                  defaultOneTimeSession
                    ? `/api/stripe/checkout?mode=payment&liveSessionId=${defaultOneTimeSession.id}`
                    : "/live"
                }
              >
                Buy One Session
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-14">
        <div>
          <h3 className="text-3xl text-white">Upcoming lives</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {upcoming.map((item: (typeof upcoming)[number]) => (
              <VideoCard
                key={item.id}
                item={item}
                canAccess={canAccessSession(item.visibility, activeSubscription, purchasedSessionIds, item.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl text-white">Past recordings</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {archive.map((item: (typeof archive)[number]) => (
              <VideoCard
                key={item.id}
                item={item}
                canAccess={canAccessSession(item.visibility, activeSubscription, purchasedSessionIds, item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
