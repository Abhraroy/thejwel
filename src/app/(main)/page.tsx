



import HomePage from "@/components/HomePage";
import { formatSupabaseError, logProductFetch } from "@/lib/debug/product-fetch-log";
import { createClient } from "@/lib/supabase-Utils/server";
import { buildOccasionDisplayList } from "@/lib/occasion-fallbacks";
import { buildStyleDisplayList } from "@/lib/style-fallbacks";
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

  const [catgoriesRes, bestSellersRes, newArrivalsRes, featuredProductsRes, trendingProductsRes, heroImagesRes, galleryImagesRes, stylesRes, occasionsRes, listedCountRes, allProductsCountRes] = await Promise.all([
    supabase.from("categories").select("category_id, category_name, slug, category_image_url"),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["best-sellers"])
      .eq("listed_status", true)
      .eq("home_visibility", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["new-arrivals"])
      .eq("listed_status", true)
      .eq("home_visibility", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["featured"])
      .eq("listed_status", true)
      .eq("home_visibility", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select(productFields)
      .contains("tags", ["trending"])
      .eq("listed_status", true)
      .eq("home_visibility", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("image_resources")
      .select("image_link, redirect_route")
      .eq("section_name", "homepage_hero"),
    supabase
      .from("image_resources")
      .select("image_link, redirect_route")
      .eq("section_name", "homepage_image_gallery")
      .order("created_at", { ascending: true }),
    supabase
      .from("styles")
      .select("style_id, style_name, slug, image_link")
      .eq("is_active", true),
    supabase
      .from("occasions")
      .select("occasion_id, occasion_name, slug, image_link")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("product_id", { count: "exact", head: true })
      .eq("listed_status", true),
    supabase
      .from("products")
      .select("product_id", { count: "exact", head: true }),
  ]);

  logProductFetch({
    page: "home",
    query: "sanity:listed_products_count",
    count: listedCountRes.count ?? 0,
    error: formatSupabaseError(listedCountRes.error),
    meta: { totalProductsInDb: allProductsCountRes.count ?? 0 },
  });
  logProductFetch({
    page: "home",
    query: "best-sellers",
    count: bestSellersRes.data?.length ?? 0,
    error: formatSupabaseError(bestSellersRes.error),
  });
  logProductFetch({
    page: "home",
    query: "new-arrivals",
    count: newArrivalsRes.data?.length ?? 0,
    error: formatSupabaseError(newArrivalsRes.error),
  });
  logProductFetch({
    page: "home",
    query: "featured",
    count: featuredProductsRes.data?.length ?? 0,
    error: formatSupabaseError(featuredProductsRes.error),
  });
  logProductFetch({
    page: "home",
    query: "trending",
    count: trendingProductsRes.data?.length ?? 0,
    error: formatSupabaseError(trendingProductsRes.error),
  });
  logProductFetch({
    page: "home",
    query: "styles",
    count: stylesRes.data?.length ?? 0,
    error: formatSupabaseError(stylesRes.error),
    meta: { slugs: stylesRes.data?.map((s) => s.slug) ?? [] },
  });
  logProductFetch({
    page: "home",
    query: "occasions",
    count: occasionsRes.data?.length ?? 0,
    error: formatSupabaseError(occasionsRes.error),
    meta: { slugs: occasionsRes.data?.map((o) => o.slug) ?? [] },
  });
  logProductFetch({
    page: "home",
    query: "categories",
    count: catgoriesRes.data?.length ?? 0,
    error: formatSupabaseError(catgoriesRes.error),
  });

  const heroItems = (heroImagesRes.data || []).map((item: { image_link: string; redirect_route: string | null }) => ({
    imageLink: item.image_link,
    redirectRoute: item.redirect_route?.trim() || null,
  }));

  const galleryItems = (galleryImagesRes.data || []).map(
    (item: { image_link: string; redirect_route: string | null }) => ({
      src: item.image_link,
      alt: "Jewelry gallery image",
      title: item.redirect_route?.trim() || undefined,
    })
  );

  const stylesData = buildStyleDisplayList(stylesRes.data ?? []);
  const occasionsData = buildOccasionDisplayList(occasionsRes.data ?? []);

  return (
    <HomePage
      categoriesProps={catgoriesRes.data || []}
      bestSellers={bestSellersRes.data || []}
      newArrivals={newArrivalsRes.data || []}
      featuredProducts={featuredProductsRes.data || []}
      trendingProducts={trendingProductsRes.data || []}
      heroItems={heroItems}
      galleryItems={galleryItems}
      stylesData={stylesData}
      occasionsData={occasionsData}
    />
  )
}