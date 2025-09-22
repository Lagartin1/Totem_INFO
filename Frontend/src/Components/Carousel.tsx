import { useState } from "react";

function Carousel({ slides = [] }: { slides?: React.ReactNode[] }) {
  const [current, setCurrent] = useState(0);
  const length = slides.length;

  // Touch
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Mouse
  const [mouseDown, setMouseDown] = useState<number | null>(null);
  const [mouseUp, setMouseUp] = useState<number | null>(null);

  const minSwipeDistance = 50;

  if (length === 0) return null;

  // --- Touch handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      setCurrent(current === length - 1 ? 0 : current + 1);
    } else if (distance < -minSwipeDistance) {
      setCurrent(current === 0 ? length - 1 : current - 1);
    }
  };

  // --- Mouse handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseUp(null);
    setMouseDown(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDown !== null) {
      setMouseUp(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (mouseDown === null || mouseUp === null) return;
    const distance = mouseDown - mouseUp;

    if (distance > minSwipeDistance) {
      setCurrent(current === length - 1 ? 0 : current + 1);
    } else if (distance < -minSwipeDistance) {
      setCurrent(current === 0 ? length - 1 : current - 1);
    }

    setMouseDown(null);
    setMouseUp(null);
  };

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="flex transition-transform duration-300 gap-4"
        style={{
          transform: `translateX(-${current * 260}px)`, // ancho de la tarjeta + gap
        }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="flex-shrink-0 w-[250px]">
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Carousel;
