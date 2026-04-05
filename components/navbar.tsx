import Link from "next/link";
import type { Session } from "next-auth";

import { AuthButtons } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/reviews", label: "Reviews" },
  { href: "/live", label: "Live" },
  { href: "/contact", label: "Contact" }
];

export function Navbar({ session }: { session: Session | null }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="section-shell pt-4">
        <div className="glass-panel soft-ring flex items-center justify-between rounded-full px-5 py-3">
          <Link href="/" aria-label="Go to homepage">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/72 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <AuthButtons session={session} />
        </div>
      </div>
    </header>
  );
}
