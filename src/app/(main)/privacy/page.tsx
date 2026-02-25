import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Read how THE JWEL collects, stores, and protects your personal information.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-theme-cream py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-700 leading-7">
          We collect only the information needed to process orders, provide support, and improve your
          shopping experience. We do not sell your personal data to third parties.
        </p>
      </div>
    </main>
  );
}
