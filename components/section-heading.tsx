import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "text-center")}>
      <p className="text-xs uppercase tracking-[0.5em] text-gold-light/80">{eyebrow}</p>
      <h2 className="text-4xl leading-none text-white md:text-5xl">{title}</h2>
      <p className={cn("max-w-2xl text-base leading-7 text-white/62", align === "center" && "mx-auto")}>
        {description}
      </p>
    </div>
  );
}
