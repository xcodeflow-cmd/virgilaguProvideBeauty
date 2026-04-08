import { FadeIn } from "@/components/motion-shell";
import { ReviewsList } from "@/components/reviews-list";
import { SectionHeading } from "@/components/section-heading";
import { reviews, siteConfig } from "@/lib/data";

export default function ReviewsPage() {
  return (
    <section className="section-shell section-space">
      <FadeIn>
        <SectionHeading
          eyebrow="Review-uri"
          title="Feedback real de la clienti care au vazut diferenta."
          description="O selectie mai aerisita, mai credibila si mai usor de parcurs, construita in jurul increderii si al consistentei."
          align="center"
        />
      </FadeIn>
      <div className="mx-auto mt-14 max-w-5xl">
        <ReviewsList items={reviews} moreHref={siteConfig.socials.mero} />
      </div>
    </section>
  );
}
