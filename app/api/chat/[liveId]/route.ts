import { NextResponse } from "next/server";

import { requireLiveSessionAccess } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

async function ensureLiveAccess(liveId: string) {
  return requireLiveSessionAccess(liveId, { requireActive: true });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ liveId: string }> }
) {
  const { liveId } = await params;
  const access = await ensureLiveAccess(liveId);

  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const messages = await prisma.liveChatMessage.findMany({
    where: { liveSessionId: liveId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return NextResponse.json({
    messages: messages.reverse().map((item) => ({
      id: item.id,
      text: item.content,
      timestamp: item.createdAt.toISOString(),
      user: item.user.name || item.user.email || "Membru",
      userId: item.user.id,
      role: item.user.role
    }))
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ liveId: string }> }
) {
  const { liveId } = await params;
  const access = await ensureLiveAccess(liveId);

  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const text = (body?.text || "").trim();

  if (!text) {
    return NextResponse.json({ error: "Message text is required." }, { status: 400 });
  }

  const message = await prisma.liveChatMessage.create({
    data: {
      liveSessionId: liveId,
      userId: access.session.user.id,
      content: text
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return NextResponse.json({
    message: {
      id: message.id,
      text: message.content,
      timestamp: message.createdAt.toISOString(),
      user: message.user.name || message.user.email || "Membru",
      userId: message.user.id,
      role: message.user.role
    }
  });
}
