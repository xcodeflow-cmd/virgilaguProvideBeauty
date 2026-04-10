import type { StaticImageData } from "next/image";

import courseImage01 from "@/assets/about me/curs1.jpeg";
import courseImage02 from "@/assets/about me/curs2.jpeg";
import courseImage03 from "@/assets/about me/curs3.jpeg";

export type CourseOffer = {
  id: string;
  label: string;
  title: string;
  shortTitle: string;
  price: string;
  priceValue: number;
  note: string;
  image: StaticImageData;
  description: string;
  dialogBody: string;
  includeTitle?: string;
  include?: string[];
  learnTitle?: string;
  learn?: string[];
  advantage?: string;
  purchaseLabel: string;
};

export const courseOffers: CourseOffer[] = [
  {
    id: "beginner-freestyle",
    label: "Incepatori",
    title: "Curs de frizerie pentru incepatori",
    shortTitle: "De la 0",
    price: "3650 lei",
    priceValue: 365000,
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
    purchaseLabel: "Achizitioneaza cursul"
  },
  {
    id: "advanced-one-to-one",
    label: "Perfectionare",
    title: "Curs de perfectionare 1 la 1",
    shortTitle: "1 la 1",
    price: "1000 lei / zi",
    priceValue: 100000,
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
    purchaseLabel: "Rezerva ziua de curs"
  },
  {
    id: "live-barber-experience",
    label: "LIVE",
    title: "LIVE Barber Experience",
    shortTitle: "Lunar",
    price: "100 lei / sesiune LIVE",
    priceValue: 10000,
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
    purchaseLabel: "Cumpara accesul LIVE"
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

export function getCourseCheckoutHref(courseId: string) {
  return `/api/stripe/checkout?mode=payment&courseId=${courseId}`;
}
