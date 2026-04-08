"use client";

import { LiveChat } from "@/components/live-chat";
import { ProtectedVideoPlayer } from "@/components/protected-video-player";

export function LivePageContent({
  canAccess,
  isActive,
  embedUrl,
  liveSessionId
}: {
  canAccess: boolean;
  isActive: boolean;
  embedUrl?: string | null;
  liveSessionId?: string | null;
}) {
  return (
    <div className="space-y-6">
      <ProtectedVideoPlayer canAccess={canAccess} embedUrl={embedUrl} isActive={isActive} />
      {canAccess && isActive && liveSessionId ? <LiveChat liveSessionId={liveSessionId} /> : null}
    </div>
  );
}
