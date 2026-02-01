"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product } from "@/utilityFunctions/TypeInterface";

interface ProductCarouselProps {
  sectionHeading: string;
  products: Product[];
  tagSlug?: string; // Optional tag slug to link heading to tags page
  onAddToCart?: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  className?: string;
  showNavigation?: boolean;
  cardsToShow?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export default function ProductCarousel({
  sectionHeading,
  products,
  tagSlug,
  onAddToCart,
  onWishlistToggle,
  className = "",
  showNavigation = true,
  cardsToShow = { mobile: 1.5, tablet: 2.5, desktop: 4 },
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollability);
      }
      window.removeEventListener("resize", checkScrollability);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current || isScrolling) return;

    setIsScrolling(true);
    const container = scrollContainerRef.current;
    const cardWidth =
      container.querySelector(".product-card")?.clientWidth || 350;
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth + gap;

    const targetScroll =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });

    setTimeout(() => {
      setIsScrolling(false);
      checkScrollability();
    }, 300);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className={`w-full bg-theme-cream py-6 md:py-10 lg:py-12 ${className}`}
    >
      {/* Section Heading */}
      <div className="flex items-center justify-center mb-5 md:mb-8 px-4 sm:px-6 lg:px-8">
        {tagSlug ? (
          <Link href={`/Tags/${tagSlug}`} className="group">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#360000] relative inline-block font-josefin-sans tracking-wider group-hover:text-[#360000]/80 transition-colors">
              {sectionHeading}
              {/* Static underline */}
              <span className="absolute -bottom-2 left-0 right-0 h-0.5"></span>
              {/* Animated underline - grows from left to right on hover */}
              <span className="absolute -bottom-2 left-0 h-0.5 bg-[#360000] w-0 group-hover:w-full transition-all duration-500 ease-out"></span>
            </h2>
            <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-[#360000]/60 mt-4 sm:mt-5 md:mt-6 group-hover:text-[#360000]/80 transition-colors">
              View All →
            </p>
          </Link>
        ) : (
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#360000] relative inline-block font-josefin-sans tracking-wider">
            {sectionHeading}
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#360000]"></span>
          </h2>
        )}
      </div>

      {/* Carousel Container - Full Width */}
      <div className="relative w-full">
        {/* Scrollable Product Grid */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth w-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex gap-6 pb-10 md:pb-12 pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
            {products.map((product, index) => (
              <div
                key={product.product_id}
                className="product-card flex-shrink-0 w-[calc((100vw/1.3-3rem)*0.95)] sm:w-[calc((100vw/2-4rem)*0.95)] md:w-[calc((100vw/2.5-5rem)*0.95)] lg:w-[calc(100vw/3-6rem)] xl:w-[380px]"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onWishlistToggle={onWishlistToggle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {showNavigation && products.length > (cardsToShow.desktop || 4) && (
          <>
            {/* Left Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-white border border-theme-sage/30 hover:border-theme-olive text-theme-olive rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 z-10 hidden md:flex items-center justify-center hover:bg-theme-cream"
                aria-label="Scroll left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}

            {/* Right Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-white border border-theme-sage/30 hover:border-theme-olive text-theme-olive rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 z-10 hidden md:flex items-center justify-center hover:bg-theme-cream"
                aria-label="Scroll right"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            )}
          </>
        )}
      </div>

      {/* Hide Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
