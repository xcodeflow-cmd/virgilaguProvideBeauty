import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Syne } from "next/font/google";

import { auth } from "@/auth";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ToasterShell } from "@/components/toaster-shell";
import { siteConfig } from "@/lib/data";

import "./globals.css";

const inter = Manrope({
  subsets: ["latin"],
  variable: "--font-inter"
});

const cormorant = Syne({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Premium Barber & Education`,
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <div className="fixed inset-0 -z-10 bg-mesh opacity-80" />
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,8,8,0.82),rgba(8,8,8,0.98))]" />
        <Navbar session={session} />
        <main className="min-h-screen pt-24">{children}</main>
        <Footer />
        <ToasterShell />
      </body>
    </html>
  );
}
