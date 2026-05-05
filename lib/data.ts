import type { StaticImageData } from "next/image";

import heroImage from "@/assets/landing page.jpg";
import aboutImageAward01 from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.44.35.jpeg";
import aboutImageAward02 from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.44.38 (1).jpeg";
import aboutImageAward03 from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.44.38 (2).jpeg";
import aboutImageMain from "@/assets/about me/premii.jpeg";
import aboutImageSecondary from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.56.21.jpeg";
import salonImage from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40.jpeg";
import salonImageWide from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg";
import galleryImage01 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.35 (1).jpeg";
import galleryImage02 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36.jpeg";
import galleryImage03 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (1).jpeg";

export const siteConfig = {
  name: "Virgil Agu",
  slogan: "Cursuri de frizerie, LIVE-uri si executie premium.",
  description:
    "Virgil Agu organizeaza cursuri de frizerie pentru incepatori, perfectionare 1 la 1 si sesiuni LIVE, bazate pe peste 10 ani de experienta si sute de cursanti formati.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socials: {
    instagram: "https://www.instagram.com/virgil.agu/",
    tiktok: "https://www.tiktok.com/@virgilagu",
    facebook: "https://www.facebook.com/share/1BQsCYciX5/",
    whatsapp: "https://wa.me/40785571176",
    phone: "tel:+40785571176",
    mero: "https://mero.ro/p/provide-beauty"
  }
};

export const brandImages = {
  hero: heroImage,
  aboutMain: aboutImageMain,
  aboutSecondary: aboutImageSecondary,
  salon: salonImage,
  salonWide: salonImageWide
};

export const services = [
  {
    name: "Curs Incepatori",
    description: "Curs fizic de la 0, organizat impreuna cu Scoala Comerciala si de Servicii Bacau.",
    price: "3650 RON"
  },
  {
    name: "Perfectionare 1 la 1",
    description: "Experienta intensiva cu 2 modele reale, corectii in timp real si lucru direct alaturi de Virgil Agu.",
    price: "Format fizic"
  },
  {
    name: "LIVE Barber Experience",
    description: "Sesiuni lunare LIVE cu explicatii pas cu pas, tehnici reale si context clar de salon.",
    price: "100 RON / sesiune"
  }
];

export const subscriptionPlans = [
  {
    name: "Live individual",
    price: "50 RON / sesiune",
    description: "Platesti doar sesiunea live sau replay-ul pe care vrei sa il vezi, fara acces global la toate live-urile.",
    features: [
      "Acces la live-ul ales",
      "Replay salvat automat dupa sesiune",
      "Chat activ pentru sesiunea cumparata",
      "Plata punctuala, fara recurenta"
    ]
  },
  {
    name: "Cursuri premium",
    price: "pret fix / curs",
    description: "Cursurile si trainingurile raman separate de live-uri si se achizitioneaza individual, in functie de programul ales.",
    features: [
      "Curs incepatori",
      "Perfectionare 1 la 1",
      "Checkout separat pentru fiecare program",
      "Acces clar, fara pachete amestecate"
    ]
  }
];

export const homepageStats = [
  ["10+", "ani experienta"],
  ["4.98", "rating MERO"],
  ["300+", "cursanti formati"],
  ["2x", "master barber romania"]
] as const;

export const aboutHighlights = [
  ["Experienta reala", "Peste 10 ani in domeniu, zeci de seminarii si workshopuri, atat ca trainer, cat si ca participant."],
  ["Cursuri fizice", "Atat cursul de incepatori, cat si perfectionarea 1 la 1 sunt construite practic, cu modele reale."],
  ["Palmares", "Fast Fade Dublin, Master Barber Romania doi ani consecutiv si multe alte clasari de top."],
  ["Progres clar", "Accent pe executie, ritm de lucru, claritate in explicatii si rezultate care pot fi aplicate imediat in salon."]
] as const;

