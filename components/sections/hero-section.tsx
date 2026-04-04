import Link from "next/link";
import { PlayCircle, Scissors, Sparkles } from "lucide-react";

import { FadeIn } from "@/components/motion-shell";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/data";

export function HeroSection() {
  return (
    <section className="section-shell relative overflow-hidden pb-16 pt-10 sm:pt-16">
      <div className="absolute inset-x-0 top-20 -z-10 mx-auto h-[28rem] w-[28rem] rounded-full bg-gold/15 blur-[140px]" />
      <div className="glass-panel gold-ring grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative flex min-h-[75vh] flex-col justify-between bg-hero-glow p-8 sm:p-10 lg:p-14">
          <FadeIn className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-gold-light">
              <Sparkles className="h-4 w-4" />
              Future of Premium Grooming
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl text-6xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Luxury barber craft, staged like a fashion house.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
                {siteConfig.name} blends cinematic cuts, private-client atmosphere,
                and subscriber-only live sessions into a 2026-ready premium brand.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="min-w-36">
                <Link href="/contact#booking">Book Now</Link>
              </Button>
              <Button asChild variant="secondary" className="min-w-36">
                <Link href="/live">
                  <PlayCircle className="h-4 w-4" />
                  Watch Live
                </Link>
              </Button>
            </div>
          </FadeIn>
          <FadeIn delay={0.18} className="grid gap-4 pt-10 sm:grid-cols-3">
            {[
              ["12K+", "Audience reach"],
              ["4.9/5", "Client rating"],
              ["24/7", "Premium platform"]
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm">
                <p className="font-display text-3xl text-gold-light">{value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-white/45">{label}</p>
              </div>
            ))}
          </FadeIn>
        </div>
        <div className="relative min-h-[32rem] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(8,8,8,0.15), rgba(8,8,8,0.82)), url('https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1400&q=80')"
            }}
          />
          <div className="absolute inset-x-6 bottom-6 rounded-[1.75rem] border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 text-gold-light">
              <Scissors className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.4em]">Private Session Energy</p>
            </div>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/72">
              Built for clients who expect detail, atmosphere, and a visual identity
              that feels editorial from first click to final look.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
