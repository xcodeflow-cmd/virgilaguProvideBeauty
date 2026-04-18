import Link from "next/link";
import { Instagram, MessageCircle, Phone } from "lucide-react";

import { FadeIn } from "@/components/motion-shell";
import { siteConfig } from "@/lib/data";

const contactItems = [
  { label: "WhatsApp", value: "+40 785 571 176", href: siteConfig.socials.whatsapp, icon: MessageCircle },
  { label: "Instagram", value: "@virgilagu", href: siteConfig.socials.instagram, icon: Instagram },
  { label: "Telefon", value: "+40 785 571 176", href: siteConfig.socials.phone, icon: Phone }
];

export default function ContactPage() {
  return (
    <section className="section-shell section-space">
      <FadeIn className="overflow-hidden rounded-[2.2rem] bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Contact</p>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[0.9] text-white sm:text-6xl lg:text-7xl">
              Hai direct la conversatia care misca lucrurile.
            </h1>
            <div className="mt-8 inline-flex rounded-full border border-[#d6b98c]/20 bg-[#d6b98c]/10 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[#f3dfbf]">
              Raspuns rapid
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4 sm:gap-4 sm:p-10 lg:p-14">
            {contactItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-[1.15rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.006))] p-3 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:rounded-[1.6rem] sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6b98c]/10 text-accent sm:h-12 sm:w-12">
                  <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/[0.42] sm:mt-8 sm:text-[11px] sm:tracking-[0.36em]">{item.label}</p>
                <p className="mt-2 text-xs text-white sm:mt-3 sm:text-2xl">{item.value}</p>
              </Link>
            ))}
          </div>
        </div>
      </FadeIn>

    </section>
  );
}


