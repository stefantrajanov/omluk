"use client";

import { useEffect, useState } from "react";

/** Visible area above the on-screen keyboard, in layout-viewport px. */
export type KeyboardViewport = { top: number; height: number };

// Smaller shrinks are browser toolbars, not a keyboard.
const MIN_KEYBOARD_PX = 120;

function readKeyboard(): KeyboardViewport | null {
  const vv = window.visualViewport;
  if (!vv || vv.scale > 1.05) return null;
  const full = Math.max(window.innerHeight, document.documentElement.clientHeight);
  if (full - vv.height < MIN_KEYBOARD_PX) return null;
  return { top: Math.round(vv.offsetTop), height: Math.round(vv.height) };
}

/** On-screen keyboard state from `visualViewport`; null when closed or disabled. */
export function useKeyboardViewport(enabled: boolean): KeyboardViewport | null {
  const [keyboard, setKeyboard] = useState<KeyboardViewport | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readKeyboard();
        setKeyboard((prev) =>
          prev?.top === next?.top && prev?.height === next?.height ? prev : next,
        );
      });
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setKeyboard(null);
    };
  }, [enabled]);

  return enabled ? keyboard : null;
}
