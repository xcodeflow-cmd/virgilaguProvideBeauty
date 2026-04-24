"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  text: string;
  source: string;
};

const SWIPE_THRESHOLD = 36;
const CARD_WIDTH = "64%";
const CARD_GAP = "0.75rem";

export function MobileReviewsCarousel({ items }: { items: ReviewItem[] }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const loopedItems = [items[items.length - 1], ...items, items[0]];

  useEffect(() => {
    if (isTransitionEnabled) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isTransitionEnabled]);

  const goToNext = () => {
    setIsTransitionEnabled(true);
    setActiveIndex((current) => current + 1);
  };

  const goToPrevious = () => {
    setIsTransitionEnabled(true);
    setActiveIndex((current) => current - 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      goToNext();
      return;
    }

    goToPrevious();
  };

  const handleTransitionEnd = () => {
    if (activeIndex === 0) {
      setIsTransitionEnabled(false);
      setActiveIndex(items.length);
      return;
    }

    if (activeIndex === items.length + 1) {
      setIsTransitionEnabled(false);
      setActiveIndex(1);
    }
  };

  return (
    <div className="md:hidden">
      <div className="relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          className="flex gap-3 px-1"
          style={{
            transform: `translateX(calc(-${activeIndex} * (${CARD_WIDTH} + ${CARD_GAP})))`,
            transition: isTransitionEnabled ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)" : "none"
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopedItems.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="group relative min-h-[19rem] shrink-0 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(214,185,140,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.008))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)]"
              style={{ flexBasis: CARD_WIDTH }}
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d6b98c]/[0.08] blur-3xl" />
              <div className="absolute left-5 top-5 text-[3.2rem] font-display leading-none text-white/[0.05]">
                &ldquo;
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/[0.42]">Verified review</p>
                  <p className="mt-2 text-xl text-white">{review.name}</p>
                </div>
                <span className="rounded-full bg-white/[0.045] px-3 py-1.5 text-[9px] uppercase tracking-[0.22em] text-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  {review.source}
                </span>
              </div>
              <div className="relative mt-4 flex gap-1 text-accent">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={`${review.id}-${index}-${starIndex}`} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="relative mt-5 text-[0.98rem] leading-7 text-white/[0.74]">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Review anterior"
            onClick={goToPrevious}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Review urmator"
            onClick={goToNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
