import { auth } from "@/auth";

import { LivePageContent } from "@/components/site/live-page-content";
import { toIsoDateString } from "@/lib/date";
import { canAccessLiveSession, getPurchasedLiveSessionIds } from "@/lib/live-access";
import { getPastLiveSessions, getPrimaryLiveSession, isLiveSessionActive } from "@/lib/live";

export default async function LivePage() {
  const [session, liveSession, pastSessions] = await Promise.all([
    auth(),
    getPrimaryLiveSession(),
    getPastLiveSessions()
  ]);
  const isAdmin = session?.user?.role === "ADMIN";
  const [purchasedLiveIds, currentSessionAccess] = await Promise.all([
    getPurchasedLiveSessionIds(session?.user?.id, session?.user?.role),
    liveSession
      ? canAccessLiveSession({
          userId: session?.user?.id,
          role: session?.user?.role,
          liveSessionId: liveSession.id,
          visibility: liveSession.visibility
        })
      : Promise.resolve(false)
  ]);
  const isActive = liveSession ? isLiveSessionActive(liveSession) : false;

  return (
    <section className="section-shell py-4 sm:py-8 lg:py-10">
      <LivePageContent
        accessibleLiveIds={purchasedLiveIds}
        canAccessCurrentSession={isAdmin || currentSessionAccess}
        isAdmin={isAdmin}
        currentUserId={session?.user?.id}
        initialSession={liveSession
          ? {
              id: liveSession.id,
              title: liveSession.title,
              description: liveSession.description,
              scheduledFor: toIsoDateString(liveSession.scheduledFor),
              isLive: isActive,
              thumbnailUrl: liveSession.thumbnailUrl,
              price: liveSession.price,
              compareAtPrice: liveSession.compareAtPrice,
              visibility: liveSession.visibility,
              maxParticipants: liveSession.maxParticipants,
              purchasedCount: liveSession._count.purchases
            }
          : null}
        pastSessions={pastSessions.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          scheduledFor: toIsoDateString(item.scheduledFor),
          thumbnailUrl: item.thumbnailUrl,
          recordingUrl: item.recordingUrl || "",
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          visibility: item.visibility,
          maxParticipants: item.maxParticipants,
          purchasedCount: item._count.purchases
        }))}
      />
    </section>
  );
}
