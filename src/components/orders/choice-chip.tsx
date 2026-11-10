"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Pill toggle; selected matches the segmented control (white + ember ring), not the filled action style. */
export function ChoiceChip({
  selected,
  className,
  ...props
}: ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 type-callout font-medium transition-[background-color,box-shadow,color,transform] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] disabled:opacity-40",
        selected
          ? "bg-card font-semibold text-accent-foreground shadow-[0_0_0_1.5px_var(--primary),0_1px_3px_rgb(0_0_0/0.12)]"
          : "bg-background text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}
