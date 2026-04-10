import type { StaticImageData } from "next/image";

import heroImage from "@/assets/landing page.jpeg";
import salonImage from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40.jpeg";
import salonImageWide from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg";
import galleryImage01 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.35 (1).jpeg";
import galleryImage02 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36.jpeg";
import galleryImage03 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (1).jpeg";

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
  subtitle?: string;
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
  hiddenAssetGalleryIds: string[];
  live: LiveContent;
};

export const cleaningAssetImages: AssetImage[] = [
  { id: "hero-main", label: "Hero", src: heroImage },
  { id: "service-home", label: "Curs Incepatori", src: salonImageWide },
  { id: "service-office", label: "Curs Perfectionare", src: salonImage },
  { id: "service-deep", label: "Live Barber Experience", src: galleryImage01 },
  { id: "service-move", label: "Salon Session", src: galleryImage02 },
  { id: "gallery-01", label: "Fade Detail", src: galleryImage03 },
  { id: "gallery-02", label: "Clean Blend", src: galleryImage01 },
  { id: "gallery-03", label: "Sharp Finish", src: galleryImage02 },
  { id: "gallery-04", label: "Modern Crop", src: galleryImage03 }
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
  { id: "asset-gallery-3", title: "Fade curat", category: "Galerie", imageUrl: galleryImage03, isUploaded: false }
] as const;

export const contentStorageKey = "cleaning-site-content";

export function getAssetImageById(imageId: string) {
  return cleaningAssetImages.find((image) => image.id === imageId) ?? cleaningAssetImages[0];
}

export function getDefaultContentState(): CleaningContentState {
  return {
    services: defaultServices,
    uploadedGallery: [],
    hiddenAssetGalleryIds: [],
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
      ? value.uploadedGallery
          .filter((item): item is UploadedGalleryImage => Boolean(item && item.id && item.title && item.imageUrl))
          .map((item) => ({
            ...item,
            subtitle: typeof item.subtitle === "string" ? item.subtitle : ""
          }))
      : [],
    hiddenAssetGalleryIds: Array.isArray(value.hiddenAssetGalleryIds)
      ? value.hiddenAssetGalleryIds.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [],
    live: {
      url: value.live?.url || ""
    }
  };
}

export function getOwncastUrl(url: string) {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`);
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function getOwncastEmbedUrl(url: string) {
  const normalizedUrl = getOwncastUrl(url);
  return normalizedUrl ? `${normalizedUrl}/embed/video` : null;
}
