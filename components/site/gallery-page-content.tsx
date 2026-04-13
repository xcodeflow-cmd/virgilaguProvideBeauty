import { GalleryGrid } from "@/components/gallery-grid";
import { VideoGalleryGrid } from "@/components/video-gallery-grid";

export function GalleryPageContent({
  images,
  videos
}: {
  images: Array<{ id: string; title: string; category: string; imageUrl: string }>;
  videos: Array<{ id: string; title: string; category: string; src: string }>;
}) {
  return (
    <div className="space-y-14">
      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-[#d6b98c]">Galerie foto</p>
        <div className="mt-8">
          <GalleryGrid items={images} />
        </div>
      </div>

      <div>
        <div className="mt-8">
          <VideoGalleryGrid items={videos} hideMeta />
        </div>
      </div>
    </div>
  );
}
