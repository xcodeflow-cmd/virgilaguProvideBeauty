import { SessionVisibility } from "@prisma/client";
import { NextResponse } from "next/server";

import { toIsoDateString } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const recordings = await prisma.liveSession.findMany({
    where: {
      isLive: false,
      hasStarted: true,
      recordingUrl: { not: null },
      visibility: SessionVisibility.PUBLIC
    },
    orderBy: { scheduledFor: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      scheduledFor: true,
      createdAt: true,
      thumbnailUrl: true,
      recordingUrl: true,
      price: true,
      compareAtPrice: true,
      maxParticipants: true,
      hasStarted: true,
      visibility: true,
      _count: {
        select: {
          purchases: true
        }
      }
    }
  }).catch(() => []);

  return NextResponse.json({
    recordings: recordings.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: toIsoDateString(item.scheduledFor),
      thumbnailUrl: item.thumbnailUrl,
      videoUrl: item.recordingUrl || "",
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      visibility: item.visibility,
      maxParticipants: item.maxParticipants,
      purchasedCount: item._count.purchases
    }))
  });
}
