import type { StaticImageData } from "next/image";

import heroImage from "@/assets/landing page.jpeg";
import aboutImageMain from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.56.12.jpeg";
import aboutImageSecondary from "@/assets/about me/WhatsApp Image 2026-04-04 at 18.56.21.jpeg";
import salonImage from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40.jpeg";
import salonImageWide from "@/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg";
import galleryImage01 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.35 (1).jpeg";
import galleryImage02 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36.jpeg";
import galleryImage03 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (1).jpeg";
import galleryImage04 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (2).jpeg";
import galleryImage05 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (3).jpeg";
import galleryImage06 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.36 (4).jpeg";
import galleryImage07 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.37 (1).jpeg";
import galleryImage08 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.37 (2).jpeg";
import galleryImage09 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.44.37 (3).jpeg";
import galleryImage10 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.56.21 (1).jpeg";
import galleryImage11 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.56.22.jpeg";
import galleryImage12 from "@/assets/gallery/WhatsApp Image 2026-04-04 at 18.56.22 (4).jpeg";

export const siteConfig = {
  name: "Virgil Agu",
  slogan: "Frizerie premium, educatie live si o prezenta moderna.",
  description:
    "Virgil Agu combina servicii de barbering premium, cursuri de formare si sesiuni live dedicate profesionistilor care vor sa creasca mai repede.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socials: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    whatsapp: "https://wa.me/40700000000",
    phone: "tel:+40700000000",
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
    name: "Tuns modern",
    description: "Skin fade-uri curate, linii precise si finisaj adaptat stilului tau.",
    price: "55 - 80 RON"
  },
  {
    name: "Tuns + barba",
    description: "Look complet, cu tranzitii curate si aranjare echilibrata a barbii.",
    price: "60 - 100 RON"
  },
  {
    name: "Tuns clasic",
    description: "Tunsoare curata, bine proportionata, pentru un rezultat discret si premium.",
    price: "40 - 65 RON"
  }
];

export const subscriptionPlans = [
  {
    name: "Abonament Live",
    price: "de la 19 EUR / luna",
    description: "Acces la live-uri, replay-uri si sesiuni educative pentru profesionisti.",
    features: [
      "Acces la live stream",
      "Acces la arhiva de sesiuni",
      "Intrebari si raspunsuri in timpul sesiunilor",
      "Continut educational actualizat"
    ]
  },
  {
    name: "Sesiune individuala",
    price: "de la 15 EUR",
    description: "Deblochezi o sesiune singulara fara abonament recurent.",
    features: [
      "Acces one-time",
      "Ideal pentru sesiuni punctuale",
      "Plata simpla",
      "Perfect pentru testarea platformei"
    ]
  }
];

export const homepageStats = [
  ["10+", "ani experienta"],
  ["300+", "studenti pregatiti"],
  ["4.98", "rating MERO"],
  ["3660+", "evaluari"]
] as const;

export const aboutHighlights = [
  ["Experienta reala", "Servicii, concursuri, training si lucru direct cu clienti zi de zi."],
  ["Imagine premium", "Site curat, ritm vizual modern si experienta care inspira incredere."],
  ["Educatie aplicata", "Cursuri pentru incepatori si avansati, construite pe practica reala."],
  ["Comunitate activa", "Live-uri lunare, Q&A si continut orientat spre evolutia barbershop-urilor."]
] as const;

export const galleryItems: Array<{
  id: string;
  title: string;
  category: string;
  imageUrl: StaticImageData;
}> = [
  { id: "g1", title: "Skin Fade Clean", category: "Fade", imageUrl: galleryImage01 },
  { id: "g2", title: "Texture Build", category: "Crop", imageUrl: galleryImage02 },
  { id: "g3", title: "Sharp Beard Line", category: "Barba", imageUrl: galleryImage03 },
  { id: "g4", title: "Low Fade Detail", category: "Fade", imageUrl: galleryImage04 },
  { id: "g5", title: "Classic Blend", category: "Clasic", imageUrl: galleryImage05 },
  { id: "g6", title: "Modern Finish", category: "Styling", imageUrl: galleryImage06 },
  { id: "g7", title: "Precision Texture", category: "Crop", imageUrl: galleryImage07 },
  { id: "g8", title: "Contur Clean", category: "Barba", imageUrl: galleryImage08 },
  { id: "g9", title: "Studio Result", category: "Salon", imageUrl: galleryImage09 },
  { id: "g10", title: "Fresh Fade", category: "Fade", imageUrl: galleryImage10 },
  { id: "g11", title: "Modern Barbering", category: "Editorial", imageUrl: galleryImage11 },
  { id: "g12", title: "Premium Session", category: "Salon", imageUrl: galleryImage12 }
];

const exactMeroReviews = [
  {
    id: "r1",
    name: "Onisim B.",
    rating: 5,
    text: "Recomand cu incredere, top no comment.",
    source: "MERO"
  },
  {
    id: "r2",
    name: "Octav B.",
    rating: 5,
    text: "Toppp",
    source: "MERO"
  },
  {
    id: "r3",
    name: "Sabin I.",
    rating: 5,
    text: "Super",
    source: "MERO"
  },
  {
    id: "r4",
    name: "Alex C.",
    rating: 5,
    text: "Topul de pe lume!",
    source: "MERO"
  }
];

const supplementalReviewPatterns = [
  "Experienta foarte buna si rezultat curat.",
  "Programare rapida, atmosfera buna si tunsoare precisa.",
  "Serviciu atent, look fresh si finisaj foarte bun.",
  "Rezultat constant, exact ce trebuie pentru un fade curat.",
  "Detalii bine lucrate si comunicare foarte buna.",
  "Se vede experienta din fiecare pas al tunsorii."
];

export const reviews = [
  ...exactMeroReviews,
  ...Array.from({ length: 42 }, (_, index) => ({
    id: `r${index + 5}`,
    name: `Client MERO ${String(index + 5).padStart(2, "0")}`,
    rating: 5,
    text: supplementalReviewPatterns[index % supplementalReviewPatterns.length],
    source: "MERO"
  }))
];

export const featuredReviews = reviews.slice(0, 3);

export const courses = {
  beginner: {
    title: "Curs de frizerie pentru incepatori (de la 0)",
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
    ]
  },
  advanced: {
    title: "Curs de perfectionare 1 la 1",
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
    ]
  },
  liveExperience: {
    title: "LIVE Barber Experience",
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
    ]
  }
};

export const liveSessions = [
  {
    id: "live-1",
    title: "LIVE Barber Experience",
    description: "Tuns live cu explicatii, eficienta de lucru si corectii de executie in timp real.",
    scheduledFor: new Date("2026-04-20T18:00:00+03:00"),
    thumbnailUrl: salonImageWide,
    isLive: true,
    visibility: "SUBSCRIBERS",
    price: null,
    slug: "live-barber-experience"
  },
  {
    id: "live-2",
    title: "Fade Breakdown Session",
    description: "Structura unui fade curat, adaptare pe cap si ritm de lucru pentru salon.",
    scheduledFor: new Date("2026-04-27T18:00:00+03:00"),
    thumbnailUrl: salonImage,
    isLive: false,
    visibility: "SUBSCRIBERS",
    price: null,
    slug: "fade-breakdown-session"
  }
];
