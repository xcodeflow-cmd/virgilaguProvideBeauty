import type { LiveSession } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function isLiveSessionActive(session: Pick<LiveSession, "isLive" | "scheduledFor">, now = new Date()) {
  void now;
  return session.isLive;
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

    const upcomingSession = sessions.find((session) => session.scheduledFor.getTime() > now.getTime());

    return upcomingSession || sessions[0];
  } catch {
    return null;
  }
}

export async function getPastLiveSessions(canAccess: boolean) {
  if (!canAccess) {
    return [];
  }

  try {
    const sessions = await prisma.liveSession.findMany({
      where: {
        recordingUrl: { not: null },
        recordingData: { not: null }
      },
      orderBy: { scheduledFor: "desc" }
    });

    const now = new Date();

    return sessions.filter((session) => !isLiveSessionActive(session, now));
  } catch {
    return [];
  }
}
