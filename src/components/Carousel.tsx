'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CarouselProps {
  items: React.ReactNode[];
  autoSlideInterval?: number; // in milliseconds
  className?: string;
}

export default function Carousel({ 
  items, 
  autoSlideInterval = 6000,
  className = '' 
}: CarouselProps) {
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
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

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
    if (items.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [goToNext, autoSlideInterval, items.length, isPaused]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
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
          {items.map((item, index) => (
            <div
              key={index}
              className="min-w-full w-full flex-shrink-0 h-full"
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
      {items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
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

