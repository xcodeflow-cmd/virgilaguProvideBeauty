"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, GraduationCap, Play, Radio, Scissors, X } from "lucide-react";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { Button } from "@/components/ui/button";
import { useCleaningContent } from "@/components/site/use-cleaning-content";
import { defaultServices, getAssetImageById } from "@/lib/cleaning-content";
import { brandImages, compactReviews } from "@/lib/data";

const courseMeta = [
  {
    label: "Incepatori",
    price: "3650 lei",
    note: "max 6 cursanti",
    description:
      "Format fizic dedicat celor care vor sa construiasca baza corecta de la zero.",
    buyHref: "/contact#booking",
    buyLabel: "Rezerva locul",
    dialogTitle: "Curs de frizerie pentru incepatori",
    dialogBody:
      "Un program fizic construit freestyle pentru cei care intra serios in industrie: fundatie tehnica, ritm de lucru, pozitionare, control pe unelte si constructia unei tunsori curate de la zero.",
    include: [
      "Structura completa pentru incepatori",
      "Atentie pe baza, disciplina si executie",
      "Cadru fizic, intens, orientat pe progres real"
    ],
    learn: [
      "Fundamente solide de tuns si styling",
      "Control pe forma, sectiuni si tranzitii",
      "Ritmul de lucru care te scoate din zona de hobby"
    ]
  },
  {
    label: "Perfectionare 1 la 1",
    price: "1000 lei / zi",
    note: "1 zi intensiva",
    description:
      "Experienta intensiva alaturi de Virgil Agu, cu 2 modele reale, practica si corectare live.",
    buyHref: "/contact#booking",
    buyLabel: "Rezerva sesiunea",
    dialogTitle: "Curs de perfectionare 1 la 1",
    dialogBody:
      "Provibe, alaturi de fondatorul Virgil Agu, organizeaza cursuri de perfectionare dedicate frizerilor care vor sa treaca la urmatorul nivel. Formatul 1 la 1 inseamna atentie completa si ghidare personalizata pe tot parcursul zilei.",
    include: [
      "1 zi intensiva de lucru direct cu Virgil Agu",
      "2 modele reale",
      "Tehnici explicate pas cu pas",
      "Practica realizata impreuna cu cursantul",
      "Corectarea fiecarui detaliu in timp real",
      "Tips & tricks din experienta de peste 10 ani"
    ],
    learn: [
      "Fade-uri curate si tranzitii perfecte",
      "Forme corecte adaptate fiecarui tip de fata",
      "Tehnici moderne de tuns si styling",
      "Controlul uneltelor si eficienta in lucru",
      "Secrete din competitii si din salon"
    ],
    advantage:
      "Ai acces la informatie nelimitata, intr-un cadru dedicat exclusiv tie, unde poti intreba si aprofunda orice detaliu."
  },
  {
    label: "LIVE",
    price: "100 lei / sesiune",
    note: "lunar",
    description:
      "Inveti in timp real alaturi de Virgil Agu, cu explicatii live si ritm real de salon.",
    buyHref: "/api/stripe/checkout?mode=subscription",
    buyLabel: "Activeaza accesul",
    dialogTitle: "LIVE Barber Experience",
    dialogBody:
      "In fiecare luna, Virgil intra LIVE si tunde clienti reali, explicand pas cu pas fiecare miscare, fiecare tehnica si fiecare detaliu care face diferenta dintre un frizer obisnuit si unul de top.",
    include: [
      "Tunsori realizate in timp real pe modele reale",
      "Explicatii detaliate, pas cu pas",
      "Tehnici actuale si trenduri din industrie",
      "Acces direct la intrebari si raspunsuri",
      "Sfaturi din experienta de peste 10 ani"
    ],
    learn: [
      "Cum sa elimini timpii morti si sa lucrezi eficient",
      "Cum sa iti adaptezi tehnica astfel incat sa fii rapid si precis",
      "Cum sa sari peste anumiti pasi fara sa pierzi din calitate",
      "Cum sa iti cresti increderea si sa alungi nesiguranta",
      "Cum sa lucrezi cu mentalitate de profesionist"
    ],
    advantage:
      "Poti invata din confortul casei tale, urmarind exact cum se construieste o tunsoare corecta, de la zero pana la final."
  }
] as const;

