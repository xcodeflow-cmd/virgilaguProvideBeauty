import { FadeIn } from "@/components/motion-shell";
import { GalleryPageContent } from "@/components/site/gallery-page-content";
import { getOrderedGalleryMedia } from "@/lib/media-library";

export default async function GalleryPage() {
  const { images, videos, whiteWorkVideos } = await getOrderedGalleryMedia();

  return (
    <section className="section-shell section-space">
      <FadeIn className="max-w-5xl">
        <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Galerie</p>
        <h1 className="mt-6 max-w-6xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
          O selectie care trebuie vazuta ca un portofoliu, nu ca o pagina de poze.
        </h1>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-[92rem]">
        <GalleryPageContent images={images} videos={videos} whiteWorkVideos={whiteWorkVideos} />
      </div>
    </section>
  );
}
