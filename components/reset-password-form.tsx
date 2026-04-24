"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="glass-panel w-full max-w-[34rem] rounded-[2rem] p-5 sm:rounded-[2.2rem] sm:p-8 lg:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Parola noua</p>
      <h1 className="mt-3 max-w-md text-4xl leading-[0.9] text-white sm:text-5xl lg:text-6xl">
        Seteaza parola.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
        Alege o parola noua pentru contul tau. Linkul este valabil o singura data.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            setMessage(null);
            setError(null);

            if (password !== confirmPassword) {
              setError("Parolele nu coincid.");
              return;
            }

            const response = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ token, password })
            });

            const data = (await response.json()) as { error?: string; message?: string };

            if (!response.ok) {
              setError(data.error || "Parola nu a putut fi resetata.");
              return;
            }

            setMessage(data.message || "Parola a fost schimbata.");
            setPassword("");
            setConfirmPassword("");
          });
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm text-white/60">Parola noua</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-shell"
            placeholder="Minimum 8 caractere"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-white/60">Confirma parola</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="field-shell"
            placeholder="Repeta parola"
          />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Se proceseaza..." : "Salveaza parola noua"}
        </Button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-4 text-sm">
        <Link href="/auth/signin" className="text-white/60 transition hover:text-white">
          Inapoi la autentificare
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      {message ? (
        <p className="mt-4 text-sm text-accent">
          {message} <Link href="/auth/signin" className="underline">Intra in cont</Link>
        </p>
      ) : null}
    </div>
  );
}
