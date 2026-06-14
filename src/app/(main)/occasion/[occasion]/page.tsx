import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-Utils/server";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo/metadata";
import { Category } from "@/types/TypeInterface";
import { productWithImages } from "@/types/RelationTypeInterface";
import OccasionPageClient from "./OccasionPageClient";
import JsonLd from "@/components/seo/JsonLd";

type OccasionPageProps = {
  params: Promise<{ occasion: string }>;
};

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { occasion } = await params;
  const decodedOccasion = decodeURIComponent(occasion || "");
  const title = `${decodedOccasion} Jewellery`;
  return buildPageMetadata({
    title,
    description: `Shop ${decodedOccasion} jewellery at THE JWEL. Discover occasion-ready designs across categories and price ranges.`,
    pathname: `/occasion/${encodeURIComponent(decodedOccasion)}`,
  });
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const { occasion } = await params;
  const decodedOccasion = decodeURIComponent(occasion || "");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images(*),
      categories(*)
      `
    )
    .filter("occasion", "eq", decodedOccasion)
    .eq("listed_status", true)
    .order("updated_at", { ascending: false });

  const productsData = (error ? [] : data ?? []) as productWithImages[];
  const unique = new Map<string, Category>();
  for (const p of productsData) {
    const c = p.categories ?? null;
    if (c?.category_id) unique.set(c.category_id, c);
  }
  const categories = Array.from(unique.values()).sort((a, b) =>
    (a.category_name ?? "").localeCompare(b.category_name ?? "")
  );

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${decodedOccasion} products`,
    itemListElement: productsData.slice(0, 100).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/product/${encodeURIComponent(String(product.product_id))}`),
      name: product.product_name,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <OccasionPageClient
        decodedOccasion={decodedOccasion}
        initialProducts={productsData}
        initialCategories={categories}
      />
    </>
  );
}
