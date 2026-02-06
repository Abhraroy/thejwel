import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * Base URL for sitemap entries.
 *
 * Recommended: set one of these environment variables:
 * - SITE_URL="https://thejwel.com"
 * - NEXT_PUBLIC_SITE_URL="https://thejwel.com"
 *
 * Vercel fallback: VERCEL_URL="your-domain.vercel.app" (no scheme)
 */
const baseUrl = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://thejwel.com";

  return raw.replace(/\/+$/, "");
})();

function abs(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${baseUrl}${path}`;
}

function toDate(d: unknown): Date {
  if (d instanceof Date) return d;
  if (typeof d === "string" || typeof d === "number") {
    const parsed = new Date(d);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function uniqStrings(values: Array<unknown>) {
  const out = new Set<string>();
  for (const v of values) {
    if (typeof v === "string") {
      const s = v.trim();
      if (s) out.add(s);
    }
  }
  return [...out];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always return at least the homepage
  const entries: MetadataRoute.Sitemap = [
    {
      url: abs("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const supabase = await createClient();

    // Categories -> /category/[categoryslug]
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, updated_at, created_at, is_active")
      .eq("is_active", true);

    if (!categoriesError && categories?.length) {
      for (const c of categories) {
        if (!c?.slug) continue;
        entries.push({
          url: abs(`/category/${encodeURIComponent(c.slug)}`),
          lastModified: toDate(c.updated_at || c.created_at),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    // Products -> /product/[product_id]
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("product_id, updated_at, created_at, listed_status, collection, occasion, tags")
      .eq("listed_status", true);

    if (!productsError && products?.length) {
      for (const p of products) {
        if (!p?.product_id) continue;
        entries.push({
          url: abs(`/product/${encodeURIComponent(String(p.product_id))}`),
          lastModified: toDate(p.updated_at || p.created_at),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      // Collections -> /collection/[collection]
      const hardcodedCollections = ["american-diamond", "temple"];
      const dbCollections = uniqStrings(products.map((p) => p?.collection));
      for (const collection of new Set([...hardcodedCollections, ...dbCollections])) {
        entries.push({
          url: abs(`/collection/${encodeURIComponent(collection)}`),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      // Occasions -> /occasion/[occasion]
      const hardcodedOccasions = ["everydaywear", "partywear", "wedding"];
      const dbOccasions = uniqStrings(products.map((p) => p?.occasion));
      for (const occasion of new Set([...hardcodedOccasions, ...dbOccasions])) {
        entries.push({
          url: abs(`/occasion/${encodeURIComponent(occasion)}`),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      // Tags -> /Tags/[tags]
      const hardcodedTags = [
        "new-arrivals",
        "best-sellers",
        "featured",
        "trending",
        "sale",
        "limited-edition",
      ];

      const dbTags: string[] = [];
      for (const p of products) {
        if (Array.isArray(p?.tags)) {
          for (const t of p.tags) dbTags.push(t);
        }
      }

      for (const tag of new Set([...hardcodedTags, ...uniqStrings(dbTags)])) {
        entries.push({
          url: abs(`/Tags/${encodeURIComponent(tag)}`),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }

    // De-dupe by URL (in case DB contains overlap with hardcoded sets)
    const deduped = new Map<string, MetadataRoute.Sitemap[number]>();
    for (const e of entries) deduped.set(e.url, e);
    return [...deduped.values()];
  } catch {
    return entries;
  }
}