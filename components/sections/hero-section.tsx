import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Scissors, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion-shell";
import { Button } from "@/components/ui/button";
import { brandImages, homepageStats, siteConfig } from "@/lib/data";

export function HeroSection() {
  return (
    <section className="section-shell relative overflow-hidden pb-16 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-[28rem] w-[28rem] rounded-full bg-white/10 blur-[140px]" />
      <div className="glass-panel soft-ring grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex min-h-[75vh] flex-col justify-between bg-hero-glow p-8 sm:p-10 lg:p-14">
          <FadeIn className="max-w-3xl space-y-8">
            <div className="accent-chip">
              <Sparkles className="h-4 w-4" />
              Premium barber experience
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-6xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Frizerie premium, educatie reala si o prezenta construita modern.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                {siteConfig.name} livreaza servicii curate, cursuri practice si sesiuni
                live pentru barberi care vor standard mai bun, imagine mai buna si
                executie mai buna.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="min-w-36">
                <Link href="/contact#booking">Programeaza-te</Link>
              </Button>
              <Button asChild variant="secondary" className="min-w-36">
                <Link href="/courses">
                  <PlayCircle className="h-4 w-4" />
                  Vezi cursurile
                </Link>
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.18} className="grid gap-4 pt-10 sm:grid-cols-2 xl:grid-cols-4">
            {homepageStats.map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm">
                <p className="font-display text-3xl text-white">{value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/45">{label}</p>
              </div>
            ))}
          </FadeIn>
        </div>
        <div className="relative min-h-[32rem] overflow-hidden">
          <Image src={brandImages.hero} alt="Virgil Agu hero" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/85" />
          <div className="absolute inset-x-6 bottom-6 rounded-[1.75rem] border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 text-accent">
              <Scissors className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.4em]">Virgil Agu</p>
            </div>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/72">
              Tunsoare, educatie si continut live intr-un format care arata matur,
              premium si clar pe mobil sau desktop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
