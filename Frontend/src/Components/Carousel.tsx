import { useState } from "react";

function Carousel({ images } : { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const length = images.length;
  const minSwipeDistance = 50; 

  const handleTouchStart = (e: any) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) {
      // swipe izquierda → siguiente imagen
      setCurrent(current === length - 1 ? 0 : current + 1);
    } else if (distance < -minSwipeDistance) {
      // swipe derecha → imagen anterior
      setCurrent(current === 0 ? length - 1 : current - 1);
    }
  };

  return (
    <div
      className="relative w-full max-w-xl mx-auto overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index}`}
            className="w-full flex-shrink-0 "
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
