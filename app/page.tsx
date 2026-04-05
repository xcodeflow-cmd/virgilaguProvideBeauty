import { AboutMeSection } from "@/components/sections/about-me-section";
import { AboutSection } from "@/components/sections/about-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { GalleryGrid } from "@/components/gallery-grid";
import { FadeIn } from "@/components/motion-shell";
import { PricingSection } from "@/components/pricing-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialsSection } from "@/components/testimonials-section";
import { VideoCard } from "@/components/video-card";
import { compactReviews, homeGalleryPreview } from "@/lib/data";
import { getManagedLiveSessions } from "@/lib/site-content";

export default async function HomePage() {
  const liveSessions = await getManagedLiveSessions();

  return (
    <>
      <HeroSection />
      <AboutSection />
      <AboutMeSection />
      <ServicesSection />

      <section className="section-shell py-16 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <FadeIn className="glass-panel rounded-[2rem] p-8 sm:p-10">
            <SectionHeading
              eyebrow="Galerie"
              title="In home raman doar cateva cadre bune."
              description="Preview-ul de pe landing page a fost redus la cateva imagini din assets, ca sa ramana aerisit si aliniat cu restul sectiunilor."
            />
          </FadeIn>
          <div className="mt-0">
            <GalleryGrid items={homeGalleryPreview} />
          </div>
        </div>
      </section>

      <TestimonialsSection
        items={compactReviews.map((item) => ({
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
