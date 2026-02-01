"use client";

import ProductCarousel from "@/components/ProductUI/ProductCarousel";
import ProductCarouselSkeleton from "@/components/ProductUI/ProductCaraouselSkeleton";
import { Product } from "@/utilityFunctions/TypeInterface";

interface Props {
  products: Product[];
  onAddToCart: (id: string) => void;
  onWishlistToggle: (id: string) => void;
}

export default function BestSellersSection({
  products,
  onAddToCart,
  onWishlistToggle,
}: Props) {
 
  if (!products.length) return null;

  return (
    <ProductCarousel
      sectionHeading="Best Sellers"
      products={products}
      tagSlug="best-sellers"
      onAddToCart={onAddToCart}
      onWishlistToggle={onWishlistToggle}
    />
  );
}
