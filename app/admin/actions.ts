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

function getScheduledValue(formData: FormData) {
  const scheduledFor = String(formData.get("scheduledFor") || "").trim();

  if (scheduledFor) {
    return scheduledFor;
  }

  const scheduleDate = String(formData.get("scheduleDate") || "").trim();
  const scheduleTime = String(formData.get("scheduleTime") || "").trim();

  if (!scheduleDate || !scheduleTime) {
    return "";
  }

  return `${scheduleDate}T${scheduleTime}`;
}

function parseLiveVisibility(formData: FormData) {
  const rawVisibility = String(formData.get("visibility") || SessionVisibility.PUBLIC).trim();

  return rawVisibility === SessionVisibility.ONE_TIME ? SessionVisibility.ONE_TIME : SessionVisibility.PUBLIC;
}

function getSafeLiveSchedule(startMode: string, scheduledValue: string) {
  if (startMode !== "SCHEDULE") {
    return new Date();
  }

  if (!scheduledValue) {
    throw new Error("Data si ora live-ului sunt obligatorii.");
  }

  const parsedDate = parseRomaniaDateTimeLocal(scheduledValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Data sau ora live-ului sunt invalide.");
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
  const scheduledValue = getScheduledValue(formData);
  const scheduledFor = getSafeLiveSchedule(startMode, scheduledValue);
  const price = parseOptionalPrice(formData.get("price"));
  const maxParticipants = parseOptionalPositiveInt(formData.get("maxParticipants"));
  const visibilityValue = parseLiveVisibility(formData);
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim() || (await extractUploadedImageDataUrl(formData.get("thumbnailFile"))) || "";

  if (!title) {
    throw new Error("Live title is required.");
  }

  if (!description) {
    throw new Error("Live description is required.");
  }

  if (visibilityValue === SessionVisibility.ONE_TIME && !price) {
    throw new Error("Live-ul one time trebuie sa aiba pret.");
  }

  const normalizedPrice = visibilityValue === SessionVisibility.ONE_TIME ? price : null;

  await prisma.liveSession.create({
    data: {
      title,
      slug: buildLiveSlug(title),
      description,
      scheduledFor,
      thumbnailUrl,
      streamUrl: null,
      recordingUrl: null,
      visibility: visibilityValue,
      isLive: false,
      isFeatured: false,
      hasStarted: false,
      price: normalizedPrice,
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
  const scheduledValue = getScheduledValue(formData);
  const price = parseOptionalPrice(formData.get("price"));
  const maxParticipants = parseOptionalPositiveInt(formData.get("maxParticipants"));
  const visibilityValue = parseLiveVisibility(formData);
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "").trim() || (await extractUploadedImageDataUrl(formData.get("thumbnailFile"))) || null;
  if (!id) {
    throw new Error("Missing live session id.");
  }

  const scheduledFor =
    mode === "RESET"
      ? new Date()
      : getSafeLiveSchedule("SCHEDULE", scheduledValue);

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  if (visibilityValue === SessionVisibility.ONE_TIME && !price) {
    throw new Error("Live-ul one time trebuie sa aiba pret.");
  }

  const normalizedPrice = visibilityValue === SessionVisibility.ONE_TIME ? price : null;

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
  const normalizedCompareAtPrice =
    visibilityValue === SessionVisibility.ONE_TIME && normalizedPrice
      ? compareAtPrice
      : null;

  await prisma.liveSession.update({
    where: { id },
    data: {
      title,
      description,
      scheduledFor,
      price: normalizedPrice,
      compareAtPrice: normalizedCompareAtPrice,
      visibility: visibilityValue,
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
  const currentCourses = (currentSettings?.courses as typeof courses | null) || courses;

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
      ...currentCourses.beginner,
      label: String(formData.get("beginner_label") || currentCourses.beginner.label || ""),
      title: String(formData.get("beginner_title") || courses.beginner.title),
      shortTitle: String(formData.get("beginner_short_title") || currentCourses.beginner.shortTitle || ""),
      note: String(formData.get("beginner_note") || currentCourses.beginner.note || ""),
      shortDescription: String(formData.get("beginner_short_description") || courses.beginner.shortDescription),
      dialogBody: String(formData.get("beginner_dialog_body") || courses.beginner.dialogBody),
      externalLinkLabel: String(formData.get("beginner_link_label") || courses.beginner.externalLinkLabel),
      externalLinkUrl: String(formData.get("beginner_link_url") || courses.beginner.externalLinkUrl),
      includeTitle: String(formData.get("beginner_include_title") || currentCourses.beginner.includeTitle || ""),
      learnTitle: String(formData.get("beginner_learn_title") || currentCourses.beginner.learnTitle || ""),
      purchaseLabel: String(formData.get("beginner_purchase_label") || currentCourses.beginner.purchaseLabel || ""),
      inquiryLabel: String(formData.get("beginner_inquiry_label") || currentCourses.beginner.inquiryLabel || ""),
      cardActionLabel: String(formData.get("beginner_card_action_label") || currentCourses.beginner.cardActionLabel || ""),
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
      ...currentCourses.advanced,
      label: String(formData.get("advanced_label") || currentCourses.advanced.label || ""),
      title: String(formData.get("advanced_title") || courses.advanced.title),
      shortTitle: String(formData.get("advanced_short_title") || currentCourses.advanced.shortTitle || ""),
      note: String(formData.get("advanced_note") || currentCourses.advanced.note || ""),
      shortDescription: String(formData.get("advanced_short_description") || courses.advanced.shortDescription),
      dialogBody: String(formData.get("advanced_dialog_body") || courses.advanced.dialogBody),
      includeTitle: String(formData.get("advanced_include_title") || currentCourses.advanced.includeTitle || ""),
      learnTitle: String(formData.get("advanced_learn_title") || currentCourses.advanced.learnTitle || ""),
      advantage: String(formData.get("advanced_advantage") || currentCourses.advanced.advantage || ""),
      purchaseLabel: String(formData.get("advanced_purchase_label") || currentCourses.advanced.purchaseLabel || ""),
      inquiryLabel: String(formData.get("advanced_inquiry_label") || currentCourses.advanced.inquiryLabel || ""),
      cardActionLabel: String(formData.get("advanced_card_action_label") || currentCourses.advanced.cardActionLabel || ""),
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
      ...currentCourses.liveExperience,
      label: String(formData.get("live_label") || currentCourses.liveExperience.label || ""),
      title: String(formData.get("live_title") || courses.liveExperience.title),
      shortTitle: String(formData.get("live_short_title") || currentCourses.liveExperience.shortTitle || ""),
      note: String(formData.get("live_note") || currentCourses.liveExperience.note || ""),
      shortDescription: String(formData.get("live_short_description") || courses.liveExperience.shortDescription),
      dialogBody: String(formData.get("live_dialog_body") || courses.liveExperience.dialogBody),
      includeTitle: String(formData.get("live_include_title") || currentCourses.liveExperience.includeTitle || ""),
      learnTitle: String(formData.get("live_learn_title") || currentCourses.liveExperience.learnTitle || ""),
      advantage: String(formData.get("live_advantage") || currentCourses.liveExperience.advantage || ""),
      purchaseLabel: String(formData.get("live_purchase_label") || currentCourses.liveExperience.purchaseLabel || ""),
      inquiryLabel: String(formData.get("live_inquiry_label") || currentCourses.liveExperience.inquiryLabel || ""),
      cardActionLabel: String(formData.get("live_card_action_label") || currentCourses.liveExperience.cardActionLabel || ""),
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

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses,
      pages: currentPages
    },
    create: {
      id: "main",
      subscriptionPlans: nextSubscriptionPlans,
      courses: nextCourses,
      pages: currentPages
    }
  });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/live");
  revalidatePath("/about");
  revalidatePath("/admin");
}
