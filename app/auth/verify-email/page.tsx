import { AuthStatusCard } from "@/components/auth-status-card";
import { verifyEmailToken } from "@/lib/auth-email";

function readToken(value?: string | string[]) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] || "" : value;
}

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = readToken(params.token);

  if (!token) {
    return (
      <section className="section-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-8 sm:py-12">
        <AuthStatusCard
          eyebrow="Confirmare cont"
          title="Link lipsa."
          description="Linkul de confirmare nu este valid. Incearca sa retrimiti emailul de confirmare din pagina de autentificare."
          ctaHref="/auth/signin"
          ctaLabel="Mergi la autentificare"
          secondaryHref="/auth/register"
          secondaryLabel="Creeaza alt cont"
        />
      </section>
    );
  }

  const result = await verifyEmailToken(token);

  return (
    <section className="section-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-8 sm:py-12">
      {result.ok ? (
        <AuthStatusCard
          eyebrow="Confirmare cont"
          title="Email confirmat."
          description="Contul tau este activ. Te poti autentifica acum cu emailul si parola setate la inregistrare."
          ctaHref="/auth/signin?message=Contul%20a%20fost%20confirmat.%20Te%20poti%20autentifica."
          ctaLabel="Intra in cont"
        />
      ) : (
        <AuthStatusCard
          eyebrow="Confirmare cont"
          title="Link expirat."
          description={result.error}
          ctaHref="/auth/signin"
          ctaLabel="Retrimite confirmarea"
          secondaryHref="/auth/register"
          secondaryLabel="Creeaza cont"
        />
      )}
    </section>
  );
}
