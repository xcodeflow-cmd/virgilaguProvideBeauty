import Link from "next/link";
import Image from "next/image";

import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { aboutMeAchievements, aboutMeGallery } from "@/lib/data";

export function AboutMeSection() {
  return (
    <section className="section-shell py-16 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <FadeIn className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <SectionHeading
            eyebrow="About Me"
            title="Premii, scena si ani de executie reala."
            description="Un bloc scurt in homepage care arata partea personala: competitii, recunoastere si parcursul construit in industrie."
          />
          <div className="mt-8 grid gap-4">
            {aboutMeAchievements.map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-white/10 bg-black/20 px-5 py-4 text-white/72">
                {item}
              </div>
            ))}
          </div>
          <Button asChild className="mt-8">
            <Link href="/gallery">Vezi gallery</Link>
          </Button>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-3">
          {aboutMeGallery.map((item, index) => (
            <FadeIn
              key={item.id}
              delay={0.08 + index * 0.06}
              className="relative min-h-[20rem] overflow-hidden rounded-[1.75rem] border border-white/10"
            >
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs uppercase tracking-[0.34em] text-accent/85">{item.category}</p>
                <p className="mt-2 text-2xl text-white">{item.title}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
