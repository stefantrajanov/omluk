"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Pill toggle; sits on a white card, so the idle fill is the gray background. */
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
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 type-callout font-medium transition-[background-color,color,transform] duration-150 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] disabled:opacity-40",
        selected
          ? "bg-primary font-semibold text-primary-foreground"
          : "bg-background text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}
