import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo/metadata";
import { Category } from "@/types/TypeInterface";
import { productWithImages } from "@/types/RelationTypeInterface";
import CollectionPageClient from "./CollectionPageClient";
import JsonLd from "@/components/seo/JsonLd";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collection } = await params;
  const decodedCollection = decodeURIComponent(collection || "");
  const title = `${decodedCollection} Jewellery Collection`;
  return buildPageMetadata({
    title,
    description: `Explore ${decodedCollection} jewellery at THE JWEL. Browse curated designs, compare prices, and shop with confidence.`,
    pathname: `/collection/${encodeURIComponent(decodedCollection)}`,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection } = await params;
  const decodedCollection = decodeURIComponent(collection || "");
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
    .filter("collection", "eq", decodedCollection)
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
    name: `${decodedCollection} products`,
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
      <CollectionPageClient
        decodedCollection={decodedCollection}
        initialProducts={productsData}
        initialCategories={categories}
      />
    </>
  );
}
