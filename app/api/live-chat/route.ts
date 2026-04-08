import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { hasLiveAccess, isLiveSessionActive } from "@/lib/live";
import { prisma } from "@/lib/prisma";

async function getAuthorizedSession(liveSessionId: string, userId?: string) {
  if (!liveSessionId) {
    return { error: "Live session is required.", status: 400 as const };
  }

  if (!userId) {
    return { error: "Authentication required.", status: 401 as const };
  }

  const hasAccess = await hasLiveAccess(userId);

  if (!hasAccess) {
    return { error: "Active subscription required.", status: 403 as const };
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId }
  });

  if (!liveSession || !isLiveSessionActive(liveSession)) {
    return { error: "Live session is not active.", status: 403 as const };
  }

  return { liveSession };
}

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const liveSessionId = searchParams.get("liveSessionId") || "";
  const authorization = await getAuthorizedSession(liveSessionId, session?.user?.id);

  if ("error" in authorization) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  const messages = await prisma.liveChatMessage.findMany({
    where: { liveSessionId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return NextResponse.json({
    messages: messages.reverse().map((item) => ({
      id: item.id,
      content: item.content,
      createdAt: item.createdAt.toISOString(),
      user: {
        name: item.user.name || item.user.email || "Membru"
      }
    }))
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = (await request.json().catch(() => null)) as { liveSessionId?: string; content?: string } | null;
  const liveSessionId = body?.liveSessionId || "";
  const content = (body?.content || "").trim();
  const authorization = await getAuthorizedSession(liveSessionId, session?.user?.id);

  if ("error" in authorization) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  if (!content) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  await prisma.liveChatMessage.create({
    data: {
      liveSessionId,
      userId: session?.user?.id || "",
      content
    }
  });

  const messages = await prisma.liveChatMessage.findMany({
    where: { liveSessionId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return NextResponse.json({
    messages: messages.reverse().map((item) => ({
      id: item.id,
      content: item.content,
      createdAt: item.createdAt.toISOString(),
      user: {
        name: item.user.name || item.user.email || "Membru"
      }
    }))
  });
}
