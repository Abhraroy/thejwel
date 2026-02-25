import CategoryClient from "./CategoryClient";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo/metadata";
import JsonLd from "@/components/seo/JsonLd";

type CategoryPageProps = {
  params: Promise<{ categoryslug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { categoryslug } = await params;
  const slug = decodeURIComponent(categoryslug);

  const { data: category } = await supabase
    .from("categories")
    .select("slug, category_name, category_description, category_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!category) {
    return buildPageMetadata({
      title: "Category Not Found",
      description: "The requested category does not exist.",
      pathname: `/category/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${category.category_name} Jewellery`,
    description:
      category.category_description ||
      `Explore ${category.category_name} jewellery at THE JWEL. Browse curated designs and discover your next favorite piece.`,
    pathname: `/category/${encodeURIComponent(category.slug)}`,
    imagePath: category.category_image_url || "/faviconFolder/android-chrome-512x512.png",
  });
}

export default async function CategoryPage({ 
  params 
}: CategoryPageProps) {
  const supabase = await createClient();
  const { categoryslug } = await params;
  const slug = decodeURIComponent(categoryslug);

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  const { data: subcategories } = await supabase
    .from("sub_categories")
    .select("*")
    .eq("category_id", category.category_id)
    .eq("is_active", true);

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories!inner(*),
      sub_categories(*),
      product_images(*)
    `)
    .eq("categories.slug", slug)
    .eq("listed_status", true)
    .order("updated_at", { ascending: false });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.category_name} products`,
    itemListElement: (products ?? []).slice(0, 100).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/product/${encodeURIComponent(String(product.product_id))}`),
      name: product.product_name,
    })),
  };

  return (
    <>
      <JsonLd data={itemListSchema} />
      <CategoryClient
        category={category}
        subcategories={subcategories ?? []}
        products={products ?? []}
      />
    </>
  );
}





