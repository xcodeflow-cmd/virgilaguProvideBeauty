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

    const upcomingSession = sessions.find((session) => session.scheduledFor.getTime() > now.getTime());

    return upcomingSession || sessions[0];
  } catch {
    return null;
  }
}

export async function getPastLiveSessions() {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: {
        recordingUrl: { not: null }
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

    return sessions.filter((session) => !isLiveSessionActive(session, now));
  } catch {
    return [];
  }
}
