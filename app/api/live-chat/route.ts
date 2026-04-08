import { NextResponse } from "next/server";

import { requireSubscription } from "@/lib/live-access";
import { isLiveSessionActive } from "@/lib/live";
import { prisma } from "@/lib/prisma";

async function getAuthorizedSession(liveSessionId: string) {
  if (!liveSessionId) {
    return { error: "Live session is required.", status: 400 as const };
  }

  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return authResult;
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId }
  });

  if (!liveSession || !isLiveSessionActive(liveSession)) {
    return { error: "Live session is not active.", status: 403 as const };
  }

  return {
    ...authResult,
    liveSession
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const liveSessionId = searchParams.get("liveSessionId") || "";
  const authorization = await getAuthorizedSession(liveSessionId);

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
  const body = (await request.json().catch(() => null)) as { liveSessionId?: string; content?: string } | null;
  const liveSessionId = body?.liveSessionId || "";
  const content = (body?.content || "").trim();
  const authorization = await getAuthorizedSession(liveSessionId);

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
      userId: authorization.session.user.id,
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
