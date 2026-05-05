"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, GraduationCap, Radio, Scissors, X } from "lucide-react";
import type { MouseEvent } from "react";

import type { CourseOffer } from "@/lib/course-offers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CourseImage({ image, title }: { image: CourseOffer["image"]; title: string }) {
  return <Image src={image} alt={title} fill className="object-cover transition duration-700 group-hover:scale-[1.05]" />;
}

function CourseIcon({ label }: { label: string }) {
  if (label === "LIVE") {
    return <Radio className="h-5 w-5" />;
  }

  if (label === "Perfectionare") {
    return <Scissors className="h-5 w-5" />;
  }

  return <GraduationCap className="h-5 w-5" />;
}

function CourseVisual({ course, title }: { course: CourseOffer; title: string }) {
  if (course.imageUrl) {
    return (
      <Image
        src={course.imageUrl}
        alt={title}
        fill
        className="object-cover transition duration-700 group-hover:scale-[1.05]"
        unoptimized
      />
    );
  }

  return <CourseImage image={course.image} title={title} />;
}

function InquiryButton({
  href,
  label,
  onClick
}: {
  href?: string;
  label?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
  if (!href || !label) {
    return null;
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d6b98c]/30 bg-[#d6b98c]/10 px-4 py-3 text-center text-[11px] font-medium uppercase tracking-[0.24em] text-[#f4dfbe] transition hover:-translate-y-0.5 hover:border-[#d6b98c]/55 hover:bg-[#d6b98c]/16"
    >
      {label}
    </Link>
  );
}

function CourseCardContent({
  course,
  compact = false,
  showInlineInquiry = false
}: {
  course: CourseOffer;
  compact?: boolean;
  showInlineInquiry?: boolean;
}) {
  const hasDiscount = Boolean(course.compareAtPriceValue && course.compareAtPriceValue > course.priceValue);
  const discountPercent = hasDiscount
    ? Math.round((((course.compareAtPriceValue || 0) - course.priceValue) / (course.compareAtPriceValue || 1)) * 100)
    : 0;
  const actionLabel = course.cardActionLabel || (course.cardHref ? "Deschide" : "Detalii");
  return (
    <>
      <div className={cn("relative overflow-hidden", compact ? "aspect-[16/12]" : "aspect-[16/11]")}>
        <CourseVisual course={course} title={course.title} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.78))]" />
        <div className="absolute left-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/[0.35] text-white/95 backdrop-blur-md">
          <CourseIcon label={course.label} />
        </div>
        <div className="absolute inset-x-5 bottom-5 z-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">{course.label}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {hasDiscount ? (
                <span className="rounded-full border border-red-500/35 bg-red-500/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-red-100 shadow-[0_16px_32px_rgba(185,28,28,0.22)]">
                  Reducere {discountPercent}%
                </span>
              ) : null}
              <span className="rounded-full bg-black/[0.35] px-3 py-1.5 text-[10px] uppercase tracking-[0.26em] text-white/[0.64]">
                {course.note}
              </span>
            </div>
          </div>
          <p className="mt-3 text-3xl leading-tight text-white">{course.shortTitle}</p>
        </div>
      </div>

      <div className={cn("p-5 sm:p-6", compact ? "space-y-4 sm:space-y-5" : "space-y-5 sm:space-y-6")}>
        <div>
          <p className={cn("leading-tight text-white", compact ? "text-2xl sm:text-[2rem]" : "text-3xl")}>
            {course.title}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/[0.62] sm:text-[15px]">{course.description}</p>
        </div>

        <div className="space-y-3">
          {course.hidePriceInCard ? null : (
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.38]">Pret</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {hasDiscount && course.compareAtPrice ? (
                    <p className="text-base text-white/35 line-through sm:text-lg">{course.compareAtPrice}</p>
                  ) : null}
                  <p className="rounded-full border border-red-500/35 bg-red-500/15 px-4 py-2 text-xl font-semibold text-red-100 shadow-[0_18px_38px_rgba(185,28,28,0.22)] sm:text-2xl">
                    {course.price}
                  </p>
                </div>
              </div>
              {course.cardHref ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/[0.72]">
                  {actionLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </div>
          )}

          {course.cardHref && course.hidePriceInCard ? (
            <Link
              href={course.cardHref}
              target={course.cardTarget || "_self"}
              rel={course.cardTarget === "_blank" ? "noreferrer" : undefined}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ff6b6b]/40 bg-[linear-gradient(180deg,#ff4d4d,#c1121f)] px-5 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(193,18,31,0.42)] transition hover:-translate-y-0.5 hover:border-[#ff9a9a]/60 hover:bg-[linear-gradient(180deg,#ff6666,#a30f1a)] hover:shadow-[0_26px_70px_rgba(193,18,31,0.55)]"
            >
              {actionLabel}
            </Link>
          ) : null}

          {showInlineInquiry && course.inquiryHref && course.inquiryLabel ? (
            <InquiryButton
              href={course.inquiryHref}
              label={course.inquiryLabel}
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export function CourseDetailDialog({
  course,
  ctaHref,
  compact = false,
  className
}: {
  course: CourseOffer;
  ctaHref: string;
  compact?: boolean;
  className?: string;
}) {
  const hasDiscount = Boolean(course.compareAtPriceValue && course.compareAtPriceValue > course.priceValue);
  const cardHref = course.cardHref;

  if (cardHref) {
    return (
      <div
        role="link"
        tabIndex={0}
        className={cn(
          "group overflow-hidden text-left transition duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          compact
            ? "premium-card h-full rounded-[1.9rem]"
            : "rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] shadow-[0_22px_70px_rgba(0,0,0,0.2)]",
          className
        )}
        onClick={() => {
          if (course.cardTarget === "_blank") {
            window.open(cardHref, "_blank", "noopener,noreferrer");
            return;
          }

          window.location.href = cardHref;
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();

          if (course.cardTarget === "_blank") {
            window.open(cardHref, "_blank", "noopener,noreferrer");
            return;
          }

          window.location.href = cardHref;
        }}
      >
        <CourseCardContent course={course} compact={compact} showInlineInquiry={Boolean(course.inquiryHref)} />
      </div>
    );
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div
          className={cn(
            "group overflow-hidden text-left transition duration-300 hover:-translate-y-1",
            compact
              ? "premium-card h-full rounded-[1.9rem]"
              : "rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] shadow-[0_22px_70px_rgba(0,0,0,0.2)]",
            className
          )}
        >
          <CourseCardContent course={course} compact={compact} showInlineInquiry={Boolean(course.inquiryHref)} />
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.82] backdrop-blur-[12px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.3rem] border border-white/10 bg-[#070707] p-5 shadow-[0_44px_140px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="relative min-h-[24rem] overflow-hidden rounded-[1.9rem]">
              <CourseVisual course={course} title={course.title} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.82))]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">{course.label}</p>
                <p className="mt-3 text-4xl leading-[0.92] text-white">{course.title}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm leading-7">
                  {hasDiscount && course.compareAtPrice ? (
                    <span className="text-white/35 line-through">{course.compareAtPrice}</span>
                  ) : null}
                  <span className="text-white/[0.82]">{course.price}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">{course.note}</p>
                  <Dialog.Title className="mt-3 text-3xl leading-tight text-white sm:text-4xl">
                    {course.title}
                  </Dialog.Title>
                </div>
                <Dialog.Close className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>

              <p className="mt-6 text-base leading-8 text-white/[0.68]">{course.dialogBody}</p>
              {course.externalLinkUrl ? (
                <div className="mt-4">
                  <Link
                    href={course.externalLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-red-100 underline decoration-red-500/60 underline-offset-4"
                  >
                    {course.externalLinkLabel || course.externalLinkUrl}
                  </Link>
                </div>
              ) : null}

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {course.include?.length ? (
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">{course.includeTitle}</p>
                    <div className="mt-4 space-y-3">
                      {course.include.map((item) => (
                        <p key={item} className="border-l border-[#d6b98c]/25 pl-4 text-sm leading-7 text-white/[0.76]">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {course.learn?.length ? (
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">{course.learnTitle}</p>
                    <div className="mt-4 space-y-3">
                      {course.learn.map((item) => (
                        <p key={item} className="border-l border-white/[0.12] pl-4 text-sm leading-7 text-white/[0.76]">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {course.advantage ? (
                <div className="mt-5 rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(214,185,140,0.09),rgba(214,185,140,0.03))] p-5">
                  <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">
                    {course.label === "LIVE" ? "De ce sa participi" : "Avantajul tau"}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/[0.76]">{course.advantage}</p>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.38]">Pret final</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {hasDiscount && course.compareAtPrice ? (
                      <p className="text-lg text-white/35 line-through">{course.compareAtPrice}</p>
                    ) : null}
                    <p className="rounded-full border border-red-500/35 bg-red-500/15 px-5 py-3 text-3xl font-semibold text-red-100 shadow-[0_18px_38px_rgba(185,28,28,0.22)]">
                      {course.price}
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                  <InquiryButton href={course.inquiryHref} label={course.inquiryLabel} />
                  {!course.purchaseDisabled ? (
                    <Button asChild className="w-full px-7 sm:w-auto">
                      <Link href={ctaHref}>{course.purchaseLabel}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
