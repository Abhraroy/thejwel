import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Status",
  description: "Payment redirect page",
  pathname: "/redirect",
  noIndex: true,
});

export default function RedirectLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
