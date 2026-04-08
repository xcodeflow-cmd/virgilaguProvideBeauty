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
    type?: "request" | "offer";
  } | null;

  const liveId = body?.liveId || "";
  const viewerId = body?.viewerId || "";

  if (!liveId || !viewerId) {
    return NextResponse.json({ error: "liveId and viewerId are required." }, { status: 400 });
  }

  if (body?.type === "request") {
    await prisma.liveSignal.create({
      data: {
        liveSessionId: liveId,
        viewerId,
        type: LiveSignalType.REQUEST
      }
    });

    return NextResponse.json({ ok: true });
  }

  if (authResult.session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  if (!body?.sdp) {
    return NextResponse.json({ error: "Offer SDP is required." }, { status: 400 });
  }

  await prisma.liveSignal.create({
    data: {
      liveSessionId: liveId,
      viewerId,
      type: LiveSignalType.OFFER,
      sdp: body.sdp
    }
  });

  return NextResponse.json({ ok: true });
}
