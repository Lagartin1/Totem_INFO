import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  slides: string[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Imagen actual */}
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <img
          src={slides[current]}
          alt={`slide-${current}`}
          className="w-full h-[400px] object-cover transition-transform duration-500"
        />
      </div>

      {/* Botón Izquierda */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Botón Derecha */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
      >
        <ChevronRight size={28} />
      </button>

      {/* Indicadores */}
      <div className="flex justify-center mt-4 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
