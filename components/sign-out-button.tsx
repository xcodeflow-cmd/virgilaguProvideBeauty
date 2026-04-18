"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton({ onComplete }: { onComplete?: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      className="min-h-11 border-[rgba(201,165,108,0.26)] bg-[rgba(201,165,108,0.08)] px-4 text-[#f3e3c6]"
      onClick={() =>
        startTransition(() => {
          onComplete?.();
          void signOut({ callbackUrl: "/", redirect: true });
        })
      }
      disabled={pending}
    >
      {pending ? "Leaving..." : "Logout"}
    </Button>
  );
}
