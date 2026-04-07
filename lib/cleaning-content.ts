import type { StaticImageData } from "next/image";

import heroImage from "@/assets/landing page.jpeg";
import salonImage from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40.jpeg";
import salonImageWide from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg";
import galleryImage01 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.35 (1).jpeg";
import galleryImage02 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36.jpeg";
import galleryImage03 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (1).jpeg";
import galleryImage04 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (2).jpeg";
import galleryImage05 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (3).jpeg";
import galleryImage06 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (4).jpeg";
import galleryImage07 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.37 (1).jpeg";
import galleryImage08 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.37 (2).jpeg";

export type AssetImage = {
  id: string;
  label: string;
  src: StaticImageData;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  imageId: string;
};

export type UploadedGalleryImage = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  isUploaded: true;
};

export type LiveContent = {
  url: string;
};

export type CleaningContentState = {
  services: ServiceItem[];
  uploadedGallery: UploadedGalleryImage[];
  live: LiveContent;
};

export const cleaningAssetImages: AssetImage[] = [
  { id: "hero-main", label: "Hero", src: heroImage },
  { id: "service-home", label: "Home Cleaning", src: salonImageWide },
  { id: "service-office", label: "Office Cleaning", src: salonImage },
  { id: "service-deep", label: "Deep Cleaning", src: galleryImage01 },
  { id: "service-move", label: "Move In / Move Out", src: galleryImage02 },
  { id: "gallery-01", label: "Gallery 1", src: galleryImage03 },
  { id: "gallery-02", label: "Gallery 2", src: galleryImage04 },
  { id: "gallery-03", label: "Gallery 3", src: galleryImage05 },
  { id: "gallery-04", label: "Gallery 4", src: galleryImage06 },
  { id: "gallery-05", label: "Gallery 5", src: galleryImage07 },
  { id: "gallery-06", label: "Gallery 6", src: galleryImage08 }
];

export const defaultServices: ServiceItem[] = [
  {
    id: "service-1",
    title: "Standard Home Cleaning",
    description: "Curatenie recurenta pentru apartamente si case, cu checklist clar si finisaj curat.",
    imageId: "service-home"
  },
  {
    id: "service-2",
    title: "Deep Cleaning",
    description: "Curatare detaliata pentru spatii care au nevoie de mai mult timp si atentie pe suprafete.",
    imageId: "service-deep"
  },
  {
    id: "service-3",
    title: "Office Cleaning",
    description: "Solutie simpla pentru birouri si spatii comerciale care trebuie sa arate constant bine.",
    imageId: "service-office"
  }
];

export const defaultGalleryImages = [
  { id: "asset-gallery-1", title: "Kitchen Detail", category: "Assets", imageUrl: galleryImage01, isUploaded: false },
  { id: "asset-gallery-2", title: "Bathroom Finish", category: "Assets", imageUrl: galleryImage02, isUploaded: false },
  { id: "asset-gallery-3", title: "Living Room Reset", category: "Assets", imageUrl: galleryImage03, isUploaded: false },
  { id: "asset-gallery-4", title: "Office Touch", category: "Assets", imageUrl: galleryImage04, isUploaded: false },
  { id: "asset-gallery-5", title: "Detail Pass", category: "Assets", imageUrl: galleryImage05, isUploaded: false },
  { id: "asset-gallery-6", title: "Final Polish", category: "Assets", imageUrl: galleryImage06, isUploaded: false },
  { id: "asset-gallery-7", title: "Corner Cleaning", category: "Assets", imageUrl: galleryImage07, isUploaded: false },
  { id: "asset-gallery-8", title: "Surface Finish", category: "Assets", imageUrl: galleryImage08, isUploaded: false }
] as const;

export const contentStorageKey = "cleaning-site-content";

export function getAssetImageById(imageId: string) {
  return cleaningAssetImages.find((image) => image.id === imageId) ?? cleaningAssetImages[0];
}

export function getDefaultContentState(): CleaningContentState {
  return {
    services: defaultServices,
    uploadedGallery: [],
    live: {
      url: ""
    }
  };
}

export function normalizeContentState(raw: unknown): CleaningContentState {
  const fallback = getDefaultContentState();

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const value = raw as Partial<CleaningContentState>;

  return {
    services: Array.isArray(value.services) && value.services.length
      ? value.services.map((service, index) => ({
          id: service.id || `service-${index + 1}`,
          title: service.title || "Untitled service",
          description: service.description || "",
          imageId: getAssetImageById(service.imageId || "").id
        }))
      : fallback.services,
    uploadedGallery: Array.isArray(value.uploadedGallery)
      ? value.uploadedGallery.filter((item): item is UploadedGalleryImage =>
          Boolean(item && item.id && item.title && item.imageUrl)
        )
      : [],
    live: {
      url: value.live?.url || ""
    }
  };
}

export function getYoutubeVideoId(url: string) {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtube\.com\/live\/)([^?&/]+)/,
    /(?:youtu\.be\/)([^?&/]+)/,
    /(?:youtube\.com\/embed\/)([^?&/]+)/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function getYoutubeEmbedUrl(url: string) {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
