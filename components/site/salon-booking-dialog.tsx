"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brandImages, siteConfig } from "@/lib/data";
import provibeAntonPan1 from "@/assets/provibeAntonPan1.png";

const salonOptions = [
  {
    id: "anton-pan",
    title: "Provibe Anton Pan",
    image: provibeAntonPan1,
    description: "Programare direct la salonul din Anton Pan, cu acces rapid catre Mero.",
    mapsUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwiArcX7qPqTAxUAAAAAHQAAAAAQVg..i&pvq=Cg0vZy8xMWxoazVuZjgyIg0KB3Byb3ZpYmUQAhgD&lqi=Cg1wcm92aWJlIHJvbWFuSILq6JK-soCACFoVEAAYABgBIg1wcm92aWJlIHJvbWFukgEMYmVhdXR5X3NhbG9u&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ro&sa=X&ftid=0x40cabd91cb973595:0xdd55bf11b434bb76",
    bookingHref: "https://mero.ro/p/provide-beauty?absp=search_results&query=provibe",
    bookingTarget: "_self"
  },
  {
    id: "stefan-cel-mare",
    title: "Provibe Stefan Cel Mare",
    image: brandImages.salon,
    description: "Alege salonul din Stefan Cel Mare si deschide pagina de programare dedicata.",
    mapsUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwiArcX7qPqTAxUAAAAAHQAAAAAQCA..i&pvq=Cg0vZy8xMXoxNnl0MHRyIg0KB3Byb3ZpYmUQAhgD&lqi=Cg1wcm92aWJlIHJvbWFukgELYmFyYmVyX3Nob3A&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ro&sa=X&ftid=0x40cabd90fafe8af5:0xaec986683fadd033",
    bookingHref: "https://mero.ro/p/provibe-stefan-cel-mare-roman?absp=search_results&query=provibe&campaignId=&campaignSource=",
    bookingTarget: "_blank"
  }
] as const;

function SalonCard({
  salon
}: {
  salon: (typeof salonOptions)[number];
}) {
  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.03] shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image src={salon.image} alt={salon.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.68))]" />
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">Salon</p>
          <h3 className="mt-3 text-2xl leading-tight text-white">{salon.title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">{salon.description}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={salon.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white/[0.72] transition hover:-translate-y-0.5 hover:border-[#d6b98c]/35 hover:text-white"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Google Maps
          </Link>

          <Link
            href={salon.bookingHref}
            target={salon.bookingTarget}
            rel={salon.bookingTarget === "_blank" ? "noreferrer" : undefined}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#ff6b6b]/40 bg-[linear-gradient(180deg,#ff4d4d,#c1121f)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-[0_20px_55px_rgba(193,18,31,0.42)] transition hover:-translate-y-0.5 hover:border-[#ff9a9a]/60 hover:bg-[linear-gradient(180deg,#ff6666,#a30f1a)] hover:shadow-[0_26px_70px_rgba(193,18,31,0.55)]"
          >
            Programeaza-te
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SalonBookingDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className="w-full sm:w-auto">Programeaza-te</Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/[0.82] backdrop-blur-[12px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[94vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.3rem] border border-white/10 bg-[#070707] p-5 shadow-[0_44px_140px_rgba(0,0,0,0.5)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">Programare</p>
              <Dialog.Title className="mt-3 text-3xl leading-tight text-white sm:text-4xl">
                Alege salonul pentru programare.
              </Dialog.Title>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
                Selecteaza locatia corecta, vezi pe harta si mergi direct la programarea potrivita.
              </p>
            </div>
            <Dialog.Close className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {salonOptions.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
