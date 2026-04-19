import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/logo";
import instagramLogo from "@/assets/LogoInstagram.png";
import tiktokLogo from "@/assets/LogoTikTok.png";
import meroLogo from "@/assets/MeroLogo.png";
import whatsappLogo from "@/assets/WhatsappLogo.png";
import { siteConfig } from "@/lib/data";

const footerLinks = [
  { href: "/courses", label: "Cursuri" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Galerie" },
  { href: "/reviews", label: "Feedback" },
  { href: "/contact", label: "Contact" }
];

const socialLinks = [
  { href: siteConfig.socials.instagram, label: "Instagram", icon: instagramLogo },
  { href: siteConfig.socials.tiktok, label: "TikTok", icon: tiktokLogo },
  { href: siteConfig.socials.mero, label: "Mero", icon: meroLogo },
  { href: siteConfig.socials.whatsapp, label: "WhatsApp", icon: whatsappLogo }
];

export function SiteFooter() {
  return (
    <footer className="pb-[calc(10rem+env(safe-area-inset-bottom))] pt-12 sm:pb-10 sm:pt-16">
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

          <div className="grid grid-cols-4 gap-2 pb-2 sm:gap-4 sm:pb-0">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Deschide ${link.label}`}
                className="group flex aspect-square items-center justify-center rounded-[1.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] p-3 shadow-[0_18px_46px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#d6b98c]/30 sm:rounded-[1.35rem] sm:p-4"
              >
                <Image
                  src={link.icon}
                  alt={link.label}
                  className="h-auto max-h-10 w-auto object-contain opacity-90 transition duration-200 group-hover:scale-[1.04] group-hover:opacity-100 sm:max-h-12"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


