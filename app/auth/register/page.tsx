import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <section className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <AuthForm mode="register" />
    </section>
  );
}
