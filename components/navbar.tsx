"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GraduationCap,
  Home,
  Images,
  Menu,
  MessageCircleMore,
  Radio,
  Star,
  X
} from "lucide-react";
import type { Session } from "next-auth";

import { AuthButtons } from "@/components/auth-buttons";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Acasa", icon: Home, tone: "bg-white/[0.06]" },
  { href: "/live", label: "LIVE", icon: Radio, tone: "bg-red-500/12" },
  { href: "/courses", label: "Cursuri", icon: GraduationCap, tone: "bg-[#d6b98c]/12" },
  { href: "/reviews", label: "Review-uri", icon: Star, tone: "bg-white/[0.05]" },
  { href: "/gallery", label: "Galerie", icon: Images, tone: "bg-white/[0.05]" },
  { href: "/contact", label: "Contact", icon: MessageCircleMore, tone: "bg-[#d6b98c]/10" }
] as const;

export function Navbar({ session }: { session: Session | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const visibleLinks = session?.user?.role === "ADMIN"
    ? [...navLinks, { href: "/admin", label: "Admin", icon: ArrowUpRight, tone: "bg-white/[0.06]" }]
    : navLinks;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="section-shell flex items-start justify-between gap-4 pt-5">
        <div
          className={cn(
            "rounded-full px-4 py-3 transition duration-500",
            isScrolled
              ? "bg-black/74 shadow-[0_18px_60px_rgba(0,0,0,0.24)]"
              : "bg-black/38 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
          )}
        >
          <Link href="/" aria-label="Go to homepage" className="block">
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "hidden rounded-full px-3 py-2.5 md:flex",
              isScrolled ? "bg-black/74 shadow-[0_18px_60px_rgba(0,0,0,0.22)]" : "bg-black/40 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
            )}
          >
            <AuthButtons session={session} />
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full text-white transition duration-500",
              isScrolled
                ? "bg-black/78 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
                : "bg-black/46 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
            )}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-40 transition duration-500",
          isOpen ? "bg-black/72" : "bg-black/0"
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 px-5 pt-24 transition duration-500 sm:px-7 lg:px-10",
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        )}
      >
        <div className="section-shell">
          <div className="pointer-events-auto overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
            <div className="grid gap-0 xl:grid-cols-[0.88fr_1.12fr]">
              <div className="border-b border-white/8 p-8 xl:border-b-0 xl:border-r xl:p-10">
                <p className="text-xs uppercase tracking-[0.42em] text-[#d6b98c]">Navigation</p>
                <h2 className="mt-5 max-w-md text-5xl leading-[0.86] text-white sm:text-6xl">
                  Intri in orice zona dintr-un singur gest.
                </h2>
                <p className="mt-5 max-w-md text-base leading-8 text-white/62">
                  Fara bara clasica de meniu. Navigatia devine un moment separat, mai controlat si
                  mai memorabil.
                </p>
                <div className="mt-8 md:hidden">
                  <AuthButtons session={session} />
                </div>
              </div>

              <nav className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3 lg:p-8">
                {visibleLinks.map((link) => {
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_55px_rgba(0,0,0,0.25)]"
                    >
                      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white/88", link.tone)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-12 text-[11px] uppercase tracking-[0.36em] text-white/42">
                        Route
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <h3 className="text-2xl text-white">{link.label}</h3>
                        <ArrowUpRight className="h-5 w-5 text-white/32 transition duration-300 group-hover:text-[#d6b98c]" />
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
