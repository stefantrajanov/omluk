"use client";

import { useRef, type KeyboardEvent } from "react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: React.ReactNode; disabled?: boolean };

type Props<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: Option<T>[];
  "aria-label": string;
  size?: "default" | "lg";
  className?: string;
};

/** iOS-style segmented control with radiogroup semantics. */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  "aria-label": ariaLabel,
  size = "default",
  className,
}: Props<T>): React.JSX.Element {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : options.findIndex((o) => !o.disabled);

  function move(from: number, step: number) {
    const n = options.length;
    for (let i = 1; i <= n; i++) {
      const next = (from + step * i + n) % n;
      if (!options[next].disabled) {
        onValueChange(options[next].value);
        refs.current[next]?.focus();
        return;
      }
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(index, -1);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex w-full rounded-xl bg-muted p-0.5", className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-[10px] px-3 text-center tabular-nums transition-[background-color,box-shadow,color] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40",
              size === "lg" ? "min-h-11 text-base" : "min-h-9 text-[15px]",
              selected
                ? "bg-card font-semibold text-accent-foreground shadow-[0_0_0_1.5px_var(--primary),0_1px_3px_rgb(0_0_0/0.12)]"
                : "font-medium text-foreground hover:bg-card/50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
