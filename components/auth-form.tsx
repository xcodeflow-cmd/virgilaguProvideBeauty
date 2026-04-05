"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "signin" | "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitLabel = mode === "register" ? "Creeaza cont" : "Intra in cont";
  const alternateHref = mode === "register" ? "/auth/signin" : "/auth/register";
  const alternateLabel = mode === "register" ? "Ai deja cont? Intra in cont" : "Nu ai cont? Creeaza unul";

  return (
    <div className="glass-panel w-full max-w-lg rounded-[2rem] p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-accent/80">
          {mode === "register" ? "Cont nou" : "Bine ai revenit"}
        </p>
        <h1 className="text-5xl text-white">
          {mode === "register" ? "Creeaza contul tau." : "Acceseaza contul tau."}
        </h1>
        <p className="text-base leading-7 text-white/60">
          {mode === "register"
            ? "Creeaza un cont clasic cu email si parola."
            : "Introdu emailul si parola pentru a intra in platforma."}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              setError(null);
              setMessage(null);

              if (mode === "register") {
                if (password !== confirmPassword) {
                  setError("Parolele nu coincid.");
                  return;
                }

                const response = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    name,
                    email,
                    password
                  })
                });

                const data = (await response.json()) as { error?: string };

                if (!response.ok) {
                  setError(data.error || "Contul nu a putut fi creat.");
                  return;
                }
              }

              const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/dashboard"
              });

              if (result?.error) {
                setError("Email sau parola incorecta.");
                return;
              }

              window.location.href = result?.url || "/dashboard";
            });
          }}
        >
          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm text-white/60">Nume</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/25"
                placeholder="Numele tau"
              />
            </label>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm text-white/60">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/25"
              placeholder="you@example.com"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/60">Parola</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/25"
              placeholder="Minimum 8 caractere"
            />
          </label>
          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm text-white/60">Confirma parola</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/25"
                placeholder="Repeta parola"
              />
            </label>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Se proceseaza..." : submitLabel}
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm">
          <Link href={alternateHref} className="text-white/60 transition hover:text-white">
            {alternateLabel}
          </Link>
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-accent">{message}</p> : null}
      </div>
    </div>
  );
}
