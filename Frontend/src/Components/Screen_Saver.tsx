import React, { useEffect, useRef, useState } from "react";

type IconDef = {
  name: string;
  src: string;
};

type ScreensaverProps = {
  // imagen que quieres mostrar cuando golpea una esquina
  cornerFlashSrc?: string;
  flashDurationMs?: number;
};

const ICONS: IconDef[] = [
  {
    name: "TypeScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    name: "JavaScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    name: "Python",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "Java",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  },
  {
    name: "React",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
];

const Screensaver: React.FC<ScreensaverProps> = ({
  cornerFlashSrc,
  flashDurationMs = 300,
}) => {
  const iconRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);

  const pos = useRef({ x: 100, y: 100 });
  const vel = useRef({ vx: 3, vy: 2.5 });
  const indexRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);

  // función para manejar el flash de la imagen
  const triggerFlash = () => {
    if (!cornerFlashSrc) return;
    setIsFlashing(true);
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = window.setTimeout(() => {
      setIsFlashing(false);
    }, flashDurationMs);
  };

  useEffect(() => {
    const iconEl = iconRef.current;
    if (!iconEl) return;

    const ICON_SIZE = 96; // w-24 h-24 aprox

    const step = () => {
      const { innerWidth, innerHeight } = window;

      pos.current.x += vel.current.vx;
      pos.current.y += vel.current.vy;

      let collidedX = false;
      let collidedY = false;

      // bordes horizontales
      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.vx *= -1;
        collidedX = true;
      } else if (pos.current.x + ICON_SIZE >= innerWidth) {
        pos.current.x = innerWidth - ICON_SIZE;
        vel.current.vx *= -1;
        collidedX = true;
      }

      // bordes verticales
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.vy *= -1;
        collidedY = true;
      } else if (pos.current.y + ICON_SIZE >= innerHeight) {
        pos.current.y = innerHeight - ICON_SIZE;
        vel.current.vy *= -1;
        collidedY = true;
      }

      iconEl.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

      // si chocó en cualquier borde → cambia de icono como antes
      if (collidedX || collidedY) {
        indexRef.current = (indexRef.current + 1) % ICONS.length;
        setCurrentIndex(indexRef.current);
      }

      // si chocó en esquina (x e y en el mismo frame) → flash
      if (collidedX && collidedY) {
        triggerFlash();
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, [cornerFlashSrc, flashDurationMs]);

  const currentIcon = ICONS[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-50">
      {/* Icono que rebota */}
      <div
        ref={iconRef}
        className="absolute w-24 h-24 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm shadow-lg border border-white/10"
      >
        <img
          src={currentIcon.src}
          alt={currentIcon.name}
          className="w-16 h-16"
        />
      </div>

      {/* Flash de imagen cuando golpea una esquina */}
      {cornerFlashSrc && isFlashing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <img
            src={cornerFlashSrc}
            alt="Corner flash"
            className="max-w-xs md:max-w-md rounded-xl shadow-2xl animate-pulse"
          />
        </div>
      )}
    </div>
  );
};

export default Screensaver;
