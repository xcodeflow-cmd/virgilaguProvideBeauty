"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      className="border-[rgba(201,165,108,0.24)]"
      onClick={() =>
        startTransition(() => {
          void signOut({ callbackUrl: "/" });
        })
      }
      disabled={pending}
    >
      {pending ? "Leaving..." : "Logout"}
    </Button>
  );
}
