"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
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

function getImageExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const fromMime = file.type.split("/")[1]?.toLowerCase();
  return fromMime === "jpeg" ? "jpg" : fromMime || "jpg";
}

async function saveLiveThumbnail(fileEntry: FormDataEntryValue | null) {
  if (!(fileEntry instanceof File) || !fileEntry.size) {
    return null;
  }

  if (!fileEntry.type.startsWith("image/")) {
    throw new Error("Thumbnail must be an image.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "live-thumbnails");
  const extension = getImageExtension(fileEntry);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await fileEntry.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, bytes);

  return `/uploads/live-thumbnails/${fileName}`;
}

async function deleteManagedLiveThumbnail(thumbnailUrl: string | null | undefined) {
  if (!thumbnailUrl || !thumbnailUrl.startsWith("/uploads/live-thumbnails/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", thumbnailUrl.replace(/^\//, "").replace(/\//g, path.sep));

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing files during cleanup.
  }
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

  const title = String(formData.get("title") || "");
  const startMode = String(formData.get("startMode") || "NOW");
  const scheduledValue = String(formData.get("scheduledFor") || "").trim();
  const scheduledFor = startMode === "SCHEDULE" && scheduledValue ? parseRomaniaDateTimeLocal(scheduledValue) : new Date();
  const thumbnailUrl = await saveLiveThumbnail(formData.get("thumbnail"));

  if (Number.isNaN(scheduledFor.getTime())) {
    throw new Error("Invalid scheduled date.");
  }

  if (!thumbnailUrl) {
    throw new Error("Live thumbnail is required.");
  }

  await prisma.liveSession.create({
    data: {
      title,
      slug: buildLiveSlug(title),
      description: String(formData.get("description") || ""),
      scheduledFor,
      thumbnailUrl,
      streamUrl: null,
      recordingUrl: null,
      visibility: (String(formData.get("visibility") || "SUBSCRIBERS") as SessionVisibility),
      isLive: false,
      isFeatured: false,
      price: formData.get("price") ? Number(formData.get("price")) : null
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function deleteLiveSession(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const liveSession = await prisma.liveSession.findUnique({
    where: { id },
    select: { thumbnailUrl: true }
  });

  await prisma.liveSession.delete({
    where: {
      id
    }
  });

  await deleteManagedLiveThumbnail(liveSession?.thumbnailUrl);

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
  if (!id) {
    throw new Error("Missing live session id.");
  }

  const scheduledFor = mode === "RESET" ? new Date() : parseRomaniaDateTimeLocal(scheduledValue);
  const existingLive = await prisma.liveSession.findUnique({
    where: { id },
    select: { thumbnailUrl: true }
  });
  const nextThumbnailUrl = await saveLiveThumbnail(formData.get("thumbnail"));

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  if (Number.isNaN(scheduledFor.getTime())) {
    throw new Error("Invalid scheduled date.");
  }

  await prisma.liveSession.update({
    where: { id },
    data: {
      title,
      description,
      scheduledFor,
      ...(nextThumbnailUrl ? { thumbnailUrl: nextThumbnailUrl } : {})
    }
  });

  if (nextThumbnailUrl) {
    await deleteManagedLiveThumbnail(existingLive?.thumbnailUrl);
  }

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
