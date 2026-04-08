import type { LiveSession } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getVimeoEmbedUrl } from "@/lib/vimeo";

export function isSubscriptionActive(status?: string | null) {
  return status === "active" || status === "trialing";
}

export async function hasLiveAccess(userId?: string) {
  if (!userId) {
    return false;
  }

  try {
    const [user, subscriptions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { isSubscribed: true }
      }),
      prisma.subscription.findMany({
        where: { userId },
        select: { status: true }
      })
    ]);

    return Boolean(user?.isSubscribed || subscriptions.some((item) => isSubscriptionActive(item.status)));
  } catch {
    return false;
  }
}

export function isLiveSessionActive(session: Pick<LiveSession, "isLive" | "scheduledFor" | "streamUrl">, now = new Date()) {
  if (!getVimeoEmbedUrl(session.streamUrl)) {
    return false;
  }

  return session.isLive || session.scheduledFor.getTime() <= now.getTime();
}

export async function getPrimaryLiveSession() {
  try {
    const sessions = await prisma.liveSession.findMany({
      orderBy: [{ isFeatured: "desc" }, { scheduledFor: "asc" }, { createdAt: "desc" }]
    });

    if (!sessions.length) {
      return null;
    }

    const now = new Date();
    const activeSession = sessions.find((session) => isLiveSessionActive(session, now));

    if (activeSession) {
      return activeSession;
    }

    const upcomingSession = sessions.find(
      (session) => Boolean(getVimeoEmbedUrl(session.streamUrl)) && session.scheduledFor.getTime() > now.getTime()
    );

    return upcomingSession || sessions[0];
  } catch {
    return null;
  }
}
