export function getVimeoVideoId(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/(?:event\/\d+\/)?(\d+)/,
    /vimeo\.com\/manage\/videos\/(\d+)/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function getVimeoEmbedUrl(value?: string | null) {
  const videoId = getVimeoVideoId(value);

  return videoId
    ? `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`
    : null;
}
