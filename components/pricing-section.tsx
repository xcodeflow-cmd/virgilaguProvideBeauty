"use client";

import Link from "next/link";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@/lib/data";

export function PricingSection() {
  return (
    <section className="section-shell section-space">
      <FadeIn>
        <SectionHeading
          eyebrow="Acces"
          title="Formate clare pentru invatare practica si progres real."
          description="Poti urmari sesiunile LIVE, poti intra in cursurile de incepatori sau poti alege perfectionarea 1 la 1 pentru lucru intensiv."
          align="center"
        />
      </FadeIn>
      <Stagger className="mt-10 grid gap-6 lg:grid-cols-2">
        {subscriptionPlans.map((plan) => (
          <StaggerItem key={plan.name}>
            <article className="premium-card h-full p-8">
              <p className="text-xs uppercase tracking-[0.4em] text-accent/[0.85]">{plan.name}</p>
              {!/live/i.test(plan.name) ? <h3 className="mt-4 text-4xl text-white">{plan.price}</h3> : null}
              <p className="mt-4 max-w-lg text-base leading-7 text-white/60">{plan.description}</p>
              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-white/[0.72]">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8">
                <Link href="/live">Vezi sesiunea LIVE</Link>
              </Button>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}


