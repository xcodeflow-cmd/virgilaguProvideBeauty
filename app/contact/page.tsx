import Link from "next/link";
import { Instagram, MessageCircle, Phone, Ticket, Video } from "lucide-react";

import { BookingForm } from "@/components/booking-form";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/data";

const contactItems = [
  { label: "WhatsApp", value: "+40 700 000 000", href: siteConfig.socials.whatsapp, icon: MessageCircle },
  { label: "Instagram", value: "@tudornoirstudio", href: siteConfig.socials.instagram, icon: Instagram },
  { label: "TikTok", value: "@tudornoirstudio", href: siteConfig.socials.tiktok, icon: Ticket },
  { label: "Phone", value: "+40 700 000 000", href: siteConfig.socials.phone, icon: Phone }
];

export default function ContactPage() {
  return (
    <section className="section-shell py-16 sm:py-20">
      <FadeIn>
        <SectionHeading
          eyebrow="Contact"
          title="Reach the studio instantly."
          description="Bookings, social touchpoints, and direct contact are styled as premium conversion paths instead of a basic contact block."
        />
      </FadeIn>
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {contactItems.map((item) => (
            <Link key={item.label} href={item.href} className="glass-panel flex items-center gap-4 rounded-[1.5rem] p-5 transition hover:border-gold/30 hover:bg-white/8">
              <item.icon className="h-5 w-5 text-gold-light" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">{item.label}</p>
                <p className="mt-1 text-xl text-white">{item.value}</p>
              </div>
            </Link>
          ))}
          <div className="glass-panel rounded-[1.5rem] p-6">
            <div className="flex items-center gap-3 text-gold-light">
              <Video className="h-5 w-5" />
              <p className="text-sm uppercase tracking-[0.35em]">Private live bookings</p>
            </div>
            <p className="mt-3 text-base leading-7 text-white/60">
              Ready for collaboration, private education sessions, or branded content? Use the same premium booking flow.
            </p>
          </div>
        </div>
        <div id="booking">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}
