import React, { useState, useRef, useEffect } from "react";

type CarouselItem = {
  image: string;
  title?: string;
  subtitle?: string;
  category?: string;
  description?: string;
  link?: string;
};

type CarouselProps = {
  items: CarouselItem[];
  className?: string;
  initialIndex?: number;
  showArrows?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: number;
  gap?: string;
  // Mantener compatibilidad con la prop anterior
  images?: string[];
};

export default function Carousel({
  items,
  images,
  className = "",
  showArrows = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  itemsPerView = 3,
  gap = "1.5rem",
}: CarouselProps) {
  // Convertir images a items para compatibilidad
  const carouselItems: CarouselItem[] = items || images?.map(img => ({ image: img })) || [];
  
  // Para carrusel infinito tipo rueda, necesitamos 3 copias completas
  const extendedItems = [
    ...carouselItems, // Primera copia
    ...carouselItems, // Segunda copia (centro)
    ...carouselItems, // Tercera copia
  ];
  
  // Empezamos en la copia del centro
  const [currentIndex, setCurrentIndex] = useState(carouselItems.length);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragVelocity, setDragVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const next = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    // Navegar al índice en la copia del centro
    const targetIndex = carouselItems.length + index;
    setIsTransitioning(true);
    setCurrentIndex(targetIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Manejar el reposicionamiento instantáneo para loop infinito
  useEffect(() => {
    if (!isTransitioning && !isDragging) {
      // Si llegamos al final de la copia del centro, saltar a la primera copia
      if (currentIndex >= carouselItems.length * 2) {
        setCurrentIndex(carouselItems.length);
      }
      // Si llegamos antes de la copia del centro, saltar a la segunda copia
      else if (currentIndex < carouselItems.length) {
        setCurrentIndex(carouselItems.length * 2 - 1);
      }
    }
  }, [currentIndex, isTransitioning, isDragging, carouselItems.length]);

  // Auto play functionality mejorado
  useEffect(() => {
    if (autoPlay && !isDragging && !isTransitioning) {
      intervalRef.current = setInterval(next, autoPlayInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [autoPlay, autoPlayInterval, isDragging, isTransitioning]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // Mouse drag handlers con momentum
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
    setDragVelocity(0);
    setLastMoveTime(Date.now());
    
    // Detener autoplay
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    e.preventDefault();
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastMoveTime;
    const diff = e.clientX - dragStart;
    
    // Calcular velocidad para momentum
    if (timeDiff > 0) {
      const velocity = (diff - dragOffset) / timeDiff;
      setDragVelocity(velocity);
    }
    
    // Para carrusel infinito, no aplicamos resistencia en bordes
    setDragOffset(diff);
    setLastMoveTime(currentTime);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    const threshold = 80;
    const velocityThreshold = 0.3;
    const shouldSwipe = Math.abs(dragOffset) > threshold || Math.abs(dragVelocity) > velocityThreshold;
    
    if (shouldSwipe) {
      // Determinar dirección basada en offset y velocidad
      const direction = dragOffset > 0 || dragVelocity > 0 ? -1 : 1;
      
      if (direction < 0) {
        prev();
      } else {
        next();
      }
    }
    
    // Animar vuelta a posición original si no se cambió slide
    animateToPosition(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  // Función para animar vuelta a posición
  const animateToPosition = (targetOffset: number) => {
    const startOffset = dragOffset;
    const startTime = Date.now();
    const duration = 300;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentOffset = startOffset + (targetOffset - startOffset) * easedProgress;
      
      setDragOffset(currentOffset);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsDragging(false);
        setDragOffset(0);
        setDragVelocity(0);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStart;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        prev();
      } else {
        next();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      className={`relative overflow-hidden ${className} select-none`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'pan-y pinch-zoom',
      }}
    >
      {/* Contenedor del carrusel */}
      <div
        className={`flex ${
          isDragging ? '' : 'transition-transform duration-500 ease-out'
        }`}
        style={{
          transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${100 / itemsPerView}% + ${dragOffset}px))`,
          gap: gap,
          willChange: isDragging ? 'transform' : 'auto',
        }}
      >
        {extendedItems.map((item, i) => {
          // Calcular posiciones relativas para efectos visuales
          const relativePosition = i - currentIndex;
          const isCenter = Math.abs(relativePosition) < 0.5;
          const isPrev = relativePosition >= -1.5 && relativePosition < -0.5;
          const isNext = relativePosition > 0.5 && relativePosition <= 1.5;
          // Índice real en el array original
          const realIndex = i % carouselItems.length;
          
          return (
            <div
              key={`${realIndex}-${Math.floor(i / carouselItems.length)}`}
              className={`
                flex-shrink-0 transition-all duration-500 ease-out cursor-pointer
                ${isCenter ? 'transform-gpu' : ''}
              `}
              style={{ 
                width: `${100 / itemsPerView}%`,
                opacity: isCenter ? 1 : isPrev || isNext ? 0.85 : 0.6,
                transform: `scale(${isCenter ? 1.05 : isPrev || isNext ? 0.95 : 0.9})`,
                zIndex: isCenter ? 10 : isPrev || isNext ? 5 : 1,
              }}
              onClick={() => !isCenter && !isDragging && goToSlide(realIndex)}
            >
              {/* Tarjeta estilo Mastercard */}
              <div className={`
                relative overflow-hidden bg-white
                rounded-xl shadow-md hover:shadow-lg transition-all duration-300
                border border-gray-200/60
                group h-96 w-full
                ${isCenter ? 'shadow-lg' : 'shadow-sm'}
              `}>
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={item.image}
                    alt={item.title || `slide-${i}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    draggable={false}
                  />
                </div>

                {/* Contenido */}
                <div className="p-6 h-48 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Categoría */}
                    {item.category && (
                      <div className="flex items-center gap-2">
                        <span className="
                          px-2 py-1 text-xs font-medium text-gray-700 
                          bg-gray-100 rounded uppercase tracking-wide
                        ">
                          {item.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Título */}
                    {item.title && (
                      <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                    )}
                    
                    {/* Descripción */}
                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-4">
                    <button className="
                      inline-flex items-center text-sm font-semibold text-orange-600 
                      hover:text-orange-700 transition-colors duration-200
                      group-hover:translate-x-1 transition-transform
                    ">
                      Learn more
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación */}
      {showArrows && (
        <>
          <button
            onClick={prev}
            className="
              absolute left-4 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 flex items-center justify-center
              bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900
              rounded-full shadow-md hover:shadow-lg
              transition-all duration-200
              border border-gray-200/50
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={next}
            className="
              absolute right-4 top-1/2 -translate-y-1/2 z-20
              w-10 h-10 flex items-center justify-center
              bg-white/95 hover:bg-white text-gray-700 hover:text-gray-900
              rounded-full shadow-md hover:shadow-lg
              transition-all duration-200
              border border-gray-200/50
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicadores de navegación */}
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselItems.map((_, i) => {
            // Calcular el índice actual real (en la copia del centro)
            const currentRealIndex = (currentIndex - carouselItems.length + carouselItems.length) % carouselItems.length;
            return (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${i === currentRealIndex 
                    ? "bg-orange-500 scale-125" 
                    : "bg-gray-400 hover:bg-gray-500"
                  }
                `}
              />
            );
          })}
        </div>
      )}

      {/* Indicador de progreso */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ 
              width: `${(((currentIndex - carouselItems.length + carouselItems.length) % carouselItems.length + 1) / carouselItems.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}
