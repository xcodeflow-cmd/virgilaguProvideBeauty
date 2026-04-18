import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/data";

const footerLinks = [
  { href: "/courses", label: "Cursuri" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Galerie" },
  { href: "/reviews", label: "Feedback" },
  { href: "/contact", label: "Contact" }
];

const socialLinks = [
  { href: siteConfig.socials.instagram, label: "Instagram" },
  { href: siteConfig.socials.tiktok, label: "TikTok" },
  { href: siteConfig.socials.mero, label: "MERO" },
  { href: siteConfig.socials.whatsapp, label: "WhatsApp" }
];

export function SiteFooter() {
  return (
    <footer className="pb-8 pt-12 sm:pb-10 sm:pt-16">
      <div className="section-shell">
        <div className="grid gap-10 border-t border-white/10 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <div className="space-y-6">
            <Logo />
            <div className="flex flex-wrap gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 px-4 py-2.5 text-xs uppercase tracking-[0.26em] text-white/[0.56] transition hover:border-[#d6b98c]/[0.28] hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] px-2 py-3 text-center text-[11px] text-white/60 shadow-[0_18px_46px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#d6b98c]/30 hover:text-white sm:rounded-[1.35rem] sm:px-4 sm:py-4 sm:text-sm"
              >
                <div className="flex items-center justify-center gap-2 sm:justify-between">
                  <div>
                    <p className="hidden text-[10px] uppercase tracking-[0.3em] text-white/35 sm:block">Social</p>
                    <p className="text-sm text-white sm:mt-2 sm:text-base">{link.label}</p>
                  </div>
                  <ArrowUpRight className="hidden h-4 w-4 text-white/[0.28] transition group-hover:text-[#d6b98c] sm:block" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


