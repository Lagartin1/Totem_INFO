import { useState, useRef, useEffect } from "react";
import type { Noticia } from "../types/index.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BUILD_MODE = import.meta.env.VITE_BUILD_MODE;

interface CarouselMainProps {
  noticias: Noticia[];
}

export default function Carousel_Main({ noticias }: CarouselMainProps) {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [translateX, setTranslateX] = useState(-700);
  const slideDistance = 615; // Píxeles que se mueve cada slide

  // Estados para drag/swipe
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  const items =
    noticias.length > 0
      ? [
          noticias[noticias.length - 2],
          noticias[noticias.length - 1],
          ...noticias,
          noticias[0],
          noticias[1],
        ]
      : [];

  const baseUrl = BUILD_MODE ? API_BASE_URL : "http://localhost:3000";

  const trackRef = useRef<HTMLDivElement>(null);

  // Funciones para drag/swipe
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const diff = clientX - startX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Si el drag fue significativo (más de 100px), cambiar slide
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        // Drag hacia la derecha → slide anterior
        prev();
      } else {
        // Drag hacia la izquierda → slide siguiente
        next();
      }
    }

    setDragOffset(0);
  };

  // Eventos de mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    handleDragEnd();
  };

  // Eventos de touch
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Si estás en la última, vuelve al inicio.
  const next = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setTranslateX((prev) => prev - slideDistance); // Mueve hacia la izquierda
    handleTransitionEndRight();
    console.log("TranslateX:", translateX);
  };

  const handleTransitionEndRight = () => {
    console.log("Transition ended at index:", currentIndex);
    // Si estamos en el ultimo
    if (currentIndex === items.length - 3) {
      // En clon del primero → saltar al primero real SIN animación
      setEnableTransition(false);
      setCurrentIndex(2);
      // Calcular la posición correcta del primer elemento real
      const newPosition = -700; 
      setTranslateX(newPosition);

      // Reactivar transiciones después de un frame
      requestAnimationFrame(() => {
        setEnableTransition(true);
      });
    }
  };

  // Si estás en la primera, vuelve al final.
  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setTranslateX((prev) => prev + slideDistance); // Mueve hacia la derecha
    handleTransitionEndLeft();
    console.log("TranslateX:", translateX);
  };

  const handleTransitionEndLeft = () => {
    console.log("Transition ended at index:", currentIndex);
    // Si estamos en el primer
    if (currentIndex === 2) {
      setEnableTransition(false);
      // En clon del último → saltar al último real
      setCurrentIndex(items.length - 3);
      // Calcular la posición correcta del último elemento real
      const newPosition = - (700 + ((noticias.length - 1) * slideDistance));
      setTranslateX(newPosition);

      // Reactivar transiciones después de un frame
      requestAnimationFrame(() => {
        setEnableTransition(true);
      });
    }
  };

  // Función para obtener el índice real del slide (sin los clones)
  const getRealIndex = () => {
    if (currentIndex < 2) {
      // Estamos en los clones del final
      return noticias.length + (currentIndex - 2);
    } else if (currentIndex >= noticias.length + 2) {
      // Estamos en los clones del inicio
      return currentIndex - (noticias.length + 2);
    } else {
      // Estamos en los slides reales
      return currentIndex - 2;
    }
  };

  // Auto Slide
    useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="flex flex-col items-center gap-6">

      <div className="w-screen h-full overflow-hidden relative">
    
        {/* Gradientes en los bordes para indicar deslizamiento */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black/20 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black/20 to-transparent z-20 pointer-events-none" />
        
        <div className="relative w-full mx-auto">
          <div
            className="flex gap-4 select-none cursor-grab active:cursor-grabbing min-w-[615px] flex-shrink-0"
            style={{
              transform: `translateX(${translateX + dragOffset}px)`,
              transition:
                isDragging || !enableTransition
                  ? "none"
                  : "transform 0.5s ease-in-out",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {items.map((n, index) => {
              const isCenter = index === currentIndex;

              return (
                /* Slide Actual */
                <div
                  key={index}
                  className={`${
                    isCenter ? "w-[900px] h-[500px]" : "w-[600px] h-80"
                  } rounded-full relative overflow-hidden flex-shrink-0 transition-all duration-500`}
                  style={{
                    backgroundImage: n.imagen
                      ? `url(${baseUrl}${n.imagen})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#30e99cff",
                  }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h2
                      className={`${
                        isCenter ? "text-2xl" : "text-lg"
                      } font-bold text-center px-4 transition-all duration-500`}>
                      {n.titulo}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Indicadores de slide mejorados */}
      <div className="flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3">
        <div className="flex space-x-3">
          {noticias.map((_, index) => (
            <button
              key={index}
              className={`transition-all duration-300 touch-manipulation active:scale-110 ${
                getRealIndex() === index
                  ? "w-8 h-4 bg-white rounded-full shadow-lg" 
                  : "w-4 h-4 bg-white/50 hover:bg-white/70 rounded-full"
              }`}
              onClick={() => {
                // Calcular el índice real con offset para los clones
                const targetIndex = index + 2;
                setCurrentIndex(targetIndex);
                setTranslateX(-700 - index * slideDistance);
              }}
              aria-label={`Ir a la noticia ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Barra de progreso */}
        <div className="w-20 h-1 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500 rounded-full"
            style={{ width: `${((getRealIndex() + 1) / noticias.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
