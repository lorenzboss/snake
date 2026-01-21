import { useEffect, useRef } from "react";
import type { Position } from "../types/game";

interface SwipeControlsOptions {
  onSwipe: (direction: Position) => void;
  disabled?: boolean;
  minSwipeDistance?: number;
}

export const useSwipeControls = ({
  onSwipe,
  disabled = false,
  minSwipeDistance = 30,
}: SwipeControlsOptions) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while swiping
      if (touchStartRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Check if swipe distance is sufficient
      if (absDeltaX < minSwipeDistance && absDeltaY < minSwipeDistance) {
        touchStartRef.current = null;
        return;
      }

      // Determine swipe direction based on the larger delta
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        onSwipe({ x: deltaX > 0 ? 1 : -1, y: 0 });
      } else {
        // Vertical swipe
        onSwipe({ x: 0, y: deltaY > 0 ? 1 : -1 });
      }

      touchStartRef.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipe, disabled, minSwipeDistance]);
};
