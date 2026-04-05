import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { PricingSection } from "@/components/pricing-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import {
  aboutHighlights,
  brandImages,
  compactReviews,
  homeGalleryPreview,
  homepageStats
} from "@/lib/data";
import { getManagedLiveSessions } from "@/lib/site-content";

export default async function HomePage() {
  const liveSessions = await getManagedLiveSessions();
  const featuredSessions = liveSessions.slice(0, 2);

  return (
    <>
      <section className="section-shell section-space pt-10 sm:pt-14 lg:pt-20">
        <FadeIn className="mx-auto max-w-4xl text-center">
          <span className="accent-chip">Premium Barber Education</span>
          <h1 className="mt-6 text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            Live education, premium visuals, zero clutter.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
            Platforma construita pentru abonamente, sesiuni live si cursuri de barbering,
            intr-un layout curat, dark si usor de parcurs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/live">
                Explore live
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/gallery">View gallery</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn className="mx-auto mt-12 max-w-6xl">
          <div className="premium-card overflow-hidden">
            <div className="relative aspect-[16/9]">
              <Image
                src={brandImages.hero}
                alt="Premium barber education"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-accent/85">
                    Membership based access
                  </p>
                  <p className="mt-2 text-2xl text-white sm:text-3xl">
                    Live sessions for barbers who want real process.
                  </p>
                </div>
                <Button asChild variant="secondary" className="bg-black/45 backdrop-blur-md">
                  <Link href="/live">
                    <Play className="h-4 w-4" />
                    Go to live
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        <Stagger className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {homepageStats.map(([value, label]) => (
            <StaggerItem key={label}>
              <div className="premium-card px-4 py-5 text-center">
                <p className="text-2xl font-semibold text-white">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-white/42">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section-shell section-space">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <FadeIn>
            <SectionHeading
              eyebrow="About"
              title="Totul e gandit sa sustina educatia live, nu sa concureze cu ea."
              description="Layout calm, accent discret, imagini locale si o structura care lasa continutul sa respire."
            />
          </FadeIn>
          <Stagger className="grid gap-5 sm:grid-cols-2">
            {aboutHighlights.map(([title, description]) => (
              <StaggerItem key={title}>
                <div className="premium-card h-full p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-2xl text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64 sm:text-base">
                    {description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-shell section-space">
        <FadeIn>
          <SectionHeading
            eyebrow="Live"
            title="Sesiunile live raman o parte centrala a landing page-ului."
            description="Acces pe baza de abonament, preview clar si CTA direct catre pagina dedicata."
          />
        </FadeIn>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredSessions.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link href="/live">See all live sessions</Link>
          </Button>
        </div>
      </section>

      <section className="section-shell section-space">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="premium-card p-8 sm:p-10">
            <SectionHeading
              eyebrow="Gallery Preview"
              title="Galeria ramane separata, dar nu dispare din landing."
              description="Preview scurt, spacing curat si imagini doar din assets, fara sa incarce inutil pagina principala."
            />
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/gallery">Open full gallery</Link>
            </Button>
          </FadeIn>
          <div>
            <GalleryGrid items={homeGalleryPreview} columns="preview" />
          </div>
        </div>
      </section>

      <TestimonialsSection
        items={compactReviews.map((item) => ({
          id: item.id,
          clientName: item.name,
          role: item.source,
          quote: item.text,
          rating: item.rating
        }))}
      />

      <PricingSection />
    </>
  );
}
