import Link from "next/link";

import { Button } from "@/components/ui/button";

type PastLiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  recordingUrl: string;
};

export function PastLiveList({
  canAccess,
  sessions
}: {
  canAccess: boolean;
  sessions: PastLiveSession[];
}) {
  return (
    <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Liveuri Trecute</p>
      <h3 className="mt-3 text-2xl text-white">Replay-uri disponibile dupa incheierea sesiunilor</h3>

      <div className="mt-6 space-y-4">
        {sessions.length ? (
          sessions.map((session) => (
            <div key={session.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <p className="text-white">{session.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/60">{session.description}</p>
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
                  <p className="text-sm text-white/50">Replay-urile sunt disponibile doar pentru abonati.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-8 text-sm text-white/55">
            Niciun replay disponibil momentan.
          </div>
        )}
      </div>
    </div>
  );
}
