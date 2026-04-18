"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SessionVisibility } from "@prisma/client";

import { auth } from "@/auth";
import { courses, sitePages, subscriptionPlans } from "@/lib/data";
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

function parseOptionalPrice(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return null;
  }

  const parsedValue = Math.round(Number(rawValue));

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    throw new Error("Live price must be at least 1 RON when provided.");
  }

  return parsedValue;
}

function parseOptionalPositiveInt(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return null;
  }

  const parsedValue = Math.round(Number(rawValue));

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    throw new Error("Value must be a positive number.");
  }

  return parsedValue;
}

async function extractUploadedImageDataUrl(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size <= 0) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
}

export async function addGalleryItem(formData: FormData) {
  await requireAdmin();

  const file = formData.get("imageFile");
  let imageUrl = String(formData.get("imageUrl") || "").trim();

  if (!imageUrl) {
    imageUrl = (await extractUploadedImageDataUrl(file)) || "";
  }

  if (!imageUrl) {
    throw new Error("Gallery image is required.");
  }
 
  await prisma.galleryItem.create({
    data: {
      title: String(formData.get("title") || "").trim() || "Galerie upload",
      category: String(formData.get("category") || "").trim() || "Galerie",
      imageUrl,
      featured: formData.get("featured") === "on"
    }
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/reviews");
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
  revalidatePath("/reviews");
  revalidatePath("/admin");
}

export async function addLiveSession(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startMode = String(formData.get("startMode") || "NOW");
  const scheduledValue = String(formData.get("scheduledFor") || "").trim();
  const scheduledFor = getSafeLiveSchedule(startMode, scheduledValue, new Date(Date.now() + 1000 * 60 * 60 * 2));
  const price = parseOptionalPrice(formData.get("price"));
  const maxParticipants = parseOptionalPositiveInt(formData.get("maxParticipants"));
  const visibilityValue = String(formData.get("visibility") || (price ? SessionVisibility.ONE_TIME : SessionVisibility.PUBLIC));

  if (!title) {
    throw new Error("Live title is required.");
  }

  if (!description) {
    throw new Error("Live description is required.");
  }

  if (!Object.values(SessionVisibility).includes(visibilityValue as SessionVisibility)) {
    throw new Error("Invalid live visibility.");
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
      visibility: visibilityValue as SessionVisibility,
      isLive: false,
      isFeatured: false,
      hasStarted: false,
      price,
      compareAtPrice: null,
      maxParticipants
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
  const price = parseOptionalPrice(formData.get("price"));
  const maxParticipants = parseOptionalPositiveInt(formData.get("maxParticipants"));
  const visibilityValue = String(formData.get("visibility") || SessionVisibility.ONE_TIME);
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim() || (await extractUploadedImageDataUrl(formData.get("thumbnailFile"))) || null;
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
  const compareAtPrice = price && previousReferencePrice > price ? previousReferencePrice : null;

  await prisma.liveSession.update({
    where: { id },
    data: {
      title,
      description,
      scheduledFor,
      price,
      compareAtPrice,
      visibility: visibilityValue as SessionVisibility,
      maxParticipants,
      ...(thumbnailUrl ? { thumbnailUrl } : {})
    }
  });

  revalidatePath("/");
  revalidatePath("/live");
  revalidatePath("/admin");
}

export async function updateCoursePricing(formData: FormData) {
  await requireAdmin();

  const currentSettings = await prisma.siteSettings.findUnique({
    where: { id: "main" }
  });

  const currentCourses = (currentSettings?.courses as typeof courses | null) || courses;
  const nextBeginnerPrice = Math.round(Number(formData.get("beginner_price") || 0));
  const nextAdvancedPrice = Math.round(Number(formData.get("advanced_price") || 0));
  const nextLiveExperiencePrice = Math.round(Number(formData.get("live_experience_price") || 0));

  if (!nextBeginnerPrice || !nextAdvancedPrice || !nextLiveExperiencePrice) {
    throw new Error("All course prices are required.");
  }

  const nextCourses = {
    ...currentCourses,
    beginner: {
      ...currentCourses.beginner,
      pricing: {
        priceValue: nextBeginnerPrice,
        compareAtPriceValue:
          Math.max(
            currentCourses.beginner.pricing?.priceValue || 0,
            currentCourses.beginner.pricing?.compareAtPriceValue || 0
          ) > nextBeginnerPrice
            ? Math.max(
                currentCourses.beginner.pricing?.priceValue || 0,
                currentCourses.beginner.pricing?.compareAtPriceValue || 0
              )
            : null
      }
    },
    advanced: {
      ...currentCourses.advanced,
      pricing: {
        priceValue: nextAdvancedPrice,
        compareAtPriceValue:
          Math.max(
            currentCourses.advanced.pricing?.priceValue || 0,
            currentCourses.advanced.pricing?.compareAtPriceValue || 0
          ) > nextAdvancedPrice
            ? Math.max(
                currentCourses.advanced.pricing?.priceValue || 0,
                currentCourses.advanced.pricing?.compareAtPriceValue || 0
              )
            : null
      }
    },
    liveExperience: {
      ...currentCourses.liveExperience,
      pricing: {
        priceValue: nextLiveExperiencePrice,
        compareAtPriceValue:
          Math.max(
            currentCourses.liveExperience.pricing?.priceValue || 0,
            currentCourses.liveExperience.pricing?.compareAtPriceValue || 0
          ) > nextLiveExperiencePrice
            ? Math.max(
                currentCourses.liveExperience.pricing?.priceValue || 0,
                currentCourses.liveExperience.pricing?.compareAtPriceValue || 0
              )
            : null
      }
    }
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      courses: nextCourses,
      subscriptionPlans: (currentSettings?.subscriptionPlans as typeof subscriptionPlans | null) || subscriptionPlans,
      pages: (currentSettings?.pages as typeof sitePages | null) || sitePages
    },
    create: {
      id: "main",
      courses: nextCourses,
      subscriptionPlans,
      pages: sitePages
    }
  });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/checkout");
  revalidatePath("/admin");
}

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const currentSettings = await prisma.siteSettings.findUnique({
    where: { id: "main" }
  });

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
      shortDescription: String(formData.get("beginner_short_description") || courses.beginner.shortDescription),
      dialogBody: String(formData.get("beginner_dialog_body") || courses.beginner.dialogBody),
      externalLinkLabel: String(formData.get("beginner_link_label") || courses.beginner.externalLinkLabel),
      externalLinkUrl: String(formData.get("beginner_link_url") || courses.beginner.externalLinkUrl),
      imageUrl:
        String(formData.get("beginner_image_url") || "").trim() ||
        (await extractUploadedImageDataUrl(formData.get("beginner_image_file"))) ||
        String((currentSettings?.courses as typeof courses | null)?.beginner?.imageUrl || ""),
      description: parseLines(formData.get("beginner_description")),
      achievements: parseLines(formData.get("beginner_achievements")),
      details: parseLines(formData.get("beginner_details")),
      pricing: (currentSettings?.courses as typeof courses | null)?.beginner?.pricing || courses.beginner.pricing
    },
    advanced: {
      title: String(formData.get("advanced_title") || courses.advanced.title),
      shortDescription: String(formData.get("advanced_short_description") || courses.advanced.shortDescription),
      dialogBody: String(formData.get("advanced_dialog_body") || courses.advanced.dialogBody),
      imageUrl:
        String(formData.get("advanced_image_url") || "").trim() ||
        (await extractUploadedImageDataUrl(formData.get("advanced_image_file"))) ||
        String((currentSettings?.courses as typeof courses | null)?.advanced?.imageUrl || ""),
      description: String(formData.get("advanced_description") || courses.advanced.description),
      includes: parseLines(formData.get("advanced_includes")),
      outcomes: parseLines(formData.get("advanced_outcomes")),
      pricing: (currentSettings?.courses as typeof courses | null)?.advanced?.pricing || courses.advanced.pricing
    },
    liveExperience: {
      title: String(formData.get("live_title") || courses.liveExperience.title),
      shortDescription: String(formData.get("live_short_description") || courses.liveExperience.shortDescription),
      dialogBody: String(formData.get("live_dialog_body") || courses.liveExperience.dialogBody),
      imageUrl:
        String(formData.get("live_image_url") || "").trim() ||
        (await extractUploadedImageDataUrl(formData.get("live_image_file"))) ||
        String((currentSettings?.courses as typeof courses | null)?.liveExperience?.imageUrl || ""),
      description: String(formData.get("live_description") || courses.liveExperience.description),
      includes: parseLines(formData.get("live_includes")),
      outcomes: parseLines(formData.get("live_outcomes")),
      details: parseLines(formData.get("live_details")),
      pricing: (currentSettings?.courses as typeof courses | null)?.liveExperience?.pricing || courses.liveExperience.pricing
    }
  };

  const currentPages = (currentSettings?.pages as typeof sitePages | null) || sitePages;
  const nextAboutImages = [
    String(formData.get("about_image_url_1") || "").trim() || (await extractUploadedImageDataUrl(formData.get("about_image_file_1"))) || currentPages.about.images[0] || "",
    String(formData.get("about_image_url_2") || "").trim() || (await extractUploadedImageDataUrl(formData.get("about_image_file_2"))) || currentPages.about.images[1] || "",
    String(formData.get("about_image_url_3") || "").trim() || (await extractUploadedImageDataUrl(formData.get("about_image_file_3"))) || currentPages.about.images[2] || "",
    String(formData.get("about_image_url_4") || "").trim() || (await extractUploadedImageDataUrl(formData.get("about_image_file_4"))) || currentPages.about.images[3] || ""
  ].filter(Boolean);

  const nextPages = {
    about: {
      title: String(formData.get("about_title") || currentPages.about.title),
      intro: String(formData.get("about_intro") || currentPages.about.intro),
      body: parseLines(formData.get("about_body")),
      images: nextAboutImages
    }
  };

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses,
      pages: nextPages
    },
    create: {
      id: "main",
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses,
      pages: nextPages
    }
  });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/live");
  revalidatePath("/about");
  revalidatePath("/admin");
}
