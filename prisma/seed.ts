import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.galleryItem.createMany({
    data: [
      {
        title: "Fade Precision",
        category: "Skin Fade",
        imageUrl:
          "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80",
        featured: true
      },
      {
        title: "Editorial Crop",
        category: "Texture",
        imageUrl:
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
      },
      {
        title: "Beard Sculpt",
        category: "Beard",
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
      }
    ],
    skipDuplicates: true
  });

  await prisma.liveSession.createMany({
    data: [
      {
        title: "LIVE Barber Experience",
        slug: "live-barber-experience",
        description: "Sesiune live cu explicatii clare, ritm de lucru si eficienta in salon.",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        durationMinutes: 75,
        thumbnailUrl: "/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40 (1).jpeg",
        streamUrl: "https://live.example.com",
        visibility: "SUBSCRIBERS",
        isFeatured: true
      },
      {
        title: "Fade Breakdown Session",
        slug: "fade-breakdown-session",
        description: "Structura unui fade curat si adaptarea executiei la tipologia clientului.",
        scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        durationMinutes: 60,
        thumbnailUrl: "/assets/salon/WhatsApp Image 2026-04-04 at 18.44.40.jpeg",
        recordingUrl: "https://vod.example.com/fade-breakdown-session.mp4",
        visibility: "ONE_TIME",
        price: 1900
      }
    ],
    skipDuplicates: true
  });

  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "Onisim B.",
        role: "MERO",
        quote: "Recomand cu incredere, top no comment."
      },
      {
        clientName: "Alex C.",
        role: "MERO",
        quote: "Topul de pe lume!"
      }
    ],
    skipDuplicates: true
  });

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      subscriptionPlans: [
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
      ],
      courses: {
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
          details: ["Pret: 3650 RON", "Numar maxim de participanti: 6"]
        },
        advanced: {
          title: "Curs de perfectionare 1 la 1",
          description: "Experienta intensiva de o zi, personalizata in functie de nivelul, ritmul si obiectivele cursantului.",
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
          details: ["Pret: 100 RON / sesiune", "Frecventa: lunar"]
        }
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
