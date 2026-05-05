"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, GraduationCap, ScissorsLineDashed } from "lucide-react";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { MobilePeekCarousel } from "@/components/mobile-peek-carousel";
import { CourseDetailDialog } from "@/components/site/course-detail-dialog";
import { Button } from "@/components/ui/button";
import type { CourseOffer } from "@/lib/course-offers";
import { courseOffers, getCourseCheckoutHref } from "@/lib/course-offers";
import { brandImages } from "@/lib/data";

export function CoursesPageContent({ offers = courseOffers }: { offers?: CourseOffer[] }) {
  const feedbackVideos = [
    {
      id: "feedback-1",
      src: "/api/media/videos/feedback1.mp4"
    },
    {
      id: "feedback-2",
      src: "/api/media/videos/feedback2.mp4"
    },
    {
      id: "feedback-3",
      src: "/api/media/videos/feedback3.mp4"
    }
  ];

  return (
    <section className="section-shell section-space">
      <FadeIn className="overflow-hidden rounded-[2.8rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] shadow-luxury">
        <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-10 lg:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Cursuri</p>
            <h1 className="mt-6 max-w-5xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
              Programe premium construite pentru progres clar, nu pentru impresie generica.
            </h1>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
              <div className="min-w-0 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-2.5 sm:rounded-[1.5rem] sm:p-5">
                <p className="dashboard-label text-[9px] tracking-[0.18em] sm:text-[11px] sm:tracking-[0.32em]">Experienta</p>
                <p className="mt-2 text-[0.95rem] leading-5 text-white sm:mt-3 sm:text-2xl">10+ ani</p>
              </div>
              <div className="min-w-0 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-2.5 sm:rounded-[1.5rem] sm:p-5">
                <p className="dashboard-label text-[9px] tracking-[0.18em] sm:text-[11px] sm:tracking-[0.32em]">Cursanti</p>
                <p className="mt-2 text-[0.95rem] leading-5 text-white sm:mt-3 sm:text-2xl">300+</p>
              </div>
              <div className="min-w-0 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-2.5 sm:rounded-[1.5rem] sm:p-5">
                <p className="dashboard-label text-[9px] tracking-[0.18em] sm:text-[11px] sm:tracking-[0.32em]">Format</p>
                <p className="mt-2 text-[0.8rem] leading-5 text-white sm:mt-3 sm:text-2xl">Fizic + LIVE</p>
              </div>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
              <div className="min-w-0 rounded-[1.15rem] border border-white/10 bg-white/[0.025] px-2.5 py-3 text-[10px] leading-4 text-white/[0.66] sm:rounded-[1.35rem] sm:px-4 sm:py-4 sm:text-sm sm:leading-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#d6b98c]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                Baza corecta pentru cei care pornesc serios.
              </div>
              <div className="min-w-0 rounded-[1.15rem] border border-white/10 bg-white/[0.025] px-2.5 py-3 text-[10px] leading-4 text-white/[0.66] sm:rounded-[1.35rem] sm:px-4 sm:py-4 sm:text-sm sm:leading-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#d6b98c]">
                  <ScissorsLineDashed className="h-4 w-4" />
                </div>
                Corectii directe si progres rapid in 1 la 1.
              </div>
              <div className="min-w-0 rounded-[1.15rem] border border-white/10 bg-white/[0.025] px-2.5 py-3 text-[10px] leading-4 text-white/[0.66] sm:rounded-[1.35rem] sm:px-4 sm:py-4 sm:text-sm sm:leading-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#d6b98c]">
                  <Award className="h-4 w-4" />
                </div>
                Ritm real de salon si standard ridicat in executie.
              </div>
            </div>
          </div>

          <div className="relative min-h-[32rem]">
            <Image src={brandImages.aboutSecondary} alt="Virgil Agu courses" fill className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.25),rgba(0,0,0,0.72)),radial-gradient(circle_at_top,rgba(214,185,140,0.18),transparent_28%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <div className="grid max-w-sm gap-3">
                <div className="rounded-full bg-black/[0.38] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/60">
                  Trainer profile
                </div>
                <p className="text-3xl leading-tight text-white sm:text-4xl">
                  10+ ani experienta si peste 300 de cursanti formati.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <Stagger className="mx-auto mt-14 grid max-w-7xl gap-5 xl:grid-cols-3">
        {offers.map((course) => (
          <StaggerItem key={course.id}>
            <CourseDetailDialog course={course} ctaHref={getCourseCheckoutHref(course.id)} compact />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-14">
        <FadeIn className="mb-8 flex items-center justify-between gap-4">
          <span className="section-kicker">Feedback cursuri</span>
          <Button asChild variant="secondary" className="min-h-11">
            <Link href="/reviews">Vezi toate</Link>
          </Button>
        </FadeIn>

        <div className="hidden gap-6 lg:grid-cols-3 lg:grid">
          {feedbackVideos.map((item) => (
            <FadeIn
              key={item.id}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-panel transition duration-500 hover:-translate-y-1 hover:shadow-luxury"
            >
              <div className="relative overflow-hidden">
                <video
                  src={item.src}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-[4/5] w-full bg-black object-contain"
                />
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="lg:hidden">
          <MobilePeekCarousel
            ariaLabel="Feedback cursuri"
            items={feedbackVideos.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-panel"
              >
                <video
                  src={item.src}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-[4/5] w-full bg-black object-contain"
                />
              </div>
            ))}
          />
        </div>
      </div>
    </section>
  );
}


