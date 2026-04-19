"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Building2, Gavel, MapPin, Trophy, X } from "lucide-react";

import { MobilePeekCarousel } from "@/components/mobile-peek-carousel";
import dublin1 from "@/assets/dublin1.jpeg";
import dublin2 from "@/assets/dublin2.jpeg";
import inspireBattle from "@/assets/inspire battle bucuresti locul3.jpeg";
import masterBarber from "@/assets/Locul 1 master barber 2022.jpeg";
import jurat1 from "@/assets/jurat1.jpeg";
import jurat2 from "@/assets/jurat2.jpeg";
import jurat3 from "@/assets/jurat3.jpeg";
import jurat4 from "@/assets/jurat4.jpeg";
import goldenClippers from "@/assets/Golden clippers.jpeg";
import provibeAntonPan1 from "@/assets/provibeAntonPan1.png";
import provibeAntonPan2 from "@/assets/ProvibeAntonPan2.png";
import provibePiataMare1 from "@/assets/provibePiataMare1.png";
import provibePiataMare2 from "@/assets/ProvibePiataMare2.png";
import provibeStefanCelMare1 from "@/assets/ProvibeStefanCelMare1.jpeg";
import provibeStefanCelMare2 from "@/assets/ProvibeStefanCelMare2.jpeg";

type SpotlightImage = {
  src: StaticImageData;
  alt: string;
};

type SpotlightCollection = {
  title: string;
  category: string;
  description: string;
  images: SpotlightImage[];
  mapUrl?: string;
};

const awards: SpotlightCollection[] = [
  {
    title: "Locul 1 la Fast Fade in Dublin, Irlanda 2023",
    category: "Palmares",
    description:
      "Un rezultat care valideaza executia la nivel de competitie internationala: precizie, control si prezenta pe scena puse cap la cap intr-un moment care a confirmat standardul Provibe.",
    images: [
      { src: dublin1, alt: "Locul 1 Fast Fade Dublin 2023 - moment 1" },
      { src: dublin2, alt: "Locul 1 Fast Fade Dublin 2023 - moment 2" }
    ]
  },
  {
    title: "Locul 3 la Inspire Battle Bucuresti 2020",
    category: "Competitie",
    description:
      "O clasare castigata prin disciplina, ritm si executie curata, intr-un context competitiv in care fiecare detaliu conteaza si fiecare alegere trebuie sustinuta de nivel real.",
    images: [{ src: inspireBattle, alt: "Locul 3 Inspire Battle Bucuresti 2020" }]
  },
  {
    title: "Locul 1 Master Barber 2022",
    category: "Titlu",
    description:
      "Un reper puternic in traseul profesional, construit pe constanta, tehnica si capacitatea de a livra sub presiune exact acel nivel care diferentiaza un barber bun de unul memorabil.",
    images: [{ src: masterBarber, alt: "Locul 1 Master Barber 2022" }]
  }
];

const juryHighlights: SpotlightCollection[] = [
  {
    title: "Game of Blades 2025",
    category: "Jurat",
    description:
      "Prezenta in juriu confirma autoritatea construita in ani de munca, competitii si educatie. Selectia, evaluarea si standardul cerut pe scena reflecta exact directia pe care o vezi in tot ecosistemul Provibe.",
    images: [
      { src: jurat1, alt: "Jurat Game of Blades 2025 - moment 1" },
      { src: jurat2, alt: "Jurat Game of Blades 2025 - moment 2" },
      { src: jurat3, alt: "Jurat Game of Blades 2025 - moment 3" },
      { src: jurat4, alt: "Jurat Game of Blades 2025 - moment 4" }
    ]
  },
  {
    title: "Golden Clippers 2026",
    category: "Invitatie in juriu",
    description:
      "Participarea ca jurat la Golden Clippers 2026 intareste pozitionarea intr-o zona premium a industriei, acolo unde opinia, ochiul format si experienta practica devin criterii de referinta.",
    images: [{ src: goldenClippers, alt: "Golden Clippers 2026" }]
  }
];

