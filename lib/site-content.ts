import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";
import { courses, liveSessions, sitePages, subscriptionPlans } from "@/lib/data";

export type SubscriptionPlan = (typeof subscriptionPlans)[number];
export type CoursesContent = typeof courses;
export type PagesContent = typeof sitePages;
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

async function fetchSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "main" }
    });

    if (!settings) {
      return {
        subscriptionPlans,
        courses,
        pages: sitePages
      };
    }

    return {
      subscriptionPlans: settings.subscriptionPlans as SubscriptionPlan[],
      courses: settings.courses as CoursesContent,
      pages: (settings.pages as PagesContent | null) || sitePages
    };
  } catch {
    return {
      subscriptionPlans,
      courses,
      pages: sitePages
    };
  }
}

const getCachedSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings-main"], {
  revalidate: 15
});

export async function getSiteSettings() {
  return getCachedSiteSettings();
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
