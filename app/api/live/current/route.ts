import { NextResponse } from "next/server";

import { toIsoDateString } from "@/lib/date";
import { getPrimaryLiveSession, isLiveSessionActive } from "@/lib/live";

export async function GET() {
  const session = await getPrimaryLiveSession();

  if (!session) {
    return NextResponse.json({ live: null });
  }

  const isLive = isLiveSessionActive(session);

  return NextResponse.json({
    live: {
      id: session.id,
      title: session.title,
      description: session.description,
      scheduledFor: toIsoDateString(session.scheduledFor),
      isLive,
      thumbnailUrl: session.thumbnailUrl,
      price: session.price,
      compareAtPrice: session.compareAtPrice,
      visibility: session.visibility,
      maxParticipants: session.maxParticipants,
      purchasedCount: session._count.purchases
    }
  });
}
