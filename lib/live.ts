import { SessionVisibility, type LiveSession } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { asDate } from "@/lib/date";
import { getLiveSessionStaleAfterMs } from "@/lib/live-config";
import { prisma } from "@/lib/prisma";

const liveSessionListSelect = {
  id: true,
  title: true,
  description: true,
  scheduledFor: true,
  thumbnailUrl: true,
  recordingUrl: true,
  price: true,
  compareAtPrice: true,
  maxParticipants: true,
  hasStarted: true,
  visibility: true,
  isLive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      purchases: true
    }
  }
} as const;

export function isLiveSessionActive(session: Pick<LiveSession, "isLive" | "updatedAt">, now = new Date()) {
  if (!session.isLive) {
    return false;
  }

  const updatedAt = asDate(session.updatedAt);

  if (!updatedAt) {
    return false;
  }

  return now.getTime() - updatedAt.getTime() <= getLiveSessionStaleAfterMs();
}

async function fetchPrimaryLiveSession() {
  try {
    const now = new Date();
    const activeSessions = await prisma.liveSession.findMany({
      where: {
        isLive: true
      },
      orderBy: [{ updatedAt: "desc" }, { scheduledFor: "asc" }],
      take: 4,
      select: liveSessionListSelect
    });
    const activeSession = activeSessions.find((session) => isLiveSessionActive(session, now));

    if (activeSession) {
      return activeSession;
    }

    const upcomingSession = await prisma.liveSession.findFirst({
      where: {
        hasStarted: false
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
      select: liveSessionListSelect
    });

    return upcomingSession || null;
  } catch {
    return null;
  }
}

async function fetchPastLiveSessions() {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: {
        hasStarted: true,
        isLive: false,
        recordingUrl: { not: null },
        visibility: SessionVisibility.PUBLIC
      },
      orderBy: { scheduledFor: "desc" },
      select: liveSessionListSelect
    });

    const now = new Date();

    return sessions.filter((session) => session.hasStarted && !isLiveSessionActive(session, now));
  } catch {
    return [];
  }
}

const getCachedPrimaryLiveSession = unstable_cache(fetchPrimaryLiveSession, ["live-primary-session"], {
  revalidate: 5
});

const getCachedPastLiveSessions = unstable_cache(fetchPastLiveSessions, ["live-past-sessions"], {
  revalidate: 10
});

export async function getPrimaryLiveSession() {
  return getCachedPrimaryLiveSession();
}

export async function getPastLiveSessions() {
  return getCachedPastLiveSessions();
}
