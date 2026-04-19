import { getManagedGalleryItems } from "@/lib/site-content";

const galleryImageOrder = [23, 24, 22, 21, 20, 19, 18, 17, 16, 9, 10, 11, 12, 13, 14, 15, 4, 5, 6];
const galleryVideoOrder = ["videoGalerie2.mp4", "videoGalerie3.mp4", "videoGalerie4.mp4", "videoGalerie.mp4"];
const whiteWorkVideoOrder = ["VopsitAlb1.mp4", "VopsitAlb2.mp4", "VopsitAlb3.mp4", "VopsitAlb4.mp4"];
const feedbackVideoOrder = ["feedback1.mp4", "feedback2.mp4", "feedback4.mp4", "feedback3.mp4", "feedback5.mp4", "feedback.mp4"];

function assetMediaUrl(kind: "gallery" | "videos" | "showcase", filename: string) {
  return `/api/media/${kind}/${encodeURIComponent(filename)}`;
}

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();
}

export async function getOrderedGalleryMedia() {
  const uploadedItems = (await getManagedGalleryItems()).filter((item) => {
    const isLegacySeed =
      ["Fast Fade Dublin", "Master Barber Romania", "Fade curat"].includes(item.title) ||
      item.imageUrl.includes("WhatsApp Image 2026-04-04");

    return !isLegacySeed;
  });

  const assetImages = galleryImageOrder.map((number) => ({
    id: `asset-gallery-${number}`,
    title: `Galerie ${number}`,
    category: "Galerie",
    imageUrl: assetMediaUrl("gallery", `galerie${number}.jpeg`)
  }));

  return {
    images: [...assetImages, ...uploadedItems],
    videos: galleryVideoOrder.map((filename, index) => ({
      id: `gallery-video-${index + 1}`,
      title: titleFromFilename(filename),
      category: "Video Galerie",
      src: assetMediaUrl("videos", filename)
    })),
    whiteWorkVideos: whiteWorkVideoOrder.map((filename, index) => ({
      id: `white-work-video-${index + 1}`,
      title: titleFromFilename(filename),
      category: "Lucru cu alb",
      src: assetMediaUrl("showcase", filename)
    }))
  };
}

export function getOrderedFeedbackVideos() {
  return feedbackVideoOrder.map((filename, index) => ({
    id: `feedback-video-${index + 1}`,
    title: titleFromFilename(filename),
    category: "Feedback cursuri",
    src: assetMediaUrl("videos", filename)
  }));
}
