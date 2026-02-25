import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description: "Contact THE JWEL support team for orders, returns, shipping, and product inquiries.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-theme-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-700 mb-2">Phone: +91 9875512028</p>
        <p className="text-gray-700 mb-2">Email: support@thejwel.in</p>
        <p className="text-gray-700">Address: 15/8/2 Mondalpara lane, Kolkata, West Bengal 700090</p>
      </div>
    </main>
  );
}
