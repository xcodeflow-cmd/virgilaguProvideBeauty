"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="glass-panel w-full max-w-[34rem] rounded-[2rem] p-5 sm:rounded-[2.2rem] sm:p-8 lg:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Resetare parola</p>
      <h1 className="mt-3 max-w-md text-4xl leading-[0.9] text-white sm:text-5xl lg:text-6xl">
        Cere un link nou.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
        Introdu emailul contului si iti trimitem un link pentru schimbarea parolei.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            setMessage(null);
            setError(null);

            const response = await fetch("/api/auth/forgot-password", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ email })
            });

            const data = (await response.json()) as { error?: string; message?: string };

            if (!response.ok) {
              setError(data.error || "Nu am putut procesa cererea.");
              return;
            }

            setMessage(data.message || "Verifica emailul pentru linkul de resetare.");
          });
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm text-white/60">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-shell"
            placeholder="you@example.com"
          />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Se proceseaza..." : "Trimite linkul de resetare"}
        </Button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-4 text-sm">
        <Link href="/auth/signin" className="text-white/60 transition hover:text-white">
          Inapoi la autentificare
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-accent">{message}</p> : null}
    </div>
  );
}
