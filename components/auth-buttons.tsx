import Link from "next/link";
import type { Session } from "next-auth";

import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export function AuthButtons({ session }: { session: Session | null }) {
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/auth/signin">Log In</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/live">Explore Live</Link>
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
      <Button asChild variant="ghost" className="hidden sm:inline-flex">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <SignOutButton />
    </div>
  );
}
