function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function normalizeOwncastUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  try {
    const url = new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`);
    return trimTrailingSlash(url.toString());
  } catch {
    return null;
  }
}

export function getOwncastEmbedUrl(value?: string | null) {
  const baseUrl = normalizeOwncastUrl(value);
  return baseUrl ? `${baseUrl}/embed/video` : null;
}

export function getOwncastChatEmbedUrl(value?: string | null, mode: "readonly" | "readwrite" = "readwrite") {
  const baseUrl = normalizeOwncastUrl(value);
  return baseUrl ? `${baseUrl}/embed/chat/${mode}` : null;
}

export function getOwncastStatusUrl(value?: string | null) {
  const baseUrl = normalizeOwncastUrl(value);
  return baseUrl ? `${baseUrl}/api/status` : null;
}
