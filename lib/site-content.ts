import { prisma } from "@/lib/prisma";
import { courses, liveSessions, subscriptionPlans } from "@/lib/data";

export type SubscriptionPlan = (typeof subscriptionPlans)[number];
export type CoursesContent = typeof courses;
export type GalleryContentItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
};
export type LiveSessionContent = {
  id: string;
  title: string;
  description: string;
  scheduledFor: Date;
  visibility: string;
  isLive: boolean;
  price: number | null;
};

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" }
    });

    if (!settings) {
      return {
        subscriptionPlans,
        courses
      };
    }

    return {
      subscriptionPlans: settings.subscriptionPlans as SubscriptionPlan[],
      courses: settings.courses as CoursesContent
    };
  } catch {
    return {
      subscriptionPlans,
      courses
    };
  }
}

export async function getManagedGalleryItems() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" }
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl
    }));
  } catch {
    return [];
  }
}

export async function getManagedLiveSessions() {
  try {
    const sessions = await prisma.liveSession.findMany({
      orderBy: [{ scheduledFor: "asc" }]
    });

    if (!sessions.length) {
      return liveSessions;
    }

    return sessions.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      scheduledFor: item.scheduledFor,
      visibility: item.visibility,
      isLive: item.isLive,
      price: item.price
    }));
  } catch {
    return liveSessions;
  }
}
