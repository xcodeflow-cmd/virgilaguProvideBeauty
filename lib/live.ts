import type { LiveSession } from "@prisma/client";

import { getLiveSessionStaleAfterMs } from "@/lib/live-config";
import { prisma } from "@/lib/prisma";

export function isLiveSessionActive(session: Pick<LiveSession, "isLive" | "updatedAt">, now = new Date()) {
  if (!session.isLive) {
    return false;
  }

  return now.getTime() - session.updatedAt.getTime() <= getLiveSessionStaleAfterMs();
}

export async function getPrimaryLiveSession() {
  try {
    const sessions = await prisma.liveSession.findMany({
      include: {
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }]
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
      (session) => !session.hasStarted && session.scheduledFor.getTime() > now.getTime()
    );

    return upcomingSession || null;
  } catch {
    return null;
  }
}

export async function getPastLiveSessions() {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: {
        hasStarted: true,
        isLive: false
      },
      orderBy: { scheduledFor: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        scheduledFor: true,
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
      }
    });

    const now = new Date();

    return sessions.filter((session) => session.hasStarted && !isLiveSessionActive(session, now));
  } catch {
    return [];
  }
}
