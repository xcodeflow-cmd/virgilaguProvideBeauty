"use client";

import { GalleryGrid } from "@/components/gallery-grid";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import { defaultGalleryImages } from "@/lib/cleaning-content";

export function GalleryPageContent() {
  const { content } = useCleaningContent();
  const items = [...defaultGalleryImages, ...content.uploadedGallery];

  return <GalleryGrid items={items} />;
}
