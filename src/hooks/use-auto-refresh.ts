"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { REFRESH_INTERVAL_MS } from "@/lib/config";

const MIN_GAP_MS = 5_000;

/** Keeps server data fresh across phones: on focus, on tab return, and on an interval. */
export function useAutoRefresh(): void {
  const router = useRouter();

  useEffect(() => {
    let last = Date.now();
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last < MIN_GAP_MS) return;
      last = Date.now();
      router.refresh();
    };

    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
}
