import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeOwncastUrl } from "@/lib/owncast";

function getEventName(payload: Record<string, unknown>) {
  const candidates = [
    payload.event,
    payload.type,
    payload.name,
    payload.eventName,
    payload.eventType
  ];

  return String(candidates.find((value) => typeof value === "string") || "").toUpperCase();
}

function getServerUrl(payload: Record<string, unknown>) {
  const candidates = [
    payload.streamUrl,
    payload.serverUrl,
    payload.url,
    payload.instanceUrl,
    process.env.OWNCAST_SERVER_URL
  ];

  for (const candidate of candidates) {
    const normalized = normalizeOwncastUrl(typeof candidate === "string" ? candidate : null);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function getRecordingUrl(payload: Record<string, unknown>) {
  const candidates = [payload.recordingUrl, payload.vodUrl, payload.archiveUrl];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

async function findSessionByServerUrl(serverUrl: string, now: Date) {
  const exactMatch = await prisma.liveSession.findFirst({
    where: { streamUrl: serverUrl },
    orderBy: [{ isLive: "desc" }, { scheduledFor: "desc" }]
  });

  if (exactMatch) {
    return exactMatch;
  }

  return prisma.liveSession.findFirst({
    where: {
      OR: [{ isLive: true }, { scheduledFor: { lte: now } }]
    },
    orderBy: [{ isLive: "desc" }, { scheduledFor: "desc" }]
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const configuredSecret = process.env.OWNCAST_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-owncast-webhook-secret") || url.searchParams.get("secret");

  if (configuredSecret && providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized webhook." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const eventName = getEventName(payload);
  const serverUrl = getServerUrl(payload);

  if (!serverUrl) {
    return NextResponse.json({ error: "Missing Owncast server URL." }, { status: 400 });
  }

  const now = new Date();

  if (eventName.includes("START")) {
    const currentSession = await findSessionByServerUrl(serverUrl, now);

    if (!currentSession) {
      return NextResponse.json({ ok: true, updated: false });
    }

    await prisma.liveSession.update({
      where: { id: currentSession.id },
      data: {
        isLive: true,
        streamUrl: serverUrl
      }
    });

    return NextResponse.json({ ok: true, updated: true, sessionId: currentSession.id });
  }

  if (eventName.includes("STOP") || eventName.includes("END")) {
    const currentSession = await findSessionByServerUrl(serverUrl, now);

    if (!currentSession) {
      return NextResponse.json({ ok: true, updated: false });
    }

    await prisma.liveSession.update({
      where: { id: currentSession.id },
      data: {
        isLive: false,
        streamUrl: serverUrl,
        recordingUrl: getRecordingUrl(payload) || currentSession.recordingUrl
      }
    });

    return NextResponse.json({ ok: true, updated: true, sessionId: currentSession.id });
  }

  return NextResponse.json({ ok: true, ignored: true, eventName });
}
