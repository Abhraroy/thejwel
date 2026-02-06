"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
];

export default function ImageGalleryCarousel({
  images = defaultImages,
  autoPlay = true,
  autoPlayInterval = 4000,
  className = "",
}: ImageGalleryCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);
  const slideCount = safeImages.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const goToNext = useCallback(() => {
    if (slideCount <= 1) return;
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const goToPrev = useCallback(() => {
    if (slideCount <= 1) return;
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToSlide = useCallback((index: number) => {
    if (slideCount === 0) return;
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(((index % slideCount) + slideCount) % slideCount);
  }, [currentIndex, slideCount]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isHovered || slideCount <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, goToNext, slideCount]);

  // Get visible slides (prev, current, next)
  const getSlideIndex = useCallback((offset: number) => {
    if (slideCount === 0) return 0;
    return (currentIndex + offset + slideCount) % slideCount;
  }, [currentIndex, slideCount]);

  // Keep index in range if images prop changes
  useEffect(() => {
    if (slideCount === 0) return;
    setCurrentIndex((prev) => prev % slideCount);
  }, [slideCount]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToNext, goToPrev]);

  if (slideCount === 0) return null;

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
          role="region"
          aria-roledescription="carousel"
          aria-label="Image gallery"
        >
          {/* Background glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-130 w-130 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#360000]/10 blur-3xl" />
            <div className="absolute left-1/3 top-1/3 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/10 blur-3xl" />
          </div>

          {/* Main Carousel */}
          <div className="relative overflow-visible">
            <div className="relative mx-auto h-85 sm:h-110 md:h-135 lg:h-150 max-w-6xl">
              {/* Slides Container */}
              <div className="absolute inset-0 flex items-center justify-center">
              {[-1, 0, 1].map((offset) => {
                const slideIndex = getSlideIndex(offset);
                const image = safeImages[slideIndex];
                const isActive = offset === 0;
                const position: "left" | "active" | "right" =
                  offset === 0 ? "active" : offset === -1 ? "left" : "right";

                const baseCard =
                  "absolute select-none will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#360000]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
                const sizeClass = isActive
                  ? "w-[270px] h-[360px] sm:w-[340px] sm:h-[450px] md:w-[420px] md:h-[540px] lg:w-[470px] lg:h-[610px]"
                  : "w-[220px] h-[290px] sm:w-[270px] sm:h-[355px] md:w-[330px] md:h-[430px] lg:w-[370px] lg:h-[485px]";

                const variants = {
                  active: {
                    x: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    zIndex: 30,
                  },
                  left: {
                    x: "-58%",
                    scale: 0.88,
                    opacity: 0.55,
                    filter: "blur(1.5px)",
                    zIndex: 20,
                  },
                  right: {
                    x: "58%",
                    scale: 0.88,
                    opacity: 0.55,
                    filter: "blur(1.5px)",
                    zIndex: 20,
                  },
                } as const;

                return (
                  <motion.button
                    key={`${slideIndex}-${offset}`}
                    type="button"
                    className={`${baseCard} ${sizeClass} cursor-pointer`}
                    onClick={() => (!isActive ? goToSlide(slideIndex) : undefined)}
                    animate={position}
                    initial={false}
                    variants={variants}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 260, damping: 28, mass: 0.9 }
                    }
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : isActive
                          ? { scale: 1.01 }
                          : { scale: 0.92, opacity: 0.7, filter: "blur(1px)" }
                    }
                    drag={isActive && !shouldReduceMotion ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.22}
                    onDragEnd={(_, info) => {
                      if (!isActive) return;
                      const threshold = 70;
                      if (info.offset.x > threshold) goToPrev();
                      if (info.offset.x < -threshold) goToNext();
                    }}
                    aria-label={
                      isActive ? `Current slide: ${image.title ?? image.alt}` : `Go to slide: ${image.title ?? image.alt}`
                    }
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                      {/* subtle border/glass */}
                      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/15" />

                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 270px, (max-width: 768px) 340px, (max-width: 1024px) 420px, 470px"
                        priority={isActive}
                      />

                      {/* Overlay */}
                      <div
                        className={`absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent ${
                          isActive ? "opacity-100" : "opacity-70"
                        } transition-opacity duration-500`}
                      />

                      {/* Active title + hint */}
                      <AnimatePresence mode="wait">
                        {isActive && (image.title || image.alt) && (
                          <motion.div
                            key={slideIndex}
                            initial={
                              shouldReduceMotion
                                ? { opacity: 1 }
                                : { opacity: 0, y: 14, x: direction === "right" ? 10 : -10 }
                            }
                            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
                            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.28, ease: "easeOut" }}
                            className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6"
                          >
                            <div className="flex items-end justify-between gap-3">
                              <div>
                                <h3 className="text-white text-lg sm:text-xl md:text-2xl font-semibold font-josefin-sans tracking-wider">
                                  {image.title ?? image.alt}
                                </h3>
                                <p className="mt-1 text-white/80 text-xs sm:text-sm font-open-sans tracking-wide">
                                  Drag to swipe or use arrow keys
                                </p>
                              </div>
                              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
                                <span className="text-white/90 text-xs font-open-sans tracking-wide">
                                  {currentIndex + 1}/{slideCount}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
              </div>

              {/* Navigation Arrows */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-4">
                <motion.button
                  type="button"
                  onClick={goToPrev}
                  disabled={slideCount <= 1}
                  className="pointer-events-auto group relative grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-full
                    bg-black/35 hover:bg-black/55 backdrop-blur-md ring-1 ring-white/20 shadow-lg
                    transition disabled:opacity-40 disabled:hover:bg-black/35"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white transition-transform group-hover:-translate-x-0.5" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={goToNext}
                  disabled={slideCount <= 1}
                  className="pointer-events-auto group relative grid h-11 w-11 md:h-12 md:w-12 place-items-center rounded-full
                    bg-black/35 hover:bg-black/55 backdrop-blur-md ring-1 ring-white/20 shadow-lg
                    transition disabled:opacity-40 disabled:hover:bg-black/35"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white transition-transform group-hover:translate-x-0.5" />
                </motion.button>
              </div>

              {/* Autoplay progress */}
              {autoPlay && slideCount > 1 && (
                <div className="absolute left-1/2 top-4 w-[min(520px,90%)] -translate-x-1/2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15 ring-1 ring-white/15 backdrop-blur-md">
                    <motion.div
                      key={`${currentIndex}-${isHovered}`}
                      className="h-full rounded-full bg-white/70"
                      initial={{ width: "0%" }}
                      animate={{ width: isHovered ? "0%" : "100%" }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: isHovered ? 0 : autoPlayInterval / 1000, ease: "linear" }
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 md:mt-8 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 ring-1 ring-black/10 backdrop-blur-sm">
              {safeImages.map((img, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={`${img.src}-${index}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className="relative h-2.5 w-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#360000]/40"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? "true" : "false"}
                  >
                    <span
                      className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                        isActive ? "bg-[#360000]" : "bg-[#360000]/35 hover:bg-[#360000]/55"
                      }`}
                    />
                    {isActive && !shouldReduceMotion && (
                      <motion.span
                        className="absolute -inset-1 rounded-full ring-2 ring-[#360000]/25"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

