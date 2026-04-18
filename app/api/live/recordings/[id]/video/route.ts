import fs from "node:fs";
import fsp from "node:fs/promises";
import { Readable } from "node:stream";

import { getLiveRecordingExtension, getLiveRecordingFilePath } from "@/lib/live-recordings";
import { prisma } from "@/lib/prisma";
import { requireLiveSessionAccess } from "@/lib/live-access";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authResult = await requireLiveSessionAccess(id);

  if ("error" in authResult) {
    return Response.json({ error: authResult.error }, { status: authResult.status });
  }
  const recording = await prisma.liveSession.findUnique({
    where: { id },
    select: {
      recordingData: true,
      recordingMimeType: true,
      title: true
    }
  });

  const extension = getLiveRecordingExtension(recording?.recordingMimeType);
  const recordingPath = getLiveRecordingFilePath(id, extension);
  const fileStats = await fsp.stat(recordingPath).catch(() => null);

  if (fileStats?.isFile()) {
    const stream = fs.createReadStream(recordingPath);
    const webStream = Readable.toWeb(stream) as unknown as BodyInit;

    return new Response(webStream, {
      headers: {
        "Content-Type": recording?.recordingMimeType || "video/webm",
        "Content-Length": String(fileStats.size),
        "Content-Disposition": `inline; filename="${recording?.title || "recording"}.${extension}"`,
        "Cache-Control": "private, max-age=0, must-revalidate"
      }
    });
  }

  if (!recording?.recordingData) {
    return Response.json({ error: "Recording not found." }, { status: 404 });
  }

  return new Response(recording.recordingData, {
    headers: {
      "Content-Type": recording.recordingMimeType || "video/webm",
      "Content-Disposition": `inline; filename="${recording.title || "recording"}.${extension}"`,
      "Cache-Control": "private, max-age=0, must-revalidate"
    }
  });
}
