import { prisma } from "@/lib/prisma";

import { AboutSection } from "@/components/sections/about-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn } from "@/components/motion-shell";
import { PricingSection } from "@/components/pricing-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialsSection } from "@/components/testimonials-section";
import { VideoCard } from "@/components/video-card";

const galleryFallback = [
  {
    id: "1",
    title: "Noir Fade",
    category: "Skin Fade",
    imageUrl: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "2",
    title: "Texture Study",
    category: "Crop",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "3",
    title: "Beard Finish",
    category: "Beard",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
  }
];

const testimonialFallback = [
  {
    id: "1",
    clientName: "Alex V.",
    role: "Creative Director",
    quote: "Sharpest fades in the city. The entire experience feels closer to a private luxury service."
  },
  {
    id: "2",
    clientName: "Matei P.",
    role: "Founder",
    quote: "The branding, flow, and service quality are all aligned. Nothing feels generic."
  }
];

const liveFallback = [
  {
    id: "1",
    title: "Luxury Fade Workflow",
    description: "Consultation, sectioning, taper transitions, and final detailing.",
    scheduledFor: new Date(),
    thumbnailUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80",
    isLive: true,
    visibility: "SUBSCRIBERS",
    price: null,
    slug: "luxury-fade-workflow"
  }
];

async function getHomepageData() {
  try {
    const [gallery, testimonials, lives] = await Promise.all([
      prisma.galleryItem.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.testimonial.findMany({ take: 2, orderBy: { createdAt: "desc" } }),
      prisma.liveSession.findMany({ take: 2, orderBy: { scheduledFor: "asc" } })
    ]);

    return {
      gallery: gallery.length ? gallery : galleryFallback,
      testimonials: testimonials.length ? testimonials : testimonialFallback,
      lives: lives.length ? lives : liveFallback
    };
  } catch {
    return {
      gallery: galleryFallback,
      testimonials: testimonialFallback,
      lives: liveFallback
    };
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />

      <section className="section-shell py-16 sm:py-24">
        <FadeIn>
          <SectionHeading
            eyebrow="Gallery"
            title="A portfolio built to feel editorial."
            description="Before-and-after craftsmanship, texture, precision, and polished finishing captured in a cinematic grid."
          />
        </FadeIn>
        <div className="mt-10">
          <GalleryGrid items={data.gallery} />
        </div>
      </section>

      <TestimonialsSection items={data.testimonials} />
      <PricingSection />

      <section className="section-shell py-16 sm:py-24">
        <FadeIn>
          <SectionHeading
            eyebrow="Live"
            title="Subscriber-led education and behind-the-chair sessions."
            description="Monetize real-time expertise with premium streams, recordings, and individual paid access."
          />
        </FadeIn>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {data.lives.map((item: (typeof data.lives)[number]) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
