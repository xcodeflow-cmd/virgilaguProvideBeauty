import Link from "next/link";

import { auth } from "@/auth";
import { ProtectedVideoPlayer } from "@/components/protected-video-player";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getManagedLiveSessions } from "@/lib/site-content";

async function getLiveData(userId?: string) {
  const managedSessions = await getManagedLiveSessions();

  try {
    const [user, subscriptions] = await Promise.all([
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: { isSubscribed: true }
          })
        : Promise.resolve(null),
      userId
        ? prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
        : Promise.resolve([])
    ]);

    return {
      sessions: managedSessions,
      isSubscribed: Boolean(user?.isSubscribed),
      activeSubscription: subscriptions.some((item) => ["active", "trialing"].includes(item.status))
    };
  } catch {
    return {
      sessions: managedSessions,
      isSubscribed: false,
      activeSubscription: false
    };
  }
}

async function getYoutubeEmbedUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/youtube/live`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { embedUrl?: string | null };
    return data.embedUrl || null;
  } catch {
    return null;
  }
}

export default async function LivePage() {
  const session = await auth();
  const { sessions, isSubscribed, activeSubscription } = await getLiveData(session?.user?.id);
  const hasAccess = Boolean(session?.user?.id && (isSubscribed || activeSubscription));
  const featured = sessions[0];
  const upcoming = sessions.filter((item) => !item.isLive);
  const embedUrl = hasAccess ? await getYoutubeEmbedUrl() : null;

  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Live Studio"
          title="Live stream cu acces doar pe baza de abonament."
          description="Pagina foloseste autentificare, verifica flag-ul `isSubscribed` din baza de date si preia embed-ul activ prin YouTube API."
        />
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ProtectedVideoPlayer canAccess={hasAccess} embedUrl={embedUrl} />
        <div className="glass-panel rounded-[2rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Access</p>
          <h2 className="mt-4 text-4xl text-white">
            {hasAccess ? "Abonament activ" : "Trebuie sa ai abonament pentru a vedea live-ul"}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            Utilizatorii autentificati cu abonament activ vad playerul live. Restul vad un mesaj clar si call-to-action pentru abonare.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href={session?.user?.id ? "/api/stripe/checkout?mode=subscription" : "/auth/signin"}>
                {hasAccess ? "Mergi la live" : "Aboneaza-te"}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/courses">Vezi cursurile</Link>
            </Button>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            {hasAccess
              ? "Embed-ul activ este livrat prin API-ul intern `/api/youtube/live`, care poate folosi YouTube Data API sau un video ID configurat in env."
              : "Accesul la stream este blocat pana cand contul are `isSubscribed = true` sau o subscriere activa sincronizata prin webhook Stripe."}
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-14">
        <div>
          <h3 className="text-3xl text-white">Sesiuni urmatoare</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {upcoming.map((item) => (
              <VideoCard key={item.id} item={item} canAccess={hasAccess} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl text-white">Acces curent</h3>
          <div className="mt-6 glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-accent/80">Status</p>
            <p className="mt-3 text-xl text-white">{featured?.title || "LIVE Barber Experience"}</p>
            <p className="mt-3 text-base leading-7 text-white/60">
              {hasAccess
                ? "Contul tau poate accesa live-ul curent."
                : "Trebuie sa ai abonament pentru a vedea live-ul."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
