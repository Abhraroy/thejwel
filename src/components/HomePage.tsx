import { Suspense } from "react";
import Image from "next/image";
import Carousel from "@/components/Carousel";
import CategorySection from "@/components/CategorySection";
import Collection from "@/components/Collection";
import OccasionSection from "@/components/OccasionSection";
import { Product } from "@/types/TypeInterface";
import ProductCarouselSkeleton from "@/components/ProductUI/ProductCaraouselSkeleton";
import HomePageClientShell from "./HomePageClientShell";
import CartBootstrapper from "./CartBootstrapper";
import InViewSection from "./InViewSection";
import {
  DynamicBestSellers,
  DynamicFeatured,
  DynamicNewArrivals,
  DynamicImageGallery,
} from "./DynamicHomeSections";

function CarouselSkeleton() {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] bg-gray-200 animate-pulse" />
  );
}

function CategorySectionSkeleton() {
  return (
    <section className="w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-7 w-48 mx-auto bg-gray-200 animate-pulse rounded mb-6" />
        <div className="flex gap-4 justify-center flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageGalleryCarouselSkeleton() {
  return (
    <section className="w-full py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <div className="h-8 md:h-12 w-48 md:w-64 mx-auto bg-gray-200 animate-pulse rounded mb-3" />
          <div className="h-4 w-96 mx-auto bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="relative">
          <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] bg-gray-200 animate-pulse rounded-2xl" />
          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gray-300 animate-pulse rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({
  categoriesProps,
  bestSellers,
  newArrivals,
  featuredProducts,
  heroImages,
}: {
  categoriesProps: any;
  bestSellers: Product[];
  newArrivals: Product[];
  featuredProducts: Product[];
  heroImages: string[];
}) {
  const carouselItemsArray = heroImages.map((src, index) => (
    <div key={index} className="w-full h-full relative">
      <Image
        src={src}
        alt="Where Tradition Meets Modern Sparkle — TheJWEL Kolkata"
        fill={true}
        className="object-cover"
        priority={index === 0}
        fetchPriority={index === 0 ? "high" : "auto"}
        sizes="100vw"
      />
    </div>
  ));

  return (
    <div className="min-h-screen bg-theme-cream">
      <HomePageClientShell categoriesProps={categoriesProps} />
      <CartBootstrapper />
      <main className="w-full">
        <Suspense fallback={<CarouselSkeleton />}>
          <Carousel
            items={carouselItemsArray}
            autoSlideInterval={3000}
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
          />
        </Suspense>

        {categoriesProps && categoriesProps.length > 0 ? (
          <CategorySection categories={categoriesProps} />
        ) : (
          <CategorySectionSkeleton />
        )}

        <InViewSection fallback={<ProductCarouselSkeleton title="Best Sellers" />}>
          {bestSellers && bestSellers.length > 0 ? (
            <DynamicBestSellers products={bestSellers} />
          ) : (
            <ProductCarouselSkeleton title="Best Sellers" />
          )}
        </InViewSection>

        <InViewSection fallback={<ProductCarouselSkeleton title="Featured Products" />}>
          {featuredProducts && featuredProducts.length > 0 ? (
            <DynamicFeatured products={featuredProducts} />
          ) : (
            <ProductCarouselSkeleton title="Featured Products" />
          )}
        </InViewSection>

        <Collection />

        <InViewSection fallback={<ProductCarouselSkeleton title="New Arrivals" />}>
          {newArrivals && newArrivals.length > 0 ? (
            <DynamicNewArrivals products={newArrivals} />
          ) : (
            <ProductCarouselSkeleton title="New Arrivals" />
          )}
        </InViewSection>

        <OccasionSection />

        <InViewSection fallback={<ImageGalleryCarouselSkeleton />}>
          <DynamicImageGallery />
        </InViewSection>
      </main>
    </div>
  );
}
