import type { Metadata } from "next";
import ProductPageClient from "./ProductPageClient";
import { createClient } from "@/lib/supabase/server";
import { buildPageMetadata, toAbsoluteUrl } from "@/lib/seo/metadata";
import JsonLd from "@/components/seo/JsonLd";

type ProductPageProps = {
  params: Promise<{ product_id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { product_id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("product_id, product_name, description, thumbnail_image, categories(category_name)")
    .eq("product_id", product_id)
    .eq("listed_status", true)
    .maybeSingle();

  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      pathname: `/product/${encodeURIComponent(String(product_id))}`,
      noIndex: true,
    });
  }

  const categoryName = Array.isArray(product.categories)
    ? product.categories[0]?.category_name
    : (product.categories as { category_name?: string } | null)?.category_name;
  const title = categoryName
    ? `${product.product_name} | ${categoryName}`
    : product.product_name;

  return buildPageMetadata({
    title,
    description:
      (product.description || "").slice(0, 155) ||
      `Buy ${product.product_name} from THE JWEL. Explore premium jewelry collections with trusted quality and pricing.`,
    pathname: `/product/${encodeURIComponent(String(product.product_id))}`,
    imagePath: product.thumbnail_image || "/faviconFolder/android-chrome-512x512.png",
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { product_id } = await params;
  const supabase = await createClient();

  const [{ data: product, error: productError }, { data: reviewData, error: reviewError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(`
          *,
          product_images!product_images_product_id_fkey(*),
          reviews(*),
          categories(*)
        `)
        .eq("product_id", product_id)
        .eq("listed_status", true)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select(`
          *,
          review_images(*),
          users(*)
        `)
        .eq("product_id", product_id),
    ]);

  if (productError || !product) {
    return (
      <ProductPageClient
        productDetails={[]}
        reviews={[]}
        error="The product you're looking for doesn't exist."
      />
    );
  }

  const normalizedProduct = { ...product } as any;
  if (
    (!Array.isArray(normalizedProduct.product_images) || normalizedProduct.product_images.length === 0) &&
    normalizedProduct.thumbnail_image
  ) {
    normalizedProduct.product_images = [
      {
        image_url: normalizedProduct.thumbnail_image,
        product_id: normalizedProduct.product_id,
      },
    ];
  }

  const productUrl = toAbsoluteUrl(`/product/${encodeURIComponent(String(normalizedProduct.product_id))}`);
  const images = Array.isArray(normalizedProduct.product_images)
    ? normalizedProduct.product_images
        .map((img: any) => img?.image_url)
        .filter((img: string) => !!img)
    : [];
  const imageUrls = images.length > 0 ? images : [normalizedProduct.thumbnail_image].filter(Boolean);
  
  
  const schemaProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: normalizedProduct.product_name,
    description: normalizedProduct.description || "",
    sku: normalizedProduct.sku || undefined,
    image: imageUrls,
    category:
      (Array.isArray(normalizedProduct.categories)
        ? normalizedProduct.categories[0]?.category_name
        : normalizedProduct.categories?.category_name) || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: Number(normalizedProduct.final_price || 0),
      availability:
        Number(normalizedProduct.stock_quantity || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: toAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: toAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: normalizedProduct.product_name || "Product",
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={schemaProduct} />
      <JsonLd data={schemaBreadcrumb} />
      <ProductPageClient
        productDetails={[normalizedProduct]}
        reviews={reviewError ? [] : reviewData || []}
      />
    </>
  );
}
