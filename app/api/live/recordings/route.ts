import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const recordings = await prisma.liveSession.findMany({
    where: {
      isLive: false,
      recordingUrl: { not: null }
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      recordingUrl: true,
      price: true,
      visibility: true
    }
  }).catch(() => []);

  return NextResponse.json({
    recordings: recordings.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt.toISOString(),
      videoUrl: item.recordingUrl,
      price: item.price,
      visibility: item.visibility
    }))
  });
}
