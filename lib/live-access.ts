import { PaymentType, SessionVisibility } from "@prisma/client";

import { auth } from "@/auth";
import { isLiveSessionActive } from "@/lib/live";
import { prisma } from "@/lib/prisma";

export function isSubscriptionActive(status?: string | null) {
  return status === "active" || status === "trialing";
}

export async function hasSubscriptionAccess(userId?: string, role?: string | null) {
  if (!userId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
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

export async function getPurchasedLiveSessionIds(userId?: string, role?: string | null) {
  if (!userId) {
    return [];
  }

  if (role === "ADMIN") {
    const sessions = await prisma.liveSession.findMany({
      select: { id: true }
    }).catch(() => []);

    return sessions.map((item) => item.id);
  }

  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      type: PaymentType.ONE_TIME,
      liveSessionId: { not: null }
    },
    select: {
      liveSessionId: true
    }
  }).catch(() => []);

  return Array.from(new Set(purchases.map((item) => item.liveSessionId).filter(Boolean) as string[]));
}

export async function canAccessLiveSession({
  userId,
  role,
  liveSessionId,
  visibility
}: {
  userId?: string;
  role?: string | null;
  liveSessionId?: string | null;
  visibility?: SessionVisibility | null;
}) {
  if (!liveSessionId) {
    return false;
  }

  if (role === "ADMIN") {
    return true;
  }

  const resolvedVisibility = visibility || await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    select: { visibility: true }
  }).then((item) => item?.visibility || null).catch(() => null);

  if (!resolvedVisibility) {
    return false;
  }

  if (resolvedVisibility === SessionVisibility.PUBLIC) {
    return true;
  }

  if (!userId) {
    return false;
  }

  const purchase = await prisma.purchase.findFirst({
    where: {
      userId,
      liveSessionId,
      type: PaymentType.ONE_TIME
    },
    select: { id: true }
  }).catch(() => null);

  return Boolean(purchase);
}

export async function isLiveSessionSoldOut(liveSessionId: string) {
  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    select: {
      maxParticipants: true,
      recordingUrl: true,
      _count: {
        select: {
          purchases: true
        }
      }
    }
  }).catch(() => null);

  if (!liveSession?.maxParticipants || liveSession.recordingUrl) {
    return false;
  }

  return liveSession._count.purchases >= liveSession.maxParticipants;
}

export async function requireAuthUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Authentication required.", status: 401 as const };
  }

  return { session };
}

export async function requireSubscription() {
  const authResult = await requireAuthUser();

  if ("error" in authResult) {
    return authResult;
  }

  const hasAccess = await hasSubscriptionAccess(authResult.session.user.id, authResult.session.user.role);

  if (!hasAccess) {
    return { error: "Active subscription required.", status: 403 as const };
  }

  return authResult;
}

export async function requireAdmin() {
  const authResult = await requireAuthUser();

  if ("error" in authResult) {
    return authResult;
  }

  if (authResult.session.user.role !== "ADMIN") {
    return { error: "Admin only.", status: 403 as const };
  }

  return authResult;
}

export async function requireLiveSessionAccess(
  liveSessionId: string,
  options?: { requireActive?: boolean }
) {
  if (!liveSessionId) {
    return { error: "Live session is required.", status: 400 as const };
  }

  const authResult = await requireAuthUser();

  if ("error" in authResult) {
    return authResult;
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    select: {
      id: true,
      visibility: true,
      isLive: true,
      updatedAt: true
    }
  });

  if (!liveSession) {
    return { error: "Live session not found.", status: 404 as const };
  }

  const hasAccess = await canAccessLiveSession({
    userId: authResult.session.user.id,
    role: authResult.session.user.role,
    liveSessionId,
    visibility: liveSession.visibility
  });

  if (!hasAccess) {
    return { error: "Live purchase required.", status: 403 as const };
  }

  if (options?.requireActive && !isLiveSessionActive(liveSession)) {
    return { error: "Live session is not active.", status: 403 as const };
  }

  return {
    ...authResult,
    liveSession
  };
}
