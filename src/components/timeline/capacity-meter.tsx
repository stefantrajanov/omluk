import { AlertTriangleIcon, OctagonAlertIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { HOURLY_CAPACITY } from "@/lib/menu";
import { cn } from "@/lib/utils";
import { pluralize } from "./format";

export type CapacityLevel = "free" | "ok" | "warn" | "over";

/** Warn from 13 of 16 (80%); over when above capacity. */
export function capacityLevel(pieces: number): CapacityLevel {
  if (pieces === 0) return "free";
  if (pieces > HOURLY_CAPACITY) return "over";
  if (pieces >= Math.ceil(HOURLY_CAPACITY * 0.8)) return "warn";
  return "ok";
}

const BAR: Record<CapacityLevel, string> = {
  free: "bg-transparent",
  ok: "bg-success",
  warn: "bg-warning",
  over: "bg-destructive",
};

const PILL: Record<CapacityLevel, string> = {
  free: "bg-secondary text-muted-foreground",
  ok: "bg-secondary text-secondary-foreground",
  warn: "bg-warning-soft text-warning-foreground",
  over: "bg-destructive-soft text-destructive",
};

/** "9 / 16" pill; over capacity it also says by how much. */
export function CapacityPill({ pieces, className }: { pieces: number; className?: string }) {
  const level = capacityLevel(pieces);
  const over = pieces - HOURLY_CAPACITY;
  const Icon = level === "over" ? OctagonAlertIcon : level === "warn" ? AlertTriangleIcon : null;

  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 type-footnote font-semibold whitespace-nowrap tabular-nums",
        PILL[level],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      <span>
        {pieces} / {HOURLY_CAPACITY}
      </span>
      {level === "over" && <span>· +{over} повеќе</span>}
      <span className="sr-only">
        {pluralize(pieces, "парче", "парчиња")}
        {level === "warn" && ", речиси полно"}
        {level === "over" && `, ${over} ${pluralize(over, "парче", "парчиња")} над капацитетот`}
      </span>
    </span>
  );
}

/** Slim capacity bar. */
export function CapacityBar({ pieces, className }: { pieces: number; className?: string }) {
  const level = capacityLevel(pieces);

  return (
    <Progress
      value={Math.min(100, (pieces / HOURLY_CAPACITY) * 100)}
      aria-label="Зафатеност на часот"
      aria-valuetext={`${pieces} од ${HOURLY_CAPACITY} парчиња`}
      className={cn("h-1 bg-muted", className)}
      indicatorClassName={cn("rounded-full", BAR[level])}
    />
  );
}

export function CapacityMeter({ pieces, className }: { pieces: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CapacityPill pieces={pieces} />
      <CapacityBar pieces={pieces} className="w-16" />
    </div>
  );
}
