import Link from "next/link";

import { Button } from "@/components/ui/button";

type PastLiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  recordingUrl: string;
  price?: number | null;
  visibility?: string;
};

export function PastLiveList({
  canAccess,
  sessions
}: {
  canAccess: boolean;
  sessions: PastLiveSession[];
}) {
  return (
    <div className="premium-card p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Live-uri anterioare</p>
      <h3 className="mt-3 text-3xl text-white">Replay-uri disponibile</h3>

      <div className="mt-8 space-y-4">
        {sessions.length ? (
          sessions.map((session) => (
            <div key={session.id} className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-5 shadow-panel sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl text-white">{session.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{session.description}</p>
                </div>
                <div className="rounded-full border border-[#d6b98c]/18 bg-[#d6b98c]/[0.08] px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#f1dec0]">
                  {session.price ? `${(session.price / 100).toFixed(0)} EUR` : "Abonament"}
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/40">
                {new Date(session.scheduledFor).toLocaleString("ro-RO")}
              </p>
              <div className="mt-4">
                {canAccess ? (
                  <Button asChild>
                    <Link href={session.recordingUrl} target="_blank" rel="noreferrer">
                      Vezi replay
                    </Link>
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    {session.visibility === "ONE_TIME" && session.price ? (
                      <Button asChild>
                        <Link href={`/api/stripe/checkout?mode=payment&liveSessionId=${session.id}`}>
                          Deblocheaza replay
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href="/api/stripe/checkout?mode=subscription">
                          Activeaza accesul
                        </Link>
                      </Button>
                    )}
                    <p className="text-sm text-white/50">
                      {session.visibility === "ONE_TIME" && session.price
                        ? `Deblocare la ${(session.price / 100).toFixed(0)} EUR.`
                        : "Replay-ul intra prin abonament activ."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-8 text-sm text-white/55">
            Niciun replay disponibil momentan.
          </div>
        )}
      </div>
    </div>
  );
}
