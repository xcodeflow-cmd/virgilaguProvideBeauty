"use client";

import Image from "next/image";
import { Award, GraduationCap, ScissorsLineDashed } from "lucide-react";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { CourseDetailDialog } from "@/components/site/course-detail-dialog";
import type { CourseOffer } from "@/lib/course-offers";
import { courseOffers, getCourseCheckoutHref } from "@/lib/course-offers";
import { brandImages } from "@/lib/data";

export function CoursesPageContent({ offers = courseOffers }: { offers?: CourseOffer[] }) {
  const feedbackVideos = [
    {
      id: "feedback-01",
      title: "Feedback curs",
      subtitle: "Video real din experienta cursantilor",
      category: "Feedback",
      src: "/videos/feedback-01.mp4"
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
            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Experienta</p>
                <p className="mt-3 text-2xl text-white">10+ ani</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Cursanti</p>
                <p className="mt-3 text-2xl text-white">300+</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="dashboard-label">Format</p>
                <p className="mt-3 text-2xl text-white">Fizic + LIVE</p>
              </div>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.025] px-4 py-4 text-sm text-white/[0.66]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#d6b98c]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                Baza corecta pentru cei care pornesc serios.
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.025] px-4 py-4 text-sm text-white/[0.66]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#d6b98c]">
                  <ScissorsLineDashed className="h-4 w-4" />
                </div>
                Corectii directe si progres rapid in 1 la 1.
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.025] px-4 py-4 text-sm text-white/[0.66]">
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
        <FadeIn className="mb-8">
          <span className="section-kicker">Feedback cursuri</span>
          <h2 className="mt-6 editorial-title">Video real, fara text suplimentar si fara cosmetizare.</h2>
        </FadeIn>

        <div className="grid auto-rows-[18rem] gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {feedbackVideos.map((item) => (
            <FadeIn
              key={item.id}
              className="group relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black text-left shadow-panel transition duration-500 hover:-translate-y-1.5 hover:shadow-luxury sm:col-span-2 sm:row-span-2"
            >
              <div className="relative h-full min-h-[18rem] overflow-hidden">
                <video
                  src={item.src}
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.72))]" />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7">
                <p className="text-[10px] uppercase tracking-[0.38em] text-accent/[0.85]">{item.category}</p>
                <h3 className="mt-2 max-w-[18rem] text-2xl leading-tight text-white sm:text-[2rem]">{item.title}</h3>
                <p className="mt-2 max-w-[20rem] text-sm text-white/70">{item.subtitle}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}


