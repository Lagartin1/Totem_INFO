import { useState, useEffect, useRef } from "react";
import { useTouchGestures } from "../hooks/useTouchGestures";

interface CarouselProps {
  slides?: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
}

function Carousel({
  slides = [],
  autoPlay = false,
  autoPlayInterval = 5000,
  showThumbnails = false,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const length = slides.length;
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  if (length === 0) return null;

  // Navigation with transition
  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    pauseAutoPlay();
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    goToSlide(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    goToSlide(current === 0 ? length - 1 : current - 1);
  };

  // Touch gestures usando el hook personalizado
  const touchHandlers = useTouchGestures({
    onSwipeLeft: nextSlide,
    onSwipeRight: prevSlide,
    swipeThreshold: 75,
  });

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
      }, autoPlayInterval);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, length, autoPlayInterval]);

  // Pause auto-play on user interaction
  const pauseAutoPlay = () => {
    if (autoPlay && isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 8000); // Resume after 8 seconds
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    } else if (e.key === " ") {
      e.preventDefault();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col bg-white rounded-lg overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}>
      {/* Main slide container */}
      <div
        className={`flex-1 overflow-hidden select-none relative ${
          touchHandlers.isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${isTransitioning ? "transition-all duration-300 ease-in-out" : ""}`}
        {...touchHandlers}>

        {/* Slide content */}
        <div className="w-full h-full relative">{slides[current]}</div>

        {/* Swipe indicator */}
        {touchHandlers.isDragging && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
              <span className="text-lg font-medium">
                {touchHandlers.dragOffset.x < 0 ? "← Deslizar" : "Deslizar →"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      {length > 1 && (
        <>
          {/* Main navigation bar */}
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
            {/* Previous button */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 
                        disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg 
                        transition-all duration-200 touch-manipulation active:scale-95 group"
              aria-label="Anterior">
              <svg
                className="w-6 h-6 text-white group-active:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Center controls */}
            <div className="flex flex-col items-center gap-3">
              {/* Enhanced dot indicators */}
              <div className="flex gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 touch-manipulation active:scale-110 ${
                      index === current
                        ? "w-8 h-4 bg-blue-600 rounded-full"
                        : "w-4 h-4 bg-gray-400 hover:bg-gray-500 rounded-full"
                    }`}
                    aria-label={`Ir al slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${((current + 1) / length) * 100}%` }}
                />
              </div>

              {/* Counter and auto-play control */}
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-700 min-w-[4rem] text-center">
                  {current + 1} / {length}
                </span>

                {autoPlay && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center 
                              justify-center transition-all duration-200 touch-manipulation active:scale-95"
                    aria-label={
                      isPlaying
                        ? "Pausar auto-reproducción"
                        : "Reanudar auto-reproducción"
                    }>
                    {isPlaying ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 
                        disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-lg 
                        transition-all duration-200 touch-manipulation active:scale-95 group"
              aria-label="Siguiente">
              <svg
                className="w-6 h-6 text-white group-active:scale-110 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carousel;
