import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/data";

export function Footer() {
  return (
    <footer className="py-10 sm:py-12">
      <div className="section-shell">
        <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.006))] px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Logo />
              <p className="max-w-md text-sm leading-6 text-white/[0.55]">
                Educatie si barbering intr-un format coerent, curat si premium.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
              <Link href="/live" className="transition hover:text-white">Live</Link>
              <Link href="/courses" className="transition hover:text-white">Courses</Link>
              <Link href="/gallery" className="transition hover:text-white">Gallery</Link>
              <Link href="/reviews" className="transition hover:text-white">Feedback</Link>
              <Link href={siteConfig.socials.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">Instagram <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              <Link href={siteConfig.socials.mero} target="_blank" rel="noreferrer" className="transition hover:text-white">MERO</Link>
              <Link href={siteConfig.socials.whatsapp} target="_blank" rel="noreferrer" className="transition hover:text-white">WhatsApp</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


