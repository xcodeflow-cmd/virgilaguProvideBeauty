"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SessionVisibility } from "@prisma/client";

import { auth } from "@/auth";
import { courses, subscriptionPlans } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { parseRomaniaDateTimeLocal } from "@/lib/romania-time";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}

function parseLines(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildLiveSlug(title: string) {
  const base = slugify(title) || "live-session";
  return `${base}-${Date.now().toString(36)}`;
}

function getSafeLiveSchedule(startMode: string, scheduledValue: string, fallbackDate: Date) {
  if (startMode !== "SCHEDULE") {
    return new Date();
  }

  const parsedDate = scheduledValue ? parseRomaniaDateTimeLocal(scheduledValue) : new Date(Number.NaN);

  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackDate;
  }

  return parsedDate;
}

export async function addGalleryItem(formData: FormData) {
  await requireAdmin();

  await prisma.galleryItem.create({
    data: {
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      featured: formData.get("featured") === "on"
    }
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function deleteGalleryItem(formData: FormData) {
  await requireAdmin();

  await prisma.galleryItem.delete({
    where: {
      id: String(formData.get("id") || "")
    }
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function addLiveSession(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startMode = String(formData.get("startMode") || "NOW");
  const scheduledValue = String(formData.get("scheduledFor") || "").trim();
  const scheduledFor = getSafeLiveSchedule(startMode, scheduledValue, new Date(Date.now() + 1000 * 60 * 60 * 2));
  const price = Math.round(Number(formData.get("price") || 0));

  if (!price || price < 1) {
    throw new Error("Live price is required.");
  }

  if (!title) {
    throw new Error("Live title is required.");
  }

  if (!description) {
    throw new Error("Live description is required.");
  }

  await prisma.liveSession.create({
    data: {
      title,
      slug: buildLiveSlug(title),
      description,
      scheduledFor,
      thumbnailUrl: "/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg",
      streamUrl: null,
      recordingUrl: null,
      visibility: SessionVisibility.ONE_TIME,
      isLive: false,
      isFeatured: false,
      price,
      compareAtPrice: null
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function deleteLiveSession(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");

  await prisma.liveSession.delete({
    where: {
      id
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function updateLiveSessionSchedule(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const mode = String(formData.get("mode") || "UPDATE");
  const scheduledValue = String(formData.get("scheduledFor") || "").trim();
  const price = Math.round(Number(formData.get("price") || 0));
  const visibilityValue = String(formData.get("visibility") || SessionVisibility.ONE_TIME);
  if (!id) {
    throw new Error("Missing live session id.");
  }

  const scheduledFor =
    mode === "RESET"
      ? new Date()
      : getSafeLiveSchedule("SCHEDULE", scheduledValue, new Date(Date.now() + 1000 * 60 * 60 * 2));

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  if (!price || price < 1) {
    throw new Error("Live price is required.");
  }

  if (!Object.values(SessionVisibility).includes(visibilityValue as SessionVisibility)) {
    throw new Error("Invalid live visibility.");
  }

  const existingSession = await prisma.liveSession.findUnique({
    where: { id },
    select: {
      price: true,
      compareAtPrice: true
    }
  });

  if (!existingSession) {
    throw new Error("Live session not found.");
  }

  const previousReferencePrice = Math.max(
    existingSession.price || 0,
    existingSession.compareAtPrice || 0
  );
  const compareAtPrice = previousReferencePrice > price ? previousReferencePrice : null;

  await prisma.liveSession.update({
    where: { id },
    data: {
      title,
      description,
      scheduledFor,
      price,
      compareAtPrice,
      visibility: visibilityValue as SessionVisibility
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const nextSubscriptionPlans = [
    {
      name: String(formData.get("sub_name_1") || subscriptionPlans[0].name),
      price: String(formData.get("sub_price_1") || subscriptionPlans[0].price),
      description: String(formData.get("sub_description_1") || subscriptionPlans[0].description),
      features: parseLines(formData.get("sub_features_1"))
    },
    {
      name: String(formData.get("sub_name_2") || subscriptionPlans[1].name),
      price: String(formData.get("sub_price_2") || subscriptionPlans[1].price),
      description: String(formData.get("sub_description_2") || subscriptionPlans[1].description),
      features: parseLines(formData.get("sub_features_2"))
    }
  ];

  const nextCourses = {
    beginner: {
      title: String(formData.get("beginner_title") || courses.beginner.title),
      description: parseLines(formData.get("beginner_description")),
      achievements: parseLines(formData.get("beginner_achievements")),
      details: parseLines(formData.get("beginner_details"))
    },
    advanced: {
      title: String(formData.get("advanced_title") || courses.advanced.title),
      description: String(formData.get("advanced_description") || courses.advanced.description),
      includes: parseLines(formData.get("advanced_includes")),
      outcomes: parseLines(formData.get("advanced_outcomes"))
    },
    liveExperience: {
      title: String(formData.get("live_title") || courses.liveExperience.title),
      description: String(formData.get("live_description") || courses.liveExperience.description),
      includes: parseLines(formData.get("live_includes")),
      outcomes: parseLines(formData.get("live_outcomes")),
      details: parseLines(formData.get("live_details"))
    }
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses
    },
    create: {
      id: "main",
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses
    }
  });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/live");
  revalidatePath("/admin");
}
