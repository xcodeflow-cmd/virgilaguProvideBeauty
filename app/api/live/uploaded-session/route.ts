import fs from "node:fs/promises";

import { SessionVisibility } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/live-access";
import { getLiveRecordingExtension, getLiveRecordingFilePath, getLiveRecordingUrl, getLiveRecordingsDir } from "@/lib/live-recordings";
import { parseRomaniaDateTimeLocal } from "@/lib/romania-time";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildLiveSlug(title: string) {
  const base = slugify(title) || "uploaded-live";
  return `${base}-${Date.now().toString(36)}`;
}

function parseOptionalPrice(value: FormDataEntryValue | null) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return null;
  }

  const parsedValue = Math.round(Number(rawValue));

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    throw new Error("Pretul trebuie sa fie cel putin 1 RON.");
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
    throw new Error("Numarul de utilizatori trebuie sa fie pozitiv.");
  }

  return parsedValue;
}

function getScheduledFor(formData: FormData) {
  const scheduleDate = String(formData.get("scheduleDate") || "").trim();
  const scheduleTime = String(formData.get("scheduleTime") || "").trim();

  if (!scheduleDate || !scheduleTime) {
    return new Date();
  }

  const parsedDate = parseRomaniaDateTimeLocal(`${scheduleDate}T${scheduleTime}`);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Data sau ora clipului sunt invalide.");
  }

  return parsedDate;
}

function parseLiveVisibility(formData: FormData) {
  const rawVisibility = String(formData.get("visibility") || SessionVisibility.ONE_TIME).trim();

  return rawVisibility === SessionVisibility.PUBLIC ? SessionVisibility.PUBLIC : SessionVisibility.ONE_TIME;
}

async function extractUploadedImageDataUrl(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size <= 0) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();

  if ("error" in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  let createdLiveId = "";

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const video = formData.get("videoFile");
    const visibility = parseLiveVisibility(formData);
    const price = parseOptionalPrice(formData.get("price"));
    const maxParticipants = parseOptionalPositiveInt(formData.get("maxParticipants"));
    const scheduledFor = getScheduledFor(formData);
    const thumbnailUrl =
      String(formData.get("thumbnailUrl") || "").trim() ||
      (await extractUploadedImageDataUrl(formData.get("thumbnailFile"))) ||
      "";

    if (!title) {
      throw new Error("Titlul clipului este obligatoriu.");
    }

    if (!description) {
      throw new Error("Descrierea clipului este obligatorie.");
    }

    if (!(video instanceof File) || video.size <= 0) {
      throw new Error("Clipul video este obligatoriu.");
    }

    if (visibility === SessionVisibility.ONE_TIME && !price) {
      throw new Error("Clipul one time trebuie sa aiba pret.");
    }

    const recordingMimeType = video.type || "video/mp4";
    const recordingExtension = getLiveRecordingExtension(recordingMimeType);
    const liveSession = await prisma.liveSession.create({
      data: {
        title,
        slug: buildLiveSlug(title),
        description,
        scheduledFor,
        durationMinutes: 30,
        thumbnailUrl,
        streamUrl: null,
        recordingUrl: null,
        recordingMimeType,
        recordingData: null,
        price,
        compareAtPrice: null,
        maxParticipants,
        hasStarted: true,
        visibility,
        isLive: false,
        isFeatured: false
      },
      select: { id: true }
    });

    createdLiveId = liveSession.id;

    await fs.mkdir(getLiveRecordingsDir(), { recursive: true });
    await fs.writeFile(getLiveRecordingFilePath(liveSession.id, recordingExtension), Buffer.from(await video.arrayBuffer()));

    await prisma.liveSession.update({
      where: { id: liveSession.id },
      data: {
        recordingUrl: getLiveRecordingUrl(liveSession.id)
      }
    });

    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  } catch (error) {
    if (createdLiveId) {
      await prisma.liveSession.delete({ where: { id: createdLiveId } }).catch(() => undefined);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Clipul nu a putut fi incarcat." },
      { status: 400 }
    );
  }
}
