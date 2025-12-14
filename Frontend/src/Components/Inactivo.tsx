// src/Components/InactivityProvider.tsx
import { useEffect, useRef, useState } from "react";
import Screensaver from "./Screen_Saver";

const INACTIVITY_TIME_MS = 30_000; // 30 segundos

export default function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      // limpiamos el timer anterior
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      // cuando el usuario hace algo, apagamos el salvapantallas
      setActive(false);

      // y agendamos que se prenda después de X ms sin actividad
      timerRef.current = window.setTimeout(() => {
        setActive(true);
      }, INACTIVITY_TIME_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    // arrancamos el primer contador al montar
    resetTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      {children}
      {active && <Screensaver cornerFlashSrc="/public/descargar.jepg" />}
    </>
  );
}
