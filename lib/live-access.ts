import { auth } from "@/auth";
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
