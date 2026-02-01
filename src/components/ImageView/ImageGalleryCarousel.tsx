"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
}

interface ImageGalleryCarouselProps {
  images?: GalleryImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const defaultImages: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    alt: "Gold necklace with gemstones",
    title: "Elegant Necklaces",
  },
  {
    src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    alt: "Diamond earrings",
    title: "Stunning Earrings",
  },
  {
    src: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
    alt: "Gold bangles",
    title: "Traditional Bangles",
  },
  {
    src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    alt: "Diamond ring",
    title: "Precious Rings",
  },
  {
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    alt: "Pearl jewelry set",
    title: "Pearl Collection",
  },
  {
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    alt: "Pearl jewelry set",
    title: "Pearl Collection",
  },
  {
    src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    alt: "Pearl jewelry set",
    title: "Pearl Collection",
  },
];

export default function ImageGalleryCarousel({
  images = defaultImages,
  autoPlay = true,
  autoPlayInterval = 4000,
  className = "",
}: ImageGalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goToNext = useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, goToNext]);

  // Get visible slides (prev, current, next)
  const getSlideIndex = (offset: number) => {
    return (currentIndex + offset + images.length) % images.length;
  };

  return (
    <section className={`w-full bg-transparent py-12 md:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#360000] mb-3 font-josefin-sans tracking-wider
          ">
            Our Gallery
          </h2>
          <p className="text-[#360000] text-sm md:text-base max-w-2xl mx-auto font-open-sans tracking-wider">
            Explore our exquisite collection of handcrafted jewelry pieces
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Carousel */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden">
            {/* Slides Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[-1, 0, 1].map((offset) => {
                const slideIndex = getSlideIndex(offset);
                const image = images[slideIndex];
                const isActive = offset === 0;

                return (
                  <div
                    key={`${slideIndex}-${offset}`}
                    className={`absolute transition-all duration-500 ease-out cursor-pointer
                      ${isActive 
                        ? "z-20 scale-100 opacity-100" 
                        : "z-10 scale-[0.75] opacity-80 blur-[1px]"
                      }
                      ${offset === -1 ? "-translate-x-[55%] md:-translate-x-[60%]" : ""}
                      ${offset === 1 ? "translate-x-[55%] md:translate-x-[60%]" : ""}
                    `}
                    onClick={() => !isActive && goToSlide(slideIndex)}
                  >
                    <div
                      className={`relative overflow-hidden rounded-2xl shadow-2xl
                        ${isActive 
                          ? "w-[260px] h-[340px] sm:w-[320px] sm:h-[420px] md:w-[400px] md:h-[500px] lg:w-[450px] lg:h-[560px]" 
                          : "w-[200px] h-[260px] sm:w-[240px] sm:h-[320px] md:w-[300px] md:h-[380px] lg:w-[340px] lg:h-[420px]"
                        }
                        transition-all duration-500
                      `}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, (max-width: 1024px) 400px, 450px"
                        priority={isActive}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                        transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} 
                      />
                      
                      {/* Title */}
                      {image.title && isActive && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform transition-all duration-500">
                          <h3 className="text-white text-lg md:text-2xl font-semibold font-josefin-sans tracking-wider">
                            {image.title}
                          </h3>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30
              w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
              bg-[#000000] hover:bg-[#000000]/50 backdrop-blur-md rounded-full
              border border-white/20 transition-all duration-300
              hover:scale-110 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30
              w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
              bg-[#000000] hover:bg-[#000000]/50 backdrop-blur-md rounded-full
              border border-white/20 transition-all duration-300
              hover:scale-110 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full
                  ${currentIndex === index 
                    ? "w-8 h-2 bg-white" 
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

