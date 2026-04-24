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
const CARD_WIDTH = "78%";
const CARD_GAP = "0.875rem";

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
      <div className="relative overflow-hidden px-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${activeIndex} * (${CARD_WIDTH} + ${CARD_GAP})))`,
            transition: isTransitionEnabled ? "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
            columnGap: CARD_GAP
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopedItems.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="group relative shrink-0 overflow-hidden rounded-[1.55rem] border border-[#f0b35b]/16 bg-[radial-gradient(circle_at_top_right,rgba(240,179,91,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] px-4 pb-4 pt-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-[2px]"
              style={{ flexBasis: CARD_WIDTH }}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#d6b98c]/[0.08] blur-3xl" />
              <div className="absolute left-4 top-3 text-[2.6rem] font-display leading-none text-white/[0.045]">
                &ldquo;
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-white/[0.42]">Verified review</p>
                  <p className="mt-1.5 text-[1.05rem] leading-none text-white">{review.name}</p>
                </div>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[8px] uppercase tracking-[0.18em] text-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  {review.source}
                </span>
              </div>
              <div className="relative mt-3 flex gap-1 text-accent">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={`${review.id}-${index}-${starIndex}`} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="relative mt-3 text-[0.93rem] leading-6 text-white/[0.78]">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2.5">
          <button
            type="button"
            aria-label="Review anterior"
            onClick={goToPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f0b35b]/18 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Review urmator"
            onClick={goToNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f0b35b]/18 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
