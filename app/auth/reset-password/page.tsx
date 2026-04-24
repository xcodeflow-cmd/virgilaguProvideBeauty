import { AuthStatusCard } from "@/components/auth-status-card";
import { ResetPasswordForm } from "@/components/reset-password-form";

function readToken(value?: string | string[]) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] || "" : value;
}

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = readToken(params.token);

  return (
    <section className="section-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-8 sm:py-12">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <AuthStatusCard
          eyebrow="Resetare parola"
          title="Link lipsa."
          description="Linkul de resetare nu este valid. Cere un email nou de resetare a parolei."
          ctaHref="/auth/forgot-password"
          ctaLabel="Cere alt link"
          secondaryHref="/auth/signin"
          secondaryLabel="Inapoi la autentificare"
        />
      )}
    </section>
  );
}
