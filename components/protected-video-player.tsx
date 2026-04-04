export function ProtectedVideoPlayer({
  canAccess,
  previewUrl,
  streamUrl
}: {
  canAccess: boolean;
  previewUrl: string;
  streamUrl?: string | null;
}) {
  const source = canAccess ? streamUrl || previewUrl : previewUrl;

  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
      <video controls className="aspect-video w-full bg-black" poster="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80">
        <source src={source} type="video/mp4" />
      </video>
      <div className="p-6 text-sm leading-7 text-white/62">
        {canAccess
          ? "Protected stream area ready for MVP video playback or future streaming provider integration."
          : "Preview mode only. Full stream access is restricted to active subscribers or single-session purchasers."}
      </div>
    </div>
  );
}
