import { services } from "@/lib/data";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";

export function ServicesSection() {
  return (
    <section id="services" className="section-shell py-16 sm:py-24">
      <FadeIn>
        <SectionHeading
          eyebrow="Servicii"
          title="Servicii construite pentru rezultat curat si experienta premium."
          description="Meniu clar, executie precisa si prezentare moderna, fara imagini stock si fara elemente vizuale invechite."
        />
      </FadeIn>
      <Stagger className="mt-10 grid gap-6 lg:grid-cols-3">
        {services.map((service) => (
          <StaggerItem key={service.name}>
            <article className="glass-panel rounded-[1.75rem] p-7">
              <p className="text-sm uppercase tracking-[0.35em] text-accent/75">{service.price}</p>
              <h3 className="mt-4 text-3xl text-white">{service.name}</h3>
              <p className="mt-4 text-base leading-7 text-white/60">{service.description}</p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
