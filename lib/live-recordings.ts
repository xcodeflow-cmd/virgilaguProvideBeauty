import path from "node:path";

function ensureExtension(extension: string) {
  const trimmed = extension.trim().toLowerCase();

  if (!trimmed) {
    return "webm";
  }

  return trimmed.startsWith(".") ? trimmed.slice(1) : trimmed;
}

export function getLiveRecordingExtension(mimeType?: string | null) {
  if (!mimeType) {
    return "webm";
  }

  if (mimeType.includes("mp4")) {
    return "mp4";
  }

  return "webm";
}

export function getLiveRecordingsDir() {
  const configuredDir = process.env.LIVE_RECORDINGS_DIR?.trim();

  if (configuredDir) {
    return configuredDir;
  }

  return path.join(process.cwd(), "storage", "live-recordings");
}

export function getLiveRecordingFilePath(liveId: string, extension: string) {
  return path.join(getLiveRecordingsDir(), `${liveId}.${ensureExtension(extension)}`);
}
