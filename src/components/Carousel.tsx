'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CarouselProps {
  items?: React.ReactNode[];
  autoSlideInterval?: number; // in milliseconds
  className?: string;
  /**
   * Controls the slide/image height across breakpoints.
   * Defaults to a responsive height that works well for hero/banner images.
   */
  heightClassName?: string;
  /**
   * Applied to each slide wrapper. Useful when you want extra padding/overlays.
   */
  slideClassName?: string;
}

export default function Carousel({ 
  items,
  autoSlideInterval = 6000,
  className = '',
  heightClassName = 'h-[200px] sm:h-[320px] md:h-[420px] lg:h-[520px]',
  slideClassName = '',
}: CarouselProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs for touch tracking to avoid state timing issues
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      safeItems.length ? (prevIndex + 1) % safeItems.length : 0
    );
  }, [safeItems.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      safeItems.length ? (prevIndex - 1 + safeItems.length) % safeItems.length : 0
    );
  }, [safeItems.length]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    isSwiping.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isSwiping.current) {
      touchEndX.current = e.targetTouches[0].clientX;
    }
  };

  const onTouchEnd = () => {
    if (!isSwiping.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    
    if (distance > minSwipeDistance) {
      // Swiped left - go to next
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right - go to previous
      goToPrevious();
    }
    
    // Reset swipe state
    isSwiping.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    if (safeItems.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [goToNext, autoSlideInterval, safeItems.length, isPaused]);

  // Empty state when items prop is missing / empty
  if (safeItems.length === 0) {
    return (
      <div
        className={[
          'relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50',
          heightClassName,
          className,
        ].join(' ')}
      >
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
          No carousel items to display
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={[
        'relative w-full overflow-hidden',
        heightClassName,
        // Ensure images inside slides have a consistent size on all screens
        '[&_img]:w-full [&_img]:h-full [&_img]:object-cover',
        className,
      ].join(' ')}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {safeItems.map((item, index) => (
            <div
              key={index}
              className={[
                'min-w-full w-full shrink-0 h-full',
                // In case a slide uses Next/Image "fill", this keeps layout stable.
                'relative',
                slideClassName,
              ].join(' ')}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#360000] rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#360000] rounded-full p-2 shadow-lg transition-all duration-200 z-10"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* Indicator Dots */}
      {safeItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {safeItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-200  ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

