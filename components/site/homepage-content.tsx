"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { PricingSection } from "@/components/pricing-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Button } from "@/components/ui/button";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import {
  defaultGalleryImages,
  defaultServices,
  getAssetImageById
} from "@/lib/cleaning-content";
import {
  aboutHighlights,
  brandImages,
  compactReviews,
  homepageStats
} from "@/lib/data";

export function HomepageContent() {
  const { content } = useCleaningContent();
  const services = content.services.length ? content.services : defaultServices;
  const galleryItems = [...defaultGalleryImages, ...content.uploadedGallery];
  const previewGallery = galleryItems.slice(0, 4);

  return (
    <>
      <section className="section-shell section-space pt-10 sm:pt-14 lg:pt-20">
        <FadeIn className="mx-auto max-w-4xl text-center">
          <span className="accent-chip">Premium Cleaning Services</span>
          <h1 className="mt-6 text-5xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            Clean spaces, premium presentation, zero clutter.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/66 sm:text-lg">
            Site-ul pastreaza tema actuala, dar cu layout mai echilibrat, servicii clare si galerie
            usor de administrat din browser.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/gallery">
                View gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/live">Live</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn className="mx-auto mt-12 max-w-6xl">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="premium-card flex h-full flex-col overflow-hidden">
              <div className="relative min-h-[320px] flex-1">
                <Image
                  src={brandImages.hero}
                  alt="Cleaning services hero"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.34em] text-accent/85">
                    Professional service
                  </p>
                  <p className="mt-2 text-2xl text-white sm:text-3xl">
                    Balanced layout, local assets and practical admin controls.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {services.slice(0, 2).map((service) => (
                <div key={service.id} className="premium-card flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={getAssetImageById(service.imageId).src}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.34em] text-accent/85">Service</p>
                      <h3 className="mt-2 text-2xl text-white">{service.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/60">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
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
              title="Aceeasi tema, dar cu layout mai curat si aliniat."
              description="Continutul ramane aerisit, cu aceleasi carduri si aceeasi identitate vizuala, fara zone dezechilibrate."
            />
          </FadeIn>
          <Stagger className="grid gap-5 sm:grid-cols-2">
            {aboutHighlights.map(([title, description]) => (
              <StaggerItem key={title}>
                <div className="premium-card flex h-full flex-col p-6">
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
            eyebrow="Services"
            title="Serviciile sunt afisate intr-un grid stabil, cu inaltimi egale."
            description="Cardurile folosesc aceeasi tema si spacing consistent, fara goluri ciudate pe desktop sau mobile."
          />
        </FadeIn>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="premium-card flex h-full flex-col overflow-hidden">
              <div className="relative aspect-[16/10]">
                <Image
                  src={getAssetImageById(service.imageId).src}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/58">{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell section-space">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn className="premium-card h-full p-8 sm:p-10">
            <SectionHeading
              eyebrow="Gallery Preview"
              title="Galeria ramane separata, dar acum include si upload-uri locale."
              description="Imaginile default din assets sunt combinate cu cele uploadate local, intr-un grid curat si consistent."
            />
            <Button asChild variant="secondary" className="mt-8">
              <Link href="/gallery">Open full gallery</Link>
            </Button>
          </FadeIn>
          <div>
            <GalleryGrid items={previewGallery} columns="preview" />
          </div>
        </div>
      </section>

      <section className="section-shell pb-8">
        <div className="premium-card flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Live Preview</p>
            <h3 className="mt-3 text-3xl text-white">YouTube live embed, salvat local din admin.</h3>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
              Pagina Live afiseaza automat stream-ul daca exista un URL valid. Altfel, arata un mesaj clar de indisponibilitate.
            </p>
          </div>
          <Button asChild>
            <Link href="/live">
              <Play className="h-4 w-4" />
              Open live page
            </Link>
          </Button>
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
