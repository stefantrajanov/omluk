"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Gauge, OctagonAlert, TriangleAlert } from "lucide-react";
import { HOURLY_CAPACITY } from "@/lib/menu";
import { hourWindowLabel } from "@/lib/dates";
import { getHourlyLoad } from "@/lib/orders/actions";
import { cn } from "@/lib/utils";

type LoadState = { date: string; load: Record<number, number> | null };

const NEAR_FULL = Math.ceil(HOURLY_CAPACITY * 0.8);

const LEVELS = {
  loading: { icon: Gauge, box: "bg-card shadow-card text-foreground", iconTone: "text-muted-foreground" },
  ok: { icon: CircleCheck, box: "bg-success-soft text-foreground", iconTone: "text-success" },
  near: { icon: TriangleAlert, box: "bg-warning-soft text-warning-foreground", iconTone: "" },
  over: { icon: OctagonAlert, box: "bg-destructive-soft text-destructive", iconTone: "" },
} as const;

export function CapacityLine({
  date,
  hour,
  pieces,
  excludeOrderId,
}: {
  date: string;
  hour: number;
  pieces: number;
  excludeOrderId?: string;
}) {
  const [state, setState] = useState<LoadState | null>(null);

  useEffect(() => {
    let stale = false;
    getHourlyLoad(date, excludeOrderId)
      .then((load) => !stale && setState({ date, load }))
      .catch(() => !stale && setState({ date, load: null }));
    return () => {
      stale = true;
    };
  }, [date, excludeOrderId]);

  const ready = state?.date === date;
  if (ready && state.load === null) return null;

  const booked = ready ? (state.load?.[hour] ?? 0) : null;
  const after = booked === null ? null : booked + pieces;
  const level =
    after === null ? "loading" : after > HOURLY_CAPACITY ? "over" : after >= NEAR_FULL ? "near" : "ok";
  const { icon: Icon, box, iconTone } = LEVELS[level];

  return (
    <div aria-live="polite" className={cn("flex items-start gap-3 rounded-2xl px-4 py-3", box)}>
      <Icon className={cn("mt-px size-5 shrink-0", iconTone)} aria-hidden />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="type-subhead tabular-nums">
          Зафатено <span className="font-semibold">{booked ?? "…"}</span> / {HOURLY_CAPACITY} во{" "}
          {hourWindowLabel(hour)}
        </p>
        {after !== null && pieces > 0 && (
          <p className="type-footnote tabular-nums">
            Со оваа нарачка: <span className="font-semibold">{after}</span> / {HOURLY_CAPACITY}
          </p>
        )}
        {level === "near" && <p className="type-footnote font-semibold">Речиси полн час</p>}
        {level === "over" && (
          <p className="type-subhead font-semibold">Над капацитет за овој час</p>
        )}
      </div>
    </div>
  );
}
