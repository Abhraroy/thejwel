



import HomePage from "@/components/HomePage";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "The JWEL",
  description:
    "Shop premium American Diamond and traditional Temple Jewellery at THE JWEL, Kolkata. Discover rings, necklaces, bangles, and festive-ready designs.",
  pathname: "/",
});

export default async function Home() {
  const supabase = await createClient();

  const productFields = "product_id, product_name, thumbnail_image, base_price, final_price, discount_percentage, stock_quantity";

  const [catgoriesRes, bestSellersRes, newArrivalsRes, featuredProductsRes, heroImagesRes] = await Promise.all([
    supabase.from("categories").select("category_id, category_name, slug, category_image_url"),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["best-sellers"])
      .eq("listed_status", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["new-arrivals"])
      .eq("listed_status", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["featured"])
      .eq("listed_status", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("image_resources")
      .select("image_link, redirect_route")
      .eq("section_name", "homepage_hero"),
  ]);
  

  const heroItems = (heroImagesRes.data || []).map((item: { image_link: string; redirect_route: string | null }) => ({
    imageLink: item.image_link,
    redirectRoute: item.redirect_route?.trim() || null,
  }));
  return (
    <HomePage
      categoriesProps={catgoriesRes.data || []}
      bestSellers={bestSellersRes.data || []}
      newArrivals={newArrivalsRes.data || []}
      featuredProducts={featuredProductsRes.data || []}
      heroItems={heroItems}
    />
  )
}