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

  const submitLabel = mode === "register" ? "Create account" : "Sign in";
  const alternateHref = mode === "register" ? "/auth/signin" : "/auth/register";
  const alternateLabel = mode === "register" ? "Ai deja cont? Intră în cont" : "Nu ai cont? Creează unul";

  return (
    <div className="glass-panel gold-ring w-full max-w-lg rounded-[2rem] p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-light/80">
          {mode === "register" ? "New Member" : "Welcome Back"}
        </p>
        <h1 className="text-5xl text-white">
          {mode === "register" ? "Join the studio." : "Sign in to premium access."}
        </h1>
        <p className="text-base leading-7 text-white/60">
          {mode === "register"
            ? "Create a classic account with email and password."
            : "Enter your email and password to access your account."}
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
                setError("Email sau parolă incorectă.");
                return;
              }

              window.location.href = result?.url || "/dashboard";
            });
          }}
        >
          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm text-white/60">Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/45"
                placeholder="Your name"
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
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/45"
              placeholder="you@example.com"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/60">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/45"
              placeholder="Minimum 8 characters"
            />
          </label>
          {mode === "register" ? (
            <label className="block space-y-2">
              <span className="text-sm text-white/60">Confirm password</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/45"
                placeholder="Repeat password"
              />
            </label>
          ) : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait..." : submitLabel}
          </Button>
        </form>

        <div className="flex items-center justify-between gap-3 text-sm">
          <Link href={alternateHref} className="text-white/60 transition hover:text-gold-light">
            {alternateLabel}
          </Link>
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-gold-light">{message}</p> : null}
      </div>
    </div>
  );
}
