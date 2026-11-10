"use client";

import { useRef, type TouchEvent } from "react";

const THRESHOLD_PX = 50;

/** Horizontal swipe handlers; ignores mostly-vertical gestures. */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd(e: TouchEvent) {
      const from = start.current;
      start.current = null;
      if (!from) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - from.x;
      const dy = t.clientY - from.y;
      if (Math.abs(dx) < THRESHOLD_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
  };
}