const salons: SpotlightCollection[] = [
  {
    title: "Provibe Stefan Cel Mare",
    category: "Locatie",
    description:
      "Spatiul in care atmosfera premium se combina cu ritmul de salon real. Design curat, energie buna si o executie consecventa pentru clientii care cauta standard inalt, nu improvizatie.",
    mapUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwiArcX7qPqTAxUAAAAAHQAAAAAQCA..i&pvq=Cg0vZy8xMXoxNnl0MHRyIg0KB3Byb3ZpYmUQAhgD&lqi=Cg1wcm92aWJlIHJvbWFukgELYmFyYmVyX3Nob3A&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ro&sa=X&ftid=0x40cabd90fafe8af5:0xaec986683fadd033",
    images: [
      { src: provibeStefanCelMare1, alt: "Provibe Stefan Cel Mare - interior 1" },
      { src: provibeStefanCelMare2, alt: "Provibe Stefan Cel Mare - interior 2" }
    ]
  },
  {
    title: "Provibe Anton Pan",
    category: "Locatie",
    description:
      "O locatie gandita pentru experienta completa: confort, imagine coerenta si acel vibe premium care face fiecare vizita sa para bine construita de la intrare pana la rezultatul final.",
    mapUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwiArcX7qPqTAxUAAAAAHQAAAAAQVg..i&pvq=Cg0vZy8xMWxoazVuZjgyIg0KB3Byb3ZpYmUQAhgD&lqi=Cg1wcm92aWJlIHJvbWFuSILq6JK-soCACFoVEAAYABgBIg1wcm92aWJlIHJvbWFukgEMYmVhdXR5X3NhbG9u&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ro&sa=X&ftid=0x40cabd91cb973595:0xdd55bf11b434bb76",
    images: [
      { src: provibeAntonPan1, alt: "Provibe Anton Pan - interior 1" },
      { src: provibeAntonPan2, alt: "Provibe Anton Pan - interior 2" }
    ]
  },
  {
    title: "Provibe Piata Mare",
    category: "Locatie",
    description:
      "Locatia care duce mai departe semnatura vizuala Provibe intr-o formula eleganta si puternica, pregatita pentru clienti care apreciaza atat executia, cat si contextul in care ea este livrata.",
    mapUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwiArcX7qPqTAxUAAAAAHQAAAAAQGQ..i&pvq=Cg0vZy8xMXk1NHo1bmp3Ig0KB3Byb3ZpYmUQAhgD&lqi=Cg1wcm92aWJlIHJvbWFuWg8iDXByb3ZpYmUgcm9tYW6SAQtiYXJiZXJfc2hvcA&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ro&sa=X&ftid=0x40caa3a31e4e6a03:0xcbe81fea4fc1992b",
    images: [
      { src: provibePiataMare2, alt: "Provibe Piata Mare - interior 1" },
      { src: provibePiataMare1, alt: "Provibe Piata Mare - interior 2" }
    ]
  }
];

