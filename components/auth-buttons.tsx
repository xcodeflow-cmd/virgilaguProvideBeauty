import Link from "next/link";
import type { Session } from "next-auth";

import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export function AuthButtons({ session }: { session: Session | null }) {
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/auth/signin">Autentificare</Link>
        </Button>
        <Button asChild>
          <Link href="/live">Vezi LIVE</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.role === "ADMIN" ? (
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/admin">Admin</Link>
        </Button>
      ) : null}
      <Button asChild variant="secondary" className="hidden sm:inline-flex">
        <Link href="/dashboard">Contul meu</Link>
      </Button>
      <SignOutButton />
    </div>
  );
}
