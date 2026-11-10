"use client";

import { useSyncExternalStore } from "react";
import { nowHM, todayISO } from "@/lib/dates";

type ShopNow = { date: string; minutes: number };

function subscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 20_000);
  return () => window.clearInterval(id);
}

function getSnapshot(): string {
  const { hour, minute } = nowHM();
  return `${todayISO()}|${hour * 60 + minute}`;
}

function getServerSnapshot(): string | null {
  return null;
}

/** Shop-local "now" (Europe/Skopje), or null during SSR/hydration. */
export function useShopNow(): ShopNow | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!snapshot) return null;
  const [date, minutes] = snapshot.split("|");
  return { date, minutes: Number(minutes) };
}
