import Link from "next/link";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-content";

export async function PricingSection() {
  const { subscriptionPlans } = await getSiteSettings();

  return (
    <section className="section-shell py-16 sm:py-24">
      <FadeIn>
        <SectionHeading
          eyebrow="Abonamente"
          title="Acces simplu pentru live-uri si continut educational."
          description="Abonamentul ramane fluxul principal pentru zona de live, iar sesiunea individuala acopera accesul punctual."
          align="center"
        />
      </FadeIn>
      <Stagger className="mt-10 grid gap-6 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <StaggerItem key={plan.name}>
            <article className="glass-panel h-full rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-accent/85">{plan.name}</p>
              <h3 className="mt-4 text-4xl text-white">{plan.price}</h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/60">{plan.description}</p>
              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-white/72">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8">
                <Link href="/live">Vezi accesul live</Link>
              </Button>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
