import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatLei } from "@/lib/utils";

type PastLiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  thumbnailUrl?: string;
  recordingUrl: string;
  price?: number | null;
  compareAtPrice?: number | null;
  visibility?: string;
  maxParticipants?: number | null;
  purchasedCount?: number;
};

export function PastLiveList({
  accessibleLiveIds,
  isAdmin = false,
  sessions
}: {
  accessibleLiveIds: string[];
  isAdmin?: boolean;
  sessions: PastLiveSession[];
}) {
  return (
    <div className="premium-card rounded-[1.7rem] p-4 sm:rounded-[2rem] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#d6b98c]">Live-uri anterioare</p>
          <h3 className="mt-2 text-2xl text-white sm:text-3xl">Replay-uri disponibile</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/45">
          {sessions.length} disponibile
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 2xl:grid-cols-3">
        {sessions.length ? (
          sessions.map((session) => {
            const hasAccess = isAdmin || session.visibility === "PUBLIC" || accessibleLiveIds.includes(session.id);
            const hasDiscount = Boolean(session.compareAtPrice && session.price && session.compareAtPrice > session.price);
            const discountPercent = hasDiscount
              ? Math.round((((session.compareAtPrice || 0) - (session.price || 0)) / (session.compareAtPrice || 1)) * 100)
              : 0;

            return (
              <div
                key={session.id}
                id={`replay-${session.id}`}
                className="rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(214,185,140,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))] p-4 shadow-[0_20px_55px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 sm:rounded-[1.55rem] sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-white sm:text-xl">{session.title}</p>
                    {session.description ? (
                      <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-white/60 sm:block">{session.description}</p>
                    ) : null}
                  </div>
                  <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
                    {!hasAccess ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#d6b98c]/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[#f3dfbf] backdrop-blur-md">
                        <Lock className="h-3.5 w-3.5" />
                        Blocat
                      </div>
                    ) : null}
                    <div className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-red-100">
                      {hasDiscount ? `Reducere ${discountPercent}%` : session.price ? formatLei(session.price) : "Fara pret"}
                    </div>
                  </div>
                </div>
                {hasDiscount ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-white/35 line-through">{formatLei(session.compareAtPrice || 0)}</span>
                    <span className="text-white">{formatLei(session.price || 0)}</span>
                    <span className="rounded-full border border-red-500/30 bg-red-500/12 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-red-100">
                      Reducere
                    </span>
                  </div>
                ) : null}
                <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/40">
                  {new Date(session.scheduledFor).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}
                </p>
                {isAdmin && session.maxParticipants ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/40">
                    Achizitii {session.purchasedCount || 0}/{session.maxParticipants}
                  </p>
                ) : null}
                {session.thumbnailUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/30">
                    <div className="relative aspect-[16/9]">
                      <Image src={session.thumbnailUrl} alt={session.title} fill className="object-contain" unoptimized />
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {hasAccess && session.recordingUrl ? (
                    <Button asChild className="min-h-11">
                      <Link href={session.recordingUrl} target="_blank" rel="noreferrer">
                        Vezi replay
                      </Link>
                    </Button>
                  ) : hasAccess ? (
                    <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55">
                      Replay in curs de salvare
                    </div>
                  ) : (
                    <>
                      {session.visibility === "ONE_TIME" && session.price ? (
                        <Button asChild className="min-h-11">
                          <Link href={`/checkout?mode=payment&liveSessionId=${session.id}`}>
                            Cumpara replay
                          </Link>
                        </Button>
                      ) : (
                        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55">
                          Replay indisponibil
                        </div>
                      )}
                      <p className="max-w-full text-sm leading-6 text-white/50">
                        {session.visibility === "ONE_TIME" && session.price
                          ? hasDiscount
                            ? `Pret vechi ${formatLei(session.compareAtPrice || 0)}, acum ${formatLei(session.price)}.`
                            : `Deblocare la ${formatLei(session.price)}.`
                          : "Pretul live-ului se seteaza din admin."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-5 py-7 text-sm text-white/[0.55]">
            Niciun replay disponibil momentan.
          </div>
        )}
      </div>
    </div>
  );
}


