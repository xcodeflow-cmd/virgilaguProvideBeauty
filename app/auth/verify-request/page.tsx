export default function VerifyRequestPage() {
  return (
    <section className="section-shell flex min-h-[60vh] items-center justify-center py-16">
      <div className="glass-panel gold-ring max-w-2xl rounded-[2rem] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold-light/80">Check your inbox</p>
        <h1 className="mt-4 text-5xl text-white">Magic link sent.</h1>
        <p className="mt-4 text-base leading-7 text-white/60">
          Open the sign-in email to complete authentication. If it does not arrive,
          verify your SMTP settings in the environment configuration.
        </p>
      </div>
    </section>
  );
}
