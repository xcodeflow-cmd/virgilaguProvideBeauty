import Link from "next/link";

import { LivePageContent } from "@/components/site/live-page-content";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default function LivePage() {
  return (
    <section className="section-shell section-space">
      <FadeIn>
        <SectionHeading
          eyebrow="Live Studio"
          title="YouTube live embed pastrat simplu si usor de gestionat."
          description="Adminul poate salva un URL YouTube, iar pagina afiseaza playerul doar daca exista un live valid. Daca nu, vezi un mesaj clar."
        />
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <LivePageContent />
        <div className="premium-card p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Access</p>
          <h2 className="mt-4 text-4xl text-white">
            Live stream din YouTube, salvat local in browser
          </h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            Fluxul este compatibil cu Vercel: fara backend, fara upload extern, doar un URL YouTube
            si embed prin iframe.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/admin">Manage live</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/gallery">View gallery</Link>
            </Button>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            URL-ul YouTube este procesat in client, se extrage video ID-ul si se construieste embed-ul.
            Daca URL-ul lipseste sau este invalid, mesajul ramane: &quot;No live stream available right now&quot;.
          </div>
        </div>
      </div>
    </section>
  );
}
