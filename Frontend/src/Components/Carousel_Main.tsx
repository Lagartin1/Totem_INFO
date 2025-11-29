import { useState, useRef } from "react";
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
  };

  const handleTransitionEndRight = () => {
    console.log("Transition ended at index:", currentIndex);
    // Si estamos en el ultimo
    if (currentIndex === items.length - 3) {
      // En clon del primero → saltar al primero real SIN animación
      setEnableTransition(false);
      setCurrentIndex(2);
      // Calcular la posición correcta del primer elemento real
      const slideWidth = trackRef.current?.children[2]?.clientWidth ?? 600;
      const newPosition = -(2 * slideWidth); // index 2 = primer slide real
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
  };

  const handleTransitionEndLeft = () => {
    console.log("Transition ended at index:", currentIndex);
    // Si estamos en el primer
    if (currentIndex === 2) {
      setEnableTransition(false);
      // En clon del último → saltar al último real
      setCurrentIndex(items.length - 3);
      // Calcular la posición correcta del último elemento real
      const lastIndex = items.length - 3; // primer slide del final
      const slideWidth =
        trackRef.current?.children[lastIndex]?.clientWidth ?? 600;
      const newPosition = -(lastIndex * slideWidth);
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
  /*   useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]); */

  return (
    /* Botones */
    <div className="flex flex-col items-center gap-4">
      <div className="space-x-4">
        <button
          onClick={prev}
          className="w-12 h-12 py-2 bg-gray-300 rounded-full">
          ←
        </button>
        <button
          onClick={next}
          className="w-12 h-12 py-2 bg-gray-300 rounded-full">
          →
        </button>
      </div>

      <div className="w-screen h-full overflow-hidden">
        <div className="relative w-full mx-auto">
          <div
            ref={trackRef}
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

              // Determinar si es un clone que debe crecer
              let shouldBeCenter = false;

              // Lógica para clones existentes
              if (index === 0) {
                // Clone del penúltimo elemento - crece cuando su elemento real está centrado
                shouldBeCenter = currentIndex === items.length - 4;
              } else if (index === 1) {
                // Clone del último elemento - crece cuando su elemento real está centrado
                shouldBeCenter = currentIndex === items.length - 3;
              } else if (index === items.length - 2) {
                // Clone del primer elemento - crece cuando el primer elemento real está centrado
                shouldBeCenter = currentIndex === 2;
              } else if (index === items.length - 1) {
                // Clone del segundo elemento - crece cuando el segundo elemento real está centrado
                shouldBeCenter = currentIndex === 3;
              }

              const finalIsCenter = isCenter || shouldBeCenter;

              return (
                /* Slide Actual */
                <div
                  key={index}
                  className={`${
                    finalIsCenter ? "w-[900px] h-[500px]" : "w-[600px] h-80"
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
                        finalIsCenter ? "text-2xl" : "text-lg"
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

      {/* Indicadores de slide */}
      <div className="flex space-x-2 mt-4">
        {noticias.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              getRealIndex() === index
                ? "bg-white shadow-lg scale-110"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
            onClick={() => {
              // Calcular el índice real con offset para los clones
              const targetIndex = index + 2;
              setCurrentIndex(targetIndex);
              setTranslateX(-700 - index * slideDistance);
            }}
          />
        ))}
      </div>
    </div>
  );
}
