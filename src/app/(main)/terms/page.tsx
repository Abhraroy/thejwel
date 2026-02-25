import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms and Conditions",
  description: "Review the terms and conditions for shopping at THE JWEL.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-theme-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
        <p className="text-gray-700 leading-7">
          By using this website, you agree to our terms regarding orders, payments, shipping, and returns.
          Please contact support for any policy clarification.
        </p>
      </div>
    </main>
  );
}
