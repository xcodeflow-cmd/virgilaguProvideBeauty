import Link from "next/link";
import { Star } from "lucide-react";

import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { reviews, siteConfig } from "@/lib/data";

export default function ReviewsPage() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Reviews"
          title="46 review-uri afisate intr-o pagina dedicata."
          description="Pagina foloseste continut derivat din profilul MERO `provide-beauty` si ofera o cale directa spre sursa completa."
        />
      </FadeIn>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="glass-panel rounded-[1.75rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg text-white">{review.name}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-accent/80">{review.source}</span>
            </div>
            <div className="mt-4 flex gap-1 text-white">
              {Array.from({ length: review.rating }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-5 text-base leading-7 text-white/68">{review.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-10">
        <Button asChild>
          <Link href={siteConfig.socials.mero}>Vezi mai multe review-uri</Link>
        </Button>
      </div>
    </section>
  );
}
