import Link from "next/link";

import { auth } from "@/auth";

import { LivePageContent } from "@/components/site/live-page-content";
import { FadeIn } from "@/components/motion-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { getPastLiveSessions, getPrimaryLiveSession, hasLiveAccess, isLiveSessionActive } from "@/lib/live";
import { getOwncastEmbedUrl } from "@/lib/owncast";

export default async function LivePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user?.id);
  const [hasAccess, liveSession] = await Promise.all([
    hasLiveAccess(session?.user?.id),
    getPrimaryLiveSession()
  ]);
  const pastSessions = await getPastLiveSessions(hasAccess);
  const isActive = liveSession ? isLiveSessionActive(liveSession) : false;
  const embedUrl = isActive ? getOwncastEmbedUrl(liveSession?.streamUrl) : null;

  return (
    <section className="section-shell section-space">
      <FadeIn>
        <SectionHeading
          eyebrow="LIVE"
          title="LIVE Barber Experience, direct alaturi de Virgil Agu."
          description="In fiecare luna, Virgil intra LIVE si lucreaza pe clienti reali, explicand pas cu pas miscarile, tehnicile si ritmul de lucru."
        />
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <LivePageContent
          canAccess={hasAccess}
          isActive={isActive}
          embedUrl={embedUrl}
          liveSessionId={liveSession?.id || null}
          pastSessions={pastSessions.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            scheduledFor: item.scheduledFor.toISOString(),
            recordingUrl: item.recordingUrl || ""
          }))}
        />
        <div className="premium-card p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Acces LIVE</p>
          <h2 className="mt-4 text-4xl text-white">
            {!isLoggedIn
              ? "Trebuie sa fii autentificat pentru a vedea LIVE-ul"
              : hasAccess
                ? isActive
                  ? "Invata in timp real, din confortul casei tale"
                  : "LIVE-ul este pregatit si devine activ la ora stabilita"
                : "Ai nevoie de abonament activ pentru a vedea LIVE-ul"}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/60">
            {!isLoggedIn
              ? "Autentifica-te in contul tau, apoi sistemul verifica automat daca ai abonament activ."
              : hasAccess
                ? isActive
                  ? "Fiecare sesiune arata exact cum se construieste o tunsoare corecta, cum se optimizeaza viteza si cum se mentine calitatea fara pasi inutili."
                  : "Abonamentul este valid. Playerul si chatul apar automat imediat ce sesiunea LIVE este pornita sau cand ora programata este atinsa."
                : "Contul tau este autentificat, dar nu are un abonament activ. Dupa activare, playerul LIVE devine disponibil automat."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild>
              <Link href={!isLoggedIn ? "/auth/signin" : hasAccess ? "/live" : "/api/stripe/checkout?mode=subscription"}>
                {!isLoggedIn ? "Autentificare" : hasAccess ? "Acces activ" : "Activeaza abonamentul"}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/gallery">Vezi galeria</Link>
            </Button>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            {!isLoggedIn
              ? "Daca nu esti logat, pagina nu afiseaza LIVE-ul si iti cere mai intai autentificarea."
              : hasAccess
                ? isActive
                  ? "In sesiune vezi tunsori pe modele reale, explicatii detaliate, intrebari si raspunsuri, tehnici actuale si sfaturi construite din peste 10 ani de experienta."
                  : "Daca sesiunea este doar programata, pagina mentine accesul valid dar ascunde playerul si chatul pana la activare."
                : "Daca esti logat, sistemul verifica abonamentul din contul tau. Fara abonament activ, LIVE-ul ramane blocat."}
          </div>
        </div>
      </div>
    </section>
  );
}
