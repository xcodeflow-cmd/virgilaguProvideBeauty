import fs from "node:fs";
import fsp from "node:fs/promises";
import { Readable } from "node:stream";

import { auth } from "@/auth";
import { getLiveRecordingExtension, getLiveRecordingFilePath } from "@/lib/live-recordings";
import { canAccessLiveSession } from "@/lib/live-access";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const recording = await prisma.liveSession.findUnique({
    where: { id },
    select: {
      id: true,
      visibility: true,
      recordingData: true,
      recordingMimeType: true,
      recordingUrl: true,
      title: true
    }
  });

  if (!recording?.recordingData && !recording?.recordingUrl) {
    return Response.json({ error: "Recording not found." }, { status: 404 });
  }

  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const hasAccess = await canAccessLiveSession({
    userId: session?.user?.id,
    role: session?.user?.role,
    liveSessionId: recording.id,
    visibility: recording.visibility
  });

  if (!hasAccess) {
    return Response.json({ error: "Recording not found." }, { status: 404 });
  }

  const extension = getLiveRecordingExtension(recording?.recordingMimeType);
  const recordingPath = getLiveRecordingFilePath(id, extension);
  const fileStats = await fsp.stat(recordingPath).catch(() => null);

  if (fileStats?.isFile()) {
    const range = request.headers.get("range");
    const fileSize = fileStats.size;

    if (range) {
      const matches = /bytes=(\d+)-(\d*)/.exec(range);

      if (!matches) {
        return Response.json({ error: "Invalid range." }, { status: 416 });
      }

      const start = Number(matches[1]);
      const end = matches[2] ? Number(matches[2]) : fileSize - 1;

      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end >= fileSize || start > end) {
        return Response.json({ error: "Invalid range." }, { status: 416 });
      }

      const stream = fs.createReadStream(recordingPath, { start, end });
      const webStream = Readable.toWeb(stream) as unknown as BodyInit;

      return new Response(webStream, {
        status: 206,
        headers: {
          "Content-Type": recording?.recordingMimeType || "video/webm",
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Disposition": `inline; filename="${recording?.title || "recording"}.${extension}"`,
          "Cache-Control": "private, max-age=0, must-revalidate"
        }
      });
    }

    const stream = fs.createReadStream(recordingPath);
    const webStream = Readable.toWeb(stream) as unknown as BodyInit;

    return new Response(webStream, {
      headers: {
        "Content-Type": recording?.recordingMimeType || "video/webm",
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Content-Disposition": `inline; filename="${recording?.title || "recording"}.${extension}"`,
        "Cache-Control": "private, max-age=0, must-revalidate"
      }
    });
  }

  if (!recording?.recordingData) {
    return Response.json({ error: "Recording not found." }, { status: 404 });
  }

  const byteArray = new Uint8Array(recording.recordingData);
  const range = request.headers.get("range");

  if (range) {
    const matches = /bytes=(\d+)-(\d*)/.exec(range);

    if (!matches) {
      return Response.json({ error: "Invalid range." }, { status: 416 });
    }

    const start = Number(matches[1]);
    const end = matches[2] ? Number(matches[2]) : byteArray.byteLength - 1;

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end >= byteArray.byteLength || start > end) {
      return Response.json({ error: "Invalid range." }, { status: 416 });
    }

    return new Response(byteArray.slice(start, end + 1), {
      status: 206,
      headers: {
        "Content-Type": recording.recordingMimeType || "video/webm",
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${byteArray.byteLength}`,
        "Accept-Ranges": "bytes",
        "Content-Disposition": `inline; filename="${recording.title || "recording"}.${extension}"`,
        "Cache-Control": "private, max-age=0, must-revalidate"
      }
    });
  }

  return new Response(byteArray, {
    headers: {
      "Content-Type": recording.recordingMimeType || "video/webm",
      "Content-Length": String(byteArray.byteLength),
      "Accept-Ranges": "bytes",
      "Content-Disposition": `inline; filename="${recording.title || "recording"}.${extension}"`,
      "Cache-Control": "private, max-age=0, must-revalidate"
    }
  });
}
