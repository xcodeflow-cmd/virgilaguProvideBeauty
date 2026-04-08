"use client";

import { LiveChat } from "@/components/live-chat";
import { PastLiveList } from "@/components/past-live-list";
import { ProtectedVideoPlayer } from "@/components/protected-video-player";

export function LivePageContent({
  canAccess,
  isActive,
  embedUrl,
  liveSessionId,
  pastSessions
}: {
  canAccess: boolean;
  isActive: boolean;
  embedUrl?: string | null;
  liveSessionId?: string | null;
  pastSessions: Array<{
    id: string;
    title: string;
    description: string;
    scheduledFor: string;
    recordingUrl: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <ProtectedVideoPlayer canAccess={canAccess} embedUrl={embedUrl} isActive={isActive} />
      {canAccess && isActive && liveSessionId ? <LiveChat liveSessionId={liveSessionId} /> : null}
      <PastLiveList canAccess={canAccess} sessions={pastSessions} />
    </div>
  );
}
