import { AuthForm } from "@/components/auth-form";

export default function SignInPage() {
  return (
    <section className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <AuthForm mode="signin" />
    </section>
  );
}
