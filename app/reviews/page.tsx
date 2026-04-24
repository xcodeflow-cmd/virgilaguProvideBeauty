import { FadeIn } from "@/components/motion-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { VideoGalleryGrid } from "@/components/video-gallery-grid";
import { reviews, siteConfig } from "@/lib/data";
import { getOrderedFeedbackVideos } from "@/lib/media-library";
import { MobileReviewsCarousel } from "@/components/mobile-reviews-carousel";

export default function ReviewsPage() {
  const videos = getOrderedFeedbackVideos();
  const visibleReviews = reviews.slice(0, 3);

  return (
    <section className="section-shell section-space">
      <FadeIn className="max-w-5xl">
        <p className="text-xs uppercase tracking-[0.42em] text-[#f0b35b]">Feedback cursuri</p>
        <h1 className="mt-6 max-w-6xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
          Fara prea multa cosmetizare a realitatii.
        </h1>
        <p className="mt-6 max-w-4xl text-base leading-8 text-white/[0.68] sm:text-lg">
          Parerile cursantilor si review-urile de pe MERO pun realitatea in fata.
        </p>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-[92rem] space-y-10">
        <div className="overflow-hidden rounded-[2.6rem] border border-[#f0b35b]/18 bg-[radial-gradient(circle_at_top_left,rgba(240,179,91,0.16),transparent_26%),linear-gradient(180deg,#120d06,#070707)] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.34)] sm:p-10">
          <div className="grid gap-8">
            <MobileReviewsCarousel items={visibleReviews} moreHref={siteConfig.socials.mero} />
            <div className="hidden gap-5 md:grid md:grid-cols-3 xl:grid-cols-[1.08fr_0.92fr_0.92fr]">
              {visibleReviews.map((review) => (
                <div
                  key={review.id}
                  className="group relative h-full overflow-hidden rounded-[1.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(214,185,140,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.008))] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 sm:rounded-[2rem] sm:p-8"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d6b98c]/[0.08] blur-3xl" />
                  <div className="absolute left-3 top-3 text-[2.4rem] font-display leading-none text-white/[0.05] sm:left-7 sm:top-7 sm:text-[5.5rem]">
                    &ldquo;
                  </div>
                  <div className="relative flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.22em] text-white/[0.42] sm:text-[11px] sm:tracking-[0.38em]">Verified review</p>
                      <p className="mt-2 text-sm text-white sm:mt-3 sm:text-3xl">{review.name}</p>
                    </div>
                    <span className="rounded-full bg-white/[0.045] px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-accent/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.38em]">
                      {review.source}
                    </span>
                  </div>
                  <div className="relative mt-3 flex gap-1 text-accent sm:mt-6">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <Star key={`${review.id}-${starIndex}`} className="h-3 w-3 fill-current sm:h-4 sm:w-4" />
                    ))}
                  </div>
                  <p className="relative mt-3 max-w-2xl text-[11px] leading-5 text-white/[0.74] sm:mt-8 sm:text-[1.18rem] sm:leading-8">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden justify-center md:flex">
              <Button asChild className="md:min-w-[17rem] md:px-8 py-4 text-base">
                <Link href={siteConfig.socials.mero} target="_blank" rel="noreferrer">
                  Vezi 3000+ pe MERO
                  <ArrowUpRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <VideoGalleryGrid items={videos} accent="feedback" hideMeta />
      </div>
    </section>
  );
}
