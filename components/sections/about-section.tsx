import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";

export function AboutSection() {
  return (
    <section id="about" className="section-shell py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <FadeIn className="space-y-6">
          <SectionHeading
            eyebrow="About"
            title="Crafted around image, detail, and modern presence."
            description="Inspired by high-end fashion presentation, the studio balances disciplined technique with a stronger digital identity than a traditional barber brand."
          />
          <p className="max-w-xl text-base leading-8 text-white/60">
            Every touchpoint is designed to feel premium: curated lighting, intentional
            pacing, sharp consultation, and live sessions that turn expertise into an
            exclusive member product.
          </p>
        </FadeIn>
        <FadeIn delay={0.12} className="grid gap-5 sm:grid-cols-2">
          {[
            ["Precision-first", "Clean fades, beard architecture, and camera-ready finishing."],
            ["Luxury rhythm", "Quiet, high-touch appointments with a more exclusive feel."],
            ["Content-native", "Live teaching and recordings built into the business model."],
            ["Brand-forward", "Aesthetic consistency across website, socials, and studio."],
          ].map(([title, copy]) => (
            <div key={title} className="glass-panel rounded-[1.5rem] p-6">
              <h3 className="text-2xl text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/58">{copy}</p>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
