"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const routeTargets = ["/live", "/courses", "/about", "/reviews", "/gallery", "/contact"] as const;

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const run = () => {
      routeTargets.forEach((href, index) => {
        window.setTimeout(() => {
          void router.prefetch(href);
        }, index * 120);
      });
    };

    if ("requestIdleCallback" in window && typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => run());

      return () => {
        if ("cancelIdleCallback" in window && typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(handle);
        }
      };
    }

    const timeout = window.setTimeout(run, 250);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return null;
}
