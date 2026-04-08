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
  { id: "service-home", label: "Curs Incepatori", src: salonImageWide },
  { id: "service-office", label: "Curs Perfectionare", src: salonImage },
  { id: "service-deep", label: "Live Barber Experience", src: galleryImage01 },
  { id: "service-move", label: "Salon Session", src: galleryImage02 },
  { id: "gallery-01", label: "Fade Detail", src: galleryImage03 },
  { id: "gallery-02", label: "Clean Blend", src: galleryImage04 },
  { id: "gallery-03", label: "Sharp Finish", src: galleryImage05 },
  { id: "gallery-04", label: "Modern Crop", src: galleryImage06 },
  { id: "gallery-05", label: "Premium Session", src: galleryImage07 },
  { id: "gallery-06", label: "Stage Result", src: galleryImage08 }
];

export const defaultServices: ServiceItem[] = [
  {
    id: "service-1",
    title: "Curs de frizerie pentru incepatori",
    description:
      "Organizat impreuna cu Scoala Comerciala si de Servicii Bacau, cu maximum 6 cursanti si pret de 3650 lei.",
    imageId: "service-home"
  },
  {
    id: "service-2",
    title: "Curs de perfectionare 1 la 1",
    description:
      "O zi intensiva alaturi de Virgil Agu, cu 2 modele reale, corectii in timp real si tehnici explicate pas cu pas.",
    imageId: "service-deep"
  },
  {
    id: "service-3",
    title: "LIVE Barber Experience",
    description:
      "Sesiuni lunare live in care Virgil tunde clienti reali si explica pas cu pas fiecare tehnica, fiecare miscare si fiecare detaliu.",
    imageId: "service-office"
  }
];

export const defaultGalleryImages = [
  { id: "asset-gallery-1", title: "Fast Fade Dublin", category: "Premii", imageUrl: galleryImage01, isUploaded: false },
  { id: "asset-gallery-2", title: "Master Barber Romania", category: "Premii", imageUrl: galleryImage02, isUploaded: false },
  { id: "asset-gallery-3", title: "Fade curat", category: "Galerie", imageUrl: galleryImage03, isUploaded: false },
  { id: "asset-gallery-4", title: "Blend precis", category: "Galerie", imageUrl: galleryImage04, isUploaded: false },
  { id: "asset-gallery-5", title: "Rezultat premium", category: "Galerie", imageUrl: galleryImage05, isUploaded: false },
  { id: "asset-gallery-6", title: "Styling modern", category: "Galerie", imageUrl: galleryImage06, isUploaded: false },
  { id: "asset-gallery-7", title: "Detaliu de salon", category: "Galerie", imageUrl: galleryImage07, isUploaded: false },
  { id: "asset-gallery-8", title: "Executie precisa", category: "Galerie", imageUrl: galleryImage08, isUploaded: false }
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

export function getVimeoVideoId(url: string) {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  const patterns = [
    /^(\d+)$/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/(?:event\/\d+\/)?(\d+)/,
    /vimeo\.com\/manage\/videos\/(\d+)/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function getVimeoEmbedUrl(url: string) {
  const videoId = getVimeoVideoId(url);
  return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
}
