"use client";

import { useEffect, useMemo, useRef } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { CLOSE_HOUR, OPEN_HOUR, SLOT_MINUTES, formatHM } from "@/lib/dates";
import { ChoiceChip } from "./choice-chip";

const pad = (n: number) => String(n).padStart(2, "0");

export function TimePicker({
  hour,
  minute,
  extraHour,
  onChange,
}: {
  hour: number;
  minute: number;
  extraHour?: number; // order's own hour when outside opening hours
  onChange: (hour: number, minute: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const hours = useMemo(() => {
    const list = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
    if (extraHour !== undefined && !list.includes(extraHour)) list.push(extraHour);
    return list.sort((a, b) => a - b);
  }, [extraHour]);

  // Center the selected hour once on mount.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = selectedRef.current;
    if (!scroller || !chip) return;
    scroller.scrollLeft = chip.offsetLeft - scroller.clientWidth / 2 + chip.offsetWidth / 2;
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-subhead font-semibold text-foreground">Време</span>
        <span className="type-title2 tabular-nums text-foreground" aria-live="polite">
          {formatHM(hour, minute)}
        </span>
      </div>
      <div
        ref={scrollerRef}
        role="group"
        aria-label="Час"
        className="scrollbar-none relative -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5"
      >
        {hours.map((h) => (
          <ChoiceChip
            key={h}
            ref={h === hour ? selectedRef : undefined}
            selected={h === hour}
            onClick={() => onChange(h, minute)}
            className="min-w-14 tabular-nums"
          >
            {pad(h)}
          </ChoiceChip>
        ))}
      </div>
      <SegmentedControl
        aria-label="Минути"
        size="lg"
        value={String(minute)}
        onValueChange={(m) => onChange(hour, Number(m))}
        options={SLOT_MINUTES.map((m) => ({
          value: String(m),
          label: (
            <>
              <span aria-hidden>:{pad(m)}</span>
              <span className="sr-only">{formatHM(hour, m)}</span>
            </>
          ),
        }))}
      />
    </div>
  );
}
