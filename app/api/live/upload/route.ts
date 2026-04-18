import fs from "node:fs/promises";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/live-access";
import { getLiveRecordingExtension, getLiveRecordingFilePath, getLiveRecordingsDir } from "@/lib/live-recordings";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authResult = await requireAdmin();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const formData = await request.formData();
  const liveId = String(formData.get("liveId") || "");
  const file = formData.get("video");

  if (!liveId) {
    return NextResponse.json({ error: "Live session is required." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Video file is required." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const recordingMimeType = file.type || "video/webm";
  const recordingExtension = getLiveRecordingExtension(recordingMimeType);
  const recordingPath = getLiveRecordingFilePath(liveId, recordingExtension);
  const recordingUrl = `/api/live/recordings/${liveId}/video`;

  await fs.mkdir(getLiveRecordingsDir(), { recursive: true });
  await fs.writeFile(recordingPath, bytes);

  await prisma.liveSession.update({
    where: { id: liveId },
    data: {
      isLive: false,
      recordingUrl,
      recordingMimeType,
      recordingData: null
    }
  });

  return NextResponse.json({ ok: true, recordingUrl });
}
