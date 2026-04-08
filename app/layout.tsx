import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { ToasterShell } from "@/components/toaster-shell";
import { siteConfig } from "@/lib/data";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Cursuri de Frizerie si LIVE`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "ro_RO",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="fixed inset-0 -z-10 bg-canvas" />
        <div className="fixed inset-0 -z-10 bg-mesh opacity-90" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(194,154,92,0.1),transparent_24%),linear-gradient(180deg,rgba(7,7,7,0.18),rgba(7,7,7,0.88))]" />
        <Navbar session={session} />
        <main className="min-h-screen pt-28 sm:pt-32">{children}</main>
        <SiteFooter />
        <ToasterShell />
      </body>
    </html>
  );
}
