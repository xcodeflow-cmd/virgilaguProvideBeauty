"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Session } from "next-auth";

import { AuthButtons } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live" },
  { href: "/gallery", label: "Gallery" },
  { href: "/admin", label: "Admin" },
  { href: "/reviews", label: "Reviews" },
  { href: "/courses", label: "Courses" }
];

export function Navbar({ session }: { session: Session | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="section-shell pt-4">
        <div
          className={cn(
            "soft-ring flex items-center justify-between rounded-full border px-4 py-3 transition duration-300 sm:px-5",
            isScrolled
              ? "border-white/12 bg-black/55 shadow-panel backdrop-blur-2xl"
              : "border-white/8 bg-black/30 backdrop-blur-md"
          )}
        >
          <Link href="/" aria-label="Go to homepage">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/68 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex">
            <AuthButtons session={session} />
          </div>
          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] md:hidden"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isOpen ? (
          <div className="mt-3 rounded-[1.5rem] border border-white/10 bg-black/85 p-4 shadow-panel backdrop-blur-2xl md:hidden">
            <nav className="grid gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-3 py-3 text-sm text-white/78 transition hover:bg-white/[0.05] hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-white/10 pt-4">
              <AuthButtons session={session} />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
