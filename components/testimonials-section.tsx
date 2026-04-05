import { Star } from "lucide-react";

import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";

export function TestimonialsSection({
  items
}: {
  items: { id: string; clientName: string; role: string | null; quote: string; rating?: number }[];
}) {
  return (
    <section className="section-shell py-16 sm:py-24">
      <FadeIn>
        <SectionHeading
          eyebrow="Review-uri"
          title="Feedback real pentru un standard real."
          description="Sectiunea de review-uri aduce social proof direct in homepage, fara layout incarcat si fara elemente false."
        />
      </FadeIn>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <FadeIn key={item.id} className="glass-panel rounded-[1.75rem] p-8">
            <div className="flex gap-1 text-white">
              {Array.from({ length: item.rating || 5 }).map((_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-6 text-xl leading-8 text-white/76">&ldquo;{item.quote}&rdquo;</p>
            <div className="mt-6">
              <p className="text-lg text-white">{item.clientName}</p>
              <p className="text-sm uppercase tracking-[0.32em] text-white/40">{item.role || "Client"}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
