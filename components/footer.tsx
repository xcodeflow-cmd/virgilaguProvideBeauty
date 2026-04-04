import Link from "next/link";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="section-shell flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-white/55">
            Luxury grooming, members-only live education, and a digital experience
            designed to feel cinematic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
          <Link href={siteConfig.socials.instagram}>Instagram</Link>
          <Link href={siteConfig.socials.tiktok}>TikTok</Link>
          <Link href={siteConfig.socials.whatsapp}>WhatsApp</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
