import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

import { requireAdmin, requireLiveSessionAccess } from "@/lib/live-access";

const LIVEKIT_ROOM_NAME = process.env.LIVEKIT_ROOM_NAME || "main";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { liveId?: string; role?: "broadcaster" | "viewer" } | null;
  const liveId = body?.liveId || "";
  const role = body?.role;

  if (!liveId || !role) {
    return NextResponse.json({ error: "liveId and role are required." }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "Missing LiveKit server credentials." }, { status: 500 });
  }

  const authResult = role === "broadcaster"
    ? await requireAdmin()
    : await requireLiveSessionAccess(liveId, { requireActive: true });

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const identity = role === "broadcaster"
    ? "streamer"
    : `viewer-${authResult.session.user.id}-${randomUUID().slice(0, 8)}`;

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name: role === "broadcaster" ? "Streamer" : authResult.session.user.name || authResult.session.user.email || "Viewer"
  });

  token.addGrant({
    roomJoin: true,
    room: LIVEKIT_ROOM_NAME,
    canPublish: role === "broadcaster",
    canPublishData: role === "broadcaster",
    canSubscribe: true
  });

  return NextResponse.json({
    token: await token.toJwt(),
    roomName: LIVEKIT_ROOM_NAME,
    identity
  });
}