function SpotlightDialog({ collection, image, index }: { collection: SpotlightCollection; image: SpotlightImage; index: number }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="group relative aspect-[4/5] w-full shrink-0 snap-start overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/20 text-left shadow-[0_24px_80px_rgba(0,0,0,0.26)] transition duration-500 hover:-translate-y-1 hover:border-[#d6b98c]/40">
          <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.74))]" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#d6b98c]">{collection.category}</p>
            <p className="mt-3 text-lg leading-tight text-white sm:text-xl">{collection.title}</p>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-[10px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] flex h-[88dvh] w-[94vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] shadow-[0_44px_140px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#d6b98c]">
                {collection.category} / {index + 1}/{collection.images.length}
              </p>
              <Dialog.Title className="mt-3 max-w-3xl text-2xl leading-tight text-white sm:text-4xl">
                {collection.title}
              </Dialog.Title>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">{collection.description}</p>
              {collection.mapUrl ? (
                <Link
                  href={collection.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d6b98c]/30 bg-[#d6b98c]/10 px-4 py-2 text-sm text-[#f2ddbb] transition hover:border-[#d6b98c]/50 hover:bg-[#d6b98c]/15"
                >
                  <MapPin className="h-4 w-4" />
                  Vezi locatia pe Google Maps
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <Dialog.Close className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="relative min-h-0 flex-1 bg-black">
            <Image src={image.src} alt={image.alt} fill className="object-contain" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CollectionRail({ collection }: { collection: SpotlightCollection }) {
  return (
    <>
      <div className="hidden gap-4 md:flex md:overflow-x-auto md:pb-2">
        {collection.images.map((image, index) => (
          <div key={`${collection.title}-${index}`} className="min-w-[20rem] flex-1">
            <SpotlightDialog collection={collection} image={image} index={index} />
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <MobilePeekCarousel
          ariaLabel={collection.title}
          items={collection.images.map((image, index) => (
            <SpotlightDialog key={`${collection.title}-${index}`} collection={collection} image={image} index={index} />
          ))}
        />
      </div>
    </>
  );
}

function SpotlightSection({
  kicker,
  title,
  copy,
  icon: Icon,
  collections
}: {
  kicker: string;
  title: string;
  copy: string;
  icon: typeof Trophy;
  collections: SpotlightCollection[];
}) {
  return (
    <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))] p-5 shadow-[0_36px_120px_rgba(0,0,0,0.26)] sm:p-7 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)]">
        <div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#d6b98c]/20 bg-[#d6b98c]/10 text-[#ecd4ac]">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.38em] text-[#d6b98c]">{kicker}</p>
          <h2 className="mt-5 text-4xl leading-[0.92] text-white sm:text-5xl">{title}</h2>
          <p className="mt-6 max-w-xl text-sm leading-8 text-white/68 sm:text-base">{copy}</p>
        </div>

        <div className="space-y-6">
          {collections.map((collection) => (
            <article
              key={collection.title}
              className="rounded-[1.9rem] border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-5"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#d6b98c]">{collection.category}</p>
                  <h3 className="mt-3 text-2xl leading-tight text-white sm:text-3xl">{collection.title}</h3>
                </div>
                {collection.mapUrl ? (
                  <Link
                    href={collection.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 transition hover:border-[#d6b98c]/35 hover:text-white sm:inline-flex"
                  >
                    Maps
                  </Link>
                ) : null}
              </div>
              <p className="mb-5 max-w-3xl text-sm leading-7 text-white/64 sm:text-base">{collection.description}</p>
              <CollectionRail collection={collection} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <section className="section-shell section-space">
      <div className="space-y-8 sm:space-y-10">
        <div className="overflow-hidden rounded-[2.6rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_20%),linear-gradient(180deg,#0f0f0f,#070707)] px-6 py-8 shadow-[0_42px_140px_rgba(0,0,0,0.34)] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Despre noi</p>
          <h1 className="mt-6 max-w-6xl text-5xl leading-[0.84] text-white sm:text-6xl lg:text-7xl">
            O pagina construita din rezultate reale, prezenta in industrie si locatii care ridica standardul Provibe.
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-white/70 sm:text-lg">
            In spatele numelui Provibe stau competitii castigate, invitatii in jurii importante si trei saloane care duc mai departe acelasi standard premium: imagine puternica, executie curata si experienta construita atent pana in ultimul detaliu.
          </p>
        </div>

        <SpotlightSection
          kicker="Premii"
          title="Palmares care atrage atentia imediat."
          copy="Fiecare aparitie de mai jos are greutate in imaginea brandului pentru ca vine din competitie, sub presiune reala, in contexte unde doar nivelul sustine rezultatul. Accentul paginii cade aici exact cum ai cerut: mare, clar si imposibil de ignorat."
          icon={Trophy}
          collections={awards}
        />

        <SpotlightSection
          kicker="Jurat"
          title="Prezenta in juriu la competitii care conteaza."
          copy="Rolul de jurat nu este doar o aparitie de imagine. Este confirmarea ca experienta, criteriul estetic si autoritatea profesionala sunt recunoscute in evenimente relevante din industrie."
          icon={Gavel}
          collections={juryHighlights}
        />

        <SpotlightSection
          kicker="Saloane Provibe"
          title="Trei locatii, aceeasi semnatura premium."
          copy="Fiecare salon are personalitate proprie, dar toate pastreaza aceeasi directie: spatiu bine gandit, experienta premium si o identitate coerenta care se simte la fel de bine pe telefon, pe hartie si in realitate."
          icon={Building2}
          collections={salons}
        />
      </div>
    </section>
  );
}