const achievements = [
  "Fast Fade Dublin",
  "Master Barber Romania 2 ani consecutiv",
  "Multiple premii internationale"
] as const;

function CourseDialog({
  meta,
  icon
}: {
  meta: typeof courseMeta[number];
  icon: React.ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="group overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] text-left shadow-[0_22px_70px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1.5">
          <div className="relative aspect-[16/11]">
            {icon}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">{meta.label}</p>
              <span className="text-xs uppercase tracking-[0.26em] text-white/46">{meta.note}</span>
            </div>
            <p className="mt-4 text-3xl leading-tight text-white">{meta.dialogTitle}</p>
            <p className="mt-3 text-sm leading-7 text-white/62">{meta.description}</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.34em] text-white/42">Pret</p>
                <p className="mt-2 text-2xl text-white">{meta.price}</p>
              </div>
              <span className="rounded-full bg-white/[0.05] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/68">
                Detalii
              </span>
            </div>
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/82 backdrop-blur-[14px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[88vh] w-[94vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.2rem] bg-[#070707] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#d6b98c]">{meta.label}</p>
              <Dialog.Title className="mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-5xl">
                {meta.dialogTitle}
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full bg-white/[0.05] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-8 text-white/68">{meta.dialogBody}</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Ce include</p>
              <div className="mt-4 space-y-3">
                {meta.include.map((item) => (
                  <div key={item} className="rounded-[1.4rem] bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Ce vei invata</p>
              <div className="mt-4 space-y-3">
                {meta.learn.map((item) => (
                  <div key={item} className="rounded-[1.4rem] bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/78">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {"advantage" in meta && meta.advantage ? (
            <div className="mt-8 rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(214,185,140,0.09),rgba(214,185,140,0.03))] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Avantajul tau</p>
              <p className="mt-4 text-base leading-8 text-white/74">{meta.advantage}</p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/42">Pret</p>
              <p className="mt-2 text-3xl text-white">{meta.price}</p>
            </div>
            <Button asChild className="px-7">
              <Link href={meta.buyHref}>{meta.buyLabel}</Link>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PalmaresDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="grid content-start gap-4 text-left">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Palmares</p>
          <p className="max-w-lg text-3xl leading-tight text-white sm:text-4xl">
            Rezultate reale din competitie, educatie si ani de executie constanta.
          </p>
          <div className="mt-4 grid gap-3">
            {achievements.map((item) => (
              <div
                key={item}
                className="rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.008))] px-5 py-4 text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1"
              >
                {item}
              </div>
            ))}
          </div>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/82 backdrop-blur-[14px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[2.2rem] bg-[#070707] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-[#d6b98c]">Palmares</p>
              <Dialog.Title className="mt-3 text-4xl leading-tight text-white sm:text-5xl">
                Rezultate care vorbesc singure.
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full bg-white/[0.05] p-3 text-white/70 transition hover:bg-white/[0.1] hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="mt-8 space-y-4">
            <div className="rounded-[1.6rem] bg-white/[0.04] p-5 text-white/78">Fast Fade Dublin</div>
            <div className="rounded-[1.6rem] bg-white/[0.04] p-5 text-white/78">Master Barber Romania, 2 ani consecutiv</div>
            <div className="rounded-[1.6rem] bg-white/[0.04] p-5 text-white/78">Multiple premii internationale</div>
            <p className="pt-3 text-base leading-8 text-white/68">
              Peste 300 de cursanti formati, ani de competitie, podiumuri si experienta reala de salon.
              Aici nu e vorba doar despre tehnica, ci despre standard, consistenta si mentalitatea unui frizer de top.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function HomepageContent() {
  const { content } = useCleaningContent();
  const services = content.services.length ? content.services : defaultServices;

  return (
    <>
      <section className="section-shell section-space pt-8 sm:pt-14 lg:pt-16">
        <FadeIn className="relative overflow-hidden rounded-[2.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.005))] px-7 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12 lg:min-h-[46rem] lg:px-14 lg:py-16">
          <div className="absolute inset-y-0 right-0 hidden w-[43%] lg:block">
            <Image src={brandImages.hero} alt="Virgil Agu" fill priority className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,rgba(7,7,7,0.94)_26%,rgba(7,7,7,0.38)_62%,rgba(7,7,7,0.14)_100%)]" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,185,140,0.16),transparent_24%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.07),transparent_22%)]" />
          <div className="relative">
            <div className="max-w-[54rem]">
              <span className="section-kicker">Virgil Agu Education</span>
              <h1 className="mt-8 max-w-[48rem] text-[3.5rem] leading-[0.82] text-white sm:text-[4.6rem] lg:text-[5.8rem] xl:text-[6.2rem]">
                Locul unde frizeria inceteaza sa fie un job si devine arta.
              </h1>
              <p className="mt-7 max-w-xl text-xl leading-8 text-white/72">
                Aici incepe diferenta.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild className="px-7">
                  <Link href="/courses">
                    Vezi cursuri
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="px-7">
                  <Link href="/live">
                    <Play className="h-4 w-4" />
                    Vezi live
                  </Link>
                </Button>
              </div>

              <div className="mt-16 grid max-w-3xl gap-8 sm:grid-cols-3">
                <div>
                  <p className="dashboard-label">Experienta</p>
                  <p className="mt-3 text-3xl text-white">10+ ani</p>
                </div>
                <div>
                  <p className="dashboard-label">Cursanti formati</p>
                  <p className="mt-3 text-3xl text-white">300+</p>
                </div>
                <div>
                  <p className="dashboard-label">Format</p>
                  <p className="mt-3 text-3xl text-white">Fizic + LIVE</p>
                </div>
              </div>
            </div>

            <div className="relative mt-10 min-h-[22rem] overflow-hidden rounded-[2.2rem] lg:hidden">
              <Image src={brandImages.hero} alt="Virgil Agu" fill priority className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.7))]" />
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="section-shell section-space pt-0">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
          <FadeIn className="section-intro">
            <span className="section-kicker">About Me</span>
          </FadeIn>

          <FadeIn className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[30rem] overflow-hidden rounded-[2.2rem] shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
              <Image src={brandImages.aboutMain} alt="Virgil Agu trainer" fill className="object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.58))]" />
            </div>
            <PalmaresDialog />
          </FadeIn>
        </div>
      </section>

      <section className="section-shell section-space pt-0">
        <FadeIn className="section-intro">
          <Link href="/courses" className="section-kicker">
            Cursuri
          </Link>
          <h2 className="mt-6 editorial-title">
            Trei directii clare catre transpunerea jobului in arta.
          </h2>
        </FadeIn>

        <Stagger className="mt-14 grid gap-6 xl:grid-cols-3">
          {services.slice(0, 3).map((service, index) => {
            const meta = courseMeta[index];
            const icon = (
              <>
                <Image
                  src={getAssetImageById(service.imageId).src}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                <div className="absolute left-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 text-white">
                  {index === 0 ? <GraduationCap className="h-5 w-5" /> : index === 1 ? <Scissors className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
                </div>
              </>
            );

            return (
              <StaggerItem key={service.id}>
                <CourseDialog meta={meta} icon={icon} />
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="section-shell section-space pt-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <FadeIn className="section-intro">
            <span className="section-kicker">Review-uri</span>
            <h2 className="mt-6 editorial-title">Fara prea multa cosmetizare a realitatii.</h2>
            <p className="mt-6 editorial-copy">
              Review-urile de pe MERO pun realitatea in fata.
            </p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {compactReviews.map((review) => (
              <FadeIn
                key={review.id}
                className="rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.006))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.18)] sm:p-7"
              >
                <div className="flex gap-1 text-[#d6b98c]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span key={starIndex} className="text-sm">&#9733;</span>
                  ))}
                </div>
                <p className="mt-6 text-base leading-8 text-white/76">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-6">
                  <p className="text-base text-white">{review.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.32em] text-white/40">
                    {review.source}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
