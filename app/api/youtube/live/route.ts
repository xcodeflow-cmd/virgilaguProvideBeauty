import { NextResponse } from "next/server";

import { getVimeoEmbedUrl, getVimeoVideoId } from "@/lib/vimeo";

export async function GET() {
  const forcedValue = process.env.VIMEO_LIVE_VIDEO_ID || process.env.VIMEO_LIVE_EMBED_URL;
  const videoId = getVimeoVideoId(forcedValue);
  const embedUrl = getVimeoEmbedUrl(forcedValue);

  if (videoId && embedUrl) {
    return NextResponse.json({
      videoId,
      embedUrl,
      source: "env"
    });
  }

  return NextResponse.json({ error: "Missing Vimeo live configuration." }, { status: 400 });
}
