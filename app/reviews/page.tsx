import { FadeIn } from "@/components/motion-shell";
import { ReviewsList } from "@/components/reviews-list";
import { reviews, siteConfig } from "@/lib/data";

export default function ReviewsPage() {
  return (
    <section className="section-shell section-space">
      <FadeIn className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Review-uri</p>
        <h1 className="mt-6 max-w-5xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
          Review-uri reale, fara artificii.
        </h1>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-6xl">
        <ReviewsList items={reviews} moreHref={siteConfig.socials.mero} />
      </div>
    </section>
  );
}
