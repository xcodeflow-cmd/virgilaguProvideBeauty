import { NextResponse } from "next/server";

import { getOwncastEmbedUrl, normalizeOwncastUrl } from "@/lib/owncast";

export async function GET() {
  const serverUrl = normalizeOwncastUrl(process.env.OWNCAST_SERVER_URL);
  const embedUrl = getOwncastEmbedUrl(serverUrl);

  if (serverUrl && embedUrl) {
    return NextResponse.json({
      serverUrl,
      embedUrl,
      source: "env"
    });
  }

  return NextResponse.json({ error: "Missing Owncast live configuration." }, { status: 400 });
}
