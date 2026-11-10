"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Live `matchMedia` result; false during SSR and hydration (phone layout first). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getServerSnapshot(): boolean {
  return false;
}

export const MD_QUERY = "(min-width: 768px)";
export const LG_QUERY = "(min-width: 1024px)";
export const FINE_POINTER_QUERY = "(pointer: fine)";
