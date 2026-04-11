"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/live", label: "LIVE", icon: Radio, tone: "bg-red-500/[0.12]" },
  { href: "/courses", label: "Cursuri", icon: GraduationCap, tone: "bg-[#d6b98c]/[0.12]" },
  { href: "/reviews", label: "Review-uri", icon: Star, tone: "bg-white/[0.05]" },
  { href: "/gallery", label: "Galerie", icon: Images, tone: "bg-white/[0.05]" },
  { href: "/contact", label: "Contact", icon: MessageCircleMore, tone: "bg-[#d6b98c]/10" }
] as const;

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const visibleLinks = session?.user?.role === "ADMIN"
    ? [...navLinks, { href: "/admin", label: "Admin", icon: ArrowUpRight, tone: "bg-white/[0.06]" }]
    : navLinks;

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 18);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
      <div className="section-shell flex items-start justify-between gap-3 pt-4 sm:pt-5">
        <div
          className={cn(
            "rounded-full bg-black/[0.42] px-4 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-200 will-change-transform",
            isScrolled ? "-translate-y-4 opacity-0 pointer-events-none sm:-translate-y-5" : "translate-y-0 opacity-100"
          )}
        >
          <Link href="/" aria-label="Go to homepage" className="block">
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "hidden rounded-full bg-black/[0.36] px-3 py-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-md transition duration-200 md:flex",
              isScrolled ? "-translate-y-4 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}
          >
            <AuthButtons session={session} />
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/[0.44] text-white shadow-[0_14px_36px_rgba(0,0,0,0.16)] transition duration-200 hover:bg-black/60"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {pathname !== "/live" && !pathname.startsWith("/auth") ? (
        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 transition duration-200 md:hidden",
            isOpen ? "opacity-0" : "opacity-100"
          )}
        >
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2 rounded-full border border-white/10 bg-black/70 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="min-w-0 flex-1">
              <Link
                href={session?.user ? (session.user.role === "ADMIN" ? "/admin" : "/dashboard") : "/auth/signin"}
                className="pointer-events-auto flex min-h-11 items-center justify-center rounded-full bg-white/[0.04] px-4 text-sm text-white transition hover:bg-white/[0.08]"
              >
                {session?.user ? (session.user.role === "ADMIN" ? "Admin" : "Contul meu") : "Autentificare"}
              </Link>
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href="/live"
                className="pointer-events-auto flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#df3b3b,#8d1111)] px-4 text-sm font-medium text-white shadow-[0_18px_45px_rgba(176,24,24,0.28)] transition hover:-translate-y-0.5"
              >
                LIVE
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/[0.52] backdrop-blur-[5px]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-0 top-0 z-50 px-4 pt-20 sm:px-7 lg:px-10">
            <div className="section-shell">
              <div className="mx-auto max-w-[46rem] overflow-hidden rounded-[1.85rem] border border-white/10 bg-black/[0.98] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.34em] text-white/40">Navigation</p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/[0.72] transition hover:bg-white/[0.1] hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    Close
                  </button>
                </div>

                <nav className="grid gap-3 sm:grid-cols-2">
                  {visibleLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="group rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-4 py-4 transition duration-200 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-white/[0.88]", link.tone)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-base text-white">{link.label}</span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-white/[0.28] transition duration-200 group-hover:text-[#d6b98c]" />
                        </div>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-4 border-t border-white/10 pt-4 md:hidden">
                  <AuthButtons session={session} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}


