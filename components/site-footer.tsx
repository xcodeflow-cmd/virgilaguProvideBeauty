import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/data";

const footerLinks = [
  { href: "/courses", label: "Cursuri" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Galerie" },
  { href: "/reviews", label: "Review-uri" },
  { href: "/contact", label: "Contact" }
];

const socialLinks = [
  { href: siteConfig.socials.instagram, label: "Instagram" },
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

          <div className="grid gap-4 sm:grid-cols-3">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between border-b border-white/10 pb-3 text-sm text-white/60 transition hover:text-white"
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4 text-white/[0.28] transition group-hover:text-[#d6b98c]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


