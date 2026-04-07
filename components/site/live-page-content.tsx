"use client";

import { ProtectedVideoPlayer } from "@/components/protected-video-player";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import { getYoutubeEmbedUrl } from "@/lib/cleaning-content";

export function LivePageContent() {
  const { content } = useCleaningContent();
  const embedUrl = getYoutubeEmbedUrl(content.live.url);

  return <ProtectedVideoPlayer canAccess={Boolean(embedUrl)} embedUrl={embedUrl} />;
}
