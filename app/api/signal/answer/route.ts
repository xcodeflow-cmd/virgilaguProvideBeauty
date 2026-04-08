import { LiveSignalType } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSubscription } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const body = (await request.json().catch(() => null)) as {
    liveId?: string;
    viewerId?: string;
    sdp?: unknown;
  } | null;

  if (!body?.liveId || !body.viewerId || !body.sdp) {
    return NextResponse.json({ error: "liveId, viewerId and answer SDP are required." }, { status: 400 });
  }

  await prisma.liveSignal.create({
    data: {
      liveSessionId: body.liveId,
      viewerId: body.viewerId,
      type: LiveSignalType.ANSWER,
      sdp: body.sdp
    }
  });

  return NextResponse.json({ ok: true });
}
