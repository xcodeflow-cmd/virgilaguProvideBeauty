"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const OVERLAY_TEXT =
  "Felicitari ca ai ales schimbarea, progresul \u00eencepe c\u00e2nd nu te mai mul\u021bume\u0219ti cu pu\u021bin.";
const TYPE_INTERVAL_MS = 34;
const AUTO_CLOSE_DELAY_MS = 1520;
const FADE_DURATION_MS = 400;

type HeroOverlayEffectProps = {
  active: boolean;
  runId: number;
  onClose: () => void;
};

export function HeroOverlayEffect({ active, runId, onClose }: HeroOverlayEffectProps) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(false);
  const [typedText, setTypedText] = useState("");
  const closeTimeoutRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      const timeout = window.setTimeout(() => {
        setMounted(false);
        setTypedText("");
      }, FADE_DURATION_MS);

      return () => window.clearTimeout(timeout);
    }

    setMounted(true);
    setTypedText("");

    const frame = window.requestAnimationFrame(() => setVisible(true));
    let index = 0;

    const typeNext = () => {
      index += 1;
      setTypedText(OVERLAY_TEXT.slice(0, index));

      if (index < OVERLAY_TEXT.length) {
        typingTimeoutRef.current = window.setTimeout(typeNext, TYPE_INTERVAL_MS);
        return;
      }

      closeTimeoutRef.current = window.setTimeout(() => {
        onClose();
      }, AUTO_CLOSE_DELAY_MS);
    };

    typingTimeoutRef.current = window.setTimeout(typeNext, TYPE_INTERVAL_MS);

    return () => {
      window.cancelAnimationFrame(frame);

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [active, onClose, runId]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-6 transition-all duration-400 ease-out supports-[backdrop-filter]:backdrop-blur-[12px] ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Inchide overlay"
        onClick={onClose}
        className="absolute right-5 top-24 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-white/76 transition hover:scale-[1.04] hover:bg-white/14 hover:text-white sm:right-7 sm:top-28"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className={`mx-auto max-w-5xl text-center transition-all duration-400 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        }`}
      >
        <p className="font-display text-[2.25rem] font-bold leading-[1.04] tracking-[-0.03em] text-[#f5f5f5] sm:text-[3rem] lg:text-[3.8rem]">
          {typedText}
          <span className="ml-1 inline-block h-[0.95em] w-[2px] translate-y-[0.12em] bg-[#f5f5f5]/75 align-top animate-pulse" />
        </p>
      </div>
    </div>
  );
}
