import { LiveSignalType } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSubscription } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ liveId: string }> }
) {
  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { liveId } = await params;
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const viewerId = searchParams.get("viewerId") || "";

  if (role === "admin") {
    if (authResult.session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only." }, { status: 403 });
    }

    const [requests, answers] = await Promise.all([
      prisma.liveSignal.findMany({
        where: { liveSessionId: liveId, type: LiveSignalType.REQUEST },
        orderBy: { createdAt: "asc" }
      }),
      prisma.liveSignal.findMany({
        where: { liveSessionId: liveId, type: LiveSignalType.ANSWER },
        orderBy: { createdAt: "asc" }
      })
    ]);

    if (requests.length || answers.length) {
      await prisma.liveSignal.deleteMany({
        where: {
          id: {
            in: [...requests, ...answers].map((item) => item.id)
          }
        }
      });
    }

    return NextResponse.json({
      pendingRequests: [...new Set(requests.map((item) => item.viewerId))],
      answers: answers.map((item) => ({
        viewerId: item.viewerId,
        sdp: item.sdp
      }))
    });
  }

  if (!viewerId) {
    return NextResponse.json({ error: "viewerId is required." }, { status: 400 });
  }

  const offer = await prisma.liveSignal.findFirst({
    where: {
      liveSessionId: liveId,
      viewerId,
      type: LiveSignalType.OFFER
    },
    orderBy: { createdAt: "desc" }
  });

  if (offer) {
    await prisma.liveSignal.delete({
      where: { id: offer.id }
    });
  }

  return NextResponse.json({
    offer: offer?.sdp || null
  });
}
