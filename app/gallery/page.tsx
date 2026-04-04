import { prisma } from "@/lib/prisma";

import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";

async function getGallery() {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });
    return items;
  } catch {
    return [
      {
        id: "1",
        title: "Noir Fade",
        category: "Skin Fade",
        imageUrl: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "2",
        title: "Texture Study",
        category: "Crop",
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "3",
        title: "Beard Finish",
        category: "Beard",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
      }
    ];
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Gallery"
          title="Cut work presented with editorial polish."
          description="A premium, responsive portfolio with hover motion and lightbox viewing for each transformation."
        />
      </FadeIn>
      <div className="mt-10">
        <GalleryGrid items={gallery} />
      </div>
    </section>
  );
}
