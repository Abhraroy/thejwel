import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping Information",
  description: "Learn about shipping timelines, order processing, and delivery coverage at THE JWEL.",
  pathname: "/shipping",
});

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-theme-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Shipping Information</h1>
        <p className="text-gray-700 leading-7">
          Orders are processed promptly and shipped using trusted delivery partners. Delivery timelines
          vary by location and service availability.
        </p>
      </div>
    </main>
  );
}
