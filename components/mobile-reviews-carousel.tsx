"use client";

import { useRef, useState, type TouchEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  text: string;
  source: string;
};

const SWIPE_THRESHOLD = 36;

export function MobileReviewsCarousel({
  items,
  moreHref
}: {
  items: ReviewItem[];
  moreHref: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  const activeReview = items[activeIndex];
  const nextReview = items[(activeIndex + 1) % items.length];

  const shiftReview = (nextDirection: 1 | -1) => {
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + items.length) % items.length);
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

    shiftReview(deltaX < 0 ? 1 : -1);
  };

  return (
    <div className="space-y-4 md:hidden">
      <div className="relative overflow-hidden rounded-[1.9rem]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="pointer-events-none absolute inset-y-0 right-[-18%] z-0 w-[42%] rounded-[1.5rem] border border-[#f0b35b]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-[0_22px_55px_rgba(0,0,0,0.18)]" />

        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={activeReview.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 44 : -44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -44 : 44 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mr-[16%] overflow-hidden rounded-[1.55rem] border border-[#f0b35b]/16 bg-[radial-gradient(circle_at_top_right,rgba(240,179,91,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] px-4 pb-4 pt-4 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-[2px]"
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#d6b98c]/[0.08] blur-3xl" />
            <div className="absolute left-4 top-3 text-[2.6rem] font-display leading-none text-white/[0.045]">&ldquo;</div>

            <div className="relative flex items-start justify-between gap-2.5">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-[0.22em] text-white/[0.42]">Verified review</p>
                <p className="mt-1.5 truncate pr-2 text-[0.98rem] leading-none text-white">{activeReview.name}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 text-[7px] uppercase tracking-[0.16em] text-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                {activeReview.source}
              </span>
            </div>

            <div className="relative mt-3 flex gap-1 text-accent">
              {Array.from({ length: activeReview.rating }).map((_, starIndex) => (
                <Star key={`${activeReview.id}-${starIndex}`} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>

            <p className="relative mt-3 text-[0.88rem] leading-5 text-white/[0.78]">&ldquo;{activeReview.text}&rdquo;</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={`${nextReview.id}-preview`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 26 : -26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -26 : 26 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-3 right-[-18%] z-0 w-[42%] overflow-hidden rounded-[1.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] px-3 py-3"
          >
            <div className="text-[8px] uppercase tracking-[0.18em] text-white/[0.35]">Next</div>
            <p className="mt-2 truncate text-sm text-white/[0.88]">{nextReview.name}</p>
            <div className="mt-2 flex gap-1 text-accent/85">
              {Array.from({ length: nextReview.rating }).map((_, starIndex) => (
                <Star key={`${nextReview.id}-preview-${starIndex}`} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <p className="mt-3 line-clamp-4 text-[0.76rem] leading-5 text-white/[0.46]">&ldquo;{nextReview.text}&rdquo;</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        <button
          type="button"
          aria-label="Review anterior"
          onClick={() => shiftReview(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f0b35b]/18 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <button
          type="button"
          aria-label="Review urmator"
          onClick={() => shiftReview(1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f0b35b]/18 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex justify-center">
        <Link
          href={moreHref}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants(), "min-w-[16rem] max-w-full whitespace-nowrap px-5 py-3.5 text-[0.95rem]")}
        >
          Vezi 3000+ pe MERO
          <ArrowUpRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    </div>
  );
}
