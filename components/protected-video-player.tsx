export function ProtectedVideoPlayer({
  canAccess,
  embedUrl
}: {
  canAccess: boolean;
  embedUrl?: string | null;
}) {
  return (
    <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
      {canAccess && embedUrl ? (
        <iframe
          src={embedUrl}
          title="Virgil Agu live stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full bg-black"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center bg-black px-6 text-center text-white/60">
          Trebuie sa ai abonament pentru a vedea live-ul
        </div>
      )}
      <div className="p-6 text-sm leading-7 text-white/62">
        {canAccess
          ? "Zona live foloseste embed YouTube si poate prelua automat sesiunea curenta din YouTube API."
          : "Accesul este permis doar utilizatorilor autentificati care au abonament activ."}
      </div>
    </div>
  );
}
