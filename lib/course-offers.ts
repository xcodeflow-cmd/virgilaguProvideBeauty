import type { StaticImageData } from "next/image";

import courseImage01 from "@/assets/about me/curs1.jpeg";
import courseImage02 from "@/assets/about me/curs2.jpeg";
import courseImage03 from "@/assets/about me/curs3.jpeg";
import { courses as defaultCourses, siteConfig } from "@/lib/data";
import { formatLei } from "@/lib/utils";

type CoursePricingKey = "beginner" | "advanced" | "liveExperience";

export type CourseOffer = {
  id: string;
  pricingKey: CoursePricingKey;
  label: string;
  title: string;
  shortTitle: string;
  price: string;
  priceValue: number;
  compareAtPrice: string | null;
  compareAtPriceValue: number | null;
  priceSuffix?: string;
  note: string;
  image: StaticImageData;
  imageUrl?: string | null;
  description: string;
  dialogBody: string;
  externalLinkLabel?: string;
  externalLinkUrl?: string;
  includeTitle?: string;
  include?: string[];
  learnTitle?: string;
  learn?: string[];
  advantage?: string;
  purchaseLabel: string;
  inquiryLabel?: string;
  inquiryHref?: string;
  cardHref?: string;
  cardTarget?: "_blank" | "_self";
  cardActionLabel?: string;
  hidePriceInCard?: boolean;
  purchaseDisabled?: boolean;
};

type BaseCourseOffer = Omit<CourseOffer, "price" | "priceValue" | "compareAtPrice" | "compareAtPriceValue"> & {
  defaultPriceValue: number;
};

type CoursePricingOverride = {
  priceValue?: number | null;
  compareAtPriceValue?: number | null;
};

export type CoursePricingMap = Record<CoursePricingKey, {
  priceValue: number;
  compareAtPriceValue: number | null;
}>;

const baseCourseOffers: BaseCourseOffer[] = [
  {
    id: "beginner-freestyle",
    pricingKey: "beginner",
    label: "Incepatori",
    title: "Curs de frizerie pentru incepatori",
    shortTitle: "De la 0",
    defaultPriceValue: 3650,
    note: "max 6 cursanti",
    image: courseImage01,
    description:
      "Format dedicat celor care vor sa intre corect in industrie, fara structuri sterile si fara informatie livrata mecanic.",
    dialogBody:
      "Cursul pentru incepatori este construit flexibil, in functie de dinamica grupei si de nivelul real al cursantilor. Obiectivul este sa pleci cu o baza functionala, cu ritm de lucru, control pe unelte si o intelegere clara a modului in care construiesti o tunsoare curata de la zero.",
    includeTitle: "Structura zilelor",
    include: [
      "Fundamente de lucru explicate clar, fara informatie decorativa",
      "Demonstratii si practica aplicata pe parcursul cursului",
      "Corectii directe pe executie, postura si control",
      "Focus pe formarea unui stil de lucru disciplinat"
    ],
    learnTitle: "Directia de progres",
    learn: [
      "Baza pentru tuns, styling si finisaj",
      "Citirea formei si impartirea corecta a sectiunilor",
      "Primele fade-uri curate si primele tranzitii controlate",
      "Ritmul de lucru care te scoate din faza de incepator nesigur"
    ],
    purchaseLabel: "Achizitioneaza cursul",
    inquiryLabel: "Cere informatii despre curs",
    inquiryHref: siteConfig.socials.whatsapp,
    cardHref: defaultCourses.beginner.externalLinkUrl,
    cardTarget: "_blank",
    cardActionLabel: "Vezi cursul",
    purchaseDisabled: true
  },
  {
    id: "advanced-one-to-one",
    pricingKey: "advanced",
    label: "Perfectionare",
    title: "Curs de perfectionare 1 la 1",
    shortTitle: "1 la 1",
    defaultPriceValue: 1000,
    priceSuffix: "/ zi",
    note: "1 zi intensiva",
    image: courseImage02,
    description:
      "Experienta intensiva alaturi de Virgil Agu, cu 2 modele reale, practica impreuna si corectare in timp real.",
    dialogBody:
      "Provibe, alaturi de fondatorul Virgil Agu, organizeaza cursuri de perfectionare dedicate frizerilor care vor sa treaca la urmatorul nivel. Acest curs este conceput in format 1 la 1, oferindu-ti atentie completa si ghidare personalizata pe tot parcursul zilei.",
    includeTitle: "Ce include cursul",
    include: [
      "1 zi intensiva de lucru direct cu Virgil Agu",
      "2 modele reale",
      "Tehnici explicate pas cu pas",
      "Practica realizata impreuna cu cursantul",
      "Corectarea fiecarui detaliu in timp real",
      "Tips & tricks din experienta de peste 10 ani"
    ],
    learnTitle: "Ce vei invata",
    learn: [
      "Fade-uri curate si tranzitii perfecte",
      "Forme corecte adaptate fiecarui tip de fata",
      "Tehnici moderne de tuns si styling",
      "Controlul uneltelor si eficienta in lucru",
      "Secrete din competitii si din salon"
    ],
    advantage:
      "Ai acces la informatie nelimitata, intr-un cadru dedicat exclusiv tie, unde poti intreba si aprofunda orice detaliu.",
    purchaseLabel: "Rezerva ziua de curs",
    inquiryLabel: "Cere informatii despre curs",
    inquiryHref: siteConfig.socials.whatsapp
  },
  {
    id: "live-barber-experience",
    pricingKey: "liveExperience",
    label: "LIVE",
    title: "LIVE Barber Experience",
    shortTitle: "Lunar",
    defaultPriceValue: 100,
    priceSuffix: "/ sesiune LIVE",
    note: "sesiune lunara",
    image: courseImage03,
    description:
      "Inveti in timp real alaturi de Virgil Agu, urmarind clienti reali, explicatii clare si ritm real de salon.",
    dialogBody:
      "In fiecare luna, Virgil intra LIVE si tunde clienti reali, explicand pas cu pas fiecare miscare, fiecare tehnica si fiecare detaliu care face diferenta dintre un frizer obisnuit si unul de top.",
    includeTitle: "Ce primesti in LIVE",
    include: [
      "Tunsori realizate in timp real pe modele reale",
      "Explicatii detaliate, pas cu pas",
      "Tehnici actuale si trenduri din industrie",
      "Acces direct la intrebari si raspunsuri pe parcursul live-ului",
      "Sfaturi din experienta de peste 10 ani in domeniu"
    ],
    learnTitle: "Ce vei invata concret",
    learn: [
      "Cum sa elimini timpii morti si sa lucrezi eficient",
      "Cum sa iti adaptezi tehnica astfel incat sa fii rapid, dar si precis",
      "Cum sa sari peste anumiti pasi, fara sa pierzi din calitate",
      "Cum sa iti cresti increderea si sa alungi nesiguranta",
      "Cum sa lucrezi cu mentalitate de profesionist, indiferent de nivel"
    ],
    advantage:
      "Poti invata din confortul casei tale, fara presiune, urmarind exact cum se construieste o tunsoare corecta, de la zero pana la final.",
    purchaseLabel: "Cumpara accesul LIVE",
    cardActionLabel: "Vezi live"
  }
];

