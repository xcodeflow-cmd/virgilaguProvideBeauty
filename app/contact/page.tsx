import Link from "next/link";
import { Instagram, MessageCircle, Phone } from "lucide-react";

import { BookingForm } from "@/components/booking-form";
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
      <FadeIn className="overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_40px_120px_rgba(0,0,0,0.3)]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/8 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Contact</p>
            <h1 className="mt-6 max-w-4xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
              Contact direct pentru cursuri, colaborari si sesiuni private.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/64 sm:text-lg">
              Fara o pagina rece de contact. Aici intri rapid in discutie, alegi directia si continui
              natural spre booking.
            </p>
          </div>
          <div className="grid gap-4 p-8 sm:grid-cols-3 sm:p-10 lg:p-14">
            {contactItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.006))] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.2)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d6b98c]/10 text-accent">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-10 text-[11px] uppercase tracking-[0.36em] text-white/42">{item.label}</p>
                <p className="mt-3 text-2xl text-white">{item.value}</p>
              </Link>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="mt-10" id="booking">
        <BookingForm />
      </div>
    </section>
  );
}
