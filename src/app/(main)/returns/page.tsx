import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Return Policy",
  description: "Understand THE JWEL return and exchange policy for eligible products.",
  pathname: "/returns",
});

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-theme-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Returns and Exchanges</h1>
        <p className="text-gray-700 leading-7">
          Eligible products can be returned or exchanged within the policy window. Please keep original
          packaging and invoice details for faster support processing.
        </p>
      </div>
    </main>
  );
}
