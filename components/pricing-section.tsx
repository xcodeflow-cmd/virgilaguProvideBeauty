import Link from "next/link";

import { subscriptionPlans } from "@/lib/data";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section className="section-shell py-16 sm:py-24">
      <FadeIn>
        <SectionHeading
          eyebrow="Membership"
          title="Premium access for education, streams, and archive content."
          description="Use subscription for full access or unlock one masterclass at a time with one-off payments."
          align="center"
        />
      </FadeIn>
      <Stagger className="mt-10 grid gap-6 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <StaggerItem key={plan.name}>
            <article className="glass-panel gold-ring h-full rounded-[2rem] p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-gold-light/85">{plan.name}</p>
              <h3 className="mt-4 text-4xl text-white">{plan.price}</h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/60">{plan.description}</p>
              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-white/72">
                    <span className="h-2 w-2 rounded-full bg-gold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8">
                <Link href="/live">Explore Access</Link>
              </Button>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
