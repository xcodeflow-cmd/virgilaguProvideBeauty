export function ProtectedVideoPlayer({
  canAccess,
  embedUrl,
  isActive
}: {
  canAccess: boolean;
  embedUrl?: string | null;
  isActive: boolean;
}) {
  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Virgil Agu live stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full bg-black"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-black px-6 text-center text-white/60">
          Niciun LIVE disponibil momentan
        </div>
      )}
      <div className="p-6 text-sm leading-7 text-white/62">
        {embedUrl
          ? "Playerul foloseste embed-ul video Owncast al sesiunii salvate in admin."
          : !canAccess
            ? "Ai nevoie de un abonament activ pentru a vedea sesiunea LIVE."
            : !isActive
              ? "LIVE-ul nu este activ inca. Daca este programat, playerul apare automat la ora setata."
              : "LIVE-ul nu are momentan un URL Owncast valid salvat in admin."}
      </div>
    </div>
  );
}
