import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authResult = await requireAdmin();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = (await request.json().catch(() => null)) as { liveId?: string } | null;
  const liveId = body?.liveId || "";

  if (!liveId) {
    return NextResponse.json({ error: "Live session is required." }, { status: 400 });
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveId }
  });

  if (!liveSession) {
    return NextResponse.json({ error: "Live session not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.liveSession.updateMany({
      where: { isLive: true },
      data: { isLive: false }
    }),
    prisma.liveSession.update({
      where: { id: liveId },
      data: {
        isLive: true,
        scheduledFor: new Date(),
        recordingUrl: null,
        recordingMimeType: null,
        recordingData: null
      }
    }),
    prisma.liveSignal.deleteMany({
      where: { liveSessionId: liveId }
    }),
    prisma.liveChatMessage.deleteMany({
      where: { liveSessionId: liveId }
    })
  ]);

  return NextResponse.json({ ok: true, liveId });
}
