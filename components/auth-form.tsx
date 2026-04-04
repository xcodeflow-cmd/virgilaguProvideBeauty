"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "signin" | "register" }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const emailLabel = mode === "register" ? "Create access" : "Continue with email";

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
          Use Google for instant access or email magic link for a passwordless flow.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>

        <div className="text-xs uppercase tracking-[0.35em] text-white/28">or</div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await signIn("nodemailer", {
                email,
                redirect: false,
                callbackUrl: "/dashboard"
              });

              setMessage(
                result?.error
                  ? "Email sign-in could not be started. Check your SMTP settings."
                  : "Magic link sent. Check your inbox."
              );
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
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/45"
              placeholder="you@example.com"
            />
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : emailLabel}
          </Button>
        </form>

        {message ? <p className="text-sm text-gold-light">{message}</p> : null}
      </div>
    </div>
  );
}
