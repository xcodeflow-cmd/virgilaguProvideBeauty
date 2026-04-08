import { NextResponse } from "next/server";

import { requireSubscription } from "@/lib/live-access";
import { getPrimaryLiveSession, isLiveSessionActive } from "@/lib/live";

export async function GET() {
  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const session = await getPrimaryLiveSession();

  if (!session || !isLiveSessionActive(session)) {
    return NextResponse.json({ live: null });
  }

  return NextResponse.json({
    live: {
      id: session.id,
      title: session.title,
      description: session.description,
      createdAt: session.createdAt.toISOString()
    }
  });
}
