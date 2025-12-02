// src/components/Screensaver.tsx
import React, { useEffect, useRef, useState } from "react";

type IconDef = {
  name: string;
  src: string;
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

export const Screensaver: React.FC = () => {
  const iconRef = useRef<HTMLDivElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // usamos refs para no triggerear renders en cada frame
  const pos = useRef({ x: 100, y: 100 });
  const vel = useRef({ vx: 3, vy: 2.5 });
  const indexRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const iconEl = iconRef.current;
    if (!iconEl) return;

    const ICON_SIZE = 96; // px aprox (tailwind w-24 h-24)

    const step = () => {
      const { innerWidth, innerHeight } = window;

      // actualizar posición
      pos.current.x += vel.current.vx;
      pos.current.y += vel.current.vy;

      let collided = false;

      // límites horizontales
      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.vx *= -1;
        collided = true;
      } else if (pos.current.x + ICON_SIZE >= innerWidth) {
        pos.current.x = innerWidth - ICON_SIZE;
        vel.current.vx *= -1;
        collided = true;
      }

      // límites verticales
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.vy *= -1;
        collided = true;
      } else if (pos.current.y + ICON_SIZE >= innerHeight) {
        pos.current.y = innerHeight - ICON_SIZE;
        vel.current.vy *= -1;
        collided = true;
      }

      // aplicar transform al elemento
      iconEl.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

      // si hubo choque, cambiar icono
      if (collided) {
        indexRef.current = (indexRef.current + 1) % ICONS.length;
        setCurrentIndex(indexRef.current);
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const currentIcon = ICONS[currentIndex];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
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
    </div>
  );
};
