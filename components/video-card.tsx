import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { Lock, Radio, Video } from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function VideoCard({
  item,
  canAccess = false
}: {
  item: {
    id: string;
    title: string;
    description: string;
    scheduledFor: Date;
    thumbnailUrl: string | StaticImageData;
    isLive: boolean;
    visibility: string;
    price: number | null;
    slug: string;
  };
  canAccess?: boolean;
}) {
  const ctaHref = canAccess
    ? `/live#${item.slug}`
    : item.visibility === "ONE_TIME" && item.price
      ? `/checkout?mode=payment&liveSessionId=${item.id}`
      : "/live";

  return (
    <article className="premium-card overflow-hidden hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <div className="relative aspect-[16/10]">
        <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/[0.45] px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
          {item.isLive ? <Radio className="h-3.5 w-3.5 text-red-500" /> : <Video className="h-3.5 w-3.5 text-accent" />}
          {item.isLive ? "Live now" : item.visibility === "PUBLIC" ? "Public" : "Single access"}
        </div>
      </div>
      <div className="space-y-5 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">{formatDate(item.scheduledFor)}</p>
          <h3 className="mt-3 text-3xl text-white">{item.title}</h3>
          <p className="mt-3 text-base leading-7 text-white/[0.58]">{item.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-white/50">
            {item.price ? formatCurrency(item.price) : "Pretul se seteaza din admin"}
          </p>
          <Button asChild variant={canAccess ? "primary" : "secondary"}>
            <Link href={ctaHref}>
              {canAccess ? "Watch" : item.price ? (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock
                </>
              ) : (
                "Vezi detalii"
              )}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}


