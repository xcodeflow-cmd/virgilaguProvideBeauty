"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { Button } from "@/components/ui/button";

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  text: string;
  source: string;
};

export function ReviewsList({
  items,
  moreHref
}: {
  items: ReviewItem[];
  moreHref: string;
}) {
  const visibleItems = items.slice(0, 3);

  return (
    <>
      <Stagger className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr_0.92fr]">
        {visibleItems.map((review, index) => (
          <StaggerItem key={review.id}>
            <FadeIn
              delay={index * 0.04}
              className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(214,185,140,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.008))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 sm:p-8"
            >
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d6b98c]/[0.08] blur-3xl" />
              <div className="absolute left-7 top-7 text-[4.5rem] font-display leading-none text-white/[0.05] sm:text-[5.5rem]">
                “
              </div>
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.38em] text-white/[0.42]">Verified review</p>
                  <p className="mt-3 text-2xl text-white sm:text-3xl">{review.name}</p>
                </div>
                <span className="rounded-full bg-white/[0.045] px-4 py-2 text-[10px] uppercase tracking-[0.38em] text-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  {review.source}
                </span>
              </div>
              <div className="relative mt-6 flex gap-1 text-accent">
                {Array.from({ length: review.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="relative mt-8 max-w-2xl text-lg leading-8 text-white/[0.74] sm:text-[1.18rem]">
                &ldquo;{review.text}&rdquo;
              </p>
            </FadeIn>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-12 flex justify-center">
        <Button asChild className="min-w-[17rem] px-8 py-4 text-base">
          <Link href={moreHref} target="_blank" rel="noreferrer">
            Vezi 3000+ pe MERO
            <ArrowUpRight className="h-4.5 w-4.5" />
          </Link>
        </Button>
      </div>
    </>
  );
}


