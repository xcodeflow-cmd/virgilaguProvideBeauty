import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { createLiveToken } from "@/lib/live-token";
import { getLiveHeartbeatIntervalMs, getLiveIceServers, getLiveJoinStaggerMs, getLiveReconnectDelayMs, getLiveWebSocketUrl } from "@/lib/live-config";
import { requireAdmin, requireLiveSessionAccess } from "@/lib/live-access";
import { isLiveSessionActive } from "@/lib/live";
import { prisma } from "@/lib/prisma";
import type { LiveBootstrapResponse, LiveRole } from "@/types/live-media";

type ConnectRequestBody = {
  liveId?: string;
  role?: LiveRole;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ConnectRequestBody | null;
  const liveId = body?.liveId || "";
  const role = body?.role;

  if (!liveId || !role) {
    return NextResponse.json({ error: "liveId and role are required." }, { status: 400 });
  }

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveId },
    select: {
      id: true,
      visibility: true,
      isLive: true,
      updatedAt: true
    }
  });

  if (!liveSession || !isLiveSessionActive(liveSession)) {
    return NextResponse.json({ error: "Live session is not active." }, { status: 409 });
  }

  const authResult = role === "broadcaster"
    ? await requireAdmin()
    : await requireLiveSessionAccess(liveId, { requireActive: true });

  const isAnonymousPublicViewer =
    role === "viewer" &&
    "error" in authResult &&
    authResult.status === 401 &&
    liveSession.visibility === "PUBLIC";

  if ("error" in authResult && !isAnonymousPublicViewer) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const viewerId = isAnonymousPublicViewer ? `guest-${randomUUID().slice(0, 8)}` : authResult.session.user.id;

  const response: LiveBootstrapResponse = {
    liveId,
    role,
    websocketUrl: getLiveWebSocketUrl(),
    token: createLiveToken({
      userId: role === "broadcaster" ? authResult.session.user.id : viewerId,
      liveId,
      role
    }),
    secret: process.env.LIVE_SERVER_SECRET?.trim() || null,
    iceServers: getLiveIceServers(),
    reconnectDelayMs: getLiveReconnectDelayMs(),
    heartbeatIntervalMs: getLiveHeartbeatIntervalMs(),
    joinStaggerMs: getLiveJoinStaggerMs()
  };

  return NextResponse.json(response);
}
