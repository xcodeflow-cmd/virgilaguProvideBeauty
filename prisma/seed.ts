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
        title: "Luxury Fade Workflow",
        slug: "luxury-fade-workflow",
        description: "A full breakdown of consultation, sectioning, clipper control, and finishing.",
        scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        durationMinutes: 75,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
        visibility: "SUBSCRIBERS",
        isFeatured: true
      },
      {
        title: "Textured Crop Masterclass",
        slug: "textured-crop-masterclass",
        description: "A precision-focused session for modern crop silhouettes and styling finish.",
        scheduledFor: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        durationMinutes: 60,
        thumbnailUrl:
          "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
        recordingUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        visibility: "ONE_TIME",
        price: 1900
      }
    ],
    skipDuplicates: true
  });

  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "Alex V.",
        role: "Creative Director",
        quote: "Sharpest fades in the city. The experience feels closer to private tailoring than a typical barbershop."
      },
      {
        clientName: "Matei P.",
        role: "Founder",
        quote: "Consistent, polished, and premium from the booking flow to the final finish."
      }
    ],
    skipDuplicates: true
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
