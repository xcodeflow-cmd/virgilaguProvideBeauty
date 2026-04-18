"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function MobilePeekCarousel({
  items,
  ariaLabel,
  className,
  itemClassName
}: {
  items: ReactNode[];
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const updateActiveIndex = () => {
      const scrollLeft = viewport.scrollLeft;
      let closestIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const distance = Math.abs(item.offsetLeft - scrollLeft - 16);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    updateActiveIndex();
    viewport.addEventListener("scroll", updateActiveIndex, { passive: true });

    return () => viewport.removeEventListener("scroll", updateActiveIndex);
  }, [items.length]);

  function scrollToIndex(index: number) {
    const viewport = viewportRef.current;
    const item = itemRefs.current[index];

    if (!viewport || !item) {
      return;
    }

    viewport.scrollTo({
      left: Math.max(0, item.offsetLeft - 16),
      behavior: "smooth"
    });
    setActiveIndex(index);
  }

  function goPrevious() {
    scrollToIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  }

  function goNext() {
    scrollToIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
      >
        {items.map((item, index) => (
          <div
            key={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className={cn("w-[calc(100%-3.5rem)] shrink-0 snap-start", itemClassName)}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition",
                index === activeIndex ? "w-6 bg-[#d6b98c]" : "w-2.5 bg-white/20"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Anterior"
            onClick={goPrevious}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Urmator"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
