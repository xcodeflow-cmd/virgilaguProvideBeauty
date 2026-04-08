"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SessionVisibility } from "@prisma/client";

import { auth } from "@/auth";
import { courses, subscriptionPlans } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { getVimeoEmbedUrl } from "@/lib/vimeo";

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
  const streamUrl = String(formData.get("streamUrl") || "").trim();
  const startMode = String(formData.get("startMode") || "NOW");
  const scheduledValue = String(formData.get("scheduledFor") || "").trim();
  const scheduledFor = startMode === "SCHEDULE" && scheduledValue ? new Date(scheduledValue) : new Date();

  if (!getVimeoEmbedUrl(streamUrl)) {
    throw new Error("Invalid Vimeo stream or embed link.");
  }

  if (Number.isNaN(scheduledFor.getTime())) {
    throw new Error("Invalid scheduled date.");
  }

  await prisma.liveSession.create({
    data: {
      title,
      slug:
        String(formData.get("slug") || "")
          .trim()
          .toLowerCase() || slugify(title),
      description: String(formData.get("description") || ""),
      scheduledFor,
      thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
      streamUrl,
      visibility: (String(formData.get("visibility") || "SUBSCRIBERS") as SessionVisibility),
      isLive: startMode !== "SCHEDULE",
      isFeatured: formData.get("isFeatured") === "on",
      price: formData.get("price") ? Number(formData.get("price")) : null
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function deleteLiveSession(formData: FormData) {
  await requireAdmin();

  await prisma.liveSession.delete({
    where: {
      id: String(formData.get("id") || "")
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
