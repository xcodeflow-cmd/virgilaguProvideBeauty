type VideoGalleryItem = {
  id: string;
  title: string;
  category: string;
  src: string;
};

export function VideoGalleryGrid({
  items,
  accent = "default"
}: {
  items: VideoGalleryItem[];
  accent?: "default" | "feedback";
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={item.id}
          className={`overflow-hidden rounded-[2rem] border ${
            accent === "feedback" ? "border-[#f0b35b]/20 bg-[#0f0a04]" : "border-white/10 bg-[#080808]"
          } shadow-[0_28px_80px_rgba(0,0,0,0.22)]`}
        >
          <div className="relative">
            <video
              src={item.src}
              controls
              playsInline
              preload={index < 2 ? "metadata" : "none"}
              className="aspect-[4/5] w-full bg-black object-cover"
            />
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <p className={`text-[10px] uppercase tracking-[0.34em] ${accent === "feedback" ? "text-[#f0b35b]" : "text-[#d6b98c]"}`}>
              {item.category}
            </p>
            <h3 className="text-2xl leading-tight text-white sm:text-[2rem]">{item.title}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}
