import { NextResponse } from "next/server";

import { hasLiveChatRestriction, requireAdmin, requireLiveSessionAccess } from "@/lib/live-access";
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

  const restrictedUserIds = access.session.user.role === "ADMIN"
    ? new Set((await prisma.liveChatRestriction.findMany({
        where: { liveSessionId: liveId },
        select: { userId: true }
      })).map((item) => item.userId))
    : new Set<string>();

  const messages = await prisma.liveChatMessage.findMany({
    where: { liveSessionId: liveId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isChatBlocked: true
        }
      }
    }
  });

  return NextResponse.json({
    messages: messages.map((item) => ({
      id: item.id,
      text: item.content,
      timestamp: item.createdAt.toISOString(),
      user: item.user.name || item.user.email || "Membru",
      userId: item.user.id,
      role: item.user.role,
      chatBlockedGlobally: access.session.user.role === "ADMIN" ? item.user.isChatBlocked : undefined,
      chatRestrictedInLive: access.session.user.role === "ADMIN" ? restrictedUserIds.has(item.user.id) : undefined
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

  if (access.session.user.role !== "ADMIN" && await hasLiveChatRestriction(liveId, access.session.user.id)) {
    return NextResponse.json({ error: "Accesul tau la chat a fost oprit." }, { status: 403 });
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
          role: true,
          isChatBlocked: true
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
      role: message.user.role,
      chatBlockedGlobally: undefined,
      chatRestrictedInLive: undefined
    }
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ liveId: string }> }
) {
  const { liveId } = await params;
  const admin = await requireAdmin();

  if ("error" in admin) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const body = (await request.json().catch(() => null)) as {
    action?: "disableChat" | "blockUser" | "deleteMessage";
    messageId?: string;
    userId?: string;
  } | null;
  const action = body?.action;
  const messageId = String(body?.messageId || "");
  const userId = String(body?.userId || "");

  if (!action || !messageId) {
    return NextResponse.json({ error: "Action and messageId are required." }, { status: 400 });
  }

  if (action === "deleteMessage") {
    await prisma.liveChatMessage.deleteMany({
      where: {
        id: messageId,
        liveSessionId: liveId
      }
    });

    return NextResponse.json({ ok: true });
  }

  if (!userId) {
    return NextResponse.json({ error: "User id is required for this action." }, { status: 400 });
  }

  if (userId === admin.session.user.id) {
    return NextResponse.json({ error: "Nu iti poti modifica propriul acces din moderare." }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true
    }
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Utilizatorul nu exista." }, { status: 404 });
  }

  if (targetUser.role === "ADMIN") {
    return NextResponse.json({ error: "Nu poti modera un alt admin din acest meniu." }, { status: 403 });
  }

  if (action === "disableChat") {
    await prisma.liveChatRestriction.upsert({
      where: {
        liveSessionId_userId: {
          liveSessionId: liveId,
          userId
        }
      },
      update: {},
      create: {
        liveSessionId: liveId,
        userId
      }
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "blockUser") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        isChatBlocked: true
      }
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown moderation action." }, { status: 400 });
}
