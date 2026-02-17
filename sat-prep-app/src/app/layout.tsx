
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#8B4513",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "the1600club - Join the club. Get the score.",
  description: "Your path to the perfect SAT score. Gamified practice, adaptive learning, unlimited questions. Level up to 1600.",
  keywords: ["SAT prep", "digital SAT", "SAT practice", "adaptive learning", "SAT tutoring", "college prep"],
  authors: [{ name: "the1600club" }],
  openGraph: {
    title: "the1600club - Digital SAT Prep",
    description: "Gamified practice, adaptive learning, and unlimited questions for the Digital SAT.",
    url: "https://the1600club.com",
    siteName: "the1600club",
    images: [
      {
        url: "/og-image.png", // detailed later
        width: 1200,
        height: 630,
        alt: "the1600club SAT Prep",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "the1600club - Digital SAT Prep",
    description: "Gamified practice, adaptive learning, and unlimited questions for the Digital SAT.",
    // images: ["/twitter-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "the1600club",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
