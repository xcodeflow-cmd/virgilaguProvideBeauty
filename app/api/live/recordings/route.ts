import { NextResponse } from "next/server";

import { requireSubscription } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const recordings = await prisma.liveSession.findMany({
    where: {
      isLive: false,
      recordingUrl: { not: null },
      recordingData: { not: null }
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      recordingUrl: true
    }
  });

  return NextResponse.json({
    recordings: recordings.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt.toISOString(),
      videoUrl: item.recordingUrl
    }))
  });
}