export const palmaresHighlights = [
  "Fast Fade Dublin",
  "Master Barber Romania, 2 ani consecutiv",
  "Multiple premii internationale"
] as const;

export const palmaresDetails = [
  "Peste 300 de cursanti formati in lucru real, nu in teorie decorativa.",
  "Participari constante la seminarii, workshopuri si competitii din tara si din afara.",
  "Experienta de peste 10 ani convertita in disciplina, control si standard ridicat in executie.",
  "Rezultate construite prin consistenta, nu prin imagine cosmetizata."
] as const;

function buildPriceLabel(priceValue: number, suffix?: string) {
  return suffix ? `${formatLei(priceValue)} ${suffix}` : formatLei(priceValue);
}

export function getCoursePricingMap(coursesContent?: typeof defaultCourses): CoursePricingMap {
  return {
    beginner: {
      priceValue: coursesContent?.beginner?.pricing?.priceValue ?? defaultCourses.beginner.pricing.priceValue,
      compareAtPriceValue: coursesContent?.beginner?.pricing?.compareAtPriceValue ?? defaultCourses.beginner.pricing.compareAtPriceValue
    },
    advanced: {
      priceValue: coursesContent?.advanced?.pricing?.priceValue ?? defaultCourses.advanced.pricing.priceValue,
      compareAtPriceValue: coursesContent?.advanced?.pricing?.compareAtPriceValue ?? defaultCourses.advanced.pricing.compareAtPriceValue
    },
    liveExperience: {
      priceValue: coursesContent?.liveExperience?.pricing?.priceValue ?? defaultCourses.liveExperience.pricing.priceValue,
      compareAtPriceValue: coursesContent?.liveExperience?.pricing?.compareAtPriceValue ?? defaultCourses.liveExperience.pricing.compareAtPriceValue
    }
  };
}

export function getManagedCourseOffers(coursesContent?: typeof defaultCourses) {
  const pricingMap = getCoursePricingMap(coursesContent);

  return baseCourseOffers.map((course) => {
    const override = pricingMap[course.pricingKey] as CoursePricingOverride;
    const priceValue = override.priceValue && override.priceValue > 0 ? override.priceValue : course.defaultPriceValue;
    const compareAtPriceValue =
      override.compareAtPriceValue && override.compareAtPriceValue > priceValue ? override.compareAtPriceValue : null;

    return {
      ...course,
      title: coursesContent?.[course.pricingKey]?.title || course.title,
      description: coursesContent?.[course.pricingKey]?.shortDescription || course.description,
      dialogBody: coursesContent?.[course.pricingKey]?.dialogBody || course.dialogBody,
      imageUrl: coursesContent?.[course.pricingKey]?.imageUrl || null,
      externalLinkLabel: coursesContent?.[course.pricingKey]?.externalLinkLabel || undefined,
      externalLinkUrl: coursesContent?.[course.pricingKey]?.externalLinkUrl || undefined,
      cardHref:
        course.pricingKey === "beginner"
          ? coursesContent?.beginner?.externalLinkUrl || course.cardHref
          : course.cardHref,
      priceValue,
      compareAtPriceValue,
      price: buildPriceLabel(priceValue, course.priceSuffix),
      compareAtPrice: compareAtPriceValue ? buildPriceLabel(compareAtPriceValue, course.priceSuffix) : null
    };
  });
}

export const courseOffers: CourseOffer[] = getManagedCourseOffers();

export function getCourseCheckoutHref(courseId: string) {
  return `/checkout?mode=payment&courseId=${courseId}`;
}

export function findCourseOfferById(courseId: string, coursesContent?: typeof defaultCourses) {
  return getManagedCourseOffers(coursesContent).find((course) => course.id === courseId) || null;
}
