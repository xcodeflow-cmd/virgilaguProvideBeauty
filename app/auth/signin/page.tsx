import { AuthForm } from "@/components/auth-form";

function readMessage(value?: string | string[]) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message = readMessage(params.message);
  const error = readMessage(params.error);

  return (
    <section className="section-shell flex min-h-[calc(100vh-9rem)] items-center justify-center py-8 sm:py-12">
      <AuthForm mode="signin" initialMessage={message} initialError={error} />
    </section>
  );
}
