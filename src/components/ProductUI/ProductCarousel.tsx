"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product } from "@/types/TypeInterface";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";

interface ProductCarouselProps {
  sectionHeading: string;
  products: Product[];
  tagSlug?: string;
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
}: ProductCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);

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
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#360000] relative inline-block font-josefin-sans tracking-wider group-hover:text-[#360000]/80 transition-colors">
              {sectionHeading}
              <span className="absolute -bottom-2 left-0 right-0 h-0.5"></span>
              <span className="absolute -bottom-2 left-0 h-0.5 bg-[#360000] w-0 group-hover:w-full transition-all duration-500 ease-out"></span>
            </h2>
            <p className="text-center text-sm sm:text-base md:text-lg font-semibold text-[#360000]/60 mt-4 sm:mt-5 md:mt-6 group-hover:text-[#360000]/80 transition-colors">
              View All →
            </p>
          </Link>
        ) : (
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#360000] relative inline-block font-josefin-sans tracking-wider">
            {sectionHeading}
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#360000]"></span>
          </h2>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Navigation, FreeMode]}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          slidesPerView={1.3}
          spaceBetween={24}
          freeMode={{ enabled: true, sticky: false, momentumBounce: true }}
          breakpoints={{
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-10 md:pb-12"
        >
          {products.map((product) => (
            <SwiperSlide key={product.product_id}>
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        {showNavigation && products.length > 4 && (
          <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-white border border-theme-sage/30 hover:border-theme-olive text-[#360000] rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 z-10 hidden md:flex items-center justify-center hover:bg-theme-cream"
              aria-label="Scroll left"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-white border border-theme-sage/30 hover:border-theme-olive text-[#360000] rounded-full p-2 md:p-3 shadow-lg transition-all duration-200 z-10 hidden md:flex items-center justify-center hover:bg-theme-cream"
              aria-label="Scroll right"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
