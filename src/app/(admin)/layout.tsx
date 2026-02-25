import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";
import "../(main)/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildPageMetadata, getBaseUrl } from "@/lib/seo/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "JWEL Admin",
    description: "Admin panel for JWEL jewelry shop",
    pathname: "/admin",
    noIndex: true,
  }),
  metadataBase: new URL(getBaseUrl()),
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
