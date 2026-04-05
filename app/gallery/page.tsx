import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { getManagedGalleryItems } from "@/lib/site-content";

export default async function GalleryPage() {
  const galleryItems = await getManagedGalleryItems();

  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Galerie"
          title="Portofoliu vizual cu imagini reale din assets."
          description="Fara placeholdere, fara stock, doar continut local integrat in layout-ul nou."
        />
      </FadeIn>
      <div className="mt-10">
        <GalleryGrid items={galleryItems} />
      </div>
    </section>
  );
}
