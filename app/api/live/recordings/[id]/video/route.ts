import { prisma } from "@/lib/prisma";
import { requireSubscription } from "@/lib/live-access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSubscription();

  if ("error" in authResult) {
    return Response.json({ error: authResult.error }, { status: authResult.status });
  }

  const { id } = await params;
  const recording = await prisma.liveSession.findUnique({
    where: { id },
    select: {
      recordingData: true,
      recordingMimeType: true,
      title: true
    }
  });

  if (!recording?.recordingData) {
    return Response.json({ error: "Recording not found." }, { status: 404 });
  }

  return new Response(recording.recordingData, {
    headers: {
      "Content-Type": recording.recordingMimeType || "video/webm",
      "Content-Disposition": `inline; filename="${recording.title || "recording"}.webm"`,
      "Cache-Control": "private, max-age=0, must-revalidate"
    }
  });
}
