"use client";

import { useEffect, useState } from "react";

import {
  contentStorageKey,
  getDefaultContentState,
  normalizeContentState,
  type CleaningContentState
} from "@/lib/cleaning-content";

export function readCleaningContent() {
  if (typeof window === "undefined") {
    return getDefaultContentState();
  }

  try {
    const raw = window.localStorage.getItem(contentStorageKey);
    return raw ? normalizeContentState(JSON.parse(raw)) : getDefaultContentState();
  } catch {
    return getDefaultContentState();
  }
}

export function useCleaningContent() {
  const [content, setContent] = useState<CleaningContentState>(getDefaultContentState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setContent(readCleaningContent());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(contentStorageKey, JSON.stringify(content));
  }, [content, isReady]);

  return { content, setContent, isReady };
}