export const galleryItems: Array<{
  id: string;
  title: string;
  category: string;
  imageUrl: StaticImageData;
}> = [
  { id: "g1", title: "Fast Fade Dublin", category: "Premii", imageUrl: galleryImage01 },
  { id: "g2", title: "Master Barber Romania", category: "Premii", imageUrl: galleryImage02 },
  { id: "g3", title: "Fade curat", category: "Galerie", imageUrl: galleryImage03 },
  { id: "g4", title: "Blend precis", category: "Galerie", imageUrl: galleryImage01 },
  { id: "g5", title: "Rezultat premium", category: "Galerie", imageUrl: galleryImage02 },
  { id: "g6", title: "Styling modern", category: "Galerie", imageUrl: galleryImage03 }
];

const exactMeroReviews = [
  {
    id: "r1",
    name: "Onisim B.",
    rating: 5,
    text: "Recomand cu incredere. Curat, rapid si foarte atent la detalii.",
    source: "MERO"
  },
  {
    id: "r2",
    name: "Octav B.",
    rating: 5,
    text: "Atmosfera buna si rezultat foarte clean de fiecare data.",
    source: "MERO"
  },
  {
    id: "r3",
    name: "Sabin I.",
    rating: 5,
    text: "Programare usoara, executie precisa si look final premium.",
    source: "MERO"
  },
  {
    id: "r4",
    name: "Alex C.",
    rating: 5,
    text: "Unul dintre cele mai bune servicii de barbering pe care le-am avut.",
    source: "MERO"
  }
];

export const reviews = exactMeroReviews;

export const featuredReviews = reviews.slice(0, 3);
export const compactReviews = reviews.slice(0, 3);
export const homeGalleryPreview = galleryItems.slice(0, 4);
export const aboutMeGallery = [
  { id: "a1", title: "Award Moment", category: "Premii", imageUrl: aboutImageAward01 },
  { id: "a2", title: "Stage Presence", category: "Scena", imageUrl: aboutImageAward02 },
  { id: "a3", title: "Competition Energy", category: "Competition", imageUrl: aboutImageAward03 }
];
export const aboutMeAchievements = [
  "Master Barber Romania, 2 ani la rand",
  "Fast Fade Dublin",
  "Peste 300 de studenti pregatiti",
  "Peste 10 ani experienta"
] as const;

