"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "lucide-react";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { CourseDetailDialog } from "@/components/site/course-detail-dialog";
import { Button } from "@/components/ui/button";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import { defaultServices } from "@/lib/cleaning-content";
import { courseOffers, getCourseCheckoutHref, palmaresDetails, palmaresHighlights } from "@/lib/course-offers";
import { brandImages, compactReviews } from "@/lib/data";

function PalmaresDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="premium-card grid content-start gap-5 rounded-[2rem] p-6 text-left sm:p-7">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Palmares</p>
          <p className="max-w-lg text-3xl leading-tight text-white sm:text-4xl">
            Rezultate reale din competitie, educatie si ani de executie constanta.
          </p>
          <div className="grid gap-3">
            {palmaresHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] px-5 py-4 text-sm uppercase tracking-[0.16em] text-white/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.82] backdrop-blur-[12px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.2rem] border border-white/10 bg-[#070707] p-6 shadow-[0_44px_140px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#d6b98c]">Palmares</p>
              <Dialog.Title className="mt-3 text-4xl leading-tight text-white sm:text-5xl">
                Rezultate care sustin standardul.
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-8 grid gap-4">
            {palmaresHighlights.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-white/[0.84]">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {palmaresDetails.map((item) => (
              <p key={item} className="border-l border-[#d6b98c]/20 pl-4 text-sm leading-7 text-white/[0.72]">
                {item}
              </p>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function HomepageContent() {
  const { content } = useCleaningContent();
  const services = content.services.length ? content.services : defaultServices;

  return (
    <>
      <section className="section-shell section-space pt-8 sm:pt-14 lg:pt-16">
        <FadeIn className="relative overflow-hidden rounded-[2.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005))] px-7 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12 lg:min-h-[46rem] lg:px-14 lg:py-16">
          <div className="absolute inset-y-0 right-0 hidden w-[43%] lg:block">
            <Image src={brandImages.hero} alt="Virgil Agu" fill priority className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,rgba(7,7,7,0.94)_26%,rgba(7,7,7,0.38)_62%,rgba(7,7,7,0.14)_100%)]" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.16),transparent_24%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.07),transparent_22%)]" />
          <div className="relative">
            <div className="max-w-[54rem]">
              <span className="section-kicker">Virgil Agu Education</span>
              <h1 className="mt-8 max-w-[48rem] text-[3.5rem] leading-[0.82] text-white sm:text-[4.6rem] lg:text-[5.8rem] xl:text-[6.2rem]">
                Locul unde frizeria inceteaza sa fie un job si devine arta.
              </h1>
              <p className="mt-7 max-w-xl text-xl leading-8 text-white/[0.72]">
                Aici incepe diferenta.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild className="px-7">
                  <Link href="/courses">
                    Vezi cursuri
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="px-7">
                  <Link href="/live">Vezi live</Link>
                </Button>
              </div>

              <div className="mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
                <div>
                  <p className="dashboard-label">Experienta</p>
                  <p className="mt-3 text-3xl text-white">10+ ani</p>
                </div>
                <div>
                  <p className="dashboard-label">Cursanti formati</p>
                  <p className="mt-3 text-3xl text-white">300+</p>
                </div>
                <div>
                  <p className="dashboard-label">Format</p>
                  <p className="mt-3 text-3xl text-white">Fizic + LIVE</p>
                </div>
              </div>
            </div>

            <div className="relative mt-10 min-h-[22rem] overflow-hidden rounded-[2.2rem] lg:hidden">
              <Image src={brandImages.hero} alt="Virgil Agu" fill priority className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.7))]" />
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="section-shell section-space pt-0">
        <FadeIn className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] px-6 py-8 shadow-[0_34px_110px_rgba(0,0,0,0.26)] sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-kicker">About Me</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch">
            <div className="relative min-h-[27rem] overflow-hidden rounded-[2rem]">
              <Image src={brandImages.aboutMain} alt="Virgil Agu trainer" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.68))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">Virgil Agu</p>
                <p className="mt-3 max-w-sm text-2xl leading-tight text-white sm:text-3xl">
                  Competitie, educatie si executie reala asezate corect in pagina.
                </p>
              </div>
            </div>
            <PalmaresDialog />
          </div>
        </FadeIn>
      </section>

      <section className="section-shell section-space pt-0">
        <FadeIn className="section-intro">
          <Link href="/courses" className="section-kicker">
            Cursuri
          </Link>
          <h2 className="mt-6 editorial-title">
            Trei directii clare catre transpunerea jobului in arta.
          </h2>
        </FadeIn>

        <Stagger className="mt-14 grid gap-5 xl:grid-cols-3">
          {courseOffers.map((course, index) => (
            <StaggerItem key={course.id}>
              <CourseDetailDialog
                course={course}
                ctaHref={getCourseCheckoutHref(course.id)}
                compact
                className={services[index] ? "" : "min-h-full"}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section-shell section-space pt-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <FadeIn className="section-intro">
            <span className="section-kicker">Review-uri</span>
            <h2 className="mt-6 editorial-title">Fara prea multa cosmetizare a realitatii.</h2>
            <p className="mt-6 editorial-copy">
              Review-urile de pe MERO pun realitatea in fata.
            </p>
          </FadeIn>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {compactReviews.map((review) => (
              <FadeIn
                key={review.id}
                className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.006))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:p-7"
              >
                <div className="flex gap-1 text-[#d6b98c]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span key={starIndex} className="text-sm">&#9733;</span>
                  ))}
                </div>
                <p className="mt-6 text-base leading-8 text-white/[0.76]">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-6">
                  <p className="text-base text-white">{review.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.32em] text-white/40">
                    {review.source}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


