import CategoryClient from "./CategoryClient";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ categoryslug: string }> 
}) {
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

  return (
    <CategoryClient
      category={category}
      subcategories={subcategories ?? []}
      products={products ?? []}
    />
  );
}





