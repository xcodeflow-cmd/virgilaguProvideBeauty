import { NextResponse } from "next/server";

import { getPrimaryLiveSession, isLiveSessionActive } from "@/lib/live";

export async function GET() {
  const session = await getPrimaryLiveSession();

  if (!session || !isLiveSessionActive(session)) {
    return NextResponse.json({ live: null });
  }

  return NextResponse.json({
    live: {
      id: session.id,
      title: session.title,
      description: session.description,
      scheduledFor: session.scheduledFor.toISOString(),
      price: session.price,
      compareAtPrice: session.compareAtPrice,
      visibility: session.visibility,
      maxParticipants: session.maxParticipants,
      purchasedCount: session._count.purchases
    }
  });
}
