import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { GalleryPageContent } from "@/components/site/gallery-page-content";

export default function GalleryPage() {
  return (
    <section className="section-shell section-space">
      <FadeIn>
        <SectionHeading
          eyebrow="Galerie"
          title="Galerie completa, construita exclusiv din imaginile locale."
          description="Grid curat, 3-4 imagini pe rand in functie de ecran, spacing consistent si lightbox fullscreen pentru preview clar."
          align="center"
        />
      </FadeIn>
      <div className="mx-auto mt-10 max-w-7xl">
        <GalleryPageContent />
      </div>
    </section>
  );
}
