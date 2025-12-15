import { useState, useEffect, useCallback } from 'react';

interface UseTouchGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  interactiveSelector?: string;
}

interface TouchGestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  interactiveSelector = 'video, iframe, audio, button, input, textarea, [contenteditable], [data-interactive="true"]'
}: UseTouchGesturesOptions): TouchGestureHandlers => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Calcular offset de arrastre
  const dragOffset = {
    x: isDragging ? currentPos.x - startPos.x : 0,
    y: isDragging ? currentPos.y - startPos.y : 0
  };

  // Limpiar timer de long press
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Iniciar gesture
  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
    setStartTime(Date.now());

    // Iniciar timer para long press
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsDragging(false);
      }, longPressDelay);
      setLongPressTimer(timer);
    }
  }, [onLongPress, longPressDelay]);

  // Mover durante gesture
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    setCurrentPos({ x: clientX, y: clientY });
    
    // Si se mueve mucho, cancelar long press
    const distanceMoved = Math.sqrt(
      Math.pow(clientX - startPos.x, 2) + Math.pow(clientY - startPos.y, 2)
    );
    
    if (distanceMoved > 10) {
      clearLongPressTimer();
    }
  }, [isDragging, startPos, clearLongPressTimer]);

  // Finalizar gesture
  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    clearLongPressTimer();
    setIsDragging(false);

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const deltaTime = Date.now() - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Detectar tap (toque rápido sin movimiento)
    if (distance < 10 && deltaTime < 300 && onTap) {
      onTap();
      return;
    }

    // Detectar swipes
    if (distance >= swipeThreshold) {
      const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * 180 / Math.PI;
      
      // Swipe horizontal (ángulo < 45°)
      if (angle < 45) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
      // Swipe vertical (ángulo >= 45°)
      else {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  }, [isDragging, currentPos, startPos, startTime, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, clearLongPressTimer]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  // Handlers para eventos
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest(interactiveSelector)) {
      // No interceptar eventos sobre elementos interactivos
      return;
    }
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart, interactiveSelector]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove, isDragging]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
    handleEnd();
  }, [handleEnd, isDragging]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest(interactiveSelector)) {
      // No interceptar eventos sobre elementos interactivos
      return;
    }
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart, interactiveSelector]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const onMouseLeave = useCallback(() => {
    clearLongPressTimer();
    setIsDragging(false);
  }, [clearLongPressTimer]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    isDragging,
    dragOffset
  };
};

export default useTouchGestures;