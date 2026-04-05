import Image from "next/image";

import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { aboutHighlights, brandImages } from "@/lib/data";

export function AboutSection() {
  return (
    <section id="about" className="section-shell py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <FadeIn className="space-y-6">
          <SectionHeading
            eyebrow="Despre"
            title="Experienta construita pe executie, disciplina si imagine coerenta."
            description="Virgil Agu combina lucrul din salon cu educatia profesionala, fara artificii vizuale inutile si fara promisiuni goale."
          />
          <p className="max-w-xl text-base leading-8 text-white/60">
            Platforma pune in acelasi loc serviciile de frizerie, cursurile pentru
            dezvoltare si sesiunile live dedicate celor care vor sa creasca real in meserie.
          </p>
          <div className="glass-panel grid gap-4 rounded-[1.75rem] p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Salon</p>
              <p className="mt-3 text-3xl text-white">Look curat</p>
            </div>
            <p className="text-sm leading-7 text-white/58">
              Toate imaginile din prezentare vin din asset-urile proiectului si pastreaza acelasi stil vizual cu galeria.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.12} className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="grid gap-5 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/10">
              <Image src={brandImages.aboutMain} alt="Virgil Agu in studio" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-white/10">
              <Image src={brandImages.aboutSecondary} alt="Virgil Agu portrait" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {aboutHighlights.map(([title, copy]) => (
              <div key={title} className="glass-panel rounded-[1.5rem] p-6">
                <h3 className="text-2xl text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{copy}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
