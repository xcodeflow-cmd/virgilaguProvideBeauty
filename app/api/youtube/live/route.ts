import { NextResponse } from "next/server";

type YoutubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
    snippet?: {
      title?: string;
      description?: string;
      liveBroadcastContent?: string;
    };
  }>;
};

export async function GET() {
  const forcedVideoId = process.env.YOUTUBE_LIVE_VIDEO_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (forcedVideoId) {
    return NextResponse.json({
      videoId: forcedVideoId,
      embedUrl: `https://www.youtube.com/embed/${forcedVideoId}?autoplay=1&rel=0`,
      source: "env"
    });
  }

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { error: "Missing YouTube configuration." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${apiKey}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "YouTube API request failed." }, { status: 502 });
    }

    const data = (await response.json()) as YoutubeSearchResponse;
    const item = data.items?.[0];
    const videoId = item?.id?.videoId;

    if (!videoId) {
      return NextResponse.json({ error: "No active live stream found." }, { status: 404 });
    }

    return NextResponse.json({
      videoId,
      title: item?.snippet?.title || null,
      description: item?.snippet?.description || null,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      source: "youtube-api"
    });
  } catch {
    return NextResponse.json({ error: "YouTube lookup failed." }, { status: 500 });
  }
}
