import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AuthStatusCard({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="glass-panel w-full max-w-[34rem] rounded-[2rem] p-5 sm:rounded-[2.2rem] sm:p-8 lg:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-accent/80">{eyebrow}</p>
      <h1 className="mt-3 max-w-md text-4xl leading-[0.9] text-white sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/60 sm:text-base sm:leading-8">{description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild variant="secondary">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
