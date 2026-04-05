import { AboutSection } from "@/components/sections/about-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn } from "@/components/motion-shell";
import { PricingSection } from "@/components/pricing-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialsSection } from "@/components/testimonials-section";
import { VideoCard } from "@/components/video-card";
import { featuredReviews } from "@/lib/data";
import { getManagedGalleryItems, getManagedLiveSessions } from "@/lib/site-content";

export default async function HomePage() {
  const [galleryItems, liveSessions] = await Promise.all([
    getManagedGalleryItems(),
    getManagedLiveSessions()
  ]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />

      <section className="section-shell py-16 sm:py-24">
        <FadeIn>
          <SectionHeading
            eyebrow="Galerie"
            title="Rezultate reale, fotografiate din lucrul de zi cu zi."
            description="Galeria foloseste exclusiv imaginile locale din proiect si sustine direct noul look dark, premium si modern."
          />
        </FadeIn>
        <div className="mt-10">
          <GalleryGrid items={galleryItems.slice(0, 6)} />
        </div>
      </section>

      <TestimonialsSection
        items={featuredReviews.map((item) => ({
          id: item.id,
          clientName: item.name,
          role: item.source,
          quote: item.text,
          rating: item.rating
        }))}
      />
      <PricingSection />

      <section className="section-shell py-16 sm:py-24">
        <FadeIn>
          <SectionHeading
            eyebrow="Live"
            title="Continut live pentru barberi care vor context real, nu doar teorie."
            description="Zona live ramane inchisa pentru utilizatorii abonati si este pregatita pentru embed YouTube cu acces controlat."
          />
        </FadeIn>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {liveSessions.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
