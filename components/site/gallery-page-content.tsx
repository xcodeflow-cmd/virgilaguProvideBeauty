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
        <h2 className="mt-4 text-4xl leading-[0.9] text-white sm:text-5xl">Pozele vin primele, fara texturi peste ele.</h2>
        <div className="mt-8">
          <GalleryGrid items={images} />
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.36em] text-[#d6b98c]">Galerie video</p>
        <h2 className="mt-4 text-4xl leading-[0.9] text-white sm:text-5xl">Galerie video</h2>
        <div className="mt-8">
          <VideoGalleryGrid items={videos} />
        </div>
      </div>
    </div>
  );
}