export const courses = {
  beginner: {
    title: "Curs de frizerie pentru incepatori (de la 0)",
    shortDescription:
      "Format dedicat celor care vor sa intre corect in industrie, cu baza clara, ritm de lucru si suport practic real.",
    dialogBody:
      "Cursul pentru incepatori este construit flexibil, in functie de dinamica grupei si de nivelul real al cursantilor. Obiectivul este sa pleci cu o baza functionala, cu ritm de lucru, control pe unelte si o intelegere clara a modului in care construiesti o tunsoare curata de la zero.",
    imageUrl: "",
    externalLinkLabel: "Detalii complete curs",
    externalLinkUrl: "https://scoalacomerciala.ro/cursuri/cursuri-beauty/cursfrizer-roman/",
    description: [
      "Organizat cu Scoala Comerciala si de Servicii Bacau",
      "Trainer: Virgil Agu",
      "Peste 10 ani experienta",
      "Peste 300 de studenti pregatiti"
    ],
    achievements: [
      "Fast Fade Dublin",
      "Master Barber Romania, 2 ani la rand",
      "Alte clasari de top in industrie"
    ],
    details: [
      "Pret: 3650 RON",
      "Numar maxim de participanti: 6"
    ],
    pricing: {
      priceValue: 3650,
      compareAtPriceValue: null
    }
  },
  advanced: {
    title: "Curs de perfectionare 1 la 1",
    shortDescription:
      "Experienta intensiva alaturi de Virgil Agu, cu practica directa, corectii in timp real si focus complet pe progres.",
    dialogBody:
      "Provibe, alaturi de fondatorul Virgil Agu, organizeaza cursuri de perfectionare dedicate frizerilor care vor sa treaca la urmatorul nivel. Acest curs este conceput in format 1 la 1, oferindu-ti atentie completa si ghidare personalizata pe tot parcursul zilei.",
    imageUrl: "",
    externalLinkLabel: "",
    externalLinkUrl: "",
    description:
      "Experienta intensiva de o zi, personalizata in functie de nivelul, ritmul si obiectivele cursantului.",
    includes: [
      "1 zi completa de training",
      "2 modele reale",
      "Explicatie pas cu pas",
      "Practica hands-on",
      "Corectii in timp real",
      "Tips & tricks din peste 10 ani experienta"
    ],
    outcomes: [
      "Clean fades",
      "Adaptare la forma fetei",
      "Tehnici moderne de tuns",
      "Controlul sculelor"
    ],
    pricing: {
      priceValue: 1000,
      compareAtPriceValue: null
    }
  },
  liveExperience: {
    title: "LIVE Barber Experience",
    shortDescription:
      "Inveti in timp real alaturi de Virgil Agu, urmarind clienti reali, explicatii clare si ritm autentic de salon.",
    dialogBody:
      "In fiecare luna, Virgil intra LIVE si tunde clienti reali, explicand pas cu pas fiecare miscare, fiecare tehnica si fiecare detaliu care face diferenta dintre un frizer obisnuit si unul de top.",
    imageUrl: "",
    externalLinkLabel: "",
    externalLinkUrl: "",
    description: "Sesiuni lunare de tuns live, cu explicatii clare si context real de salon.",
    includes: [
      "Tunsori in timp real",
      "Explicatii step-by-step",
      "Q&A in timpul stream-ului",
      "Trenduri din industrie",
      "Tehnici de eficienta"
    ],
    outcomes: [
      "Optimizarea vitezei",
      "Tehnici de precizie",
      "Mindset profesionist"
    ],
    details: [
      "Pret: 100 RON / sesiune",
      "Frecventa: lunar"
    ],
    pricing: {
      priceValue: 100,
      compareAtPriceValue: null
    }
  }
};

export const sitePages = {
  about: {
    title: "Despre noi",
    intro:
      "Provibe este construit in jurul executiei reale, al disciplinei si al educatiei care ramane utila dupa ce se termina cursul sau live-ul.",
    body: [
      "In spatele platformei sta experienta acumulata de Virgil Agu in ani de lucru constant, competitii, workshopuri si sute de interactiuni directe cu oameni care vor rezultate clare, nu informatie cosmetizata. Standardul pe care il vezi in pagina vine din salon, din ore reale de munca si din dorinta de a face educatia usor de aplicat imediat.",
      "Cursurile sunt gandite practic, cu accent pe control, ritm, claritate in explicatii si adaptare la nivelul celui care invata. Nu urmarim sa incarcam pagina cu promisiuni goale, ci sa aratam exact directia: ce primesti, cum evoluezi si unde poti ajunge daca aplici corect.",
      "Live-urile si replay-urile completeaza partea fizica a trainingului. Ele sunt gandite pentru cei care vor sa revada tehnica, sa urmareasca executia in ritm real si sa poata intra oricand inapoi in materialul pe care l-au cumparat. Totul este construit astfel incat experienta sa ramana clara, coerenta si utila pe termen lung."
    ],
    images: [] as string[]
  }
};

export const liveSessions = [
  {
    id: "live-1",
    title: "LIVE Barber Experience",
    description: "Tuns live cu explicatii, eficienta de lucru si corectii de executie in timp real.",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 2),
    isLive: true,
    visibility: "ONE_TIME",
    price: 50,
    slug: "live-barber-experience"
  },
  {
    id: "live-2",
    title: "Replay Test",
    description: "Replay salvat automat pentru verificarea fluxului de achizitie individuala.",
    scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isLive: false,
    visibility: "ONE_TIME",
    price: 50,
    slug: "replay-test"
  }
];
